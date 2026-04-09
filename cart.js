﻿﻿﻿﻿﻿﻿﻿//БЛОК КЕРУВАННЯ АКЦІЯМИ.
const GLOBAL_SETTINGS = {
    isSaleActive: true, 
    discountPercent: 10, 
    saleDeadline: "2026-02-05", 
    promoText: "🔥 ГОТУЄМОСЯ ДО ВЕЛИКОГО ЗАПУСКУ ВОСЕНИ 2026!",
    // Щоб розблокувати — просто зробіть масив порожнім: lockedCategories: []  ЗАМІСТь "ГОТУЄМОСЯ..." promoText: "ПЕКЕЛЬНИЙ ТИЖДЕНЬ: -10% НА НАСІННЯ ТА СОУСИ!"
    lockedCategories: ['sauces', 'seeds', 'otherseeds'] 
};

const CART_CONSTANTS = {
    MAX_QTY: 100,           // Максимальна кількість товару
    MAX_NAME_LENGTH: 200,   // Максимальна довжина назви
    MAX_DISCOUNT: 0.35,     // Максимальна знижка (35%)
    MAX_ORDERS_PER_MINUTE: 5 // Rate limiting
};

// ===== НАЛАШТУВАННЯ НОВОЇ ПОШТИ =====
const NP_SETTINGS = { // Вставте сюди URL вашого розгорнутого Google Apps Script
    apiUrl: 'https://script.google.com/macros/s/AKfycbwOg7C3piQhwj1_AuO7y6sOvwywt9G7fCZ8txQhBd1T-oPjRGF9_V4N2IdYaHS9GluLBw/exec'
};

// ===== ФУНКЦІЯ ЗАХИСТУ ВІД XSS АТАК =====
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function sanitizeInput(text, maxLength = 100) {
    if (!text) return '';
    
    // 1. Конвертуємо в рядок
    text = String(text);
    
    // 2. Видаляємо HTML теги (більш надійний вираз)
    text = text.replace(/<\/?[^>]+(>|$)/g, "");
    
    // 3. Видаляємо потенційно небезпечні технічні символи, зберігаючи пунктуацію
    text = text.replace(/[<>\\]/g, '');
    
    // 4. Видаляємо зайві пробіли
    text = text.trim().replace(/\s+/g, ' ');
    
    // 5. Обмежуємо довжину
    text = text.substring(0, maxLength);
    
    return text;
}


// ===== ВАЛІДАЦІЯ ЦІН (ЗАХИСТ ВІД МАНІПУЛЯЦІЙ) =====
function validatePrice(productId, price) {
    if (typeof allProducts === 'undefined' || !allProducts[productId]) {
        console.warn('⚠️ Товар не знайдено:', productId);
        return price;
    }
    
    const product = allProducts[productId];
    const isSaleActive = GLOBAL_SETTINGS && GLOBAL_SETTINGS.isSaleActive && product.allowSale;
    const discount = isSaleActive ? GLOBAL_SETTINGS.discountPercent : 0;

    // Функція для розрахунку точної очікуваної ціни
    const calculateExpected = (base) => isSaleActive ? Math.round(base * (1 - discount / 100)) : base;

    let expectedPrices = [calculateExpected(product.price)];

    // Додаємо ціни версій насіння
    if (product.seedVersions) {
        Object.values(product.seedVersions).forEach(v => {
            expectedPrices.push(calculateExpected(v.price));
        });
    }

    // Тепер порівнюємо з точністю до 1 гривні (на випадок нюансів округлення)
    const isValid = expectedPrices.some(ep => Math.abs(price - ep) <= 1);

    if (!isValid) {
        console.warn('⚠️ Підозріла ціна для', productId);
        console.warn('   Дозволені варіанти:', expectedPrices);
        console.warn('   Отримано:', price);
        // Повертаємо стандартну акційну ціну, якщо валідація не пройшла
        return calculateExpected(product.price);
    }

    return price;
}

function applyGlobalSale() {
    if (!GLOBAL_SETTINGS || !GLOBAL_SETTINGS.isSaleActive) return;
    const discount = GLOBAL_SETTINGS.discountPercent;

    const cardPrices = document.querySelectorAll('.card-price');
    cardPrices.forEach(el => {
        const isSaleAllowed = el.getAttribute('data-allow-sale') === 'true';
        if (isSaleAllowed) {
            const basePrice = parseFloat(el.getAttribute('data-base-price'));
            if (!basePrice) return;
            const newPrice = Math.round(basePrice * (1 - discount / 100));
            el.innerHTML = `
                <span style="text-decoration: line-through; opacity: 0.5; font-size: 0.85em;">${basePrice} ₴</span> 
                <span class="sale-price">${newPrice} ₴</span>
            `;
            const card = el.closest('.product-card'); 
            if (card) {
                const cardBtn = card.querySelector('.add-btn');
                if (cardBtn) cardBtn.setAttribute('data-price', newPrice);
                if (!card.querySelector('.sale-badge')) {
                    const badge = document.createElement('div');
                    badge.className = 'sale-badge';
                    badge.innerText = 'АКЦІЯ';
                    card.style.position = 'relative';
                    card.appendChild(badge);
                }
            }
        }
    });

    // Застосовуємо знижку до головної сторінки товару ТІЛЬКИ якщо ми не на сторінці товару
    // (логіка сторінки товару обробляє знижки самостійно через product-page.js)
    if (typeof currentProductId === 'undefined' || currentProductId === null) {
        const mainPriceContainer = document.getElementById('p-price');
        const mainAddToCartBtn = document.querySelector('.add-btn');
        if (mainPriceContainer) {
            const isSaleAllowed = mainPriceContainer.getAttribute('data-allow-sale') === 'true';
            if (isSaleAllowed) {
                const basePrice = parseFloat(mainPriceContainer.getAttribute('data-val'));
                const newPrice = Math.round(basePrice * (1 - discount / 100));
                mainPriceContainer.innerHTML = `
                    <span style="text-decoration: line-through; opacity: 0.5; font-size: 0.8em; margin-right: 10px; color: white;">${basePrice.toFixed(2)} ₴</span>
                    <span class="sale-price">${newPrice.toFixed(2)} ₴</span>
                    <span style="font-size: 16px; opacity: 0.6; font-weight: normal;">/ 5 шт.</span>
                `;
                if (mainAddToCartBtn) mainAddToCartBtn.setAttribute('data-price', newPrice);
            } else if (mainAddToCartBtn) {
                mainAddToCartBtn.setAttribute('data-price', mainPriceContainer.getAttribute('data-val'));
            }
        }
    }

    if (GLOBAL_SETTINGS.promoText && !document.getElementById('sale-banner')) {
        const banner = document.createElement('div');
        banner.id = "sale-banner";
        banner.style.cssText = "background: #e74c3c; color: white; text-align: center; padding: 10px; font-weight: bold; position: sticky; top: 0; z-index: 1000; font-family: sans-serif;";
        banner.innerText = GLOBAL_SETTINGS.promoText;
        document.body.prepend(banner);
    }
}
document.addEventListener('DOMContentLoaded', applyGlobalSale);

