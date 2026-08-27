export const parseJson = <T>(value: T | string | null | undefined): T | undefined => {
    if (value == null) return undefined;

    if (typeof value !== 'string') {
        return value as T;
    }

    try {
        return JSON.parse(value);
    } catch {
        return undefined;
    }
};