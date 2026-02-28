// @ts-nocheck
// Cart functionality
let cart = [];
let cartCount = 0;

// Product data with multiple images
const productData = {
    "Black Elite Embroidered Men's Suit": {
        price: 8000,
        images: [
            "images/Black1.jpeg",
            "images/Black2.jpeg",
            "images/Black3.jpeg"
        ]
    },
    "Amberwood Brown Orange Blended Suit": {
        price: 3499,
        images: [
            "images/Brown2.jpeg",
            "images/Brown1.jpeg",
            "images/Brown3.jpeg"
        ]
    },
    "Olive Regal Stitch Suit": {
        price: 3299,
        images: [
            "images/Green1.jpeg",
            "images/GreenChest.jpeg",
            "images/Green2.jpeg"
        ]
    },
    "Black Signature Kurta Trouser Set": {
        price: 7350,
        images: [
            "images/blacks1.jpeg",
            "images/blacks2.jpeg"
        ]
    },
    "Navy Classic Slim-Fit Suit": {
        price: 6990,
        images: [
            "images/Navyblue1.jpeg",
            "images/Navyblue2.jpeg"
        ]
    },
    "Arctic White Classic Suit": {
        price: 6990,
        images: [
            "images/w1.jpeg",
            "images/w2.jpeg"
        ]
    },
    "Ivory Pearl Shalwar Kameez": {
        price: 7950,
        images: [
            "images/owhite1.jpeg",
            "images/owhite2.jpeg"
        ]
    }
};

// Current image indices for each product
let currentImageIndices = {};

// Initialize current image indices
Object.keys(productData).forEach(productName => {
    currentImageIndices[productName] = 0;
});

// Filter Panel Toggle
function toggleFilter() {
    const filterPanel = document.getElementById('filterPanel');
    const filterBtn = document.querySelector('.filter-btn');
    filterPanel.classList.toggle('active');
    filterBtn.classList.toggle('active');
}

// Apply Filters
function applyFilters() {
    const priceFilters = Array.from(document.querySelectorAll('input[name="price"]:checked')).map(cb => cb.value);
    const collectionFilters = Array.from(document.querySelectorAll('input[name="collection"]:checked')).map(cb => cb.value);
    const productCards = document.querySelectorAll('.product-card');

    productCards.forEach(card => {
        const price = parseInt(card.dataset.price);
        const collection = card.dataset.collection;
        let showProduct = true;

        if (priceFilters.length > 0) {
            const priceMatch = priceFilters.some(filter => {
                if (filter === '0-3000') return price < 3000;
                if (filter === '3000-5000') return price >= 3000 && price <= 5000;
                if (filter === '5000-10000') return price > 5000 && price <= 10000;
                if (filter === '10000+') return price > 10000;
                return false;
            });
            showProduct = showProduct && priceMatch;
        }

        if (collectionFilters.length > 0) {
            const collectionMatch = collectionFilters.includes(collection);
            showProduct = showProduct && collectionMatch;
        }

        if (showProduct) {
            card.classList.remove('hidden');
        } else {
            card.classList.add('hidden');
        }
    });
}

// Clear all filters
function clearFilters() {
    document.querySelectorAll('.filter-panel input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
    });
    document.querySelectorAll('.product-card').forEach(card => {
        card.classList.remove('hidden');
    });
}

// Sort Products
function sortProducts() {
    const sortValue = document.getElementById('sortSelect').value;
    const productsGrid = document.getElementById('productsGrid');
    const productCards = Array.from(productsGrid.querySelectorAll('.product-card'));

    if (!window.originalOrder) {
        window.originalOrder = productCards.slice();
    }

    let sortedCards;
    switch (sortValue) {
        case 'price-low':
            sortedCards = productCards.sort((a, b) => parseInt(a.dataset.price) - parseInt(b.dataset.price));
            break;
        case 'price-high':
            sortedCards = productCards.sort((a, b) => parseInt(b.dataset.price) - parseInt(a.dataset.price));
            break;
        case 'newest':
            sortedCards = productCards.slice().reverse();
            break;
        case 'featured':
        default:
            sortedCards = window.originalOrder.slice();
            break;
    }

    productsGrid.innerHTML = '';
    sortedCards.forEach(card => productsGrid.appendChild(card));
}

// Toggle mobile menu
function toggleMenu() {
    const navMenu = document.getElementById('navMenu');
    navMenu.classList.toggle('active');
}

// Toggle search bar
function toggleSearch() {
    const searchBar = document.getElementById('searchBar');
    const searchInput = document.getElementById('searchInput');
    searchBar.classList.toggle('active');

    if (searchBar.classList.contains('active')) {
        searchInput.focus();
    } else {
        searchInput.value = '';
        document.getElementById('searchResults').innerHTML = '';
    }
}

