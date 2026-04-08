const searchInput = document.getElementById('news-search');

searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const articles = document.querySelectorAll('.hero-article, .news-card, .sidebar-item');

    articles.forEach(article => {
        const title = article.querySelector('h3').textContent.toLowerCase();
        article.style.display = title.includes(query) ? '' : 'none';
    });
});