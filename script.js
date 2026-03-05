// Variable global para el carrito
let cart = JSON.parse(localStorage.getItem('morroCart')) || [];

// 1. Navegación entre secciones
function showSection(sectionId) {
    const views = ['home-view', 'login-section', 'register-section', 'pescadores-view', 'restaurantes-view', 'cart-view', 'checkout-view'];
    
    views.forEach(id => {
        document.getElementById(id).classList.add('hidden');
    });

    document.getElementById(sectionId).classList.remove('hidden');
    window.scrollTo(0, 0); 

    if(sectionId === 'cart-view') {
        renderCart();
    }
}

// 2. Control de Acceso
function checkAuth(viewId) {
    const isLogged = localStorage.getItem('userFirstName');
    if (isLogged) {
        
        if(viewId === 'pescadores-view' || viewId === 'restaurantes-view'){
            localStorage.setItem('currentCatalog', viewId);
        }
        
        showSection(viewId);
    } else {
        alert("🔒 Acceso denegado. Debes iniciar sesión para acceder.");
        showSection('login-section');
    }
}

function scrollToServices() {
    showSection('home-view');
    setTimeout(() => {
        document.getElementById('features-section').scrollIntoView({ behavior: 'smooth' });
    }, 100);
}

// =========================================
// LÓGICA DEL CARRITO DE COMPRAS
// =========================================

function addToCart(productName, price, inputId, imageUrl) {
    const quantityInput = document.getElementById(inputId);
    const quantity = parseInt(quantityInput.value);

    if (isNaN(quantity) || quantity <= 0) {
        alert("Por favor, ingresa una cantidad válida.");
        return;
    }

    const existingItemIndex = cart.findIndex(item => item.name === productName);
    
    if (existingItemIndex !== -1) {
        cart[existingItemIndex].quantity += quantity;
    } else {
        cart.push({ name: productName, price: price, quantity: quantity, image: imageUrl });
    }
    
    localStorage.setItem('morroCart', JSON.stringify(cart));
    updateCartBadge();
    
    quantityInput.value = 1;
    alert(`✅ Se añadieron ${quantity} de "${productName}" al carrito.`);
}

function updateCartBadge() {
    const countSpan = document.getElementById('cart-count');
    if (countSpan) {
        const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
        countSpan.innerText = totalItems;
    }
}

function renderCart() {
    const cartContainer = document.getElementById('cart-items');
    const totalSpan = document.getElementById('cart-total');
    
    cartContainer.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        cartContainer.innerHTML = '<p style="text-align:center; color:#64748b; padding: 20px;">Tu carrito está vacío.</p>';
    } else {
        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            const imgSrc = item.image || '/img/Icono-MORRO-SUR.png'; 

            cartContainer.innerHTML += `
                <div class="cart-item">
                    <img src="${imgSrc}" alt="${item.name}" class="cart-img">
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <p style="color: #64748b; font-size: 0.9rem;">
                            S/ ${item.price.toFixed(2)} x ${item.quantity} = 
                            <strong style="color: #2563eb; font-size: 1.1rem;">S/ ${itemTotal.toFixed(2)}</strong>
                        </p>
                    </div>
                    <button class="btn-remove" onclick="removeFromCart(${index})">Eliminar</button>
                </div>
            `;
        });
    }
    
    totalSpan.innerText = `S/ ${total.toFixed(2)}`;
}

function removeFromCart(index) {
    cart.splice(index, 1); 
    localStorage.setItem('morroCart', JSON.stringify(cart));
    updateCartBadge();
    renderCart(); 
    
    if(cart.length === 0){
        alert("El carrito está vacío. Regresando a tu catálogo...");
        const catalogToReturn = localStorage.getItem('currentCatalog') || 'home-view';
        showSection(catalogToReturn); 
    }
}

// =========================================
// LÓGICA DE CHECKOUT Y PASARELA DE PAGO
// =========================================

