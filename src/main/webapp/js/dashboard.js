import { db } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    loadDashboardStats();
    loadLowStockAlerts();
    loadRecentMedicines();
});


function loadDashboardStats() {

    db.collection("medicines").onSnapshot(snapshot => {
        animateCount('totalMeds', snapshot.size);

        let lowStockCount = 0;
        let expiringCount = 0;
        const today = new Date();
        const nextMonth = new Date();
        nextMonth.setDate(today.getDate() + 30);

        snapshot.forEach(doc => {
            const data = doc.data();

            if (data.stock <= 20) lowStockCount++;


            if (data.expiryDate) {
                const expDate = new Date(data.expiryDate);
                if (expDate >= today && expDate <= nextMonth) expiringCount++;
            }
        });
        animateCount('lowStockAlerts', lowStockCount);
        animateCount('expiringMeds', expiringCount);
    });


    db.collection("users").onSnapshot(snapshot => {
        animateCount('totalUsers', snapshot.size);
    });


    db.collection("orders").where("status", "==", "Pending").onSnapshot(snapshot => {
        const orderBadge = document.querySelector('a[href="orders.html"] .badge-count');
        if (orderBadge) orderBadge.innerText = snapshot.size;
    });
}


function loadLowStockAlerts() {
    const alertList = document.querySelector('.alert-list');
    if (!alertList) return;

    db.collection("medicines")
        .where("stock", "<=", 20)
        .limit(4)
        .onSnapshot(snapshot => {
            alertList.innerHTML = "";
            snapshot.forEach(doc => {
                const med = doc.data();
                const isOut = med.stock <= 0;

                const alertHTML = `
                    <div class="alert-item">
                        <div class="alert-icon ${isOut ? 'danger' : 'warning'}"><i class="fas fa-pills"></i></div>
                        <div class="alert-info">
                            <div class="alert-med-name">${med.name}</div>
                            <div class="alert-detail">${med.stock} units remaining</div>
                        </div>
                        <span class="alert-tag ${isOut ? 'danger' : 'warning'}">${isOut ? 'Out of Stock' : 'Low'}</span>
                    </div>
                `;
                alertList.insertAdjacentHTML('beforeend', alertHTML);
            });
        });
}


function loadRecentMedicines() {
    const tbody = document.querySelector('#recentMedsTable tbody');
    if (!tbody) return;

    db.collection("medicines")
        .orderBy("lastUpdated", "desc")
        .limit(5)
        .onSnapshot(snapshot => {
            tbody.innerHTML = "";
            snapshot.forEach((doc, index) => {
                const med = doc.data();
                const stockPercent = Math.min((med.stock / 500) * 100, 100);
                const status = getStockStatus(med.stock);

                const row = `
                    <tr>
                        <td style="color:#94a3b8;">00${index + 1}</td>
                        <td>
                            <div class="med-name">${med.name}</div>
                            <div style="font-size:11.5px;color:#94a3b8;">Batch: ${med.batchId || 'N/A'}</div>
                        </td>
                        <td><span class="med-category cat-antibiotic">${med.category}</span></td>
                        <td>
                            <div style="display:flex;align-items:center;gap:8px;">
                                <div class="progress-bar-track" style="width:80px;">
                                    <div class="progress-bar-fill" style="width:${stockPercent}%; background:${status.color};"></div>
                                </div>
                                <span style="font-size:12px;font-weight:600;color:${status.color};">${med.stock}</span>
                            </div>
                        </td>
                        <td style="font-size:13px;">${med.expiryDate || 'N/A'}</td>
                        <td><span class="stock-badge ${status.class}"><span class="stock-dot"></span>${status.label}</span></td>
                        <td>
                            <div style="display:flex;gap:6px;">
                                <button class="btn-action btn-edit" onclick="editMed('${doc.id}')"><i class="fas fa-pen"></i></button>
                                <button class="btn-action btn-delete" onclick="deleteMed('${doc.id}', '${med.name}')"><i class="fas fa-trash"></i></button>
                            </div>
                        </td>
                    </tr>
                `;
                tbody.insertAdjacentHTML('beforeend', row);
            });
        });
}


function getStockStatus(qty) {
    if (qty <= 0) return { label: 'Out of Stock', class: 'stock-low', color: '#ef4444' };
    if (qty <= 20) return { label: 'Critical', class: 'stock-low', color: '#ef4444' };
    if (qty <= 50) return { label: 'Low', class: 'stock-medium', color: '#f59e0b' };
    return { label: 'In Stock', class: 'stock-high', color: '#10b981' };
}

function animateCount(id, target) {
    const el = document.getElementById(id);
    if (!el) return;
    let current = 0;
    const increment = target / 30;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            el.innerText = Math.floor(target);
            clearInterval(timer);
        } else {
            el.innerText = Math.floor(current);
        }
    }, 40);
}import { db } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    loadDashboardStats();
    loadLowStockAlerts();
    loadRecentMedicines();
});

