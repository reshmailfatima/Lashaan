// Admin authentication
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'lashaan2025';

// Check if admin is logged in
function checkAuth() {
    const isLoggedIn = localStorage.getItem('lashaanAdminAuth') === 'true';
    if (!isLoggedIn) {
        document.getElementById('loginContainer').style.display = 'flex';
        document.getElementById('adminContainer').style.display = 'none';
    } else {
        document.getElementById('loginContainer').style.display = 'none';
        document.getElementById('adminContainer').style.display = 'flex';
        loadDashboard();
    }
}

// Handle login
function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('loginError');
    
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        localStorage.setItem('lashaanAdminAuth', 'true');
        localStorage.setItem('lashaanAdminUsername', username);
        checkAuth();
    } else {
        errorMsg.textContent = 'Invalid username or password';
        errorMsg.classList.add('show');
        setTimeout(() => {
            errorMsg.classList.remove('show');
        }, 3000);
    }
    
    return false;
}

// Handle logout
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('lashaanAdminAuth');
        localStorage.removeItem('lashaanAdminUsername');
        checkAuth();
    }
}

// Toggle sidebar on mobile
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('active');
}

// Switch tabs
function switchTab(tabName) {
    // Update page title
    const titles = {
        'dashboard': 'Dashboard',
        'orders': 'All Orders',
        'products': 'Products',
        'settings': 'Settings'
    };
    document.getElementById('pageTitle').textContent = titles[tabName];
    
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Show selected tab
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.getElementById(tabName + 'Tab').classList.add('active');
    
    // Load data based on tab
    if (tabName === 'dashboard') {
        loadDashboard();
    } else if (tabName === 'orders') {
        loadAllOrders();
    }
    
    // Close mobile sidebar
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.remove('active');
}

// Load dashboard data
function loadDashboard() {
    const orders = JSON.parse(localStorage.getItem('lashaanOrders') || '[]');
    
    // Calculate stats
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const completedOrders = orders.filter(o => o.status === 'completed').length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    
    // Update stats
    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('pendingOrders').textContent = pendingOrders;
    document.getElementById('completedOrders').textContent = completedOrders;
    document.getElementById('totalRevenue').textContent = `Rs. ${totalRevenue.toLocaleString()}`;
    document.getElementById('ordersBadge').textContent = pendingOrders;
    
    // Load recent orders (last 5)
    const recentOrders = orders.slice(-5).reverse();
    loadOrdersTable('recentOrdersTable', recentOrders);
    
    // Update admin username
    const username = localStorage.getItem('lashaanAdminUsername') || 'Admin';
    document.getElementById('adminUsername').textContent = username;
}

// Load all orders
function loadAllOrders(filter = 'all') {
    let orders = JSON.parse(localStorage.getItem('lashaanOrders') || '[]');
    
    // Apply filter
    if (filter !== 'all') {
        orders = orders.filter(o => o.status === filter);
    }
    
    orders.reverse(); // Show newest first
    loadOrdersTable('allOrdersTable', orders);
}

// Load orders into table
function loadOrdersTable(tableId, orders) {
    const tbody = document.getElementById(tableId);
    
    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="no-data">No orders found</td></tr>';
        return;
    }
    
    tbody.innerHTML = orders.map(order => {
        const date = new Date(order.date);
        const formattedDate = date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
        const formattedTime = date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        return `
            <tr>
                <td><strong>${order.id}</strong></td>
                <td>
                    <div>${order.customer.name}</div>
                    <div style="font-size: 12px; color: #7f8c8d;">${order.customer.phone}</div>
                    <div style="font-size: 12px; color: #7f8c8d;">${order.customer.city}</div>
                </td>
                <td>
                    <div style="font-size: 13px;">
                        ${order.products.map(p => `• ${p.name}`).join('<br>')}
                    </div>
                </td>
                <td>
                    <div>${formattedDate}</div>
                    <div style="font-size: 12px; color: #7f8c8d;">${formattedTime}</div>
                </td>
                <td><strong>Rs. ${order.total.toLocaleString()}</strong></td>
                <td>
                    <select class="status-select" onchange="updateOrderStatus('${order.id}', this.value)">
                        <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                        <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Completed</option>
                        <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                </td>
                <td>
                    <button class="action-btn view-btn" onclick="viewOrderDetails('${order.id}')">View</button>
                </td>
            </tr>
        `;
    }).join('');
}

