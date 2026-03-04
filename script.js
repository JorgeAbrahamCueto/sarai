// 1. Navegación entre secciones
function showSection(sectionId) {
    const views = ['home-view', 'login-section', 'register-section'];
    
    views.forEach(id => {
        document.getElementById(id).classList.add('hidden');
    });

    document.getElementById(sectionId).classList.remove('hidden');
    window.scrollTo(0, 0); // Regresa arriba al cambiar de vista
}

// 2. Scroll suave hacia servicios
function scrollToServices() {
    showSection('home-view');
    setTimeout(() => {
        document.getElementById('features-section').scrollIntoView({ behavior: 'smooth' });
    }, 100);
}

// 3. Lógica de Registro
document.getElementById('register-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const fullName = document.getElementById('reg-name').value;
    const firstName = fullName.split(' ')[0]; // Extrae el primer nombre
    
    // Simula guardado en base de datos (localStorage)
    localStorage.setItem('userFirstName', firstName);
    
    alert("¡Registro exitoso! Por favor inicia sesión.");
    showSection('login-section');
});

// 4. Lógica de Login
document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const storedName = localStorage.getItem('userFirstName');
    
    if (storedName) {
        updateNavbar(storedName);
        alert(`¡Hola de nuevo, ${storedName}!`);
        showSection('home-view');
    } else {
        alert("Error: No se encontró registro. Por favor regístrate primero.");
    }
});

// 5. Actualizar Barra de Navegación
function updateNavbar(name) {
    const authContainer = document.getElementById('auth-status');
    authContainer.innerHTML = `
        <div class="user-menu">
            <span class="user-greeting">Hola, <strong>${name}</strong></span>
            <button class="btn-logout" onclick="logout()">Cerrar Sesión</button>
        </div>
    `;
}

// 6. Cerrar Sesión
function logout() {
    localStorage.removeItem('userFirstName');
    location.reload(); // Recarga la página para resetear el estado
}

// 7. Persistencia al recargar (Verifica si ya estaba logueado)
window.addEventListener('load', () => {
    const storedName = localStorage.getItem('userFirstName');
    if (storedName) {
        updateNavbar(storedName);
    }
});