// Функція для блокування категорій "Скоро у продажу"
function applyCategoryLock() {
    if (!GLOBAL_SETTINGS.lockedCategories || GLOBAL_SETTINGS.lockedCategories.length === 0) return;

    // 1. Блокуємо картки на головній сторінці
    GLOBAL_SETTINGS.lockedCategories.forEach(cat => {
        const links = document.querySelectorAll(`.card-link.${cat}`);
        links.forEach(link => {
            link.classList.add('is-locked');
            link.addEventListener('click', (e) => e.preventDefault());
        });
    });

    // 2. Перевіряємо, чи не зайшов користувач на заблоковану сторінку через URL
    const currentPath = window.location.pathname;
    const isLockedPage = (currentPath.includes('sauces.html') && GLOBAL_SETTINGS.lockedCategories.includes('sauces')) ||
                         (currentPath.includes('seedsandseedlings.html') && GLOBAL_SETTINGS.lockedCategories.includes('seeds')) ||
                         (currentPath.includes('otherseeds.html') && GLOBAL_SETTINGS.lockedCategories.includes('otherseeds'));

    if (isLockedPage) {
        window.location.href = 'index.html'; // Редирект на головну
    }
}

document.addEventListener('DOMContentLoaded', () => {
    applyGlobalSale();
    applyCategoryLock();
});

// === 1. РОБОТА З ПАМ'ЯТТЮ ===
function getFreshCart() {
    try { return JSON.parse(localStorage.getItem('homestead_cart')) || []; } 
    catch (e) { return []; }
}
function saveCart(cart) { localStorage.setItem('homestead_cart', JSON.stringify(cart)); }

// === 2. ОНОВЛЕННЯ ІНТЕРФЕЙСУ ===
function updateCartUI() {
    let cart = getFreshCart(); 

    // ✅ АВТО-ОЧИЩЕННЯ: Видаляємо товари, яких більше немає в базі (products.js)
    if (typeof allProducts !== 'undefined' && cart.length > 0) {
        const originalLength = cart.length;
        cart = cart.filter(item => {
            // Бандли (Box) з головної сторінки не внесені в products.js, тому їх не видаляємо
            if (item.productId && item.productId.startsWith('bundle_')) return true;
            
            // Перевіряємо наявність ID у глобальному об'єкті allProducts
            return !!allProducts[item.productId];
        });

        if (cart.length !== originalLength) {
            saveCart(cart);
            console.log('🛒 Кошик синхронізовано: видалено застарілі товари, яких немає в базі');
        }
    }

    const totalQty = cart.reduce((acc, item) => acc + item.qty, 0);
    const totalSum = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

    // Кешуємо елементи для продуктивності
    const cartCounts = document.querySelectorAll('.cart-count, #cart-count, .cart-badge');
    cartCounts.forEach(c => { c.innerText = totalQty; });

    const listContainers = document.querySelectorAll('#final-list, .cart-items-container');
    listContainers.forEach(container => {
        if (cart.length === 0) {
            container.innerHTML = '<p class="empty-cart-msg">Кошик порожній</p>';
        } else {
            const fragment = document.createDocumentFragment(); // Використовуємо фрагмент для продуктивності
            cart.forEach((item, index) => {
                // Перевіряємо, чи є стара ціна для відображення закреслення
                const hasDiscount = item.originalPrice && item.originalPrice > item.price;
                const priceDisplay = hasDiscount 
                    ? `<span style="text-decoration: line-through; opacity: 0.5; font-size: 0.85em; margin-right: 5px;">${parseFloat(item.originalPrice).toFixed(2)} ₴</span>${parseFloat(item.price).toFixed(2)} ₴`
                    : `${parseFloat(item.price).toFixed(2)} ₴`;
                
                // Перевірка на існування товару в базі (захист від видалених ID)
                const productData = (typeof allProducts !== 'undefined' && item.productId) 
                                    ? allProducts[item.productId] 
                                    : null;

                const imageUrl = (productData && productData.images && productData.images.length > 0) 
                                 ? productData.images[0] 
                                 : 'placeholder.webp'; // Запасне зображення

                // Використовуємо збережену назву з кошика (вона містить версію), 
                // або беремо з бази, або ставимо дефолтну заглушку
                const safeName = item.name || (productData ? productData.name : 'Товар');

                const itemDiv = document.createElement('div');
                itemDiv.className = 'cart-item';
                itemDiv.innerHTML = `
                    <div class="cart-item-image-wrapper">
                        <img src="${imageUrl}" alt="${escapeHtml(safeName)}" class="cart-item-img">
                    </div>
                    <div class="cart-item-info">
                        <div class="cart-item-name">${escapeHtml(safeName)}</div>
                        <div class="cart-item-details">
                            ${priceDisplay} 
                            <span style="opacity: 0.7; font-size: 0.9em;">
                                ${
                                    (item.name.toLowerCase().includes('соус') || item.name.toLowerCase().includes('sauce')) 
                                    ? '/ шт.' 
                                    : (item.name.toLowerCase().includes('box') || item.name.toLowerCase().includes('набір'))
                                    ? '/ за набір' 
                                    : '/ за пакет з насінням'
                                }
                            </span>
                        </div>
                    </div>
                    <div class="cart-item-actions">
                        <span class="cart-item-subtotal">${(parseFloat(item.price) * parseInt(item.qty)).toFixed(2)} ₴</span>
                        <div class="qty-stepper">
                            <button class="qty-btn qty-minus" onclick="changeQty(${index}, -1)" aria-label="Зменшити">−</button>
                            <span class="qty-value">${parseInt(item.qty)}</span>
                            <button class="qty-btn qty-plus" onclick="changeQty(${index}, +1)" aria-label="Збільшити">+</button>
                        </div>
                        <button class="cart-item-remove" onclick="removeFromCart(${index})" aria-label="Видалити товар">×</button>
                    </div>
                `;
                fragment.appendChild(itemDiv);
            });
            container.innerHTML = '';
            container.appendChild(fragment);
        }
    });

    document.querySelectorAll('#final-price, .total-price-display, #cart-total').forEach(priceEl => {
        priceEl.innerText = `${totalSum.toFixed(2)} ₴`;
    });

    // Ховаємо кнопку замовлення, якщо порожньо
    const orderBtn = document.querySelector('.order-btn');
    if (orderBtn) orderBtn.style.display = (cart.length === 0) ? 'none' : 'block';
}

// === 3. КЕРУВАННЯ КОШИКОМ ===
window.openCheckout = function() {
    const cart = getFreshCart();
    if (cart.length === 0) {
        alert("Ваш кошик ще порожній! 🌶️");
        return;
    }
    const modal = document.getElementById('checkoutModal');
    if (modal) {
        modal.style.display = 'flex';
        document.getElementById('modal-main-content').style.display = 'grid';
        document.getElementById('success-msg').style.display = 'none';
        
        // Автозаповнення збережених даних
        const fields = ['name', 'phone', 'city', 'branch', 'email', 'delivery', 'city_ref'];
        fields.forEach(f => {
            const val = localStorage.getItem('saved_' + f);
            if (!val) return;
            
            if (f === 'city_ref') {
                const cityEl = document.getElementById('cust-city');
                if (cityEl) cityEl.dataset.ref = val;
                return;
            }
            
            // ✅ ФІКС: Заповнюємо видиме поле відділення теж
            if (f === 'branch') {
                const branchVisible = document.getElementById('cust-branch-input');
                if (branchVisible) branchVisible.value = val;
            }

            const el = document.getElementById(f === 'email' ? 'email' : 'cust-' + f);
            if (el) el.value = val;
        });
        updateCartUI();
        initDeliveryOptions(); // Ініціалізація логіки доставки
    }
};

