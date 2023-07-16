import { WebSocket } from 'ws';
import WebSocketModel from './WebSocketModel.js';
import { generateIndex } from '../utils/helpers.js';
import EventsController from '../controllers/eventsController.js';

class WebSocketsStorage {
    private static _instance: WebSocketsStorage;
    private _connections: WebSocketModel[];

    private constructor() {
        this._connections = [];
    }

    get connections(): WebSocketModel[] {
        return this._connections;
    }

    public static getInstance(): WebSocketsStorage {
        if (!WebSocketsStorage._instance) {
            WebSocketsStorage._instance = new WebSocketsStorage();
        }

        return WebSocketsStorage._instance;
    }

    public getByPlayer(id: number): WebSocketModel | undefined {
        return this._connections.find(connection => connection.player?.id === id);
    }

    public create(ws: WebSocket, eventsController: EventsController): WebSocketModel {
        const id = generateIndex();
        const connection: WebSocketModel = new WebSocketModel(ws, eventsController);
        this._connections.push(connection);

        return connection;
    }
}

export default WebSocketsStorage;