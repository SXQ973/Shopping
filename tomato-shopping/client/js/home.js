// Global variables
let categoriesData = [];
let productsData = {};
let currentCategory = 1;
let currentProduct = null;
const API_URL = 'http://43.199.184.100';
let cart = {
  items: [],
  total: 0
};
const productsGrid = document.getElementById('products-grid');
const breadcrumb = document.getElementById('breadcrumb');
const categoriesList = document.getElementById('categories-list');
const productListing = document.getElementById('product-listing');
const productDetail = document.getElementById('product-detail');
const cartTotalElement = document.getElementById('cart-total');
const cartItemsElement = document.getElementById('cart-items');
const cartNotification = document.getElementById('cart-notification');
const cartElement = document.getElementById('cart');

// Initialize page
document.addEventListener('DOMContentLoaded', async function() {
  try {
    // Fetch categories from "backend"
    await fetchCategories();
    console.log("Category data already loaded:", categoriesData);
    // Load products for default category
    await fetchProductsByCategory(currentCategory);
    console.log("Product fetched");
    // Setup category click listeners
    setupCategoryListeners();
    // Setup carousel
    setupCarousel();
    // Setup cart
    setupCart();
  } catch (error) {
    console.error('Initialization error:', error);
    showError('Failed to load initial data. Please refresh the page.');
  }
});

// Fetch categories from backend
async function fetchCategories() {
  try {
       // Show loading state
       categoriesList.innerHTML = '<div class="loading"><div class="loading-spinner"></div></div>';
       fetch(`${API_URL}/categories`, {
           method: 'GET',
           headers: {
               'Accept': 'application/json',
               'Content-Type': 'application/json'
           }
       })
       .then(response => response.json())
       .then(data => {
       categoriesData = data;
       renderCategories();
       }
       )
       .catch(error => {
       console.error('Error fetching categories:', error);
       categoriesList.innerHTML = '<div class="error-message">Failed to load categories</div>';
       }
       )
   } catch (error) {
       console.error('Error fetching categories:', error);
       categoriesList.innerHTML = '<div class="error-message">Failed to load categories</div>';
   }
}

// Render categories in the sidebar
function renderCategories() {
   categoriesList.innerHTML = '';
   console.log("renderCategories: categpriesData", categoriesData);
   categoriesData.forEach(category => {
       const li = document.createElement('li');
       li.textContent = category.name;
       li.dataset.cateid = category.cateid;
       if (category.cateid === currentCategory) {
           li.classList.add('active');
       }
       categoriesList.appendChild(li);
   });
}

// Fetch products by category from backend
async function fetchProductsByCategory(cateid) {
   // Show loading state
   productsGrid.innerHTML = '<div class="loading"><div class="loading-spinner"></div></div>';
   currentCategory = parseInt(cateid);
   
   // Update breadcrumb
   if (!categoriesData || categoriesData.length === 0) {
       await fetchCategories();
   }
   const currentCategoryEl = document.getElementById('current-category');
   if (currentCategoryEl) {
     currentCategoryEl.textContent = getCategoryName(currentCategory);
   }
   
   // Fetch products for this category
   fetch(`${API_URL}/products?cateid=${cateid}`, {
       method: 'GET',
       headers: {
           'Accept': 'application/json',
           'Content-Type': 'application/json'
       }
   })
   .then(response => response.json())
   .then(data => {
       console.log("✅ Product data:", data); 
       productsData[cateid] = data;
       renderProducts(productsData[cateid]);
       // Update active category in sidebar
       updateActiveCategory(cateid);
   })
   .catch(error => {
       console.error('Error fetching products:', error);
       productsGrid.innerHTML = '<div class="error-message">Failed to load products</div>';
   });
}

// Render products in the grid
function renderProducts(products) {
  productsGrid.innerHTML = '';
  if (!products || products.length === 0) {
    productsGrid.innerHTML = '<div class="error-message">No products found in this category</div>';
    return;
  }

  products.forEach(product => {
    const productCard = document.createElement('div');
    productCard.className = 'product-card';
    productCard.dataset.productId = product.pid;
    productCard.innerHTML = `
      <div class="product-image-container">
        <img src="${product.imageUrl}" alt="${product.name}" class="product-image">
      </div>
      <h3 class="product-title">${product.name}</h3>
      <div class="product-price">$${product.price}</div>
      <button class="buy-button">Add to Cart</button>
    `;
    
    // Add click event to view product details
    productCard.addEventListener('click', function(e) {
      // Don't trigger if the button was clicked
      if (e.target.className === 'buy-button') return;
      showProductDetail(product.pid, currentCategory);
    });
    
    // Add click event to Add to Cart button
    const addToCartBtn = productCard.querySelector('.buy-button');
    addToCartBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      addToCart(product);
    });
    
    productsGrid.appendChild(productCard);
  });
}

