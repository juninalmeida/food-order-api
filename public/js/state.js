import { showToast } from "./ui.js";
export const ACHIEVEMENTS_DEF = {
    'first_dish': { id: 'first_dish', name: 'Primeiro Prato', desc: 'Fez o primeiro pedido.', icon: 'solar:chef-hat-linear' },
    'explorer': { id: 'explorer', name: 'Explorador', desc: 'Pediu 3 itens diferentes.', icon: 'solar:map-point-linear' },
    'combo_master': { id: 'combo_master', name: 'Combo Master', desc: 'Ativou um combo x2.', icon: 'solar:bolt-linear' },
    'gourmet': { id: 'gourmet', name: 'Gourmet', desc: 'Pediu um prato premium.', icon: 'solar:stars-linear' },
    'zero_thirst': { id: 'zero_thirst', name: 'Sede Zero', desc: 'Pediu uma bebida.', icon: 'solar:cup-linear' },
    'closed_deal': { id: 'closed_deal', name: 'Conta Fechada', desc: 'Finalizou uma sessão.', icon: 'solar:wallet-linear' },
    'living_legend': { id: 'living_legend', name: 'Lenda Viva', desc: 'Atingiu o nível máximo.', icon: 'solar:crown-linear' }
};
class State {
    xp;
    achievements;
    currentSessionId;
    currentTableId;
    menu;
    orders;
    lastOrderTime;
    sessionXP;
    sessionTotal;
    sessionItems;
    selectedProduct;
    constructor() {
        this.xp = parseInt(localStorage.getItem('chef_xp') || '0', 10);
        this.achievements = JSON.parse(localStorage.getItem('chef_achievements') || '[]');
        const storedSession = localStorage.getItem('current_session_id');
        this.currentSessionId = storedSession ? parseInt(storedSession, 10) : null;
        const storedTable = localStorage.getItem('current_table_id');
        this.currentTableId = storedTable ? parseInt(storedTable, 10) : null;
        this.menu = [];
        this.orders = JSON.parse(localStorage.getItem('chef_orders') || '[]');
        this.lastOrderTime = 0;
        this.sessionXP = parseInt(localStorage.getItem('chef_session_xp') || '0', 10);
        this.sessionTotal = parseFloat(localStorage.getItem('chef_session_total') || '0');
        this.sessionItems = parseInt(localStorage.getItem('chef_session_items') || '0', 10);
        this.selectedProduct = null;
    }
    saveState() {
        localStorage.setItem('chef_xp', this.xp.toString());
        localStorage.setItem('chef_achievements', JSON.stringify(this.achievements));
        localStorage.setItem('chef_orders', JSON.stringify(this.orders));
        localStorage.setItem('chef_session_xp', this.sessionXP.toString());
        localStorage.setItem('chef_session_total', this.sessionTotal.toString());
        localStorage.setItem('chef_session_items', this.sessionItems.toString());
        if (this.currentSessionId) {
            localStorage.setItem('current_session_id', this.currentSessionId.toString());
        }
        else {
            localStorage.removeItem('current_session_id');
        }
        if (this.currentTableId) {
            localStorage.setItem('current_table_id', this.currentTableId.toString());
        }
        else {
            localStorage.removeItem('current_table_id');
        }
    }
    reset() {
        localStorage.clear();
        this.xp = 0;
        this.achievements = [];
        this.currentSessionId = null;
        this.currentTableId = null;
        this.orders = [];
        this.lastOrderTime = 0;
        this.sessionXP = 0;
        this.sessionTotal = 0;
        this.sessionItems = 0;
        this.selectedProduct = null;
        this.saveState();
    }
    getLevelInfo() {
        if (this.xp >= 1000)
            return { name: 'Lenda da Cozinha', badge: 'solar:crown-linear', color: 'rainbow-text', min: 1000, max: 2000 };
        if (this.xp >= 500)
            return { name: 'Mestre Chef', badge: 'solar:star-fall-linear', color: 'text-[#eab308]', min: 500, max: 1000 };
        if (this.xp >= 250)
            return { name: 'Chef', badge: 'solar:chef-hat-linear', color: 'text-[#94a3b8]', min: 250, max: 500 };
        if (this.xp >= 100)
            return { name: 'Cozinheiro', badge: 'solar:fire-linear', color: 'text-[#b45309]', min: 100, max: 250 };
        return { name: 'Aprendiz de Chef', badge: 'solar:shield-star-linear', color: 'text-[#9ca3af]', min: 0, max: 100 };
    }
    triggerAchievement(id) {
        if (this.achievements.includes(id))
            return;
        this.achievements.push(id);
        this.saveState();
        const ach = ACHIEVEMENTS_DEF[id];
        if (ach) {
            showToast('Conquista Desbloqueada', ach.name, ach.icon);
        }
        if (this.getLevelInfo().name === 'Lenda da Cozinha' && !this.achievements.includes('living_legend')) {
            this.triggerAchievement('living_legend');
        }
    }
}
export const AppState = new State();
