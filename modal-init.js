document.addEventListener("DOMContentLoaded", function() {
    // Перевіряємо, чи модалки ще немає на сторінці (щоб не дублювати)
    if (document.getElementById('checkoutModal')) return;

    const modalHTML = `
    <div id="checkoutModal" class="modal">
        <div class="modal-box">
            <button class="close-btn" onclick="closeCheckout()">&times;</button>
            
            <div class="checkout-header">
                <h2 class="modal-title"><span>Оформлення</span> замовлення</h2>
            </div>

            <div id="modal-main-content" class="checkout-grid">
                <div class="checkout-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Прізвище та Ім'я</label>
                            <input type="text" id="cust-name" placeholder="Ваше ім'я">
                        </div>
                        <div class="form-group">
                            <label>Телефон</label>
                            <input type="tel" id="cust-phone" placeholder="+380..." maxlength="13">
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Спосіб доставки</label>
                        <select id="cust-delivery">
                            <option value="Відділення НП">Нова Пошта (Відділення)</option>
                            <option value="Поштомат НП">Нова Пошта (Поштомат)</option>
                            <option value="Укрпошта">Укрпошта</option>
                            <option value="Кур'єр НП">Нова Пошта (Адресна доставка)</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Місто (почніть вводити...)</label>
                        <div style="position: relative;">
                            <input type="text" id="cust-city" placeholder="Наприклад: Київ" autocomplete="off">
                            <div id="city-suggestions" class="np-suggestions"></div>
                        </div>
                        <small>Тільки населені пункти України</small>
                    </div>

                    <div class="form-group" id="branch-group">
                        <label>Відділення або поштомат (номер чи адреса)</label>
                        <div style="position: relative;">
                            <input type="text" id="cust-branch-input" placeholder="Введіть номер або назву..." autocomplete="off">
                            <div id="branch-suggestions" class="np-suggestions"></div>
                        </div>
                        <input type="hidden" id="cust-branch">
                    </div>

                    <div class="form-group">
                        <label>Електронна пошта</label>
                        <input type="email" id="email">
                    </div>

                    <div class="form-group">
                        <label>Коментар</label>
                        <textarea id="cust-comment"></textarea>
                    </div>

                    <div style="position: absolute; left: -9999px; opacity: 0;">
                        <input type="text" id="website_url" tabindex="-1" autocomplete="off">
                    </div>
                </div>

                <div class="checkout-summary">
                    <div class="summary-header-row">
                        <h3 class="summary-title">Ваше замовлення</h3>
                        <button onclick="clearFullCart()" class="clear-cart-btn">Очистити</button>
                    </div>
                    <div id="final-list" class="cart-items-list"></div> 
                    <div class="cart-total-block">
                        <div class="total-row">
                            <span>Разом:</span>
                            <span class="total-price-display"><span id="final-price">0.00</span> ₴</span>
                        </div>
                        <button class="order-btn" onclick="submitOrder()">Підтвердити замовлення</button>
                    </div>
                </div>
            </div>

            <div id="success-msg" style="display:none; text-align: center; padding: 50px 20px;">
                <h2 style="color: var(--primary-orange);">🌿 Замовлення прийнято!</h2>
                <p>Номер: <strong id="orderNumberDisplay"></strong></p>
                <p>Дякуємо! Ми скоро зв'яжемося з вами.</p>
                <button class="order-btn" style="max-width: 200px; margin: 20px auto 0;" onclick="closeCheckout()">Закрити</button>
            </div>
        </div>
    </div>

    <div id="notifyModal" class="modal">
        <div class="modal-box" style="max-width: 500px; padding: 40px; text-align: center;">
            <button class="close-btn" onclick="document.getElementById('notifyModal').style.display='none'">&times;</button>
            <h2 class="modal-title">Повідомити про <span>запуск</span></h2>
            <p style="margin: 20px 0; opacity: 0.8;" id="notify-text">Залиште свій email, і ми надішлемо вам пекельну звістку, як тільки товар з'явиться!</p>
            <div class="form-group">
                <input type="email" id="notify-email" placeholder="Ваш Email" style="width: 100%; margin-bottom: 20px;">
                <button class="order-btn" onclick="submitNotification()">Хочу дізнатися першим</button>
            </div>
            <div id="notify-success" style="display:none; color: var(--primary-color); margin-top: 20px; font-weight: bold;">
                Записано! Чекайте на вогонь у поштовій скриньці 🌶️
            </div>
        </div>
    </div>`;

    // HTML для плаваючого кошика, який буде видно завжди
    const floatingCartHTML = `
    <a href="javascript:void(0)" class="floating-cart" onclick="openCheckout()" title="Відкрити кошик">
        <span class="cart-icon">🛒</span>
        <span id="cart-count">0</span>
    </a>`;

    // HTML для текстової кнопки кошика у верхньому правому куті
    const headerCartHTML = `
    <a href="javascript:void(0)" class="header-cart-link" onclick="openCheckout()" title="Перейти до кошика">
        <span class="cart-text">Кошик</span>
        <span class="cart-icon">🛒</span>
        <span class="cart-count">0</span>
    </a>`;

    document.body.insertAdjacentHTML('beforeend', modalHTML + floatingCartHTML + headerCartHTML);

    // Закриття модального вікна при кліку на темну область поза формою (оверлей)
    const modal = document.getElementById('checkoutModal');
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeCheckout();
        }
    });

    // Оновлюємо інтерфейс кошика відразу після додавання, якщо функція доступна
    if (typeof updateCartUI === 'function') {
        updateCartUI();
    }
});

