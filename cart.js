//БЛОК КЕРУВАННЯ АКЦІЯМИ.
const GLOBAL_SETTINGS = {
    isSaleActive: false, 
    discountPercent: 10, 
    saleDeadline: "2026-02-05", 
    promoText: "ПЕКЕЛЬНИЙ ТИЖДЕНЬ: -10% НА НАСІННЯ ТА СОУСИ!"
};

const CART_CONSTANTS = {
    MAX_QTY: 100,           // Максимальна кількість товару
    MAX_NAME_LENGTH: 200,   // Максимальна довжина назви
    MAX_DISCOUNT: 0.35,     // Максимальна знижка (35%)
    MAX_ORDERS_PER_MINUTE: 5 // Rate limiting
};

// ===== НАЛАШТУВАННЯ НОВОЇ ПОШТИ =====
const NP_SETTINGS = { // Вставте сюди URL вашого розгорнутого Google Apps Script
    apiUrl: 'https://script.google.com/macros/s/AKfycbxNB2OUb--HMte2S_9oQmIYN8Fl_V-NcaBpUAiHx0xeJTxWeLKV1x8C0ZFZUyTDS0mL/exec'
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

// === 1. РОБОТА З ПАМ'ЯТТЮ ===
function getFreshCart() {
    try { return JSON.parse(localStorage.getItem('homestead_cart')) || []; } 
    catch (e) { return []; }
}
function saveCart(cart) { localStorage.setItem('homestead_cart', JSON.stringify(cart)); }

// === 2. ОНОВЛЕННЯ ІНТЕРФЕЙСУ ===
function updateCartUI() {
    const cart = getFreshCart(); 
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

                const itemDiv = document.createElement('div');
                itemDiv.className = 'cart-item';
                itemDiv.innerHTML = `
                    <div class="cart-item-info">
                        <div class="cart-item-name">${escapeHtml(item.name)}</div>
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
        initNovaPoshta(); // Ініціалізація логіки НП
    }
};

// --- Логіка Нової Пошти ---
let isNPInitialized = false;
// Виносимо змінні у вищий масштаб, щоб вони були доступні при повторних викликах
let currentCityBranches = [];
let lastSelectedCity = "";
let isLocked = false;
let debounceTimeout;

// ✅ Переміщуємо допоміжні функції вгору, щоб вони були доступні завжди
const cleanForSearch = (str) => {
    if (!str) return "";
    return str.toLowerCase()
        .replace(/[^a-zа-яіїєґ0-9]/gi, ' ') 
        .replace(/\s+/g, ' ')               
        .trim();
};

function initNovaPoshta() {
    const cityInput = document.getElementById('cust-city');
    const branchInput = document.getElementById('cust-branch-input');
    const branchLabel = document.querySelector('#branch-group label');
    const deliverySelect = document.getElementById('cust-delivery');
    const branchSuggestions = document.getElementById('branch-suggestions');
    const citySuggestions = document.getElementById('city-suggestions');
    const branchHidden = document.getElementById('cust-branch');

    const updateBranchUI = () => {
        if (!deliverySelect || !branchLabel || !branchInput) return;
        const isCourier = deliverySelect.value === "Кур'єр НП";
        branchLabel.innerText = isCourier ? "Адреса доставки (вулиця, будинок, квартира)" : "Відділення або поштомат (номер чи адреса)";
        branchInput.placeholder = isCourier ? "Наприклад: вул. Шевченка 1, кв. 10" : "Введіть номер або назву...";
        if (isCourier && branchSuggestions) branchSuggestions.style.display = 'none';
    };

    // Функція для автоматичного завантаження відділень при старті
    const checkAutoLoad = () => {
        if (cityInput && cityInput.value && cityInput.dataset.ref) {
            if (cityInput.value !== lastSelectedCity || currentCityBranches.length === 0) {
                lastSelectedCity = cityInput.value;
                loadWarehouses(cityInput.dataset.ref);
            }
        }
    };

    if (isNPInitialized) {
        updateBranchUI();
        checkAutoLoad();
        return;
    }

    if (deliverySelect) deliverySelect.addEventListener('change', updateBranchUI);
    updateBranchUI();

    if (!cityInput || !branchInput) return;

    // Функція для показу списку міст при фокусі або введенні
    const triggerCitySearch = async (query) => {
        if (isLocked) return;

        const cleanedQuery = cleanForSearch(query);
        const cleanedLast = cleanForSearch(lastSelectedCity);

        if (cleanedQuery === cleanedLast || cleanedQuery === "") {
            citySuggestions.style.display = 'none';
            return;
        }
        if (query.length < 1) {
            citySuggestions.style.display = 'none';
            return;
        }

        // Показуємо статус завантаження
        citySuggestions.innerHTML = '<div class="np-item">Шукаємо місто... 🔍</div>';
        citySuggestions.style.display = 'block';

        // Логіка запиту (винесена для перевикористання)
        const response = await fetch(NP_SETTINGS.apiUrl, {
            method: 'POST',
            body: JSON.stringify({
                modelName: "Address",
                calledMethod: "searchSettlements",
                methodProperties: { CityName: query, Limit: 5 }
            })
        });
        const data = await response.json();

        // Перевіряємо, чи юзер не встиг стерти текст, поки чекав відповідь
        if (cityInput.value.trim() === "") {
            citySuggestions.style.display = 'none';
            return;
        }

        if (data.success && data.data[0]?.Addresses && data.data[0].Addresses.length > 0) {
            citySuggestions.innerHTML = data.data[0].Addresses.map(addr => `
                <div class="np-item" data-ref="${addr.DeliveryCity}" data-name="${addr.MainDescription}" data-full="${addr.Present}">
                    ${addr.Present}
                </div>
            `).join('');
            citySuggestions.style.display = 'block';
        } else {
            citySuggestions.innerHTML = '<div class="np-item">Місто не знайдено 😕</div>';
        }
    };

    cityInput.addEventListener('input', (e) => {
        if (isLocked) return;
        clearTimeout(debounceTimeout);
        const query = e.target.value.trim();
        
        // Скидаємо вибір тільки якщо текст реально змінився
        if (cleanForSearch(query) !== cleanForSearch(lastSelectedCity)) {
            cityInput.dataset.ref = "";
            lastSelectedCity = "";
        }

        debounceTimeout = setTimeout(async () => {
            await triggerCitySearch(query);
        }, 150);
    });

    // Показуємо список при кліку на поле, якщо там вже щось введено
    cityInput.addEventListener('focus', () => {
        if (isLocked) return;
        const val = cityInput.value.trim();
        if (val.length >= 1 && val !== lastSelectedCity) triggerCitySearch(val);
    });

    citySuggestions.addEventListener('click', async (e) => {
        const item = e.target.closest('.np-item');
        if (!item) return;

        e.stopPropagation();
        isLocked = true; // 🛡️ Блокуємо будь-які спрацювання search поки ми в процесі
        clearTimeout(debounceTimeout);

        const { ref: cityRef, name: cityName, full: fullTitle } = item.dataset;

        // 1. Оновлюємо UI миттєво
        cityInput.dataset.ref = cityRef;
        cityInput.value = fullTitle;
        lastSelectedCity = fullTitle;
        citySuggestions.innerHTML = '';
        citySuggestions.style.display = 'none';

        // 2. Готуємо поле відділення
        branchInput.value = '';
        branchHidden.value = '';
        branchInput.placeholder = (deliverySelect?.value === "Кур'єр НП") ? 'Вулиця, будинок...' : 'Завантаження відділень... ⏳';
        currentCityBranches = [];
        
        branchInput.focus(); 

        // 3. Завантажуємо та знімаємо блок через паузу
        await loadWarehouses(cityRef);
        setTimeout(() => { isLocked = false; }, 500); 
    });

    // --- Пошук по відділеннях (фільтрація локального списку) ---
    branchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        
        // ✅ СИНХРОНІЗАЦІЯ: Якщо користувач пише вручну, оновлюємо приховане поле
        branchHidden.value = e.target.value;

        if (deliverySelect && deliverySelect.value !== "Кур'єр НП") {
            renderBranchSuggestions(query);
        }
    });

    // Показуємо всі варіанти при фокусі, якщо місто вже вибрано
    branchInput.addEventListener('focus', () => {
        const val = branchInput.value.toLowerCase().trim();
        
        if (deliverySelect && deliverySelect.value === "Кур'єр НП") return;

        if (currentCityBranches.length > 0) {
            renderBranchSuggestions(val);
        } else if (cityInput.value.trim() !== "" && !lastSelectedCity) {
            // Не забираємо фокус силою, просто нагадуємо
            citySuggestions.style.display = 'none';
        }
    });

    branchSuggestions.addEventListener('click', (e) => {
        const item = e.target.closest('.np-item');
        if (!item) return;

        const branchName = item.dataset.name;
        branchInput.value = branchName;
        branchHidden.value = branchName;
        branchSuggestions.style.display = 'none';
    });

    function renderBranchSuggestions(query) {
        // Захист: якщо обрано кур'єра, ніколи не показуємо список підказок
        if (deliverySelect && deliverySelect.value === "Кур'єр НП") {
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
            // Перевіряємо, чи кожне слово з запиту є в описі відділення
            return searchWords.every(word => cleanDesc.includes(word));
        }).slice(0, 15);

        if (filtered.length > 0) {
            branchSuggestions.innerHTML = filtered.map(b => `
                <div class="np-item" data-name="${b.Description}">
                    ${b.Description}
                </div>
            `).join('');
            branchSuggestions.style.display = 'block';
        } else {
            branchSuggestions.innerHTML = '<div class="np-item">Нічого не знайдено</div>';
            branchSuggestions.style.display = 'block';
        }
    }

    // Закриття списків при кліку поза ними
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.form-group')) {
            citySuggestions.style.display = 'none';
            branchSuggestions.style.display = 'none';
        }
    });

    // Додаткове QoL: Закриття на ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            citySuggestions.style.display = 'none';
            branchSuggestions.style.display = 'none';
        }
    });

    async function loadWarehouses(cityRef) {
        const response = await fetch(NP_SETTINGS.apiUrl, {
            method: 'POST',
            body: JSON.stringify({
                modelName: "Address",
                calledMethod: "getWarehouses",
                methodProperties: { CityRef: cityRef }
            })
        });
        const data = await response.json();

        if (data.success && data.data.length > 0) {
            currentCityBranches = data.data;
            branchInput.placeholder = 'Введіть номер або адресу';
            
            // Показуємо список негайно тільки якщо це НЕ кур'єрська доставка
            const isNotCourier = deliverySelect && deliverySelect.value !== "Кур'єр НП";
            if (isNotCourier && (branchInput.value.trim().length > 0 || document.activeElement === branchInput)) {
                renderBranchSuggestions(branchInput.value.toLowerCase().trim());
            }
        } else {
            branchInput.placeholder = 'Відділень не знайдено';
        }
    }

    isNPInitialized = true;
    checkAutoLoad(); // Перший запуск
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
        branch: document.getElementById('cust-branch')
    };

    let hasError = false;

    // Очищаємо попередні помилки
    Object.values(fields).forEach(el => el && el.classList.remove('input-error'));

    // ✅ НОВЕ: Sanitize усіх полів
    const sanitizedData = {};
    
    for (let key in fields) {
        const field = fields[key];
        if (!field) continue;
        
        const value = field.value.trim();
        
        // Перевірка на порожнечу
        if (!value) {
            field.classList.add('input-error');
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
    const phoneRegex = /^(?:\+38)?0\d{9}$/;
    
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

    // Перед перевіркою hasError, переконуємося, що branch підтягнуто з текстового поля, 
    // якщо приховане чомусь порожнє (наприклад, не вибрали зі списку)
    if (!fields.branch.value && document.getElementById('cust-branch-input').value) {
        fields.branch.value = document.getElementById('cust-branch-input').value;
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
        city: fields.city.value.trim(),
        branch: fields.branch.value.trim(),
        email: document.getElementById('email')?.value.trim() || "-",
        comment: (document.getElementById('cust-comment')?.value.trim() || "").substring(0, 500),
        secret_token: "summerof26"
    };

    // Зберігаємо в пам'ять для наступного разу
    localStorage.setItem('saved_name', orderData.name);
    localStorage.setItem('saved_phone', orderData.phone);
    localStorage.setItem('saved_delivery', orderData.delivery);
    localStorage.setItem('saved_city', orderData.city);
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
        await fetch("https://script.google.com/macros/s/AKfycbwoomvnzTKc2-YOUm3jqoPpX1zEcMAUNGY5oJ1W0GDzHzw6kmllnx_tvK3kSNN8nAT8/exec", {
            method: "POST", 
            mode: "no-cors", 
            cache: 'no-cache', 
            headers: { "Content-Type": "text/plain" },
            body: JSON.stringify({ 
                id: orderData.id,
                message: orderText,       
                email: orderData.email,   
                name: orderData.name,
                phone: orderData.phone,    // Додав телефон (зайвим не буде)
                total: totalSum,           // Додав суму окремим полем для логів
                secret_token: "summerof26" // ОБОВ'ЯЗКОВО ДОДАЄМО СЮДИ
            })
        });
        
        // Показ успіху
        document.getElementById('modal-main-content').style.display = 'none';
        const successMsg = document.getElementById('success-msg');
        if (successMsg) {
            successMsg.style.display = 'block';
            // Знаходимо ID, який ми заклали в modal-init.js, і вставляємо туди номер
            const orderDisplay = document.getElementById('orderNumberDisplay');
            if (orderDisplay) orderDisplay.innerText = orderData.id;
        }
        saveCart([]);
        updateCartUI();
    } catch (e) {
        console.error("Помилка відправки:", e);
        alert("Помилка відправки. Спробуйте ще раз або напишіть нам у месенджер.");
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
    btn.innerText = "Надсилаємо...";
    btn.style.opacity = "0.6";
    btn.style.cursor = "not-allowed";

    const reviewText = `💬 НОВИЙ ВІДГУК!\n📦 Товар: ${prodName}\n👤 Автор: ${author}\n📝 Текст: ${text}`;

    try {
        // 3. Реальна відправка
        await fetch("https://script.google.com/macros/s/AKfycbzAN1VnfuzH1SrRjEJPJh3V0UOHHQGAnwki6ROuyKCHD3K_psk65dNZZrlICR13KRw6/exec", {
            method: "POST", 
            mode: "no-cors", 
            headers: { "Content-Type": "application/json" },
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
