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
    status: 'miss' | 'shot' | 'killed';
}

type cell = string | number;
type field = cell[][] | [];

interface Ship {
    position: {
        x: number;
        y: number;
    };
    coordinates: {
        x: number;
        y: number;
        shot: boolean;
    }[];
    coordinatesEmpty: {
        x: number;
        y: number;
    }[];
    direction: boolean;
    type: string;
    length: number;
}

interface RoomPlayer {
    id: number;
    ships: Ship[];
    field: field;
}

class GameModel extends BaseModel {
    private _player1: RoomPlayer;
    private _player2: RoomPlayer;
    private _room: number;
    private _currentPlayer: number;
    constructor(id1: number, id2: number, roomId: number) {
        super();
        this._player1 = {
            id: id1,
            ships: [],
            field: [],
        };
        this._player2 = {
            id: id2,
            ships: [],
            field: [],
        };
        this._room = roomId;
        this._currentPlayer = id1;
    }

    get players(): RoomPlayer[] {
        return [this._player1, this._player2];
    }

    get room(): RoomModel {
        const rooms = RoomsStorage.getInstance();
        return rooms.get(this._room) as RoomModel;
    }

    set currentPlayer(id: number) {
        this._currentPlayer = id;
    }

    addShips(id: number, ships: Ship[]): void {
        if (this._player1.id === id) {
            this._generateField(this._player1, ships);
        } else if (this._player2.id === id) {
            this._generateField(this._player2, ships);
        }
    }

    attack(id: number, x: number, y: number): AttackStatusI[] | null {
        if (id !== this._currentPlayer) {
            return null;
        }

        let player = this._player1.id === id ? this._player2 : this._player1;
        let field = player.field;
        let ships = player.ships;

        let returnStatuses: AttackStatusI[] = [];

        let cell = field[y][x];
        let status: AttackStatusI = {
            position: { x, y },
            currentPlayer: id,
            status: 'miss',
        };

        if (cell === '-' || cell === 'm' || cell === 'x') {
            if (cell === '-') field[y][x] = 'm';
        } else {
            status.status = 'shot';
            field[y][x] = 'x';

            const ship: Ship = ships.find((ship: Ship) => {
                const coordinate = ship.coordinates.find(coordinate => coordinate.x === x && coordinate.y === y);
                if (coordinate) {
                    coordinate.shot = true;
                    return true;
                }
                return false;
            }) as Ship;

            const shotCount = ship.coordinates.filter(coordinate => coordinate.shot);
            if (shotCount.length === ship.length) {
                status.status = 'killed';
                const coordinatesEmpty = ship.coordinatesEmpty;

                for (const coordinate of coordinatesEmpty) {
                    const { x, y } = coordinate;
                    let cell = field[y][x];
                    if (cell === '-') {
                        field[y][x] = 'm';
                        returnStatuses.push({
                            position: { x, y },
                            currentPlayer: id,
                            status: 'miss',
                        });
                    }
                }
            }
        }

        returnStatuses.unshift(status);

        // console.log('Field === ');
        // console.log('', '', 0, 1, 2, 3, 4, 5, 6, 7, 8, 9);
        // for (let i in field) {
        //     const row = field[i];
        //     console.log(+i, '|', ...row, '|');
        // }

        return returnStatuses;
    }

    getRandomCell(id: number): { x: number; y: number } {
        let field: field = [];

        if (this._player1.id === id) {
            field = this._player2.field;
        } else if (this._player2.id === id) {
            field = this._player1.field;
        }

        let cells = [];
        for (let y in field) {
            let row = field[y];
            for (let x in row) {
                let cell = row[x];

                if (cell !== 'm' && cell !== 'x') {
                    cells.push({ x: +x, y: +y });
                }
            }
        }

        return cells[Math.floor(Math.random() * cells.length)];
    }

    isWinner(id: number): boolean {
        let player = this._player1.id === id ? this._player2 : this._player1;
        let field = player.field;
        for (const row of field) {
            for (const cell of row) {
                if (typeof cell === 'number') {
                    return false
                }
            }
        }
        return true;
    }

    private _generateField(player: RoomPlayer, ships: Ship[]): void {
        const field = [];

        for (let i = 0; i < 10; i++) {
            field.push(Array.from({ length: 10 }, (v, i) => '-') as cell[]);
        }

        for (let ship of ships) {
            let length = ship.length;
            let row = ship.position.y;
            let col = ship.position.x;
            ship.coordinates = [];
            ship.coordinatesEmpty = [];

            while (length > 0) {
                field[row][col] = ship.length;
                ship.coordinates.push({ y: row, x: col, shot: false });

                const isFirst = length === ship.length;
                const isLast = length === 1;
                const isTop = row === 0;
                const isRight = col === 9;
                const isBottom = row === 9;
                const isLeft = col === 0;

                if (ship.direction) {
                    // vertical
                    if (isFirst && !isTop) {
                        let y = row - 1;
                        ship.coordinatesEmpty.push({ x: col, y });
                        if (!isLeft) ship.coordinatesEmpty.push({ x: col - 1, y });
                        if (!isRight) ship.coordinatesEmpty.push({ x: col + 1, y });
                    }
                    if (isLast && !isBottom) {
                        let y = row + 1;
                        ship.coordinatesEmpty.push({ x: col, y });
                        if (!isLeft) ship.coordinatesEmpty.push({ x: col - 1, y });
                        if (!isRight) ship.coordinatesEmpty.push({ x: col + 1, y });
                    }
                    if (!isLeft) {
                        ship.coordinatesEmpty.push({ x: col - 1, y: row });
                    }
                    if (!isRight) {
                        ship.coordinatesEmpty.push({ x: col + 1, y: row });
                    }
                    row++;
                } else {
                    // horyzontal
                    if (isFirst && !isLeft) {
                        let x = col - 1;
                        ship.coordinatesEmpty.push({ x, y: row });
                        if (!isTop) ship.coordinatesEmpty.push({ x, y: row - 1 });
                        if (!isBottom) ship.coordinatesEmpty.push({ x, y: row + 1 });
                    }
                    if (isLast && !isRight) {
                        let x = col + 1;
                        ship.coordinatesEmpty.push({ x, y: row });
                        if (!isTop) ship.coordinatesEmpty.push({ x, y: row - 1 });
                        if (!isBottom) ship.coordinatesEmpty.push({ x, y: row + 1 });
                    }
                    if (!isTop) {
                        ship.coordinatesEmpty.push({ x: col, y: row - 1 });
                    }
                    if (!isBottom) {
                        ship.coordinatesEmpty.push({ x: col, y: row + 1 });
                    }
                    col++;
                }
                length--;
            }
        }

        player.field = field;
        player.ships = ships;
    }
}

export default GameModel;
