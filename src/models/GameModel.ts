import BaseModel from "./baseModel.js";
import PlayersStorage from "./PlayersStorage.js";
import PlayerModel from './PlayerModel.js';
import RoomsStorage from "./RoomsStorage.js";
import RoomModel from "./RoomModel.js";

interface Ship {
    position: {
        x: number,
        y: number
    };
    direction: boolean;
    type: string;
    length: number;
}

interface RoomPlayer {
    id: number;
    ships: Ship[];
}

class GameModel extends BaseModel {
    private _player1: RoomPlayer;
    private _player2: RoomPlayer;
    private _room: number;

    constructor(id1: number, id2: number, roomId: number) {
        super();
        this._player1 = {
            id: id1,
            ships: []
        };
        this._player2 = {
            id: id2,
            ships: [],
        };
        this._room = roomId;
    }

    get players(): PlayerModel[] {
        const players = PlayersStorage.getInstance();
        return [players.get(this._player1.id) as PlayerModel, players.get(this._player2.id) as PlayerModel];
    }

    get room(): RoomModel {
        const rooms = RoomsStorage.getInstance();
        return rooms.get(this._room) as RoomModel;
    }
}

export default GameModel;