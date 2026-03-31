document.addEventListener('DOMContentLoaded', () => {
    fetchOrders();
});

let userCache = {};
let lastOrdersSnapshot = null;

/**
 * Fetch initial data from Firestore
 */
function fetchOrders() {
    const tbody = document.getElementById('ordersBody');
    if (!tbody) return;

    db.collection("users").onSnapshot((userSnapshot) => {
        userSnapshot.forEach(doc => {
            userCache[doc.id] = doc.data();
        });
        if (lastOrdersSnapshot) renderOrdersTable();
    });

    db.collection("orders").orderBy("pendingTimestamp", "desc").onSnapshot((snapshot) => {
        lastOrdersSnapshot = snapshot;
        renderOrdersTable();
    });
}

/**
 * Main function to render the orders table
 */
function renderOrdersTable() {
    const tbody = document.getElementById('ordersBody');
    if (!tbody || !lastOrdersSnapshot) return;

    tbody.innerHTML = "";
    let counts = { all: 0, pending: 0, approved: 0, rejected: 0, delivered: 0 };

    if (lastOrdersSnapshot.empty) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:40px;">No orders found.</td></tr>';
        updateOrderStats(counts);
        return;
    }

    const rowsHTML = lastOrdersSnapshot.docs.map(doc => {
        const order = doc.data();
        const dbStatus = order.status || "Pending";

        // Statistics Counting
        counts.all++;
        if (dbStatus === "Payment Completed" || dbStatus === "Pending") counts.pending++;
        else if (dbStatus === "Approved" || dbStatus === "Accepted") counts.approved++;
        else if (dbStatus === "Delivered" || dbStatus === "Received") counts.delivered++;
        else if (dbStatus === "Rejected") counts.rejected++;

        const date = order.pendingTimestamp ? order.pendingTimestamp.toDate().toLocaleString() : (order.date || "N/A");
        const statusClass = getStatusClass(dbStatus);
        const userData = userCache[order.userId];
        const userName = userData ? userData.name : "Unknown Patient";
        const profileImg = (userData && userData.profileImageUrl) ? userData.profileImageUrl : "assets/img/avatars/1.png";
        const orderNote = (order.notes && order.notes.trim() !== "") ? order.notes : "No special instructions.";

        // Google Maps URL
        const mapUrl = (order.latitude && order.longitude)
            ? `https://www.google.com/maps/search/?api=1&query=${order.latitude},${order.longitude}`
            : "#";

        return `
            <tr class="order-row">
                <td><input type="checkbox" class="order-check" onclick="event.stopPropagation()"></td>
                
                <td><div class="order-id-cell">${order.orderId || doc.id}</div></td>
                
                <td>
                    <div class="user-cell">
                        <img src="${profileImg}" class="user-mini-avatar" onerror="this.src='assets/img/avatars/1.png'">
                        <div>
                            <div style="font-size:13.5px;font-weight:600;">${userName}</div>
                            <div style="font-size:11.5px;color:#94a3b8;">${userData ? userData.email : ''}</div>
                        </div>
                    </div>
                </td>
                
                <td style="font-size:13px;">Prescription Order</td>
                <td style="font-size:13px;">${date}</td>
                
                <td style="font-size:12.5px;">
                   <div title="${order.address || 'N/A'}" style="max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                        ${order.address || "N/A"}
                   </div>
                   <a href="${mapUrl}" target="_blank" style="color:#0d9488; font-size: 11px; font-weight:700; text-decoration:none;">
                        <i class="fas fa-map-marker-alt"></i> View Map
                   </a>
                </td>
                
                <td><div style="font-size:12px; color:#64748b;">${orderNote}</div></td>
                
                <td>
                    <span class="order-status-badge ${statusClass}">
                        <span class="status-dot"></span>${dbStatus}
                    </span>
                </td>
                
                <td style="text-align:center;">
                    <button class="btn-action btn-view" onclick="openOrderDetails('${doc.id}')" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = rowsHTML.join("");
    updateOrderStats(counts);
}

/**
 * Open the Slide-over Panel with full order details
 */
async function openOrderDetails(orderId) {
    const doc = await db.collection("orders").doc(orderId).get();
    if (!doc.exists) return;
    const data = doc.data();
    const currentStatus = data.status || "Pending";

    let userData = { name: "User", email: "N/A", profileImageUrl: "", mobile: "N/A" };
    if (data.userId) {
        const userDoc = await db.collection("users").doc(data.userId).get();
        if (userDoc.exists) userData = userDoc.data();
    }

    let statusOptionsHTML = "";
    let isDropdownDisabled = false;
    let infoMessage = "";
    let priceInputHTML = "";

    if (currentStatus === "Pending") {

        priceInputHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 10px; margin-bottom: 20px;">
            <div>
                <div class="detail-section-title">Prescription Price (LKR)</div>
                <div style="position: relative;">
                    <span style="position: absolute; left: 15px; top: 50%; transform: translateY(-50%); font-weight: 700; color: #64748b;">Rs.</span>
                    <input type="number" id="orderTotalPrice" placeholder="0.00" 
                        style="width: 100%; height: 50px; padding-left: 45px; border-radius: 12px; border: 2px solid #0d9488; font-size: 16px; font-weight: 700; color: #1e293b; outline: none;">
                </div>
            </div>
            <div>
                <div class="detail-section-title">Delivery Fee (LKR)</div>
                <div style="position: relative;">
                    <span style="position: absolute; left: 15px; top: 50%; transform: translateY(-50%); font-weight: 700; color: #64748b;">Rs.</span>
                    <input type="number" id="deliveryFeePrice" placeholder="0.00" 
                        style="width: 100%; height: 50px; padding-left: 45px; border-radius: 12px; border: 2px solid #f59e0b; font-size: 16px; font-weight: 700; color: #1e293b; outline: none;">
                </div>
            </div>
        </div>
    `;
        statusOptionsHTML = `
            <option value="Pending" selected disabled>Pending Review</option>
            <option value="Approved">Approve Order</option>
            <option value="Rejected">Reject Order</option>
        `;
    } else if (currentStatus === "Approved") {
        statusOptionsHTML = `<option selected disabled>⌛ Waiting for Patient Payment</option>`;
        isDropdownDisabled = true;
        infoMessage = "The order is approved. Waiting for the patient to complete the payment via the app.";

    } else if (currentStatus === "Payment Done" || currentStatus === "Payment Completed") {

        statusOptionsHTML = `
            <option value="${currentStatus}" selected disabled>💳 Payment Received</option>
            <option value="Accepted">✅ Accept & Prepare Order</option>
        `;
        infoMessage = "Payment verified! Please accept the order to start pharmaceutical preparation.";

    } else if (currentStatus === "Accepted") {
        statusOptionsHTML = `
            <option value="Accepted" selected disabled>📦 Order Accepted</option>
            <option value="Delivered">🚚 Mark as Delivered</option>
        `;
        infoMessage = "The order is being prepared. Mark as delivered once it is handed over to the patient.";

    } else if (currentStatus === "Delivered" || currentStatus === "Received") {
        statusOptionsHTML = `<option selected disabled>🏁 Order Successfully Received</option>`;
        isDropdownDisabled = true;
        infoMessage = "Patient has confirmed the receipt of this order. Process complete.";

    } else if (currentStatus === "Rejected") {
        statusOptionsHTML = `<option selected disabled>❌ Order Rejected</option>`;
        isDropdownDisabled = true;
    }

    // Modal Header Update
    document.getElementById('panelOrderId').textContent = "Order #" + (data.orderId || orderId);
    const orderDate = data.pendingTimestamp ? data.pendingTimestamp.toDate().toLocaleString() : data.date;
    document.getElementById('panelOrderDate').textContent = "Date: " + orderDate;

    // Modal Body Construction
    document.getElementById('modalBodyContent').innerHTML = `
    <div class="rx-image-container" onclick="openLightbox('${data.prescriptionUrl}')" style="background: #000; text-align: center; border-bottom: 1px solid #e2e8f0; cursor: zoom-in;">
        <img src="${data.prescriptionUrl}" alt="Prescription" style="max-height: 400px; max-width: 100%; object-fit: contain;">
    </div>
    
    <div style="padding: 28px;">
        <div class="detail-section-title">Patient Contact Information</div>
        <div style="display:flex; align-items:center; gap:15px; padding:16px; background:#f8fafc; border: 1px solid #e2e8f0; border-radius:14px; margin-bottom:24px;">
            <img src="${userData.profileImageUrl || 'assets/img/avatars/1.png'}" style="width:56px; height:56px; border-radius:12px; object-fit:cover; border: 2px solid #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.05);" onerror="this.src='assets/img/avatars/1.png'">
            <div>
                <div style="font-weight:700; font-size:15px; color: #1e293b;">${userData.name}</div>
                <div style="font-size:13px; color:#64748b; margin-top: 2px;">
                    <i class="far fa-envelope" style="width: 16px;"></i> ${userData.email}
                </div>
                <div style="font-size:13px; color:#0d9488; font-weight:600; margin-top: 2px;">
                    <i class="fas fa-phone-alt" style="width: 16px;"></i> ${userData.mobile || 'No Phone Number'}
                </div>
            </div>
        </div>

        ${priceInputHTML}

        <div class="detail-section-title">Manage Order Progress</div>
        <div class="status-dropdown-container" style="position: relative;">
            <select class="custom-select" id="statusDropdown" 
                onchange="updateStatus('${doc.id}', this.value)" 
                ${isDropdownDisabled ? 'disabled' : ''}>
                ${statusOptionsHTML}
            </select>
            <i class="fas fa-chevron-down dropdown-icon" style="position: absolute; right: 18px; top: 50%; transform: translateY(-50%); color: #64748b; pointer-events: none;"></i>
        </div>

        ${infoMessage ? `
            <div style="margin-top: 15px; padding: 12px 16px; background: #fffbeb; border-radius: 12px; border-left: 5px solid #f59e0b; display: flex; align-items: start; gap: 12px;">
                <i class="fas fa-info-circle" style="color: #d97706; margin-top: 3px; font-size: 16px;"></i>
                <span style="color:#92400e; font-size:13px; font-weight: 500; line-height: 1.4;">${infoMessage}</span>
            </div>
        ` : ''}
    </div>
`;

    // Activate Modal
    document.getElementById('orderDetailModal').classList.add('active');
}

