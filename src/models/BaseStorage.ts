class BaseStorage {
    private static _instance: BaseStorage;

    private constructor() {}

    public static getInstance(): BaseStorage {
        if (!BaseStorage._instance) {
            BaseStorage._instance = new BaseStorage();
        }

        return BaseStorage._instance;
    }
}

export default BaseStorage;