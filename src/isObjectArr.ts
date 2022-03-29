export function isObjectArr(arr: any[]): boolean {
    return arr.every(item => item === Object(item));
}