let isDeliveryInitialized = false;
let currentCityBranches = [];
let lastSelectedCity = "";
let lastSelectedCityRef = "";
let isLocked = false;
let debounceTimeout;
let currentDeliveryType = ""; // Додаємо змінну для відстеження поточного типу доставки

const cleanForSearch = (str) => {
    if (!str) return "";
    return str.toLowerCase()
        .replace(/[^a-zа-яіїєґ0-9]/gi, ' ') 
        .replace(/\s+/g, ' ')               
        .trim();
};

// ───────────────────────────────────────────────────────────────
// ГОЛОВНА ФУНКЦІЯ ІНІЦІАЛІЗАЦІЇ
// ───────────────────────────────────────────────────────────────
function initDeliveryOptions() {
    const cityInput = document.getElementById('cust-city');
    const branchInput = document.getElementById('cust-branch-input');
    const branchLabel = document.querySelector('#branch-group label');
    const deliverySelect = document.getElementById('cust-delivery');
    const branchSuggestions = document.getElementById('branch-suggestions');
    const citySuggestions = document.getElementById('city-suggestions');
    const branchHidden = document.getElementById('cust-branch'); // Приховане поле для Nova Poshta Ref

    if (!deliverySelect || !cityInput || !branchInput || !branchLabel) return;

    // Оновлення UI для типу доставки
    const updateBranchUI = () => {
        currentDeliveryType = deliverySelect.value;

        // Скидаємо стилі помилок
        cityInput.classList.remove('input-error');
        branchInput.classList.remove('input-error');

        // Приховуємо підказки за замовчуванням
        citySuggestions.style.display = 'none';
        branchSuggestions.style.display = 'none';

        // Логіка для Нової Пошти
        if (currentDeliveryType.includes("Нова Пошта")) {
            branchLabel.innerText = (currentDeliveryType === "Кур'єр НП")
                ? "Адреса доставки (вулиця, будинок, квартира)"
                : "Відділення або поштомат (номер чи адреса)";
            branchInput.placeholder = (currentDeliveryType === "Кур'єр НП")
                ? "Наприклад: вул. Шевченка 1, кв. 10"
                : "Введіть номер або назву...";
            cityInput.placeholder = "Наприклад: Київ";
            cityInput.disabled = false;
            branchInput.disabled = (currentDeliveryType !== "Кур'єр НП" && !cityInput.dataset.ref); // Блокуємо відділення, якщо місто не обрано
        }
        // Логіка для Укрпошти
        else if (currentDeliveryType === "Укрпошта") {
            branchLabel.innerText = "Адреса доставки (вулиця, будинок, квартира, індекс)";
            branchInput.placeholder = "Наприклад: вул. Центральна 1, кв. 5, 01001";
            cityInput.placeholder = "Наприклад: Київ";
            cityInput.disabled = false;
            branchInput.disabled = false;
            // Для Укрпошти не використовуємо Nova Poshta API, тому приховуємо підказки
            citySuggestions.style.display = 'none';
            branchSuggestions.style.display = 'none';
        }
    };

    // ✅ ФІКС: Автозавантаження відділень при старті
    const checkAutoLoad = async () => {
        if (!cityInput || !cityInput.value.trim()) return;
        
        const cityRef = cityInput.dataset.ref;
        
        // Якщо є збережений ref і місто
        if (cityRef && cityRef !== "") {
            console.log('🔄 Автозавантаження відділень для:', cityInput.value);
            lastSelectedCity = cityInput.value;
            lastSelectedCityRef = cityRef;
            await loadWarehouses(cityRef);
        }
    };

    // ✅ ФІКС: Перевіряємо чи вже ініціалізовано
    if (isDeliveryInitialized) {
        updateBranchUI();
        checkAutoLoad(); // Викликаємо тільки після ініціалізації
        return;
    }

    if (deliverySelect) deliverySelect.addEventListener('change', updateBranchUI);
    updateBranchUI();

    // ───────────────────────────────────────────────────────────────
    // ПОШУК МІСТА
    // ───────────────────────────────────────────────────────────────

    const triggerCitySearch = async (query) => {
        // Додаємо перевірку блокування на початку функції
        if (currentDeliveryType !== "Відділення НП" && currentDeliveryType !== "Поштомат НП") {
            citySuggestions.style.display = 'none';
            return; // Не шукаємо міста, якщо не Нова Пошта
        }


        if (isLocked || !query) {
            console.log('🔒 Пошук заблокований');
            return;
        }

        const cleanedQuery = cleanForSearch(query);
        const cleanedLast = cleanForSearch(lastSelectedCity);

        // Якщо вже вибране це місто — не шукаємо
        if (cleanedQuery === cleanedLast && cityInput.dataset.ref) {
            citySuggestions.style.display = 'none';
            return;
        }

        if (query.length < 1) {
            citySuggestions.style.display = 'none';
            return;
        }

        // Показуємо лоадер
        citySuggestions.innerHTML = '<div class="np-item np-loading">Шукаємо місто... 🔍</div>';
        citySuggestions.style.display = 'block';

        try {
            const response = await fetch(NP_SETTINGS.apiUrl, {
                method: 'POST',
                mode: 'cors',
                redirect: 'follow',
                headers: {
                    'Content-Type': 'text/plain'
                },
                body: JSON.stringify({
                    modelName: "Address",
                    calledMethod: "searchSettlements",
                    methodProperties: { 
                        CityName: query, 
                        Limit: 8 // Збільшено з 5 до 8
                    }
                })
            });

            const data = await response.json();

            // ✅ ФІКС: Перевіряємо чи поле ще активне
            if (cityInput.value.trim() === "") {
                citySuggestions.style.display = 'none';
                return;
            }

            if (data.success && data.data[0]?.Addresses && data.data[0].Addresses.length > 0) {
                citySuggestions.innerHTML = data.data[0].Addresses.map(addr => `
                    <div class="np-item" data-ref="${escapeHtml(addr.DeliveryCity)}">
                        ${escapeHtml(addr.Present)}
                    </div>
                `).join('');
                citySuggestions.style.display = 'block';
            } else {
                citySuggestions.innerHTML = '<div class="np-item np-empty">Місто не знайдено 😕 Спробуйте змінити мову або перевірте правопис.</div>';
                citySuggestions.style.display = 'block';
            }
        } catch (error) {
            console.error('❌ Помилка пошуку міста:', error);
            citySuggestions.innerHTML = '<div class="np-item np-error">Помилка підключення</div>';
            citySuggestions.style.display = 'block';
        }
    };

    // ✅ ПОКРАЩЕНО: Input handler з дебаунсом
    cityInput.addEventListener('input', (e) => {
        if (currentDeliveryType !== "Відділення НП" && currentDeliveryType !== "Поштомат НП") {
            cityInput.dataset.ref = ""; // Скидаємо ref, якщо переключились з НП
            return;
        }

        if (isLocked) return;
        
        clearTimeout(debounceTimeout);
        const query = e.target.value.trim();
        
        // ✅ ФІКС: Скидаємо вибір тільки якщо текст РЕАЛЬНО змінився
        const currentClean = cleanForSearch(query);
        const lastClean = cleanForSearch(lastSelectedCity);
        
        if (currentClean !== lastClean) {
            cityInput.dataset.ref = "";
            lastSelectedCity = "";
            lastSelectedCityRef = "";
            // Очищаємо відділення при зміні міста
            currentCityBranches = [];
            branchInput.value = "";
            branchHidden.value = "";
            branchSuggestions.style.display = 'none';
        }

        // ✅ ПОКРАЩЕНО: Дебаунс 200мс замість 150мс
        debounceTimeout = setTimeout(async () => {
            await triggerCitySearch(query);
        }, 200);
    });

    // ✅ ПОКРАЩЕНО: Показуємо список при фокусі
    cityInput.addEventListener('focus', () => {
        if (currentDeliveryType !== "Відділення НП" && currentDeliveryType !== "Поштомат НП") {
            citySuggestions.style.display = 'none';
            return;
        }

        if (isLocked) return;
        
        const val = cityInput.value.trim();
        const cleanedVal = cleanForSearch(val);
        const cleanedLast = cleanForSearch(lastSelectedCity);
        
        // Якщо вже є вибране місто — показуємо підказку
        if (cleanedVal.length >= 1 && cleanedVal === cleanedLast && cityInput.dataset.ref) {
            citySuggestions.innerHTML = `<div class="np-item np-info">✅ Обрано: ${escapeHtml(lastSelectedCity)}</div>`;
            citySuggestions.style.display = 'block';
            setTimeout(() => {
                citySuggestions.style.display = 'none';
            }, 2000);
        } else if (val.length >= 1) {
            // Якщо є текст але не вибране — шукаємо
            triggerCitySearch(val);
        }
    });

    // ✅ ПОКРАЩЕНО: Вибір міста
    citySuggestions.addEventListener('click', async (e) => {
        if (currentDeliveryType !== "Відділення НП" && currentDeliveryType !== "Поштомат НП") {
            citySuggestions.style.display = 'none';
            return;
        }

        const item = e.target.closest('.np-item');
        if (!item || item.classList.contains('np-loading') || 
            item.classList.contains('np-empty') || 
            item.classList.contains('np-error') ||
            item.classList.contains('np-info')) {
            return;
        }

        e.stopPropagation();
        
        // 0. Миттєво скасовуємо будь-який запланований пошук
        clearTimeout(debounceTimeout);

        // ✅ ФІКС: Блокуємо надійно
        isLocked = true;
        clearTimeout(debounceTimeout);
        console.log('🔒 Місто вибрано, блокуємо інтерфейс');

        const cityRef = item.getAttribute('data-ref');
        const fullTitle = item.innerText.trim();

        if (!cityRef) {
            console.error('❌ Не знайдено ref для міста');
            isLocked = false;
            return;
        }

        // 1. Оновлюємо UI МИТТЄВО
        cityInput.dataset.ref = cityRef;
        cityInput.value = fullTitle;
        lastSelectedCity = fullTitle;
        lastSelectedCityRef = cityRef;
        citySuggestions.innerHTML = '';
        citySuggestions.style.display = 'none';

        // 2. Очищаємо поле відділення
        branchInput.value = '';
        branchHidden.value = '';
        currentCityBranches = [];
        
        // 3. Показуємо лоадер у placeholder
        const isCourier = deliverySelect?.value === "Кур'єр НП";
        branchInput.placeholder = isCourier 
            ? 'Вулиця, будинок...' 
            : 'Завантаження відділень... ⏳';
        
        // 4. Переводимо фокус
        branchInput.focus();

        // 5. Завантажуємо відділення
        await loadWarehouses(cityRef);
        
        // ✅ ФІКС: Розблокуємо через більший інтервал
        setTimeout(() => {
            isLocked = false;
            console.log('🔓 Інтерфейс розблоковано');
        }, 600); // Збільшено з 500мс
    });

    // ───────────────────────────────────────────────────────────────
    // ПОШУК ВІДДІЛЕННЯ
    // ───────────────────────────────────────────────────────────────

    // ✅ ПОКРАЩЕНО: Input handler
    branchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();

        // Синхронізуємо з прихованим полем
        branchHidden.value = e.target.value;

        // Якщо не Нова Пошта або кур'єрська доставка НП — не показуємо список відділень
        if (currentDeliveryType === "Укрпошта" || currentDeliveryType === "Кур'єр НП") {
            branchSuggestions.style.display = 'none';
            return;
        }
        // Якщо місто не обрано для НП відділення/поштомат
        if (!cityInput.dataset.ref && (currentDeliveryType === "Відділення НП" || currentDeliveryType === "Поштомат НП")) {
            branchSuggestions.innerHTML = '<div class="np-item np-info">Спочатку оберіть місто ⬆️</div>';
            return;
        }

        // Показуємо відфільтровані відділення
        renderBranchSuggestions(query.toLowerCase());
    });

    // ✅ ПОКРАЩЕНО: Показуємо список при фокусі
    branchInput.addEventListener('focus', () => {
        // Якщо не Нова Пошта або кур'єрська доставка НП — не показуємо список відділень
        if (currentDeliveryType === "Укрпошта" || currentDeliveryType === "Кур'єр НП") {
            return;
        }

        const val = branchInput.value.trim();

        // ✅ ФІКС: Показуємо список навіть якщо пусте поле
        if (currentCityBranches.length > 0) {
            renderBranchSuggestions(val.toLowerCase()); // Показуємо всі, якщо поле пусте
        } else if (cityInput.value.trim() !== "" && !lastSelectedCity) {
            // Підказка що треба спочатку обрати місто
            branchSuggestions.innerHTML = '<div class="np-item np-info">Спочатку оберіть місто ⬆️</div>';
            branchSuggestions.style.display = 'block';
            setTimeout(() => {
                branchSuggestions.style.display = 'none';
            }, 2000);
        }
    });

    // ✅ ПОКРАЩЕНО: Вибір відділення
    branchSuggestions.addEventListener('click', (e) => {
        // Якщо не Нова Пошта або кур'єрська доставка НП — не реагуємо
        if (currentDeliveryType === "Укрпошта" || currentDeliveryType === "Кур'єр НП") {
            return;
        }

        const item = e.target.closest('.np-item');
        if (!item || item.classList.contains('np-empty') || 
            item.classList.contains('np-info')) {
            return;
        }

        const branchName = item.innerText.trim();
        branchInput.value = branchName;
        branchHidden.value = branchName;
        branchSuggestions.style.display = 'none';
    });

    // ✅ ПОКРАЩЕНО: Рендеринг списку відділень
    function renderBranchSuggestions(query) {
        // Захист від Укрпошти та кур'єрської доставки НП
        if (currentDeliveryType === "Укрпошта" || currentDeliveryType === "Кур'єр НП") {
            branchSuggestions.style.display = 'none';
            return;
        }

        if (currentCityBranches.length === 0) {
            branchSuggestions.style.display = 'none';
            return;
        }

        const searchWords = cleanForSearch(query).split(' ').filter(w => w.length > 0);

        const filtered = currentCityBranches.filter(b => {
            if (searchWords.length === 0) return true;
            const cleanDesc = cleanForSearch(b.Description);
            return searchWords.every(word => cleanDesc.includes(word));
        }).slice(0, 20); // Збільшено з 15 до 20

        if (filtered.length > 0) {
            branchSuggestions.innerHTML = filtered.map(b => `
                <div class="np-item">
                    ${escapeHtml(b.Description)}
                </div>
            `).join('');
            branchSuggestions.style.display = 'block';
        } else if (searchWords.length > 0) {
            branchSuggestions.innerHTML = '<div class="np-item np-empty">Нічого не знайдено</div>';
            branchSuggestions.style.display = 'block';
        } else {
            branchSuggestions.style.display = 'none';
        }
    }

    // ───────────────────────────────────────────────────────────────
    // ЗАВАНТАЖЕННЯ ВІДДІЛЕНЬ
    // ───────────────────────────────────────────────────────────────

    async function loadWarehouses(cityRef) {
        console.log('📦 Завантаження відділень для ref:', cityRef);

        if (currentDeliveryType === "Укрпошта" || currentDeliveryType === "Кур'єр НП") {
            currentCityBranches = []; // Очищаємо, якщо переключились
            return;
        }
        
        try {
            const response = await fetch(NP_SETTINGS.apiUrl, {
                method: 'POST',
                mode: 'cors',
                redirect: 'follow',
                headers: {
                    'Content-Type': 'text/plain'
                },
                body: JSON.stringify({
                    modelName: "Address",
                    calledMethod: "getWarehouses",
                    methodProperties: { 
                        CityRef: cityRef,
                        Limit: 500 // Завантажуємо всі відділення
                    }
                })
            });

            const data = await response.json();

            if (data.success && data.data && data.data.length > 0) {
                currentCityBranches = data.data;
                console.log(`✅ Завантажено ${data.data.length} відділень`);
                
                branchInput.placeholder = 'Введіть номер або адресу';
                
                // ✅ ФІКС: Автоматично показуємо список якщо поле активне
                const isNotCourier = currentDeliveryType !== "Кур'єр НП";
                const isFocused = document.activeElement === branchInput;
                
                if (isNotCourier && isFocused) {
                    setTimeout(() => {
                        renderBranchSuggestions(branchInput.value.toLowerCase().trim());
                    }, 100);
                }
            } else {
                currentCityBranches = [];
                branchInput.placeholder = 'Відділень не знайдено';
                console.warn('⚠️ Відділення не знайдено для міста');
            }
        } catch (error) {
            console.error('❌ Помилка завантаження відділень:', error);
            currentCityBranches = [];
            branchInput.placeholder = 'Помилка завантаження';
        }
    }

    // ───────────────────────────────────────────────────────────────
    // ГЛОБАЛЬНІ ОБРОБНИКИ
    // ───────────────────────────────────────────────────────────────

    // Закриття списків при кліку поза ними
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.form-group')) {
            citySuggestions.style.display = 'none';
            branchSuggestions.style.display = 'none';
        }
    });

    // Закриття на ESC
    document.addEventListener('keydown', (e) => {
        // Не закриваємо підказки, якщо не Нова Пошта
        if (currentDeliveryType === "Укрпошта") {
            return;
        }

        if (e.key === 'Escape') {
            citySuggestions.style.display = 'none';
            branchSuggestions.style.display = 'none';
            // Також знімаємо фокус
            if (document.activeElement === cityInput || document.activeElement === branchInput) {
                document.activeElement.blur();
            }
        }
    });

    // ✅ НОВИНКА: Навігація стрілками у списку
    const handleArrowNavigation = (e, suggestions) => {
        // Не навігуємо, якщо не Нова Пошта
        if (currentDeliveryType === "Укрпошта") {
            return;
        }

        const items = Array.from(suggestions.querySelectorAll('.np-item:not(.np-loading):not(.np-empty):not(.np-error):not(.np-info)'));
        if (items.length === 0) return;

        const activeItem = suggestions.querySelector('.np-item.keyboard-active');
        let currentIndex = activeItem ? items.indexOf(activeItem) : -1;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            currentIndex = (currentIndex + 1) % items.length;
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            currentIndex = currentIndex <= 0 ? items.length - 1 : currentIndex - 1;
        } else if (e.key === 'Enter' && activeItem) {
            e.preventDefault();
            activeItem.click();
            return;
        }

        items.forEach(item => item.classList.remove('keyboard-active'));
        if (currentIndex >= 0) {
            items[currentIndex].classList.add('keyboard-active');
            items[currentIndex].scrollIntoView({ block: 'nearest' });
        }
    };

    cityInput.addEventListener('keydown', (e) => {
        if (['ArrowDown', 'ArrowUp', 'Enter'].includes(e.key)) {
            handleArrowNavigation(e, citySuggestions);
        }
    });

    branchInput.addEventListener('keydown', (e) => {
        if (['ArrowDown', 'ArrowUp', 'Enter'].includes(e.key)) {
            handleArrowNavigation(e, branchSuggestions);
        }
    });

    // ───────────────────────────────────────────────────────────────
    // ЗАВЕРШЕННЯ ІНІЦІАЛІЗАЦІЇ
    // ───────────────────────────────────────────────────────────────

    isDeliveryInitialized = true;
    console.log('✅ Нова Пошта ініціалізована');
    
    // ✅ ФІКС: Викликаємо автозавантаження тільки після повної ініціалізації
    setTimeout(() => {
        checkAutoLoad();
    }, 100);
}

