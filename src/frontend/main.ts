import { AppState } from "./state.js";
import { api } from "./api.js";
import { 
    renderScreen1, 
    renderScreen2, 
    renderOrders, 
    renderSummary, 
    addXPVisual, 
    updateCartBadge,
    showToast
} from "./ui.js";

// Global click handler for animations
document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if(target.closest('.clickable') || target.tagName.toLowerCase() === 'button') {
        document.querySelectorAll('.utensil-wrapper').forEach(w => {
            w.classList.add('utensil-bump');
            setTimeout(() => w.classList.remove('utensil-bump'), 200);
        });
    }
});

// Modal Logic
let qtyVal = 1;

window.addEventListener('openQtyModal', (e: Event) => {
    const customEvent = e as CustomEvent;
    const id = customEvent.detail.id;
    const p = AppState.menu.find(m => m.id === id);
    if(!p) return;
    
    AppState.selectedProduct = p;
    qtyVal = 1;
    
    const nameEl = document.getElementById('modal-qty-name');
    const priceEl = document.getElementById('modal-qty-price');
    const valEl = document.getElementById('modal-qty-val');
    
    if(nameEl) nameEl.innerText = p.name;
    if(priceEl) priceEl.innerText = `R$ ${p.price.toFixed(2).replace('.', ',')}`;
    if(valEl) valEl.innerText = qtyVal.toString();
    
    const m = document.getElementById('modal-qty');
    if(m) {
        m.classList.remove('hidden');
        setTimeout(() => m.firstElementChild?.classList.remove('translate-y-full'), 10);
    }
});

function closeQtyModal() {
    const m = document.getElementById('modal-qty');
    if(m) {
        m.firstElementChild?.classList.add('translate-y-full');
        setTimeout(() => m.classList.add('hidden'), 300);
    }
    AppState.selectedProduct = null;
}

document.getElementById('btn-qty-minus')?.addEventListener('click', (e) => {
    e.preventDefault();
    if(qtyVal > 1) { 
        qtyVal--; 
        const valEl = document.getElementById('modal-qty-val');
        if(valEl) valEl.innerText = qtyVal.toString(); 
    }
});

document.getElementById('btn-qty-plus')?.addEventListener('click', (e) => {
    e.preventDefault();
    qtyVal++; 
    const valEl = document.getElementById('modal-qty-val');
    if(valEl) valEl.innerText = qtyVal.toString(); 
});

document.getElementById('btn-qty-cancel')?.addEventListener('click', (e) => {
    e.preventDefault();
    closeQtyModal();
});

document.getElementById('btn-qty-confirm')?.addEventListener('click', async (e) => {
    e.preventDefault();
    const p = AppState.selectedProduct;
    if(!p || !AppState.currentSessionId) return;

    const q = qtyVal;
    closeQtyModal();
    
    const btn = e.currentTarget as HTMLElement;
    const rect = btn.getBoundingClientRect();
    
    await api.createOrder(AppState.currentSessionId, p.id, q);

    const clientOrderId = Math.random().toString(36).substring(7);
    
    AppState.orders.push({ 
        id: clientOrderId,
        product_id: p.id, 
        name: p.name, 
        price: p.price, 
        quantity: q, 
        total: p.price * q,
        status: 'preparing' 
    });
    
    AppState.sessionTotal += p.price * q;
    AppState.saveState();
    
    // Simulate Preparation Time
    setTimeout(() => {
        const orderIndex = AppState.orders.findIndex(o => o.id === clientOrderId);
        if(orderIndex > -1) {
            AppState.orders[orderIndex].status = 'ready';
            AppState.saveState();
            // Re-render orders if sidebar is open
            if(!document.getElementById('screen-orders')?.classList.contains('hidden')) {
                renderOrders();
            }
            showToast('Pedido Pronto!', `${q}x ${p.name} pronto para consumo.`, 'solar:bell-bing-linear');
        }
    }, 3000);

    const now = Date.now();
    let isCombo = false;
    if(now - AppState.lastOrderTime < 30000 && AppState.lastOrderTime !== 0) {
        isCombo = true;
        const ct = document.createElement('div');
        ct.className = 'combo-text font-["Cinzel"] font-medium text-[clamp(3rem,8vw,5rem)] tracking-tight';
        ct.innerText = 'COMBO x2';
        document.body.appendChild(ct);
        setTimeout(() => ct.remove(), 1500);
        AppState.triggerAchievement('combo_master');
        
        // Give combo bonus XP immediately
        AppState.xp += 20;
        AppState.sessionXP += 20;
        AppState.saveState();
        addXPVisual(20, rect.left + rect.width/2, rect.top - 20);
    }
    AppState.lastOrderTime = now;

    AppState.triggerAchievement('first_dish');
    if(p.price > 80) AppState.triggerAchievement('gourmet');
    if(p.name.toLowerCase().includes('refrigerante') || p.name.toLowerCase().includes('suco')) AppState.triggerAchievement('zero_thirst');
    
    const uniqueIds = new Set(AppState.orders.map(o => o.product_id));
    if(uniqueIds.size >= 3) AppState.triggerAchievement('explorer');

    updateCartBadge();
});

