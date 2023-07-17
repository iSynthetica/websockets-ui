import PlayerModel from "./PlayerModel.js";
class PlayersStorage {
    private static _instance: PlayersStorage;
    private players: PlayerModel[];

    private constructor() {
        this.players = [];
    }

    public static getInstance(): PlayersStorage {
        if (!PlayersStorage._instance) {
            PlayersStorage._instance = new PlayersStorage();
        }

        return PlayersStorage._instance;
    }

    get winners(): PlayerModel[] {
        return this.players.filter((player: PlayerModel) => player.wins).sort((w1, w2) => w2.wins - w1.wins);
    }

    public login(name: string, password: string): PlayerModel {
        const player = this.players.find(player => player.name === name);

        if (player) {
            if (player.password !== password) {
                throw new Error('Wrong password');
            }

            return player;
        }

        return this.create(name, password);
    }

    public get(id: number): PlayerModel | undefined {
        return this.players.find(player => player.id === id);
    }

    public create(name: string, password: string): PlayerModel {
        const player = new PlayerModel(name, password);
        this.players.push(player);

        return player;
    }
}

export default PlayersStorage;
