import BaseModel from "./baseModel.js";
import PlayerModel from "./PlayerModel.js";
import GameModel from "./GameModel.js";

class RoomModel extends BaseModel {
    private _players: PlayerModel[];
    private _games: GameModel[];

    constructor(player: PlayerModel) {
        super();
        this._players = [];
        this._games = [];
        this._players.push(player);
    }

    get players(): PlayerModel[] {
        return this._players;
    }

    public addUser(player: PlayerModel): void {
        this._players.push(player);
    }

    public addGame(game: GameModel): void {
        this._games.push(game);
    }

    // public createGame() {
    //     const [player1, player2] = this._players;
    //     const game = new GameModel(player1.id, player2.id, roo);

    //     this._games.push(game);

    //     return game;
    // }
}

export default RoomModel;