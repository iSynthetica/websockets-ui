import { RawData, WebSocket } from 'ws';
import BaseModel from './baseModel.js';
import { WSMessageTypes } from './interfaces.js';
import PlayersStorage from './PlayersStorage.js';
import PlayerModel from './PlayerModel.js';
import RoomsStorage from './RoomsStorage.js';
import EventsController from '../controllers/eventsController.js';
import GameStorage from './GameStorage.js';

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
            console.log(`Open in WebSocketModel id ${instance.id}`);
            this.send('Hello!');
        });

        instance.ws.on('close', function close() {
            console.log(`connection id ${instance.id} closed`);
        });
    }

    onOpen() {}

    onMessage(message: RawData) {
        const decodedMessage = JSON.parse(message.toString());
        const type: WSMessageTypes = decodedMessage.type;
        const data = decodedMessage.data.trim() ? JSON.parse(decodedMessage.data) : '';

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
            default:
                console.log('type:', type);
                console.log('data:', data);
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
                this.eventsController.reg(player.name);

                this.send(
                    'reg',
                    JSON.stringify({
                        name: player.name,
                        index: player.id,
                    })
                );

                this.createRoom();
            }
        } catch (error: unknown) {
            if (error instanceof Error) {
                this.send(
                    'reg',
                    JSON.stringify({
                        error: true,
                        errorText: error.message,
                    })
                );
            }
        }
    }

    createRoom() {
        const roomStorage = RoomsStorage.getInstance();
        const room = roomStorage.create(this.player as PlayerModel);
        this.eventsController.createRoom();
    }

    addShips(data: { gameId: number; ships: []; indexPlayer: number }) {
        console.log('type:', 'add_ships');
        console.log('data:', JSON.stringify(data, null, 2));
        console.log('player:', this.player);

        const { gameId, ships, indexPlayer } = data;

        const game = GameStorage.getInstance().get(gameId);
        game?.addShips(indexPlayer, ships);
        this.eventsController.emit(`ships_added`, game);
    }

    attack(data: { gameId: number; indexPlayer: number; x: number; y: number }): void {
        console.log('type:', 'attack');
        console.log('data:', JSON.stringify(data, null, 2));
    }

    addUserToRoom(data: { indexRoom: number }) {
        const roomStorage = RoomsStorage.getInstance();
        const room = roomStorage.get(data.indexRoom);

        if (room) {
            room.addUser(this.player as PlayerModel);
            this.eventsController.addUserToRoom(room);
        }
    }

    onError(error: Error) {
        console.error(error.message);
    }

    send(type: WSMessageTypes, data: string): void {
        const response = {
            type,
            data,
            id: this.id,
        };
        // console.log(response);

        this.ws.send(JSON.stringify(response));
    }
}

export default WebSocketModel;