// Eat Item Logic
window.addEventListener('eatItem', (e: Event) => {
    const customEvent = e as CustomEvent;
    const id = customEvent.detail.id;
    
    const orderIndex = AppState.orders.findIndex(o => o.id === id);
    if(orderIndex > -1 && AppState.orders[orderIndex].status === 'ready') {
        const o = AppState.orders[orderIndex];
        o.status = 'consumed';
        
        const xpGain = o.quantity * 10;
        AppState.xp += xpGain;
        AppState.sessionXP += xpGain;
        AppState.saveState();

        const btn = document.querySelector(`[data-id="${id}"]`);
        if (btn) {
            const rect = btn.getBoundingClientRect();
            addXPVisual(xpGain, rect.left + rect.width/2, rect.top - 20);
        } else {
            addXPVisual(xpGain);
        }
        
        renderOrders();
        renderScreen2(); // Update header XP bar
    }
});

// Sidebar & Checkout
document.getElementById('btn-floating-cart')?.addEventListener('click', renderOrders);

document.getElementById('btn-close-orders')?.addEventListener('click', () => {
    const scr = document.getElementById('screen-orders');
    if(scr && scr.firstElementChild) {
        scr.firstElementChild.classList.remove('translate-x-0');
        scr.firstElementChild.classList.add('translate-x-full');
        setTimeout(() => scr.classList.add('hidden'), 300);
    }
});

document.getElementById('btn-checkout')?.addEventListener('click', async (e) => {
    if(!AppState.currentSessionId) return;

    if(AppState.orders.length === 0) {
        showToast('Atenção', 'Nenhum pedido para fechar.', 'solar:danger-circle-linear');
        return;
    }
    
    const unconsumedItems = AppState.orders.filter(o => o.status !== 'consumed');
    if(unconsumedItems.length > 0) {
        showToast('Atenção', 'Você precisa comer todos os pedidos antes de fechar a conta.', 'solar:danger-circle-linear');
        return;
    }

    const btn = e.currentTarget as HTMLButtonElement;
    btn.innerHTML = '<iconify-icon icon="solar:spinner-linear" class="animate-spin text-[1.5rem]"></iconify-icon> Fechando...';
    btn.disabled = true;

    await api.closeSession(AppState.currentSessionId);
    
    const scr = document.getElementById('screen-orders');
    if(scr) scr.classList.add('hidden');
    
    AppState.xp += 50;
    AppState.sessionXP += 50;
    AppState.triggerAchievement('closed_deal');
    
    renderSummary();
    
    // Completely clear local session data to guarantee fresh restart
    AppState.currentSessionId = null;
    AppState.currentTableId = null;
    AppState.orders = [];
    AppState.sessionTotal = 0;
    AppState.sessionItems = 0;
    AppState.sessionXP = 0;
    AppState.saveState();
    
    btn.disabled = false;
    btn.innerHTML = '<iconify-icon icon="solar:bill-check-linear" stroke-width="1.5" class="text-[1.5rem]"></iconify-icon> Fechar Conta';
});

document.getElementById('btn-new-table')?.addEventListener('click', () => {
    renderScreen1();
});

document.getElementById('btn-back-tables')?.addEventListener('click', () => {
    renderScreen1();
});

// Bootstrap
document.addEventListener('DOMContentLoaded', () => {
    if(AppState.currentSessionId && AppState.currentTableId) {
        renderScreen2();
    } else {
        renderScreen1();
    }
});