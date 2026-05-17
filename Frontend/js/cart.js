/* ==========================================================================
   CART PAGE — Cart storage key and toast settings (used by showToast below)
   ========================================================================== */
const CART_STORAGE_KEY = 'football_cave_cart';
const TOAST_DURATION_MS = 3000;

const cartToastEl = document.getElementById('cartToast');

/* ----- Toast notification (top of page, with loading bar) -----
   Shows a short message when you change quantity or remove an item.
   Used by updateQuantity() and removeItem() below. */
function showToast(message) {
    if (!cartToastEl) return;
    const msgEl = cartToastEl.querySelector('.cart-toast-message');
    const barEl = cartToastEl.querySelector('.cart-toast-loading-bar');
    if (msgEl) msgEl.textContent = message;
    cartToastEl.classList.remove('show');
    if (barEl) barEl.style.animation = 'none';
    cartToastEl.offsetHeight;
    if (barEl) barEl.style.animation = `cart-toast-shrink ${TOAST_DURATION_MS}ms linear forwards`;
    cartToastEl.classList.add('show');
    setTimeout(() => cartToastEl.classList.remove('show'), TOAST_DURATION_MS);
}

/* ==========================================================================
   CART STORAGE — Read and write cart in localStorage
   loadCart() is used by renderCart(), updateQuantity(), and removeItem().
   saveCart() is called after any change to the cart.
   ========================================================================== */
