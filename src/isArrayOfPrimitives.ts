export const isArrayOfPrimitives = (value: any): boolean => {
    return Array.isArray(value) && (value.every(item => typeof item === "string") || value.every(item => typeof item === "number"));
}