// =========================================
// 1. VARIABLES GLOBALES Y PERSISTENCIA
// =========================================
let cart = JSON.parse(localStorage.getItem('morroCart')) || [];
let localProducts = JSON.parse(localStorage.getItem('morroProducts')) || [
    { id: 1, name: "Lenguado Entero", price: 45.0, desc: "Capturado esta madrugada.", stock: 15, img: "https://images.unsplash.com/photo-1534940859016-d5478443d088?q=80&w=400", owner: "Admin" },
    { id: 2, name: "Pulpo Fresco", price: 35.0, desc: "Limpiado y listo.", stock: 8, img: "https://images.unsplash.com/photo-1559740049-93e18f2601c4?q=80&w=400", owner: "Admin" }
];

// =========================================
// 2. NAVEGACIÓN Y CONTROL DE INTERFAZ
// =========================================
function toggleMenu() { document.getElementById('nav-links').classList.toggle('active'); }
function closeMenu() { document.getElementById('nav-links').classList.remove('active'); }

function toggleHeroButton(isLoggedIn) {
    const heroBtn = document.getElementById('hero-cta-btn');
    if (heroBtn) {
        isLoggedIn ? heroBtn.classList.add('hidden') : heroBtn.classList.remove('hidden');
    }
}

function scrollToServices() {
    showSection('home-view');
    setTimeout(() => {
        const target = document.getElementById('features-section');
        if(target) target.scrollIntoView({ behavior: 'smooth' });
    }, 100);
}

function showSection(sectionId) {
    // Añadida 'checkout-view' a la lista
    const views = ['home-view', 'login-section', 'register-section', 'pescadores-view', 'restaurantes-view', 'cart-view', 'checkout-view'];
    views.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.classList.add('hidden');
    });
    
    document.getElementById(sectionId).classList.remove('hidden');
    window.scrollTo(0, 0);

    if (sectionId === 'pescadores-view') renderPescadorInventory();
    if (sectionId === 'restaurantes-view') renderRestauranteMarket();
    if (sectionId === 'cart-view') renderCart();
}

// =========================================
// 3. GESTIÓN DE PRODUCTOS (PESCADOR)
// =========================================
const productForm = document.getElementById('product-form');

if (productForm) {
    productForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const editIndex = parseInt(document.getElementById('edit-index').value);
        const name = document.getElementById('p-name').value;
        const price = parseFloat(document.getElementById('p-price').value);
        const stock = parseInt(document.getElementById('p-stock').value);
        const desc = document.getElementById('p-desc').value;
        const file = document.getElementById('p-image').files[0];

        const saveProduct = (imgSrc) => {
            const productData = {
                id: editIndex >= 0 ? localProducts[editIndex].id : Date.now(),
                name, price, stock, desc,
                img: imgSrc || (editIndex >= 0 ? localProducts[editIndex].img : 'https://via.placeholder.com/400x300?text=Sin+Imagen'),
                owner: localStorage.getItem('userFirstName') || 'Pescador Local'
            };

            if (editIndex >= 0) localProducts[editIndex] = productData;
            else localProducts.push(productData);

            localStorage.setItem('morroProducts', JSON.stringify(localProducts));
            resetForm();
            renderPescadorInventory();
            renderRestauranteMarket();
        };

        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => saveProduct(reader.result);
            reader.readAsDataURL(file);
        } else saveProduct();
    });
}

function renderPescadorInventory() {
    const grid = document.getElementById('pescador-inventory-grid');
    if(!grid) return;
    grid.innerHTML = '';
    localProducts.forEach((prod, index) => {
        grid.innerHTML += `
            <div class="product-card">
                <img src="${prod.img}" class="product-img">
                <h3>${prod.name}</h3>
                <div class="price">S/ ${prod.price.toFixed(2)}</div>
                <p>Stock: ${prod.stock}kg</p>
                <div style="display:flex; gap:5px; margin-top:10px;">
                    <button onclick="editProduct(${index})" class="btn-submit" style="background:#f59e0b;">Editar</button>
                    <button onclick="deleteProduct(${index})" class="btn-remove" style="flex:1;">Eliminar</button>
                </div>
            </div>`;
    });
}

function editProduct(index) {
    const prod = localProducts[index];
    document.getElementById('p-name').value = prod.name;
    document.getElementById('p-price').value = prod.price;
    document.getElementById('p-stock').value = prod.stock;
    document.getElementById('p-desc').value = prod.desc;
    document.getElementById('edit-index').value = index;
    document.getElementById('form-title').innerText = "📝 Editando Producto";
    document.getElementById('btn-publish').innerText = "Guardar Cambios";
    document.getElementById('btn-cancel-edit').classList.remove('hidden');
}

function resetForm() {
    if(productForm) productForm.reset();
    document.getElementById('edit-index').value = "-1";
    document.getElementById('form-title').innerText = "🚢 Registrar Nueva Captura";
    document.getElementById('btn-publish').innerText = "Publicar Producto";
    document.getElementById('btn-cancel-edit').classList.add('hidden');
}

