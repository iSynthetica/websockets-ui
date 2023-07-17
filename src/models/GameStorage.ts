import GameModel from "./GameModel.js";
import PlayerModel from './PlayerModel.js';

class GameStorage {
    private static _instance: GameStorage;
    private _games: GameModel[];

    private constructor() {
        this._games = [];
    }

    public static getInstance(): GameStorage {
        if (!GameStorage._instance) {
            GameStorage._instance = new GameStorage();
        }

        return GameStorage._instance;
    }

    public get(id: number): GameModel | undefined {
        return this._games.find((room: GameModel) => room.id === id);
    }

    public create(player1: number, player2: number, room: number): GameModel {
        const game = new GameModel(player1, player2, room);
        this._games.push(game);
        return game;
    }
}

export default GameStorage;