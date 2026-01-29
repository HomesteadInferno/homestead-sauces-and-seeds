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

// === 2. ОНОВЛЕННЯ ІНТЕРФЕЙСУ (Включаючи верхнє меню) ===
function updateCartUI() {
    const cart = getFreshCart(); 
    const totalQty = cart.reduce((acc, item) => acc + item.qty, 0);
    const totalSum = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

    // Оновлюємо всі цифри на іконках (і плаваючу, і у шапці)
    document.querySelectorAll('#cart-count, .cart-badge').forEach(c => { 
        c.innerText = totalQty; 
    });

    // Оновлюємо всі списки товарів (і в модалці, і у випадаючому меню зверху)
    // ВАЖЛИВО: додай клас .cart-items-container у HTML свого випадаючого меню
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
    document.querySelectorAll('#final-price, .total-price-display').forEach(priceEl => {
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
    const priceEl = document.getElementById('p-price');
    const qtyEl = document.getElementById('p-qty');

    if (!nameEl || !priceEl) return;

    let cart = getFreshCart();
    const name = nameEl.innerText;
    const price = parseFloat(priceEl.getAttribute('data-val'));
    const qty = parseInt(qtyEl.value) || 1;

    const existing = cart.find(item => item.name === name);
    if (existing) { existing.qty += qty; } 
    else { cart.push({ name, price, qty }); }
    
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
    // 1. Отримуємо кнопку та перевіряємо кошик
    const submitBtn = document.querySelector('.summary-side .add-btn');
    const originalText = submitBtn ? submitBtn.innerHTML : "Оформити замовлення";
    const cart = typeof getFreshCart === 'function' ? getFreshCart() : [];

    if (cart.length === 0) {
        alert("Ваш кошик ще порожній. Додайте щось смачненьке! 🌶️");
        return;
    }

    // 2. Розумна перевірка полів
    const fieldIds = ['cust-name', 'cust-phone', 'cust-city', 'cust-branch'];
    let hasError = false;

    fieldIds.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            let value = input.value.trim();
            let isInvalid = !value; // Помилка, якщо порожньо

            // Спеціальна перевірка для телефону
            if (id === 'cust-phone' && value) {
                const digitsOnly = value.replace(/\D/g, "");
                if (digitsOnly.length < 10) isInvalid = true;
            }

            if (isInvalid) {
                input.classList.add('input-error');
                hasError = true;
            } else {
                input.classList.remove('input-error');
            }
        }
    });

    if (hasError) {
        alert("Будь ласка, заповніть всі поля правильно. Телефон має містити мінімум 10 цифр.");
        return;
    }

    // 3. Блокуємо кнопку (щоб не було дублів)
    submitBtn.disabled = true;
    submitBtn.style.opacity = "0.7";
    submitBtn.style.cursor = "not-allowed";
    submitBtn.innerHTML = `<span class="spinner"></span> Відправляємо...`;

    // 4. Збираємо дані для відправки
    const name = document.getElementById('cust-name').value.trim();
    const phone = document.getElementById('cust-phone').value.trim();
    const city = document.getElementById('cust-city').value.trim();
    const branch = document.getElementById('cust-branch').value.trim();
    const currentNum = Date.now().toString().slice(-6);
    
    let totalSum = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    let orderText = `📦 ЗАМОВЛЕННЯ №${currentNum}\n----------\n👤 ${name}\n📞 ${phone}\n📍 ${city}, ${branch}\n\n🛒 Товари:\n`;
    orderText += cart.map(i => `- ${i.name} x${i.qty}`).join('\n');
    orderText += `\n\n💰 Разом: ${totalSum.toFixed(2)} ₴`;

    const googleScriptUrl = "https://script.google.com/macros/s/AKfycbzk1Yeg_GjGZ52KZCnmP2yf_i6jpR3AfwL2BxWT4HoE4VTkn1x_ksg9LuEm8PDS7GmH/exec";

    // 5. Відправка
    try {
        await fetch(googleScriptUrl, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: orderText })
        });
    } catch (e) {
        console.log("Запит пішов (no-cors)");
    }

    // 6. Показуємо успіх та очищуємо все
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

    // Розблокуємо кнопку на майбутнє та чистимо кошик
    submitBtn.disabled = false;
    submitBtn.style.opacity = "1";
    submitBtn.innerHTML = originalText;
    
    if (typeof saveCart === 'function') saveCart([]); 
    if (typeof updateCartUI === 'function') updateCartUI();
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