window.closeCheckout = function() {
    const modal = document.getElementById('checkoutModal');
    if (modal) modal.style.display = 'none';
};

window.removeFromCart = function(index) {
    let cart = getFreshCart();
    cart.splice(index, 1);
    saveCart(cart);
    updateCartUI();
    if (cart.length === 0) closeCheckout();
};

// +/- кількість у модалці
window.changeQty = function(index, delta) {
    let cart = getFreshCart();
    if (!cart[index]) return;

    const newQty = cart[index].qty + delta;

    if (newQty <= 0) {
        if (!confirm(`Видалити «${cart[index].name}» з кошика?`)) return;
        cart.splice(index, 1);
    } else {
        // ✅ НОВЕ: Використання константи
        cart[index].qty = Math.min(newQty, CART_CONSTANTS.MAX_QTY);
    }

    saveCart(cart);
    updateCartUI();
    if (cart.length === 0) closeCheckout();
};

// Універсальна функція додавання
window.addToCart = function(productId, price, name, qty = 1, originalPrice = null) {
    let cart = getFreshCart();
    
    // ✅ НОВЕ: Sanitize назви
    const safeName = sanitizeInput(name, CART_CONSTANTS.MAX_NAME_LENGTH);
    
    // ✅ НОВЕ: Використання константи
    const validatedPrice = validatePrice(productId, parseFloat(price));
    const validatedQty = Math.max(1, Math.min(CART_CONSTANTS.MAX_QTY, parseInt(qty)));
    
    // Шукаємо існуючий товар
    const existing = cart.find(item => {
        if (productId && item.productId && item.productId === productId) {
            return item.name.toLowerCase().trim() === safeName.toLowerCase().trim();
        }
        return item.name.toLowerCase().trim() === safeName.toLowerCase().trim();
    });

    if (existing) {
        // ✅ НОВЕ: Використання константи
        existing.qty = Math.min(existing.qty + validatedQty, CART_CONSTANTS.MAX_QTY);
        existing.price = validatedPrice;
        existing.originalPrice = originalPrice;
        if (productId && !existing.productId) {
            existing.productId = productId;
        }
    } else {
        cart.push({ 
            productId: productId, 
            name: safeName,
            price: validatedPrice, 
            originalPrice: originalPrice,
            qty: validatedQty 
        });
    }
    
    saveCart(cart);
    updateCartUI();

    // Відстеження додавання в кошик для аналізу воронки продажів
    if (typeof gtag === 'function') {
        gtag('event', 'add_to_cart', {
            items: [{
                item_id: productId,
                item_name: safeName,
                price: validatedPrice,
                quantity: validatedQty
            }]
        });
    }
};


