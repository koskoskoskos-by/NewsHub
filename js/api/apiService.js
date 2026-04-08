import { API_KEY, API_BASE_URL } from './config.js';
import { storage } from '../storage/localStorage.js';

// Добавили параметры category и query
export async function fetchNews(category = 'general', query = '') {
    // Базовый адрес
    let url = `${API_BASE_URL}/top-headlines?country=us&apiKey=${API_KEY}`;
    
    // Если передали категорию (например, sports или health)
    if (category) {
        url += `&category=${category}`;
    }
    // Если категории нет, но есть ключевое слово (например, politics)
    if (query) {
        url += `&q=${query}`;
    }

    // Проверка интернета
    if (!navigator.onLine) {
        console.log('Оффлайн режим: загружаем новости из кэша');
        return storage.getNews();
    }

    try {
        console.log('Отправка асинхронного запроса к NewsAPI...'); // ДОБАВИТЬ ЭТО
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);
        
        const data = await response.json();
        console.log('Данные успешно получены:', data.articles); // И ЭТО
        
        storage.saveNews(data.articles);
        return data.articles;
    } catch (error) {
        console.error('Ошибка API, используем кэш:', error);
        return storage.getNews();
    }
}