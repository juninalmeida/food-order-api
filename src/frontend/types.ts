export interface Product {
    id: number;
    name: string;
    price: number;
    created_at?: string;
    updated_at?: string;
}

export interface Table {
    id: number;
    table_number: number;
    created_at?: string;
    updated_at?: string;
}

export interface TableSession {
    id: number;
    table_id: number;
    opened_at: string;
    closed_at: string | null;
}

export interface ApiOrder {
    id: number;
    table_session_id: number;
    product_id: number;
    name: string;
    price: number;
    quantity: number;
    total: number;
    created_at: string;
    updated_at: string;
}

export interface OrderItem {
    id: string;
    product_id: number;
    name: string;
    price: number;
    quantity: number;
    total: number;
    status: 'preparing' | 'ready' | 'consumed';
    table_session_id?: number;
    created_at?: string;
    updated_at?: string;
}

export interface Achievement {
    id: string;
    name: string;
    desc: string;
    icon: string;
}

export interface LevelInfo {
    name: string;
    badge: string;
    color: string;
    min: number;
    max: number;
}
