import 'dotenv/config';
import { WebSocketServer } from 'ws';
import { CallbackI } from '../models/interfaces.js';
import { CatchAllController } from '../controllers/catchAll.js';

export const startWSServer = (port: number, cb: CallbackI) => {
    const wsServer = new WebSocketServer({ port });
    const controller = new CatchAllController();

    wsServer.on('connection', function connection(ws) {
        ws.on('error', console.error);

        ws.on('message', function message(data) {
            const response = controller.handleRequest(data);

            ws.send(JSON.stringify(response));
        });

        ws.on('open', function open() {
            ws.send('Hello');
        });
    });

    cb();
};


