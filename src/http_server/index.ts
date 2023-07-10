import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';
import { CallbackI } from '../models/interfaces.js';


export const startHttpServer = (port: number, cb: CallbackI) => {
    const httpServer = http.createServer(function (req: http.IncomingMessage, res: http.ServerResponse) {

        const __dirname = path.resolve(path.dirname(''));
        const file_path = __dirname + (req.url === '/' ? '/front/index.html' : '/front' + req.url);
        fs.readFile(file_path, function (err, data) {
            if (err) {
                res.writeHead(404);
                res.end(JSON.stringify(err));
                return;
            }
            res.writeHead(200);
            res.end(data);
        });
    });

    cb();

    console.log(path.resolve('', 'front', 'index.html'));
    httpServer.listen(port);
};
