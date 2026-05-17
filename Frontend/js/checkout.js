/* ==========================================================================
   CHECKOUT PAGE — Uses cart from localStorage to show summary and place order.
   ========================================================================== */

const CHECKOUT_CART_KEY = 'football_cave_cart';
const ORDERS_STORAGE_KEY = 'football_cave_orders';

/* Local cart + orders helpers
   - loadCheckoutCart(): read current cart from localStorage (shared with cart/products pages)
   - readOrders()/saveOrders(): simple “fake database” of past orders in localStorage. */
function loadCheckoutCart() {
    try {
        const raw = localStorage.getItem(CHECKOUT_CART_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function saveOrders(orders) {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
}

function readOrders() {
    try {
        const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

/* Format numbers as money with 2 decimal places for the summary + items list. */
function formatPriceCheckout(value) {
    return `$${value.toFixed(2)}`;
}

/* Derive checkout totals from the raw cart:
   - subtotal: sum(price * qty)
   - shipping: simple flat $5 fee when there is at least one item
   - tax: 10% of subtotal
   - total: everything combined. */
function calculateCheckoutTotals(cart) {
    let itemsCount = 0;
    let subtotal = 0;
    cart.forEach(item => {
        const qty = item.quantity || 0;
        itemsCount += qty;
        subtotal += (item.price || 0) * qty;
    });
    const shipping = subtotal > 0 ? 5 : 0;
    const tax = subtotal * 0.1;
    const total = subtotal + shipping + tax;
    return { itemsCount, subtotal, shipping, tax, total };
}

/* Build the right-hand “Order summary” box:
   - if cart is empty => hide form, show “empty” section
   - if cart has items => render each line item + update all totals. */
function renderCheckoutSummary() {
    const cart = loadCheckoutCart();
    const summaryItemsEl = document.getElementById('summaryItems');
    const summaryItemsCountEl = document.getElementById('summaryItemsCount');
    const summarySubtotalEl = document.getElementById('summarySubtotal');
    const summaryShippingEl = document.getElementById('summaryShipping');
    const summaryTaxEl = document.getElementById('summaryTax');
    const summaryTotalEl = document.getElementById('summaryTotal');
    const summaryNoteEl = document.getElementById('summaryNote');
    const checkoutLayoutEl = document.querySelector('.checkout-layout');
    const checkoutEmptyEl = document.getElementById('checkoutEmpty');

    if (!summaryItemsEl || !summaryItemsCountEl || !summarySubtotalEl || !summaryShippingEl || !summaryTaxEl || !summaryTotalEl) {
        return;
    }

    if (!cart.length) {
        if (summaryItemsEl) summaryItemsEl.innerHTML = '';
        if (summaryItemsCountEl) summaryItemsCountEl.textContent = '0';
        if (summarySubtotalEl) summarySubtotalEl.textContent = '$0.00';
        if (summaryShippingEl) summaryShippingEl.textContent = '$0.00';
        if (summaryTaxEl) summaryTaxEl.textContent = '$0.00';
        if (summaryTotalEl) summaryTotalEl.textContent = '$0.00';
        if (checkoutLayoutEl) checkoutLayoutEl.hidden = true;
        if (checkoutEmptyEl) checkoutEmptyEl.hidden = false;
        return;
    }

    if (checkoutLayoutEl) checkoutLayoutEl.hidden = false;
    if (checkoutEmptyEl) checkoutEmptyEl.hidden = true;

    const fragment = document.createDocumentFragment();

    cart.forEach(item => {
        const qty = item.quantity || 0;
        const li = document.createElement('div');
        li.className = 'summary-item';
        li.innerHTML = `
            <div class="summary-item-main">
                <div class="summary-item-name">${item.name}</div>
                <div class="summary-item-meta">Qty: ${qty} · ${formatPriceCheckout(item.price)}</div>
            </div>
            <div class="summary-item-price">${formatPriceCheckout(item.price * qty)}</div>
        `;
        fragment.appendChild(li);
    });

    summaryItemsEl.innerHTML = '';
    summaryItemsEl.appendChild(fragment);

    const totals = calculateCheckoutTotals(cart);
    summaryItemsCountEl.textContent = String(totals.itemsCount);
    summarySubtotalEl.textContent = formatPriceCheckout(totals.subtotal);
    summaryShippingEl.textContent = formatPriceCheckout(totals.shipping);
    summaryTaxEl.textContent = formatPriceCheckout(totals.tax);
    summaryTotalEl.textContent = formatPriceCheckout(totals.total);

    if (summaryNoteEl) {
        summaryNoteEl.textContent = totals.shipping > 0
            ? 'Includes flat $5 shipping and 10% estimated tax.'
            : 'Includes 10% estimated tax.';
    }
}

/* Toggle the required flag on all card fields at once so that
   “Cash on Delivery” does not force the user to enter card details. */
function setCardFieldsRequired(isRequired) {
    const fields = [
        document.getElementById('cardName'),
        document.getElementById('cardNumber'),
        document.getElementById('cardExpiry'),
        document.getElementById('cardCvc')
    ];
    fields.forEach(input => {
        if (!input) return;
        input.required = isRequired;
    });
}

/* Show/hide the card details block based on selected payment method.
   Also keeps browser validation in sync via setCardFieldsRequired(). */
function togglePaymentFields(method) {
    const cardFieldsEl = document.getElementById('cardFields');
    if (!cardFieldsEl) return;
    if (method === 'card') {
        cardFieldsEl.style.display = 'grid';
        setCardFieldsRequired(true);
    } else {
        cardFieldsEl.style.display = 'none';
        setCardFieldsRequired(false);
    }
}

/* Generate a human‑readable but unique order id like “FC-LKJ2...”.
   This is stored with the order and shown on the confirmation card. */
function generateOrderId() {
    const base = Date.now().toString(36).toUpperCase();
    return `FC-${base}`;
}

/* After a successful checkout, clear the cart everywhere (storage + header badge). */
function clearCheckoutCart() {
    localStorage.setItem(CHECKOUT_CART_KEY, JSON.stringify([]));
    const badge = document.querySelector('.cart-count');
    if (badge) {
        badge.textContent = '0';
    }
}

/* Main submit handler:
   1) Validate required fields and that there is at least one cart item
   2) Build an order object (customer, shipping, payment, items, totals)
   3) Append it to localStorage “orders”, clear cart, and show confirmation UI. */
function handleCheckoutSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const errorEl = document.getElementById('formError');
    const btnPlaceOrder = document.getElementById('btnPlaceOrder');

    if (errorEl) {
        errorEl.textContent = '';
    }

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const cart = loadCheckoutCart();
    if (!cart.length) {
        if (errorEl) errorEl.textContent = 'Your cart is empty. Please add products before checking out.';
        return;
    }

    const paymentMethodEl = form.querySelector('input[name="paymentMethod"]:checked');
    const paymentMethod = paymentMethodEl ? paymentMethodEl.value : null;
    if (!paymentMethod) {
        if (errorEl) errorEl.textContent = 'Please select a payment method.';
        return;
    }

    if (btnPlaceOrder) {
        btnPlaceOrder.disabled = true;
        btnPlaceOrder.textContent = 'Processing...';
    }

    const orderTotals = calculateCheckoutTotals(cart);
    const orderId = generateOrderId();

    const order = {
        id: orderId,
        createdAt: new Date().toISOString(),
        customer: {
            fullName: form.fullName.value.trim(),
            email: form.email.value.trim(),
            phone: form.phone.value.trim()
        },
        shipping: {
            address: form.address.value.trim(),
            city: form.city.value.trim(),
            postalCode: form.postalCode.value.trim(),
            notes: form.orderNotes.value.trim()
        },
        payment: {
            method: paymentMethod,
            last4: paymentMethod === 'card'
                ? (form.cardNumber.value.replace(/\s+/g, '').slice(-4) || null)
                : null
        },
        items: cart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity || 0
        })),
        totals: orderTotals
    };

    const existingOrders = readOrders();
    existingOrders.push(order);
    saveOrders(existingOrders);

    clearCheckoutCart();
    renderCheckoutSummary();

    const layoutEl = document.querySelector('.checkout-layout');
    const confirmationEl = document.getElementById('checkoutConfirmation');
    const confirmationMsgEl = document.getElementById('confirmationMessage');
    const orderIdTextEl = document.getElementById('orderIdText');

    if (layoutEl) layoutEl.hidden = true;
    if (confirmationEl) confirmationEl.hidden = false;
    if (orderIdTextEl) orderIdTextEl.textContent = orderId;
    if (confirmationMsgEl) {
        confirmationMsgEl.textContent = `Thank you, ${order.customer.fullName}. Your payment is confirmed and your order is being prepared.`;
    }

    if (btnPlaceOrder) {
        btnPlaceOrder.disabled = false;
        btnPlaceOrder.textContent = 'Place order securely';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    renderCheckoutSummary();

    const form = document.getElementById('checkoutForm');
    if (form) {
        form.addEventListener('submit', handleCheckoutSubmit);
    }

    const paymentInputs = document.querySelectorAll('input[name="paymentMethod"]');
    paymentInputs.forEach(input => {
        input.addEventListener('change', () => {
            togglePaymentFields(input.value);
        });
    });

    const initialMethod = (document.querySelector('input[name="paymentMethod"]:checked') || {}).value || 'card';
    togglePaymentFields(initialMethod);
});

