// Variables Globales
let products = []; // Array de productos
let cart = JSON.parse(localStorage.getItem('cart')) || []; // Carrito persistente
let wishList = JSON.parse(localStorage.getItem('wishList')) || []; // Lista de deseos

// Funciones de Interfaz
function showProducts() {
    document.getElementById('products-page').style.display = 'block';
    document.getElementById('cart-page').style.display = 'none';
    document.getElementById('wish-list-page').style.display = 'none';
}

function showCart() {
    document.getElementById('products-page').style.display = 'none';
    document.getElementById('cart-page').style.display = 'block';
    updateCartDisplay();
}

function showWishList() {
    document.getElementById('products-page').style.display = 'none';
    document.getElementById('cart-page').style.display = 'none';
    document.getElementById('wish-list-page').style.display = 'block';
    updateWishListDisplay();
}

// Función para mostrar productos
function displayProducts(category = 'todos', searchTerm = '') {
    const productsGrid = document.getElementById('products-grid');
    productsGrid.innerHTML = '';

    let filteredProducts = products;

    if (category !== 'todos') {
        filteredProducts = filteredProducts.filter(product => product.category === category);
    }

    if (searchTerm) {
        filteredProducts = filteredProducts.filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    filteredProducts.forEach(product => {
        const productElement = document.createElement('div');
        productElement.className = 'product-card';
        productElement.innerHTML = `
            <div class="product-image" onclick="showProductDetails(${product.id})">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-price">$${product.price}</p>
                <button class="add-to-cart" onclick="addToCart(${product.id})">
                    Añadir al carrito
                </button>
                <button class="add-to-wishlist" onclick="addToWishList(${product.id})">
                    Añadir a la lista de deseos
                </button>
                <div class="reviews">
                    <h4>Reseñas:</h4>
                    <div id="reviews-${product.id}"></div>
                    <input type="text" id="review-input-${product.id}" placeholder="Escribe tu reseña">
                    <button onclick="addReview(${product.id})">Enviar Reseña</button>
                </div>
            </div>
        `;
        productsGrid.appendChild(productElement);
    });
}

// Función para agregar a la lista de deseos
function addToWishList(productId) {
    const product = products.find(p => p.id === productId);
    if (product && !wishList.some(item => item.id === productId)) {
        wishList.push(product);
        localStorage.setItem('wishList', JSON.stringify(wishList));
        updateWishListDisplay();
    }
}

// Función para mostrar la lista de deseos
function updateWishListDisplay() {
    const wishListItems = document.getElementById('wish-list-items');
    wishListItems.innerHTML = '';

    wishList.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'wish-list-item';
        itemElement.innerHTML = `
            <div>${item.name} - $${item.price}</div>
            <span class="remove-item" onclick="removeFromWishList(${index})">🗑️</span>
        `;
        wishListItems.appendChild(itemElement);
    });
}

// Función para eliminar de la lista de deseos
function removeFromWishList(index) {
    wishList.splice(index, 1);
    localStorage.setItem('wishList', JSON.stringify(wishList));
    updateWishListDisplay();
}

// Función para agregar reseñas
function addReview(productId) {
    const reviewInput = document.getElementById(`review-input-${productId}`);
    const reviewText = reviewInput.value;
    if (reviewText) {
        const reviewsContainer = document.getElementById(`reviews-${productId}`);
        const reviewElement = document.createElement('div');
        reviewElement.textContent = reviewText;
        reviewsContainer.appendChild(reviewElement);
                reviewInput.value = ''; // Limpiar el campo de entrada
    }
}

// Función para agregar al carrito
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (product && !cart.some(item => item.id === productId)) {
        cart.push(product);
        localStorage.setItem('cart', JSON.stringify(cart)); // Guardar en el almacenamiento local
        updateCartCount();
        updateCartDisplay();
    }
}

// Función para mostrar el número de elementos en el carrito
function updateCartCount() {
    document.getElementById('cart-count').textContent = cart.length;
}

// Función para mostrar los elementos del carrito
function updateCartDisplay() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    cartItems.innerHTML = '';

    let total = 0;

    cart.forEach((item, index) => {
        total += item.price;
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.innerHTML = `
            <div class="cart-item-info">
                <img src="${item.image}" alt="${item.name}">
                <div>
                    <h3>${item.name}</h3>
                    <p>$${item.price}</p>
                </div>
            </div>
            <span class="remove-item" onclick="removeFromCart(${index})">🗑️</span>
        `;
        cartItems.appendChild(itemElement);
    });

    cartTotal.textContent = total.toFixed(2);
    updateWhatsAppLink(); // Actualizar el enlace de WhatsApp
}

// Función para eliminar del carrito
function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart)); // Actualizar el almacenamiento local
    updateCartCount();
    updateCartDisplay();
}

// Función para actualizar el enlace de WhatsApp
function updateWhatsAppLink() {
    const whatsappButton = document.getElementById('whatsapp-button');
    let message = "¡Hola! Me gustaría hacer el siguiente pedido:\n\n";
    
    cart.forEach(item => {
        message += `- ${item.name} ($${item.price})\n`;
    });
    
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    message += `\nTotal: $${total.toFixed(2)}`;
    
    const encodedMessage = encodeURIComponent(message);
    whatsappButton.href = `https://wa.me/5355059350?text=${encodedMessage}`;
}

// Función para mostrar detalles del producto
function showProductDetails(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        const modal = document.getElementById('product-modal');
        const modalContent = document.getElementById('modal-product-details');
        
        modalContent.innerHTML = `
            <h2>${product.name}</h2>
            <img src="${product.image}" alt="${product.name}" class="product-modal-image">
            <p class="product-description">${product.description}</p>
            <p class="product-price">Precio: $${product.price}</p>
            <button class="add-to-cart" onclick="addToCart(${product.id}); closeModal();">
                Añadir al carrito
            </button>
        `;
        
        modal.style.display = 'block';
    }
}

// Función para cerrar el modal
function closeModal() {
    document.getElementById('product-modal').style.display = 'none';
}

// Evento para cerrar el modal con la tecla Escape
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeModal();
    }
});

// Inicializar la aplicación
function initApp() {
    // Cargar productos desde una fuente (puedes reemplazar esto con una API o archivo JSON)
    products = [
        { id: 1, name: 'Producto 1', price: 10.00, category: 'categoria1', image: 'url-imagen-1', description: 'Descripción del producto 1' },
        { id: 2, name: 'Producto 2', price: 20.00, category: 'categoria2', image: 'url-imagen-2', description: 'Descripción del producto 2' },
        // Agrega más productos según sea necesario
    ];
    
    displayProducts(); // Muestra todos los productos al cargar
    updateCartCount(); // Actualiza el conteo del carrito
    updateWishListDisplay(); // Muestra la lista de deseos
}

// Llamar a la función de inicialización al cargar la página
window.onload = initApp;
``
