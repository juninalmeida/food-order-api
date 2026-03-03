import "./iconify-local.js";
import { AppState } from "./state.js";
import { ordersService } from "./services/orders-service.js";
import { tablesService } from "./services/tables-service.js";
import { renderScreen1, renderScreen2, renderOrders, renderSummary, addXPVisual, updateCartBadge, showToast, openModalUI, closeModalUI, updateModalQtyDisplay } from "./ui.js";
// Global click handler for animations & modal actions
document.addEventListener('click', (e) => {
    const target = e.target;
    // Utensil Animation
    if (target.closest('.clickable') || target.tagName.toLowerCase() === 'button') {
        document.querySelectorAll('.utensil-wrapper').forEach(w => {
            w.classList.add('utensil-bump');
            setTimeout(() => w.classList.remove('utensil-bump'), 200);
        });
    }
    // Modal Qty Minus
    const btnMinus = target.closest('#btn-qty-minus');
    if (btnMinus) {
        e.preventDefault();
        if (qtyVal > 1) {
            qtyVal--;
            if (AppState.selectedProduct) {
                updateModalQtyDisplay(AppState.selectedProduct, qtyVal);
            }
        }
        return;
    }
    // Modal Qty Plus
    const btnPlus = target.closest('#btn-qty-plus');
    if (btnPlus) {
        e.preventDefault();
        qtyVal++;
        if (AppState.selectedProduct) {
            updateModalQtyDisplay(AppState.selectedProduct, qtyVal);
        }
        return;
    }
    // Modal Qty Cancel
    const btnCancel = target.closest('#btn-qty-cancel');
    if (btnCancel) {
        e.preventDefault();
        closeQtyModal();
        return;
    }
});
// Modal Logic
let qtyVal = 1;
window.addEventListener('openQtyModal', (e) => {
    const customEvent = e;
    const id = customEvent.detail.id;
    const p = AppState.menu.find(m => m.id === id);
    if (!p)
        return;
    AppState.selectedProduct = p;
    qtyVal = 1;
    openModalUI(p, qtyVal);
});
function closeQtyModal() {
    closeModalUI();
    AppState.selectedProduct = null;
}
document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById('btn-qty-confirm')?.addEventListener('click', async (e) => {
        e.preventDefault();
        const p = AppState.selectedProduct;
        if (!p || !AppState.currentSessionId)
            return;
        const q = qtyVal;
        closeQtyModal();
        const btn = e.currentTarget;
        const rect = btn.getBoundingClientRect();
        const statusByOrderId = new Map(AppState.orders.map(order => [order.id, order.status]));
        const createOrderAndSyncResult = await ordersService.createOrderAndSync(AppState.currentSessionId, p.id, q, (orderId) => statusByOrderId.get(orderId) ?? 'preparing');
        if (!createOrderAndSyncResult) {
            showToast('Erro no pedido', 'Não foi possível registrar o pedido na API.', 'solar:danger-circle-linear');
            return;
        }
        const confirmedOrder = createOrderAndSyncResult.order;
        const confirmedOrderId = confirmedOrder.id;
        const existingOrderIndex = AppState.orders.findIndex(o => o.id === confirmedOrderId);
        if (existingOrderIndex > -1) {
            AppState.orders[existingOrderIndex] = confirmedOrder;
        }
        else {
            AppState.orders.push(confirmedOrder);
        }
        AppState.sessionTotal = createOrderAndSyncResult.total;
        AppState.sessionItems = createOrderAndSyncResult.quantity;
        AppState.saveState();
        // Simulate Preparation Time
        setTimeout(() => {
            const orderIndex = AppState.orders.findIndex(o => o.id === confirmedOrderId);
            if (orderIndex > -1) {
                AppState.orders[orderIndex].status = 'ready';
                AppState.saveState();
                // Re-render orders if sidebar is open
                if (!document.getElementById('screen-orders')?.classList.contains('hidden')) {
                    renderOrders();
                }
                showToast('Pedido Pronto!', `${q}x ${p.name} pronto para consumo.`, 'solar:bell-bing-linear');
            }
        }, 3000);
        const now = Date.now();
        if (now - AppState.lastOrderTime < 30000 && AppState.lastOrderTime !== 0) {
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
            addXPVisual(20, rect.left + rect.width / 2, rect.top - 20);
        }
        AppState.lastOrderTime = now;
        AppState.triggerAchievement('first_dish');
        if (p.price > 80)
            AppState.triggerAchievement('gourmet');
        if (p.name.toLowerCase().includes('refrigerante') || p.name.toLowerCase().includes('suco'))
            AppState.triggerAchievement('zero_thirst');
        const uniqueIds = new Set(AppState.orders.map(o => o.product_id));
        if (uniqueIds.size >= 3)
            AppState.triggerAchievement('explorer');
        updateCartBadge();
    });
    // Eat Item Logic
    window.addEventListener('eatItem', (e) => {
        const customEvent = e;
        const id = customEvent.detail.id;
        const orderIndex = AppState.orders.findIndex(o => o.id === id);
        if (orderIndex > -1 && AppState.orders[orderIndex].status === 'ready') {
            const o = AppState.orders[orderIndex];
            o.status = 'consumed';
            const xpGain = o.quantity * 10;
            AppState.xp += xpGain;
            AppState.sessionXP += xpGain;
            AppState.saveState();
            const btn = document.querySelector(`[data-id="${id}"]`);
            if (btn) {
                const rect = btn.getBoundingClientRect();
                addXPVisual(xpGain, rect.left + rect.width / 2, rect.top - 20);
            }
            else {
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
        if (scr && scr.firstElementChild) {
            scr.firstElementChild.classList.remove('translate-x-0');
            scr.firstElementChild.classList.add('translate-x-full');
            setTimeout(() => scr.classList.add('hidden'), 300);
        }
    });
    document.getElementById('btn-checkout')?.addEventListener('click', async (e) => {
        if (!AppState.currentSessionId)
            return;
        if (AppState.orders.length === 0) {
            showToast('Atenção', 'Nenhum pedido para fechar.', 'solar:danger-circle-linear');
            return;
        }
        const unconsumedItems = AppState.orders.filter(o => o.status !== 'consumed');
        if (unconsumedItems.length > 0) {
            showToast('Atenção', 'Você precisa comer todos os pedidos antes de fechar a conta.', 'solar:danger-circle-linear');
            return;
        }
        const btn = e.currentTarget;
        const defaultCheckoutLabel = '<iconify-icon icon="solar:bill-check-linear" stroke-width="1.5" class="text-[1.5rem]"></iconify-icon> Fechar Conta';
        btn.innerHTML = '<iconify-icon icon="solar:spinner-linear" class="animate-spin text-[1.5rem]"></iconify-icon> Fechando...';
        btn.disabled = true;
        const closeSessionResult = await tablesService.closeSession(AppState.currentSessionId);
        if (closeSessionResult === null) {
            showToast('Erro ao fechar conta', 'Não foi possível fechar a sessão agora.', 'solar:danger-circle-linear');
            btn.disabled = false;
            btn.innerHTML = defaultCheckoutLabel;
            return;
        }
        const scr = document.getElementById('screen-orders');
        if (scr)
            scr.classList.add('hidden');
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
        btn.innerHTML = defaultCheckoutLabel;
    });
    document.getElementById('btn-new-table')?.addEventListener('click', () => {
        renderScreen1();
    });
    document.getElementById('btn-back-tables')?.addEventListener('click', async () => {
        if (AppState.orders.length > 0) {
            showToast('Atenção', 'Você não pode sair da mesa com pedidos em andamento. Feche a conta.', 'solar:danger-circle-linear');
            return;
        }
        if (AppState.currentSessionId) {
            const closeSessionResult = await tablesService.closeSession(AppState.currentSessionId);
            if (closeSessionResult === null) {
                showToast('Erro na sessão', 'Não foi possível encerrar a mesa agora.', 'solar:danger-circle-linear');
                return;
            }
            AppState.currentSessionId = null;
            AppState.currentTableId = null;
            AppState.saveState();
        }
        renderScreen1();
    });
    // Because we reset state on load, we always start at screen 1
    renderScreen1();
});
