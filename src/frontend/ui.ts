import { AppState, ACHIEVEMENTS_DEF } from "./state.js";
import { api } from "./api.js";

// Helper Functions
function formatCurrency(val: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
}

export function showToast(title: string, desc: string, iconName: string) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'glass-panel border-[#f59e0b]/50 rounded-xl p-4 flex items-start gap-3 shadow-lg toast-enter';
    toast.innerHTML = `
        <div class="w-10 h-10 rounded-full bg-[#f59e0b]/10 flex items-center justify-center shrink-0">
            <iconify-icon icon="${iconName}" stroke-width="1.5" class="text-[1.5rem] text-[#f59e0b]"></iconify-icon>
        </div>
        <div class="flex flex-col">
            <span class="font-['Cinzel'] tracking-tight font-medium text-fluid-body text-[#f5f5f5]">${title}</span>
            <span class="text-fluid-xs text-[#9ca3af] mt-0.5">${desc}</span>
        </div>
    `;
    container.appendChild(toast);
    setTimeout(() => { 
        if(container.contains(toast)) toast.remove(); 
    }, 4000);
}

export function addXPVisual(amount: number, x?: number, y?: number) {
    if(x && y) {
        const fl = document.createElement('span');
        fl.className = 'floating-xp font-["JetBrains_Mono"] font-medium text-fluid-body text-[#f59e0b]';
        fl.style.left = `${x}px`;
        fl.style.top = `${y}px`;
        fl.innerText = `+${amount} XP`;
        document.body.appendChild(fl);
        setTimeout(() => fl.remove(), 1200);
    }

    const bar = document.getElementById('xp-bar-fill');
    if(bar && bar.parentElement) {
        bar.parentElement.classList.add('animate-xp');
        setTimeout(() => bar.parentElement!.classList.remove('animate-xp'), 1000);
    }

    document.querySelectorAll('.utensil').forEach(u => {
        u.classList.remove('utensil-react-xp');
        void (u as HTMLElement).offsetWidth; 
        u.classList.add('utensil-react-xp');
    });
}

function updateHeader() {
    if(!AppState.currentTableId) return;
    
    const tableDisplay = document.getElementById('current-table-display');
    if(tableDisplay) {
        tableDisplay.innerText = AppState.currentTableId.toString().padStart(2, '0');
    }
    
    const lvl = AppState.getLevelInfo();
    const nameEl = document.getElementById('player-level-name');
    if(nameEl) {
        nameEl.innerText = lvl.name;
        nameEl.className = `font-['Cinzel'] tracking-tight font-medium text-fluid-lvl ${lvl.color}`;
    }
    
    const badgeEl = document.getElementById('player-badge');
    if(badgeEl) {
        badgeEl.setAttribute('icon', lvl.badge);
    }
    
    const fillEl = document.getElementById('xp-bar-fill');
    if(fillEl) {
        const progress = lvl.max > 1000 ? 100 : Math.max(0, Math.min(100, ((AppState.xp - lvl.min) / (lvl.max - lvl.min)) * 100));
        fillEl.style.width = `${progress}%`;
    }
}

export function updateCartBadge() {
    const badge = document.getElementById('cart-badge');
    if(!badge) return;

    const totalItems = AppState.orders.reduce((sum, o) => sum + o.quantity, 0);
    if(totalItems > 0) {
        badge.innerText = totalItems.toString();
        badge.classList.remove('hidden');
        badge.classList.add('animate-pulse');
        setTimeout(() => badge.classList.remove('animate-pulse'), 500);
    } else {
        badge.classList.add('hidden');
    }
}

// Screens
export function showScreen(id: string) {
    ['screen-tables', 'screen-menu', 'screen-summary'].forEach(s => {
        const el = document.getElementById(s);
        if(el) el.classList.add('hidden');
    });
    const active = document.getElementById(id);
    if(active) active.classList.remove('hidden');
    window.scrollTo(0, 0);
}

