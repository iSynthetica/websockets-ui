import BaseModel from './baseModel.js';
import PlayersStorage from './PlayersStorage.js';
import PlayerModel from './PlayerModel.js';
import RoomsStorage from './RoomsStorage.js';
import RoomModel from './RoomModel.js';

interface Ship {
    position: {
        x: number;
        y: number;
    };
    direction: boolean;
    type: string;
    length: number;
}

interface RoomPlayer {
    id: number;
    ships: Ship[];
    field: string | number[][];
}

class GameModel extends BaseModel {
    private _player1: RoomPlayer;
    private _player2: RoomPlayer;
    private _room: number;

    constructor(id1: number, id2: number, roomId: number) {
        super();
        this._player1 = {
            id: id1,
            ships: [],
            field: this._generateField([]),
        };
        this._player2 = {
            id: id2,
            ships: [],
            field: this._generateField([]),
        };
        this._room = roomId;
    }

    get players(): RoomPlayer[] {
        return [this._player1, this._player2];
    }

    get room(): RoomModel {
        const rooms = RoomsStorage.getInstance();
        return rooms.get(this._room) as RoomModel;
    }

    addShips(id: number, ships: Ship[]): void {
        if (this._player1.id === id) {
            this._player1.ships = ships;
            this._player1.field = this._generateField(ships);
        } else if (this._player2.id === id) {
            this._player2.ships = ships;
            this._player2.field = this._generateField(ships);
        }
    }

    private _generateField(ships: Ship[]): string | number [][] {
        const field = [];

        for (let i = 0; i < 10; i++) {
            field.push(Array.from({ length: 10 }, (v, i) => 0));
        }

        for (let ship of ships) {
            let length = ship.length;
            let row = ship.position.y;
            let col = ship.position.x;

            while (length > 0) {
                console.log(ship.length, row, col);
                field[row][col] = ship.length;
                if (ship.direction) {
                    row++;
                } else {
                    col++;
                }
                length--;
            }
        }

        return field;
    }
}

export default GameModel;
