const fs = require('fs');
const path = require('path');

// Налаштування
const BASE_URL = 'https://homesteadinferno.github.io/homestead-sauces-and-seeds';
const PRODUCTS_FILE = path.join(__dirname, '../products.js');
const SITEMAP_FILE = path.join(__dirname, '../sitemap.xml');
const DATE = new Date().toISOString().split('T')[0];

// 1. Зчитуємо продукти
const content = fs.readFileSync(PRODUCTS_FILE, 'utf8');

// Використовуємо регулярний вираз для пошуку ID товарів (ключів у об'єкті allProducts)
const productIds = [];
const regex = /"([^"]+)"\s*:\s*\{/g;
let match;
while ((match = regex.exec(content)) !== null) {
    // Ігноруємо мета-інфо або вкладені об'єкти, якщо вони не є товарами першого рівня
    if (!['specs', 'meta', 'seedVersions'].includes(match[1])) {
        productIds.push(match[1]);
    }
}

// 2. Шаблон XML
let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  
  <!-- СТАТИЧНІ СТОРІНКИ -->
  <url>
    <loc>${BASE_URL}/index.html</loc>
    <lastmod>${DATE}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${BASE_URL}/sauces.html</loc>
    <lastmod>${DATE}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${BASE_URL}/seedsandseedlings.html</loc>
    <lastmod>${DATE}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${BASE_URL}/otherseeds.html</loc>
    <lastmod>${DATE}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${BASE_URL}/blog.html</loc>
    <lastmod>${DATE}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>

  <!-- ДИНАМІЧНІ ТОВАРИ -->
`;

productIds.forEach(id => {
    xml += `  <url>
    <loc>${BASE_URL}/product.html?id=${id}</loc>
    <lastmod>${DATE}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>\n`;
});

xml += `</urlset>`;

// 3. Записуємо файл
fs.writeFileSync(SITEMAP_FILE, xml);
console.log(`✅ Sitemap оновлено: ${productIds.length} товарів додано.`);