import { fetchNews } from './api/apiService.js';
import { storage } from './storage/localStorage.js';
import { formatDate, isValidArticle } from './utils/dataParser.js';

document.addEventListener('DOMContentLoaded', () => {
    
    // === ИНИЦИАЛИЗАЦИЯ И РЕНДЕРИНГ ===
    async function initApp() {
        const articles = await fetchNews();
        renderNews(articles);
    }

    // НОВАЯ ПРАВИЛЬНАЯ ФУНКЦИЯ ОТРИСОВКИ (с разделением на главную, боковую и сетку)
    function renderNews(articles) {
        const heroContainer = document.getElementById('hero-article-container');
        const gridContainer = document.getElementById('api-news-container');
        const sidebarContainer = document.getElementById('api-sidebar-container');

        if (!articles || articles.length === 0) return;

        if (heroContainer) heroContainer.innerHTML = '';
        if (gridContainer) gridContainer.innerHTML = '';
        if (sidebarContainer) sidebarContainer.innerHTML = '';

        const validArticles = articles.filter(isValidArticle);

        validArticles.forEach((article, index) => {
            const id = `api-news-${index}`;
            const imageUrl = article.urlToImage || 'images/logo.jpg'; 
            const sourceName = article.source?.name || 'NewsHub';
            const formattedDate = formatDate(article.publishedAt);
            const description = article.description || 'Описание временно недоступно...';

            if (index === 0) {
                // 1. ГЛАВНАЯ НОВОСТЬ
                const heroHTML = `
                    <article class="hero-article" data-id="${id}" data-url="${article.url}" itemscope itemtype="https://schema.org/NewsArticle">
                        <header class="hero-article__header">
                            <h3 itemprop="headline"><a href="${article.url}">${article.title}</a></h3>
                            <div class="article-meta">
                                <time datetime="${article.publishedAt}">${formattedDate}</time>
                                <span>| «${sourceName}»</span>
                            </div>
                        </header>
                        <div class="hero-article__layout">
                            <div class="hero-article__description" itemprop="articleBody">
                                <p>${description}</p>
                                <button class="like-btn" aria-label="Поставить лайк"><span class="like-icon">🤍</span></button>
                            </div>
                            <figure class="hero-article__figure">
                                <img src="${imageUrl}" alt="${article.title}" itemprop="image" onerror="this.src='images/logo.jpg'">
                            </figure>
                        </div>
                    </article>
                `;
                if (heroContainer) heroContainer.insertAdjacentHTML('beforeend', heroHTML);

            } else if (index >= 1 && index <= 3) {
                // 2. БОКОВАЯ ПАНЕЛЬ
                const sidebarHTML = `
                    <article class="sidebar-item" data-id="${id}" data-url="${article.url}" itemscope itemtype="https://schema.org/NewsArticle">
                        <figure>
                            <img src="${imageUrl}" alt="${article.title}" itemprop="image" onerror="this.src='images/logo.jpg'">
                        </figure>
                        <h3 itemprop="headline"><a href="${article.url}">${article.title}</a></h3>
                        <time datetime="${article.publishedAt}">${formattedDate}</time>
                        <button class="like-btn" aria-label="Поставить лайк"><span class="like-icon">🤍</span></button>
                    </article>
                `;
                if (sidebarContainer) sidebarContainer.insertAdjacentHTML('beforeend', sidebarHTML);

            } else {
                // 3. СЕТКА НОВОСТЕЙ
                const gridHTML = `
                    <article class="news-card" data-id="${id}" data-url="${article.url}" itemscope itemtype="https://schema.org/NewsArticle">
                        <figure>
                            <img src="${imageUrl}" alt="${article.title}" itemprop="image" onerror="this.src='images/logo.jpg'">
                        </figure>
                        <h3 itemprop="headline"><a href="${article.url}">${article.title}</a></h3>
                        <div itemprop="articleBody"><p>${description}</p></div>
                        <time datetime="${article.publishedAt}">${formattedDate} | «${sourceName}»</time>
                        <button class="like-btn" aria-label="Поставить лайк"><span class="like-icon">🤍</span></button>
                    </article>
                `;
                if (gridContainer) gridContainer.insertAdjacentHTML('beforeend', gridHTML);
            }
        });

        initLikes();
    }

    // === ЛОГИКА ЛАЙКОВ ===
    let likedArticles = storage.getLikes();

    function initLikes() {
        likedArticles.forEach(id => {
            const article = document.querySelector(`[data-id="${id}"]`);
            if (article) {
                const btn = article.querySelector('.like-btn');
                if (btn) {
                    btn.classList.add('is-active');
                    btn.querySelector('.like-icon').textContent = '❤️';
                }
            }
        });
    }

    document.addEventListener('click', (event) => {
        const btn = event.target.closest('.like-btn');
        if (!btn) return;

        const article = btn.closest('article');
        const articleId = article.dataset.id;

        if (!articleId) return;

        if (likedArticles.includes(articleId)) {
            likedArticles = likedArticles.filter(id => id !== articleId);
            btn.classList.remove('is-active');
            btn.querySelector('.like-icon').textContent = '🤍';
        } else {
            likedArticles.push(articleId);
            btn.classList.add('is-active');
            btn.querySelector('.like-icon').textContent = '❤️';
        }

        storage.saveLikes(likedArticles);
    });

    // === ЛОГИКА НАВИГАЦИИ (ФИЛЬТРЫ) ===
    // === ЛОГИКА НАВИГАЦИИ (ФИЛЬТРЫ) ===
    const navList = document.querySelector('.nav__list');
    if (navList) {
        // Делаем функцию асинхронной (добавили async)
        navList.addEventListener('click', async (event) => {
            const link = event.target.closest('a');
            if (!link) return; 
            event.preventDefault(); 
            
            const selectedCategory = link.dataset.category;
            
            // Перекрашиваем активную кнопку
            document.querySelectorAll('.nav__list a').forEach(a => a.classList.remove('active'));
            link.classList.add('active');

            // Очищаем экран и показываем надпись загрузки
            const gridContainer = document.getElementById('api-news-container');
            const heroContainer = document.getElementById('hero-article-container');
            const sidebarContainer = document.getElementById('api-sidebar-container');
            if (gridContainer) gridContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; font-size: 20px; padding: 40px;">Ищем свежие новости...</p>';
            if (heroContainer) heroContainer.innerHTML = '';
            if (sidebarContainer) sidebarContainer.innerHTML = '';

            // Маппинг: переводим русские названия в команды для NewsAPI
            let apiCategory = '';
            let apiQuery = '';

            switch(selectedCategory) {
                case 'all': 
                    apiCategory = 'general'; 
                    break;
                case 'Политика': 
                    apiQuery = 'politics'; // У NewsAPI нет категории политика, ищем по слову
                    break;
                case 'Медицина': 
                    apiCategory = 'health'; 
                    break;
                case 'Наука': 
                    apiCategory = 'science'; 
                    break;
                case 'Мнения': 
                    apiQuery = 'opinion'; 
                    break;
                case 'Спорт': 
                    apiCategory = 'sports'; 
                    break;
            }

            // Скачиваем новости по выбранной теме и отрисовываем их
            const articles = await fetchNews(apiCategory, apiQuery);
            renderNews(articles);
        });
    }

    // === ЛОГИКА ПОИСКА ===
    const searchInput = document.getElementById('news-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const allArticles = document.querySelectorAll('.hero-article, .news-card, .sidebar-item');

            allArticles.forEach(article => {
                const titleElement = article.querySelector('h3');
                if (titleElement) {
                    const title = titleElement.textContent.toLowerCase();
                    article.style.display = title.includes(query) ? '' : 'none';
                }
            });
        });
    }

    // === ЛОГИКА МОДАЛЬНОГО ОКНА ===
    const modal = document.getElementById('news-modal');
    if (modal) {
        const modalTitle = modal.querySelector('.modal__title');
        const modalImage = modal.querySelector('.modal__image');
        const modalBody = modal.querySelector('.modal__body');
        const closeBtn = modal.querySelector('.modal__close');
        const overlay = modal.querySelector('.modal__overlay');

        const openModal = (article) => {
            const title = article.querySelector('h3').textContent;
            const imgSrc = article.querySelector('img').src;
            const description = article.querySelector('[itemprop="articleBody"]')?.textContent || 
                                article.querySelector('.hero-article__description')?.textContent || "";
            
            const url = article.dataset.url || "#"; 

            modalTitle.textContent = title;
            modalImage.src = imgSrc;
            
            modalBody.innerHTML = `
                <p>${description}</p>
                <a href="${url}" target="_blank" rel="noopener noreferrer" style="display:inline-block; margin-top:15px; color:#0056b3; font-weight:bold; text-decoration:underline;">
                    Читать полностью в источнике
                </a>
            `;

            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        };

        const closeModal = () => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        };

        document.addEventListener('click', (e) => {
            const trigger = e.target.closest('h3 a, .hero-article h3');
            if (trigger) {
                e.preventDefault();
                const article = trigger.closest('article');
                if (article) openModal(article);
            }
        });

        closeBtn.addEventListener('click', closeModal);
        overlay.addEventListener('click', closeModal);
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeModal();
        });
    }

    // ВАЖНО: ЗАПУСКАЕМ НАШЕ ПРИЛОЖЕНИЕ (Этой строчки вам не хватало)
    initApp();
});