// ВСТАВ СЮДИ СВОЄ ПОСИЛАННЯ З cart.js
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwZK1F30stAzlsKyegtcgKOGnq9odihOtWZpVWOgueOj927iLUqdukVT_0MCnjdcWce/exec";

let currentNotifyCategory = '';

function openNotifyModal(category) {
    const modal = document.getElementById('notifyModal');
    const text = document.getElementById('notify-text');
    currentNotifyCategory = category;
    
    if (category === 'fresh-peppers') {
        text.innerText = "Ми напишемо вам, як тільки зберемо перший врожай свіжих суперхотів восени 2026! 🍂";
    } else if (category === 'poultry') {
        text.innerText = "Наш флок готується до виходу! Ми сповістимо вас про старт продажів інкубаційних яєць. 🐣";
    }
    
    modal.style.display = 'flex';
}

// Універсальна функція для відправки даних у таблицю
async function sendToGoogleSheet(data) {
    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // Важливо для Google Scripts
            cache: 'no-cache',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return true;
    } catch (error) {
        console.error('Помилка відправки:', error);
        return false;
    }
}

// Допоміжна функція перевірки формату Email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

async function submitNotification() {
    const emailInput = document.getElementById('notify-email');
    const email = emailInput.value.trim();
    
    if (!validateEmail(email)) {
        alert('Будь ласка, введіть коректну адресу електронної пошти!');
        emailInput.classList.add('input-error');
        return;
    }
    emailInput.classList.remove('input-error');

    const btn = document.querySelector('#notifyModal .order-btn');
    btn.disabled = true;
    btn.innerText = "Записуємо...";

    const data = {
        date: new Date().toLocaleString("uk-UA"),
        email: email,
        orderType: "ЗАПИТ_НА_ЗАПУСК",
        details: `Категорія: ${currentNotifyCategory}`,
        secret_token: "summerof26"
    };

    await sendToGoogleSheet(data);

    document.getElementById('notify-success').style.display = 'block';
    setTimeout(() => {
        document.getElementById('notifyModal').style.display = 'none';
        document.getElementById('notify-success').style.display = 'none';
        btn.disabled = false;
        btn.innerText = "Хочу дізнатися першим";
        emailInput.value = '';
    }, 2500);
}

async function handleGeneralSubscribe(event) {
    event.preventDefault();
    const emailInput = document.getElementById('sub-email');
    const email = emailInput.value.trim();
    const btn = document.getElementById('sub-btn');

    if (!validateEmail(email)) {
        alert('Будь ласка, введіть коректну адресу електронної пошти!');
        emailInput.classList.add('input-error');
        return;
    }
    emailInput.classList.remove('input-error');

    btn.disabled = true;
    btn.innerText = "⏳";

    await sendToGoogleSheet({
        date: new Date().toLocaleString("uk-UA"),
        email: email,
        orderType: "ПІДПИСКА_МАРКЕТИНГ",
        details: "Підписка з головної сторінки (футер)",
        secret_token: "summerof26"
    });

    alert('Дякуємо! Тепер ви в списку обраних 🔥');
    btn.disabled = false;
    btn.innerText = "Підписатися";
    document.getElementById('sub-email').value = '';
}