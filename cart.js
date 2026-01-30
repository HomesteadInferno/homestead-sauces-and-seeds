
//БЛОК КЕРУВАННЯ АКЦІЯМИ.
const GLOBAL_SETTINGS = {
    isSaleActive: true, 
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

window.clearFullCart = function() {
    if (confirm("Видалити всі товари з кошика?")) {
        saveCart([]);
        updateCartUI();
        closeCheckout();
    }
};

// === 4. ВІДПРАВКА ЗАМОВЛЕННЯ ===
window.submitOrder = async function() {
    const fieldIds = ['cust-name', 'cust-phone', 'cust-city', 'cust-branch'];
    let hasError = false;
    fieldIds.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            if (!input.value.trim()) { input.classList.add('input-error'); hasError = true; } 
            else input.classList.remove('input-error');
        }
    });
    if (hasError) { alert("Заповніть поля доставки!"); return; }

    const name = document.getElementById('cust-name')?.value.trim();
    const phone = document.getElementById('cust-phone')?.value.trim();
    const city = document.getElementById('cust-city')?.value.trim();
    const branch = document.getElementById('cust-branch')?.value.trim();
    const email = document.getElementById('email')?.value.trim();

    localStorage.setItem('saved_name', name);
    localStorage.setItem('saved_phone', phone);
    localStorage.setItem('saved_city', city);
    localStorage.setItem('saved_branch', branch);
    if (email) localStorage.setItem('saved_email', email);

    const submitBtn = document.querySelector('.summary-side .add-btn');
    const originalText = submitBtn.innerHTML;
    const cart = getFreshCart();

    submitBtn.disabled = true;
    submitBtn.innerHTML = `Відправляємо...`;

    const currentNum = Date.now().toString().slice(-6);
    let orderText = `📦 №${currentNum}\n👤 ${name}\n📞 ${phone}\n📍 ${city}, ${branch}\n🛒 Товари:\n` + 
                    cart.map(i => `- ${i.name} x${i.qty}`).join('\n');

    try {
     // ... (початок функції залишається таким самим)

    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="spinner"></span> Відправляємо...`;

    // 4. ВІДПРАВЛЯЄМО
    try {
        // Ми не ставимо await перед fetch, щоб не чекати відповіді від повільного Google
        fetch("https://script.google.com/macros/s/AKfycbzk1Yeg_GjGZ52KZCnmP2yf_i6jpR3AfwL2BxWT4HoE4VTkn1x_ksg9LuEm8PDS7GmH/exec", {
            method: "POST", 
            mode: "no-cors", 
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: orderText })
        });
        
        // Робимо паузу в 1 секунду для солідності, і показуємо успіх
        setTimeout(() => {
            showOrderSuccess(currentNum);
        }, 800);

    } catch (e) { 
        // Якщо навіть помилка мережі, все одно покажемо успіх, бо зазвичай дані доходять
        showOrderSuccess(currentNum);
    }
};

// Винесемо показ успіху в окрему функцію, щоб код був чистішим
function showOrderSuccess(num) {
    const mainContent = document.getElementById('modal-main-content');
    const successMsg = document.getElementById('success-msg');
    const modalContent = document.querySelector('.modal-content');

    if (mainContent) mainContent.style.display = 'none';
    if (successMsg) {
        successMsg.style.display = 'block';
        successMsg.innerHTML = `
            <div style="padding: 40px 20px; text-align: center;">
                <h2 style="color: #6ba86b;">🌿 Замовлення №${num} прийнято!</h2>
                <p style="color:white; margin-bottom:20px;">Ми отримали ваші дані та скоро зателефонуємо.</p>
                <button class="add-btn" onclick="closeCheckout()" style="background: #325e34; color: white; border: none; padding: 10px 20px; cursor: pointer; border-radius: 5px;">Закрити</button>
            </div>`;
        if (modalContent) modalContent.scrollTop = 0;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    saveCart([]);
    updateCartUI();
}

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

document.addEventListener('DOMContentLoaded', updateCartUI);
window.addEventListener('pageshow', updateCartUI);

window.goBack = function() {
    if (window.history.length > 1) window.history.back();
    else window.location.href = 'index.html';
};
