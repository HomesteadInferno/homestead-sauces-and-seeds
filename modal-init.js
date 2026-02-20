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
                            <option value="Кур'єр НП">Нова Пошта (Адресна доставка)</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Місто</label>
                        <input type="text" id="cust-city" placeholder="Київ, Одеса...">
                        <small>Тільки населені пункти України</small>
                    </div>

                    <div class="form-group">
                        <label>Відділення № або Адреса</label>
                        <input type="text" id="cust-branch" placeholder="Відділення №...">
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
    </div>`;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
});