function proceedToCheckout() {
    if (cart.length === 0) {
        alert("Agrega productos al carrito antes de pagar.");
        return;
    }
    showSection('checkout-view');
    renderCheckoutForm();
}

function renderCheckoutForm() {
    const catalog = localStorage.getItem('currentCatalog'); 
    const container = document.getElementById('dynamic-shipping-fields');
    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    
    document.getElementById('btn-pay-total').innerText = `Procesar Pago por S/ ${total.toFixed(2)}`;

    if (catalog === 'pescadores-view') {
        container.innerHTML = `
            <label class="checkout-label">Nombre del Pescador / Comprador</label>
            <input type="text" id="chk-name" required placeholder="Ej. Juan Pérez">
            <label class="checkout-label">Documento de Identidad (DNI)</label>
            <input type="text" id="chk-doc" required placeholder="Ej. 76543210" maxlength="8" pattern="\\d{8}">
            <label class="checkout-label">Teléfono</label>
            <input type="tel" id="chk-phone" required placeholder="Ej. 987654321">
            <label class="checkout-label">Dirección de Entrega / Muelle</label>
            <input type="text" id="chk-address" required placeholder="Dirección exacta">
        `;
    } else {
        container.innerHTML = `
            <label class="checkout-label">Nombre del Restaurante</label>
            <input type="text" id="chk-name" required placeholder="Ej. Cevichería El Muelle">
            <label class="checkout-label">RUC</label>
            <input type="text" id="chk-doc" required placeholder="Ej. 20123456789" maxlength="11" pattern="\\d{11}">
            <label class="checkout-label">Teléfono de Contacto</label>
            <input type="tel" id="chk-phone" required placeholder="Ej. 987654321">
            <label class="checkout-label">Dirección del Local</label>
            <input type="text" id="chk-address" required placeholder="Dirección exacta para la entrega">
        `;
    }
}

document.getElementById('cc-number').addEventListener('input', function (e) {
    let value = e.target.value.replace(/\D/g, ''); 
    if (value.length > 16) value = value.slice(0, 16);
    e.target.value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
});

document.getElementById('cc-exp').addEventListener('input', function (e) {
    let value = e.target.value.replace(/\D/g, ''); 
    if (value.length > 4) value = value.slice(0, 4);
    
    if (value.length > 2) {
        e.target.value = value.slice(0, 2) + '/' + value.slice(2);
    } else {
        e.target.value = value;
    }
});

document.getElementById('cc-cvv').addEventListener('input', function (e) {
    e.target.value = e.target.value.replace(/\D/g, '');
});

function generarBoletaTXT(total, nombre, direccion, last4) {
    let contenido = "========================================\n";
    contenido += "       BOLETA DE COMPRA - MORRO SUR       \n";
    contenido += "========================================\n\n";
    contenido += `Fecha: ${new Date().toLocaleString()}\n`;
    contenido += `Cliente/Local: ${nombre}\n`;
    contenido += `Dirección de Entrega: ${direccion}\n`;
    contenido += `Método de Pago: Tarjeta **** ${last4}\n\n`;
    contenido += "DETALLE DEL PEDIDO:\n";
    contenido += "----------------------------------------\n";
    
    cart.forEach(item => {
        contenido += `- ${item.quantity}x ${item.name}\n  Subtotal: S/ ${(item.price * item.quantity).toFixed(2)}\n\n`;
    });
    
    contenido += "----------------------------------------\n";
    contenido += `TOTAL PAGADO: S/ ${total.toFixed(2)}\n`;
    contenido += "========================================\n";
    contenido += "   ¡Gracias por confiar en Morro Sur!   \n";

    const blob = new Blob([contenido], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = `Boleta_MorroSur_${Date.now()}.txt`;
    enlace.click();
    URL.revokeObjectURL(url);
}

document.getElementById('checkout-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const btn = document.getElementById('btn-pay-total');
    btn.innerText = "Procesando pago...";
    btn.disabled = true; 
    btn.style.background = "#94a3b8"; 

    const cardNumber = document.getElementById('cc-number').value.replace(/\s/g, ''); 
    const last4 = cardNumber.slice(-4); 
    const address = document.getElementById('chk-address').value;
    const clientName = document.getElementById('chk-name').value;
    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    setTimeout(() => {
        generarBoletaTXT(total, clientName, address, last4);
        
        alert(`✅ ¡Pago Aprobado!\n\nTu pedido será enviado a: ${address}.\nSe ha descargado tu boleta electrónica.`);
        
        cart = []; 
        localStorage.removeItem('morroCart'); 
        updateCartBadge();
        
        document.getElementById('checkout-form').reset();
        btn.disabled = false;
        btn.style.background = "#2563eb";
        
        showSection('home-view');
    }, 2000); 
});