// Update order status
function updateOrderStatus(orderId, newStatus) {
    let orders = JSON.parse(localStorage.getItem('lashaanOrders') || '[]');
    const orderIndex = orders.findIndex(o => o.id === orderId);
    
    if (orderIndex !== -1) {
        orders[orderIndex].status = newStatus;
        localStorage.setItem('lashaanOrders', JSON.stringify(orders));
        loadDashboard();
        loadAllOrders();
    }
}

// Filter orders
function filterOrders(status) {
    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    loadAllOrders(status);
}

// Search orders
function searchOrders() {
    const searchTerm = document.getElementById('orderSearch').value.toLowerCase();
    let orders = JSON.parse(localStorage.getItem('lashaanOrders') || '[]');
    
    if (searchTerm.length > 0) {
        orders = orders.filter(order => 
            order.id.toLowerCase().includes(searchTerm) ||
            order.customer.name.toLowerCase().includes(searchTerm) ||
            order.customer.phone.includes(searchTerm) ||
            order.customer.city.toLowerCase().includes(searchTerm)
        );
    }
    
    orders.reverse();
    loadOrdersTable('allOrdersTable', orders);
}

// View order details
function viewOrderDetails(orderId) {
    const orders = JSON.parse(localStorage.getItem('lashaanOrders') || '[]');
    const order = orders.find(o => o.id === orderId);
    
    if (!order) return;
    
    const date = new Date(order.date);
    const formattedDate = date.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const modalContent = `
        <div class="order-detail-header">
            <h2>Order Details - ${order.id}</h2>
            <span class="status-badge ${order.status}">${order.status.toUpperCase()}</span>
        </div>
        
        <div class="order-detail-section">
            <h3>Customer Information</h3>
            <div class="detail-row">
                <strong>Name:</strong>
                <span>${order.customer.name}</span>
            </div>
            <div class="detail-row">
                <strong>Phone:</strong>
                <span>${order.customer.phone}</span>
            </div>
            <div class="detail-row">
                <strong>Address:</strong>
                <span>${order.customer.address}</span>
            </div>
            <div class="detail-row">
                <strong>City:</strong>
                <span>${order.customer.city}</span>
            </div>
            ${order.customer.notes ? `
            <div class="detail-row">
                <strong>Notes:</strong>
                <span>${order.customer.notes}</span>
            </div>
            ` : ''}
        </div>
        
        <div class="order-detail-section">
            <h3>Order Items</h3>
            <ul class="products-list">
                ${order.products.map(p => `
                    <li>
                        <div style="display: flex; justify-content: space-between;">
                            <span>${p.name}</span>
                            <strong>Rs. ${p.price.toLocaleString()}</strong>
                        </div>
                    </li>
                `).join('')}
            </ul>
        </div>
        
        <div class="order-detail-section">
            <h3>Payment Summary</h3>
            <div class="detail-row">
                <strong>Subtotal:</strong>
                <span>Rs. ${order.subtotal.toLocaleString()}</span>
            </div>
            <div class="detail-row">
                <strong>Delivery Charges:</strong>
                <span>${order.deliveryCharge === 0 ? 'FREE' : 'Rs. ' + order.deliveryCharge.toLocaleString()}</span>
            </div>
            <div class="detail-row total-row">
                <strong>Total Amount:</strong>
                <strong>Rs. ${order.total.toLocaleString()}</strong>
            </div>
        </div>
        
        <div class="order-detail-section">
            <h3>Order Information</h3>
            <div class="detail-row">
                <strong>Order Date:</strong>
                <span>${formattedDate}</span>
            </div>
            <div class="detail-row">
                <strong>Payment Method:</strong>
                <span>Cash on Delivery (COD)</span>
            </div>
        </div>
        
        <div class="modal-actions">
            <button class="action-btn view-btn" style="background: #3498db;" onclick="printOrder('${order.id}')">
                <i class="fas fa-print"></i> Print Order
            </button>
            <button class="action-btn danger-btn" onclick="deleteOrder('${order.id}')">
                <i class="fas fa-trash"></i> Delete Order
            </button>
        </div>
    `;
    
    document.getElementById('orderDetailContent').innerHTML = modalContent;
    document.getElementById('orderModal').classList.add('active');
}

// Close order modal
function closeOrderModal() {
    document.getElementById('orderModal').classList.remove('active');
}