function deleteProduct(index) {
    if (confirm("¿Eliminar producto?")) {
        localProducts.splice(index, 1);
        localStorage.setItem('morroProducts', JSON.stringify(localProducts));
        renderPescadorInventory();
        renderRestauranteMarket();
    }
}

// =========================================
// 4. MERCADO Y CARRITO (RESTAURANTE)
// =========================================
function renderRestauranteMarket() {
    const grid = document.getElementById('restaurante-market-grid');
    if(!grid) return;
    grid.innerHTML = localProducts.length === 0 ? "<p>No hay productos.</p>" : '';
    localProducts.forEach(prod => {
        grid.innerHTML += `
            <div class="product-card">
                <img src="${prod.img}" class="product-img">
                <span class="product-tag">Vendedor: ${prod.owner}</span>
                <h3>${prod.name}</h3>
                <div class="price">S/ ${prod.price.toFixed(2)} <span>x kg</span></div>
                <div class="quantity-control">
                    <input type="number" id="qty-${prod.id}" value="1" min="1" max="${prod.stock}">
                    <span>kg disponibles</span>
                </div>
                <button class="btn-submit" onclick="addToCart('${prod.name}', ${prod.price}, 'qty-${prod.id}', '${prod.img}')">Añadir al Carrito</button>
            </div>`;
    });
}

function addToCart(name, price, inputId, img) {
    const qty = parseInt(document.getElementById(inputId).value);
    if(qty <= 0) return;
    const index = cart.findIndex(item => item.name === name);
    if (index !== -1) cart[index].quantity += qty;
    else cart.push({ name, price, quantity: qty, image: img });
    localStorage.setItem('morroCart', JSON.stringify(cart));
    updateCartBadge();
    alert("🛒 Agregado al carrito");
}

function updateCartBadge() {
    const badge = document.getElementById('cart-count');
    if (badge) badge.innerText = cart.reduce((acc, item) => acc + item.quantity, 0);
}

function renderCart() {
    const container = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');
    if(!container) return;
    container.innerHTML = cart.length === 0 ? '<p>Vacío</p>' : '';
    let total = 0;
    cart.forEach((item, index) => {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        container.innerHTML += `
            <div class="cart-item">
                <img src="${item.image}" class="cart-img">
                <div class="cart-item-details"><h4>${item.name}</h4><p>${item.quantity}kg x S/ ${item.price}</p></div>
                <button class="btn-remove" onclick="removeFromCart(${index})">Quitar</button>
            </div>`;
    });
    totalEl.innerText = `S/ ${total.toFixed(2)}`;
}

function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem('morroCart', JSON.stringify(cart));
    renderCart();
    updateCartBadge();
}

// =========================================
// 5. PASARELA DE PAGO (RESTABLECIDA)
// =========================================
function processPayment() {
    if (cart.length === 0) {
        alert("El carrito está vacío.");
        return;
    }
    alert("💳 Procesando pago...");
    setTimeout(() => {
        alert("✅ ¡Pago exitoso! El pescador ha recibido tu pedido y el transporte está en camino.");
        cart = [];
        localStorage.removeItem('morroCart');
        updateCartBadge();
        showSection('home-view');
    }, 1500);
}

// =========================================
// 6. AUTENTICACIÓN Y SESIÓN
// =========================================
function checkAuth(viewId) {
    const role = localStorage.getItem('userRole');
    if (!role) { showSection('login-section'); return; }
    if (viewId === 'pescadores-view' && role !== 'pescador') { alert("Acceso solo pescadores"); return; }
    if (viewId === 'restaurantes-view' && role !== 'restaurante') { alert("Acceso solo restaurantes"); return; }
    showSection(viewId);
}

document.getElementById('register-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const role = document.getElementById('reg-role').value;
    const name = (role === 'pescador') ? document.getElementById('reg-name-pescador').value : document.getElementById('reg-name-restaurante').value;
    localStorage.setItem('userFirstName', name);
    localStorage.setItem('userRole', role);
    alert("Registro exitoso");
    showSection('login-section');
});

document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = localStorage.getItem('userFirstName');
    if (name) { updateNavbar(name); showSection('home-view'); }
});

function updateNavbar(name) {
    const authStatus = document.getElementById('auth-status');
    authStatus.innerHTML = `
        <div class="user-menu">
            <button class="btn-cart" onclick="showSection('cart-view');">🛒 <span id="cart-count" class="cart-badge">0</span></button>
            <span>Hola, <strong>${name.split(' ')[0]}</strong></span>
            <button class="btn-logout" onclick="logout()">Salir</button>
        </div>
    `;
    toggleHeroButton(true);
    updateCartBadge();
}

function logout() {
    localStorage.clear();
    location.reload();
}

function toggleRegFields() {
    const role = document.getElementById('reg-role').value;
    document.getElementById('fields-pescador').classList.toggle('hidden', role !== 'pescador');
    document.getElementById('fields-restaurante').classList.toggle('hidden', role !== 'restaurante');
}

window.addEventListener('load', () => {
    const name = localStorage.getItem('userFirstName');
    if (name) updateNavbar(name);
    else toggleHeroButton(false);
});