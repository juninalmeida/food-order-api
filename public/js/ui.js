export function showToast(title, desc, iconName) {
    const container = document.getElementById('toast-container');
    if (!container)
        return;
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
        if (container.contains(toast))
            toast.remove();
    }, 4000);
}
