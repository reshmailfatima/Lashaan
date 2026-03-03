// Admin authentication
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'lashaan2025';

const API = '/.netlify/functions/orders';

// Check if admin is logged in
function checkAuth() {
    const isLoggedIn = sessionStorage.getItem('lashaanAdminAuth') === 'true';
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
        sessionStorage.setItem('lashaanAdminAuth', 'true');
        sessionStorage.setItem('lashaanAdminUsername', username);
        checkAuth();
    } else {
        errorMsg.textContent = 'Invalid username or password';
        errorMsg.classList.add('show');
        setTimeout(() => errorMsg.classList.remove('show'), 3000);
    }
    return false;
}

// Handle logout
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        sessionStorage.removeItem('lashaanAdminAuth');
        sessionStorage.removeItem('lashaanAdminUsername');
        checkAuth();
    }
}

// Toggle sidebar on mobile
function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('active');
}

// Switch tabs
function switchTab(tabName) {
    const titles = { dashboard: 'Dashboard', orders: 'All Orders', products: 'Products', settings: 'Settings' };
    document.getElementById('pageTitle').textContent = titles[tabName];

    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    event.currentTarget.classList.add('active');

    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.getElementById(tabName + 'Tab').classList.add('active');

    if (tabName === 'dashboard') loadDashboard();
    else if (tabName === 'orders') loadAllOrders();

    document.querySelector('.sidebar').classList.remove('active');
}

// Fetch all orders from DB
async function fetchOrders() {
    try {
        const res = await fetch(API);
        if (!res.ok) throw new Error('Failed to fetch');
        return await res.json();
    } catch (err) {
        console.error('Fetch orders error:', err);
        return [];
    }
}

// Load dashboard
async function loadDashboard() {
    showLoading('recentOrdersTable', 6);
    const orders = await fetchOrders();

    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const completedOrders = orders.filter(o => o.status === 'completed').length;
    const totalRevenue = orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + o.total, 0);

    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('pendingOrders').textContent = pendingOrders;
    document.getElementById('completedOrders').textContent = completedOrders;
    document.getElementById('totalRevenue').textContent = `Rs. ${totalRevenue.toLocaleString()}`;
    document.getElementById('ordersBadge').textContent = pendingOrders;

    const username = sessionStorage.getItem('lashaanAdminUsername') || 'Admin';
    document.getElementById('adminUsername').textContent = username;

    loadOrdersTable('recentOrdersTable', orders.slice(0, 5));
}

// Load all orders with optional filter
async function loadAllOrders(filter = 'all') {
    showLoading('allOrdersTable', 7);
    let orders = await fetchOrders();
    if (filter !== 'all') orders = orders.filter(o => o.status === filter);
    loadOrdersTable('allOrdersTable', orders);
}

// Show loading spinner in table
function showLoading(tableId, cols) {
    document.getElementById(tableId).innerHTML = `
        <tr><td colspan="${cols}" class="no-data">
            <i class="fas fa-spinner fa-spin"></i> Loading...
        </td></tr>`;
}

