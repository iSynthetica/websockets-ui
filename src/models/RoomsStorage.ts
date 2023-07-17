import RoomModel from './RoomModel.js';
import PlayerModel from './PlayerModel.js';

class RoomsStorage {
    private static _instance: RoomsStorage;
    private _rooms: RoomModel[];

    private constructor() {
        this._rooms = [];
    }

    public static getInstance(): RoomsStorage {
        if (!RoomsStorage._instance) {
            RoomsStorage._instance = new RoomsStorage();
        }

        return RoomsStorage._instance;
    }

    public get(id: number): RoomModel | undefined {
        return this._rooms.find((room: RoomModel) => room.id === id);
    }

    public create(player: PlayerModel): RoomModel {
        const room: RoomModel = new RoomModel(player);
        this._rooms.push(room);

        return room;
    }

    public delete(id: number) {
        this._rooms = this._rooms.filter(r => r.id !== id);
    }

    public getAvailableRooms(): RoomModel[] {
        return this._rooms.filter(room => room.players.length < 2);
    }

    public getByPlayer(id: number): RoomModel[] {
        return this._rooms.filter((r: RoomModel) => r.players.find((p: PlayerModel) => p.id === id));
    }
}

export default RoomsStorage;
