/* ==========================================================================
   PRODUCTS DATA — List of all products (in-memory; no server).
   Used by renderProducts(), renderDetails(), getFilteredAndSortedProducts(),
   and when adding to cart in setupCardInteractions().
   ========================================================================== */
const PRODUCTS = [
    {
        id: 1,
        name: 'Milan Jersey - 2007 Away',
        category: 'Jersey',
        brand: 'Adidas',
        price: 20,
        sizes: ['S', 'M', 'L', 'XL'],
        rating: 4.8,
        reviews: 124,
        stock: 18,
        bestSeller: true,
        createdAt: '2025-12-01',
        image: 'products-imgs/milan2007.jpg',
        description: 'Milan 2007 Away Jersey'
    },
    {
        id: 2,
        name: 'Manchester United Jersey - 2008 Home',
        category: 'Jersey',
        brand: 'Nike',
        price: 20,
        sizes: ['40', '41', '42', '43', '44'],
        rating: 4.9,
        reviews: 210,
        stock: 9,
        bestSeller: true,
        createdAt: '2026-01-10',
        image: 'products-imgs/manutd2008.jpg',
        description: 'Manchester United 2008  Home Jersey'
    },
    {
        id: 3,
        name: 'Real Madrid Jersey - 2017 Away',
        category: 'Jersey',
        brand: 'Adidas',
        price: 25,
        sizes: ['40', '41', '42', '43', '44'],
        rating: 4.5,
        reviews: 58,
        stock: 35,
        bestSeller: true,
        createdAt: '2025-08-15',
        image: 'products-imgs/realmadried2017.jpg',
        description: 'Real Madrid 2017 Away Jersey'
    },
    {
        id: 4,
        name: 'UCL Ball - 23/24',
        category: 'Ball',
        brand: 'Adidas',
        price: 15,
        sizes: ['5'],
        rating: 4.7,
        reviews: 96,
        stock: 0,
        bestSeller: true,
        createdAt: '2025-11-02',
        image: 'products-imgs/uclball23.jpg',
        description: 'UCL Ball 23/24'
    },
    {
        id: 5,
        name: 'Goalkeeper Gloves',
        category: 'Accessory',
        brand: 'Adidas',
        price: 45,
        sizes: ['M', 'L'],
        rating: 4.3,
        reviews: 41,
        stock: 14,
        bestSeller: false,
        createdAt: '2025-09-22',
        image: 'products-imgs/gloves.jpg',
        description: 'High-grip latex palm with finger protection, designed to give keepers confidence in every catch.'
    },
    {
        id: 6,
        name: 'Agility Drill',
        category: 'Training',
        brand: 'Umbro',
        price: 8,
        sizes: ['S', 'M', 'L', 'XL'],
        rating: 4.4,
        reviews: 68,
        stock: 22,
        bestSeller: false,
        createdAt: '2026-02-01',
        image: 'products-imgs/agilitydril.jpg',
        description: 'Marker Saucer Cones | Football Rugby Hockey Team Training Agility Drill.'
    },
    {
        id: 7,
        name: 'Shin Guards',
        category: 'Accessory',
        brand: 'Nike',
        price: 12,
        sizes: ['40', '43'],
        rating: 4.6,
        reviews: 39,
        stock: 27,
        bestSeller: false,
        createdAt: '2025-10-05',
        image: 'products-imgs/shinguards.jpg',
        description: 'Protect your dreams. Gear up, young players! 4 Don’t let anything stand between you and your goals. Stay in the game and stay protected with shin guards. Safety first, success second.'
    },
    {
        id: 8,
        name: 'Lamine Yamal Football Boots - F50',
        category: 'Boots',
        brand: 'Adidas',
        price: 50,
        sizes: ['40', '41', '42', '43'],
        rating: 4.2,
        reviews: 33,
        stock: 16,
        bestSeller: false,
        createdAt: '2025-07-12',
        image: 'products-imgs/lamine yamal botas.jpg',
        description: 'Lamine Yamal F50 Pink Boots'
    }
];

/* ==========================================================================
   CART (localStorage) — Same key as cart page so products and cart stay in sync.
   readCart / writeCart: load and save cart. getCartCount / syncCartCount: update
   the 🛒 badge. Used when you click “Add to cart” and on page load.
   ========================================================================== */
const PRODUCTS_CART_KEY = 'football_cave_cart';

