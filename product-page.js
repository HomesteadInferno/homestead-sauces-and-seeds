// ===== ЛОГІКА СТОРІНКИ ТОВАРУ (product.html) =====

// Глобальна змінна для ID товару (потрібна для кошика)
let currentProductId = null;

document.addEventListener('DOMContentLoaded', () => {
    // Отримуємо ID товару з URL (наприклад: product.html?id=habaneroredsavina)
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');
    const product = allProducts[productId];

    if (!product) {
        document.querySelector('.product-page').innerHTML = 
            '<h2 style="grid-column: span 2; text-align: center; padding: 50px;">Товар не знайдено 😕 <br><a href="index.html" class="add-btn" style="display:inline-block; width:auto; margin-top:20px;">Повернутися в каталог</a></h2>';
        return; // Зупиняємо виконання всього, що нижче
    }
    
    // Зберігаємо ID глобально
    currentProductId = productId;
    // ... ТЕМИ СТОРІНОК ...
    // Отримуємо посилання на body
const body = document.body;

// Очищуємо старі класи тем, щоб вони не змішувалися
body.classList.remove('seeds-page', 'sauces-page', 'otherseeds-page', 'theme-fire');

// Встановлюємо тему залежно від категорії
if (product.category === 'seeds') {
    body.classList.add('seeds-page');
} else if (product.category === 'sauces') {
    body.classList.add('sauces-page');
} else if (product.category === 'otherseeds') {
    body.classList.add('otherseeds-page');
}


    if (product) {
        injectProductSchema(product, productId);
        // ===== 1. SEO (для Google та соцмереж) =====
        document.title = `${product.name} — купити в Homestead`;
        
        // Оновлюємо мета-теги
        const metaDesc = document.getElementById('meta-description');
        if (metaDesc) {
            metaDesc.content = product.description.replace(/<[^>]*>/g, '').substring(0, 160);
        }
        
        const ogTitle = document.getElementById('og-title');
        if (ogTitle) ogTitle.content = product.name;
        
        const ogImage = document.getElementById('og-image');
if (ogImage && product.images && product.images[0]) {
    // Додаємо базову адресу до назви картинки
    const baseUrl = "https://homesteadinferno.github.io/homestead-sauces-and-seeds/";
    ogImage.content = baseUrl + "images/" + product.images[0];
}
        // ===== 11. ПЕРЕВІРКА НАЯВНОСТІ (Out of Stock логіка) =====
        const actionZone = document.getElementById('cart-action-zone');
        if (actionZone && product.inStock === false) {
            // Замінюємо стандартну кнопку на повідомлення
            actionZone.innerHTML = `
    <div class="out-of-stock-container">
        <div class="out-of-stock-icon">⏳</div>
        <h4 class="out-of-stock-title">Тимчасово відсутній</h4>
        <p class="out-of-stock-text">
            Ця позиція тимчасово перейшла у статус легенди. <br>
            Поки ви читаєте це, ми вже пакуємо свіжий врожай та готуємо нові пляшки. Справжня гострота не терпить поспіху! ⚡
        </p>
    </div>
`;
        }

        function injectProductSchema(product, id) {
    const baseUrl = "https://homesteadinferno.github.io/homestead-sauces-and-seeds/"; // Зміни на свій домен
    
    const schema = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": product.name,
        "image": product.images.filter(img => img !== "").map(img => baseUrl + "images/" + img),
        "description": product.description.replace(/<br>/g, ' '), // Прибираємо теги
        "sku": id.toUpperCase(),
        "brand": {
            "@type": "Brand",
            "name": "Gapka's Homestead Inferno"
        },
        "offers": {
            "@type": "Offer",
            "url": window.location.href,
            "priceCurrency": "UAH",
            "price": product.price,
            "availability": product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "itemCondition": "https://schema.org/NewCondition"
        }
    };

    // Створюємо елемент скрипта
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);
}

        // ===== 2. ЗАПОВНЮЄМО ОСНОВНУ ІНФОРМАЦІЮ =====
        document.getElementById('p-name').innerText = product.name;
        document.getElementById('p-desc').innerHTML = product.description;

        // ===== 2.1 ПЕРЕВІРКА НА ЕКСТРЕМАЛЬНУ ГОСТРОТУ (через heatScore) =====
// ===== 2.1 ПЕРЕВІРКА НА ГОСТРОТУ (Heat Score 3 та 4) =====
// ===== 2.1 ГНУЧКА ПЕРЕВІРКА НА ГОСТРОТУ (Рівень 3 та 4) =====
const warningZone = document.getElementById('extreme-warning-zone');

if (warningZone && product.heatScore) {
    let warningHTML = '';
    const isSauce = product.category === 'sauces';
    
    if (product.heatScore === "4") {
        // Екстремальний рівень
        warningHTML = `
            <div class="extreme-heat-warning level-4">
                <div class="warning-icon">💀</div>
                <div class="warning-text">
                    <h5>УВАГА: ЕКСТРЕМАЛЬНА ГОСТРОТА</h5>
                    <p>${isSauce 
                        ? "Цей соус містить екстремальну концентрацію капсаїцину. Вживати мікродозами." 
                        : "Концентрація речовини класифікується як екстремальна. Homestead рекомендує використовувати рукавички при роботі з насінням та плодами."}
                    </p>
                </div>
            </div>`;
        warningZone.style.display = 'block';
    } 
    else if (product.heatScore === "3") {
        // Високий рівень (1M+ SHU)
        warningHTML = `
            <div class="extreme-heat-warning level-3">
                <div class="warning-icon">🔥</div>
                <div class="warning-text">
                    <h5>ЗАСТЕРЕЖЕННЯ: ВИСОКИЙ РІВЕНЬ ГОСТРОТИ</h5>
                    <p>${isSauce 
                        ? "Дуже гострий продукт. Рекомендуємо починати з однієї краплі." 
                        : "Цей сорт належить до групи суперхотів — екстремально гострих перців з рейтингом понад 1 000 000 SHU"}
                    </p>
                </div>
            </div>`;
        warningZone.style.display = 'block';
    } else {
        warningZone.style.display = 'none';
    }
    
    warningZone.innerHTML = warningHTML;
}

        
        // Рівень гостроти (якщо є)
        const heatTag = document.getElementById('product-heat');
        if (heatTag && product.heatLevel) {
            heatTag.innerText = product.heatLevel;
        }

        // ===== 3. ЦІНА =====
        const priceEl = document.getElementById('p-price');
        priceEl.setAttribute('data-val', product.price);
        
        // Для соусів показуємо просто ціну, для насіння - "/ 5 шт."
        if (product.category === 'sauces') {
            priceEl.innerHTML = `${product.price.toFixed(2)} ₴`;
        } else {
            priceEl.innerHTML = `${product.price.toFixed(2)} ₴ <span style="font-size: 16px; opacity: 0.6; font-weight: normal;">/ 5 шт.</span>`;
        }

        if (product.category === 'otherseeds') {
            priceEl.innerHTML = `${product.price.toFixed(2)} ₴ <span style="font-size: 16px; opacity: 0.6; font-weight: normal;">/ 15 шт.</span>`;
           }
        // ===== 4. ХАРАКТЕРИСТИКИ (таблиця) =====
        if (product.specs) {
            const specMaturity = document.getElementById('spec-maturity');
            const specHeight = document.getElementById('spec-height');
            const specSpecies = document.getElementById('spec-species');
            const specYield = document.getElementById('spec-yield'); // Додали нову змінну
            
            if (specMaturity) specMaturity.innerText = product.specs.maturity || "-";
            if (specHeight) specHeight.innerText = product.specs.height || "-";
            if (specSpecies) specSpecies.innerText = product.specs.species || "-";
            if (specYield) specYield.innerText = product.specs.yield || "-"; // Додали вивід
        }

        // ===== 5. МЕТА-ДАНІ (кількість, пакування, рік) =====
        if (product.meta) {
            const metaCount = document.getElementById('meta-count');
            const metaPack = document.getElementById('meta-pack');
            const metaYear = document.getElementById('meta-year');
            
            if (metaCount) metaCount.innerText = product.meta.count || "5 шт.";
            if (metaPack) metaPack.innerText = product.meta.pack || "Zip-lock";
            if (metaYear) metaYear.innerText = product.meta.year || "2026";
        }

        // ===== 6. ПОРАДА ПО ВИРОЩУВАННЮ (якщо є) =====
        const tipsEl = document.getElementById('product-tips');
        if (tipsEl && product.growTip) {
            tipsEl.style.display = 'block';
            const tipText = tipsEl.querySelector('i');
            if (tipText) {
    tipText.innerHTML = `<span class="tip-prefix">Поради від Homestead:</span> ${product.growTip}`;
}
        }

        // ===== 7. ГАЛЕРЕЯ ФОТОГРАФІЙ =====
        const mainImg = document.getElementById('main-view');
        const thumbsContainer = document.getElementById('gallery-thumbs');
        
        if (product.images && product.images.length > 0) {
            // Головне фото
            mainImg.src = product.images[0];
            mainImg.alt = product.name;

            // Генеруємо мініатюри
            thumbsContainer.innerHTML = product.images.map((imgSrc, index) => `
                <img src="${imgSrc}" 
                     alt="${product.name} ${index + 1}" 
                     class="thumb-img ${index === 0 ? 'active' : ''}" 
                     onclick="updateView(this); currentImgIndex = ${index};"
                >
            `).join('');
        }

        // ===== 8. ЗАПУСК АКЦІЙ (якщо активні) =====
        if (typeof applyGlobalSale === 'function') {
            applyGlobalSale();
        }

        // ===== 9. РЕКОМЕНДАЦІЇ В САЙДБАРІ =====
        const sideRecGrid = document.getElementById('sidebar-rec-grid');
        if (sideRecGrid) {
            const allIds = Object.keys(allProducts);
            const otherIds = allIds.filter(id => id !== productId);
            const randomIds = otherIds.sort(() => 0.5 - Math.random()).slice(0, 3);

            sideRecGrid.innerHTML = randomIds.map(id => {
                const item = allProducts[id];
                return `
                    <a href="product.html?id=${id}" style="text-decoration: none; color: inherit; display: block; margin-bottom: 25px;">
                        <div class="side-rec-card">
                            <img src="${item.images[0]}" style="width: 100%; height: 120px; object-fit: cover; border: 1px solid #33251e; margin-bottom: 8px;">
                            <h4 style="margin: 0; font-size: 13px; line-height: 1.2; opacity: 0.9;">${item.name}</h4>
                            <div class="side-rec-price">${item.price.toFixed(2)} ₴</div>
                        </div>
                    </a>
                `;
            }).join('');
        }

        // ===== 10. ВІДГУКИ (якщо є) =====
        const sideReviewsList = document.getElementById('sidebar-reviews-list');
        if (sideReviewsList && product.reviews) {
            if (product.reviews.length > 0) {
                sideReviewsList.innerHTML = product.reviews.map(rev => `
                    <div style="margin-bottom: 15px; background: rgba(255,255,255,0.02); padding: 10px; border-left: 2px solid var(--primary-orange);">
                        <div style="font-size: 12px; font-weight: bold; color: #eaddcf;">${rev.author}</div>
                        <p style="margin: 5px 0 0 0; font-size: 13px; font-style: italic; opacity: 0.7; line-height: 1.3;">
                            "${rev.text}"
                        </p>
                    </div>
                `).join('');
            } else {
                sideReviewsList.innerHTML = '<p style="font-size: 12px; opacity: 0.5;">Поки немає відгуків. Будьте першим!</p>';
            }
        }

    } else {
        // ===== ТОВАР НЕ ЗНАЙДЕНО =====
        document.querySelector('.product-page').innerHTML = 
            '<h2 style="grid-column: span 2; text-align: center; padding: 50px;">Товар не знайдено 😕 <br><a href="index.html" class="add-btn" style="display:inline-block; width:auto; margin-top:20px;">Повернутися в каталог</a></h2>';
    }
});

// ===== ФУНКЦІЯ ОНОВЛЕННЯ ГОЛОВНОГО ФОТО =====
function updateView(el) {
    const mainImg = document.getElementById('main-view');
    mainImg.src = el.src;
    
    // Прибираємо клас active з усіх мініатюр
    document.querySelectorAll('.thumb-img').forEach(t => t.classList.remove('active'));
    
    // Додаємо клас active на вибрану мініатюру
    el.classList.add('active');

            
    
}