export async function renderScreen1() {
    showScreen('screen-tables');
    const grid = document.getElementById('tables-grid');
    if(!grid) return;

    grid.innerHTML = '<div class="col-span-full text-center text-[#9ca3af] py-10">Carregando salão...</div>';

    let tables = await api.getTables();
    let sessions = await api.getSessions();

    if(!tables) tables = Array.from({length: 5}, (_, i) => ({ id: i+1, table_number: i+1 }));
    if(!sessions) sessions = [];

    const activeSessions = sessions.filter(s => !s.closed_at);

    grid.innerHTML = '';
    tables.forEach(t => {
        const session = activeSessions.find(s => s.table_id === t.id);
        const isOccupied = !!session;
        
        const card = document.createElement('div');
        card.className = `relative aspect-square rounded-2xl border flex flex-col items-center justify-center cursor-pointer transition-all duration-300 clickable ${isOccupied ? 'bg-[#1a1a1a]/80 backdrop-blur-md border-[#2a2a2a] opacity-60' : 'bg-[#1a1a1a]/80 backdrop-blur-md border-[#22c55e]/30 hover-glow animate-pulse-green'}`;
        
        let iconHtml = isOccupied ? `<iconify-icon icon="solar:fire-bold" class="text-[clamp(2rem,6vw,3rem)] text-[#ef4444] animate-fire absolute -top-4"></iconify-icon>` : '';

        card.innerHTML = `
            ${iconHtml}
            <span class="font-['Cinzel'] tracking-tight font-medium text-[clamp(2rem,8vw,4rem)] text-[#f5f5f5] leading-none mb-2">${t.table_number.toString().padStart(2, '0')}</span>
            <span class="text-fluid-xs font-medium uppercase tracking-widest ${isOccupied ? 'text-[#ef4444]' : 'text-[#22c55e]'}">${isOccupied ? 'Ocupada' : 'Livre'}</span>
        `;

        card.onclick = async () => {
            if(isOccupied && session) {
                AppState.currentSessionId = session.id;
                AppState.currentTableId = t.table_number;
            } else {
                const newSession = await api.openSession(t.id);
                AppState.currentSessionId = newSession ? newSession.id : Math.floor(Math.random() * 10000);
                AppState.currentTableId = t.table_number;
            }
            AppState.saveState();
            AppState.sessionXP = 0;
            AppState.sessionTotal = 0;
            AppState.sessionItems = 0;
            renderScreen2();
        };

        grid.appendChild(card);
    });
}

export async function renderScreen2() {
    showScreen('screen-menu');
    updateHeader();
    updateCartBadge();
    
    const grid = document.getElementById('menu-grid');
    if(!grid) return;

    if(AppState.menu.length === 0) {
        grid.innerHTML = Array(6).fill(0).map(() => `<div class="h-32 bg-[#1a1a1a]/80 rounded-xl border border-[#2a2a2a] animate-pulse"></div>`).join('');
        let prods = await api.getProducts();
        if(prods) {
            AppState.menu = prods;
        } else {
            AppState.menu = [
                { id: 1, name: 'Nhoque quatro queijos', price: 45.00 },
                { id: 2, name: 'Isca de frango', price: 60.00 },
                { id: 3, name: 'Refrigerante', price: 7.50 }
            ];
        }
    }

    grid.innerHTML = '';
    AppState.menu.forEach(p => {
        const isDrink = p.name.toLowerCase().includes('refrigerante') || p.name.toLowerCase().includes('suco');
        const isPremium = p.price > 80;
        let icon = 'solar:plate-linear';
        if(isDrink) icon = 'solar:cup-linear';
        else if (isPremium) icon = 'solar:chef-hat-linear';

        const card = document.createElement('div');
        card.className = 'bg-[#1a1a1a]/80 backdrop-blur-md border border-[#2a2a2a] rounded-xl p-4 flex items-center gap-4 hover-glow transition-all group';
        card.innerHTML = `
            <div class="w-12 h-12 rounded-full bg-[#0d0d0d] border border-[#2a2a2a] flex items-center justify-center shrink-0 group-hover:border-[#f59e0b]/50 transition-colors">
                <iconify-icon icon="${icon}" stroke-width="1.5" class="text-[1.5rem] text-[#9ca3af] group-hover:text-[#f59e0b] transition-colors"></iconify-icon>
            </div>
            <div class="flex-grow min-w-0">
                <h3 class="font-['Inter'] font-medium text-fluid-body text-[#f5f5f5] truncate">${p.name}</h3>
                <p class="font-['JetBrains_Mono'] text-fluid-price text-[#9ca3af] mt-1">${formatCurrency(p.price)}</p>
            </div>
            <button class="w-10 h-10 rounded-full bg-[#2a2a2a] flex items-center justify-center text-[#f5f5f5] hover:bg-[#f5f5f5] hover:text-[#0d0d0d] transition-colors shrink-0 clickable btn-add" data-id="${p.id}">
                <iconify-icon icon="solar:add-linear" stroke-width="1.5" class="text-[1.25rem]"></iconify-icon>
            </button>
        `;
        grid.appendChild(card);
    });

    document.querySelectorAll('.btn-add').forEach(btn => {
        (btn as HTMLElement).onclick = (e) => {
            const idAttr = (e.currentTarget as HTMLElement).getAttribute('data-id');
            if(idAttr) {
                // We dispatch a custom event to handled in main.ts
                window.dispatchEvent(new CustomEvent('openQtyModal', { detail: { id: parseInt(idAttr, 10) } }));
            }
        };
    });
}

