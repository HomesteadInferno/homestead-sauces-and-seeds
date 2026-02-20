document.addEventListener('DOMContentLoaded', () => {
    // ===== 1. ГЕНЕРАЦІЯ КАТАЛОГУ =====
    const container = document.getElementById('catalog-container');
    const mainGrid = document.querySelector('.products-grid');
    
    if (container && typeof allProducts !== 'undefined') {
        const pageCategory = mainGrid ? mainGrid.getAttribute('data-category') : null;
        container.innerHTML = ''; 

        Object.keys(allProducts).forEach(id => {
            const product = allProducts[id];
            if (!pageCategory || product.category === pageCategory) {
                let tagsHTML = '';
                if (product.isNew) tagsHTML += '<span class="product-tag">NEW</span>';
                if (product.isHot) tagsHTML += '<span class="product-tag hot">🔥 HOT</span>';
                if (product.isFlavor) tagsHTML += `<span class="product-tag flavor">${product.isFlavor}</span>`;

                const isInStock = product.inStock !== false; 

                const cardHTML = `
                    <a href="product.html?id=${id}" 
                       class="product-card ${isInStock ? '' : 'out-of-stock'}" 
                       data-id="${id}">
                        <div class="product-tags">${tagsHTML}</div>
                        <div class="img-container">
                            <img src="${product.images[0]}" alt="${product.name}" 
                                 style="${isInStock ? '' : 'filter: grayscale(0.8); opacity: 0.7;'}">
                        </div>
                        <div class="product-label">
                            <h3 class="p-name">${product.name}</h3>
                            <div class="price-row">
                                <p class="card-price" data-base-price="${product.price}" 
                                   data-allow-sale="${product.allowSale === true ? 'true' : 'false'}"
                                   style="${isInStock ? '' : 'opacity: 0.6;'}">
                                    ${product.price} ₴
                                </p>
                                ${isInStock ? `
                                    <button class="quick-add-btn" 
                                            onclick="event.stopPropagation(); event.preventDefault(); addToCartDirectly('${id}', this); return false;">
                                        🛒
                                    </button>
                                ` : `
                                    <span style="font-size: 11px; color: var(--primary-orange); border: 1px solid rgba(214, 96, 58, 0.3); padding: 2px 6px; border-radius: 4px;">ОЧІКУЄТЬСЯ</span>
                                `}
                            </div>
                        </div>
                    </a>
                `;
                container.insertAdjacentHTML('beforeend', cardHTML);
            }
        });

        if (typeof applyGlobalSale === 'function') {
            applyGlobalSale();
        }

        // ===== 2. ЛОГІКА ФІЛЬТРАЦІЇ (КНОПКИ ТА ТЕРМОМЕТР) =====
        const filterButtons = document.querySelectorAll('.filter-btn');
        
        // Функція фільтрації, яку ми будемо викликати звідусіль
        const applyFilter = (selectedHeat) => {
            const cards = document.querySelectorAll('.product-card');
            cards.forEach(card => {
                const productId = card.getAttribute('data-id');
                const product = allProducts[productId];
                if (!product) return;

                const productHeat = String(product.heatScore || '');
                if (selectedHeat === 'all') {
                    card.style.display = 'flex';
                } else if (productHeat === selectedHeat) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        };

        // Обробка кліків по кнопках 🔥
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                applyFilter(btn.getAttribute('data-heat'));
            });
        });

        // --- ЛОГІКА ТЕРМОМЕТРА (НОВЕ) ---
        const slider = document.getElementById('scoville-slider');
        const pepperName = document.getElementById('pepper-name');
        const pepperShu = document.getElementById('pepper-shu');
        const heatStatus = document.getElementById('heat-status');
        const display = document.getElementById('thermometer-display');
        

        if (slider) {
           const scovilleData = {
    "1": { 
        name: "Ancho Poblano", 
        shu: "~1,000", 
        status: "Пряний аромат 🌿", 
        color: "#4C9900" // Темно-зелений (колір Анчо)
    },
    "2": { 
        name: "Monkey Face / Zebrange", 
        shu: "5,000 - 10,000", 
        status: "Легке поколювання 🌱", 
        color: "#99cc33" // Салатовий
    },
    "3": { 
        name: "Habanero Dominica", 
        shu: "350,000+", 
        status: "Серйозний виклик! 🔥", 
        color: "#ffcc00" // Жовтий
    },
    "4": { 
        name: "Ghost Pepper", 
        shu: "1,000,000+", 
        status: "Палаючий привид! 🔥🔥", 
        color: "#ff4d00" // Помаранчево-червоний
    },
    "5": { 
        name: "Carolina Reaper", 
        shu: "2,200,000+", 
        status: "ПОВНА АНІГІЛЯЦІЯ ☠️", 
        color: "#8b0000" // Криваво-червоний
    }
};
const resetBtn = document.getElementById('reset-scoville');

if (resetBtn) {
    resetBtn.addEventListener('click', () => {
        // 1. Повертаємо повзунок на 1 (або залиш його де був, але скинь фільтр)
        // Якщо хочеш повне скидання:
        slider.value = 1;
        
        // 2. Викликаємо оновлення дисплея (для Анчо)
        slider.dispatchEvent(new Event('input')); 

        // 3. А тепер головне — показуємо ВСІ товари
        const cards = document.querySelectorAll('.product-card');
        cards.forEach(card => card.style.display = 'flex');

        // 4. Знімаємо активність з усіх кнопок-вогників
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(b => b.classList.remove('active'));
        
        // Активуємо кнопку "Всі", якщо вона є
        const allBtn = document.querySelector('.filter-btn[data-heat="all"]');
        if (allBtn) allBtn.classList.add('active');
    });
}
            slider.addEventListener('input', function() {
                const val = this.value;
                const data = scovilleData[val];
                
                // Оновлюємо дисплей
                if (pepperName) pepperName.innerText = data.name;
                if (pepperShu) pepperShu.innerText = data.shu + " SHU";
                if (heatStatus) heatStatus.innerText = "Рівень: " + data.status;
                if (display) {
                    display.style.borderColor = data.color;
                    display.style.boxShadow = `inset 0 0 10px ${data.color}`;
                }

                // Синхронізуємо з кнопками фільтрів
                const targetBtn = document.querySelector(`.filter-btn[data-heat="${val}"]`);
                if (targetBtn) {
                    filterButtons.forEach(b => b.classList.remove('active'));
                    targetBtn.classList.add('active');
                }

                // Викликаємо фільтрацію
                applyFilter(val);
            });
        }
    }

    // ===== 3. ПІДСВІТКА АКТИВНОГО ПУНКТУ МЕНЮ =====
    const currentPath = window.location.pathname.split("/").pop();
    const navLinks = document.querySelectorAll('.sidebar nav ul li a');

    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
});

// Допоміжні функції (Назад, Кнопка Вгору)
function goBack() {
    if (window.history.length > 1) window.history.back();
    else window.location.href = 'index.html';
}

const topBtn = document.createElement('button');
topBtn.innerHTML = '🔝🌶️'; 
topBtn.className = 'back-to-top';
document.body.appendChild(topBtn);

window.onscroll = function() {
    topBtn.style.display = (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) ? "block" : "none";
};

topBtn.onclick = function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
};