import EventEmitter from "events";
import RoomModel from "../models/RoomModel.js";

class EventsController extends EventEmitter {
    constructor() {
        super();
    }

    addUserToRoom(room: RoomModel) {
        this.emit(`add_user_to_room`, room);
    }
}

export default EventsController;