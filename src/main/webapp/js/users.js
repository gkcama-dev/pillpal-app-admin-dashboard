document.addEventListener('DOMContentLoaded', () => {
    fetchUsers();
});

function fetchUsers() {
    const tbody = document.getElementById('usersBody');
    if (!tbody) return;

    db.collection("users").onSnapshot((snapshot) => {
        let rowsHTML = "";

        if (snapshot.empty) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:40px;">No users found.</td></tr>';
            updateUserStats(0, 0);
            return;
        }

        let totalUsers = 0;
        let activeUsers = 0;

        snapshot.forEach((doc) => {
            const user = doc.data();
            totalUsers++;

            const status = user.status || "active";
            if (status === "active") activeUsers++;


            const defaultImg = "assets/img/avatars/1.png";

            const profileImageSource = (user.profileImageUrl && user.profileImageUrl.trim() !== "")
                ? user.profileImageUrl
                : defaultImg;

            rowsHTML += `
                <tr>
                    <td><input type="checkbox" class="row-check"></td>
                    <td>
                        <div style="display:flex; align-items:center; gap:10px;">
                            <img src="${profileImageSource}" 
                                 style="width:35px; height:35px; border-radius:50%; object-fit:cover;"
                                 onerror="this.src='${defaultImg}'"> 
                            <div>
                                <div style="font-weight:600;">${user.name || 'Unknown User'}</div>
                                <div style="font-size:11px; color:#94a3b8;">NIC: ${user.nic || 'N/A'}</div>
                            </div>
                        </div>
                    </td>
                    <td style="font-size:13px; color:#64748b;">${user.address || 'N/A'}</td>
                    <td style="font-size:13px;">
                        <div>${user.email || 'N/A'}</div>
                        <div style="font-size:11px; color:#94a3b8;">${user.mobile || 'N/A'}</div>
                    </td>   
                </tr>
            `;
        });

        tbody.innerHTML = rowsHTML;
        updateUserStats(totalUsers, activeUsers);
    });
}

function updateUserStats(total, active) {
    const totalEl = document.querySelector('.stat-card.blue .stat-value');
    const activeEl = document.querySelector('.stat-card.teal .stat-value');
    if (totalEl) totalEl.textContent = total;
    if (activeEl) activeEl.textContent = active;
}

function deleteUser(id, name) {
    Swal.fire({
        title: 'Are you sure?',
        text: `Do you want to delete user ${name}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'Yes, Delete'
    }).then((result) => {
        if (result.isConfirmed) {
            db.collection("users").doc(id).delete().then(() => {
                Swal.fire({
                    title: 'Deleted!',
                    text: 'User has been removed.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
            });
        }
    });
}