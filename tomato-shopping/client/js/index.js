// Global variables
let categoriesData = [];
let productsData = {};
let currentCategory = 1;
let currentProduct = null;
//const API_URL = 'http://127.0.0.1:5500';
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
const notification = document.getElementById('notification');

// Initialize page
document.addEventListener('DOMContentLoaded', async function() {
  try {
    // Load cart from localStorage
    loadCartFromLocalStorage();
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
    // Setup account
    setupAccount();
  } catch (error) {
    console.error('Initialization error:', error);
    showError('Failed to load initial data. Please refresh the page.');
  }
  const logo = document.getElementById('logo');
  const homeLink = document.querySelector('.home-link');

  logo.addEventListener('click', showHomePage);
  homeLink.addEventListener('click', (e) => {
    e.preventDefault();
    showHomePage();
  });
});

// Load cart data from local storge
function loadCartFromLocalStorage() {
  try {
    const savedCart = localStorage.getItem('shoppingCart');
    if (savedCart) {
      cart = JSON.parse(savedCart);
      updateCartUI();
    }
  } catch (error) {
    console.error('Error loading cart from localStorage:', error);
    // If error, clear the cart
    cart = {
      items: [],
      total: 0
    };
  }
}

// Save cart data to local storge
function saveCartToLocalStorage() {
  try {
    localStorage.setItem('shoppingCart', JSON.stringify(cart));
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
}


// Fetch categories from backend
async function fetchCategories() {
  try {
       // Show loading state
       categoriesList.innerHTML = '<div class="loading"><div class="loading-spinner"></div></div>';
       fetch(`/api/categories`, {
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
   fetch(`/api/products?cateid=${cateid}`, {
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
   //console.log("fetchProductById: product: ",product);
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
      <a href="#" class="home-link">Home</a>
      <span>&gt;</span>
      <a href="#" class="category-link" data-cateid="${cateid}">${getCategoryName(cateid)}</a>
      <span>&gt;</span>
      <span>${product.name}</span>
    `;
    const homeLink = detailBreadcrumb.querySelector('.home-link');
    const categoryLink = detailBreadcrumb.querySelector('.category-link');

    homeLink.addEventListener('click', (e) => {
      e.preventDefault();
      showHomePage();
    });

    categoryLink.addEventListener('click', (e) => {
      e.preventDefault();
      const cateid = e.target.dataset.cateid;
      showCategoryPage(cateid);
    });

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
              <button class="quantity-btn decrease-quantity">-</button>
              <input type="text" value="1" class="quantity-input" id="quantity-input">
              <button class="quantity-btn increase-quantity">+</button>
            </div>
            <button class="add-to-cart-btn">Add to Cart</button>
          </div>
        </div>
      </div>
    `;
    const decreaseBtn = detailContent.querySelector('.decrease-quantity');
    const increaseBtn = detailContent.querySelector('.increase-quantity');
    const addToCartBtn = detailContent.querySelector('.add-to-cart-btn');

    decreaseBtn.addEventListener('click', decreaseQuantity);
    increaseBtn.addEventListener('click', increaseQuantity);
    addToCartBtn.addEventListener('click', addToCartFromDetail);

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
        <a href="#" class="home-link">Home</a>
        <span>&gt;</span>
        <p id="current-category">All</p>
        `;
      const homeLink = listingBreadcrumb.querySelector('.home-link');
      homeLink.addEventListener('click', (e) => {
        e.preventDefault();
        showHomePage();
      });
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
        <a href="#" class="home-link">Home</a>
        <span>&gt;</span>
        <p id="current-category">${getCategoryName(category)}</p>
      `;
      const homeLink = listingBreadcrumb.querySelector('.home-link');
      homeLink.addEventListener('click', (e) => {
        e.preventDefault();
        showHomePage();
      });
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
   // Save new data to local storge
   saveCartToLocalStorage();
   // Show notification
   showCartNotification();
 }
 //
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
  // Save new data to local storge
  saveCartToLocalStorage();
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
   saveCartToLocalStorage();
 }
 
 // ADDED: Remove item from cart
 function removeCartItem(id) {
   const itemIndex = cart.items.findIndex(item => item.id === id);
   if (itemIndex === -1) return;
   // Remove item
   cart.items.splice(itemIndex, 1);
   updateCartTotal();
   updateCartUI();
   saveCartToLocalStorage();
   // Show notification
   cartNotification.textContent = "Item removed from cart";
   cartNotification.style.backgroundColor = "#ff5000";
   showCartNotification();
 }
 // clear cart data
 function clearCart() {
  cart.items = [];
  updateCartTotal();
  updateCartUI();
  saveCartToLocalStorage();
  cartNotification.textContent = "Cart cleared";
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
    // Button for clear the cart
    const clearButton = document.createElement('div');
    clearButton.className = 'clear-cart-button';
    clearButton.innerHTML = '<button onclick="clearCart()">Clear Cart</button>';
    cartItemsElement.appendChild(clearButton);
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


// Setup account
function setupAccount() {
  // Get DOM elements
  const accountLink = document.querySelector('.account-link');
  const accountWindow = document.querySelector('.account-window');
  
  // Initialize windows state
  
  if (accountLink) {
    accountWindow.style.display = 'none';
  }

  // Update account window content
  function updateAccountWindow() {
      const userEmail = localStorage.getItem('userEmail');
      
      // Show different content based on login status
      if (!userEmail) {
          // Guest user view
          accountWindow.innerHTML = `
              <div class="account-popup">
                  <div class="account-status">
                      <span class="status-dot-inactive"></span>
                      <div class="account-email">
                        <h4>Guest</h4>
                      </div>
                  </div>
                  <div class="account-actions">
                      <button class="btn-login">
                          Log in
                      </button>
                  </div>
              </div>
          `;
          // Add event listener to login button
          const loginBtn = accountWindow.querySelector('.btn-login');
          loginBtn?.addEventListener('click', (e) => {
              e.stopPropagation();
              accountWindow.style.display = 'none';
              window.location.href = 'login.html';
          });
      } else {
          // Logged in user view
          accountWindow.innerHTML = `
              <div class="account-popup">
                  <div class="account-status">
                      <span class="status-dot"></span>
                      <span>Online</span>
                  </div>
                  <div class="account-email">
                      <h4>${userEmail}</h4>
                  </div>
                  <div class="account-actions">
                      <button class="btn-change-password">
                          Change Password
                      </button>
                      <button class="btn-logout">
                          Logout
                      </button>
                  </div>
              </div>
          `;

          // Add event listeners to buttons
          const changePasswordBtn = accountWindow.querySelector('.btn-change-password');
          const logoutBtn = accountWindow.querySelector('.btn-logout');
          const loginBtn = accountWindow.querySelector('.btn-login');
          changePasswordBtn?.addEventListener('click', (e) => {
              e.stopPropagation();
              accountWindow.style.display = 'none';
              window.location.href = '/change-password';
          });
          logoutBtn?.addEventListener('click', (e) => {
              e.stopPropagation();
              showConfirmationDialog('Are you sure you want to logout?', logout);
          });
          loginBtn?.addEventListener('click', (e) => {
              e.stopPropagation();
              accountWindow.style.display = 'none';
              window.location.href = '/login';
          });
      }
  }

  // Toggle account window
  accountLink.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      const isVisible = accountWindow.style.display === 'block';
      accountWindow.style.display = isVisible ? 'none' : 'block';
      if (!isVisible) {
          updateAccountWindow();
      }
  });

  // Close window when clicking outside
  document.addEventListener('click', function(e) {
      if (accountWindow && !accountWindow.contains(e.target) && !accountLink.contains(e.target)) {
          accountWindow.style.display = 'none';
      }
  });

  // Logout function
  async function logout() {
      try {
          const response = await fetch(`/api/logout`, {
              method: 'POST',
              credentials: 'include'
          });

          if (response.ok) {
              localStorage.removeItem('userEmail');
              showNotification('Logout successful!', true);
              // Update account window
              updateAccountWindow();
              accountWindow.style.display = 'none';
          } else {
              showNotification('Logout failed. Please try again.', true);
          }
      } catch (error) {
          console.error('Error during logout:', error);
          showNotification('An error occurred during logout. Please try again.', true);
      }
  }

  // Initial setup
  updateAccountWindow();
}

// Show notifications
function showNotification(message, isError = false) {
  notification.textContent = message;
  notification.style.backgroundColor = isError ? "#ff5000" : "#4CAF50";
  notification.style.display = 'block';
  // Hide after 3s
  setTimeout(() => {
      notification.style.display = 'none';
      // reset color
      notification.style.backgroundColor = "#4CAF50";
  }, 3000);
}

function showConfirmationDialog(message, onConfirm) {
  const confirmed = window.confirm(message);
  if (confirmed) {
      onConfirm();
  }
}
