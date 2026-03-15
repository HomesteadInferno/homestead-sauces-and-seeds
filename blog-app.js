// ═══════════════════════════════════════════════════════════════
// 🔥 BLOG APP — HOMESTEAD INFERNO
// Динамічна система блогу з фільтрами, пошуком та пагінацією
// ═══════════════════════════════════════════════════════════════

class BlogApp {
    constructor() {
        this.currentCategory = 'all';
        this.currentPage = 1;
        this.postsPerPage = 6;
        this.searchQuery = '';
        
        this.init();
    }

    init() {
        this.renderFeaturedPost();
        this.renderPopularPosts();
        this.renderPosts();
        this.attachEventListeners();
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // RENDER FEATURED POST
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    renderFeaturedPost() {
        const featuredPost = blogPosts.find(post => post.featured);
        if (!featuredPost) return;

        const container = document.getElementById('featured-post');
        if (!container) return;

        container.innerHTML = `
            <div class="featured-post-content">
                <div class="featured-post-image">
                    <img src="${featuredPost.image}" alt="${featuredPost.title}">
                    <span class="featured-badge">⭐ Головна стаття</span>
                </div>
                <div class="featured-post-text">
                    <div class="featured-category">${featuredPost.categoryLabel}</div>
                    <h2>${featuredPost.title}</h2>
                    <div class="featured-meta">
                        <span>📅 ${this.formatDate(featuredPost.date)}</span>
                        <span>⏱️ ${featuredPost.readTime}</span>
                        <span>✍️ ${featuredPost.author}</span>
                    </div>
                    <p>${featuredPost.excerpt}</p>
                    <button class="read-more-btn" onclick="blogApp.openPost('${featuredPost.id}')">
                        Читати повністю →
                    </button>
                </div>
            </div>
        `;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // RENDER POPULAR POSTS (Sidebar)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    renderPopularPosts() {
        const container = document.getElementById('popular-posts');
        if (!container) return;

        // Беремо топ-5 найновіших
        const popular = blogPosts
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);

        container.innerHTML = popular.map(post => `
            <div class="popular-post-item" onclick="blogApp.openPost('${post.id}')">
                <div class="popular-post-thumb">
                    <img src="${post.image}" alt="${post.title}">
                </div>
                <div class="popular-post-info">
                    <h4>${post.title}</h4>
                    <p>${this.formatDate(post.date)} • ${post.readTime}</p>
                </div>
            </div>
        `).join('');
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // RENDER POSTS GRID
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    renderPosts() {
        const container = document.getElementById('blog-posts');
        if (!container) return;

        let filteredPosts = this.getFilteredPosts();
        
        // Pagination
        const startIndex = (this.currentPage - 1) * this.postsPerPage;
        const endIndex = startIndex + this.postsPerPage;
        const postsToShow = filteredPosts.slice(startIndex, endIndex);

        if (postsToShow.length === 0) {
            container.innerHTML = `
                <div class="no-results">
                    <h3>😕 Нічого не знайдено</h3>
                    <p>Спробуйте інший фільтр або пошуковий запит</p>
                </div>
            `;
            this.updateLoadMoreButton(false);
            return;
        }

        container.innerHTML = postsToShow.map(post => this.createPostCard(post)).join('');
        
        // Update Load More button
        const hasMore = endIndex < filteredPosts.length;
        this.updateLoadMoreButton(hasMore);
    }

    createPostCard(post) {
        return `
            <article class="blog-post-card" onclick="blogApp.openPost('${post.id}')">
                <div class="post-image">
                    <img src="${post.image}" alt="${post.title}">
                    <span class="post-category-badge">${post.categoryLabel}</span>
                </div>
                <div class="post-content">
                    <div class="post-meta">
                        <span>📅 ${this.formatDate(post.date)}</span>
                        <span>⏱️ ${post.readTime}</span>
                    </div>
                    <h3>${post.title}</h3>
                    <p class="post-excerpt">${post.excerpt}</p>
                    <a href="#" class="post-read-more" onclick="event.preventDefault()">
                        Читати далі →
                    </a>
                </div>
            </article>
        `;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // FILTERING
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    getFilteredPosts() {
        let posts = [...blogPosts];

        // Filter by category
        if (this.currentCategory !== 'all') {
            posts = posts.filter(post => post.category === this.currentCategory);
        }

        // Filter by search query
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            posts = posts.filter(post => 
                post.title.toLowerCase().includes(query) ||
                post.excerpt.toLowerCase().includes(query) ||
                post.tags.some(tag => tag.toLowerCase().includes(query))
            );
        }

        // Sort by date (newest first)
        posts.sort((a, b) => new Date(b.date) - new Date(a.date));

        return posts;
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // SEARCH
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    handleSearch(query) {
        this.searchQuery = query;
        this.currentPage = 1;
        this.renderPosts();
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // CATEGORY FILTER
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    filterByCategory(category) {
        this.currentCategory = category;
        this.currentPage = 1;
        this.renderPosts();

        // Update active button
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.category === category) {
                btn.classList.add('active');
            }
        });
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // LOAD MORE
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    loadMore() {
        this.currentPage++;
        
        const filteredPosts = this.getFilteredPosts();
        const startIndex = (this.currentPage - 1) * this.postsPerPage;
        const endIndex = startIndex + this.postsPerPage;
        const newPosts = filteredPosts.slice(startIndex, endIndex);

        const container = document.getElementById('blog-posts');
        newPosts.forEach(post => {
            container.innerHTML += this.createPostCard(post);
        });

        // Update button
        const hasMore = endIndex < filteredPosts.length;
        this.updateLoadMoreButton(hasMore);
    }

    updateLoadMoreButton(show) {
        const btn = document.getElementById('load-more');
        if (!btn) return;

        if (show) {
            btn.style.display = 'inline-block';
            btn.disabled = false;
        } else {
            btn.style.display = 'none';
        }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // OPEN POST (Navigate to article page)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    openPost(postId) {
        // Save to localStorage for article page
        localStorage.setItem('currentPost', postId);
        // Navigate to article page
        window.location.href = `blog-article.html?id=${postId}`;
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

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // EVENT LISTENERS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    attachEventListeners() {
        // Category buttons
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.filterByCategory(btn.dataset.category);
            });
        });

        // Search
        const searchInput = document.getElementById('blog-search');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.handleSearch(e.target.value);
                }, 300); // Debounce 300ms
            });
        }

        // Load More button
        const loadMoreBtn = document.getElementById('load-more');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.loadMore();
            });
        }

        // Tag clicks
        document.querySelectorAll('.tag').forEach(tag => {
            tag.addEventListener('click', (e) => {
                e.preventDefault();
                const tagText = tag.textContent.replace('#', '');
                this.handleSearch(tagText);
            });
        });

        // Archive links
        document.querySelectorAll('.archive-list a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                // Filter by month (можна додати функціонал)
                console.log('Archive filter:', link.dataset.month);
            });
        });
    }
}

// ═══════════════════════════════════════════════════════════════
// INITIALIZE APP
// ═══════════════════════════════════════════════════════════════

let blogApp;

document.addEventListener('DOMContentLoaded', () => {
    blogApp = new BlogApp();
});