// Search products
function searchProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const searchResults = document.getElementById('searchResults');

    if (searchTerm.length < 2) {
        searchResults.innerHTML = '';
        return;
    }

    const results = Object.keys(productData).filter(productName =>
        productName.toLowerCase().includes(searchTerm)
    );

    if (results.length === 0) {
        searchResults.innerHTML = '<div class="no-results">No products found</div>';
        return;
    }

    searchResults.innerHTML = results.map(productName => {
        const product = productData[productName];
        return `
            <div class="search-result-item" onclick="scrollToProduct('${productName}')">
                <div class="search-result-image" style="background-image: url('${product.images[0]}')"></div>
                <div class="search-result-info">
                    <h4>${productName}</h4>
                    <p>Rs. ${product.price.toLocaleString()}</p>
                </div>
            </div>
        `;
    }).join('');
}

// Scroll to product
function scrollToProduct(productName) {
    toggleSearch();
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        const title = card.querySelector('.product-info h3').textContent;
        if (title === productName) {
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            card.style.animation = 'pulse 1s ease';
            setTimeout(() => { card.style.animation = ''; }, 1000);
        }
    });
}

// Toggle cart sidebar
function toggleCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    const cartOverlay = document.querySelector('.cart-overlay');
    cartSidebar.classList.toggle('open');
    cartOverlay.classList.toggle('active');
}

// Add product to cart
function addToCart(productName, price) {
    cart.push({ name: productName, price: price });
    cartCount++;
    updateCartDisplay();
    updateCartCount();
    toggleCart();
}

// Update cart count badge
function updateCartCount() {
    document.getElementById('cartCount').textContent = cartCount;
}

// Update cart display
function updateCartDisplay() {
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
        cartTotal.style.display = 'none';
    } else {
        cartItemsContainer.innerHTML = '';
        let subtotal = 0;

        cart.forEach((item, index) => {
            subtotal += item.price;
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div class="cart-item-image">
                    <i class="fas fa-shirt"></i>
                </div>
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p class="cart-item-price">Rs. ${item.price.toLocaleString()}</p>
                    <button class="cart-item-remove" onclick="removeFromCart(${index})">Remove</button>
                </div>
            `;
            cartItemsContainer.appendChild(cartItem);
        });

        const deliveryCharge = subtotal >= 5000 ? 0 : 200;
        const total = subtotal + deliveryCharge;

        document.getElementById('subtotal').textContent = `Rs. ${subtotal.toLocaleString()}`;

        const shippingElement = document.querySelector('.cart-total-row:nth-child(2) span:last-child');
        if (shippingElement) {
            shippingElement.textContent = deliveryCharge === 0 ? 'Free' : `Rs. ${deliveryCharge.toLocaleString()}`;
        }

        document.getElementById('total').textContent = `Rs. ${total.toLocaleString()}`;
        cartTotal.style.display = 'block';
    }
}

// Remove item from cart
function removeFromCart(index) {
    cart.splice(index, 1);
    cartCount--;
    updateCartDisplay();
    updateCartCount();
}

// Checkout function
function checkout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
    const deliveryCharge = subtotal >= 5000 ? 0 : 200;
    const total = subtotal + deliveryCharge;

    document.getElementById('checkoutSubtotal').textContent = `Rs. ${subtotal.toLocaleString()}`;
    document.getElementById('checkoutDelivery').textContent = deliveryCharge === 0 ? 'FREE' : `Rs. ${deliveryCharge.toLocaleString()}`;
    document.getElementById('checkoutTotal').textContent = `Rs. ${total.toLocaleString()}`;

    openCheckoutModal();
}

function openCheckoutModal() {
    document.getElementById('checkoutModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCheckoutModal() {
    document.getElementById('checkoutModal').classList.remove('active');
    document.body.style.overflow = 'auto';
}

function submitCheckout(event) {
    event.preventDefault();

    const name = document.getElementById('customerName').value;
    const phone = document.getElementById('customerPhone').value;
    const address = document.getElementById('customerAddress').value;
    const city = document.getElementById('customerCity').value;
    const notes = document.getElementById('customerNotes').value;

    const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
    const deliveryCharge = subtotal >= 5000 ? 0 : 200;
    const total = subtotal + deliveryCharge;

    const order = {
        id: 'ORD-' + Date.now(),
        customer: { name, phone, address, city, notes },
        products: cart.map(item => ({ name: item.name, price: item.price })),
        subtotal,
        deliveryCharge,
        total,
        status: 'pending',
        date: new Date().toISOString()
    };

    let orders = JSON.parse(localStorage.getItem('lashaanOrders') || '[]');
    orders.push(order);
    localStorage.setItem('lashaanOrders', JSON.stringify(orders));

    closeCheckoutModal();
    document.getElementById('orderNumber').textContent = order.id;
    openOrderSuccessModal();

    cart = [];
    cartCount = 0;
    updateCartDisplay();
    updateCartCount();
    document.getElementById('checkoutForm').reset();

    return false;
}

function openOrderSuccessModal() {
    document.getElementById('orderSuccessModal').classList.add('active');
}

function closeOrderSuccessModal() {
    document.getElementById('orderSuccessModal').classList.remove('active');
}

function subscribeNewsletter(event) {
    event.preventDefault();
    const email = document.getElementById('newsletterEmail').value;
    alert(`Thank you for subscribing with ${email}! We'll keep you updated with our latest collections and offers.`);
    document.getElementById('newsletterEmail').value = '';
    return false;
}

// Gallery navigation
function changeProductImage(productName, direction) {
    const product = productData[productName];
    if (!product) return;

    const currentIndex = currentImageIndices[productName];
    let newIndex;

    if (direction === 'next') {
        newIndex = (currentIndex + 1) % product.images.length;
    } else {
        newIndex = (currentIndex - 1 + product.images.length) % product.images.length;
    }

    currentImageIndices[productName] = newIndex;

    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        const title = card.querySelector('.product-info h3').textContent;
        if (title === productName) {
            const imageDiv = card.querySelector('.product-image');
            imageDiv.style.backgroundImage = `url('${product.images[newIndex]}')`;
            updateImageIndicators(card, newIndex, product.images.length);
        }
    });
}

