const productTableBody = document.getElementById('productTableBody');
const openModalBtn = document.getElementById('openModalBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const productModal = document.getElementById('productModal');
const submitProductBtn = document.getElementById('submitProductBtn');
const modalTitle = document.getElementById('modalTitle');
const deleteModal = document.getElementById('deleteModal');
const imagePreview = document.getElementById('imagePreview');
const imageInput = document.getElementById('imageInput');
const uploadText = document.getElementById('uploadText');
const notification = document.getElementById('notification');

// const API_URL = 'http://127.0.0.1:5500';
let products = [];
let categories = [];
let editingProductId = null;
let deletingProductId = null;
let currentImage = null;

let csrfToken = null;

// Fetch CSRF token 
async function fetchCsrfToken() {
    try {
        const response = await fetch('/api/csrf-token');
        const data = await response.json();
        csrfToken = data.token;
        document.getElementById('csrfToken').value = csrfToken;
    } catch (error) {
        showError('Failed to initialize security features. Please refresh the page.');
    }
}

// Show notifications
function showNotification(message, isSuccess = true) {
    notification.textContent = message;
    notification.className = 'notification';
    notification.classList.add(isSuccess ? 'success' : 'error');
    notification.style.display = 'block';
    // Last for 3 seconds
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Sort Products by product id(Desc)
function sortProductsByIdDesc(productsArray) {
    return [...productsArray].sort((a, b) => b.pid - a.pid);
}

// ProductList: Load products from the server
async function fetchProducts() {
    console.log(`${API_URL}/products`);
    try {
        const response = await fetch('/api/products', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('❌ Failed to fetch products');
        }
        
        const data = await response.json();
        // sort by id dec
        products = sortProductsByIdDesc(data);
        renderTable();
    } catch (error) {
        console.error('❌ Error fetching products:', error);
        showNotification('Failed to fetch products', false);
    }
}

// Categories: Load categories from the server
function fetchCategories() {
    fetch('/api/categories', {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('❌ Failed to fetch categories');
        }
        return response.json();
    })
    .then(data => {
        categories = data;
        populateCategoryDropdown();
        if (products.length > 0) {
            renderTable();
        }
    })
    .catch(error => {
        console.error('❌ Error fetching categories:', error);
        showNotification('Failed to fetch categories', false);
    });
}

// Categories: Populate category dropdown
function populateCategoryDropdown() {
    const categorySelect = document.getElementById('category');
    category.innerHTML = `
        <option value="">Select a category</option>
        ${categories.map(category => `
            <option value="${category.cateid}">${category.name}</option>
        `).join('')}
    `;
}

//Add new products
async function addProduct(productData) {
    try {
        const response = await fetch('/api/products', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken
            },
            body: JSON.stringify(productData)
        });
        
        if (!response.ok) throw new Error('Failed to add product');
        await fetchProducts();
        showNotification('Product added successfully!');
        return true;
    } catch (error) {
        console.error('Error adding product:', error);
        showNotification('Failed to add product', false);
        return false;
    }
}

//Update product: show update form
function editProduct(pid){
    const product = products.find(p => p.pid === pid);
    document.getElementById("name").value = product.name;
    document.getElementById("category").value = product.cateid;
    document.getElementById("price").value = product.price;
    document.getElementById("stock").value = product.stock;
    document.getElementById("description").value = product.description;
    currentImage = product.imageUrl;
    updateImagePreview();
    editingProductId = pid;
    console.log("editingProductId:",editingProductId);
    modalTitle.textContent = "Edit Product";
    productModal.style.display = "block";
}

// Send update data to server
async function sendUpdatedToServer(pid, productData) {
    console.log("sendUpdatedToServer: pid:",pid);
    try {
        const response = await fetch(`/api/products/${pid}`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productData)
        });
        
        if (!response.ok) throw new Error('Failed to update product');
        await fetchProducts();
        showNotification('Product updated successfully!');
        return true;
    } catch (error) {
        console.error('Error updating product:', error);
        showNotification('Failed to update product', false);
        return false;
    }
}