// Print order
function printOrder(orderId) {
    const orders = JSON.parse(localStorage.getItem('lashaanOrders') || '[]');
    const order = orders.find(o => o.id === orderId);
    
    if (!order) return;
    
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write('<html><head><title>Order ' + order.id + '</title>');
    printWindow.document.write('<style>body{font-family:Arial;padding:20px;}h1{border-bottom:2px solid #000;padding-bottom:10px;}table{width:100%;border-collapse:collapse;margin:20px 0;}td,th{padding:10px;text-align:left;border-bottom:1px solid #ddd;}.total{font-weight:bold;font-size:18px;border-top:2px solid #000;}</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write('<h1>LASHAAN - Order Invoice</h1>');
    printWindow.document.write('<p><strong>Order ID:</strong> ' + order.id + '</p>');
    printWindow.document.write('<p><strong>Date:</strong> ' + new Date(order.date).toLocaleString() + '</p>');
    printWindow.document.write('<h2>Customer Details</h2>');
    printWindow.document.write('<p><strong>Name:</strong> ' + order.customer.name + '</p>');
    printWindow.document.write('<p><strong>Phone:</strong> ' + order.customer.phone + '</p>');
    printWindow.document.write('<p><strong>Address:</strong> ' + order.customer.address + ', ' + order.customer.city + '</p>');
    printWindow.document.write('<h2>Order Items</h2>');
    printWindow.document.write('<table><thead><tr><th>Product</th><th>Price</th></tr></thead><tbody>');
    order.products.forEach(p => {
        printWindow.document.write('<tr><td>' + p.name + '</td><td>Rs. ' + p.price.toLocaleString() + '</td></tr>');
    });
    printWindow.document.write('</tbody></table>');
    printWindow.document.write('<p><strong>Subtotal:</strong> Rs. ' + order.subtotal.toLocaleString() + '</p>');
    printWindow.document.write('<p><strong>Delivery:</strong> ' + (order.deliveryCharge === 0 ? 'FREE' : 'Rs. ' + order.deliveryCharge.toLocaleString()) + '</p>');
    printWindow.document.write('<p class="total"><strong>Total:</strong> Rs. ' + order.total.toLocaleString() + '</p>');
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
}

// Delete order
function deleteOrder(orderId) {
    if (confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
        let orders = JSON.parse(localStorage.getItem('lashaanOrders') || '[]');
        orders = orders.filter(o => o.id !== orderId);
        localStorage.setItem('lashaanOrders', JSON.stringify(orders));
        closeOrderModal();
        loadDashboard();
        loadAllOrders();
        alert('Order deleted successfully');
    }
}

// Export orders
function exportOrders() {
    const orders = JSON.parse(localStorage.getItem('lashaanOrders') || '[]');
    
    if (orders.length === 0) {
        alert('No orders to export');
        return;
    }
    
    // Convert to CSV
    let csv = 'Order ID,Date,Customer Name,Phone,Address,City,Products,Subtotal,Delivery,Total,Status,Notes\n';
    
    orders.forEach(order => {
        const products = order.products.map(p => p.name).join('; ');
        const date = new Date(order.date).toLocaleString();
        csv += `"${order.id}","${date}","${order.customer.name}","${order.customer.phone}","${order.customer.address}","${order.customer.city}","${products}",${order.subtotal},${order.deliveryCharge},${order.total},"${order.status}","${order.customer.notes || ''}"\n`;
    });
    
    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lashaan-orders-' + new Date().toISOString().split('T')[0] + '.csv';
    a.click();
}

// Clear all orders
function clearAllOrders() {
    if (confirm('Are you sure you want to delete ALL orders? This action cannot be undone!')) {
        if (confirm('This will permanently delete all order data. Are you absolutely sure?')) {
            localStorage.setItem('lashaanOrders', '[]');
            loadDashboard();
            loadAllOrders();
            alert('All orders have been cleared');
        }
    }
}

// Change password
function handleChangePassword(event) {
    event.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (currentPassword !== ADMIN_PASSWORD) {
        alert('Current password is incorrect');
        return false;
    }
    
    if (newPassword.length < 6) {
        alert('New password must be at least 6 characters long');
        return false;
    }
    
    if (newPassword !== confirmPassword) {
        alert('New passwords do not match');
        return false;
    }
    
    alert('Password functionality is for demonstration only. In a real application, this would update the password in a secure database.');
    document.getElementById('changePasswordForm').reset();
    
    return false;
}

// Initialize admin panel
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    
    // Close modal when clicking outside
    document.getElementById('orderModal').addEventListener('click', (e) => {
        if (e.target.id === 'orderModal') {
            closeOrderModal();
        }
    });
});