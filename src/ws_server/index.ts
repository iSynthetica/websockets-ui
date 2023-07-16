import 'dotenv/config';
import { WebSocket, WebSocketServer } from 'ws';
import { CallbackI } from '../models/interfaces.js';
import App from '../app.js';

export const startWSServer = (port: number, cb: CallbackI) => {
    const wsServer = new WebSocketServer({ port });
    const app = new App();

    wsServer.on('connection', function connection(ws: WebSocket) {
        console.log(`New connection with id ${app.addConnection(ws)} set up`);
        
        ws.on('open', function open() {
            ws.send('Hello!');
        });
    });

    cb();
};


