document.addEventListener('DOMContentLoaded', () => {
    
    const header = document.querySelector('.header');
    const allCards = document.querySelectorAll('.news-card');
    const mainContainer = document.getElementById('main');

    console.log('Проверка элементов:', {
        header: header,
        cardsCount: allCards.length,
        container: mainContainer
    });

    if (allCards.length > 0) {
        allCards[0].style.transition = 'all 0.3s ease';
    }

    const navList = document.querySelector('.nav__list');
    const articles = document.querySelectorAll('.hero-article, .news-card, .sidebar-item');

    if (navList) {
        navList.addEventListener('click', (event) => {
            const link = event.target.closest('a');
            if (!link) return; 

            event.preventDefault(); 
            
            const selectedCategory = link.dataset.category;

            document.querySelectorAll('.nav__list a').forEach(a => a.classList.remove('active'));
            link.classList.add('active');

            articles.forEach(article => {
                if (selectedCategory === 'all') {
                    article.style.display = ''; 
                } else {
                    const articleText = article.textContent.toLowerCase();
                    const category = selectedCategory.toLowerCase();

                    article.style.display = articleText.includes(category) ? '' : 'none';
                }
            });
        });
    }

    let likedArticles = JSON.parse(localStorage.getItem('newsLikes')) || [];

    const initLikes = () => {
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
    };

    initLikes();
    document.addEventListener('click', (event) => {
        const btn = event.target.closest('.like-btn');
        if (!btn) return;

        const article = btn.closest('article');
        const articleId = article.dataset.id;

        if (!articleId) {
            console.warn('У статьи не указан data-id!');
            return;
        }
        if (likedArticles.includes(articleId)) {
            likedArticles = likedArticles.filter(id => id !== articleId);
            btn.classList.remove('is-active');
            btn.querySelector('.like-icon').textContent = '🤍';
        } else {
            likedArticles.push(articleId);
            btn.classList.add('is-active');
            btn.querySelector('.like-icon').textContent = '❤️';
        }

        localStorage.setItem('newsLikes', JSON.stringify(likedArticles));
        });
        const modal = document.getElementById('news-modal');

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

        modalTitle.textContent = title;
        modalImage.src = imgSrc;
        modalBody.innerHTML = `<p>${description}</p><p>Здесь может быть расширенная версия статьи для подробного чтения...</p>`;

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
});

const searchInput = document.getElementById('news-search');

searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const articles = document.querySelectorAll('.hero-article, .news-card, .sidebar-item');

    articles.forEach(article => {
        const title = article.querySelector('h3').textContent.toLowerCase();
        article.style.display = title.includes(query) ? '' : 'none';
    });
});