function loadDashboardStats() {

    db.collection("medicines").onSnapshot(snapshot => {
        animateCount('totalMeds', snapshot.size);

        let lowStockCount = 0;
        let expiringCount = 0;
        const today = new Date();
        const nextMonth = new Date();
        nextMonth.setDate(today.getDate() + 30);

        snapshot.forEach(doc => {
            const data = doc.data();

            if (data.stock <= 20) lowStockCount++;


            if (data.expiryDate) {
                const expDate = new Date(data.expiryDate);
                if (expDate >= today && expDate <= nextMonth) expiringCount++;
            }
        });
        animateCount('lowStockAlerts', lowStockCount);
        animateCount('expiringMeds', expiringCount);
    });


    db.collection("users").onSnapshot(snapshot => {
        animateCount('totalUsers', snapshot.size);
    });


    db.collection("orders").where("status", "==", "Pending").onSnapshot(snapshot => {
        const orderBadge = document.querySelector('a[href="orders.html"] .badge-count');
        if (orderBadge) orderBadge.innerText = snapshot.size;
    });
}


function loadLowStockAlerts() {
    const alertList = document.querySelector('.alert-list');
    if (!alertList) return;

    db.collection("medicines")
        .where("stock", "<=", 20)
        .limit(4)
        .onSnapshot(snapshot => {
            alertList.innerHTML = "";
            snapshot.forEach(doc => {
                const med = doc.data();
                const isOut = med.stock <= 0;

                const alertHTML = `
                    <div class="alert-item">
                        <div class="alert-icon ${isOut ? 'danger' : 'warning'}"><i class="fas fa-pills"></i></div>
                        <div class="alert-info">
                            <div class="alert-med-name">${med.name}</div>
                            <div class="alert-detail">${med.stock} units remaining</div>
                        </div>
                        <span class="alert-tag ${isOut ? 'danger' : 'warning'}">${isOut ? 'Out of Stock' : 'Low'}</span>
                    </div>
                `;
                alertList.insertAdjacentHTML('beforeend', alertHTML);
            });
        });
}


function loadRecentMedicines() {
    const tbody = document.querySelector('#recentMedsTable tbody');
    if (!tbody) return;

    db.collection("medicines")
        .orderBy("lastUpdated", "desc")
        .limit(5)
        .onSnapshot(snapshot => {
            tbody.innerHTML = "";
            snapshot.forEach((doc, index) => {
                const med = doc.data();
                const stockPercent = Math.min((med.stock / 500) * 100, 100);
                const status = getStockStatus(med.stock);

                const row = `
                    <tr>
                        <td style="color:#94a3b8;">00${index + 1}</td>
                        <td>
                            <div class="med-name">${med.name}</div>
                            <div style="font-size:11.5px;color:#94a3b8;">Batch: ${med.batchId || 'N/A'}</div>
                        </td>
                        <td><span class="med-category cat-antibiotic">${med.category}</span></td>
                        <td>
                            <div style="display:flex;align-items:center;gap:8px;">
                                <div class="progress-bar-track" style="width:80px;">
                                    <div class="progress-bar-fill" style="width:${stockPercent}%; background:${status.color};"></div>
                                </div>
                                <span style="font-size:12px;font-weight:600;color:${status.color};">${med.stock}</span>
                            </div>
                        </td>
                        <td style="font-size:13px;">${med.expiryDate || 'N/A'}</td>
                        <td><span class="stock-badge ${status.class}"><span class="stock-dot"></span>${status.label}</span></td>
                        <td>
                            <div style="display:flex;gap:6px;">
                                <button class="btn-action btn-edit" onclick="editMed('${doc.id}')"><i class="fas fa-pen"></i></button>
                                <button class="btn-action btn-delete" onclick="deleteMed('${doc.id}', '${med.name}')"><i class="fas fa-trash"></i></button>
                            </div>
                        </td>
                    </tr>
                `;
                tbody.insertAdjacentHTML('beforeend', row);
            });
        });
}



function getStockStatus(qty) {
    if (qty <= 0) return { label: 'Out of Stock', class: 'stock-low', color: '#ef4444' };
    if (qty <= 20) return { label: 'Critical', class: 'stock-low', color: '#ef4444' };
    if (qty <= 50) return { label: 'Low', class: 'stock-medium', color: '#f59e0b' };
    return { label: 'In Stock', class: 'stock-high', color: '#10b981' };
}

function animateCount(id, target) {
    const el = document.getElementById(id);
    if (!el) return;
    let current = 0;
    const increment = target / 30;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            el.innerText = Math.floor(target);
            clearInterval(timer);
        } else {
            el.innerText = Math.floor(current);
        }
    }, 40);
}