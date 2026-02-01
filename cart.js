
//БЛОК КЕРУВАННЯ АКЦІЯМИ.
const GLOBAL_SETTINGS = {
    isSaleActive: false, 
    discountPercent: 10, 
    saleDeadline: "2026-02-05", 
    promoText: "ПЕКЕЛЬНИЙ ТИЖДЕНЬ: -10%!"
};

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
                <span style="color: #ffeb3b; font-weight: bold; margin-left: 8px;">${newPrice} ₴</span>
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
                <span style="color: #ffeb3b; font-weight: bold;">${newPrice.toFixed(2)} ₴</span>
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
            container.innerHTML = '<p style="text-align: center; opacity: 0.5; padding: 10px; color: #eaddcf;">Кошик порожній</p>';
        } else {
            container.innerHTML = cart.map((item, index) => `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.1); color: #eaddcf;">
                    <div style="flex: 1;">
                        <div style="font-size: 14px; font-weight: bold;">${item.name}</div>
                        <div style="font-size: 11px; opacity: 0.7;">${item.qty} шт. x ${item.price} ₴</div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-weight: bold; font-size: 14px;">${(item.price * item.qty).toFixed(2)} ₴</span>
                        <button onclick="removeFromCart(${index})" style="background: none; border: none; color: #ff4d4d; cursor: pointer; font-size: 18px;">&times;</button>
                    </div>
                </div>
            `).join('');
        }
    });

    document.querySelectorAll('#final-price, .total-price-display, #cart-total').forEach(priceEl => {
        priceEl.innerText = `${totalSum.toFixed(2)} ₴`;
    });

    // Ховаємо кнопку замовлення, якщо порожньо
    const orderBtn = document.querySelector('.summary-side .add-btn');
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
        
        // Автозаповнення [cite: 2026-01-26]
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

window.pushToCart = function() {
    const nameEl = document.getElementById('p-name');
    const priceContainer = document.getElementById('p-price');
    const qtyEl = document.getElementById('p-qty');
    const addBtn = document.querySelector('.add-btn');
    if (!nameEl || !priceContainer) return;

    let cart = getFreshCart();
    const isAllowed = priceContainer.getAttribute('data-allow-sale') === 'true';
    const price = isAllowed && addBtn.hasAttribute('data-price') 
                  ? parseFloat(addBtn.getAttribute('data-price')) 
                  : parseFloat(priceContainer.getAttribute('data-val'));
    const qty = parseInt(qtyEl.value) || 1;

    const existing = cart.find(item => item.name === nameEl.innerText && item.price === price);
    if (existing) existing.qty += qty; else cart.push({ name: nameEl.innerText, price, qty });
    
    saveCart(cart);
    updateCartUI();
    alert("Додано у кошик! 🌶️");
};

// 1. функція додавання з карточки в корзину
window.addToCartDirectly = function(manualName, buttonElement) {
    try {
        // 1. Шукаємо картку
        const card = buttonElement.closest('.product-card');
        if (!card) throw new Error("Картку товару не знайдено");

        // 2. Визначаємо назву (пріоритет: ручна назва -> заголовок h3)
        const nameElement = card.querySelector('h3');
        const actualName = manualName || (nameElement ? nameElement.innerText : "Невідомий товар");

        // 3. Шукаємо ціну
        const priceElement = card.querySelector('.card-price');
        if (!priceElement) throw new Error("Ціну на картці не знайдено");

        const rawText = priceElement.innerText;
        const numbers = rawText.match(/\d+/g); 
        // Беремо останнє число (актуальна ціна) [cite: 2026-01-26]
        const cleanPrice = numbers ? parseFloat(numbers[numbers.length - 1]) : 0;

        if (isNaN(cleanPrice)) throw new Error("Не вдалося розпізнати ціну");

        // 4. Логіка кошика
        let cart = getFreshCart();
        
        // ВАЖЛИВО: Шукаємо саме за actualName
        const existing = cart.find(i => i.name === actualName);
        
        if (existing) {
            existing.qty += 1;
        } else {
            cart.push({ 
                name: actualName, 
                price: cleanPrice, 
                qty: 1 
            });
        }
        
        saveCart(cart);
        updateCartUI();
        
        // 5. Гарне сповіщення
        alert(`🌶️ ${actualName} додано! Ціна: ${cleanPrice} ₴`);

    } catch (error) {
        console.error("Помилка додавання:", error.message);
    }
};

window.clearFullCart = function() {
    if (confirm("Видалити всі товари з кошика?")) {
        saveCart([]);
        updateCartUI();
        closeCheckout();
    }
};