// =========================================
// LÓGICA DE USUARIOS Y REGISTRO
// =========================================

function toggleRegFields() {
    const role = document.getElementById('reg-role').value;
    
    const divPescador = document.getElementById('fields-pescador');
    const divRestaurante = document.getElementById('fields-restaurante');

    divPescador.classList.add('hidden');
    document.getElementById('reg-name-pescador').required = false;
    document.getElementById('reg-dni').required = false;

    divRestaurante.classList.add('hidden');
    document.getElementById('reg-name-restaurante').required = false;
    document.getElementById('reg-ruc').required = false;

    if (role === 'pescador') {
        divPescador.classList.remove('hidden');
        document.getElementById('reg-name-pescador').required = true;
        document.getElementById('reg-dni').required = true;
    } else if (role === 'restaurante') {
        divRestaurante.classList.remove('hidden');
        document.getElementById('reg-name-restaurante').required = true;
        document.getElementById('reg-ruc').required = true;
    }
}

document.getElementById('register-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const role = document.getElementById('reg-role').value; 
    let fullName = "";

    if (role === 'pescador') {
        fullName = document.getElementById('reg-name-pescador').value;
    } else {
        fullName = document.getElementById('reg-name-restaurante').value;
    }

    const firstName = fullName.split(' ')[0]; 

    localStorage.setItem('userFirstName', firstName);
    localStorage.setItem('userRole', role); 

    alert("¡Registro exitoso! Por favor inicia sesión.");
    
    e.target.reset();
    toggleRegFields(); 

    showSection('login-section');
});

document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const storedName = localStorage.getItem('userFirstName');
    if (storedName) {
        updateNavbar(storedName);
        alert(`¡Hola de nuevo, ${storedName}!`);
        showSection('home-view');
    } else {
        alert("Error: No se encontró registro.");
    }
});

// ACTUALIZADO: Ocultar botón "Comenzar Ahora" al estar logueado
function updateNavbar(name) {
    const authContainer = document.getElementById('auth-status');
    authContainer.innerHTML = `
        <div class="user-menu">
            <button class="btn-cart" onclick="showSection('cart-view')" title="Ver Carrito">
                🛒 <span id="cart-count" class="cart-badge">0</span>
            </button>
            <span class="user-greeting">Hola, <strong>${name}</strong></span>
            <button class="btn-logout" onclick="logout()">Cerrar Sesión</button>
        </div>
    `;
    updateCartBadge(); 

    // Ocultamos el botón del centro de la pantalla
    const ctaBtn = document.getElementById('hero-cta-btn');
    if (ctaBtn) {
        ctaBtn.classList.add('hidden');
    }
}

function logout() {
    localStorage.removeItem('userFirstName');
    localStorage.removeItem('userRole'); 
    localStorage.removeItem('morroCart'); 
    localStorage.removeItem('currentCatalog'); 
    location.reload(); // Al recargar la página limpia todo y el botón vuelve a aparecer
}

window.addEventListener('load', () => {
    const storedName = localStorage.getItem('userFirstName');
    if (storedName) {
        updateNavbar(storedName);
    }
});