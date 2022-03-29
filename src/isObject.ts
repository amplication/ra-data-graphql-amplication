export function isObject(arr: any[]): boolean {
    return arr.every(item => item === Object(item));
}
