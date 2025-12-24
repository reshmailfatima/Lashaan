// Cart functionality
let cart = [];
let cartCount = 0;

// Product data with multiple images
const productData = {
    'Black Elite Embroidered Men’s Suit': {
        price: 10999,
        images: [
            'images/Black2.jpeg',
            'images/Black1.jpeg',
            'images/Black3.jpeg'
        ]
    },
    'Amberwood Brown Orange Blended Suit': {
        price: 6750,
        images: [
            'images/Brown2.jpeg',
            'images/Brown1.jpeg',
            'images/Brown3.jpeg'
        ]
    },
    'Olive Regal Stitch Suit': {
        price: 6350,
        images: [
            'images/Green1.jpeg',
            'images/GreenChest.jpeg',
            'images/Green2.jpeg'
        ]
    }
};

// Current image indices for each product
let currentImageIndices = {};

// Initialize current image indices
Object.keys(productData).forEach(productName => {
    currentImageIndices[productName] = 0;
});

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
            setTimeout(() => {
                card.style.animation = '';
            }, 1000);
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
        
        // Calculate delivery charges - FREE below 5000, Rs. 200 above 5000
        const deliveryCharge = subtotal >= 5000 ? 200 : 0;
        const total = subtotal + deliveryCharge;
        
        // Update display
        document.getElementById('subtotal').textContent = `Rs. ${subtotal.toLocaleString()}`;
        
        // Update shipping text
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
    
    // Calculate totals - FREE below 5000, Rs. 200 above 5000
    const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
    const deliveryCharge = subtotal >= 5000 ? 200 : 0;
    const total = subtotal + deliveryCharge;
    
    // Update checkout modal values
    document.getElementById('checkoutSubtotal').textContent = `Rs. ${subtotal.toLocaleString()}`;
    document.getElementById('checkoutDelivery').textContent = deliveryCharge === 0 ? 'FREE' : `Rs. ${deliveryCharge.toLocaleString()}`;
    document.getElementById('checkoutTotal').textContent = `Rs. ${total.toLocaleString()}`;
    
    // Show checkout modal
    openCheckoutModal();
}

