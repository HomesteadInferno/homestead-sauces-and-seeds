// ===== СИСТЕМА ПОШУКУ ТОВАРІВ =====

// Додаємо DOMPurify для санітізації (якщо не підключено глобально)
if (typeof DOMPurify === 'undefined') {
    console.warn('DOMPurify не знайдено. Підключіть: <script src="https://cdn.jsdelivr.net/npm/dompurify@3/dist/purify.min.js"></script>');
}

document.addEventListener('DOMContentLoaded', () => {
    initSearch();
});

function initSearch() {
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    
    if (!searchInput || !searchResults) return;
    
    // Пошук при введенні тексту
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();
        
        // Обмежуємо довжину запиту для безпеки (до 100 символів)
        const safeQuery = query.substring(0, 100);
        
        // Якщо менше 2 символів - ховаємо результати
        if (safeQuery.length < 2) {
            searchResults.style.display = 'none';
            searchResults.innerHTML = '';
            return;
        }
        
        // Шукаємо товари
        const results = searchProducts(safeQuery);
        
        // Показуємо результати
        displaySearchResults(results, searchResults);
    });
    
    // Закриття результатів при кліку поза пошуком
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) {
            searchResults.style.display = 'none';
        }
    });
    
    // Показуємо результати при фокусі (якщо є текст)
    searchInput.addEventListener('focus', (e) => {
        if (e.target.value.trim().length >= 2) {
            searchResults.style.display = 'block';
        }
    });
}

// Функція пошуку товарів
function searchProducts(query) {
    if (typeof allProducts === 'undefined') return [];
    
    const results = [];
    const lowerQuery = query.toLowerCase().trim(); // Очищаємо запит від зайвих пробілів

    Object.keys(allProducts).forEach(id => {
        const product = allProducts[id];
        
        // Шукаємо по назві
        const nameMatch = product.name.toLowerCase().includes(query);

        // 2. ШУКАЄМО ПО ПРИХОВАНІЙ НАЗВІ (searchName)
        const altNameMatch = product.searchName && product.searchName.toLowerCase().includes(lowerQuery);
        
        // 3. НОВЕ: Пошук за смаковим тегом
        const flavorMatch = product.isFlavor && product.isFlavor.toLowerCase().includes(lowerQuery);

        // Шукаємо по категорії
        let categoryMatch = false;
        if (product.category) {
            // Перекладаємо категорії для пошуку
            const categoryNames = {
                'seeds': 'насіння, seeds',
                'sauces': 'соус, соуси, sauces',
                'seedlings': 'розсада'
            };
            const categoryName = categoryNames[product.category] || product.category;
            categoryMatch = categoryName.toLowerCase().includes(query);
        }
        
        // Додаємо до результатів якщо знайшли збіг
        if (nameMatch || categoryMatch || altNameMatch || flavorMatch) {
            results.push({
                id: id,
                ...product,
                // Визначаємо пріоритет для сортування: назви вище за категорії
                matchPriority: (nameMatch || altNameMatch || flavorMatch) ? 1 : 2
            });
        }
    });
    
    // Сортуємо: спочатку збіги по назві, потім по категорії
    results.sort((a, b) => a.matchPriority - b.matchPriority);
    
    // Обмежуємо до 8 результатів
    return results.slice(0, 8);
}

// функція відображення результатів 
function displaySearchResults(results, container) {
    if (results.length === 0) {
        container.innerHTML = '<div class="search-no-results" style="padding: 15px; text-align: center; color: #888;">Нічого не знайдено 😕</div>';
        container.style.display = 'block';
        return;
    }
    
    const categoryNames = {
        'seeds': '🌶️ Насіння',
        'sauces': '🔥 Соус',
        'seedlings': '🌱 Розсада'
    };
    
    // Санітізуємо дані перед вставкою
    const sanitizedResults = results.map(item => ({
        ...item,
        name: typeof DOMPurify !== 'undefined' ? DOMPurify.sanitize(item.name, { ALLOWED_TAGS: [] }) : item.name, // Видаляємо всі теги
        category: typeof DOMPurify !== 'undefined' ? DOMPurify.sanitize(categoryNames[item.category] || item.category, { ALLOWED_TAGS: [] }) : categoryNames[item.category] || item.category,
        price: isNaN(item.price) ? 0 : item.price // Перевіряємо, що ціна - число
    }));
    
    container.innerHTML = sanitizedResults.map(item => {
        // Перевіряємо наявність
        const isInStock = item.inStock !== false;
        
        // Санітізуємо URL для безпеки
        const safeId = encodeURIComponent(item.id);
        const safeImageSrc = item.images && item.images[0] ? encodeURI(item.images[0]) : '';
        
        return `
    <a href="product.html?id=${safeId}" class="search-result-item">
        <div class="search-result-img" style="${isInStock ? '' : 'filter: grayscale(1); opacity: 0.7;'}">
            <img src="${safeImageSrc}" alt="${item.name}">
        </div>
        <div class="search-result-info">
            <div class="search-result-name">
                ${item.name} ${isInStock ? '' : '<span style="color: #ff4444; font-size: 10px; margin-left: 5px;">(ОЧІКУЄТЬСЯ)</span>'}
            </div>
            <div class="search-result-category">${item.category}</div>
        </div>
        <div class="search-result-price">${item.price} ₴</div>
    </a>
`;
    }).join('');
    
    container.style.display = 'block';
}
