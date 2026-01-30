
//БЛОК КЕРУВАННЯ АКЦІЯМИ.
const GLOBAL_SETTINGS = {
    isSaleActive: true, // Зміни на false, щоб вимкнути всі акції одним махом
    discountPercent: 10, // Розмір знижки у відсотках
    saleDeadline: "2026-02-05", // Дата закінчення для таймера
    promoText: "ПЕКЕЛЬНИЙ ТИЖДЕНЬ: -10%!"
};
function applyGlobalSale() {
    // 1. Головний вимикач акції [cite: 2026-01-26]
    if (!GLOBAL_SETTINGS || !GLOBAL_SETTINGS.isSaleActive) return;

    const discount = GLOBAL_SETTINGS.discountPercent;

    // --- ОБРОБКА КАРТОК ТОВАРІВ ---
    const cardPrices = document.querySelectorAll('.card-price');
    
    cardPrices.forEach(el => {
        // Перевіряємо, чи дозволена акція саме для цього товару
        const isSaleAllowed = el.getAttribute('data-allow-sale') === 'true';
        
        if (isSaleAllowed) {
            const basePrice = parseFloat(el.getAttribute('data-base-price'));
            if (!basePrice) return;

            const newPrice = Math.round(basePrice * (1 - discount / 100));

            // Оновлюємо текст ціни на картці (жовтий колір для контрасту)
            el.innerHTML = `
                <span style="text-decoration: line-through; opacity: 0.5; font-size: 0.85em;">${basePrice} ₴</span> 
                <span style="color: #ffeb3b; font-weight: bold; margin-left: 8px;">${newPrice} ₴</span>
            `;
            
            // Знаходимо батьківську картку та її кнопку
            const card = el.closest('.product-card'); 
            if (card) {
                // ОНОВЛЮЄМО ЦІНУ В КНОПЦІ ДЛЯ КОШИКА
                const cardBtn = card.querySelector('.add-btn');
                if (cardBtn) {
                    cardBtn.setAttribute('data-price', newPrice);
                }

                // Додаємо візуальну плашку "АКЦІЯ" [cite: 2026-01-26]
                if (!card.querySelector('.sale-badge')) {
                    const badge = document.createElement('div');
                    badge.className = 'sale-badge';
                    badge.innerText = 'АКЦІЯ';
                    card.style.position = 'relative'; // Для правильного позиціювання плашки
                    card.appendChild(badge);
                }
            }
        }
    });

    // --- ОБРОБКА ЦІНИ НА СТОРІНЦІ ТОВАРУ ---
const mainPriceContainer = document.getElementById('p-price');
const mainAddToCartBtn = document.querySelector('.add-btn');

if (mainPriceContainer) {
    // ПЕРЕВІРКА: чи дозволена акція для цього конкретного товару?
    const isSaleAllowed = mainPriceContainer.getAttribute('data-allow-sale') === 'true';

    if (isSaleAllowed) {
        const basePrice = parseFloat(mainPriceContainer.getAttribute('data-val'));
        const newPrice = Math.round(basePrice * (1 - discount / 100));

        mainPriceContainer.innerHTML = `
            <span style="text-decoration: line-through; opacity: 0.5; font-size: 0.8em; margin-right: 10px; color: white;">
                ${basePrice.toFixed(2)} ₴
            </span>
            <span style="color: #ffeb3b; font-weight: bold;">
                ${newPrice.toFixed(2)} ₴
            </span>
            <span style="font-size: 16px; opacity: 0.6; font-weight: normal;">/ 5 шт.</span>
        `;

        if (mainAddToCartBtn) {
            mainAddToCartBtn.setAttribute('data-price', newPrice);
        }
    } else {
        // Якщо акція НЕ дозволена - переконуємось, що кнопка має стандартну ціну
        if (mainAddToCartBtn) {
            const basePrice = mainPriceContainer.getAttribute('data-val');
            mainAddToCartBtn.setAttribute('data-price', basePrice);
        }
    }
}

    // --- ДОДАВАННЯ БАНЕРА НАГОРІ ---
    if (GLOBAL_SETTINGS.promoText && !document.getElementById('sale-banner')) {
        const banner = document.createElement('div');
        banner.id = "sale-banner";
        banner.style.cssText = "background: #e74c3c; color: white; text-align: center; padding: 10px; font-weight: bold; position: sticky; top: 0; z-index: 1000; font-family: sans-serif;";
        banner.innerText = GLOBAL_SETTINGS.promoText;
        document.body.prepend(banner);
    }
}

// Запуск функції після завантаження всього контенту
document.addEventListener('DOMContentLoaded', applyGlobalSale);
//ЕНДБЛОК КЕРУВАННЯ АКЦІЯМИ.





