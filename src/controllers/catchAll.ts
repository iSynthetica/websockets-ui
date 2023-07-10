import { PlayerController } from "./Player.js";

export class CatchAllController {
    private commands = {
        reg: '',
        create_room: '',
        add_player_to_room: '',
        add_ships: '',
        attack: '',
        randomAttack: '',
    };

    private playerCtr: PlayerController;
    constructor() {
        this.playerCtr = new PlayerController();
    }

    public handleRequest(message: {}) {
        const responseData = {
            name: 'Vlad',
            index: 1,
            error: false,
            errorText: '',
        };

        return {
            type: 'reg',
            data: JSON.stringify(responseData),
            id: 0,
        };
    }
}