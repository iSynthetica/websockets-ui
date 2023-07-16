import BaseModel from './baseModel.js';
import PlayersStorage from './PlayersStorage.js';
import PlayerModel from './PlayerModel.js';
import RoomsStorage from './RoomsStorage.js';
import RoomModel from './RoomModel.js';

export interface AttackStatusI {
    position: {
        x: number;
        y: number;
    };
    currentPlayer: number;
    status: 'miss' | 'shot' | 'kill';
}

interface Ship {
    position: {
        x: number;
        y: number;
    };
    coordinates?: {
        x: number,
        y: number
    }[];
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

    attack(id: number, col: number, row: number): AttackStatusI[] {
        let field = this._generateField([]);

        if (this._player1.id === id) {
            field = this._player1.field;
        } else if (this._player2.id === id) {
            field = this._player1.field;
        }

        let returnStatuses: AttackStatusI[] = [];

        let cell = field[row][col];

        if (cell === 0 || cell === 'm' || cell === 'x') {
            returnStatuses.push({
                position: {
                    x: col,
                    y: row,
                },
                currentPlayer: id,
                status: 'miss',
            });
        } else {
            returnStatuses.push({
                position: {
                    x: col,
                    y: row,
                },
                currentPlayer: id,
                status: 'shot',
            });
        }

        return returnStatuses;
    }

    private _generateField(ships: Ship[]): string | number[][] {
        const field = [];

        for (let i = 0; i < 10; i++) {
            field.push(Array.from({ length: 10 }, (v, i) => 0));
        }

        for (let ship of ships) {
            let length = ship.length;
            let row = ship.position.y;
            let col = ship.position.x;

            while (length > 0) {
                field[row][col] = ship.length;
                ship.coordinates?.push({x: row, y: col})
                if (ship.direction) {
                    row++;
                } else {
                    col++;
                }
                length--;
            }

            console.log(JSON.stringify(ship, null, 2));
            
        }

        return field;
    }
}

export default GameModel;
