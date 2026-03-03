import { AppState, ACHIEVEMENTS_DEF } from "./state.js";
import { api } from "./api.js";
import { Product } from "./types.js";

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
        if (container.contains(toast)) toast.remove();
    }, 4000);
}

export function addXPVisual(amount: number, x?: number, y?: number) {
    if (x && y) {
        const fl = document.createElement('span');
        fl.className = 'floating-xp font-["JetBrains_Mono"] font-medium text-fluid-body text-[#f59e0b]';
        fl.style.left = `${x}px`;
        fl.style.top = `${y}px`;
        fl.innerText = `+${amount} XP`;
        document.body.appendChild(fl);
        setTimeout(() => fl.remove(), 1200);
    }

    const bar = document.getElementById('xp-bar-fill');
    if (bar && bar.parentElement) {
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
    if (!AppState.currentTableId) return;

    const tableDisplay = document.getElementById('current-table-display');
    if (tableDisplay) {
        tableDisplay.innerText = AppState.currentTableId.toString().padStart(2, '0');
    }

    const lvl = AppState.getLevelInfo();
    const nameEl = document.getElementById('player-level-name');
    if (nameEl) {
        nameEl.innerText = lvl.name;
        nameEl.className = `font-['Cinzel'] tracking-tight font-medium text-fluid-lvl ${lvl.color}`;
    }

    const badgeEl = document.getElementById('player-badge');
    if (badgeEl) {
        badgeEl.setAttribute('icon', lvl.badge);
    }

    const fillEl = document.getElementById('xp-bar-fill');
    if (fillEl) {
        const progress = lvl.max > 1000 ? 100 : Math.max(0, Math.min(100, ((AppState.xp - lvl.min) / (lvl.max - lvl.min)) * 100));
        fillEl.style.width = `${progress}%`;
    }
}

export function updateCartBadge() {
    const badge = document.getElementById('cart-badge');
    if (!badge) return;

    const totalItems = AppState.orders.reduce((sum, o) => sum + o.quantity, 0);
    if (totalItems > 0) {
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
        if (el) el.classList.add('hidden');
    });
    const active = document.getElementById(id);
    if (active) active.classList.remove('hidden');
    window.scrollTo(0, 0);
}

