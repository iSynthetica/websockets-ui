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

export type WSMessageTypes =
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
    | 'attack'
    | 'add_user_to_room';
export interface WSRequestI {
    type?: WSMessageTypes;
    data?: string;
    id?: number;
}