// Render orders into a table
function loadOrdersTable(tableId, orders) {
    const tbody = document.getElementById(tableId);

    if (!orders || orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="no-data">No orders found</td></tr>';
        return;
    }

    tbody.innerHTML = orders.map(order => {
        const date = new Date(order.date);
        const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const formattedTime = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        return `
            <tr>
                <td><strong>${order.id}</strong></td>
                <td>
                    <div>${order.customer.name}</div>
                    <div style="font-size:12px;color:#7f8c8d;">${order.customer.phone}</div>
                    <div style="font-size:12px;color:#7f8c8d;">${order.customer.city}</div>
                </td>
                <td>
                    <div style="font-size:13px;">
                        ${order.products.map(p => `• ${p.name}`).join('<br>')}
                    </div>
                </td>
                <td>
                    <div>${formattedDate}</div>
                    <div style="font-size:12px;color:#7f8c8d;">${formattedTime}</div>
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

// Update order status in DB
async function updateOrderStatus(orderId, newStatus) {
    try {
        await fetch(API, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: orderId, status: newStatus })
        });
        loadDashboard();
    } catch (err) {
        console.error('Update status error:', err);
        alert('Failed to update status. Please try again.');
    }
}

// Filter orders
function filterOrders(status) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    loadAllOrders(status);
}

// Search orders
async function searchOrders() {
    const searchTerm = document.getElementById('orderSearch').value.toLowerCase();
    let orders = await fetchOrders();

    if (searchTerm.length > 0) {
        orders = orders.filter(order =>
            order.id.toLowerCase().includes(searchTerm) ||
            order.customer.name.toLowerCase().includes(searchTerm) ||
            order.customer.phone.includes(searchTerm) ||
            order.customer.city.toLowerCase().includes(searchTerm)
        );
    }
    loadOrdersTable('allOrdersTable', orders);
}

// View order details
async function viewOrderDetails(orderId) {
    const orders = await fetchOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const date = new Date(order.date);
    const formattedDate = date.toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    document.getElementById('orderDetailContent').innerHTML = `
        <div class="order-detail-header">
            <h2>Order Details - ${order.id}</h2>
            <span class="status-badge ${order.status}">${order.status.toUpperCase()}</span>
        </div>
        <div class="order-detail-section">
            <h3>Customer Information</h3>
            <div class="detail-row"><strong>Name:</strong><span>${order.customer.name}</span></div>
            <div class="detail-row"><strong>Phone:</strong><span>${order.customer.phone}</span></div>
            <div class="detail-row"><strong>Address:</strong><span>${order.customer.address}</span></div>
            <div class="detail-row"><strong>City:</strong><span>${order.customer.city}</span></div>
            ${order.customer.notes ? `<div class="detail-row"><strong>Notes:</strong><span>${order.customer.notes}</span></div>` : ''}
        </div>
        <div class="order-detail-section">
            <h3>Order Items</h3>
            <ul class="products-list">
                ${order.products.map(p => `
                    <li>
                        <div style="display:flex;justify-content:space-between;">
                            <span>${p.name}</span>
                            <strong>Rs. ${p.price.toLocaleString()}</strong>
                        </div>
                    </li>
                `).join('')}
            </ul>
        </div>
        <div class="order-detail-section">
            <h3>Payment Summary</h3>
            <div class="detail-row"><strong>Subtotal:</strong><span>Rs. ${order.subtotal.toLocaleString()}</span></div>
            <div class="detail-row"><strong>Delivery:</strong><span>${order.deliveryCharge === 0 ? 'FREE' : 'Rs. ' + order.deliveryCharge.toLocaleString()}</span></div>
            <div class="detail-row total-row"><strong>Total:</strong><strong>Rs. ${order.total.toLocaleString()}</strong></div>
        </div>
        <div class="order-detail-section">
            <h3>Order Information</h3>
            <div class="detail-row"><strong>Order Date:</strong><span>${formattedDate}</span></div>
            <div class="detail-row"><strong>Payment Method:</strong><span>Cash on Delivery (COD)</span></div>
        </div>
        <div class="modal-actions">
            <button class="action-btn view-btn" style="background:#3498db;" onclick="printOrder('${order.id}')">
                <i class="fas fa-print"></i> Print Order
            </button>
            <button class="action-btn danger-btn" onclick="deleteOrder('${order.id}')">
                <i class="fas fa-trash"></i> Delete Order
            </button>
        </div>
    `;
    document.getElementById('orderModal').classList.add('active');
}

function closeOrderModal() {
    document.getElementById('orderModal').classList.remove('active');
}

// Print order
async function printOrder(orderId) {
    const orders = await fetchOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const w = window.open('', '', 'height=600,width=800');
    w.document.write(`<html><head><title>Order ${order.id}</title>
    <style>body{font-family:Arial;padding:20px;}h1{border-bottom:2px solid #000;padding-bottom:10px;}
    table{width:100%;border-collapse:collapse;margin:20px 0;}td,th{padding:10px;text-align:left;border-bottom:1px solid #ddd;}
    .total{font-weight:bold;font-size:18px;border-top:2px solid #000;}</style></head><body>
    <h1>LASHAAN - Order Invoice</h1>
    <p><strong>Order ID:</strong> ${order.id}</p>
    <p><strong>Date:</strong> ${new Date(order.date).toLocaleString()}</p>
    <h2>Customer Details</h2>
    <p><strong>Name:</strong> ${order.customer.name}</p>
    <p><strong>Phone:</strong> ${order.customer.phone}</p>
    <p><strong>Address:</strong> ${order.customer.address}, ${order.customer.city}</p>
    <h2>Order Items</h2>
    <table><thead><tr><th>Product</th><th>Price</th></tr></thead><tbody>
    ${order.products.map(p => `<tr><td>${p.name}</td><td>Rs. ${p.price.toLocaleString()}</td></tr>`).join('')}
    </tbody></table>
    <p><strong>Subtotal:</strong> Rs. ${order.subtotal.toLocaleString()}</p>
    <p><strong>Delivery:</strong> ${order.deliveryCharge === 0 ? 'FREE' : 'Rs. ' + order.deliveryCharge.toLocaleString()}</p>
    <p class="total"><strong>Total:</strong> Rs. ${order.total.toLocaleString()}</p>
    </body></html>`);
    w.document.close();
    w.print();
}

// Delete order from DB
async function deleteOrder(orderId) {
    if (confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
        try {
            await fetch(API, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: orderId })
            });
            closeOrderModal();
            loadDashboard();
            loadAllOrders();
            alert('Order deleted successfully');
        } catch (err) {
            alert('Failed to delete order. Please try again.');
        }
    }
}

// Export orders to CSV
async function exportOrders() {
    const orders = await fetchOrders();
    if (orders.length === 0) { alert('No orders to export'); return; }

    let csv = 'Order ID,Date,Customer Name,Phone,Address,City,Products,Subtotal,Delivery,Total,Status,Notes\n';
    orders.forEach(order => {
        const products = order.products.map(p => p.name).join('; ');
        const date = new Date(order.date).toLocaleString();
        csv += `"${order.id}","${date}","${order.customer.name}","${order.customer.phone}","${order.customer.address}","${order.customer.city}","${products}",${order.subtotal},${order.deliveryCharge},${order.total},"${order.status}","${order.customer.notes || ''}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lashaan-orders-' + new Date().toISOString().split('T')[0] + '.csv';
    a.click();
}

// Clear all orders from DB
async function clearAllOrders() {
    if (confirm('Are you sure you want to delete ALL orders?')) {
        if (confirm('This will permanently delete all order data. Are you absolutely sure?')) {
            try {
                await fetch(API, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: 'ALL' })
                });
                loadDashboard();
                loadAllOrders();
                alert('All orders have been cleared');
            } catch (err) {
                alert('Failed to clear orders. Please try again.');
            }
        }
    }
}

// Change password (UI only — update in code for real change)
function handleChangePassword(event) {
    event.preventDefault();
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (currentPassword !== ADMIN_PASSWORD) { alert('Current password is incorrect'); return false; }
    if (newPassword.length < 6) { alert('New password must be at least 6 characters'); return false; }
    if (newPassword !== confirmPassword) { alert('New passwords do not match'); return false; }

    alert('To permanently change the password, update the ADMIN_PASSWORD value in admin.js and redeploy.');
    document.getElementById('changePasswordForm').reset();
    return false;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    document.getElementById('orderModal').addEventListener('click', e => {
        if (e.target.id === 'orderModal') closeOrderModal();
    });
});