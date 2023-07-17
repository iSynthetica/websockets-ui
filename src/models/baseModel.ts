import { generateIndex } from "../utils/helpers.js";

class BaseModel {
    private _id: number;

    constructor() {
        this._id = generateIndex();
    }

    get id(): number {
        return this._id;
    }
}

export default BaseModel;