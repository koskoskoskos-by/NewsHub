export const session = {
    save(key, value) {
        sessionStorage.setItem(key, JSON.stringify(value));
    },
    get(key) {
        const data = sessionStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    },
    remove(key) {
        sessionStorage.removeItem(key);
    }
};