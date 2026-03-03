import { Product, Table, TableSession, ApiOrder } from "./types.js";

// Use relative path for API calls since frontend is served by the same server
const API_BASE = '';

export async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
    try {
        const res = await fetch(`${API_BASE}${endpoint}`, {
            headers: { 'Content-Type': 'application/json' },
            // @ts-ignore
            cache: 'no-store',
            ...options
        });


        if (!res.ok) {
            console.error(`API Error on ${endpoint}: ${res.status} ${res.statusText}`);
            return null;
        }

        // Some endpoints like POST, PATCH might return empty bodies
        const text = await res.text();
        return text ? JSON.parse(text) : ({} as T);
    } catch (err) {
        console.warn(`API falhou para ${endpoint}. Verifique se o backend está rodando.`);
        return null;
    }
}

export const api = {
    getTables: () => fetchAPI<Table[]>('/tables'),

    getSessions: () => fetchAPI<TableSession[]>('/tables-sessions'),

    openSession: (tableId: number) => fetchAPI<any>('/tables-sessions', {
        method: 'POST',
        body: JSON.stringify({ table_id: tableId })
    }),

    closeSession: (sessionId: number) => fetchAPI<any>(`/tables-sessions/${sessionId}`, {
        method: 'PATCH'
    }),

    getProducts: () => fetchAPI<Product[]>('/products'),

    createOrder: (sessionId: number, productId: number, quantity: number) => fetchAPI<any>('/orders', {
        method: 'POST',
        body: JSON.stringify({
            table_session_id: sessionId,
            product_id: productId,
            quantity: quantity
        })
    }),

    getOrders: (sessionId: number) => fetchAPI<ApiOrder[]>(`/orders/table-session/${sessionId}`),

    getOrdersTotal: (sessionId: number) => fetchAPI<{ total: number, quantity: number }>(`/orders/table-session/${sessionId}/total`)
};