// Open checkout modal
function openCheckoutModal() {
    const modal = document.getElementById('checkoutModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close checkout modal
function closeCheckoutModal() {
    const modal = document.getElementById('checkoutModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Submit checkout form
function submitCheckout(event) {
    event.preventDefault();
    
    const name = document.getElementById('customerName').value;
    const phone = document.getElementById('customerPhone').value;
    const address = document.getElementById('customerAddress').value;
    const city = document.getElementById('customerCity').value;
    const notes = document.getElementById('customerNotes').value;
    
    const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
    const deliveryCharge = subtotal >= 5000 ? 200 : 0;
    const total = subtotal + deliveryCharge;
    
    // Create WhatsApp message
    let message = `*NEW ORDER FROM LASHAAN*\n\n`;
    message += `*Customer Details:*\n`;
    message += `Name: ${name}\n`;
    message += `Phone: ${phone}\n`;
    message += `Address: ${address}\n`;
    message += `City: ${city}\n`;
    if (notes) {
        message += `Notes: ${notes}\n`;
    }
    message += `\n*Order Details:*\n`;
    cart.forEach((item, index) => {
        message += `${index + 1}. ${item.name} - Rs. ${item.price.toLocaleString()}\n`;
    });
    message += `\n*Payment Details:*\n`;
    message += `Subtotal: Rs. ${subtotal.toLocaleString()}\n`;
    message += `Delivery: ${deliveryCharge === 0 ? 'FREE' : 'Rs. ' + deliveryCharge.toLocaleString()}\n`;
    message += `*Total Amount: Rs. ${total.toLocaleString()}*\n`;
    message += `\nPayment Method: Cash on Delivery (COD)`;
    
    // Open WhatsApp
    window.open(`https://wa.me/923211016859?text=${encodeURIComponent(message)}`, '_blank');
    
    // Close modal and reset form
    closeCheckoutModal();
    document.getElementById('checkoutForm').reset();
    
    // Optional: Clear cart after successful order
    // cart = [];
    // cartCount = 0;
    // updateCartDisplay();
    // updateCartCount();
    
    return false;
}

// Newsletter subscription
function subscribeNewsletter(event) {
    event.preventDefault();
    const email = document.getElementById('newsletterEmail').value;
    alert(`Thank you for subscribing with ${email}! We'll keep you updated with our latest collections and offers.`);
    document.getElementById('newsletterEmail').value = '';
    return false;
}

// Gallery navigation functions
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
    
    // Update the product card image
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        const title = card.querySelector('.product-info h3').textContent;
        if (title === productName) {
            const imageDiv = card.querySelector('.product-image');
            imageDiv.style.backgroundImage = `url('${product.images[newIndex]}')`;
            
            // Update indicators
            updateImageIndicators(card, newIndex, product.images.length);
        }
    });
}

// Update image indicators
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

// Open lightbox
let isZoomed = false;
let mouseX = 0;
let mouseY = 0;

function openLightbox(productName, imageIndex) {
    const product = productData[productName];
    if (!product) return;
    
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxImageContainer = document.querySelector('.lightbox-image-container');
    const lightboxTitle = document.getElementById('lightboxTitle');
    const lightboxPrice = document.getElementById('lightboxPrice');
    
    lightboxImage.src = product.images[imageIndex];
    lightboxTitle.textContent = productName;
    lightboxPrice.textContent = `Rs. ${product.price.toLocaleString()}`;
    
    lightbox.dataset.productName = productName;
    lightbox.dataset.currentIndex = imageIndex;
    
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Reset zoom state
    isZoomed = false;
    lightboxImageContainer.classList.remove('zoomed');
    lightboxImage.style.transform = 'scale(1)';
    lightboxImage.style.transformOrigin = 'center center';
    
    updateLightboxIndicators(product.images.length, imageIndex);
    
    // Add zoom toggle and mouse move on image
    lightboxImageContainer.onclick = toggleZoom;
    lightboxImageContainer.onmousemove = handleImageZoom;
    lightboxImageContainer.onmouseleave = resetZoom;
}

// Toggle zoom on/off
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

// Handle zoom following mouse cursor
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

// Reset zoom when mouse leaves
function resetZoom() {
    if (isZoomed) {
        const img = document.getElementById('lightboxImage');
        img.style.transformOrigin = 'center center';
    }
}

// Close lightbox
function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Navigate lightbox
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
    
    const lightboxImage = document.getElementById('lightboxImage');
    lightboxImage.src = product.images[newIndex];
    lightbox.dataset.currentIndex = newIndex;
    
    updateLightboxIndicators(product.images.length, newIndex);
}

// Update lightbox indicators
function updateLightboxIndicators(totalImages, activeIndex) {
    const indicatorsContainer = document.getElementById('lightboxIndicators');
    indicatorsContainer.innerHTML = '';
    
    for (let i = 0; i < totalImages; i++) {
        const indicator = document.createElement('div');
        indicator.className = `lightbox-indicator ${i === activeIndex ? 'active' : ''}`;
        indicatorsContainer.appendChild(indicator);
    }
}

// Initialize product cards with gallery features
function initializeProductGallery() {
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        const productTitle = card.querySelector('.product-info h3').textContent;
        const product = productData[productTitle];
        
        if (!product) return;
        
        const imageDiv = card.querySelector('.product-image');
        
        // Set initial image
        imageDiv.style.backgroundImage = `url('${product.images[0]}')`;
        
        // Add gallery navigation arrows
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
        
        // Add image indicators
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
        
        // Add click event to open lightbox
        imageDiv.addEventListener('click', (e) => {
            if (!e.target.closest('.gallery-arrow') && !e.target.closest('.quick-add')) {
                const currentIndex = currentImageIndices[productTitle];
                openLightbox(productTitle, currentIndex);
            }
        });
    });
}

