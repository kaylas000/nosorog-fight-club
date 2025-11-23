// NOSOROG FIGHT CLUB CART PAGE LOGIC
// All code vanilla JS, style and DX as in original site example

class NosorogCart {
  constructor() {
    this.storageKeys = {
      equipment: 'nosorogEquipmentCart',
      cosmetic: 'nosorogCosmeticCart',
      pharma: 'nosorogPharmaCart'
    };
    this.cartItems = [];
    this.delivery = 0;
    this.setupListeners();
    this.loadCart();
  }

  setupListeners() {
    // Delivery options
    document.querySelectorAll('input[name="delivery"]').forEach(input => {
      input.addEventListener('change', e => {
        this.delivery = +e.target.value;
        this.renderSummary();
      });
    });
    // Checkout
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', e => {
        e.preventDefault();
        if (this.cartItems.length) {
          alert('Заказ оформлен! Наш менеджер свяжется с вами.');
          this.clearCart();
        }
      });
    }
  }

  loadCart() {
    try {
      const eq = JSON.parse(localStorage.getItem(this.storageKeys.equipment) || '[]');
      const cs = JSON.parse(localStorage.getItem(this.storageKeys.cosmetic) || '[]');
      const ph = JSON.parse(localStorage.getItem(this.storageKeys.pharma) || '[]');
      this.cartItems = [...eq, ...cs, ...ph];
    } catch { this.cartItems = []; }
    this.renderCart();
    this.renderSummary();
  }

  saveCart() {
    // Save split by category
    const eq = this.cartItems.filter(i => i.category === 'equipment');
    const cs = this.cartItems.filter(i => i.category === 'cosmetic');
    const ph = this.cartItems.filter(i => i.category === 'pharma');
    localStorage.setItem(this.storageKeys.equipment, JSON.stringify(eq));
    localStorage.setItem(this.storageKeys.cosmetic, JSON.stringify(cs));
    localStorage.setItem(this.storageKeys.pharma, JSON.stringify(ph));
  }

  renderCart() {
    const list = document.getElementById('cartItemsList');
    const badge = document.getElementById('cartCountBadge');
    if (!list) return;
    list.innerHTML = '';
    if (this.cartItems.length === 0) {
      list.innerHTML = `<div class="empty-cart">
        <div class="empty-cart-icon">🛒</div>
        <h3>Ваша корзина пуста</h3>
        <p>Добавьте товары из магазина</p>
        <a href="shop.html" class="btn-primary">Перейти в магазин</a>
      </div>`;
      if (badge) badge.textContent = '0 товаров';
      return;
    }
    this.cartItems.forEach((product, idx) => {
      const catIcon = product.category === 'equipment' ? '🥊' : (product.category === 'cosmetic' ? '🧼' : '💊');
      const prod = document.createElement('div');
      prod.className = 'cart-product';
      prod.innerHTML = `
        <div class="cart-product-img">
          <img src="${this.getProductImg(product)}" alt="${product.name}">
        </div>
        <div class="cart-product-info">
          <div class="cart-product-title">${product.name}</div>
          <div class="cart-product-category">${catIcon} ${this.getCategoryName(product.category)}</div>
        </div>
        <div class="cart-product-controls">
          <button class="cart-qty-btn" data-act="dec" data-idx="${idx}" title="Убавить">-</button>
          <span class="cart-product-qty">${product.quantity || 1}</span>
          <button class="cart-qty-btn" data-act="inc" data-idx="${idx}" title="Добавить">+</button>
        </div>
        <div class="cart-product-price">${this.formatPrice(product.price * (product.quantity || 1))}</div>
        <button class="cart-remove-btn" data-idx="${idx}" title="Удалить">×</button>
      `;
      list.appendChild(prod);
    });
    if (badge) badge.textContent = `${this.cartItems.reduce((s,p)=>s+(p.quantity||1),0)} товаров`;
    // Handler for qty and remove
    list.querySelectorAll('.cart-qty-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        const i = +btn.dataset.idx;
        if (btn.dataset.act === 'inc') this.updateQty(i, 1);
        else this.updateQty(i, -1);
      });
    });
    list.querySelectorAll('.cart-remove-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        const i = +btn.dataset.idx;
        this.deleteItem(i);
      });
    });
    this.renderSummary();
  }

  renderSummary() {
    const subtotal = this.cartItems.reduce((sum,p) => sum + (p.price * (p.quantity || 1)), 0);
    const subtotalEl = document.getElementById('subtotalAmount');
    const deliveryEl = document.getElementById('deliveryAmount');
    const totalEl = document.getElementById('totalAmount');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const checkoutTotal = document.getElementById('checkoutTotal');
    if (subtotalEl) subtotalEl.textContent = this.formatPrice(subtotal);
    if (deliveryEl) deliveryEl.textContent = this.delivery ? this.formatPrice(this.delivery) : '0₽';
    if (totalEl) totalEl.textContent = this.formatPrice(subtotal + this.delivery);
    if (checkoutBtn) checkoutBtn.disabled = !(subtotal > 0);
    if (checkoutTotal) checkoutTotal.textContent = this.formatPrice(subtotal+this.delivery);
  }

  updateQty(idx, delta) {
    if (!this.cartItems[idx]) return;
    const item = this.cartItems[idx];
    item.quantity = Math.max(1, (item.quantity || 1) + delta);
    this.saveCart();
    this.renderCart();
  }
  deleteItem(idx) {
    this.cartItems.splice(idx, 1);
    this.saveCart();
    this.renderCart();
  }
  clearCart() {
    this.cartItems = [];
    this.saveCart();
    this.renderCart();
    this.renderSummary();
  }
  formatPrice(val) { return (val || 0).toLocaleString('ru-RU') + '₽'; }
  getProductImg(product) {
    // Выбираем emoji вместо картинок (можно позже добавить соответствие)
    if (product.category === 'equipment') return 'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 60 60%27%3E%3Crect fill=%22222224%22 width=%2260%22 height=%2260%22/%3E%3Ctext x=%2250%25%22 y=%2255%25%22 text-anchor=%22middle%22 fill=%23C8B273%22 font-size=%2230%22%3E🥊%3C/text%3E%3C/svg%3E';
    if (product.category === 'cosmetic') return 'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 60 60%27%3E%3Crect fill=%22222224%22 width=%2260%22 height=%2260%22/%3E%3Ctext x=%2250%25%22 y=%2255%25%22 text-anchor=%22middle%22 fill=%238B5FBF%22 font-size=%2230%22%3E🧼%3C/text%3E%3C/svg%3E';
    return 'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 60 60%27%3E%3Crect fill=%22222224%22 width=%2260%22 height=%2260%22/%3E%3Ctext x=%2250%25%22 y=%2255%25%22 text-anchor=%22middle%22 fill=%234CAF50%22 font-size=%2230%22%3E💊%3C/text%3E%3C/svg%3E';
  }
  getCategoryName(cat) {
    if (cat === 'equipment') return 'Экипировка';
    if (cat === 'cosmetic') return 'Косметика';
    if (cat === 'pharma') return 'Аптека';
    return 'Товар';
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new NosorogCart());
} else {
  new NosorogCart();
}
