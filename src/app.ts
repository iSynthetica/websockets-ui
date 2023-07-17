import { WebSocket } from 'ws';
import WebSocketModel from './models/WebSocketModel.js';
import PlayersStorage from './models/PlayersStorage.js';
import WebSocketsStorage from './models/WebSocketsStorage.js';
import RoomsStorage from './models/RoomsStorage.js';
import EventsController from './controllers/eventsController.js';
import GameStorage from './models/GameStorage.js';
import RoomModel from './models/RoomModel.js';
import GameModel from './models/GameModel.js';
import { AttackStatusI } from './models/GameModel.js';
import PlayerModel from './models/PlayerModel.js';

class App {
    private webSocketsStorage: WebSocketsStorage;
    private playersStorage: PlayersStorage;
    private roomStorage: RoomsStorage;
    private gameStorage: GameStorage;
    private eventsController: EventsController;

    constructor() {
        this.webSocketsStorage = WebSocketsStorage.getInstance();
        this.playersStorage = PlayersStorage.getInstance();
        this.roomStorage = RoomsStorage.getInstance();
        this.gameStorage = GameStorage.getInstance();
        this.eventsController = new EventsController();

        this.setEventListeners();
    }

    addConnection(ws: WebSocket) {
        const connection: WebSocketModel = this.webSocketsStorage.create(ws, this.eventsController);
        return connection.id;
    }

    setEventListeners(): void {
        this.eventsController.on('create_room', this._updateRooms.bind(this));
        this.eventsController.on('add_user_to_room', this._createGame.bind(this));
        this.eventsController.on('ships_added', this._startGame.bind(this));
        this.eventsController.on('attack', this._attack.bind(this));
        this.eventsController.on('connection_closed', this._connectionClosed.bind(this));
    }

    private _connectionClosed(id: number) {
        const connection = this.webSocketsStorage.get(id);

        if (connection) {
            // Delete connection from storage
            this.webSocketsStorage.delete(id);
            const player = connection.player;

            if (player) {
                const rooms: RoomModel[] = this.roomStorage.getByPlayer(player.id);

                if (rooms) {
                    for (const room of rooms) {
                        this.roomStorage.delete(room.id);
                    }
                }
            }
            this._updateRooms.call(this);
        }
    }

    private _updateWinners() {
        const connections = this.webSocketsStorage.getAll();

        if (connections && connections.length) {
            const winners = this.playersStorage.winners;
            if (winners && winners.length) {
                const winnersData = winners.map(winner => ({ name: winner.name, wins: winner.wins }));
                for (const connection of connections) {
                    connection.send('update_winners', JSON.stringify(winnersData));
                }
            }
        }
    }

    private _attack(id: number, game: GameModel, isFinish: boolean, attackStatuses: AttackStatusI[]) {
        const players = game.players;

        for (const player of players) {
            const connection = this.webSocketsStorage.getByPlayer(player.id);
            for (const attackStatuse of attackStatuses) {
                connection?.send('attack', JSON.stringify(attackStatuse));
            }
        }

        let currentPlayer = id;

        if (attackStatuses[0].status === 'miss') {
            currentPlayer = players.find(p => p.id !== id)!.id;
        }

        game.currentPlayer = currentPlayer;

        for (const player of players) {
            const connection = this.webSocketsStorage.getByPlayer(player.id);

            if (!isFinish) {
                connection!.send('turn', JSON.stringify({ currentPlayer: currentPlayer }));
            } else {
                connection!.send('finish', JSON.stringify({ winPlayer: currentPlayer }));
                const playerRooms = this.roomStorage.getByPlayer(player.id);
                if (playerRooms) {
                    for (const playerRoom of playerRooms) {
                        this.roomStorage.delete(playerRoom.id);
                    }
                }
                this._updateWinners.call(this);
                this._updateRooms.call(this);
            }
        }
    }

    private _updateRooms() {
        const availableRooms = this.roomStorage.getAvailableRooms();
        let roomsData = [];

        if (availableRooms && availableRooms.length) {

            for (const room of availableRooms) {
                roomsData.push({
                    roomId: room.id,
                    roomUsers: room.players.map(player => {
                        return {
                            name: player.name,
                            index: player.id,
                        };
                    }),
                });
            }

            for (const connection of this.webSocketsStorage.connections) {
                connection.send('update_room', JSON.stringify(roomsData));
            }
        }

        for (const connection of this.webSocketsStorage.connections) {
            connection.send('update_room', JSON.stringify(roomsData));
        }

        this._updateWinners.call(this);
    }

    private _startGame(game: GameModel): void {
        const [p1, p2] = game.players;

        if (p1.ships.length && p2.ships.length) {
            for (const player of game.players) {
                const currentPlayerIndex = player.id;
                const ships = player.ships;
                const connection = this.webSocketsStorage.getByPlayer(currentPlayerIndex);
                connection?.send('start_game', JSON.stringify({ ships, currentPlayerIndex }));
                connection?.send('turn', JSON.stringify({ currentPlayer: p1.id }));
            }
        }
    }

    private _createGame(room: RoomModel): void {
        const players = room.players;

        if (players.length === 2) {
            const [p1, p2] = players;
            const game: GameModel = this.gameStorage.create(p1.id, p2.id, room.id);
            room.addGame(game);
            const idGame: number = game.id;

            for (const player of players) {
                const idPlayer = player.id;
                const connection = this.webSocketsStorage.getByPlayer(idPlayer);
                connection?.send('create_game', JSON.stringify({ idGame, idPlayer }));
            }

            this._updateRooms();
        }
    }
}

export default App;
