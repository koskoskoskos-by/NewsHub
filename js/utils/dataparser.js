export function formatDate(dateString) {
    if (!dateString) return '';
    const dateObj = new Date(dateString);
    return dateObj.toLocaleDateString('ru-RU', {
        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    });
}

export function isValidArticle(article) {
    // Отсеиваем удаленные или пустые статьи от API
    return article && article.title && article.title !== '[Removed]';
}