// Fetch single product from "backend"
async function fetchProductById(productId, cateid) {
  try {
   const product = productsData[cateid].find(p => p.pid === productId);
   console.log("fetchProductById: product: ",product);
   if (product) return product;
  } catch (error) {
    console.error('Error fetching product details:', error);
    throw error;
  }
}

// Show product detail
async function showProductDetail(productId, cateid) {
  try {
    // Show loading state
    productDetail.innerHTML = '<div class="loading"><div class="loading-spinner"></div></div>';
    productDetail.style.display = 'block';
    productListing.style.display = 'none';
    
    // Convert productId to number if it's a string
    productId = parseInt(productId);
    
    // Fetch product details
    const product = await fetchProductById(productId, cateid);
    console.log("showProductDetail: product: ", product);
    // Save current product
    currentProduct = product;
    
    // Update breadcrumb
    const detailBreadcrumb = document.createElement('nav');
    detailBreadcrumb.className = 'breadcrumb';
    detailBreadcrumb.innerHTML = `
      <a href="#" onclick="showHomePage(); return false;">Home</a>
      <span>&gt;</span>
      <a href="#" onclick="showCategoryPage(${cateid}); return false;">${getCategoryName(cateid)}</a>
      <span>&gt;</span>
      <span>${product.name}</span>
    `;

    // Populate product detail
    const detailContent = document.createElement('div');
    detailContent.className = 'product-detail-content';
    detailContent.innerHTML = `
      <div class="product-detail-top">
        <div class="product-detail-image">
          <img src="${product.imageUrl}" alt="${product.name}">
        </div>
        <div class="product-detail-info">
           <h1 class="product-detail-title">${product.name}</h1>
           <div class="product-detail-price">$${product.price}</div>
           <div class="product-detail-category">
               <span class="detail-label">Category:</span>
               <span class="detail-value">${getCategoryName(product.cateid)}</span>
           </div>
           <div class="product-detail-stock">
               <span class="detail-label">Stock:</span>
               <span class="detail-value">${product.stock} available</span>
           </div>
           <div class="product-detail-description">
            ${product.description || 'No description available.'}
          </div>
          <div class="product-detail-actions">
            <div class="product-detail-quantity">
              <button class="quantity-btn" onclick="decreaseQuantity()">-</button>
              <input type="text" value="1" class="quantity-input" id="quantity-input">
              <button class="quantity-btn" onclick="increaseQuantity()">+</button>
            </div>
            <button class="add-to-cart-btn" onclick="addToCartFromDetail()">Add to Cart</button>
          </div>
        </div>
      </div>
    `;
    productDetail.innerHTML = '';
    productDetail.appendChild(detailBreadcrumb);
    productDetail.appendChild(detailContent);
  } catch (error) {
    console.error('Error showing product detail:', error);
    productDetail.innerHTML = '<div class="error-message">Failed to load product details</div>';
  }
}

// Show home page
async function showHomePage() {
  try {
    await fetchProductsByCategory(1);
    console.log("showHomePage: ");
    const listingBreadcrumb = document.getElementById('breadcrumb');
    if (listingBreadcrumb) {
      listingBreadcrumb.innerHTML = `
        <a href="#" onclick="showHomePage(); return false;">Home</a>
        <span>&gt;</span>
        <p id="current-category">All</p>
      `;
    }
    
    const currentCategoryEl = document.getElementById('current-category');
    if (currentCategoryEl) {
      currentCategoryEl.textContent = 'All';
    }
    
    productDetail.style.display = 'none';
    productListing.style.display = 'block';
  } catch (error) {
    console.error('Error showing home page:', error);
    showError('Failed to load home page data');
  }
}

