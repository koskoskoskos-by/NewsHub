import { CACHE_KEY, LIKES_KEY } from '../api/config.js';

export const storage = {
    // Работа с новостями
    saveNews(articles) {
        localStorage.setItem(CACHE_KEY, JSON.stringify(articles));
    },
    getNews() {
        const data = localStorage.getItem(CACHE_KEY);
        return data ? JSON.parse(data) : [];
    },
    
    // Работа с лайками
    getLikes() {
        return JSON.parse(localStorage.getItem(LIKES_KEY)) || [];
    },
    saveLikes(likesArray) {
        localStorage.setItem(LIKES_KEY, JSON.stringify(likesArray));
    }
};