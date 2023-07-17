import { startHttpServer } from './http_server/index.js';
import { startWSServer } from "./ws_server/index.js";
import 'dotenv/config'

const HTTP_PORT = +(process.env.HTTP_PORT as string) || 8181;
const WS_PORT = 3000;

startHttpServer(HTTP_PORT, () => {
    console.log(`Start static http server on the ${HTTP_PORT} port!`);
});

startWSServer(WS_PORT, () => {
    console.log(`Start websocket http server on the ${WS_PORT} port!`);
});