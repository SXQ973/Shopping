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

let products = [];
let editingProductId = null;
let deletingProductId = null;
let currentImage = null;

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

function removeImage(event) {
    event.stopPropagation();
    currentImage = null;
    updateImagePreview();
}

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

    // Reset errors
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
    if (!price || price <= 0) {
        errors.price.textContent = 'Valid price is required';
        isValid = false;
    }

    // Validate stock
    const stock = document.getElementById('stock').value;
    if (!stock || stock < 0) {
        errors.stock.textContent = 'Valid stock quantity is required';
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

function openImageInNewTab(imageData) {
    const newWindow = window.open('');
    newWindow.document.write(`<img src="${imageData}" style="max-width: 100%; height: auto;">`);
    newWindow.document.title = 'Product Image';
}

function renderTable() {
    productTableBody.innerHTML = products.map(product => `
        <tr>
            <td>${product.id}</td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>$${product.price.toFixed(2)}</td>
            <td>${product.stock}</td>
            <td>${product.description}</td>
            <td>
                <img src="${product.image}" 
                     alt="${product.name}" 
                     class="thumbnail"
                     onclick="openImageInNewTab('${product.image}')">
                <div class="product-image" 
                     onclick="openImageInNewTab('${product.image}')"
                     style="cursor: pointer; color: blue; text-decoration: underline;">
                    ${product.name}_image
                </div>
            </td>
            <td>
                <button class="btn btn-edit" onclick="editProduct(${product.id})">Edit</button>
                <button class="btn btn-delete" onclick="confirmDelete(${product.id})">Delete</button>
            </td>
        </tr>
    `).join("");
}

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

openModalBtn.addEventListener("click", () => {
    editingProductId = null;
    modalTitle.textContent = "Add Product";
    resetModalInputs();
    productModal.style.display = "block";
});

closeModalBtn.addEventListener("click", () => productModal.style.display = "none");
cancelDeleteBtn.addEventListener("click", () => deleteModal.style.display = "none");

function editProduct(id) {
    const product = products.find(p => p.id === id);
    document.getElementById("name").value = product.name;
    document.getElementById("category").value = product.category;
    document.getElementById("price").value = product.price;
    document.getElementById("stock").value = product.stock;
    document.getElementById("description").value = product.description;
    currentImage = product.image;
    updateImagePreview();

    editingProductId = id;
    modalTitle.textContent = "Edit Product";
    productModal.style.display = "block";
}

submitProductBtn.addEventListener("click", () => {
    if (!validateForm()) return;

    const name = document.getElementById("name").value;
    const category = document.getElementById("category").value;
    const price = parseFloat(document.getElementById("price").value);
    const stock = parseInt(document.getElementById("stock").value, 10);
    const description = document.getElementById("description").value;

    if (editingProductId === null) {
        products.push({
            id: products.length + 1,
            name,
            category,
            price,
            stock,
            description,
            image: currentImage
        });
    } else {
        let product = products.find(p => p.id === editingProductId);
        Object.assign(product, {
            name,
            category,
            price,
            stock,
            description,
            image: currentImage
        });
    }

    productModal.style.display = "none";
    renderTable();
});

function confirmDelete(id) {
    deletingProductId = id;
    deleteModal.style.display = "block";
}

confirmDeleteBtn.addEventListener("click", () => {
    products = products.filter(p => p.id !== deletingProductId);
    deleteModal.style.display = "none";
    renderTable();
});

imageInput.addEventListener('change', handleImageUpload);

renderTable();