// 1. Для сторінки товару (product.html)
window.pushToCart = function() {
    if (typeof currentProductId === 'undefined') {
        console.error('currentProductId не визначено');
        return;
    }
    const priceContainer = document.getElementById('p-price');
    const addBtn = document.querySelector('.add-btn');
    const qtyEl = document.getElementById('p-qty');

    if (!priceContainer) return;

    // Отримуємо ID товару
    const productId = typeof currentProductId !== 'undefined' ? currentProductId : null;
    
    // БЕРЕМО НАЗВУ З БАЗИ (як у каталозі), а не з екрана
    let name = (productId && typeof allProducts !== 'undefined' && allProducts[productId]) 
               ? allProducts[productId].name 
               : document.getElementById('p-name').innerText;

    // 🔥 НОВЕ: ДОДАЄМО ВЕРСІЮ НАСІННЯ ДО НАЗВИ
    const versionKey = addBtn.getAttribute('data-version');
    if (versionKey && productId && typeof allProducts !== 'undefined' && allProducts[productId].seedVersions) {
        const versionData = allProducts[productId].seedVersions[versionKey];
        if (versionData && versionData.label) {
            name = `${name} (${versionData.label})`; // Вийде: "Zebrange (Ізольоване)"
        }
    }

    const isAllowed = priceContainer.getAttribute('data-allow-sale') === 'true';
    // Беремо БАЗОВУ ціну (без знижки) з атрибуту data-val
    const originalPrice = parseFloat(priceContainer.getAttribute('data-val'));
    
    const price = isAllowed && addBtn.hasAttribute('data-price') 
                  ? parseFloat(addBtn.getAttribute('data-price')) 
                  : originalPrice;
    
    const qty = parseInt(qtyEl.value) || 1;
    
    addToCart(productId, price, name, qty, originalPrice);
    alert("Додано у кошик! 🌶️");
};

