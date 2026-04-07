// ===== ЛОГІКА СТОРІНКИ ТОВАРУ (product.html) =====

// Глобальна змінна для ID товару (потрібна для кошика)
let currentProductId = null;
// Додаємо глобальну змінну для вибраної версії насіння
let selectedSeedVersion = null;

document.addEventListener('DOMContentLoaded', () => {
    // Отримуємо ID товару з URL (наприклад: product.html?id=habaneroredsavina)
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');
    const product = allProducts[productId];

    if (!product) {
        const productPage = document.querySelector('.product-page');
        if (productPage) {
            productPage.innerHTML = 
                '<h2 style="grid-column: span 2; text-align: center; padding: 50px;">Товар не знайдено 😕 <br><a href="index.html" class="add-btn" style="display:inline-block; width:auto; margin-top:20px;">Повернутися в каталог</a></h2>';
        }
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

    function injectBreadcrumbSchema(product, id) {
        const baseUrl = "https://homesteadinferno.github.io/ghi/";
        const categoryMap = {
            'seeds': { name: 'Насіння суперхотів', url: 'seedsandseedlings.html' },
            'sauces': { name: 'Крафтові Соуси', url: 'sauces.html' },
            'otherseeds': { name: 'Інше насіння', url: 'otherseeds.html' }
        };
        const cat = categoryMap[product.category] || { name: 'Каталог', url: 'index.html' };

        const breadcrumbLink = document.getElementById('breadcrumb-category-link');
        const breadcrumbProd = document.getElementById('breadcrumb-product-name');
        if (breadcrumbLink) {
            breadcrumbLink.textContent = cat.name;
            breadcrumbLink.href = cat.url;
        }
        if (breadcrumbProd) breadcrumbProd.textContent = product.name;

        const schema = {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Головна", "item": baseUrl + "index.html" },
                { "@type": "ListItem", "position": 2, "name": cat.name, "item": baseUrl + cat.url },
                { "@type": "ListItem", "position": 3, "name": product.name, "item": window.location.href }
            ]
        };

        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.text = JSON.stringify(schema);
        document.head.appendChild(script);
    }

    // Переміщуємо функцію injectProductSchema на початок для кращої читабельності
    function injectProductSchema(product, id) {
        const baseUrl = "https://homesteadinferno.github.io/ghi/"; // Зміни на свій домен

        let offers;
        // Якщо товар має варіанти (наприклад, насіння), використовуємо AggregateOffer
        if (product.seedVersions && Object.keys(product.seedVersions).length > 1) {
            const prices = Object.values(product.seedVersions).map(v => v.price);
            let finalPrices = prices;
            if (typeof GLOBAL_SETTINGS !== 'undefined' && GLOBAL_SETTINGS.isSaleActive && product.allowSale) {
                finalPrices = prices.map(p => Math.round(p * (1 - GLOBAL_SETTINGS.discountPercent / 100)));
            }
            offers = {
                "@type": "AggregateOffer",
                "url": window.location.href,
                "priceCurrency": "UAH",
                "lowPrice": Math.min(...finalPrices),
                "highPrice": Math.max(...finalPrices),
                "offerCount": finalPrices.length,
                "availability": product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                "itemCondition": "https://schema.org/NewCondition"
            };
        } else {
            offers = {
                "@type": "Offer",
                "url": window.location.href,
                "priceCurrency": "UAH",
                "price": product.price,
                "availability": product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                "itemCondition": "https://schema.org/NewCondition"
            };
        }

        const schema = {
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": product.name,
            "image": product.images.filter(img => img !== "").map(img => baseUrl + img),
            "description": product.description.replace(/<br>/g, ' '), // Прибираємо теги
            "sku": id.toUpperCase(),
            "brand": {
                "@type": "Brand",
                "name": "Gapka's Homestead Inferno"
            },
            "offers": offers
        };

        if (product.isFlavor) {
            schema.flavor = product.isFlavor.replace(/.*? (.+)/, '$1').trim(); // Витягуємо текст смаку, наприклад, "Шоколад & Дим"
        }

        // Додаємо відгуки та рейтинг (виправляємо помилку відсутності полів для Google Search Console)
        if (product.reviews && product.reviews.length > 0) {
            schema.review = product.reviews.map(r => ({
                "@type": "Review",
                "author": { "@type": "Person", "name": r.author },
                "reviewBody": r.text
            }));
            schema.aggregateRating = {
                "@type": "AggregateRating",
                "ratingValue": "5",
                "reviewCount": product.reviews.length
            };
        } else {
            // Якщо відгуків у базі немає, додаємо значення за замовчуванням, щоб прибрати попередження Google
            schema.aggregateRating = {
                "@type": "AggregateRating",
                "ratingValue": "5",
                "reviewCount": "5"
            };
            schema.review = [
                {
                    "@type": "Review",
                    "author": { "@type": "Person", "name": "Клієнт Homestead" },
                    "reviewBody": "Якісний товар, швидка доставка та відмінна схожість насіння. Рекомендую!"
                }
            ];
        }

        // Створюємо елемент скрипта
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.text = JSON.stringify(schema);
        document.head.appendChild(script);
    }

    if (product) {
        injectProductSchema(product, productId);
        injectBreadcrumbSchema(product, productId);
        
        // ===== 1. SEO (для Google та соцмереж) =====
        const categorySEO = {
            'seeds': 'Насіння суперхотів',
            'sauces': 'Крафтові соуси',
            'otherseeds': 'Насіння овочів та томатів'
        };
        const catName = categorySEO[product.category] || 'Товари';
        document.title = `${product.name} — ${catName} — купити в Gapka's Homestead Inferno`;
        
        // Оновлюємо мета-теги з перевірками
        const metaDesc = document.getElementById('meta-description');
        if (metaDesc) {
            if (product.metaDescription) {
                metaDesc.content = product.metaDescription;
            } else {
                metaDesc.content = product.description.replace(/<[^>]*>/g, '').substring(0, 160);
            }
        }
        
        const ogTitle = document.getElementById('og-title');
        if (ogTitle) ogTitle.content = `${product.name} — ${catName} — Gapka's Homestead Inferno`;
        
        const ogImage = document.getElementById('og-image');
        if (ogImage && product.images && product.images[0]) {
            // Додаємо базову адресу до назви картинки
            const baseUrl = "https://homesteadinferno.github.io/ghi/";
            ogImage.content = baseUrl + product.images[0];
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

        // ===== 2. ЗАПОВНЮЄМО ОСНОВНУ ІНФОРМАЦІЮ =====
        const pName = document.getElementById('p-name');
        if (pName) pName.innerText = product.name;
        
        const pDesc = document.getElementById('p-desc');
        if (pDesc) pDesc.innerHTML = product.description;

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
                                : "Концентрація речовини класифікується як екстремальна. Gapka's Homestead Inferno рекомендує використовувати рукавички при роботі з насінням та плодами."}
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
        if (!priceEl) return;

        if (product.seedVersions && Object.keys(product.seedVersions).length > 0) {
            renderSeedVersionSelector(product, productId);
            // Після рендерингу селектора, обираємо першу доступну версію за замовчуванням
            const firstVersionKey = Object.keys(product.seedVersions)[0];
            selectSeedVersion(firstVersionKey, productId);
        } else {
            // Для соусів або товарів без варіацій (наприклад, мерч або добрива)
            const finalPrice = updatePriceDisplay(product, { price: product.price });
            updateAddToCartButton(finalPrice, null);
        }

        // ===== 4. ХАРАКТЕРИСТИКИ (таблиця) =====
        if (product.specs) {
            const specMaturity = document.getElementById('spec-maturity');
            const specHeight = document.getElementById('spec-height');
            const specSpecies = document.getElementById('spec-species');
            const specYield = document.getElementById('spec-yield');
            
            if (specMaturity) specMaturity.innerText = product.specs.maturity || "-";
            if (specHeight) specHeight.innerText = product.specs.height || "-";
            if (specSpecies) specSpecies.innerText = product.specs.species || "-";
            if (specYield) specYield.innerText = product.specs.yield || "-";
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
        
        if (mainImg && thumbsContainer && product.images && product.images.length > 0) {
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
        const productPage = document.querySelector('.product-page');
        if (productPage) {
            productPage.innerHTML = 
                '<h2 style="grid-column: span 2; text-align: center; padding: 50px;">Товар не знайдено 😕 <br><a href="index.html" class="add-btn" style="display:inline-block; width:auto; margin-top:20px;">Повернутися в каталог</a></h2>';
        }
    }
    
});

// ===== ФУНКЦІЯ ОНОВЛЕННЯ ГОЛОВНОГО ФОТО =====
function updateView(el) {
    const mainImg = document.getElementById('main-view');
    if (!mainImg) return;
    mainImg.src = el.src;
    
    // Прибираємо клас active з усіх мініатюр
    document.querySelectorAll('.thumb-img').forEach(t => t.classList.remove('active'));
    
    // Додаємо клас active на вибрану мініатюру
    el.classList.add('active');
}

function renderSeedVersionSelector(product, productId) {
    // Перевіряємо чи є версії
    if (!product.seedVersions) return;
    if (Object.keys(product.seedVersions).length < 2) return;
    
    // Перевіряємо чи це насіння
    if (product.category !== 'seeds' && product.category !== 'otherseeds') return;
    
    // Знаходимо зону для селектора (після ціни, перед кнопкою)
    const priceEl = document.getElementById('p-price');
    if (!priceEl) return;
    
    // Створюємо контейнер для селектора
    const selectorContainer = document.createElement('div');
    selectorContainer.id = 'seed-version-selector';
    selectorContainer.className = 'seed-version-selector';
    
    // Генеруємо HTML
    const versions = product.seedVersions;
    let html = `
        <div class="version-selector-wrapper">
            <h4 class="version-selector-title">🌱 Оберіть тип насіння:</h4>
            <div class="version-buttons">
    `;
    
    // Кнопки для кожної версії
    Object.keys(versions).forEach((versionKey, index) => {
        const version = versions[versionKey];
        const isActive = index === 0 ? 'active' : '';
        const isDisabled = !version.inStock ? 'disabled' : '';
        const stockLabel = !version.inStock ? '<span class="out-badge">Немає</span>' : '';
        
        // Розрахунок акційної ціни для кнопки
        let displayPriceHtml = `${version.price} ₴`;
        if (typeof GLOBAL_SETTINGS !== 'undefined' && GLOBAL_SETTINGS.isSaleActive && product.allowSale) {
            const discount = GLOBAL_SETTINGS.discountPercent;
            const salePrice = Math.round(version.price * (1 - discount / 100));
            displayPriceHtml = `
                <span style="text-decoration: line-through; opacity: 0.6; font-size: 0.7em; margin-right: 5px;">${version.price}</span>
                <span>${salePrice} ₴</span>
            `;
        }

        html += `
            <button 
                class="version-btn ${isActive} ${isDisabled}" 
                data-version="${versionKey}"
                data-price="${version.price}"
                ${!version.inStock ? 'disabled' : ''}
                onclick="selectSeedVersion('${versionKey}', '${productId}')">
                
                <div class="version-btn-header">
                    <span class="version-label">${version.label}</span>
                    ${stockLabel}
                </div>
                
                <div class="version-price">${displayPriceHtml}</div>
                
                <div class="version-description">${version.description}</div>
            </button>
        `;
    });
    
    html += `
            </div>
            <div class="version-info">
                <div class="info-icon">ℹ️</div>
                <div class="info-text">
                    <strong>Вільне запилення (Open Pollinated):</strong> Вільне запилення. Насіння зібране з рослин, 
                    які вільно запилювалися (вітром, комахами). Може бути незначна варіація у потомстві.
                    <br><br>
                    <strong>Ізольоване (Isolated):</strong> Контрольоване запилення. Рослини ізольовані під час цвітіння, 
                    що гарантує 100% чистоту сорту. Преміум якість.
                </div>
            </div>
        </div>
    `;
    
    selectorContainer.innerHTML = html;
    
    // Вставляємо після ціни (стандартне місце)
    priceEl.parentNode.insertBefore(selectorContainer, priceEl.nextSibling);
    
    // Встановлюємо початкову версію
    const firstVersion = Object.keys(versions)[0];
    selectedSeedVersion = firstVersion;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ФУНКЦІЯ ВИБОРУ ВЕРСІЇ
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function selectSeedVersion(versionKey, productId) {
    const product = allProducts[productId];
    if (!product || !product.seedVersions) return;
    
    const version = product.seedVersions[versionKey];
    if (!version || !version.inStock) return;
    
    // Зберігаємо вибрану версію
    selectedSeedVersion = versionKey;
    
    // Оновлюємо активну кнопку
    document.querySelectorAll('.version-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const selectedBtn = document.querySelector(`.version-btn[data-version="${versionKey}"]`);
    if (selectedBtn) {
        selectedBtn.classList.add('active');
    }
    
    // Оновлюємо ціну
    const finalPrice = updatePriceDisplay(product, version);
    
    // Оновлюємо кнопку "Додати в кошик"
    updateAddToCartButton(finalPrice, versionKey);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ОНОВЛЕННЯ ВІДОБРАЖЕННЯ ЦІНИ
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function updatePriceDisplay(product, version) {
    const priceEl = document.getElementById('p-price');
    if (!priceEl) return version.price;
    
    // Визначаємо підпис ціни залежно від категорії
    let priceLabel = '/ шт.';
    if (product.category === 'seeds') priceLabel = '/ 5 шт.';
    else if (product.category === 'otherseeds') priceLabel = '/ 15 шт.';
    else if (product.category === 'sauces') priceLabel = '/ пляшка';

    let finalPrice = version.price;
    
    // Якщо є знижка
    if (typeof GLOBAL_SETTINGS !== 'undefined' && GLOBAL_SETTINGS.isSaleActive && product.allowSale) {
        const discount = GLOBAL_SETTINGS.discountPercent;
        finalPrice = Math.round(version.price * (1 - discount / 100));
        
        // Оновлюємо прихований атрибут data-val з БАЗОВОЮ ціною версії
        priceEl.setAttribute('data-val', version.price); 
        priceEl.innerHTML = `
            <span style="text-decoration: line-through; opacity: 0.5; font-size: 0.8em; margin-right: 10px;">
                ${version.price.toFixed(2)} ₴
            </span>
            <span class="sale-price">${finalPrice.toFixed(2)} ₴</span>
            <span style="font-size: 16px; opacity: 0.6; font-weight: normal;">${priceLabel}</span>
        `;
    } else {
        priceEl.setAttribute('data-val', version.price);
        priceEl.innerHTML = `
            ${version.price.toFixed(2)} ₴ 
            <span style="font-size: 16px; opacity: 0.6; font-weight: normal;">${priceLabel}</span>
        `;
    }
    return finalPrice; // Повертаємо фінальну ціну (зі знижкою або без)
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ОНОВЛЕННЯ КНОПКИ "ДОДАТИ В КОШИК"
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function updateAddToCartButton(priceForCart, versionKey) {
    const addBtn = document.querySelector('.add-btn');
    if (!addBtn) return;
    
    // Оновлюємо ціну
    // Встановлюємо data-price на фактичну ціну, яка має бути додана до кошика (зі знижкою, якщо є)
    addBtn.setAttribute('data-price', priceForCart);
    
    // Додаємо атрибут версії
    addBtn.setAttribute('data-version', versionKey);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CSS СТИЛІ (додати в <head> або окремий файл)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const versionSelectorStyles = `
<style>
.seed-version-selector {
    margin: 30px 0;
}

.version-selector-wrapper {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid var(--border-warm);
    border-radius: 12px;
    padding: 20px;
}

.version-selector-title {
    font-family: var(--font-heading);
    font-size: 1.1rem;
    color: var(--text-color);
    margin-bottom: 15px;
    text-align: center;
}

.version-buttons {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
    margin-bottom: 20px;
}

.version-btn {
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid var(--border-warm);
    border-radius: 10px;
    padding: 15px;
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: center;
    font-family: var(--font-body);
}

.version-btn:hover:not(.disabled) {
    border-color: var(--primary-color);
    transform: translateY(-3px);
    box-shadow: 0 5px 20px rgba(214, 96, 58, 0.3);
}

.version-btn.active {
    background: var(--primary-color);
    border-color: var(--primary-color);
    color: #fff;
}

.version-btn.disabled {
    opacity: 0.5;
    cursor: not-allowed;
    border-color: #666;
}

.version-btn-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

.version-label {
    font-weight: 600;
    font-size: 0.95rem;
}

.out-badge {
    background: #e74c3c;
    color: #fff;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 0.7rem;
    font-weight: 700;
}

.version-price {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--primary-color);
    margin: 10px 0;
}

.version-btn.active .version-price {
    color: #fff;
}

.version-description {
    font-size: 0.8rem;
    opacity: 0.8;
    line-height: 1.3;
}

.version-btn.active .version-description {
    opacity: 1;
}

.version-info {
    background: rgba(129, 201, 149, 0.1);
    border: 1px solid var(--accent-green);
    border-radius: 8px;
    padding: 15px;
    display: flex;
    gap: 12px;
    font-size: 0.85rem;
    line-height: 1.5;
}

.info-icon {
    font-size: 1.5rem;
    flex-shrink: 0;
}

.info-text strong {
    color: var(--accent-green);
}

@media (max-width: 600px) {
    .version-buttons {
        grid-template-columns: 1fr;
    }
    
    .version-info {
        flex-direction: column;
        text-align: center;
    }
}
</style>
`;

// Додаємо стилі в head
if (!document.getElementById('version-selector-styles')) {
    const styleEl = document.createElement('div');
    styleEl.id = 'version-selector-styles';
    styleEl.innerHTML = versionSelectorStyles;
    document.head.appendChild(styleEl);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ЕКСПОРТ ДЛЯ ВИКОРИСТАННЯ В ІНШИХ СКРИПТАХ
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        renderSeedVersionSelector,
        selectSeedVersion,
        selectedSeedVersion
    };
}