function updateImageIndicators(card, activeIndex, totalImages) {
    const indicators = card.querySelectorAll('.image-indicator');
    indicators.forEach((indicator, index) => {
        if (index === activeIndex) {
            indicator.classList.add('active');
        } else {
            indicator.classList.remove('active');
        }
    });
}

// Lightbox
let isZoomed = false;

function openLightbox(productName, imageIndex) {
    const product = productData[productName];
    if (!product) return;

    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxImageContainer = document.querySelector('.lightbox-image-container');

    lightboxImage.src = product.images[imageIndex];
    document.getElementById('lightboxTitle').textContent = productName;
    document.getElementById('lightboxPrice').textContent = `Rs. ${product.price.toLocaleString()}`;

    lightbox.dataset.productName = productName;
    lightbox.dataset.currentIndex = imageIndex;

    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';

    isZoomed = false;
    lightboxImageContainer.classList.remove('zoomed');
    lightboxImage.style.transform = 'scale(1)';
    lightboxImage.style.transformOrigin = 'center center';

    updateLightboxIndicators(product.images.length, imageIndex);

    lightboxImageContainer.onclick = toggleZoom;
    lightboxImageContainer.onmousemove = handleImageZoom;
    lightboxImageContainer.onmouseleave = resetZoom;
}

function toggleZoom(e) {
    if (e.target.tagName === 'IMG') {
        const container = document.querySelector('.lightbox-image-container');
        const img = document.getElementById('lightboxImage');
        isZoomed = !isZoomed;

        if (isZoomed) {
            container.classList.add('zoomed');
            handleImageZoom(e);
        } else {
            container.classList.remove('zoomed');
            img.style.transform = 'scale(1)';
            img.style.transformOrigin = 'center center';
        }
    }
}

function handleImageZoom(e) {
    if (!isZoomed) return;
    const container = document.querySelector('.lightbox-image-container');
    const img = document.getElementById('lightboxImage');
    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    img.style.transformOrigin = `${x}% ${y}%`;
    img.style.transform = 'scale(2.5)';
}

function resetZoom() {
    if (isZoomed) {
        document.getElementById('lightboxImage').style.transformOrigin = 'center center';
    }
}

function closeLightbox() {
    document.getElementById('lightbox').classList.remove('active');
    document.body.style.overflow = 'auto';
}

function navigateLightbox(direction) {
    const lightbox = document.getElementById('lightbox');
    const productName = lightbox.dataset.productName;
    const currentIndex = parseInt(lightbox.dataset.currentIndex);
    const product = productData[productName];

    let newIndex;
    if (direction === 'next') {
        newIndex = (currentIndex + 1) % product.images.length;
    } else {
        newIndex = (currentIndex - 1 + product.images.length) % product.images.length;
    }

    document.getElementById('lightboxImage').src = product.images[newIndex];
    lightbox.dataset.currentIndex = newIndex;
    updateLightboxIndicators(product.images.length, newIndex);
}