// Info Modal Functions
function showInfoModal(title, content) {
    const modal = document.getElementById('infoModal');
    const modalTitle = document.getElementById('infoModalTitle');
    const modalBody = document.getElementById('infoModalBody');
    
    modalTitle.textContent = title;
    modalBody.innerHTML = content;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeInfoModal() {
    const modal = document.getElementById('infoModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Our Story
function showOurStory() {
    const content = `
        <p>Lashaan was born from the shared vision of three friends – two passionate young men and one creative woman – who believed that traditional Pakistani menswear deserved a modern renaissance.</p>
        
        <p>Our journey began in the bustling streets of Lahore, where we noticed a gap in the market: while women's fashion was flourishing with countless boutiques and designers, men's eastern wear remained largely traditional and unchanged. We saw an opportunity to bridge heritage with contemporary style.</p>
        
        <p>What started as late-night conversations over chai quickly transformed into sketches, fabric sourcing trips, and eventually, our first collection. We spent months working with local artisans, learning the intricate craftsmanship that has been passed down through generations, while adding our own modern twist to classic designs.</p>
        
        <p>Our name, "Lashaan," reflects our commitment to excellence and sophistication. Every piece we create tells a story – of Pakistani craftsmanship, of friendship, and of the belief that men deserve to feel confident and distinguished in their traditional wear.</p>
        
        <p>Today, Lashaan represents more than just clothing. It's a celebration of Pakistani culture, a platform for local artisans, and a testament to what three friends with a shared dream can achieve. We're proud to bring you premium eastern wear that honors tradition while embracing the present.</p>
        
        <p>Thank you for being part of our journey.</p>
        
        <p style="margin-top: 30px; font-style: italic;">– Team Lashaan</p>
    `;
    
    showInfoModal('Our Story', content);
}

// FAQs
function showFAQs() {
    const content = `
        <h3>Ordering & Payment</h3>
        <p><strong>How do I place an order?</strong><br>
        Browse our collection, add items to your cart, and proceed to checkout. You can also contact us directly via WhatsApp at +92 321 1016859.</p>
        
        <p><strong>What payment methods do you accept?</strong><br>
        We accept cash on delivery (COD).</p>
        
        <h3>Shipping & Delivery</h3>
        <p><strong>Do you offer free shipping?</strong><br>
        Yes! We offer free shipping on all orders above Rs. 5,000 across Pakistan.</p>
        
        <p><strong>How long does delivery take?</strong><br>
        Standard delivery takes 3-5 business days for major cities and 5-7 business days for other areas.</p>
        
        <p><strong>Do you ship internationally?</strong><br>
        Currently, we only ship within Pakistan. International shipping will be available soon.</p>
        
        <h3>Product Information</h3>
        <p><strong>What fabrics do you use?</strong><br>
        We use premium quality fabrics including cotton, khaddar, wash & wear, and blended materials, depending on the collection.</p>
        
        <p><strong>How do I choose the right size?</strong><br>
        Please refer to our size guide available in the footer. If you need assistance, contact us via WhatsApp.</p>
        
        <p><strong>Are the colors accurate?</strong><br>
        We strive to display accurate colors, but slight variations may occur due to screen settings and lighting.</p>
        
        <h3>Returns & Customer Service</h3>
        <p><strong>Can I return or exchange an item?</strong><br>
        Yes, we accept returns and exchanges within 7 days of delivery. Please see our Returns/Exchange policy for details.</p>
        
        <p><strong>How can I contact customer service?</strong><br>
        Email us at lashaan.offical@gmail.com or WhatsApp us at +92 321 1016859. We typically respond within 24 hours.</p>
    `;
    
    showInfoModal('Frequently Asked Questions', content);
}

// Returns & Exchange
function showReturnsExchange() {
    const content = `
        <h3>Return Policy</h3>
        <p>We want you to be completely satisfied with your purchase. If for any reason you're not happy with your order, we offer returns within 7 days of delivery.</p>
        
        <h3>Eligibility for Returns</h3>
        <ul>
            <li>Items must be unused, unworn, and in original condition with all tags attached</li>
            <li>Items must be returned in original packaging</li>
            <li>Proof of purchase (receipt or order confirmation) must be provided</li>
            <li>Stitched or customized items cannot be returned unless defective</li>
        </ul>
        
        <h3>Exchange Policy</h3>
        <p>We offer exchanges for size or color variations within 7 days of delivery, subject to availability.</p>
        
        <h3>How to Return or Exchange</h3>
        <ul>
            <li>Contact us via WhatsApp (+92 321 1016859) or email (lashaan.offical@gmail.com)</li>
            <li>Provide your order number and reason for return/exchange</li>
            <li>We'll arrange pickup or provide return shipping instructions</li>
            <li>Once we receive and inspect the item, we'll process your refund or exchange</li>
        </ul>
        
        <h3>Refund Process</h3>
        <p>Refunds will be processed within 5-7 business days after we receive the returned item. The amount will be refunded to your original payment method.</p>
        
        <h3>Damaged or Defective Items</h3>
        <p>If you receive a damaged or defective item, please contact us immediately with photos. We'll arrange a free pickup and send you a replacement or provide a full refund.</p>
        
        <h3>Contact Us</h3>
        <p>For any questions about returns or exchanges, please reach out to us:<br>
        WhatsApp: +92 321 1016859<br>
        Email: lashaan.offical@gmail.com</p>
    `;
    
    showInfoModal('Returns & Exchanges', content);
}

// Size Guide
function showSizeGuide() {
    const content = `
        <h3>How to Measure</h3>
        <p><strong>Chest:</strong> Measure around the fullest part of your chest, keeping the tape horizontal.</p>
        <p><strong>Waist:</strong> Measure around your natural waistline.</p>
        <p><strong>Shoulder:</strong> Measure from one shoulder point to the other across the back.</p>
        <p><strong>Sleeve Length:</strong> Measure from the shoulder point to your wrist.</p>
        <p><strong>Kurta Length:</strong> Measure from the highest point of your shoulder down to your desired length.</p>
        
        <h3>Standard Size Chart</h3>
        <p><strong>Small (S):</strong><br>
        Chest: 36-38 inches | Waist: 30-32 inches | Shoulder: 16-17 inches</p>
        
        <p><strong>Medium (M):</strong><br>
        Chest: 38-40 inches | Waist: 32-34 inches | Shoulder: 17-18 inches</p>
        
        <p><strong>Large (L):</strong><br>
        Chest: 40-42 inches | Waist: 34-36 inches | Shoulder: 18-19 inches</p>
        
        <p><strong>Extra Large (XL):</strong><br>
        Chest: 42-44 inches | Waist: 36-38 inches | Shoulder: 19-20 inches</p>
        
        <p><strong>Double XL (XXL):</strong><br>
        Chest: 44-46 inches | Waist: 38-40 inches | Shoulder: 20-21 inches</p>
        
        <h3>Shalwar Measurements</h3>
        <p>Shalwar is typically one size fits all (elastic waist). Standard length is 40-42 inches. If you need custom length, please specify in your order.</p>
        
        <h3>Custom Sizing</h3>
        <p>We offer custom stitching services. If you need custom measurements, please contact us via WhatsApp (+92 321 1016859) with your measurements, and we'll create the perfect fit for you.</p>
        
        <h3>Still Need Help?</h3>
        <p>If you're unsure about sizing, please contact us:<br>
        WhatsApp: +92 321 1016859<br>
        Email: lashaan.offical@gmail.com</p>
    `;
    
    showInfoModal('Size Guide', content);
}

// Contact Information
function showContactInfo() {
    const content = `
        <h3>Get in Touch</h3>
        <p>We'd love to hear from you! Reach out to us through any of the following channels:</p>
        
        <h3>Email</h3>
        <p><strong>lashaan.offical@gmail.com</strong><br>
        We typically respond within 24 hours.</p>
        <p>Available: 9 AM - 9 PM (PKT)</p>
        
        <h3>Social Media</h3>
        <p>Follow us on social media for updates, new collections, and exclusive offers:</p>
        <p>
        <a href="https://www.instagram.com/lashaan.official/" target="_blank" style="color: #2c2c2c; text-decoration: underline;">Instagram: @lashaan.official</a><br>
        <a href="https://www.facebook.com/share/17hEgJH57D/?mibextid=wwXIfr" target="_blank" style="color: #2c2c2c; text-decoration: underline;">Facebook: Lashaan Official</a>
        </p>
        
        <h3>Business Hours</h3>
        <p>Monday - Saturday: 9:00 AM - 9:00 PM<br>
        Sunday: 10:00 AM - 6:00 PM<br>
        (Pakistan Standard Time)</p>
        
        <h3>Location</h3>
        <p>Lahore, Punjab, Pakistan<br>
        We ship nationwide across Pakistan!</p>
    `;
    
    showInfoModal('Contact Us', content);
}

// Close modals and search on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeLightbox();
        closeInfoModal();
        closeCheckoutModal();
        const searchBar = document.getElementById('searchBar');
        if (searchBar.classList.contains('active')) {
            toggleSearch();
        }
    }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeProductGallery();
});

// Close cart overlay click
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('cart-overlay')) {
        toggleCart();
    }
});