export async function renderOrders() {
    if(!AppState.currentSessionId) return;
    
    const scr = document.getElementById('screen-orders');
    if(!scr) return;
    
    scr.classList.remove('hidden');
    const panel = scr.firstElementChild as HTMLElement;
    if(panel) {
        panel.classList.remove('translate-x-full');
        panel.classList.add('translate-x-0');
    }

    const list = document.getElementById('orders-list');
    if(!list) return;

    list.innerHTML = '<div class="text-center text-[#9ca3af] py-10">Sincronizando...</div>';

    let apiOrders = await api.getOrders(AppState.currentSessionId);
    let apiTotalInfo = await api.getOrdersTotal(AppState.currentSessionId);

    if(!apiOrders || apiOrders.length === 0) {
        apiOrders = AppState.orders;
    }

    let apiTotal = apiTotalInfo ? apiTotalInfo.total : AppState.orders.reduce((sum, o) => sum + o.total, 0);

    list.innerHTML = '';
    if(apiOrders.length === 0) {
        list.innerHTML = '<div class="text-center text-[#9ca3af] py-10">Nenhum pedido realizado.</div>';
    } else {
        apiOrders.forEach(o => {
            const totalItem = o.total || (o.price * o.quantity);
            list.innerHTML += `
                <div class="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-3 flex justify-between items-center">
                    <div class="flex flex-col">
                        <span class="font-['Inter'] font-medium text-fluid-body text-[#f5f5f5]"><span class="text-[#f59e0b]">${o.quantity}x</span> ${o.name}</span>
                        <span class="font-['JetBrains_Mono'] text-fluid-xs text-[#9ca3af] mt-0.5">${formatCurrency(o.price)} un</span>
                    </div>
                    <span class="font-['JetBrains_Mono'] font-medium text-fluid-body text-[#f5f5f5]">${formatCurrency(totalItem)}</span>
                </div>
            `;
        });
    }

    AppState.sessionTotal = apiTotal || 0;
    
    const totalEl = document.getElementById('orders-total');
    if(totalEl) totalEl.innerText = formatCurrency(AppState.sessionTotal);
}

export function renderSummary() {
    showScreen('screen-summary');
    
    const elTotal = document.getElementById('summary-total');
    if(elTotal) elTotal.innerText = formatCurrency(AppState.sessionTotal);
    
    const elXP = document.getElementById('summary-xp');
    if(elXP) elXP.innerText = `+${AppState.sessionXP} XP`;

    const achList = document.getElementById('summary-achievements');
    if(!achList) return;
    
    achList.innerHTML = '';
    const toShow = AppState.achievements.slice(-4).reverse();
    
    if(toShow.length === 0) {
        achList.innerHTML = '<div class="col-span-full text-[#9ca3af] text-fluid-xs text-center py-4">Nenhuma conquista nova.</div>';
    } else {
        toShow.forEach(id => {
            const a = ACHIEVEMENTS_DEF[id];
            if(!a) return;
            achList.innerHTML += `
                <div class="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-3 flex items-center gap-3 min-w-[200px] snap-center shrink-0">
                    <div class="w-10 h-10 rounded-full bg-[#f59e0b]/10 flex items-center justify-center shrink-0">
                        <iconify-icon icon="${a.icon}" stroke-width="1.5" class="text-[1.5rem] text-[#f59e0b]"></iconify-icon>
                    </div>
                    <div class="flex flex-col text-left">
                        <span class="font-['Cinzel'] tracking-tight font-medium text-fluid-body text-[#f5f5f5]">${a.name}</span>
                        <span class="text-fluid-xs text-[#9ca3af] truncate">${a.desc}</span>
                    </div>
                </div>
            `;
        });
    }
}
