const langBtns = document.querySelectorAll('.lang-btn');
const translatableElements = document.querySelectorAll('[data-en]');

function setLanguage(lang) {
    translatableElements.forEach(el => {
        el.innerHTML = el.getAttribute(`data-${lang}`);
    });

    document.documentElement.lang = lang;
    localStorage.setItem('lang', lang);

    langBtns.forEach(btn => {
        if (btn.getAttribute('data-lang') === lang) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

langBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        setLanguage(btn.getAttribute('data-lang'));
    });
});

const savedLang = localStorage.getItem('lang') || 'ro';
setLanguage(savedLang);