window.addToCartDirectly = function(productId, buttonElement) {
    try {
        const card = buttonElement.closest('.product-card');
        if (!card) throw new Error("Картку товару не знайдено");

        // 1. БЕРЕМО НАЗВУ З БАЗИ (products.js)
        let actualName = (typeof allProducts !== 'undefined' && allProducts[productId]) 
                         ? allProducts[productId].name 
                         : productId;

        // 2. ШУКАЄМО ЦІНУ НА КАРТЦІ (щоб врахувати акцію)
        const priceElement = card.querySelector('.card-price');
        if (!priceElement) throw new Error("Ціну на картці не знайдено");

        const rawText = priceElement.innerText;
        // Шукаємо число з можливим десятковим знаком (125 або 125.50)
        const priceMatch = rawText.match(/[\d]+(?:[.,][\d]{1,2})?(?=\s*₴)/);
        const cleanPrice = priceMatch ? parseFloat(priceMatch[0].replace(',', '.')) : 0;

        if (isNaN(cleanPrice)) throw new Error("Не вдалося розпізнати ціну");
        // Отримуємо базову ціну для закреслення
        const basePrice = parseFloat(priceElement.getAttribute('data-base-price'));
        // 3. ДОДАЄМО В КОШИК через універсальну функцію
        // Це гарантує правильний пошук і об'єднання товарів
        addToCart(productId, cleanPrice, actualName, 1, basePrice);
        
        alert(`🌶️ ${actualName} додано!`);

    } catch (error) {
        console.error("Помилка додавання:", error.message);
        alert("Помилка додавання товару. Спробуйте ще раз.");
    }
};

