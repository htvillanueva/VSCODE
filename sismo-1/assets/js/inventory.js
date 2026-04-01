import { getApps, initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getFirestore, collection, onSnapshot, 
    addDoc, updateDoc, deleteDoc, doc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 1. CAR-XPERT FIREBASE CONFIG
const firebaseConfig = {
    apiKey: "AIzaSyD81sF9ClxA_HKRaEkmCSyHXXRCHR1efkk",
    authDomain: "car-xpert-76d1b.firebaseapp.com",
    projectId: "car-xpert-76d1b",
    storageBucket: "car-xpert-76d1b.firebasestorage.app",
    messagingSenderId: "180376885101",
    appId: "1:180376885101:web:0cdfffab3fe965e1722c64"
};

// Initialize Firebase
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);

// Global Variables
let currentEditId = null;
const productGrid = document.getElementById('inventoryTableBody'); // Make sure your HTML table body has this ID!

// 2. REAL-TIME INVENTORY LISTENER
onSnapshot(collection(db, "products"), (snapshot) => {
    productGrid.innerHTML = "";
    
    if (snapshot.empty) {
        productGrid.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-muted">No parts in inventory yet.</td></tr>`;
        return;
    }

    snapshot.forEach((d) => {
        const p = d.data();
        const id = d.id;
        
        // Badges for Condition
        const isSurplus = (p.condition === 'Surplus');
        const condBadge = isSurplus 
            ? `<span class="badge" style="background-color:#fd7e14;">Surplus</span>` 
            : `<span class="badge bg-success">Brand New</span>`;

        // Format Compatibility Tags
        const tags = (p.compat || '').split(',').map(t => t.trim()).filter(Boolean);
        const tagsHtml = tags.map(t => `<span class="badge bg-warning text-dark me-1 border">${t}</span>`).join('');

        // Stock Warning
        const stockHtml = p.stock <= 5 
            ? `<span class="text-danger fw-bold">${p.stock} (Low!)</span>` 
            : `<span class="text-success fw-bold">${p.stock}</span>`;

        // Row HTML
        productGrid.innerHTML += `
            <tr class="align-middle">
                <td>
                    <div class="fw-bold">${p.name}</div>
                    <small class="text-muted">OEM: ${p.oem || 'N/A'}</small>
                </td>
                <td>${p.category}</td>
                <td>${condBadge}</td>
                <td>${tagsHtml || '<span class="text-muted small">None</span>'}</td>
                <td>
                    <div class="text-danger fw-bold">₱${parseFloat(p.price).toFixed(2)}</div>
                    <small class="text-primary d-block">WS: ₱${parseFloat(p.wholesalePrice || 0).toFixed(2)}</small>
                </td>
                <td>${stockHtml}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="editProduct('${id}', '${p.name}', '${p.oem}', '${p.category}', '${p.condition}', '${p.compat}', ${p.price}, ${p.wholesalePrice || 0}, ${p.stock}, '${p.image || ''}')">
                        <i class="bi bi-pencil-square"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteProduct('${id}')">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
});

// 3. SAVE OR UPDATE PRODUCT
window.saveProduct = async function() {
    const btnSave = document.getElementById('btnSaveProduct');
    
    // Grab values from your HTML inputs
    const name = document.getElementById('prodName').value.trim();
    const oem = document.getElementById('prodOem').value.trim();
    const category = document.getElementById('prodCategory').value;
    const condition = document.getElementById('prodCondition').value;
    const compat = document.getElementById('prodCompat').value.trim();
    const price = parseFloat(document.getElementById('prodPrice').value) || 0;
    const wholesalePrice = parseFloat(document.getElementById('prodWholesale').value) || 0;
    const stock = parseInt(document.getElementById('prodStock').value) || 0;
    const image = document.getElementById('prodImage').value.trim();

    // Validation
    if (!name || price <= 0 || stock < 0) {
        alert("Please fill in the Item Name, valid Price, and Stock quantity.");
        return;
    }

    // Prepare Data
    const productData = {
        name, oem, category, condition, compat, 
        price, wholesalePrice, stock, image,
        compatTags: compat.split(',').map(t => t.trim()).filter(Boolean) // Saves tags for smart search
    };

    btnSave.disabled = true;
    btnSave.innerText = "Saving...";

    try {
        if (currentEditId) {
            // Update existing product
            await updateDoc(doc(db, "products", currentEditId), productData);
            alert("Part updated successfully!");
        } else {
            // Add new product
            await addDoc(collection(db, "products"), productData);
            alert("New part added to inventory!");
        }
        
        // Reset form and close modal
        document.getElementById('productForm').reset();
        currentEditId = null;
        document.getElementById('modalTitle').innerText = "Add New Part";
        
        // Bootstrap modal close (assumes you are using Bootstrap 5)
        const modalEl = document.getElementById('productModal');
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();

    } catch (error) {
        console.error("Error saving part: ", error);
        alert("Failed to save. Check console for details.");
    } finally {
        btnSave.disabled = false;
        btnSave.innerText = "Save Part";
    }
};

// 4. PREPARE MODAL FOR EDITING
window.editProduct = function(id, name, oem, category, condition, compat, price, wholesale, stock, image) {
    currentEditId = id;
    document.getElementById('modalTitle').innerText = "Edit Part";
    
    document.getElementById('prodName').value = name;
    document.getElementById('prodOem').value = oem !== 'undefined' ? oem : '';
    document.getElementById('prodCategory').value = category;
    document.getElementById('prodCondition').value = condition;
    document.getElementById('prodCompat').value = compat !== 'undefined' ? compat : '';
    document.getElementById('prodPrice').value = price;
    document.getElementById('prodWholesale').value = wholesale;
    document.getElementById('prodStock').value = stock;
    document.getElementById('prodImage').value = image !== 'undefined' ? image : '';

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('productModal'));
    modal.show();
};

// 5. DELETE PRODUCT
window.deleteProduct = async function(id) {
    if (confirm("Are you sure you want to delete this part from inventory? This cannot be undone.")) {
        try {
            await deleteDoc(doc(db, "products", id));
        } catch (error) {
            console.error("Error deleting part: ", error);
            alert("Failed to delete part.");
        }
    }
};

// 6. CLEAR FORM WHEN OPENING 'ADD' MODAL
window.openAddModal = function() {
    currentEditId = null;
    document.getElementById('productForm').reset();
    document.getElementById('modalTitle').innerText = "Add New Part";
    const modal = new bootstrap.Modal(document.getElementById('productModal'));
    modal.show();
};
