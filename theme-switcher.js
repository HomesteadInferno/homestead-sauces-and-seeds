/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    🎨 THEME SWITCHER (v3.1 - Auto-detect for Products)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
(function () {
    'use strict';

    const THEMES = {
        seeds:      'seeds-page',
        sauces:     'sauces-page',
        otherseeds: 'otherseeds-page'
    };

    const URL_MAP = {
        'seedsandseedlings': 'seeds',
        'sauces':            'sauces',
        'otherseeds':        'otherseeds',
        'superhots':         'seeds'
    };

    function getThemeFromUrl() {
        const url = window.location.href.toLowerCase();
        for (const [frag, key] of Object.entries(URL_MAP)) {
            if (url.includes(frag)) return key;
        }
        return null;
    }

    function applyTheme(key) {
        if (!THEMES[key]) return;
        const body = document.body;
        const newClass = THEMES[key];

        if (body.classList.contains(newClass)) return;

        Object.values(THEMES).forEach(cls => body.classList.remove(cls));
        body.classList.add(newClass);
        sessionStorage.setItem('hs_theme', key);
        
        highlightSidebar(key);
    }

    function init() {
        // 1. ПЕРЕВІРКА: Чи ми на сторінці товару?
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id'); // Витягуємо, наприклад, 'tomato_pink'

        if (productId && typeof allProducts !== 'undefined' && allProducts[productId]) {
            // Беремо категорію безпосередньо з об'єкта товару в products.js
            const category = allProducts[productId].category; 
            
            console.log("🔍 Знайдено товар:", productId, "Категорія:", category);
            
            if (category) {
                applyTheme(category);
                return; // Виходимо, бо тему для товару вже встановлено
            }
        }

        // 2. Якщо це не сторінка товару — звичайна логіка категорій
        const urlTheme = getThemeFromUrl();
        let savedTheme = sessionStorage.getItem('hs_theme');

        if (urlTheme) {
            applyTheme(urlTheme);
        } else if (savedTheme) {
            applyTheme(savedTheme);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    🔍 ULTIMATE ZOOM (v1.6) - З ХРЕСТИКОМ ТА ФОТО
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
(function () {
    'use strict';

    function initZoom() {
        let overlay = document.querySelector('.zoom-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'zoom-overlay';
            // Додаємо структуру: Хрестик + Контейнер для фото
            overlay.innerHTML = `
                <div class="zoom-close">&times;</div>
                <img src="" alt="Zoomed">
            `;
            document.body.appendChild(overlay);
        }

        const zoomImg = overlay.querySelector('img');
        const closeBtn = overlay.querySelector('.zoom-close');

        // Функція закриття
        const closeZoom = () => {
            overlay.classList.remove('active');
            document.body.style.overflow = '';
            setTimeout(() => { zoomImg.src = ''; }, 300); // Очищуємо після анімації
        };

        overlay.onclick = (e) => { if (e.target !== zoomImg) closeZoom(); };
        closeBtn.onclick = closeZoom;

        document.addEventListener('click', function (e) {
            const target = e.target;
            // Перевіряємо клік по головному фото
            if (target.id === 'main-view' || target.closest('.main-img-wrap img')) {
                
                const sourceSrc = target.src;
                if (!sourceSrc) return;

                zoomImg.src = sourceSrc;
                overlay.classList.add('active');
                document.body.style.overflow = 'hidden';
                
                console.log("📸 Фото завантажено в зум:", sourceSrc);
                e.preventDefault();
            }
        }, true);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initZoom);
    } else {
        initZoom();
    }
})();
