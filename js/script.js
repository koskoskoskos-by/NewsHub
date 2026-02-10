document.addEventListener('DOMContentLoaded', () => {
    const title = document.querySelector('h1');
    title.addEventListener('click', () => {
        alert('Вы кликнули по заголовку NewsHub!');
    });
});