import { AppState } from "../state.js";
import { ordersService } from "../services/orders-service.js";
import { tablesService } from "../services/tables-service.js";
import { renderScreen1, renderScreen2, renderOrders, renderSummary, addXPVisual, updateCartBadge, showToast, openModalUI, closeModalUI, updateModalQtyDisplay } from "../ui.js";
let qtyVal = 1;
let isInitialized = false;
const CHECKOUT_DEFAULT_LABEL = '<iconify-icon icon="solar:bill-check-linear" stroke-width="1.5" class="text-[1.5rem]"></iconify-icon> Fechar Conta';
const CHECKOUT_LOADING_LABEL = '<iconify-icon icon="solar:spinner-linear" class="animate-spin text-[1.5rem]"></iconify-icon> Fechando...';
function closeQtyModal() {
    closeModalUI();
    AppState.selectedProduct = null;
}
function bindGlobalClickHandler() {
    document.addEventListener('click', (e) => {
        const target = e.target;
        if (target.closest('.clickable') || target.tagName.toLowerCase() === 'button') {
            document.querySelectorAll('.utensil-wrapper').forEach(wrapper => {
                wrapper.classList.add('utensil-bump');
                setTimeout(() => wrapper.classList.remove('utensil-bump'), 200);
            });
        }
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
        const btnPlus = target.closest('#btn-qty-plus');
        if (btnPlus) {
            e.preventDefault();
            qtyVal++;
            if (AppState.selectedProduct) {
                updateModalQtyDisplay(AppState.selectedProduct, qtyVal);
            }
            return;
        }
        const btnCancel = target.closest('#btn-qty-cancel');
        if (btnCancel) {
            e.preventDefault();
            closeQtyModal();
        }
    });
}
function bindOpenQtyModalHandler() {
    window.addEventListener('openQtyModal', (e) => {
        const customEvent = e;
        const productId = customEvent.detail.id;
        const product = AppState.menu.find(menuItem => menuItem.id === productId);
        if (!product)
            return;
        AppState.selectedProduct = product;
        qtyVal = 1;
        openModalUI(product, qtyVal);
    });
}
async function handleConfirmQuantityClick(e) {
    e.preventDefault();
    const product = AppState.selectedProduct;
    if (!product || !AppState.currentSessionId)
        return;
    const quantity = qtyVal;
    closeQtyModal();
    const button = e.currentTarget;
    const buttonRect = button.getBoundingClientRect();
    const statusByOrderId = new Map(AppState.orders.map(order => [order.id, order.status]));
    const createOrderAndSyncResult = await ordersService.createOrderAndSync(AppState.currentSessionId, product.id, quantity, (orderId) => statusByOrderId.get(orderId) ?? 'preparing');
    if (!createOrderAndSyncResult) {
        showToast('Erro no pedido', 'Não foi possível registrar o pedido na API.', 'solar:danger-circle-linear');
        return;
    }
    const confirmedOrder = createOrderAndSyncResult.order;
    const existingOrderIndex = AppState.orders.findIndex(order => order.id === confirmedOrder.id);
    if (existingOrderIndex > -1) {
        AppState.orders[existingOrderIndex] = confirmedOrder;
    }
    else {
        AppState.orders.push(confirmedOrder);
    }
    AppState.sessionTotal = createOrderAndSyncResult.total;
    AppState.sessionItems = createOrderAndSyncResult.quantity;
    AppState.saveState();
    setTimeout(() => {
        const orderIndex = AppState.orders.findIndex(order => order.id === confirmedOrder.id);
        if (orderIndex > -1) {
            AppState.orders[orderIndex].status = 'ready';
            AppState.saveState();
            if (!document.getElementById('screen-orders')?.classList.contains('hidden')) {
                renderOrders();
            }
            showToast('Pedido Pronto!', `${quantity}x ${product.name} pronto para consumo.`, 'solar:bell-bing-linear');
        }
    }, 3000);
    const now = Date.now();
    if (now - AppState.lastOrderTime < 30000 && AppState.lastOrderTime !== 0) {
        const comboText = document.createElement('div');
        comboText.className = 'combo-text font-["Cinzel"] font-medium text-[clamp(3rem,8vw,5rem)] tracking-tight';
        comboText.innerText = 'COMBO x2';
        document.body.appendChild(comboText);
        setTimeout(() => comboText.remove(), 1500);
        AppState.triggerAchievement('combo_master');
        AppState.xp += 20;
        AppState.sessionXP += 20;
        AppState.saveState();
        addXPVisual(20, buttonRect.left + buttonRect.width / 2, buttonRect.top - 20);
    }
    AppState.lastOrderTime = now;
    AppState.triggerAchievement('first_dish');
    if (product.price > 80)
        AppState.triggerAchievement('gourmet');
    if (product.name.toLowerCase().includes('refrigerante') || product.name.toLowerCase().includes('suco')) {
        AppState.triggerAchievement('zero_thirst');
    }
    const uniqueProductIds = new Set(AppState.orders.map(order => order.product_id));
    if (uniqueProductIds.size >= 3)
        AppState.triggerAchievement('explorer');
    updateCartBadge();
}
function bindEatItemHandler() {
    window.addEventListener('eatItem', (e) => {
        const customEvent = e;
        const orderId = customEvent.detail.id;
        const orderIndex = AppState.orders.findIndex(order => order.id === orderId);
        if (orderIndex === -1 || AppState.orders[orderIndex].status !== 'ready')
            return;
        const order = AppState.orders[orderIndex];
        order.status = 'consumed';
        const xpGain = order.quantity * 10;
        AppState.xp += xpGain;
        AppState.sessionXP += xpGain;
        AppState.saveState();
        const orderButton = document.querySelector(`[data-id="${orderId}"]`);
        if (orderButton) {
            const buttonRect = orderButton.getBoundingClientRect();
            addXPVisual(xpGain, buttonRect.left + buttonRect.width / 2, buttonRect.top - 20);
        }
        else {
            addXPVisual(xpGain);
        }
        renderOrders();
        renderScreen2();
    });
}
function bindSidebarActions() {
    document.getElementById('btn-floating-cart')?.addEventListener('click', renderOrders);
    document.getElementById('btn-close-orders')?.addEventListener('click', () => {
        const ordersScreen = document.getElementById('screen-orders');
        if (!ordersScreen || !ordersScreen.firstElementChild)
            return;
        ordersScreen.firstElementChild.classList.remove('translate-x-0');
        ordersScreen.firstElementChild.classList.add('translate-x-full');
        setTimeout(() => ordersScreen.classList.add('hidden'), 300);
    });
}
async function handleCheckoutClick(e) {
    if (!AppState.currentSessionId)
        return;
    if (AppState.orders.length === 0) {
        showToast('Atenção', 'Nenhum pedido para fechar.', 'solar:danger-circle-linear');
        return;
    }
    const unconsumedItems = AppState.orders.filter(order => order.status !== 'consumed');
    if (unconsumedItems.length > 0) {
        showToast('Atenção', 'Você precisa comer todos os pedidos antes de fechar a conta.', 'solar:danger-circle-linear');
        return;
    }
    const button = e.currentTarget;
    button.innerHTML = CHECKOUT_LOADING_LABEL;
    button.disabled = true;
    const closeSessionResult = await tablesService.closeSession(AppState.currentSessionId);
    if (closeSessionResult === null) {
        showToast('Erro ao fechar conta', 'Não foi possível fechar a sessão agora.', 'solar:danger-circle-linear');
        button.disabled = false;
        button.innerHTML = CHECKOUT_DEFAULT_LABEL;
        return;
    }
    const ordersScreen = document.getElementById('screen-orders');
    if (ordersScreen)
        ordersScreen.classList.add('hidden');
    AppState.xp += 50;
    AppState.sessionXP += 50;
    AppState.triggerAchievement('closed_deal');
    renderSummary();
    AppState.currentSessionId = null;
    AppState.currentTableId = null;
    AppState.orders = [];
    AppState.sessionTotal = 0;
    AppState.sessionItems = 0;
    AppState.sessionXP = 0;
    AppState.saveState();
    button.disabled = false;
    button.innerHTML = CHECKOUT_DEFAULT_LABEL;
}
async function handleBackToTablesClick() {
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
}
function bindScreenActions() {
    document.getElementById('btn-qty-confirm')?.addEventListener('click', (e) => {
        void handleConfirmQuantityClick(e);
    });
    document.getElementById('btn-checkout')?.addEventListener('click', (e) => {
        void handleCheckoutClick(e);
    });
    document.getElementById('btn-new-table')?.addEventListener('click', () => {
        renderScreen1();
    });
    document.getElementById('btn-back-tables')?.addEventListener('click', () => {
        void handleBackToTablesClick();
    });
}
function onDomReady() {
    bindScreenActions();
    bindSidebarActions();
    renderScreen1();
}
export function initAppController() {
    if (isInitialized)
        return;
    isInitialized = true;
    bindGlobalClickHandler();
    bindOpenQtyModalHandler();
    bindEatItemHandler();
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', onDomReady, { once: true });
    }
    else {
        onDomReady();
    }
}
