// ═══════════════════════════════════════════════════════════════
// 🔥 BLOG ARTICLE APP — HOMESTEAD INFERNO
// JavaScript для відображення окремої статті
// ═══════════════════════════════════════════════════════════════

class ArticleApp {
    constructor() {
        this.currentPost = null;
        this.init();
    }

    init() {
        this.loadArticle();
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // LOAD ARTICLE
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    loadArticle() {
        // Отримуємо ID статті з URL
        const urlParams = new URLSearchParams(window.location.search);
        const postId = urlParams.get('id');

        if (!postId) {
            this.showError('Стаття не знайдена');
            return;
        }

        // Знаходимо статтю в базі даних
        this.currentPost = blogPosts.find(post => post.id === postId);

        if (!this.currentPost) {
            this.showError('Стаття не знайдена');
            return;
        }

        // Рендеримо статтю
        this.renderArticle();
        this.renderRelatedPosts();
        this.setupNavigation();
        this.updateMetaTags();
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // RENDER ARTICLE
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    renderArticle() {
        const post = this.currentPost;

        // Header
        const headerEl = document.getElementById('article-header');
        if (headerEl) {
            headerEl.innerHTML = `
                <p class="article-meta">
                    ${this.formatDate(post.date)} • ${post.categoryLabel} • ${post.readTime}
                </p>
                <h1>${post.title}</h1>
                <p style="font-style: italic; font-size: 1.2rem; margin-top: 20px; color: var(--text-muted);">
                    ${post.excerpt}
                </p>
                <div style="margin-top: 20px; font-size: 0.9rem; color: rgba(255,255,255,0.6);">
                    ✍️ Автор: ${post.author}
                </div>
            `;
        }

        // Breadcrumb category
        const breadcrumbEl = document.getElementById('breadcrumb-category');
        if (breadcrumbEl) {
            breadcrumbEl.textContent = post.categoryLabel;
        }

        // Main content
        const mainEl = document.getElementById('article-main');
        if (mainEl) {
            mainEl.innerHTML = `
                <div class="article-cut">
                    ${post.content}
                </div>
            `;
        }

        // Tags
        const tagsEl = document.getElementById('article-tags');
        if (tagsEl) {
            tagsEl.innerHTML = `
                <h4>🏷️ Теги:</h4>
                <div class="tags-list">
                    ${post.tags.map(tag => `
                        <a href="blog.html?search=${encodeURIComponent(tag)}" class="tag-link">
                            #${tag}
                        </a>
                    `).join('')}
                </div>
            `;
        }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // RELATED POSTS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    renderRelatedPosts() {
        const relatedEl = document.getElementById('related-posts');
        if (!relatedEl) return;

        // Знаходимо схожі статті (та ж категорія, але не ця стаття)
        const related = blogPosts
            .filter(post => 
                post.id !== this.currentPost.id && 
                post.category === this.currentPost.category
            )
            .slice(0, 3);

        if (related.length === 0) {
            // Якщо немає схожих, показуємо просто останні
            related.push(...blogPosts
                .filter(post => post.id !== this.currentPost.id)
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 3)
            );
        }

        relatedEl.innerHTML = related.map(post => `
            <a href="blog-article.html?id=${post.id}" class="related-card">
                <div class="related-image">
                    <img src="${post.image}" alt="${post.title}">
                </div>
                <div class="related-info">
                    <span class="related-category">${post.categoryLabel}</span>
                    <h4>${post.title}</h4>
                    <p>${post.excerpt.substring(0, 100)}...</p>
                    <div class="related-meta">
                        📅 ${this.formatDate(post.date)} • ⏱️ ${post.readTime}
                    </div>
                </div>
            </a>
        `).join('');
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // NAVIGATION (Prev/Next)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    setupNavigation() {
        const currentIndex = blogPosts.findIndex(post => post.id === this.currentPost.id);
        
        const prevBtn = document.getElementById('prev-article');
        const nextBtn = document.getElementById('next-article');

        if (!prevBtn || !nextBtn) return;

        // Previous article
        if (currentIndex > 0) {
            const prevPost = blogPosts[currentIndex - 1];
            prevBtn.style.display = 'block';
            prevBtn.onclick = () => {
                window.location.href = `blog-article.html?id=${prevPost.id}`;
            };
        } else {
            prevBtn.style.display = 'none';
        }

        // Next article
        if (currentIndex < blogPosts.length - 1) {
            const nextPost = blogPosts[currentIndex + 1];
            nextBtn.style.display = 'block';
            nextBtn.onclick = () => {
                window.location.href = `blog-article.html?id=${nextPost.id}`;
            };
        } else {
            nextBtn.style.display = 'none';
        }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // UPDATE META TAGS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    updateMetaTags() {
        const post = this.currentPost;

        // Title
        document.getElementById('article-title').textContent = `${post.title} — Homestead Inferno`;
        
        // Description
        const descEl = document.getElementById('article-description');
        if (descEl) {
            descEl.setAttribute('content', post.excerpt);
        }

        // Додаємо Open Graph meta tags для соціальних мереж
        this.addMetaTag('og:title', post.title);
        this.addMetaTag('og:description', post.excerpt);
        this.addMetaTag('og:image', post.image);
        this.addMetaTag('og:url', window.location.href);
    }

    addMetaTag(property, content) {
        let meta = document.querySelector(`meta[property="${property}"]`);
        if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute('property', property);
            document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ERROR HANDLING
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    showError(message) {
        const mainEl = document.getElementById('article-main');
        if (mainEl) {
            mainEl.innerHTML = `
                <div class="error-message">
                    <h2>😕 ${message}</h2>
                    <p>Можливо, стаття була видалена або посилання невірне.</p>
                    <a href="blog.html" class="back-btn">← Повернутися до блогу</a>
                </div>
            `;
        }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // UTILITIES
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    formatDate(dateString) {
        const months = [
            'січня', 'лютого', 'березня', 'квітня', 'травня', 'червня',
            'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'
        ];
        
        const date = new Date(dateString);
        const day = date.getDate();
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        
        return `${day} ${month} ${year}`;
    }
}

// ═══════════════════════════════════════════════════════════════
// SHARE FUNCTIONS
// ═══════════════════════════════════════════════════════════════

function shareToTelegram() {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(document.querySelector('h1').textContent);
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
}

function shareToFacebook() {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
}

function copyLink() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = '✅ Скопійовано!';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
    });
}

// ═══════════════════════════════════════════════════════════════
// INITIALIZE
// ═══════════════════════════════════════════════════════════════

let articleApp;

document.addEventListener('DOMContentLoaded', () => {
    articleApp = new ArticleApp();
});
