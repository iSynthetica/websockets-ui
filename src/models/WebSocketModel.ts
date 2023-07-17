import { RawData, WebSocket } from 'ws';
import BaseModel from './baseModel.js';
import { WSMessageTypes } from './interfaces.js';
import PlayersStorage from './PlayersStorage.js';
import PlayerModel from './PlayerModel.js';
import RoomsStorage from './RoomsStorage.js';
import EventsController from '../controllers/eventsController.js';
import GameStorage from './GameStorage.js';
import GameModel from './GameModel.js';

class WebSocketModel extends BaseModel {
    public player: PlayerModel | null;

    constructor(public ws: WebSocket, public eventsController: EventsController) {
        super();
        this._init();
        this.player = null;
    }

    private _init(): void {
        const instance = this;
        instance.ws.on('error', instance.onError);

        instance.ws.on('message', (message: RawData) => {
            instance.onMessage(message);
        });

        instance.ws.on('open', function () {
            console.log(`connection id ${instance.id} opened`);
            this.send('Hello!');
        });

        instance.ws.on('close', function close() {
            console.log('');
            console.log('\x1b[101m\x1b[1m   ×   \x1b[0m', `Connection with id \x1b[91m${instance.id}\x1b[0m closed`);
            console.log('');
            instance.eventsController.emit(`connection_closed`, instance.id);
        });
    }

    onOpen() {}

    onMessage(message: RawData) {
        const decodedMessage = JSON.parse(message.toString());
        const type: WSMessageTypes = decodedMessage.type;
        const data = decodedMessage.data.trim() ? JSON.parse(decodedMessage.data) : '';
        console.log('\x1b[104m\x1b[1m  <-  \x1b[0m', `\x1b[94m${this.id}\x1b[0m`);
        console.log('\x1b[94m\x1b[1m type:\x1b[0m', type);
        if (decodedMessage.data.trim()) {
            console.log('\x1b[94m\x1b[1m data:\x1b[0m', decodedMessage.data);
        }
        console.log('');

        switch (type) {
            case 'reg':
                this.reg(data);
                break;
            case 'create_room':
                this.createRoom();
                break;
            case 'add_user_to_room':
                this.addUserToRoom(data);
                break;
            case 'add_ships':
                this.addShips(data);
                break;
            case 'attack':
                this.attack(data);
                break;
            case 'randomAttack':
                this.randomAttack(data);
                break;
            default:
                this.send('reg', '{"message":"Hello"}');
        }
    }

    reg(data: { name: string; password: string }): void {
        const playersStorage = PlayersStorage.getInstance();
        const { name, password } = data;

        try {
            const player: PlayerModel = playersStorage.login(name, password);

            if (player) {
                this.player = player;
                this.send('reg', JSON.stringify({ name, index: player.id }));
                // this.createRoom();
                this.eventsController.emit(`create_room`);
            }
        } catch (error: unknown) {
            if (error instanceof Error) {
                this.send('reg', JSON.stringify({ error: true, errorText: error.message }));
            }
        }
    }

    createRoom() {
        const roomStorage = RoomsStorage.getInstance();
        roomStorage.create(this.player as PlayerModel);
        this.eventsController.emit(`create_room`);
    }

    addShips(data: { gameId: number; ships: []; indexPlayer: number }) {
        const { gameId, ships, indexPlayer } = data;
        const game = GameStorage.getInstance().get(gameId);
        game!.addShips(indexPlayer, ships);
        this.eventsController.emit(`ships_added`, game);
    }

    attack(data: { gameId: number; indexPlayer: number; x: number; y: number }): void {
        const { gameId, indexPlayer, x, y } = data;
        const game = GameStorage.getInstance().get(gameId) as GameModel;
        const attackStatuses = game.attack(indexPlayer, x, y);

        if (attackStatuses) {
            let isFinish = false;

            if (attackStatuses[0].status === 'killed' && game.isWinner(indexPlayer)) {
                isFinish = true;
                (this.player as PlayerModel).setWin();
                console.log('wins', this.player!.wins);
            }
            this.eventsController.emit(`attack`, indexPlayer, game, isFinish, attackStatuses);
        }
    }

    randomAttack(data: { gameId: number; indexPlayer: number }): void {
        const { gameId, indexPlayer } = data;
        const game = GameStorage.getInstance().get(gameId);
        const { x, y } = game!.getRandomCell(indexPlayer);

        this.eventsController.emit(`attack`, indexPlayer, game, game?.attack(indexPlayer, x, y));
    }

    addUserToRoom(data: { indexRoom: number }) {
        const roomStorage = RoomsStorage.getInstance();
        const room = roomStorage.get(data.indexRoom);

        if (room) {
            room.players;
            if (room.players.length < 2 && room.players[0].id !== this.player?.id) {
                room.addUser(this.player as PlayerModel);
                const playerRooms = roomStorage.getByPlayer(this.player!.id);

                if (playerRooms && playerRooms.length) {
                    for (const room of playerRooms) {
                        roomStorage.delete(room.id)
                    }
                }
                
                this.eventsController.emit(`add_user_to_room`, room);
            }
        }
    }

    onError(error: Error) {
        console.error(error.message);
    }

    send(type: WSMessageTypes, data: string): void {
        console.log('\x1b[103m\x1b[1m  ->  \x1b[0m', `\x1b[93m${this.id}\x1b[0m`);
        console.log('\x1b[93m\x1b[1m type:\x1b[0m', type);
        console.log('\x1b[93m\x1b[1m data:\x1b[0m', data);
        console.log('');

        this.ws.send(JSON.stringify({ type, data, id: this.id }));
    }
}

export default WebSocketModel;