export async function renderScreen1() {
    showScreen('screen-tables');
    const grid = document.getElementById('tables-grid');
    if (!grid) return;

    grid.innerHTML = '<div class="col-span-full text-center text-[#9ca3af] py-10">Carregando salão...</div>';

    let tables = await api.getTables();
    let sessions = await api.getSessions();

    if (!tables) tables = Array.from({ length: 5 }, (_, i) => ({ id: i + 1, table_number: i + 1 }));
    if (!sessions) sessions = [];

    const activeSessions = sessions.filter(s => !s.closed_at);

    grid.innerHTML = '';
    tables.forEach(t => {
        const session = activeSessions.find(s => s.table_id === t.id);
        const isOccupied = !!session;

        const card = document.createElement('div');
        card.className = `relative aspect-square rounded-2xl border flex flex-col items-center justify-center cursor-pointer transition-all duration-300 clickable ${isOccupied ? 'bg-[#1a1a1a]/80 backdrop-blur-md border-[#2a2a2a] opacity-60' : 'bg-[#1a1a1a]/80 backdrop-blur-md border-[#f59e0b]/40 hover-glow animate-pulse-gold'}`;

        let iconHtml = isOccupied ? `<iconify-icon icon="solar:fire-bold" class="text-[clamp(2rem,6vw,3rem)] text-[#ef4444] animate-fire absolute -top-4"></iconify-icon>` : '';

        card.innerHTML = `
            ${iconHtml}
            <span class="font-['Cinzel'] tracking-tight font-medium text-[clamp(2rem,8vw,4rem)] text-[#f5f5f5] leading-none mb-2">${t.table_number.toString().padStart(2, '0')}</span>
            <span class="text-fluid-xs font-medium uppercase tracking-widest ${isOccupied ? 'text-[#ef4444]' : 'text-[#f59e0b]'}">${isOccupied ? 'Ocupada' : 'Livre'}</span>
        `;

        card.onclick = async () => {
            if (isOccupied && session) {
                // Nova Regra: Não permitir entrar em mesa ocupada!
                showToast('Mesa Indisponível', 'Esta mesa já está ocupada por outros clientes.', 'solar:lock-password-linear');
                return;
            } else {
                const newSession = await api.openSession(t.id);
                // Como o backend (create) pode não retornar o objeto inteiro da sessão (ele retorna status 201 vazio), 
                // Precisamos buscar as sessões novamente para pegar o ID da que acabou de ser criada
                const updatedSessions = await api.getSessions();
                const latestSession = updatedSessions?.reverse().find(s => s.table_id === t.id && !s.closed_at);

                AppState.currentSessionId = latestSession ? latestSession.id : Math.floor(Math.random() * 10000);
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
    if (!grid) return;

    if (AppState.menu.length === 0) {
        grid.innerHTML = Array(6).fill(0).map(() => `<div class="h-32 bg-[#1a1a1a]/80 rounded-xl border border-[#2a2a2a] animate-pulse"></div>`).join('');
        let prods = await api.getProducts();
        if (prods) {
            AppState.menu = prods;
        } else {
            AppState.menu = [
                { id: 1, name: 'Baião de Dois Arretado', price: 32.90 },
                { id: 2, name: 'Cuscuz Cabra da Peste', price: 54.50 },
                { id: 3, name: 'Carne de Sol do Lampião', price: 55.90 }
            ];
        }
    }

    grid.innerHTML = '';
    AppState.menu.forEach(p => {
        // Convert name to svg path (e.g Baião de Dois Arretado -> baiao-de-dois-arretado.svg)
        const slug = p.name
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, '-');

        const customSvg = `<img src="/assets/dishes/${slug}.svg" alt="${p.name}" class="w-10 h-10 object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-300" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 24 24\\'><path fill=\\'%239ca3af\\' d=\\'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z\\'/></svg>'"/>`;

        const card = document.createElement('div');
        card.className = 'bg-[#1a1a1a]/80 backdrop-blur-md border border-[#2a2a2a] rounded-xl p-4 flex items-center gap-4 hover-glow transition-all group';
        card.innerHTML = `
            <div class="w-14 h-14 rounded-xl bg-gradient-to-tl from-[#0d0d0d] to-[#1a1a1a] border border-[#2a2a2a] shadow-inner flex items-center justify-center shrink-0 group-hover:border-[#f59e0b]/50 group-hover:shadow-[inset_0_0_10px_rgba(245,158,11,0.1)] transition-all">
                ${customSvg}
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
            if (idAttr) {
                // We dispatch a custom event to handled in main.ts
                window.dispatchEvent(new CustomEvent('openQtyModal', { detail: { id: parseInt(idAttr, 10) } }));
            }
        };
    });
}

export async function renderOrders() {
    if (!AppState.currentSessionId) return;

    const scr = document.getElementById('screen-orders');
    if (!scr) return;

    scr.classList.remove('hidden');
    const panel = scr.firstElementChild as HTMLElement;
    if (panel) {
        panel.classList.remove('translate-x-full');
        panel.classList.add('translate-x-0');
    }

    const list = document.getElementById('orders-list');
    if (!list) return;

    // Removemos o sync total com a API aqui pois o status real (preparando/comido) agora é mantido localmente
    // Para simplificar a demonstração, usaremos apenas a AppState.orders.
    const orders = AppState.orders;

    list.innerHTML = '';
    if (orders.length === 0) {
        list.innerHTML = '<div class="text-center text-[#9ca3af] py-10">Nenhum pedido realizado.</div>';
    } else {
        orders.forEach(o => {
            const totalItem = o.total || (o.price * o.quantity);

            let statusHtml = '';
            if (o.status === 'preparing') {
                statusHtml = `
                    <div class="mt-3 w-full">
                        <span class="text-fluid-xs text-[#f59e0b] status-preparing"><iconify-icon icon="solar:chef-hat-linear" class="mr-1"></iconify-icon> Preparando...</span>
                        <div class="prep-progress-bar"><div class="prep-progress-fill"></div></div>
                    </div>
                `;
            } else if (o.status === 'ready') {
                statusHtml = `
                    <button class="mt-3 w-full py-3 rounded-lg bg-[#22c55e]/10 border border-[#22c55e]/50 text-[#22c55e] font-medium text-fluid-xs hover:bg-[#22c55e]/20 transition-all clickable btn-eat flex items-center justify-center gap-3 relative overflow-hidden" data-id="${o.id}">
                        <!-- Mascote SVG Animado -->
                        <img src="/assets/icons/mouse-eating.svg" alt="Mouse Eating Cheese" class="w-8 h-8 mascot-eat drop-shadow-sm" />
                        <span class="z-10">Comer Pedido (+${o.quantity * 10} XP)</span>
                    </button>
                `;
            } else if (o.status === 'consumed') {
                statusHtml = `
                    <div class="mt-3 w-full flex items-center gap-2 text-fluid-xs text-[#9ca3af]">
                        <iconify-icon icon="solar:check-circle-linear" class="text-[1.1rem] text-[#22c55e]"></iconify-icon> Consumido
                    </div>
                `;
            }

            list.innerHTML += `
                <div class="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-3 flex flex-col justify-between items-start transition-all ${o.status === 'ready' ? 'border-[#22c55e]/50 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : ''}">
                    <div class="flex justify-between items-start w-full">
                        <div class="flex flex-col">
                            <span class="font-['Inter'] font-medium text-fluid-body text-[#f5f5f5]"><span class="text-[#f59e0b]">${o.quantity}x</span> ${o.name}</span>
                            <span class="font-['JetBrains_Mono'] text-fluid-xs text-[#9ca3af] mt-0.5">${formatCurrency(o.price)} un</span>
                        </div>
                        <span class="font-['JetBrains_Mono'] font-medium text-fluid-body text-[#f5f5f5]">${formatCurrency(totalItem)}</span>
                    </div>
                    ${statusHtml}
                </div>
            `;
        });
    }

    // Attach event listeners to eat buttons
    document.querySelectorAll('.btn-eat').forEach(btn => {
        (btn as HTMLElement).onclick = (e) => {
            const idAttr = (e.currentTarget as HTMLElement).getAttribute('data-id');
            if (idAttr) {
                window.dispatchEvent(new CustomEvent('eatItem', { detail: { id: idAttr } }));
            }
        };
    });

    const totalEl = document.getElementById('orders-total');
    if (totalEl) totalEl.innerText = formatCurrency(AppState.sessionTotal);
}

export function renderSummary() {
    showScreen('screen-summary');

    const elTotal = document.getElementById('summary-total');
    if (elTotal) elTotal.innerText = formatCurrency(AppState.sessionTotal);

    const elXP = document.getElementById('summary-xp');
    if (elXP) elXP.innerText = `+${AppState.sessionXP} XP`;

    const achList = document.getElementById('summary-achievements');
    if (!achList) return;

    achList.innerHTML = '';
    const toShow = AppState.achievements.slice(-4).reverse();

    if (toShow.length === 0) {
        achList.innerHTML = '<div class="col-span-full text-[#9ca3af] text-fluid-xs text-center py-4">Nenhuma conquista nova.</div>';
    } else {
        toShow.forEach(id => {
            const a = ACHIEVEMENTS_DEF[id];
            if (!a) return;
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

export function openModalUI(product: Product, qty: number = 1) {
    const nameEl = document.getElementById('modal-qty-name');
    const priceEl = document.getElementById('modal-qty-price');
    const valEl = document.getElementById('modal-qty-val');

    if (nameEl) nameEl.innerText = product.name;
    if (priceEl) priceEl.innerText = `R$ ${(product.price * qty).toFixed(2).replace('.', ',')}`;
    if (valEl) valEl.innerText = qty.toString();

    const m = document.getElementById('modal-qty');
    if (m) {
        m.classList.remove('hidden');
        setTimeout(() => m.firstElementChild?.classList.remove('translate-y-full'), 10);
    }
}

export function closeModalUI() {
    const m = document.getElementById('modal-qty');
    if (m) {
        m.firstElementChild?.classList.add('translate-y-full');
        setTimeout(() => m.classList.add('hidden'), 300);
    }
}

export function updateModalQtyDisplay(product: Product, qty: number) {
    const valEl = document.getElementById('modal-qty-val');
    if (valEl) valEl.innerText = qty.toString();

    const priceEl = document.getElementById('modal-qty-price');
    if (priceEl) priceEl.innerText = `R$ ${(product.price * qty).toFixed(2).replace('.', ',')}`;
}
