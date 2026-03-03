import { AppState, ACHIEVEMENTS_DEF } from "./state.js";
import { Product } from "./types.js";
import { ordersService } from "./services/orders-service.js";
import { productsService } from "./services/products-service.js";
import { tablesService } from "./services/tables-service.js";

// Helper Functions
function formatCurrency(val: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
}

const FALLBACK_DISH_ICON = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path fill='%239ca3af' d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z'/></svg>";
const SAFE_ICON_PATTERN = /^[a-z0-9:-]+$/i;

function createIcon(iconName: string, className: string, strokeWidth: string = "1.5"): HTMLElement {
    const icon = document.createElement('iconify-icon');
    icon.setAttribute('icon', SAFE_ICON_PATTERN.test(iconName) ? iconName : 'solar:danger-circle-linear');
    icon.setAttribute('stroke-width', strokeWidth);
    icon.className = className;

    return icon;
}

function toDishSlug(name: string): string {
    const slug = name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

    return slug || "dish";
}

export function showToast(title: string, desc: string, iconName: string) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'glass-panel border-[#f59e0b]/50 rounded-xl p-4 flex items-start gap-3 shadow-lg toast-enter';

    const iconWrapper = document.createElement('div');
    iconWrapper.className = 'w-10 h-10 rounded-full bg-[#f59e0b]/10 flex items-center justify-center shrink-0';
    iconWrapper.appendChild(createIcon(iconName, 'text-[1.5rem] text-[#f59e0b]'));

    const content = document.createElement('div');
    content.className = 'flex flex-col';

    const titleEl = document.createElement('span');
    titleEl.className = "font-['Cinzel'] tracking-tight font-medium text-fluid-body text-[#f5f5f5]";
    titleEl.textContent = title;

    const descEl = document.createElement('span');
    descEl.className = 'text-fluid-xs text-[#9ca3af] mt-0.5';
    descEl.textContent = desc;

    content.append(titleEl, descEl);
    toast.append(iconWrapper, content);

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

    const data = await tablesService.loadTablesAndSessions();
    if (!data) {
        grid.innerHTML = '<div class="col-span-full text-center text-[#ef4444] py-10">Não foi possível carregar as mesas agora.</div>';
        return;
    }

    const activeSessions = tablesService.getActiveSessions(data.sessions);

    grid.innerHTML = '';
    data.tables.forEach(t => {
        const session = tablesService.findSessionForTable(t.id, activeSessions);
        const isOccupied = !!session;

        const card = document.createElement('div');
        card.className = `relative aspect-square rounded-2xl border flex flex-col items-center justify-center cursor-pointer transition-all duration-300 clickable ${isOccupied ? 'bg-[#1a1a1a]/80 backdrop-blur-md border-[#2a2a2a] opacity-60' : 'bg-[#1a1a1a]/80 backdrop-blur-md border-[#f59e0b]/40 hover-glow animate-pulse-gold'}`;

        if (isOccupied) {
            card.appendChild(createIcon('solar:fire-bold', 'text-[clamp(2rem,6vw,3rem)] text-[#ef4444] animate-fire absolute -top-4', '1.5'));
        }

        const tableNumber = document.createElement('span');
        tableNumber.className = "font-['Cinzel'] tracking-tight font-medium text-[clamp(2rem,8vw,4rem)] text-[#f5f5f5] leading-none mb-2";
        tableNumber.textContent = t.table_number.toString().padStart(2, '0');

        const availability = document.createElement('span');
        availability.className = `text-fluid-xs font-medium uppercase tracking-widest ${isOccupied ? 'text-[#ef4444]' : 'text-[#f59e0b]'}`;
        availability.textContent = isOccupied ? 'Ocupada' : 'Livre';

        card.append(tableNumber, availability);

        card.onclick = async () => {
            if (isOccupied && session) {
                // Nova Regra: Não permitir entrar em mesa ocupada!
                showToast('Mesa Indisponível', 'Esta mesa já está ocupada por outros clientes.', 'solar:lock-password-linear');
                return;
            } else {
                const sessionId = await tablesService.openAndResolveSessionId(t.id);
                if (!sessionId) {
                    showToast('Erro na sessão', 'Não foi possível abrir a mesa agora.', 'solar:danger-circle-linear');
                    return;
                }

                AppState.currentSessionId = sessionId;
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
        const prods = await productsService.loadProducts();
        if (!prods) {
            grid.innerHTML = '<div class="col-span-full text-center text-[#ef4444] py-10">Não foi possível carregar o cardápio agora.</div>';
            return;
        }

        AppState.menu = prods;
    }

    grid.innerHTML = '';
    AppState.menu.forEach(p => {
        const card = document.createElement('div');
        card.className = 'bg-[#1a1a1a]/80 backdrop-blur-md border border-[#2a2a2a] rounded-xl p-4 flex items-center gap-4 hover-glow transition-all group';
        const iconBox = document.createElement('div');
        iconBox.className = 'w-14 h-14 rounded-xl bg-gradient-to-tl from-[#0d0d0d] to-[#1a1a1a] border border-[#2a2a2a] shadow-inner flex items-center justify-center shrink-0 group-hover:border-[#f59e0b]/50 group-hover:shadow-[inset_0_0_10px_rgba(245,158,11,0.1)] transition-all';

        const dishImage = document.createElement('img');
        dishImage.className = 'w-10 h-10 object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-300';
        dishImage.src = `/assets/dishes/${toDishSlug(p.name)}.svg`;
        dishImage.alt = p.name;
        dishImage.addEventListener('error', () => {
            dishImage.src = FALLBACK_DISH_ICON;
        }, { once: true });
        iconBox.appendChild(dishImage);

        const content = document.createElement('div');
        content.className = 'flex-grow min-w-0';

        const title = document.createElement('h3');
        title.className = "font-['Inter'] font-medium text-fluid-body text-[#f5f5f5] truncate";
        title.textContent = p.name;

        const price = document.createElement('p');
        price.className = "font-['JetBrains_Mono'] text-fluid-price text-[#9ca3af] mt-1";
        price.textContent = formatCurrency(p.price);
        content.append(title, price);

        const addBtn = document.createElement('button');
        addBtn.className = 'w-10 h-10 rounded-full bg-[#2a2a2a] flex items-center justify-center text-[#f5f5f5] hover:bg-[#f5f5f5] hover:text-[#0d0d0d] transition-colors shrink-0 clickable btn-add';
        addBtn.setAttribute('data-id', String(p.id));
        addBtn.appendChild(createIcon('solar:add-linear', 'text-[1.25rem]'));

        card.append(iconBox, content, addBtn);
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

    const statusByOrderId = new Map(AppState.orders.map(order => [order.id, order.status]));
    const syncResult = await ordersService.syncSessionOrders(
        AppState.currentSessionId,
        (orderId) => statusByOrderId.get(orderId) ?? 'preparing'
    );

    if (syncResult) {
        AppState.orders = syncResult.orders;
        AppState.sessionTotal = syncResult.total;
        AppState.sessionItems = syncResult.quantity;
        AppState.saveState();
    }

    const orders = AppState.orders;

    list.innerHTML = '';
    if (orders.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'text-center text-[#9ca3af] py-10';
        empty.textContent = 'Nenhum pedido realizado.';
        list.appendChild(empty);
    } else {
        const fragment = document.createDocumentFragment();

        orders.forEach(o => {
            const totalItem = o.total || (o.price * o.quantity);
            const card = document.createElement('div');
            card.className = `bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-3 flex flex-col justify-between items-start transition-all ${o.status === 'ready' ? 'border-[#22c55e]/50 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : ''}`;

            const topRow = document.createElement('div');
            topRow.className = 'flex justify-between items-start w-full';

            const left = document.createElement('div');
            left.className = 'flex flex-col';

            const title = document.createElement('span');
            title.className = "font-['Inter'] font-medium text-fluid-body text-[#f5f5f5]";

            const qty = document.createElement('span');
            qty.className = 'text-[#f59e0b]';
            qty.textContent = `${o.quantity}x`;
            title.appendChild(qty);
            title.append(` ${o.name}`);

            const unitPrice = document.createElement('span');
            unitPrice.className = "font-['JetBrains_Mono'] text-fluid-xs text-[#9ca3af] mt-0.5";
            unitPrice.textContent = `${formatCurrency(o.price)} un`;
            left.append(title, unitPrice);

            const total = document.createElement('span');
            total.className = "font-['JetBrains_Mono'] font-medium text-fluid-body text-[#f5f5f5]";
            total.textContent = formatCurrency(totalItem);
            topRow.append(left, total);

            card.appendChild(topRow);

            if (o.status === 'preparing') {
                const status = document.createElement('div');
                status.className = 'mt-3 w-full';

                const statusLabel = document.createElement('span');
                statusLabel.className = 'text-fluid-xs text-[#f59e0b] status-preparing';
                statusLabel.appendChild(createIcon('solar:chef-hat-linear', 'mr-1'));
                statusLabel.append(' Preparando...');

                const progressBar = document.createElement('div');
                progressBar.className = 'prep-progress-bar';
                const progressFill = document.createElement('div');
                progressFill.className = 'prep-progress-fill';
                progressBar.appendChild(progressFill);

                status.append(statusLabel, progressBar);
                card.appendChild(status);
            } else if (o.status === 'ready') {
                const eatBtn = document.createElement('button');
                eatBtn.className = 'mt-3 w-full py-3 rounded-lg bg-[#22c55e]/10 border border-[#22c55e]/50 text-[#22c55e] font-medium text-fluid-xs hover:bg-[#22c55e]/20 transition-all clickable btn-eat flex items-center justify-center gap-3 relative overflow-hidden';
                eatBtn.setAttribute('data-id', o.id);

                const mascot = document.createElement('img');
                mascot.src = '/assets/icons/mouse-eating.svg';
                mascot.alt = 'Mouse Eating Cheese';
                mascot.className = 'w-8 h-8 mascot-eat drop-shadow-sm';

                const text = document.createElement('span');
                text.className = 'z-10';
                text.textContent = `Comer Pedido (+${o.quantity * 10} XP)`;

                eatBtn.append(mascot, text);
                card.appendChild(eatBtn);
            } else if (o.status === 'consumed') {
                const consumed = document.createElement('div');
                consumed.className = 'mt-3 w-full flex items-center gap-2 text-fluid-xs text-[#9ca3af]';
                consumed.appendChild(createIcon('solar:check-circle-linear', 'text-[1.1rem] text-[#22c55e]'));
                consumed.append(' Consumido');
                card.appendChild(consumed);
            }

            fragment.appendChild(card);
        });

        list.appendChild(fragment);
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
