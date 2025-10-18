let lastScroll = 0;

const header = document.querySelector('header');
window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
        header.classList.add('shadow-lg');
    } else {
        header.classList.remove('shadow-lg');
    }
    lastScroll = window.scrollY;
});