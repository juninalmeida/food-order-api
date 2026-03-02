const API_BASE = 'http://localhost:3333';
export async function fetchAPI(endpoint, options = {}) {
    try {
        const res = await fetch(`${API_BASE}${endpoint}`, {
            headers: { 'Content-Type': 'application/json' },
            ...options
        });
        if (!res.ok) {
            console.error(`API Error on ${endpoint}: ${res.status} ${res.statusText}`);
            return null;
        }
        // Some endpoints like POST, PATCH might return empty bodies
        const text = await res.text();
        return text ? JSON.parse(text) : null;
    }
    catch (err) {
        console.warn(`API falhou para ${endpoint}. Verifique se o backend está rodando.`);
        return null;
    }
}
export const api = {
    getTables: () => fetchAPI('/tables'),
    getSessions: () => fetchAPI('/tables-sessions'),
    openSession: (tableId) => fetchAPI('/tables-sessions', {
        method: 'POST',
        body: JSON.stringify({ table_id: tableId })
    }),
    closeSession: (sessionId) => fetchAPI(`/tables-sessions/${sessionId}`, {
        method: 'PATCH'
    }),
    getProducts: () => fetchAPI('/products'),
    createOrder: (sessionId, productId, quantity) => fetchAPI('/orders', {
        method: 'POST',
        body: JSON.stringify({
            table_session_id: sessionId,
            product_id: productId,
            quantity: quantity
        })
    }),
    getOrders: (sessionId) => fetchAPI(`/orders/table-session/${sessionId}`),
    getOrdersTotal: (sessionId) => fetchAPI(`/orders/table-session/${sessionId}/total`)
};