window.clearFullCart = function() {
    if (confirm("Видалити всі товари з кошика?")) {
        saveCart([]); // Очищаємо масив у пам'яті
        updateCartUI(); // Оновлюємо всі цифри та списки на сторінці
        closeCheckout(); // Закриваємо модалку, бо купувати нічого
    }
};
// ===== ГЕНЕРАТОР НОМЕРА ЗАМОВЛЕННЯ =====
function generateOrderNumber() {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0'); // Додаємо день (наприклад, 06)
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Місяць (02)
    const year = String(now.getFullYear()).slice(-2); // 26
    // 4 випадкові символи (цифри та букви) у верхньому регістрі
    const unique = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `HS-${day}${month}${year}-${unique}`;
}
const rateLimiter = {
    attempts: [],
    
    canSubmit() {
        const now = Date.now();
        const oneMinuteAgo = now - 60000; // 60 секунд
        
        // Видаляємо старі спроби
        this.attempts = this.attempts.filter(time => time > oneMinuteAgo);
        
        // Перевіряємо ліміт
        if (this.attempts.length >= CART_CONSTANTS.MAX_ORDERS_PER_MINUTE) {
            return false;
        }
        
        // Додаємо нову спробу
        this.attempts.push(now);
        return true;
    },
    
    reset() {
        this.attempts = [];
    }
};
// === 4. ВІДПРАВКА ЗАМОВЛЕННЯ ===
window.submitOrder = async function() {
    // ✅ НОВЕ: Rate limiting
    if (!rateLimiter.canSubmit()) {
        alert("Забагато спроб відправки. Зачекайте хвилину.");
        return;
    }
    
    // Honeypot перевірка (залишається як є)
    const honeypot = document.getElementById('website_url');
    if (honeypot && honeypot.value !== '') {
        console.warn('🤖 Бот виявлено');
        alert("Дякуємо за замовлення!");
        closeCheckout();
        return;
    }
    
    // Отримуємо поля
    const fields = {
        name: document.getElementById('cust-name'),
        phone: document.getElementById('cust-phone'),
        delivery: document.getElementById('cust-delivery'),
        city: document.getElementById('cust-city'),
        branch: document.getElementById('cust-branch'), // приховане поле для ID/повного тексту
        branchInput: document.getElementById('cust-branch-input') // видиме текстове поле
    };

    // 1. СИНХРОНІЗАЦІЯ ПЕРЕД ВАЛІДАЦІЄЮ
    // Якщо приховане поле порожнє, але у видимому щось є - копіюємо (на випадок ручного вводу)
    if (fields.branch && fields.branchInput && !fields.branch.value.trim()) {
        fields.branch.value = fields.branchInput.value.trim();
    }

    let hasError = false;

    // Очищаємо попередні помилки
    Object.values(fields).forEach(el => el && el.classList?.remove('input-error'));
    if (fields.branchInput) fields.branchInput.classList.remove('input-error');

    // ✅ НОВЕ: Sanitize усіх полів
    const sanitizedData = {};
    
    for (let key in fields) {
        const field = fields[key];
        if (!field) continue;
        
        const value = field.value.trim();
        
        // Перевірка на порожнечу
        if (!value) {
            // Якщо помилка в прихованому полі відділення — підсвічуємо видиме поле
            if (key === 'branch' && fields.branchInput) {
                fields.branchInput.classList.add('input-error');
            } else if (field.classList) {
                field.classList.add('input-error');
            }
            hasError = true;
            continue;
        }
        
        // Sanitize (крім телефону — його перевіряємо окремо)
        if (key !== 'phone') {
            const maxLen = key === 'name' ? 50 : 100;
            sanitizedData[key] = sanitizeInput(value, maxLen);
            field.value = sanitizedData[key]; // Оновлюємо поле
        } else {
            sanitizedData[key] = value; // Телефон перевіряємо нижче
        }
    }
    function validatePhone(phone) {
    if (!phone) return false;
    
    // 1. Очищаємо від усіх зайвих символів
    const cleaned = phone.replace(/[\s\(\)\-]/g, '');
    
    // 2. Перевіряємо формат: +380XXXXXXXXX або 0XXXXXXXXX
    // Дозволяємо +380, 380, 80 або просто 0 на початку
    const phoneRegex = /^(?:\+?38)?(?:0|80)\d{9}$/;
    
    return phoneRegex.test(cleaned);
}

function cleanPhone(phone) {
    if (!phone) return '';
    
    // Очищаємо і повертаємо у форматі +380XXXXXXXXX
    const cleaned = phone.replace(/[\s\(\)\-]/g, '');
    
    // Якщо починається з 0 — додаємо +38
    if (cleaned.startsWith('0')) {
        return '+38' + cleaned;
    }
    
    // Якщо вже є +38 — повертаємо як є
    if (cleaned.startsWith('+38')) {
        return cleaned;
    }
    
    return cleaned;
}


    // ✅ НОВЕ: Покращена валідація телефону
    if (fields.phone) {
        if (!validatePhone(fields.phone.value)) {
            alert("Некоректний номер телефону.\nПриклад: 0951234567 або +380951234567");
            fields.phone.classList.add('input-error');
            hasError = true;
        } else {
            // Очищаємо і форматуємо телефон
            const cleanedPhone = cleanPhone(fields.phone.value);
            fields.phone.value = cleanedPhone;
            sanitizedData.phone = cleanedPhone;
        }
    }

    // Email валідація (якщо заповнений)
    const emailEl = document.getElementById('email');
    if (emailEl && emailEl.value.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailEl.value.trim())) {
            alert("Будь ласка, введіть коректний email");
            emailEl.classList.add('input-error');
            hasError = true;
        } else {
            // ✅ НОВЕ: Sanitize email
            sanitizedData.email = sanitizeInput(emailEl.value.trim(), 100);
            emailEl.value = sanitizedData.email;
        }
    }

    // 2. ПЕРЕВІРКА ОБРАНОГО МІСТА (чи вибрано з АПІ)
    const cityInput = document.getElementById('cust-city'); // Поле міста
    if (cityInput) {
        const cityRef = cityInput.dataset.ref;
        if (currentDeliveryType.includes("Нова Пошта") && (!cityRef || cityRef === "" || cityInput.value.trim() !== lastSelectedCity.trim())) {
            alert("Будь ласка, оберіть місто саме зі списку підказок 📍\nЦе необхідно для правильної реєстрації доставки.");
            cityInput.classList.add('input-error');
            hasError = true;
        }
    }

    // 3. ПЕРЕВІРКА ВМІСТУ ВІДДІЛЕННЯ (Захист від неповних даних)
    const branchVal = fields.branch.value.trim().toLowerCase();
    const deliveryType = fields.delivery.value;

    if (deliveryType.includes("Нова Пошта") && deliveryType !== "Кур'єр НП" && (branchVal === 'поштомат' || branchVal === 'відділення' || branchVal.length < 3)) {
        alert("Будь ласка, вкажіть конкретний номер або адресу відділення/поштомату Нової Пошти 🏢");
        if (fields.branchInput) fields.branchInput.classList.add('input-error');
        hasError = true;
    }
    // Валідація для Укрпошти: просто перевіряємо, що поле адреси не порожнє
    else if (deliveryType === "Укрпошта" && branchVal.length < 5) { // Мінімальна довжина адреси
        alert("Будь ласка, вкажіть повну адресу доставки для Укрпошти (вулиця, будинок, квартира, індекс) 📮");
        // Підсвічуємо поле cust-branch-input, яке використовується для адреси
        if (fields.branchInput) fields.branchInput.classList.add('input-error');
        hasError = true;
    }

    if (hasError) {
        return;
    }

    // --- Далі йде ваш код відправки (він робочий) ---
    const submitBtn = document.querySelector('.checkout-summary .order-btn');
    if (!submitBtn) { console.error('submitOrder: кнопку order-btn не знайдено'); return; }
    const originalText = submitBtn.innerHTML;
    // 🔥 ГЕНЕРАТОР КРАСИВИЙ НОМЕР
    const orderID = generateOrderNumber();
    const cart = getFreshCart();
    const totalSum = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

    submitBtn.disabled = true;
    submitBtn.classList.add('btn-loading'); // Додаємо клас для стилів
    submitBtn.innerHTML = `Відправляємо...`;

    // Збір даних
    const orderData = {
        id: orderID, 
        name: fields.name.value.trim(),
        phone: fields.phone.value.trim(),
        delivery: fields.delivery.value.trim(),
        city: fields.city.value.trim(), // Місто завжди беремо з cust-city
        // Для Укрпошти branch буде повною адресою, для НП - відділенням/адресою
        branch: (deliveryType === "Укрпошта")
            ? fields.branchInput.value.trim() // Для Укрпошти беремо з видимого поля
            : fields.branch.value.trim(), // Для НП беремо з прихованого (або видимого, якщо кур'єр)


        email: document.getElementById('email')?.value.trim() || "-",
        comment: (document.getElementById('cust-comment')?.value.trim() || "").substring(0, 500),
        secret_token: "summerof26"
    };

    // Зберігаємо в пам'ять для наступного разу
    localStorage.setItem('saved_name', orderData.name);
    localStorage.setItem('saved_phone', orderData.phone);
    localStorage.setItem('saved_delivery', orderData.delivery);
    localStorage.setItem('saved_city', orderData.city); // Зберігаємо місто
    localStorage.setItem('saved_city_ref', fields.city.dataset.ref || '');
    localStorage.setItem('saved_branch', orderData.branch);

    /// 4. Формуємо повідомлення для Telegram
    let orderText = `🌶️ НОВЕ ЗАМОВЛЕННЯ: ${orderData.id}\n`;
    orderText += `👤 ${orderData.name}\n📞 ${orderData.phone}\n`;
    orderText += `🚚 Доставка: ${orderData.delivery}\n`;
    orderText += `📍 ${orderData.city}, ${orderData.branch}\n`;
    if (orderData.email !== "-") orderText += `📧 ${orderData.email}\n`;
    if (orderData.comment) orderText += `💬 Коментар: ${orderData.comment}\n`;
    orderText += `\n🛒 Товари:\n`;
    orderText += cart.map(i => `- ${i.name} (${i.price}₴) x ${i.qty}`).join("\n");
    orderText += `\n\n💰 РАЗОМ: ${totalSum.toFixed(2)} ₴`;

    try {
        const response = await fetch("https://script.google.com/macros/s/AKfycbzeU2e3mHS9_lsKkHsPfRY-c187RgYgrlF-0cXK2jTrwBvQCTFWGTivv24NHNcmpru_/exec", {
            method: "POST",
            mode: "cors", 
            redirect: "follow",
            cache: 'no-cache', 
            headers: { "Content-Type": "text/plain" },
            body: JSON.stringify({ 
                id: orderData.id,
                message: orderText,       
                email: orderData.email,   
                name: orderData.name,
                phone: orderData.phone,    // Додав телефон (зайвим не буде)
                total: totalSum,           // Додав суму окремим полем для логів
                cart: cart,                // Передаємо масив товарів для чека в імейлі
                secret_token: "summerof26"
            })
        });

        // Якщо ми тут і mode: "cors", значить запит пройшов успішно
        if (!response.ok) {
            throw new Error(`Сервер повернув помилку: ${response.status}`);
        }

        // Відстеження успішної покупки в Google Analytics 4
        if (typeof gtag === 'function') {
            gtag('event', 'purchase', {
                transaction_id: orderData.id,
                value: totalSum,
                currency: 'UAH',
                items: cart.map(item => ({
                    item_id: item.productId || item.name,
                    item_name: item.name,
                    price: item.price,
                    quantity: item.qty
                }))
            });
        }

        // Показ екрану успіху
        document.getElementById('modal-main-content').style.display = 'none';
        const successMsg = document.getElementById('success-msg');
        if (successMsg) {
            successMsg.style.display = 'block';
            const orderDisplay = document.getElementById('orderNumberDisplay');
            if (orderDisplay) orderDisplay.innerText = orderData.id;
        }
        saveCart([]);
        updateCartUI();
        console.log("Замовлення відправлено успішно!");

    } catch (e) {
        console.error("Помилка відправки:", e);
        // Специфічна перевірка для CORS помилок, які часто виникають з Google Scripts
        if (e.message.includes('Failed to fetch') || e.message.includes('NetworkError')) {
            alert("Помилка мережі або CORS. Перевірте з'єднання. Якщо проблема повторюється — напишіть нам у месенджер! 🌐");
        } else {
            alert("Помилка сервера. Спробуйте ще раз або напишіть нам у месенджер 🌶️");
        }
    } finally {
        submitBtn.disabled = false;
        submitBtn.classList.remove('btn-loading'); // Прибираємо клас затухання
        submitBtn.innerHTML = originalText;
    }
};

