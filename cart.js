
//БЛОК КЕРУВАННЯ АКЦІЯМИ.
const GLOBAL_SETTINGS = {
    isSaleActive: false, 
    discountPercent: 10, 
    saleDeadline: "2026-02-05", 
    promoText: "ПЕКЕЛЬНИЙ ТИЖДЕНЬ: -10% НА НАСІННЯ ТА СОУСИ!"
};

// ===== ФУНКЦІЯ ЗАХИСТУ ВІД XSS АТАК =====
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== ВАЛІДАЦІЯ ЦІН (ЗАХИСТ ВІД МАНІПУЛЯЦІЙ) =====
function validatePrice(productId, price) {
    // Перевіряємо чи ціна збігається з базою
    if (typeof allProducts !== 'undefined' && allProducts[productId]) {
        const realPrice = allProducts[productId].price;
        // Допускаємо невелику похибку для знижок
        if (Math.abs(price - realPrice) > realPrice * 0.35) { // max знижка 35%
            console.warn('⚠️ Підозріла ціна для', productId, '- очікувалось:', realPrice, 'отримано:', price);
            return realPrice; // Повертаємо правильну ціну
        }
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

    document.querySelectorAll('.cart-count, #cart-count, .cart-badge').forEach(c => { c.innerText = totalQty; });

    const listContainers = document.querySelectorAll('#final-list, .cart-items-container');
    listContainers.forEach(container => {
        if (cart.length === 0) {
            container.innerHTML = '<p class="empty-cart-msg">Кошик порожній</p>';
        } else {
            container.innerHTML = cart.map((item, index) => `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <div class="cart-item-name">${escapeHtml(item.name)}</div>
                        <div class="cart-item-details">${parseFloat(item.price).toFixed(2)} ₴ / шт.</div>
                    </div>
                    <div class="cart-item-actions">
                        <span class="cart-item-subtotal">${(parseFloat(item.price) * parseInt(item.qty)).toFixed(2)} ₴</span>
                        <div class="qty-stepper">
                            <button class="qty-btn qty-minus" onclick="changeQty(${index}, -1)" aria-label="Зменшити">−</button>
                            <span class="qty-value">${parseInt(item.qty)}</span>
                            <button class="qty-btn qty-plus"  onclick="changeQty(${index}, +1)" aria-label="Збільшити">+</button>
                        </div>
                    </div>
                </div>
            `).join('');
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
        const fields = ['name', 'phone', 'city', 'branch', 'email'];
        fields.forEach(f => {
            const val = localStorage.getItem('saved_' + f);
            const el = document.getElementById(f === 'email' ? 'email' : 'cust-' + f);
            if (val && el) el.value = val;
        });
        updateCartUI();
    }
};

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
        // qty впала до 0 — питаємо, чи точно видалити
        if (!confirm(`Видалити «${cart[index].name}» з кошика?`)) return;
        cart.splice(index, 1);
    } else {
        cart[index].qty = Math.min(newQty, 100); // максимум 100 шт.
    }

    saveCart(cart);
    updateCartUI();
    if (cart.length === 0) closeCheckout();
};

// Універсальна функція додавання
window.addToCart = function(productId, price, name, qty = 1) {
    let cart = getFreshCart();
    
    // ЗАХИСТ: Валідуємо ціну
    const validatedPrice = validatePrice(productId, parseFloat(price));
    const validatedQty = Math.max(1, Math.min(100, parseInt(qty))); // Від 1 до 100
    
    // Шукаємо товар у кошику:
    // 1. Якщо є productId - шукаємо за ним
    // 2. АБО шукаємо за назвою (на випадок старих товарів без ID)
    const existing = cart.find(item => {
        // Спочатку перевіряємо по ID (якщо обидва мають ID)
        if (productId && item.productId && item.productId === productId) {
            return true;
        }
        // Потім перевіряємо по назві (без врахування регістру)
        if (item.name.toLowerCase().trim() === name.toLowerCase().trim()) {
            return true;
        }
        return false;
    });

    if (existing) {
        // Знайшли - просто додаємо кількість
        existing.qty = Math.min(existing.qty + validatedQty, 100); // Максимум 100 шт
        existing.price = validatedPrice;
        // Оновлюємо productId якщо його не було
        if (productId && !existing.productId) {
            existing.productId = productId;
        }
    } else {
        // Не знайшли - додаємо новий товар
        cart.push({ 
            productId: productId, 
            name: name.trim().substring(0, 200), // Обмежуємо довжину назви
            price: validatedPrice, 
            qty: validatedQty 
        });
    }
    
    saveCart(cart);
    updateCartUI();
};

// 1. Для сторінки товару (product.html)
window.pushToCart = function() {
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

    const isAllowed = priceContainer.getAttribute('data-allow-sale') === 'true';
    const price = isAllowed && addBtn.hasAttribute('data-price') 
                  ? parseFloat(addBtn.getAttribute('data-price')) 
                  : parseFloat(priceContainer.getAttribute('data-val'));
    
    const qty = parseInt(qtyEl.value) || 1;
    
    addToCart(productId, price, name, qty);
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

        // 3. ДОДАЄМО В КОШИК через універсальну функцію
        // Це гарантує правильний пошук і об'єднання товарів
        addToCart(productId, cleanPrice, actualName, 1);
        
        alert(`🌶️ ${actualName} додано!`);

    } catch (error) {
        console.error("Помилка додавання:", error.message);
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
// === 4. ВІДПРАВКА ЗАМОВЛЕННЯ ===
window.submitOrder = async function() {
    // ЗАХИСТ ВІД БОТІВ: Honeypot перевірка
    const honeypot = document.getElementById('website_url');
    if (honeypot && honeypot.value !== '') {
        // Бот заповнив приховане поле - ігноруємо замовлення
        console.warn('🤖 Бот виявлено');
        alert("Дякуємо за замовлення! Ми з вами зв'яжемося.");
        closeCheckout();
        return;
    }
    
    // 1. Отримуємо посилання на поля
    const fields = {
        name: document.getElementById('cust-name'),
        phone: document.getElementById('cust-phone'),
        city: document.getElementById('cust-city'),
        branch: document.getElementById('cust-branch')
    };

    let hasError = false;

    // 2. Очищаємо попередні помилки
    Object.values(fields).forEach(el => el && el.classList.remove('input-error'));

    // 3. Перевірка на порожнечу
    for (let key in fields) {
        if (!fields[key] || !fields[key].value.trim()) {
            fields[key]?.classList.add('input-error');
            hasError = true;
        }
    }

    // 4. СПЕЦІАЛЬНА ПЕРЕВІРКА ТЕЛЕФОНУ
    // Формат: +380 або 0, далі 9 цифр
    const phoneRegex = /^(?:\+38)?0\d{9}$/;
    if (fields.phone && !phoneRegex.test(fields.phone.value.trim().replace(/\s/g, ''))) {
        alert("Будь ласка, введіть коректний номер телефону (наприклад: 0951234567)");
        fields.phone.classList.add('input-error');
        hasError = true;
    }

    // Валідація email (якщо заповнений — перевіряємо формат)
    const emailEl = document.getElementById('email');
    if (emailEl && emailEl.value.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailEl.value.trim())) {
            emailEl.classList.add('input-error');
            alert("Будь ласка, введіть коректний email або залиште поле порожнім");
            return;
        }
    }

    if (hasError) {
        alert("Будь ласка, перевірте дані, підсвічені червоним 🔴");
        return;
    }

    // --- Далі йде ваш код відправки (він робочий) ---
    const submitBtn = document.querySelector('.checkout-summary .order-btn');
    if (!submitBtn) { console.error('submitOrder: кнопку order-btn не знайдено'); return; }
    const originalText = submitBtn.innerHTML;
    // 🔥 ГЕНЕРУЄМО КРАСИВИЙ НОМЕР
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
        city: fields.city.value.trim(),
        branch: fields.branch.value.trim(),
        email: document.getElementById('email')?.value.trim() || "-",
        comment: (document.getElementById('cust-comment')?.value.trim() || "").substring(0, 500)
    };

    // Зберігаємо в пам'ять для наступного разу
    localStorage.setItem('saved_name', orderData.name);
    localStorage.setItem('saved_phone', orderData.phone);
    localStorage.setItem('saved_city', orderData.city);
    localStorage.setItem('saved_branch', orderData.branch);

    /// 4. Формуємо повідомлення для Telegram
    let orderText = `🌶️ НОВЕ ЗАМОВЛЕННЯ: ${orderData.id}\n`;
    orderText += `👤 ${orderData.name}\n📞 ${orderData.phone}\n`;
    orderText += `📍 ${orderData.city}, ${orderData.branch}\n`;
    if (orderData.email !== "-") orderText += `📧 ${orderData.email}\n`;
    if (orderData.comment) orderText += `💬 Коментар: ${orderData.comment}\n`;
    orderText += `\n🛒 Товари:\n`;
    orderText += cart.map(i => `- ${i.name} (${i.price}₴) x ${i.qty}`).join("\n");
    orderText += `\n\n💰 РАЗОМ: ${totalSum.toFixed(2)} ₴`;

    try {
        await fetch("https://script.google.com/macros/s/AKfycbzk1Yeg_GjGZ52KZCnmP2yf_i6jpR3AfwL2BxWT4HoE4VTkn1x_ksg9LuEm8PDS7GmH/exec", {
            method: "POST", mode: "no-cors", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: orderText })
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
if (honey) return; // Якщо поле заповнене — це бот, просто ігноруємо
    // 1. Знаходимо кнопку та дані
    const btn = document.querySelector('#review-form-section .add-btn');
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
        await fetch("https://script.google.com/macros/s/AKfycbzk1Yeg_GjGZ52KZCnmP2yf_i6jpR3AfwL2BxWT4HoE4VTkn1x_ksg9LuEm8PDS7GmH/exec", {
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
        alert("Помилка відправки. Напишіть нам у Telegram!");
        btn.disabled = false;
        btn.innerText = originalText;
        btn.style.opacity = "1";
    }
};



document.addEventListener('DOMContentLoaded', updateCartUI);
window.addEventListener('pageshow', updateCartUI);

// Функція goBack перенесена в catalog.js// Функція для кнопки "Назад"
function goBack() {
    if (window.history.length > 1) {
        window.history.back();
    } else {
        window.location.href = 'index.html';
    }
}