function loadCart() {
    try {
        const raw = localStorage.getItem(CART_STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

/* ----- Helpers for display ----- */
function formatPriceCart(value) {
    return `$${value.toFixed(2)}`;
}

/* Returns total item count and subtotal; used by renderCart() to update the summary. */
function calculateTotals(cart) {
    let itemsCount = 0;
    let subtotal = 0;
    cart.forEach(item => {
        const qty = item.quantity || 0;
        itemsCount += qty;
        subtotal += (item.price || 0) * qty;
    });
    return { itemsCount, subtotal, total: subtotal };
}

/* ==========================================================================
   RENDER CART — Build the list of items and the order summary
   Uses loadCart(), formatPriceCart(), calculateTotals(). Called on load and
   after every updateQuantity() and removeItem().
   ========================================================================== */
function renderCart() {
    const cartItemsEl = document.getElementById('cartItems');
    const cartEmptyEl = document.getElementById('cartEmpty');
    const itemsCountEl = document.getElementById('cartItemsCount');
    const subtotalEl = document.getElementById('cartSubtotal');
    const totalEl = document.getElementById('cartTotal');

    if (!cartItemsEl || !cartEmptyEl || !itemsCountEl || !subtotalEl || !totalEl) return;

    const cart = loadCart();

    if (!cart.length) {
        cartItemsEl.innerHTML = '';
        cartEmptyEl.hidden = false;
        itemsCountEl.textContent = '0';
        subtotalEl.textContent = '$0.00';
        totalEl.textContent = '$0.00';
        const badge = document.querySelector('.cart-count');
        if (badge) badge.textContent = '0';
        return;
    }

    cartEmptyEl.hidden = true;

    const fragment = document.createDocumentFragment();

    cart.forEach(item => {
        const row = document.createElement('article');
        row.className = 'cart-item';
        row.dataset.id = String(item.id);

        const maxStock = item.maxStock != null ? item.maxStock : 99;
        const safeQty = Math.min(Math.max(item.quantity || 1, 1), maxStock);

        row.innerHTML = `
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="cart-item-main">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-meta">
                    <span>${formatPriceCart(item.price)}</span>
                    <span>Max: ${maxStock}</span>
                </div>
                <div class="cart-item-qty">
                    <button class="qty-btn btn-qty-minus" type="button">-</button>
                    <input class="qty-input" type="number" min="1" max="${maxStock}" value="${safeQty}">
                    <button class="qty-btn btn-qty-plus" type="button">+</button>
                </div>
            </div>
            <div class="cart-item-actions">
                <div class="cart-item-price">${formatPriceCart(item.price)}</div>
                <div class="cart-item-subtotal">Subtotal: ${formatPriceCart(item.price * safeQty)}</div>
                <button class="btn-remove" type="button">Remove</button>
            </div>
        `;

        fragment.appendChild(row);
    });

    cartItemsEl.innerHTML = '';
    cartItemsEl.appendChild(fragment);

    const totals = calculateTotals(cart);
    itemsCountEl.textContent = String(totals.itemsCount);
    subtotalEl.textContent = formatPriceCart(totals.subtotal);
    totalEl.textContent = formatPriceCart(totals.total);

    const badge = document.querySelector('.cart-count');
    if (badge) {
        badge.textContent = String(totals.itemsCount);
    }
}

/* ==========================================================================
   UPDATE QUANTITY — Change how many of one product are in the cart
   Saves cart, re-renders the list, then shows a toast (increase/decrease/updated).
   Called when you click + / - or type in the quantity input.
   ========================================================================== */
function updateQuantity(id, newQty, action) {
    const cart = loadCart();
    const item = cart.find(p => p.id === id);
    if (!item) return;

    const maxStock = item.maxStock != null ? item.maxStock : 99;
    const qty = Math.min(Math.max(newQty, 1), maxStock);
    item.quantity = qty;
    const name = item.name || 'Item';

    saveCart(cart);
    renderCart();

    if (action === 'increase') {
        showToast(`Increased "${name}" quantity to ${qty}`);
    } else if (action === 'decrease') {
        showToast(`Decreased "${name}" quantity to ${qty}`);
    } else {
        showToast(`Updated "${name}" quantity to ${qty}`);
    }
}

/* ==========================================================================
   REMOVE ITEM — Remove one product from the cart completely
   Saves the new cart, re-renders, then shows a “Removed … from cart” toast.
   ========================================================================== */
function removeItem(id) {
    const cart = loadCart();
    const item = cart.find(p => p.id === id);
    const name = (item && item.name) ? item.name : 'Item';
    const next = cart.filter(p => p.id !== id);
    saveCart(next);
    renderCart();
    showToast(`Removed "${name}" from cart`);
}

/* ==========================================================================
   PAGE SETUP — When the cart page loads: render the cart, then attach
   click handlers (quantity +/- and Remove) and change handler (quantity input).
   Checkout and Continue Shopping buttons are wired here too.
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    const cartItemsEl = document.getElementById('cartItems');
    const btnCheckout = document.getElementById('btnCheckout');
    const btnContinue = document.getElementById('btnContinue');

    renderCart();

    if (cartItemsEl) {
        cartItemsEl.addEventListener('click', (event) => {
            const target = event.target;
            const row = target.closest('.cart-item');
            if (!row) return;

            const id = Number(row.dataset.id);

            if (target.classList.contains('btn-qty-minus')) {
                const input = row.querySelector('.qty-input');
                if (!input) return;
                const current = Number(input.value) || 1;
                updateQuantity(id, current - 1, 'decrease');
            } else if (target.classList.contains('btn-qty-plus')) {
                const input = row.querySelector('.qty-input');
                if (!input) return;
                const current = Number(input.value) || 1;
                updateQuantity(id, current + 1, 'increase');
            } else if (target.classList.contains('btn-remove')) {
                removeItem(id);
            }
        });

        cartItemsEl.addEventListener('change', (event) => {
            const target = event.target;
            if (!target.classList.contains('qty-input')) return;

            const row = target.closest('.cart-item');
            if (!row) return;

            const id = Number(row.dataset.id);
            const value = Number(target.value) || 1;
            updateQuantity(id, value, 'set');
        });
    }

    if (btnCheckout) {
        btnCheckout.addEventListener('click', () => {
            const cart = loadCart();
            if (!cart.length) {
                alert('There are no products in your cart. Please add items before proceeding to checkout.');
                return;
            }
            window.location.href = 'ckeckout.html';
        });
    }

    if (btnContinue) {
        btnContinue.addEventListener('click', () => {
            window.location.href = 'products.html';
        });
    }
});