/**
 * Update Order Status and its corresponding timestamp in Firestore
 */
function updateStatus(orderId, newStatus) {
    if (!newStatus) return;

    const orderData = lastOrdersSnapshot.docs.find(d => d.id === orderId).data();
    const userId = orderData.userId;
    let total = "0.00";
    let deliveryFee = "0.00";


    if (newStatus === "Approved") {
        total = document.getElementById('orderTotalPrice').value;
        deliveryFee = document.getElementById('deliveryFeePrice').value;

        if (!total || total <= 0) {
            Swal.fire('Error', 'Please enter a valid prescription price.', 'error');
            document.getElementById('statusDropdown').value = "Pending";
            return;
        }

        if (!deliveryFee || deliveryFee < 0) deliveryFee = "0.00";
    }

    // Servlet POST Request
    fetch('updateOrderStatus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `orderId=${orderId}&status=${newStatus}&userId=${userId}&total=${total}&deliveryFee=${deliveryFee}`
    })
        .then(response => {
            if (response.ok) {
                Swal.fire({
                    title: 'Success!',
                    text: 'Order updated with delivery fee!',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false,
                    target: document.getElementById('orderDetailModal')
                });
                closeOrderModal();
            }
        })
        .catch(err => console.error("Error:", err));
}

/**
 * Helper to determine CSS class based on status
 */
function getStatusClass(status) {
    const s = (status || "").toLowerCase();
    if (s.includes('pending') || s.includes('payment')) return 'status-pending';
    if (s === 'approved' || s === 'accepted') return 'status-approved';
    if (s === 'delivered' || s === 'received') return 'status-delivered';
    if (s === 'rejected') return 'status-rejected';
    return 'status-pending';
}

/**
 * Update the UI statistics cards and filter badges
 */
function updateOrderStats(counts) {
    const ids = ['statTotal', 'statPending', 'statApproved', 'statDelivered', 'tabAll', 'tabPending', 'tabApproved', 'tabDelivered'];
    const values = [counts.all, counts.pending, counts.approved, counts.delivered, counts.all, counts.pending, counts.approved, counts.delivered];
    ids.forEach((id, i) => { if (document.getElementById(id)) document.getElementById(id).textContent = values[i]; });
}

function openLightbox(url) {
    document.getElementById('lbImage').src = url;
    document.getElementById('lightboxOverlay').classList.add('active');
}

function closeLightbox() { document.getElementById('lightboxOverlay').classList.remove('active'); }

function closeOrderModal() {
    document.getElementById('orderDetailModal').classList.remove('active');
}