/* ==========================================================================
   MASTER.JS — Shared behavior on every page that includes it (header + cart).
   ========================================================================== */

/* ----- Hamburger menu (mobile): open/close the menu and close when a link is clicked ----- */
const hamburger = document.querySelector('.js-hamburger');
const links = document.querySelector('.js-links');

if (hamburger && links) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active'); /* X animation */
        links.classList.toggle('open');       /* show/hide links */
    });

    links.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            links.classList.remove('open');
        });
    });
}

/* ----- Cart badge and cart button (same storage key as products + cart page) -----
   readCartFromStorage / getCartItemCount: read cart from localStorage.
   syncCartBadge: update the number on the 🛒 icon. Runs on DOMContentLoaded. */
const CART_KEY = 'football_cave_cart';

function readCartFromStorage() {
    try {
        const raw = localStorage.getItem(CART_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function getCartItemCount(cart) {
    return cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
}

function syncCartBadge() {
    const cartCountEl = document.querySelector('.cart-count');
    if (!cartCountEl) return;
    const cart = readCartFromStorage();
    cartCountEl.textContent = String(getCartItemCount(cart));
}

const cartBtn = document.querySelector('.cart-btn');
if (cartBtn) {
    cartBtn.addEventListener('click', () => {
        window.location.href = 'cart.html';
    });
}

/* Run once when the page is ready so the cart count is correct. */
document.addEventListener('DOMContentLoaded', syncCartBadge);