//Delete a product
async function deleteProduct(id) {
    try {
        const response = await fetch(`/api/products/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        
        if (!response.ok) throw new Error('Failed to delete product');
        await fetchProducts();
        showNotification('Product deleted successfully!');
        return true;
    } catch (error) {
        console.error('Error deleting product:', error);
        showNotification('Failed to delete product', false);
        return false;
    }
}

// Add product: Open modal for adding new product
openModalBtn.addEventListener("click", () => {
    editingProductId = null;
    modalTitle.textContent = "Add Product";
    resetModalInputs();
    console.log("categories",categories);
    if (categories.length === 0) {
        fetchCategories();
    }
    productModal.style.display = "block";
});

// Add product/Edit product: Handle form submission
submitProductBtn.addEventListener("click", async () => {
    if (!validateForm()) return;
    const productData = {
        name: document.getElementById("name").value,
        cateid: document.getElementById("category").value,
        price: parseFloat(document.getElementById("price").value),
        stock: parseInt(document.getElementById("stock").value, 10),
        description: document.getElementById("description").value,
        imageUrl: currentImage
    };
    let success;
    // CASE 1: Add product
    if (editingProductId === null) {
        success = await addProduct(productData);
    } 
    // CASE 2: Edit product
    else {
        console.log("editingProductId:",editingProductId);
        success = await sendUpdatedToServer(editingProductId, productData);
    }
    if (success) {
        productModal.style.display = "none";
        resetModalInputs();
    }
});

// Close modals
closeModalBtn.addEventListener("click", () => productModal.style.display = "none");
cancelDeleteBtn.addEventListener("click", () => deleteModal.style.display = "none");

// Add product: Validate form inputs before submission
function validateForm() {
    let isValid = true;
    const errors = {
        name: document.getElementById('nameError'),
        category: document.getElementById('categoryError'),
        price: document.getElementById('priceError'),
        stock: document.getElementById('stockError'),
        description: document.getElementById('descriptionError'),
        image: document.getElementById('imageError')
    };
    // Clear all previous error messages
    Object.values(errors).forEach(error => error.textContent = '');
    // Validate name
    const name = document.getElementById('name').value;
    if (!name) {
        errors.name.textContent = 'Name is required';
        isValid = false;
    } else if (name.split(' ').length > 20) {
        errors.name.textContent = 'Name cannot exceed 20 words';
        isValid = false;
    }
    // Validate category
    if (!document.getElementById('category').value) {
        errors.category.textContent = 'Category is required';
        isValid = false;
    }
    // Validate price
    const price = document.getElementById('price').value;
    const priceNum = parseFloat(price);
    if (!priceNum || priceNum < 0 || priceNum > 99999999.99) {
        errors.price.textContent = 'Valid price is required';
        isValid = false;
    }
    if (isNaN(priceNum)) {
        errors.price.textContent = 'Price must be a number';
        isValid = false;
    }
    
    // Validate stock quantity
    const stock = document.getElementById('stock').value;
    if (!stock || stock < 0 || stock > 4294967295) {
        errors.stock.textContent = 'Valid stock quantity is required';
        isValid = false;
    }
    if(isNaN(stock)){
        errors.stock.textContent = 'Stock must be a number';
        isValid = false;
    }
    // Validate description
    const description = document.getElementById('description').value;
    if (!description) {
        errors.description.textContent = 'Description is required';
        isValid = false;
    } else if (description.split(' ').length > 100) {
        errors.description.textContent = 'Description cannot exceed 100 words';
        isValid = false;
    }
    // Validate image
    if (!currentImage) {
        errors.image.textContent = 'Image is required';
        isValid = false;
    }
    return isValid;
}

// Reset modal form inputs and error messages
function resetModalInputs() {
    document.getElementById("name").value = "";
    document.getElementById("category").value = "";
    document.getElementById("price").value = "";
    document.getElementById("stock").value = "";
    document.getElementById("description").value = "";
    currentImage = null;
    updateImagePreview();
    // Reset error messages
    const errors = document.getElementsByClassName('error-message');
    Array.from(errors).forEach(error => error.textContent = '');
}

// Confirm product deletion
confirmDeleteBtn.addEventListener("click", async () => {
    if (await deleteProduct(deletingProductId)) {
        deleteModal.style.display = "none";
    }
});

// Delete product: Confirm product deletion
function confirmDelete(id) {
    deletingProductId = id;
    deleteModal.style.display = "block";
}

//Image Operation: Image upload handling
imageInput.addEventListener('change', handleImageUpload);
imagePreview.addEventListener('click', () => imageInput.click());
imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            currentImage = e.target.result;
            updateImagePreview();
        };
        reader.readAsDataURL(file);
    }
});

// Image Operation: Open image in new tab when clicked
function openImageInNewTab(imageData) {
    const newWindow = window.open('');
    newWindow.document.write(`<img src="${imageData}" style="max-width: 100%; height: auto;">`);
    newWindow.document.title = 'Product Image';
}

// Image Operation: Update Image 
function updateImagePreview() {
    if (currentImage) {
        imagePreview.innerHTML = `
            <img src="${currentImage}" alt="Preview">
            <button class="remove-image" onclick="removeImage(event)">×</button>
        `;
    } else {
        imagePreview.innerHTML = `
            <input type="file" id="imageInput" accept="image/*" style="display: none">
            <span id="uploadText">Click to upload image</span>
        `;
        document.getElementById('imageInput').addEventListener('change', handleImageUpload);
    }
}

// Image Operation: Handle image file upload
function handleImageUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            currentImage = e.target.result;
            updateImagePreview();
        };
        reader.readAsDataURL(file);
    }
}

// Image Operation: Remove currently selected image
function removeImage(event) {
    event.stopPropagation();
    currentImage = null;
    updateImagePreview();
}

// Render products table with current data
function renderTable() {
    const tbody = document.querySelector('tbody');
    tbody.innerHTML = '';
    products.forEach(product => {
        const category = categories.find(c => c.cateid === product.cateid);
        const categoryName = category ? category.name : 'Unknown Category';
        const row = document.createElement('tr');
        console.log("product:",product);
        row.innerHTML = `
            <td>${product.pid}</td>
            <td>${product.name}</td>
            <td>${categoryName}</td>
            <td>${product.price}</td>
            <td>${product.stock}</td>
            <td>${product.description}</td>
            <td>
                <img src="${product.imageUrl}" 
                     alt="${product.name}" 
                     class="thumbnail"
                     style="max-width: 50px;"
                     onclick="openImageInNewTab('${product.imageUrl}')">
            </td>
            <td>
                <button class="btn btn-edit" onclick="editProduct(${product.pid})">Edit</button>
                <button class="btn btn-delete" onclick="confirmDelete(${product.pid})">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    fetchCategories();
});
