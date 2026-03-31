// Global variables
let IMGBB_API_KEY = ""; // Put your ImgBB key here
let currentEditId = null;
let categoryMap = {};

document.addEventListener('DOMContentLoaded', async () => {
    await loadConfig();       // Step 0: Load API Key from JSON
    fetchCategories();    // Step 1: Load categories to dropdown
    fetchMedicines();
});

async function loadConfig() {
    try {
        const response = await fetch('assets/private-key.json');
        const config = await response.json();
        IMGBB_API_KEY = config.imgbb_api_key;
        console.log("Config loaded successfully.");
    } catch (error) {
        console.error("Error loading config:", error);
        Swal.fire('Configuration Error', 'Could not load API keys.', 'error');
    }
}

/**
 * Fetch categories from Firestore and populate the dropdowns
 * Loads for both newMedCat and editMedCat
 */
function fetchCategories() {
    const addSelect = document.getElementById('newMedCat');
    const editSelect = document.getElementById('editMedCat');

    db.collection("categories").orderBy("name", "asc").onSnapshot((snapshot) => {
        let options = '<option value="">Select category</option>';
        categoryMap = {}; // Reset map

        snapshot.forEach((doc) => {
            const category = doc.data();
            categoryMap[doc.id] = category.name;
            options += `<option value="${doc.id}">${category.name}</option>`;
        });

        if (addSelect) addSelect.innerHTML = options;
        if (editSelect) editSelect.innerHTML = options;
    });
}

/**
 * Handle Image Preview
 */
function previewImage(event) {
    if (event.target.files && event.target.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const output = document.getElementById('imagePreview');
            const icon = document.getElementById('previewIcon');
            output.src = e.target.result;
            output.style.display = 'block';
            icon.style.display = 'none';
        };
        reader.readAsDataURL(event.target.files[0]);
    }
}

/**
 * Add New Medicine to Firestore
 * Matches your Firestore fields: categoryId, description, id, imageUrl, name, price, stock, timestamp
 */
async function addMedicine() {
    const name = document.getElementById('newMedName').value.trim();
    const catId = document.getElementById('newMedCat').value;
    const price = document.getElementById('newMedPrice').value;
    const stock = document.getElementById('newMedStock').value;
    const expiry = document.getElementById('newMedExpiry').value;
    const batch = document.getElementById('newMedBatch').value.trim();
    const imageFile = document.getElementById('newMedImage').files[0];


    if (!name || !catId || !price || !stock || !expiry || !batch || !imageFile) {
        Swal.fire('Required!', 'Please fill all required fields and select an image.', 'warning');
        return;
    }

    // Loading Popup
    Swal.fire({
        title: 'Saving...',
        text: 'Uploading image and saving data...',
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading(); }
    });

    try {
        // ImgBB Upload
        const formData = new FormData();
        formData.append("image", imageFile);

        const imgRes = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
            method: "POST",
            body: formData
        });
        const imgData = await imgRes.json();

        if (imgData.success) {
            const imageUrl = imgData.data.url;

            // Firestore 'products' collection
            const docRef = db.collection("products").doc(); // New ID

            await docRef.set({
                id: docRef.id,
                name: name,
                categoryId: catId,
                price: price,
                stock: parseInt(stock),
                expiryDate: expiry,
                batchNumber: batch,
                status: "In Stock",
                imageUrl: imageUrl,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });


            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Medicine added successfully!',
                timer: 1500
            });

            closeModal('addMedicineModal');


            const fieldsToClear = ['newMedName', 'newMedCat', 'newMedPrice', 'newMedStock', 'newMedExpiry', 'newMedBatch', 'newMedImage'];
            fieldsToClear.forEach(id => {
                const el = document.getElementById(id);
                if(el) el.value = (id === 'newMedCat') ? "" : "";
            });
            document.getElementById('imagePreview').style.display = 'none';
            document.getElementById('previewIcon').style.display = 'block';

        } else {
            throw new Error("Image upload failed");
        }
    } catch (error) {
        console.error("Error adding medicine: ", error);
        Swal.fire('Error', 'Failed to save data. Please check your internet.', 'error');
    }
}

/**
 * Fetch and Display Medicines in Table (Real-time)
 */
