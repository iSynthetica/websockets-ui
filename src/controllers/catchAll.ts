import { WebSocket } from 'ws';
import { PlayersStorage, PlayerI } from '../models/PlayersStorage.js';
import { WSRequestI, CommandsI } from '../models/interfaces.js';

export class CatchAllController {
    private playerStorage: PlayersStorage;
    constructor(public ws: WebSocket) {
        this.playerStorage = PlayersStorage.getInstance();
    }

    public handleRequest(type: string, message: WSRequestI, ws: WebSocket): WSRequestI {
        if (type === 'reg') {
            return this.reg(message) as WSRequestI;
        }
        if (type === 'create_room') {
            return this.createRoom(message) as WSRequestI;
        }

        return {
            type: 'reg',
            data: JSON.stringify({}),
        };
    }

    private createRoom(message: WSRequestI): any {
        console.log(message);
    }

    private reg(message: WSRequestI): any {
        const type = 'reg';
        const data = JSON.parse(message.data as string);
        let member: PlayerI = {
            name: '',
            password: '',
        };

        try {
            member = this.playerStorage.get(data);
        } catch (error) {
            this.sendMessage({
                type,
                data: JSON.stringify({
                    error: true,
                    errorText: (error as Error).message,
                }),
                id: 0,
            });
        }

        if (member) {
            this.sendMessage({
                type,
                data: JSON.stringify({
                    name: member.name,
                    index: 0,
                }),
                id: 0,
            });
            this.sendMessage({
                type: 'update_room',
                data: JSON.stringify([
                    {
                        roomId: 0,
                        roomUsers: [
                            {
                                name: member.name,
                                index: 0,
                            },
                        ],
                    },
                ]),
                id: 0,
            });
        }
    }

    private sendMessage(response: WSRequestI): void {
        this.ws.send(JSON.stringify(response));
    }
}
