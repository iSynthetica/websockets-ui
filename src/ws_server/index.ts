import 'dotenv/config';
import { WebSocket, WebSocketServer } from 'ws';
import { CallbackI } from '../models/interfaces.js';
import App from '../app.js';

export const startWSServer = (port: number, cb: CallbackI) => {
    const wsServer = new WebSocketServer({ port });
    const app = new App();

    wsServer.on('connection', function connection(ws: WebSocket) {
        console.log('');
        console.log(
            '\x1b[42m\x1b[1m   +   \x1b[0m',
            `Connection with id \x1b[32m${app.addConnection(ws)}\x1b[0m opened`
        );
        console.log('');
    });

    cb();
};


