import { type } from "os";

export interface CallbackI {
    (): void;
}

export interface CRUDI {
    create: () => void;
}

export interface CommandsI {
    reg?: string;
    create_room?: string;
    add_player_to_room?: string;
    add_ships?: string;
    attack?: string;
    randomAttack?: string;
}

export type WSRequestTypes =
    | 'reg'
    | 'update_winners'
    | 'create_room'
    | 'randomAttack'
    | 'create_game'
    | 'update_room'
    | 'add_ships'
    | 'start_game'
    | 'turn'
    | 'finish'
    | 'attack';
export interface WSRequestI {
    type?: WSRequestTypes;
    data?: string;
    id?: number
}