import EventEmitter from "events";
import RoomModel from "../models/RoomModel.js";

class EventsController extends EventEmitter {
    constructor() {
        super();
    }

    reg(name: string) {
        this.emit('reg', name);
    }

    createRoom() {
        this.emit(`create_room`);
    }

    addUserToRoom(room: RoomModel) {
        this.emit(`add_user_to_room`, room);
    }
}

export default EventsController;