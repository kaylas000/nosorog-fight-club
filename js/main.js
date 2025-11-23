/**
 * NOSOROG FIGHT CLUB
 * Main JavaScript file
 */

// Cart Manager
class CartManager {
    constructor() {
        this.storageKeys = {
            equipment: 'nosorogEquipmentCart',
            cosmetic: 'nosorogCosmeticCart',
            pharma: 'nosorogPharmaCart'
        };
        this.listeners = [];
        this.init();
    }

    init() {
        this.updateCartBadge();
        this.setupEventListeners();
        this.setupMobileFilters();
        this.setupFilters();
        
        // Listen for storage changes (from other tabs)
        window.addEventListener('storage', (e) => {
            if (Object.values(this.storageKeys).includes(e.key)) {
                this.updateCartBadge();
                this.notifyListeners();
            }
        });
    }

    setupEventListeners() {
        // Add to cart buttons
        document.querySelectorAll('.add-to-cart').forEach(btn => {
            btn.addEventListener('click', (e) => this.addToCart(e));
        });

        // Hamburger menu
        const hamburger = document.querySelector('.hamburger');
        const menu = document.querySelector('.menu');
        
        if (hamburger && menu) {
            hamburger.addEventListener('click', () => {
                menu.classList.toggle('active');
                hamburger.setAttribute('aria-expanded', menu.classList.contains('active'));
            });
        }

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (menu && hamburger && 
                !menu.contains(e.target) && 
                !hamburger.contains(e.target) &&
                menu.classList.contains('active')) {
                menu.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
            }
        });

        // Close menu on link click
        document.querySelectorAll('.menu a').forEach(link => {
            link.addEventListener('click', () => {
                if (menu && menu.classList.contains('active')) {
                    menu.classList.remove('active');
                    if (hamburger) {
                        hamburger.setAttribute('aria-expanded', 'false');
                    }
                }
            });
        });
    }

    setupMobileFilters() {
        const toggle = document.getElementById('mobileFilterToggle');
        const container = document.getElementById('mobileFiltersContainer');
        const toggleIcon = toggle?.querySelector('.mobile-filter-toggle');

        if (toggle && container && toggleIcon) {
            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                const isOpening = !container.classList.contains('active');

                // Close other open filter panels
                document.querySelectorAll('.mobile-filters-container.active').forEach(openContainer => {
                    if (openContainer !== container) {
                        openContainer.classList.remove('active');
                        const openToggle = openContainer.previousElementSibling?.querySelector('.mobile-filter-toggle');
                        if (openToggle) openToggle.classList.remove('active');
                    }
                });

                container.classList.toggle('active');
                toggleIcon.classList.toggle('active');

                if (isOpening) {
                    setTimeout(() => {
                        container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }, 100);
                }
            });
        }

        // Category buttons (mobile)
        document.querySelectorAll('.mobile-filter-btn[data-category]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.mobile-filter-btn[data-category]').forEach(b => {
                    b.classList.remove('active');
                });
                btn.classList.add('active');

                const category = btn.dataset.category;
                this.filterByCategory(category);

                // Close mobile filters
                if (container) {
                    container.classList.remove('active');
                    if (toggleIcon) toggleIcon.classList.remove('active');
                }
            });
        });

        // Filter buttons (mobile)
        document.querySelectorAll('.mobile-filter-btn[data-filter]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.mobile-filter-btn[data-filter]').forEach(b => {
                    b.classList.remove('active');
                });
                btn.classList.add('active');

                const filter = btn.dataset.filter;
                this.filterByStatus(filter);
            });
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (container && container.classList.contains('active') &&
                !container.contains(e.target) &&
                toggle && !toggle.contains(e.target)) {
                container.classList.remove('active');
                if (toggleIcon) toggleIcon.classList.remove('active');
            }
        });

        // Close on scroll
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            if (container && container.classList.contains('active')) {
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                    container.classList.remove('active');
                    if (toggleIcon) toggleIcon.classList.remove('active');
                }, 100);
            }
        });
    }

    setupFilters() {
        // Category buttons (desktop)
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const category = btn.dataset.category;
                this.filterByCategory(category);
            });
        });

        // Filter buttons (desktop)
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filter = btn.dataset.filter;
                this.filterByStatus(filter);
            });
        });
    }

    filterByCategory(category) {
        const serviceCards = document.querySelectorAll('.service-card');
        const productCards = document.querySelectorAll('.product-card');

        if (category === 'all') {
            serviceCards.forEach(card => card.style.display = 'block');
            productCards.forEach(card => card.style.display = 'block');
        } else if (category === 'services') {
            serviceCards.forEach(card => card.style.display = 'block');
            productCards.forEach(card => card.style.display = 'none');
        } else if (category === 'products') {
            serviceCards.forEach(card => card.style.display = 'none');
            productCards.forEach(card => card.style.display = 'block');
        }
    }

    filterByStatus(status) {
        const allCards = document.querySelectorAll('.service-card, .product-card');

        if (status === 'all') {
            allCards.forEach(card => card.style.display = 'block');
        } else {
            allCards.forEach(card => {
                if (card.dataset.status === status) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        }
    }

    addToCart(e) {
        const btn = e.target.closest('.add-to-cart');
        if (!btn) return;

        const product = {
            id: Date.now(),
            name: btn.dataset.product,
            price: parseInt(btn.dataset.price),
            category: btn.dataset.category,
            quantity: 1
        };

        const storageKey = this.storageKeys[product.category];
        if (!storageKey) {
            console.error('Неизвестная категория:', product.category);
            return;
        }

        const cart = JSON.parse(localStorage.getItem(storageKey) || '[]');
        cart.push(product);
        localStorage.setItem(storageKey, JSON.stringify(cart));

        this.updateCartBadge();
        this.notifyListeners();
        this.showNotification('Товар добавлен в корзину!');

        // Button animation
        const originalText = btn.innerHTML;
        btn.innerHTML = '<span>✓</span> Добавлено';
        btn.disabled = true;

        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }, 2000);
    }

    updateCartBadge() {
        const equipment = JSON.parse(localStorage.getItem(this.storageKeys.equipment) || '[]');
        const cosmetic = JSON.parse(localStorage.getItem(this.storageKeys.cosmetic) || '[]');
        const pharma = JSON.parse(localStorage.getItem(this.storageKeys.pharma) || '[]');

        const total = equipment.reduce((sum, item) => sum + item.quantity, 0) +
                     cosmetic.reduce((sum, item) => sum + item.quantity, 0) +
                     pharma.reduce((sum, item) => sum + item.quantity, 0);

        const badge = document.querySelector('.cart-count');

        if (badge) {
            if (total > 0) {
                badge.textContent = total > 99 ? '99+' : total;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }
    }

    addListener(callback) {
        this.listeners.push(callback);
    }

    notifyListeners() {
        const items = this.loadAllItems();
        this.listeners.forEach(callback => {
            try {
                callback(items);
            } catch (e) {
                console.error('Ошибка в listener:', e);
            }
        });
    }

    loadAllItems() {
        try {
            const equipment = JSON.parse(localStorage.getItem(this.storageKeys.equipment) || '[]');
            const cosmetic = JSON.parse(localStorage.getItem(this.storageKeys.cosmetic) || '[]');
            const pharma = JSON.parse(localStorage.getItem(this.storageKeys.pharma) || '[]');

            equipment.forEach(item => {
                if (!item.category) item.category = 'equipment';
            });
            cosmetic.forEach(item => {
                if (!item.category) item.category = 'cosmetic';
            });
            pharma.forEach(item => {
                if (!item.category) item.category = 'pharma';
            });

            return [...equipment, ...cosmetic, ...pharma];
        } catch (e) {
            console.error('Ошибка загрузки корзины:', e);
            return [];
        }
    }

    showNotification(message) {
        // Remove existing notifications
        document.querySelectorAll('.cart-notification').forEach(notif => notif.remove());

        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: var(--gold-metal);
            color: var(--black);
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            z-index: 10000;
            font-weight: 600;
            animation: slideInRight 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize cart manager when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.cartManager = new CartManager();
    });
} else {
    window.cartManager = new CartManager();
}

// Add animations CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);