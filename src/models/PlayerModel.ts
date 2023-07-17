import BaseModel from './baseModel.js';

class PlayerModel extends BaseModel {
    private _name: string;
    private _password: string;
    private _wins: number;

    constructor(name: string, password: string) {
        super();
        this._name = name;
        this._password = password;
        this._wins = 0;
    }

    get name(): string {
        return this._name;
    }

    get password(): string {
        return this._password;
    }

    get wins() {
        return this._wins
    }

    setWin() {
        this._wins++
    }
}

export default PlayerModel;