// === 1. РОБОТА З ПАМ'ЯТТЮ ===
function getFreshCart() {
    try {
        return JSON.parse(localStorage.getItem('homestead_cart')) || [];
    } catch (e) {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem('homestead_cart', JSON.stringify(cart));
}



// === 2. ОНОВЛЕННЯ ІНТЕРФЕЙСУ (Включаючи верхнє меню та плаваючу кнопку) ===
function updateCartUI() {
    const cart = getFreshCart(); 
    const totalQty = cart.reduce((acc, item) => acc + item.qty, 0);
    const totalSum = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

    // Оновлюємо ВСІ лічильники (і в шапці, і плаваючий) через клас .cart-count
    // Також залишаємо ID #cart-count для сумісності
    const allCounters = document.querySelectorAll('.cart-count, #cart-count, .cart-badge');
    allCounters.forEach(counter => { 
        counter.innerText = totalQty; 
    });

    // Оновлюємо всі списки товарів
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
                        <button onclick="removeFromCart(${index})" style="background: none; border: none; color: #ff4d4d; cursor: pointer; font-size: 18px; padding: 0 5px;">&times;</button>
                    </div>
                </div>
            `).join('');
        }
    });

    // Оновлюємо всі поля з фінальною сумою
    document.querySelectorAll('#final-price, .total-price-display, #cart-total').forEach(priceEl => {
        priceEl.innerText = `${totalSum.toFixed(2)} ₴`;
    });
}

// === 3. КЕРУВАННЯ КОШИКОМ ===
window.openCheckout = function() {
    const cart = getFreshCart();
    if (cart.length === 0) {
        alert("Ваш кошик ще порожній. Додайте щось смачненьке! 🌶️");
        return;
    }
    const modal = document.getElementById('checkoutModal');
    if (modal) {
        modal.style.display = 'flex';
        const mainContent = document.getElementById('modal-main-content');
        const successMsg = document.getElementById('success-msg');
        if (mainContent) mainContent.style.display = 'grid';
        if (successMsg) successMsg.style.display = 'none';
        
        // --- НОВЕ: АВТОЗАПОВНЕННЯ ---
        // Якщо клієнт вже купував, підтягуємо його дані
        if (localStorage.getItem('saved_name')) document.getElementById('cust-name').value = localStorage.getItem('saved_name');
        if (localStorage.getItem('saved_phone')) document.getElementById('cust-phone').value = localStorage.getItem('saved_phone');
        if (localStorage.getItem('saved_city')) document.getElementById('cust-city').value = localStorage.getItem('saved_city');
        if (localStorage.getItem('saved_branch')) document.getElementById('cust-branch').value = localStorage.getItem('saved_branch');
        if (localStorage.getItem('saved_email')) document.getElementById('email').value = localStorage.getItem('saved_email');
        // -----------------------------

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
    const name = nameEl.innerText;
    
    // Визначаємо ціну: якщо акція дозволена — беремо з кнопки, якщо ні — з data-val
    const isAllowed = priceContainer.getAttribute('data-allow-sale') === 'true';
    const price = isAllowed && addBtn.hasAttribute('data-price') 
                  ? parseFloat(addBtn.getAttribute('data-price')) 
                  : parseFloat(priceContainer.getAttribute('data-val'));

    const qty = parseInt(qtyEl.value) || 1;

    // ШУКАЄМО ТОВАР І ЗА ІМ'ЯМ, І ЗА ЦІНОЮ
    const existing = cart.find(item => item.name === name && item.price === price);

    if (existing) { 
        existing.qty += qty; 
    } else { 
        cart.push({ name, price, qty }); 
    }
    
    saveCart(cart);
    updateCartUI();
    alert("Додано у кошик! 🌶️");
};




window.clearFullCart = function() {
    if (confirm("Видалити всі товари з кошика?")) {
        saveCart([]); // Очищуємо масив у LocalStorage
        updateCartUI(); // Оновлюємо інтерфейс
        
        // Якщо кошик став порожнім, закриваємо модалку оформлення
        const checkoutModal = document.getElementById('checkout-modal');
        if (checkoutModal && checkoutModal.style.display === 'block') {
            closeCheckout();
        }
    }
};




// === 4. ВІДПРАВКА ЗАМОВЛЕННЯ ===
window.submitOrder = async function() {
    // 1. ПЕРЕВІРКА ПОЛІВ (ВАЛІДАЦІЯ)
    const fieldIds = ['cust-name', 'cust-phone', 'cust-city', 'cust-branch'];
    let hasError = false;
    
    fieldIds.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            if (!input.value.trim()) {
                input.classList.add('input-error'); 
                hasError = true;
            } else {
                input.classList.remove('input-error'); 
            }
        }
    });

    if (hasError) {
        alert("Будь ласка, заповніть виділені поля для доставки.");
        return;
    }

    // Зчитуємо дані з полів
    const name = document.getElementById('cust-name')?.value.trim();
    const phone = document.getElementById('cust-phone')?.value.trim();
    const city = document.getElementById('cust-city')?.value.trim();
    const branch = document.getElementById('cust-branch')?.value.trim();
    const email = document.getElementById('email')?.value.trim(); 

    // Ще одна перевірка на всяк випадок
    if (!name || !phone || !city || !branch) {
        alert("Будь ласка, заповніть всі поля!");
        return;
    }

    // === ЗБЕРЕЖЕННЯ В ПАМ'ЯТЬ (АВТОЗАПОВНЕННЯ) ===
    localStorage.setItem('saved_name', name);
    localStorage.setItem('saved_phone', phone);
    localStorage.setItem('saved_city', city);
    localStorage.setItem('saved_branch', branch);
    if (email) localStorage.setItem('saved_email', email);
    // ============================================

    const submitBtn = document.querySelector('.summary-side .add-btn');
    const originalText = submitBtn.innerHTML;
    const cart = getFreshCart();

    // 2. БЛОКУЄМО КНОПКУ
    submitBtn.disabled = true;
    submitBtn.style.opacity = "0.7";
    submitBtn.style.cursor = "not-allowed";
    submitBtn.innerHTML = `<span class="spinner"></span> Відправляємо...`;

    // 3. ФОРМУЄМО ПОВІДОМЛЕННЯ
    const currentNum = Date.now().toString().slice(-6);
    let totalSum = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    
    let orderText = `📦 ЗАМОВЛЕННЯ №${currentNum}\n----------\n👤 ${name}\n📞 ${phone}\n📍 ${city}, ${branch}\n`;
    if (email) orderText += `📧 ${email}\n`; 
    orderText += `\n🛒 Товари:\n`;
    orderText += cart.map(i => `- ${i.name} x${i.qty}`).join('\n');
    orderText += `\n\n💰 Разом: ${totalSum.toFixed(2)} ₴`;

    const googleScriptUrl = "https://script.google.com/macros/s/AKfycbzk1Yeg_GjGZ52KZCnmP2yf_i6jpR3AfwL2BxWT4HoE4VTkn1x_ksg9LuEm8PDS7GmH/exec";

    // 4. ВІДПРАВЛЯЄМО
    try {
        await fetch(googleScriptUrl, {
            method: "POST",
            mode: "no-cors", 
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: orderText })
        });
    } catch (e) {
        console.log("Запит пішов (обробка через no-cors)"); 
    }

    // 5. УСПІХ: ЧИСТИМО КОШИК І ПОКАЗУЄМО ПОВІДОМЛЕННЯ
    // (Ось цього шматка у тебе не вистачало 👇)
    
    const mainContent = document.getElementById('modal-main-content');
    const successMsg = document.getElementById('success-msg');
        
    if (mainContent) mainContent.style.display = 'none';
    
    if (successMsg) {
        successMsg.style.display = 'block';
        successMsg.innerHTML = `
            <div style="padding: 40px 20px; text-align: center;">
                <h2 style="color: #6ba86b;">🌿 Замовлення №${currentNum} прийнято!</h2>
                <p style="color: white;">Дякуємо! Ми скоро зв'яжемося з вами.</p>
                <button class="add-btn" onclick="closeCheckout()" style="margin-top:20px; background: #325e34; color: white; border: none; padding: 10px 20px; cursor: pointer;">Закрити</button>
            </div>`;
    }
      // ФІКС: Автоматично скролимо модалку вгору, щоб людина побачила повідомлення
        if (modalContainer) modalContainer.scrollTop = 0;
        // Або якщо скролиться вся сторінка:
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }  
    saveCart([]); // Очищуємо пам'ять кошика
    updateCartUI(); // Оновлюємо вигляд
    
    // Повертаємо кнопку до життя
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.style.opacity = "1";
        submitBtn.style.cursor = "pointer";
        submitBtn.innerHTML = originalText;
    }
}; 

 // Кінець функції submitOrder

// === 1. ГАЛЕРЕЯ (Щоб не було помилок при завантаженні) ===
function updateView(img) {
    const mainView = document.getElementById('main-view');
    if (mainView) {
        mainView.src = img.src;
        // Оновлюємо активний клас на мініатюрах
        document.querySelectorAll('.thumb-img').forEach(t => t.classList.remove('active'));
        img.classList.add('active');
    }
}

let currentImgIndex = 0;
function changeImage(dir) {
    const thumbs = document.querySelectorAll('.thumb-img');
    if (thumbs.length > 0) {
        currentImgIndex = (currentImgIndex + dir + thumbs.length) % thumbs.length;
        updateView(thumbs[currentImgIndex]);
    }
}


// === 6. ЗАПУСК ===
document.addEventListener('DOMContentLoaded', updateCartUI);
window.addEventListener('pageshow', updateCartUI);
window.addEventListener('storage', updateCartUI);

window.goBack = function() {
    if (window.history.length > 1) window.history.back();
    else window.location.href = 'index.html';
};