const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function initDB() {
    await sql`
        CREATE TABLE IF NOT EXISTS subscribers (
            id SERIAL PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
    `;
}

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        await initDB();

        // POST - add subscriber
        if (event.httpMethod === 'POST') {
            const { email } = JSON.parse(event.body);
            await sql`
                INSERT INTO subscribers (email)
                VALUES (${email})
                ON CONFLICT (email) DO NOTHING
            `;
            return { statusCode: 201, headers, body: JSON.stringify({ success: true }) };
        }

        // GET - fetch all subscribers (admin only)
        if (event.httpMethod === 'GET') {
            const subscribers = await sql`SELECT * FROM subscribers ORDER BY created_at DESC`;
            return { statusCode: 200, headers, body: JSON.stringify(subscribers) };
        }

        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

    } catch (err) {
        console.error('DB Error:', err);
        return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
    }
};