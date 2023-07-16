import BaseModel from './baseModel.js';

class PlayerModel extends BaseModel {
    private _name: string;
    private _password: string;

    constructor(name: string, password: string) {
        super();
        this._name = name;
        this._password = password;
    }

    get name(): string {
        return this._name;
    }

    get password(): string {
        return this._password;
    }
}

export default PlayerModel;