function readCart() {
    try {
        const raw = localStorage.getItem(PRODUCTS_CART_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function writeCart(cart) {
    localStorage.setItem(PRODUCTS_CART_KEY, JSON.stringify(cart));
}

function getCartCount(cart) {
    return cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
}

function syncCartCount() {
    const cartCountEl = document.querySelector('.cart-count');
    if (!cartCountEl) return;
    const cart = readCart();
    cartCountEl.textContent = String(getCartCount(cart));
}

/* ==========================================================================
   DOM REFERENCES — Elements we need for the products list, details panel,
   empty state, toast, and all filter/sort inputs. Used by the functions below.
   ========================================================================== */
const productsListEl = document.getElementById('productsList');
const productDetailsEl = document.getElementById('productDetails');
const productsLayoutEl = document.querySelector('.products-layout');
const productsEmptyEl = document.getElementById('productsEmpty');
const cartToastEl = document.getElementById('cartToast');

let activeProductId = null;

function resetDetailsPanelPosition() {
    if (!productDetailsEl || !productsLayoutEl || !productsListEl) return;
    productDetailsEl.style.position = '';
    productDetailsEl.style.top = '';
    productDetailsEl.style.left = '';
    productDetailsEl.style.width = '';
    productDetailsEl.style.margin = '';
    productDetailsEl.style.zIndex = '';
    productDetailsEl.classList.remove('mobile-inline');

    if (productDetailsEl.parentElement !== productsLayoutEl || productsListEl.nextElementSibling !== productDetailsEl) {
        productsListEl.after(productDetailsEl);
    }
}

function hideDetails() {
    activeProductId = null;
    resetDetailsPanelPosition();
    renderDetails(null);
}

function placeDetailsUnderCard(card) {
    if (!productDetailsEl || !productsLayoutEl || !card) return;

    const cardWidth = Math.round(card.getBoundingClientRect().width);

    productDetailsEl.style.position = 'static';
    productDetailsEl.style.top = '';
    productDetailsEl.style.left = '';
    productDetailsEl.style.width = `${cardWidth}px`;
    productDetailsEl.style.maxWidth = '100%';
    productDetailsEl.style.margin = '10px 0 0 0';
    productDetailsEl.style.zIndex = '';
    productDetailsEl.classList.add('mobile-inline');

    if (card.nextElementSibling !== productDetailsEl) {
        card.after(productDetailsEl);
    }
}

const searchInputEl = document.getElementById('searchInput');
const categorySelectEl = document.getElementById('categorySelect');
const brandSelectEl = document.getElementById('brandSelect');
const priceMinEl = document.getElementById('priceMin');
const priceMaxEl = document.getElementById('priceMax');
const sizeSelectEl = document.getElementById('sizeSelect');
const ratingSelectEl = document.getElementById('ratingSelect');
const sortSelectEl = document.getElementById('sortSelect');

/* ----- Helper for sorting by date ----- */
function parseDate(value) {
    return new Date(value).getTime();
}

const TOAST_DURATION_MS = 3000;

/* ----- Toast at top of page (with loading bar) — shown when you click “Add to cart” ----- */
function showToast(message) {
    if (!cartToastEl) return;
    const msgEl = cartToastEl.querySelector('.cart-toast-message');
    const barEl = cartToastEl.querySelector('.cart-toast-loading-bar');
    if (msgEl) msgEl.textContent = message;
    cartToastEl.classList.remove('show');
    if (barEl) barEl.style.animation = 'none';
    cartToastEl.offsetHeight; // reflow to restart animation
    if (barEl) barEl.style.animation = `cart-toast-shrink ${TOAST_DURATION_MS}ms linear forwards`;
    cartToastEl.classList.add('show');
    setTimeout(() => {
        cartToastEl.classList.remove('show');
    }, TOAST_DURATION_MS);
}

function formatPrice(price) {
    return `$${price.toFixed(2)}`;
}

/* ==========================================================================
   RENDER PRODUCT LIST — Draw the product cards from a list (usually filtered).
   If list is empty, show the “No products found” message. Used by updateProductsView().
   ========================================================================== */
function renderProducts(list) {
    if (!productsListEl) return;

    productsListEl.innerHTML = '';

    if (!list.length) {
        productsEmptyEl.hidden = false;
        return;
    }

    productsEmptyEl.hidden = true;

    const fragment = document.createDocumentFragment();

    list.forEach(product => {
        const card = document.createElement('article');
        card.className = 'product-card';
        card.dataset.id = String(product.id);

        card.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
                ${product.bestSeller ? '<span class="badge badge-hot">Best Seller</span>' : ''}
                ${product.stock === 0 ? '<span class="badge badge-out">Out of stock</span>' : ''}
            </div>
            <div class="product-body">
                <span class="product-category">${product.category}</span>
                <h3 class="product-name">${product.name}</h3>
                <div class="product-meta">
                    <span class="product-price">${formatPrice(product.price)}</span>
                    <div class="product-rating">
                        ⭐ ${product.rating.toFixed(1)}
                        <span>(${product.reviews})</span>
                    </div>
                </div>
                <div class="product-stock">
                    ${product.stock > 0 ? `In stock — ${product.stock} left` : 'Currently unavailable'}
                </div>
                <div class="product-actions">
                    <button class="btn-add-cart" type="button" ${product.stock === 0 ? 'disabled' : ''}>
                        <span>Add to cart</span>
                    </button>
                </div>
            </div>
        `;

        fragment.appendChild(card);
    });

    productsListEl.appendChild(fragment);
}

/* ==========================================================================
   RENDER PRODUCT DETAILS — Update the right-hand panel with one product’s info
   (name, price, description, sizes, etc.). If product is null, show placeholder.
   Called when you click a card or when the list updates.
   ========================================================================== */
const DETAILS_ANIMATION_MS = 400;

function renderDetails(product) {
    if (!productDetailsEl) return;

    productDetailsEl.classList.remove('details-animate');

    if (!product) {
        productDetailsEl.classList.remove('has-selection');
        productDetailsEl.innerHTML = `
            <div class="details-placeholder">
                <h2>Product details</h2>
                <p>Select a product card to view full description, sizes, and stock info.</p>
            </div>
        `;
        requestAnimationFrame(() => {
            productDetailsEl.classList.add('details-animate');
        });
        return;
    }

    productDetailsEl.classList.add('has-selection');

    const sizeLabel = product.sizes && product.sizes.length
        ? product.sizes.join(', ')
        : 'One size / N/A';

    productDetailsEl.innerHTML = `
        <h2>Product details</h2>
        <p class="details-subtitle">You are viewing:</p>
        <div class="details-main-name">${product.name}</div>
        <div class="details-price">${formatPrice(product.price)}</div>
        <div class="details-rating">⭐ ${product.rating.toFixed(1)} rating · ${product.reviews} reviews</div>
        <p class="details-description">${product.description}</p>
        <div class="details-meta">
            <span><strong>Category:</strong> ${product.category}</span>
            <span><strong>Brand:</strong> ${product.brand}</span>
            <span><strong>Sizes:</strong> ${sizeLabel}</span>
            <span><strong>Availability:</strong> ${product.stock > 0 ? 'In Stock' : 'Out of Stock'}</span>
        </div>
    `;

    requestAnimationFrame(() => {
        productDetailsEl.classList.add('details-animate');
    });
}

/* ==========================================================================
   FILTER & SORT — Read all filter and sort inputs, then filter PRODUCTS and
   sort the result. Returns the array that renderProducts() and renderDetails() use.
   ========================================================================== */
function getFilteredAndSortedProducts() {
    const search = searchInputEl.value.trim().toLowerCase();
    const category = categorySelectEl.value;
    const brand = brandSelectEl.value;
    const minPrice = priceMinEl.value ? Number(priceMinEl.value) : null;
    const maxPrice = priceMaxEl.value ? Number(priceMaxEl.value) : null;
    const size = sizeSelectEl.value;
    const minRating = ratingSelectEl.value ? Number(ratingSelectEl.value) : null;
    const sortBy = sortSelectEl.value;

    let filtered = PRODUCTS.filter(p => {
        if (search && !p.name.toLowerCase().includes(search)) return false;
        if (category && p.category !== category) return false;
        if (brand && p.brand !== brand) return false;
        if (minPrice !== null && p.price < minPrice) return false;
        if (maxPrice !== null && p.price > maxPrice) return false;
        if (size) {
            const hasSize = (p.sizes || []).includes(size);
            if (!hasSize) return false;
        }
        if (minRating !== null && p.rating < minRating) return false;
        return true;
    });

    if (sortBy === 'price-asc') {
        filtered = filtered.slice().sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
        filtered = filtered.slice().sort((a, b) => b.price - a.price);
    } else if (sortBy === 'newest') {
        filtered = filtered.slice().sort((a, b) => parseDate(b.createdAt) - parseDate(a.createdAt));
    } else if (sortBy === 'bestseller') {
        filtered = filtered.slice().sort((a, b) => {
            if (a.bestSeller && !b.bestSeller) return -1;
            if (!a.bestSeller && b.bestSeller) return 1;
            return b.reviews - a.reviews;
        });
    }

    return filtered;
}

/* ----- One place to refresh list + details; used when filters/sort change ----- */
function updateProductsView() {
    const list = getFilteredAndSortedProducts();
    renderProducts(list);

    if (activeProductId) {
        const activeCard = productsListEl.querySelector(`.product-card[data-id="${activeProductId}"]`);
        const activeProduct = PRODUCTS.find(p => p.id === Number(activeProductId));
        if (activeCard && window.innerWidth <= 992) {
            placeDetailsUnderCard(activeCard);
        } else {
            resetDetailsPanelPosition();
        }
        renderDetails(activeProduct || null);
    } else {
        resetDetailsPanelPosition();
        const first = list[0] || null;
        renderDetails(first);
    }
}

/* ==========================================================================
   FILTER LISTENERS — Attach input/change listeners to every filter and sort
   control. When any of them change, updateProductsView() runs and the list updates.
   ========================================================================== */
function setupFilters() {
    const inputs = [
        searchInputEl,
        categorySelectEl,
        brandSelectEl,
        priceMinEl,
        priceMaxEl,
        sizeSelectEl,
        ratingSelectEl,
        sortSelectEl
    ];

    inputs.forEach(input => {
        if (!input) return;
        const evt = input.tagName === 'INPUT' ? 'input' : 'change';
        input.addEventListener(evt, updateProductsView);
    });
}

/* ==========================================================================
   CARD CLICKS — One listener on the products list. If you click “Add to cart”:
   update cart in localStorage, refresh badge, show toast. Otherwise: show that
   product’s details in the side panel.
   ========================================================================== */
function setupCardInteractions() {
    if (!productsListEl) return;

    productsListEl.addEventListener('click', (event) => {
        const target = event.target;
        const card = target.closest('.product-card');
        if (!card) return;

        const id = Number(card.dataset.id);
        const product = PRODUCTS.find(p => p.id === id);

        if (target.closest('.btn-add-cart')) {
            event.stopPropagation();
            if (!product || product.stock === 0) return;

            const cart = readCart();
            const existing = cart.find(item => item.id === product.id);
            if (existing) {
                const nextQty = Math.min((existing.quantity || 0) + 1, product.stock);
                existing.quantity = nextQty;
            } else {
                cart.push({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    maxStock: product.stock,
                    quantity: 1
                });
            }
            writeCart(cart);
            syncCartCount();
            showToast(`Added "${product.name}" to cart`);
            return;
        }

        /* Show product details and bring the panel into view when a card is clicked */
        activeProductId = id;

        if (window.innerWidth <= 992 && card) {
            placeDetailsUnderCard(card);
        } else {
            resetDetailsPanelPosition();
        }

        renderDetails(product);

        if (productDetailsEl && product) {
            if (productDetailsEl.classList.contains('mobile-inline')) {
                window.scrollTo({ top: card.getBoundingClientRect().top + window.scrollY - 20, behavior: 'smooth' });
            } else {
                productDetailsEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
    });
}

/* ==========================================================================
   INIT — When the products page loads: show full list and first product details,
   wire up filters, wire up card clicks (add to cart + show details), and sync
   the cart badge count.
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    renderProducts(PRODUCTS);
    /* Show placeholder until user clicks a card; filters will set first product when they change list */
    renderDetails(null);
    setupFilters();
    setupCardInteractions();
    syncCartCount();

    window.addEventListener('resize', () => {
        if (window.innerWidth > 992) {
            resetDetailsPanelPosition();
        } else if (activeProductId) {
            const activeCard = productsListEl.querySelector(`.product-card[data-id="${activeProductId}"]`);
            if (activeCard) placeDetailsUnderCard(activeCard);
        }
    });

    document.addEventListener('click', (event) => {
        const target = event.target;

        if (target.closest('.product-card') || target.closest('.product-details') || target.closest('.products-filters') || target.closest('.products-hero') || target.closest('.header-area') || target.closest('.cart-toast')) {
            return;
        }

        if (productsLayoutEl && productsLayoutEl.contains(target)) {
            hideDetails();
        }
    });
});