// === 4. ВІДПРАВКА ЗАМОВЛЕННЯ ===
window.submitOrder = async function() {
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
    const name = document.getElementById('cust-name')?.value.trim();
    const phone = document.getElementById('cust-phone')?.value.trim();
    const city = document.getElementById('cust-city')?.value.trim();
    const branch = document.getElementById('cust-branch')?.value.trim();
    const email = document.getElementById('email')?.value.trim();
    const comment = document.getElementById('cust-comment')?.value.trim() || "";

    if (hasError) {
        alert("Будь ласка, заповніть всі обов'язкові поля коректно!");
        return;
    }

    // --- Далі йде ваш код відправки (він робочий) ---
    const submitBtn = document.querySelector('.summary-side .add-btn');
    const originalText = submitBtn.innerHTML;
    
    // РАХУЄМО ВСЕ ОДИН РАЗ
    const cart = getFreshCart();
    const totalSum = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const currentNum = Date.now().toString().slice(-6);

    submitBtn.disabled = true;
    submitBtn.innerHTML = `Відправляємо...`;

    // Збір даних
    const orderData = {
        name: fields.name.value.trim(),
        phone: fields.phone.value.trim(),
        city: fields.city.value.trim(),
        branch: fields.branch.value.trim(),
        email: document.getElementById('email')?.value.trim() || "-",
        comment: document.getElementById('cust-comment')?.value.trim() || ""
    };

    // Зберігаємо в пам'ять для наступного разу
    localStorage.setItem('saved_name', orderData.name);
    localStorage.setItem('saved_phone', orderData.phone);
    localStorage.setItem('saved_city', orderData.city);
    localStorage.setItem('saved_branch', orderData.branch);

    // Формуємо текст повідомлення
    let orderText = `📦 ЗАМОВЛЕННЯ №${currentNum}\n👤 ${orderData.name}\n📞 ${orderData.phone}\n📍 ${orderData.city}, ${orderData.branch}\n📧 ${orderData.email}\n💬 ${orderData.comment}\n\n🛒 Товари:\n`;
    orderText += cart.map(i => `- ${i.name} (${i.price} ₴) x ${i.qty}`).join("\n");
    orderText += `\n\n💰 РАЗОМ: ${totalSum.toFixed(2)} ₴`;

    // ФОРМУЄМО ТЕКСТ
    let orderText = "📦 ЗАМОВЛЕННЯ №" + currentNum + "\n";
    orderText += "👤 " + (name || "Клієнт") + "\n";
    orderText += "📞 " + (phone || "-") + "\n";
    orderText += "📍 " + (city || "-") + ", " + (branch || "-") + "\n";

    if (comment) {
        orderText += "💬 Коментар: " + comment + "\n";
    }

    orderText += "\n🛒 Товари:\n";
    orderText += cart.map(i => `- ${i.name} (${i.price} ₴) x ${i.qty}`).join("\n");
    orderText += "\n\n💰 РАЗОМ: " + totalSum.toFixed(2) + " ₴";

    try {
        await fetch("https://script.google.com/macros/s/AKfycbzk1Yeg_GjGZ52KZCnmP2yf_i6jpR3AfwL2BxWT4HoE4VTkn1x_ksg9LuEm8PDS7GmH/exec", {
            method: "POST", mode: "no-cors", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: orderText })
        });
        
        // Показ успіху
        document.getElementById('modal-main-content').style.display = 'none';
        const successMsg = document.getElementById('success-msg');
        successMsg.style.display = 'block';
        successMsg.innerHTML = `
            <div style="padding: 40px 20px; text-align: center;">
                <h2 style="color: #6ba86b;">🌿 Замовлення №${currentNum} прийнято!</h2>
                <p>Дякуємо, ми скоро зв'яжемося з Вами.</p>
                <button class="add-btn" onclick="location.reload()" style="margin-top:20px;">На головну</button>
            </div>`;
        
        saveCart([]);
        updateCartUI();
    } catch (e) {
        alert("Помилка відправки. Спробуйте ще раз або напишіть нам у месенджер.");
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
    } catch (e) { console.log("Sent"); }

    const mainContent = document.getElementById('modal-main-content');
    const successMsg = document.getElementById('success-msg');
    const modalContent = document.querySelector('.modal-content');

    if (mainContent) mainContent.style.display = 'none';
    if (successMsg) {
        successMsg.style.display = 'block';
        successMsg.innerHTML = `
            <div style="padding: 40px 20px; text-align: center;">
                <h2 style="color: #6ba86b;">🌿 Замовлення №${currentNum} прийнято! Дякуємо, ми скоро зв'яжемося з Вами.</h2>
                <button class="add-btn" onclick="closeCheckout()" style="margin-top:20px;">Закрити</button>
            </div>`;
        if (modalContent) modalContent.scrollTop = 0; 
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
        
    saveCart([]);
    updateCartUI();
    if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = originalText; }
};


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
    const author = document.getElementById('rev-author')?.value.trim();
    const text = document.getElementById('rev-text')?.value.trim();
    const prodName = document.getElementById('p-name')?.innerText;

    if (!author || !text) {
        alert("Заповніть, будь ласка, ім'я та текст відгуку ✍️");
        return;
    }

    const reviewText = `💬 НОВИЙ ВІДГУК!\n📦 Товар: ${prodName}\n👤 Автор: ${author}\n📝 Текст: ${text}`;

    try {
        // Використовуємо те саме посилання, що й для замовлень
        await fetch("https://script.google.com/macros/s/AKfycbzk1Yeg_GjGZ52KZCnmP2yf_i6jpR3AfwL2BxWT4HoE4VTkn1x_ksg9LuEm8PDS7GmH/exec", {
            method: "POST", mode: "no-cors", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: reviewText })
        });
        
        alert("Дякуємо! Відгук надіслано на модерацію. 😊");
        document.getElementById('rev-author').value = '';
        document.getElementById('rev-text').value = '';
    } catch (e) {
        alert("Помилка відправки. Напишіть нам у Telegram!");
    }
};

document.addEventListener('DOMContentLoaded', updateCartUI);
window.addEventListener('pageshow', updateCartUI);

window.goBack = function() {
    if (window.history.length > 1) window.history.back();
    else window.location.href = 'index.html';
};
