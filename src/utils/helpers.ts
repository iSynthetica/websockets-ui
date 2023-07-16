export const generateIndex = (): number => {
    const max = 99999;
    const min = 11111;
    const rand = Math.floor(Math.random() * (max - min + 1)) + min;
    const ts = Date.now() * 1000;

    return ts + rand;
}