// Код генерації каталогу перенесено в catalog.js
// (щоб уникнути дублювання функцій)

// === ГАЛЕРЕЯ ТА ЗАПУСК ===
let currentImgIndex = 0; // Додаємо індекс для відстеження фото

function updateView(img) {
    const mainView = document.getElementById('main-view');
    if (mainView) {
        mainView.src = img.src;
        document.querySelectorAll('.thumb-img').forEach(t => t.classList.remove('active'));
        img.classList.add('active');
    }
}

// ОСЬ ЦЯ ФУНКЦІЯ ПОВЕРНУЛАСЯ ДЛЯ СТРІЛОЧОК:
window.changeImage = function(dir) {
    const thumbs = document.querySelectorAll('.thumb-img');
    if (thumbs.length > 0) {
        // Рахуємо наступний або попередній індекс
        currentImgIndex = (currentImgIndex + dir + thumbs.length) % thumbs.length;
        // Оновлюємо головне фото
        updateView(thumbs[currentImgIndex]);
    }
};

// === 5. ВІДПРАВКА ВІДГУКУ (НОВЕ) ===
window.sendReview = async function() {
    const honey = document.getElementById('rev-honey')?.value;
    if (honey) return; // Якщо поле заповнене — це бот
    // 1. Знаходимо кнопку та дані
    const btn = document.querySelector('#review-form-section .add-btn-aside');
    const author = document.getElementById('rev-author')?.value.trim().substring(0, 100);
    const text = document.getElementById('rev-text')?.value.trim().substring(0, 1000);
    const prodName = document.getElementById('p-name')?.innerText || "Невідомий товар";

    // Перевірка
    if (!author || !text) {
        alert("Заповніть, будь ласка, ім'я та текст відгуку ✍️");
        return;
    }

    // 2. Візуальне блокування кнопки
    const originalText = btn.innerText;
    btn.disabled = true;
    btn.classList.add('btn-loading');
    btn.innerText = "Надсилаємо...";
    btn.style.opacity = "0.6";
    btn.style.cursor = "not-allowed";

    const reviewText = `💬 НОВИЙ ВІДГУК!\n📦 Товар: ${prodName}\n👤 Автор: ${author}\n📝 Текст: ${text}`;

    try {
        // 3. Реальна відправка
        await fetch("https://script.google.com/macros/s/AKfycbzbBRpcgSGY2llXEN5MbmwmbfwiI6SwIlI9QU7XkqXm7lrFX61xt-pnZ0-f-IP9Zd3Y/exec", {
            method: "POST",
            mode: "cors",
            redirect: "follow",
            headers: { "Content-Type": "text/plain" },
            body: JSON.stringify({ message: reviewText })
        });

        // 4. Успіх: міняємо вигляд кнопки
        btn.innerText = "Дякуємо! Надіслано 😊";
        btn.style.background = "#325e34"; 
        btn.style.opacity = "1";

        // Очищаємо поля
        document.getElementById('rev-author').value = '';
        document.getElementById('rev-text').value = '';

        // 5. Повертаємо кнопку в норму через 5 секунд
        setTimeout(() => {
            btn.disabled = false;
            btn.classList.remove('btn-loading');
            btn.innerText = originalText;
            btn.style.background = ""; 
            btn.style.cursor = "pointer";
        }, 5000);

    } catch (e) {
        console.error("Помилка відправки відгуку:", e);
        alert("Помилка відправки. Напишіть нам у Telegram!");
    }
};

document.addEventListener('DOMContentLoaded', updateCartUI);
window.addEventListener('pageshow', updateCartUI);

function goBack() {
    if (window.history.length > 1) {
        window.history.back();
    } else {
        window.location.href = 'index.html';
    }
}