function fetchMedicines() {
    const tbody = document.getElementById('medsBody');
    if (!tbody) return;

    db.collection("products").orderBy("timestamp", "desc").onSnapshot((snapshot) => {

        let rowsHTML = "";

        if (snapshot.empty) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:40px;">No medicines in inventory.</td></tr>';
            updateStats(0, 0, 0, 0, 0);
            return;
        }

        let total = 0, inStock = 0, lowStock = 0, outOfStock = 0, expiringSoon = 0;
        const today = new Date();
        const nextMonth = new Date();
        nextMonth.setDate(today.getDate() + 30);


        snapshot.forEach((doc) => {
            const med = doc.data();
            total++;

            // 1. Stats Calculation
            const dbStatus = med.status || "In Stock";
            if (dbStatus === "In Stock") inStock++;
            else if (dbStatus === "Low Stock") lowStock++;
            else if (dbStatus === "Out of Stock") outOfStock++;

            if (med.expiryDate) {
                const expDate = new Date(med.expiryDate);
                if (expDate > today && expDate <= nextMonth) expiringSoon++;
            }

            // 2. CSS Class selection
            let statusClass = "stock-high";
            if (dbStatus === "Out of Stock") statusClass = "stock-low";
            else if (dbStatus === "Low Stock") statusClass = "stock-medium";

            // 3. UI Values
            const categoryName = categoryMap[med.categoryId] || med.categoryId || 'Other';
            const expiryDisplay = med.expiryDate || "N/A";
            const priceDisplay = med.price || "0.00";
            const stockDisplay = (med.stock !== undefined) ? med.stock : "0";

            //
            rowsHTML += `
                <tr>
                    <td><input type="checkbox" class="row-check"></td>
                    <td>
                        <div style="display:flex; align-items:center; gap:10px;">
                            <img src="${med.imageUrl}" style="width:40px; height:40px; border-radius:8px; object-fit:cover; border: 1px solid #e2e8f0;" onerror="this.src='https://via.placeholder.com/40'">
                            <div>
                                <div class="med-name" style="font-weight:600;">${med.name}</div>
                                <div style="font-size:11px;color:#94a3b8;">
                                    ID: ${med.id ? med.id.substring(0, 8) : doc.id.substring(0, 8)} | 
                                    Batch: ${med.batchNumber || 'N/A'}
                                </div>
                            </div>
                        </div>
                    </td>
                    <td><span class="med-category cat-other">${categoryName}</span></td>
                    <td style="font-size:14px; font-weight:700; color:#0d9488;">$${priceDisplay}</td>
                    <td><div style="font-weight:600;">${stockDisplay} units</div></td>
                    <td style="font-size:13px; color:#64748b;">${expiryDisplay}</td>
                    <td><span class="stock-badge ${statusClass}"><span class="stock-dot"></span>${dbStatus}</span></td>
                    <td>
                        <div style="display:flex; gap:8px; justify-content:center;">
                            <button class="btn-action btn-edit" onclick="editMed('${doc.id}')"><i class="fas fa-pen"></i></button>  
                        </div>
                    </td>
                </tr>`;
        });


        tbody.innerHTML = rowsHTML;

        // Stats Update
        updateStats(total, inStock, lowStock, outOfStock, expiringSoon);
    });
}

function updateStats(total, inStock, lowStock, outOfStock, expiringSoon) {
    if(document.getElementById('stat-total')) document.getElementById('stat-total').textContent = total;
    if(document.getElementById('stat-instock')) document.getElementById('stat-instock').textContent = inStock;
    if(document.getElementById('stat-lowstock')) document.getElementById('stat-lowstock').textContent = lowStock;
    if(document.getElementById('stat-outofstock')) document.getElementById('stat-outofstock').textContent = outOfStock;
    if(document.getElementById('stat-expiring')) document.getElementById('stat-expiring').textContent = expiringSoon;
}


    /**
     * Open Edit Modal and load data
     */
    function editMed(id) {
        currentEditId = id;

        db.collection("products").doc(id).get().then((doc) => {
            if (doc.exists) {
                const data = doc.data();
                document.getElementById('editMedName').value = data.name || "";
                document.getElementById('editMedCat').value = data.categoryId || "";
                document.getElementById('editMedPrice').value = data.price || "";
                document.getElementById('editMedStock').value = data.stock || 0;
                document.getElementById('editMedExpiry').value = data.expiryDate || "";
                document.getElementById('editMedStatus').value = data.status || "In Stock";

                openModal('editMedicineModal');
            }
        }).catch((error) => console.error("Error loading for edit:", error));
    }

    async function saveEdit() {

        if (!currentEditId) {
            console.error("No medicine ID selected for update.");
            return;
        }

        const name = document.getElementById('editMedName').value.trim();
        const catId = document.getElementById('editMedCat').value;
        const price = document.getElementById('editMedPrice').value;
        const stock = document.getElementById('editMedStock').value;
        const expiry = document.getElementById('editMedExpiry').value;
        const status = document.getElementById('editMedStatus').value;


        if (!name || !catId || !price || !stock || !expiry) {
            Swal.fire('Error', 'Please fill all required fields.', 'error');
            return;
        }


        Swal.fire({
            title: 'Updating...',
            text: 'Please wait while we save the changes.',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            // Firestore update
            await db.collection("products").doc(currentEditId).update({
                name: name,
                categoryId: catId,
                price: price,
                stock: parseInt(stock),
                expiryDate: expiry,
                status: status
            });

            Swal.fire({
                icon: 'success',
                title: 'Updated!',
                text: 'Medicine details saved successfully.',
                timer: 1500,
                showConfirmButton: false
            });


            closeModal('editMedicineModal');

        } catch (error) {
            console.error("Error updating medicine:", error);
            Swal.fire('Error', 'Something went wrong while updating.', 'error');
        }
    }

    /**
     * Delete Medicine
     */
    function deleteMed(id, name) {
        Swal.fire({
            title: 'Delete Medicine?',
            text: `Are you sure you want to remove ${name}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Yes, Delete'
        }).then((result) => {
            if (result.isConfirmed) {
                db.collection("products").doc(id).delete();
            }
        });
    }