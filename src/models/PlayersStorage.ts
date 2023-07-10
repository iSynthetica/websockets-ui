export interface PlayerI {
    name: string;
    password: string;
}

export class PlayersStorage {
    private static _instance: PlayersStorage;
    private players: PlayerI[];

    private constructor() {
        this.players = [];
    }

    public static getInstance(): PlayersStorage {
        if (!PlayersStorage._instance) {
            PlayersStorage._instance = new PlayersStorage();
        }

        return PlayersStorage._instance;
    }

    public get(data: PlayerI): PlayerI {
        const player = this.players.find(player => player.name === data.name);

        if (player) {
            if (player.password !== data.password) {
                throw new Error('Wrong password');
            }

            return player;
        }

        return this.create(data);
    }

    public create(data: PlayerI): PlayerI {
        this.players.push(data);

        return data;
    }
}