// Show category page
async function showCategoryPage(category) {
  try {
    await fetchProductsByCategory(category);
    const listingBreadcrumb = document.getElementById('breadcrumb');
    if (listingBreadcrumb) {
      listingBreadcrumb.innerHTML = `
        <a href="#" onclick="showHomePage(); return false;">Home</a>
        <span>&gt;</span>
        <p id="current-category">${getCategoryName(category)}</p>
      `;
    }
    const currentCategoryEl = document.getElementById('current-category');
    if (currentCategoryEl) {
      currentCategoryEl.textContent = getCategoryName(category);
    }
    
    productDetail.style.display = 'none';
    productListing.style.display = 'block';
  } catch (error) {
    console.error('Error showing category page:', error);
    showError('Failed to load category data');
  }
}

// Setup category listeners
function setupCategoryListeners() {
  categoriesList.addEventListener('click', async function(e) {
    if (e.target.tagName === 'LI') {
       console.log("e.target.dataset.cateid:",e.target.dataset.cateid);
       const category = e.target.dataset.cateid;
       try {
       await fetchProductsByCategory(category);
       productDetail.style.display = 'none';
       productListing.style.display = 'block';
       } catch (error) {
       console.error('Error handling category click:', error);
       showError('Failed to load category products');
       }
   }
  });
}

