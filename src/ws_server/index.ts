import 'dotenv/config';
import { WebSocket, WebSocketServer } from 'ws';
import { CallbackI } from '../models/interfaces.js';
import { CatchAllController } from '../controllers/catchAll.js';

import { WSRequestI } from '../models/interfaces.js';

export const startWSServer = (port: number, cb: CallbackI) => {
    const wsServer = new WebSocketServer({ port });

    wsServer.on('connection', function connection(ws) {
        const controller = new CatchAllController(ws);
        ws.on('error', console.error);

        ws.on('message', function message(message: WSRequestI) {
            message = JSON.parse(message as string);
            console.log(message);
            
            const type = message.type as string;
            const response = controller.handleRequest(type, message as WSRequestI, ws as WebSocket);
            ws.send(JSON.stringify(response));
        });

        ws.on('open', function open() {
            ws.send('Hello');
        });
    });

    cb();
};


