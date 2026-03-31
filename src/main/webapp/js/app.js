// PillPal — Shared Application JavaScript

// ==================== SIDEBAR TOGGLE ====================
function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const menuToggle = document.getElementById('menuToggle');

    if (!sidebar) return;

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            overlay.classList.toggle('active');
        });
    }

    if (overlay) {
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
        });
    }
}

// ==================== NOTIFICATION DROPDOWN ====================
function initNotifications() {
    const notifBtn = document.getElementById('notifBtn');
    const notifDropdown = document.getElementById('notifDropdown');

    if (!notifBtn || !notifDropdown) return;

    notifBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        notifDropdown.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
        if (!notifDropdown.contains(e.target)) {
            notifDropdown.classList.remove('show');
        }
    });
}

// ==================== MODAL HELPERS ====================
function openModal(id) {
    const overlay = document.getElementById(id);
    if (overlay) {
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(id) {
    const overlay = document.getElementById(id);
    if (overlay) {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Close modal on overlay click
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// ==================== TOGGLE SWITCHES ====================
function initToggles() {
    document.querySelectorAll('.toggle-switch').forEach(toggle => {
        toggle.addEventListener('click', () => {
            toggle.classList.toggle('on');
        });
    });
}

// ==================== DATA TABLE SEARCH ====================
function initTableSearch(inputId, tableId) {
    const input = document.getElementById(inputId);
    const table = document.getElementById(tableId);
    if (!input || !table) return;

    input.addEventListener('input', () => {
        const val = input.value.toLowerCase();
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(val) ? '' : 'none';
        });
        updateVisibleCount(table);
    });
}

function updateVisibleCount(table) {
    const info = document.getElementById('paginationInfo');
    if (!info) return;
    const visible = table.querySelectorAll('tbody tr:not([style*="none"])').length;
    const total = table.querySelectorAll('tbody tr').length;
    info.textContent = `Showing ${visible} of ${total} entries`;
}

// ==================== CATEGORY FILTER ====================
function filterByCategory(value, tableId) {
    const table = document.getElementById(tableId);
    if (!table) return;
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
        const cat = row.getAttribute('data-category') || '';
        row.style.display = (!value || cat === value) ? '' : 'none';
    });
}

// ==================== TOAST NOTIFICATIONS ====================
function showToast(message, type = 'success') {
    const colors = {
        success: { bg: '#dcfce7', border: '#86efac', text: '#166534', icon: 'fa-check-circle' },
        error: { bg: '#fee2e2', border: '#fca5a5', text: '#991b1b', icon: 'fa-times-circle' },
        warning: { bg: '#fef9c3', border: '#fde047', text: '#92400e', icon: 'fa-exclamation-circle' },
        info: { bg: '#dbeafe', border: '#93c5fd', text: '#1e40af', icon: 'fa-info-circle' },
    };
    const c = colors[type] || colors.success;

    const toast = document.createElement('div');
    toast.style.cssText = `
    position: fixed; bottom: 24px; right: 24px; z-index: 9999;
    display: flex; align-items: center; gap: 10px;
    background: ${c.bg}; border: 1px solid ${c.border}; color: ${c.text};
    padding: 12px 18px; border-radius: 12px;
    font-size: 13.5px; font-weight: 500; font-family: 'Inter', sans-serif;
    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    transform: translateY(20px); opacity: 0;
    transition: all 0.3s ease;
  `;
    toast.innerHTML = `<i class="fas ${c.icon}"></i> ${message}`;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.style.transform = 'translateY(0)';
        toast.style.opacity = '1';
    });

    setTimeout(() => {
        toast.style.transform = 'translateY(20px)';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ==================== CONFIRM DELETE ====================
function confirmDelete(itemName, onConfirm) {
    const overlay = document.getElementById('deleteConfirmModal');
    if (!overlay) {
        if (confirm(`Are you sure you want to delete "${itemName}"?`)) {
            onConfirm();
        }
        return;
    }
    document.getElementById('deleteItemName').textContent = itemName;
    openModal('deleteConfirmModal');
    document.getElementById('confirmDeleteBtn').onclick = () => {
        onConfirm();
        closeModal('deleteConfirmModal');
        showToast(`"${itemName}" deleted successfully.`, 'success');
    };
}

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', () => {
    initSidebar();
    initNotifications();
    initToggles();
});