function updateLightboxIndicators(totalImages, activeIndex) {
    const indicatorsContainer = document.getElementById('lightboxIndicators');
    indicatorsContainer.innerHTML = '';
    for (let i = 0; i < totalImages; i++) {
        const indicator = document.createElement('div');
        indicator.className = `lightbox-indicator ${i === activeIndex ? 'active' : ''}`;
        indicatorsContainer.appendChild(indicator);
    }
}

// Initialize product gallery
function initializeProductGallery() {
    const productCards = document.querySelectorAll('.product-card');

    productCards.forEach(card => {
        const productTitle = card.querySelector('.product-info h3').textContent;
        const product = productData[productTitle];
        if (!product) return;

        const imageDiv = card.querySelector('.product-image');
        imageDiv.style.backgroundImage = `url('${product.images[0]}')`;

        const navArrows = document.createElement('div');
        navArrows.className = 'gallery-nav-arrows';
        navArrows.innerHTML = `
            <button class="gallery-arrow gallery-arrow-left" onclick="event.stopPropagation(); changeProductImage('${productTitle}', 'prev')">
                <i class="fas fa-chevron-left"></i>
            </button>
            <button class="gallery-arrow gallery-arrow-right" onclick="event.stopPropagation(); changeProductImage('${productTitle}', 'next')">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;
        imageDiv.appendChild(navArrows);

        if (product.images.length > 1) {
            const indicators = document.createElement('div');
            indicators.className = 'image-indicators';
            product.images.forEach((_, index) => {
                const indicator = document.createElement('div');
                indicator.className = `image-indicator ${index === 0 ? 'active' : ''}`;
                indicators.appendChild(indicator);
            });
            imageDiv.appendChild(indicators);
        }

        imageDiv.addEventListener('click', (e) => {
            if (!e.target.closest('.gallery-arrow') && !e.target.closest('.quick-add')) {
                openLightbox(productTitle, currentImageIndices[productTitle]);
            }
        });
    });
}

// Info Modal Functions
function showInfoModal(title, content) {
    document.getElementById('infoModalTitle').textContent = title;
    document.getElementById('infoModalBody').innerHTML = content;
    document.getElementById('infoModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeInfoModal() {
    document.getElementById('infoModal').classList.remove('active');
    document.body.style.overflow = 'auto';
}

function showOurStory() {
    const content = `
        <p>Lashaan was born from the shared vision of three friends – two passionate young men and one creative woman – who believed that traditional Pakistani menswear deserved a modern renaissance.</p>
        <p>Our journey began in the bustling streets of Lahore, where we noticed a gap in the market: while women's fashion was flourishing with countless boutiques and designers, men's eastern wear remained largely traditional and unchanged. We saw an opportunity to bridge heritage with contemporary style.</p>
        <p>What started as late-night conversations over chai quickly transformed into sketches, fabric sourcing trips, and eventually, our first collection. We spent months working with local artisans, learning the intricate craftsmanship that has been passed down through generations, while adding our own modern twist to classic designs.</p>
        <p>Our name, "Lashaan," reflects our commitment to excellence and sophistication. Every piece we create tells a story – of Pakistani craftsmanship, of friendship, and of the belief that men deserve to feel confident and distinguished in their traditional wear.</p>
        <p>Today, Lashaan represents more than just clothing. It's a celebration of Pakistani culture, a platform for local artisans, and a testament to what three friends with a shared dream can achieve.</p>
        <p>Thank you for being part of our journey.</p>
        <p style="margin-top: 30px; font-style: italic;">– Team Lashaan</p>
    `;
    showInfoModal('Our Story', content);
}

function showFAQs() {
    const content = `
        <h3>Ordering & Payment</h3>
        <p><strong>How do I place an order?</strong><br>Browse our collection, add items to your cart, and proceed to checkout. Fill in your details and confirm your order.</p>
        <p><strong>What payment methods do you accept?</strong><br>We accept cash on delivery (COD).</p>
        <h3>Shipping & Delivery</h3>
        <p><strong>Do you offer free shipping?</strong><br>Yes! We offer free shipping on all orders above Rs. 5,000 across Pakistan.</p>
        <p><strong>How long does delivery take?</strong><br>Standard delivery takes 3-5 business days for major cities and 5-7 business days for other areas.</p>
        <p><strong>Do you ship internationally?</strong><br>Currently, we only ship within Pakistan. International shipping will be available soon.</p>
        <h3>Product Information</h3>
        <p><strong>What fabrics do you use?</strong><br>We use premium quality fabrics including cotton, khaddar, wash & wear, and blended materials.</p>
        <p><strong>How do I choose the right size?</strong><br>Please refer to our size guide available in the footer.</p>
        <h3>Returns & Customer Service</h3>
        <p><strong>Can I return or exchange an item?</strong><br>Yes, we accept returns and exchanges within 7 days of delivery.</p>
        <p><strong>How can I contact customer service?</strong><br>Email us at lashaan.offical@gmail.com. We typically respond within 24 hours.</p>
    `;
    showInfoModal('Frequently Asked Questions', content);
}

function showReturnsExchange() {
    const content = `
        <h3>Return Policy</h3>
        <p>We want you to be completely satisfied with your purchase. If for any reason you're not happy with your order, we offer returns within 7 days of delivery.</p>
        <h3>Eligibility for Returns</h3>
        <ul>
            <li>Items must be unused, unworn, and in original condition with all tags attached</li>
            <li>Items must be returned in original packaging</li>
            <li>Proof of purchase must be provided</li>
            <li>Stitched or customized items cannot be returned unless defective</li>
        </ul>
        <h3>How to Return or Exchange</h3>
        <ul>
            <li>Contact us via email (lashaan.offical@gmail.com)</li>
            <li>Provide your order number and reason for return/exchange</li>
            <li>We'll arrange pickup or provide return shipping instructions</li>
        </ul>
        <h3>Refund Process</h3>
        <p>Refunds will be processed within 5-7 business days after we receive the returned item.</p>
        <h3>Contact Us</h3>
        <p>Email: lashaan.offical@gmail.com</p>
    `;
    showInfoModal('Returns & Exchanges', content);
}

function showSizeGuide() {
    const content = `
        <h3>How to Measure</h3>
        <p><strong>Chest:</strong> Measure around the fullest part of your chest.</p>
        <p><strong>Waist:</strong> Measure around your natural waistline.</p>
        <p><strong>Shoulder:</strong> Measure from one shoulder point to the other across the back.</p>
        <h3>Standard Size Chart</h3>
        <p><strong>Small (S):</strong> Chest: 36-38" | Waist: 30-32" | Shoulder: 16-17"</p>
        <p><strong>Medium (M):</strong> Chest: 38-40" | Waist: 32-34" | Shoulder: 17-18"</p>
        <p><strong>Large (L):</strong> Chest: 40-42" | Waist: 34-36" | Shoulder: 18-19"</p>
        <p><strong>Extra Large (XL):</strong> Chest: 42-44" | Waist: 36-38" | Shoulder: 19-20"</p>
        <p><strong>Double XL (XXL):</strong> Chest: 44-46" | Waist: 38-40" | Shoulder: 20-21"</p>
        <h3>Custom Sizing</h3>
        <p>We offer custom stitching services. Contact us at lashaan.offical@gmail.com with your measurements.</p>
    `;
    showInfoModal('Size Guide', content);
}

function showContactInfo() {
    const content = `
        <h3>Get in Touch</h3>
        <p>We'd love to hear from you!</p>
        <h3>Email</h3>
        <p><strong>lashaan.offical@gmail.com</strong><br>We typically respond within 24 hours.<br>Available: 9 AM - 9 PM (PKT)</p>
        <h3>Social Media</h3>
        <p>
        <a href="https://www.instagram.com/lashaan.official/" target="_blank" style="color: #2c2c2c; text-decoration: underline;">Instagram: @lashaan.official</a><br>
        <a href="https://www.facebook.com/share/17hEgJH57D/?mibextid=wwXIfr" target="_blank" style="color: #2c2c2c; text-decoration: underline;">Facebook: Lashaan Official</a>
        </p>
        <h3>Business Hours</h3>
        <p>Monday - Saturday: 9:00 AM - 9:00 PM<br>Sunday: 10:00 AM - 6:00 PM (PKT)</p>
        <h3>Location</h3>
        <p>Lahore, Punjab, Pakistan. We ship nationwide!</p>
    `;
    showInfoModal('Contact Us', content);
}

// Keyboard events
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeLightbox();
        closeInfoModal();
        closeCheckoutModal();
        closeOrderSuccessModal();
        const searchBar = document.getElementById('searchBar');
        if (searchBar.classList.contains('active')) toggleSearch();
        const filterPanel = document.getElementById('filterPanel');
        const filterBtn = document.querySelector('.filter-btn');
        if (filterPanel.classList.contains('active')) {
            filterPanel.classList.remove('active');
            filterBtn.classList.remove('active');
        }
    }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeProductGallery();
});

// Close cart on overlay click
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('cart-overlay')) toggleCart();
});