// Update active category
function updateActiveCategory(category) {
  const categoryItems = categoriesList.querySelectorAll('li');
  categoryItems.forEach(item => {
    if (item.dataset.category === category) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}

// Get category name from ID
function getCategoryName(categoryId) {
   if(categoryId === 1)   return 'All';
   const category = categoriesData.find(cat => cat.cateid === parseInt(categoryId));
   return category ? category.name : 'Unknown Category';
}

// Setup cart
function setupCart(){
   const cartWindow = document.querySelector('.cart-window');
   // Not display the window in default
   if (cartWindow) {
     cartWindow.style.display = 'none';
   }
   // Click on cart
   if (cartElement) {
     cartElement.addEventListener('click', function(e) {
       e.stopPropagation();
       if (cartWindow.style.display === 'block') {
         cartWindow.style.display = 'none';
       } else {
         cartWindow.style.display = 'block';
       }
     });
   }
   // When click on other region of the page, close the window.
   document.addEventListener('click', function() {
     if (cartWindow) {
       cartWindow.style.display = 'none';
     }
   });
   // When clicking in the window, avoid closing it
   if (cartWindow) {
     cartWindow.addEventListener('click', function(e) {
       e.stopPropagation();
     });
   }
}

// Add to cart
function addToCart(product) {
   if (!product) return;
   // Check if item already in cart
   const existingItem = cart.items.find(item => item.id === product.pid);
   if (existingItem) {
     // Increase quantity
     existingItem.quantity += 1;
   } else {
     // Add new item
     cart.items.push({
       id: product.pid,
       title: product.name,
       price: product.price,
       quantity: 1,
       image: product.imageUrl
     });
   }
   // Recalculate total
   updateCartTotal();
   // Update cart UI
   updateCartUI();
   // Show notification
   showCartNotification();
 }
 
 // Add to cart from detail page
 function addToCartFromDetail() {
   if (!currentProduct) return;
   // Get quantity
   const quantityInput = document.getElementById('quantity-input');
   const quantity = parseInt(quantityInput.value) || 1;
   // Check if item already in cart
   const existingItem = cart.items.find(item => item.id === currentProduct.pid);
   if (existingItem) {
     // Increase quantity
     existingItem.quantity += quantity;
   } else {
     // Add new item
     cart.items.push({
       id: currentProduct.pid,
       title: currentProduct.name,
       price: currentProduct.price,
       quantity: quantity,
       image: currentProduct.imageUrl
     });
   }
   
   // Recalculate total
   updateCartTotal();
   
   // Update cart UI
   updateCartUI();
   
   // Show notification
   showCartNotification();
 }
 
 // MODIFIED: Change cart item quantity
 function changeCartItemQuantity(id, change) {
   const item = cart.items.find(item => item.id === id);
   if (!item) return;
   // Apply change but ensure quantity is at least 1
   const newQuantity = item.quantity + change;
   if (newQuantity < 1) return;
   item.quantity = newQuantity;
   updateCartTotal();
   updateCartUI();
 }
 
 // ADDED: Remove item from cart
 function removeCartItem(id) {
   const itemIndex = cart.items.findIndex(item => item.id === id);
   if (itemIndex === -1) return;
   // Remove item
   cart.items.splice(itemIndex, 1);
   updateCartTotal();
   updateCartUI();
   // Show notification
   cartNotification.textContent = "Item removed from cart";
   cartNotification.style.backgroundColor = "#ff5000";
   showCartNotification();
 }
 
 // Increase quantity
 function increaseQuantity() {
   const quantityInput = document.getElementById('quantity-input');
   let quantity = parseInt(quantityInput.value) || 0;
   quantityInput.value = quantity + 1;
 }
 
 // Decrease quantity
 function decreaseQuantity() {
   const quantityInput = document.getElementById('quantity-input');
   let quantity = parseInt(quantityInput.value) || 0;
   if (quantity > 1) {
     quantityInput.value = quantity - 1;
   }
 }
 
 // Update cart total
 function updateCartTotal() {
   cart.total = cart.items.reduce((total, item) => {
     return total + (item.price * item.quantity);
   }, 0);
 }
 
 // MODIFIED: Update cart UI
 function updateCartUI() {
   // Update total
   cartTotalElement.textContent = cart.total.toFixed(2);
   
   // Update items
   cartItemsElement.innerHTML = '';
   
   if (cart.items.length === 0) {
     cartItemsElement.innerHTML = '<div class="empty-cart-message">Your cart is empty</div>';
   } else {
     // Show all items
     cart.items.forEach(item => {
       const li = document.createElement('li');
       li.innerHTML = `
         <div class="cart-item-image">
           <img src="${item.image}" alt="${item.title}">
         </div>
         <div class="cart-item-details">
           <a href="#" onclick="showProductDetail(${item.id}, currentCategory); return false;">${item.title}</a>
           <div class="cart-item-price">
             <div class="cart-item-quantity">
               <button onclick="changeCartItemQuantity(${item.id}, -1); event.stopPropagation();">-</button>
               <span>${item.quantity}</span>
               <button onclick="changeCartItemQuantity(${item.id}, 1); event.stopPropagation();">+</button>
             </div>
             <span class="cost">$${(item.price * item.quantity).toFixed(2)}</span>
           </div>
         </div>
         <button class="cart-item-delete" onclick="removeCartItem(${item.id}); event.stopPropagation();">×</button>
       `;
       cartItemsElement.appendChild(li);
     });
   }
   
   // Update cart text
   if (cartElement) {
     cartElement.childNodes[0].nodeValue = `Cart $${cart.total.toFixed(2)} `;
   }
 }
 
 // Show cart notification
 function showCartNotification() {
   cartNotification.style.display = 'block';
   
   // Hide after 3 seconds
   setTimeout(() => {
     cartNotification.style.display = 'none';
     // Reset notification color for next use
     cartNotification.style.backgroundColor = "#4CAF50";
   }, 3000);
 }
 
 // Show error message
 function showError(message) {
   const errorDiv = document.createElement('div');
   errorDiv.className = 'error-message';
   errorDiv.textContent = message;
   
   // Replace content with error message
   productsGrid.innerHTML = '';
   productsGrid.appendChild(errorDiv);
 }
 
// Carousel
function setupCarousel() {
  const carouselImages = document.getElementById('carousel-images');
  const prevButton = document.getElementById('prev');
  const nextButton = document.getElementById('next');
  const indicators = document.querySelectorAll('.indicator');
  let currentSlide = 0;
  const slidesCount = carouselImages.children.length;
  // Set initial slide
  updateCarousel();
  // Next button
  nextButton.addEventListener('click', () => {
    currentSlide = (currentSlide + 1) % slidesCount;
    updateCarousel();
  });
  // Previous button
  prevButton.addEventListener('click', () => {
    currentSlide = (currentSlide - 1 + slidesCount) % slidesCount;
    updateCarousel();
  });
  // Indicators
  indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => {
      currentSlide = index;
      updateCarousel();
    });
  });
  // Auto slide
  setInterval(() => {
    currentSlide = (currentSlide + 1) % slidesCount;
    updateCarousel();
  }, 5000);
  // Update carousel UI
  function updateCarousel() {
    // Update slides
    carouselImages.style.transform = `translateX(-${currentSlide * 100}%)`;
    // Update indicators
    indicators.forEach((indicator, index) => {
      if (index === currentSlide) {
        indicator.classList.add('active');
      } else {
        indicator.classList.remove('active');
      }
    });
  }
}