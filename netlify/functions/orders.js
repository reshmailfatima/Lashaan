const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

// Initialize tables on first run
async function initDB() {
    await sql`
        CREATE TABLE IF NOT EXISTS orders (
            id TEXT PRIMARY KEY,
            customer_name TEXT NOT NULL,
            customer_phone TEXT NOT NULL,
            customer_address TEXT NOT NULL,
            customer_city TEXT NOT NULL,
            customer_notes TEXT,
            products JSONB NOT NULL,
            subtotal INTEGER NOT NULL,
            delivery_charge INTEGER NOT NULL,
            total INTEGER NOT NULL,
            status TEXT DEFAULT 'pending',
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
    `;
}

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        await initDB();

        // GET - fetch all orders
        if (event.httpMethod === 'GET') {
            const orders = await sql`
                SELECT * FROM orders ORDER BY created_at DESC
            `;
            // Format to match existing admin.js structure
            const formatted = orders.map(o => ({
                id: o.id,
                customer: {
                    name: o.customer_name,
                    phone: o.customer_phone,
                    address: o.customer_address,
                    city: o.customer_city,
                    notes: o.customer_notes || ''
                },
                products: o.products,
                subtotal: o.subtotal,
                deliveryCharge: o.delivery_charge,
                total: o.total,
                status: o.status,
                date: o.created_at
            }));
            return { statusCode: 200, headers, body: JSON.stringify(formatted) };
        }

        // POST - create new order
        if (event.httpMethod === 'POST') {
            const order = JSON.parse(event.body);
            await sql`
                INSERT INTO orders (
                    id, customer_name, customer_phone, customer_address,
                    customer_city, customer_notes, products, subtotal,
                    delivery_charge, total, status
                ) VALUES (
                    ${order.id},
                    ${order.customer.name},
                    ${order.customer.phone},
                    ${order.customer.address},
                    ${order.customer.city},
                    ${order.customer.notes || ''},
                    ${JSON.stringify(order.products)},
                    ${order.subtotal},
                    ${order.deliveryCharge},
                    ${order.total},
                    'pending'
                )
            `;
            return { statusCode: 201, headers, body: JSON.stringify({ success: true, id: order.id }) };
        }

        // PUT - update order status
        if (event.httpMethod === 'PUT') {
            const { id, status } = JSON.parse(event.body);
            await sql`
                UPDATE orders SET status = ${status} WHERE id = ${id}
            `;
            return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
        }

        // DELETE - delete an order
        if (event.httpMethod === 'DELETE') {
            const { id } = JSON.parse(event.body);
            if (id === 'ALL') {
                await sql`DELETE FROM orders`;
            } else {
                await sql`DELETE FROM orders WHERE id = ${id}`;
            }
            return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
        }

        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

    } catch (err) {
        console.error('DB Error:', err);
        return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
    }
};