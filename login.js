// ==========================
//  MANEJO DE LOGIN Y REGISTRO
// ==========================

// IndexedDB setup
const dbName = 'UserDB';
const dbVersion = 1;
let db;

const openDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, dbVersion);
        
        request.onupgradeneeded = (event) => {
            db = event.target.result;
            if (!db.objectStoreNames.contains('users')) {
                db.createObjectStore('users', { keyPath: 'username' });
            }
            console.log('Base de datos creada/actualizada correctamente');
        };
        
        request.onsuccess = (event) => {
            db = event.target.result;
            console.log('DB abierta correctamente');
            resolve(db);
        };
        
        request.onerror = (event) => {
            console.error('Error al abrir DB:', event.target.error);
            reject(event.target.error);
        };
    });
};

// ==========================
//  LOGIN
// ==========================
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');
    const submitBtn = e.target.querySelector('button[type="submit"]');

    // Ocultar error previo
    errorDiv.classList.add('d-none');

    // Validación básica
    if (!username || !password) {
        errorDiv.textContent = 'Usuario y contraseña son requeridos.';
        errorDiv.classList.remove('d-none');
        return;
    }

    // Deshabilitar botón mientras procesa
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Ingresando...';

    try {
        await openDB();
        const transaction = db.transaction(['users'], 'readonly');
        const store = transaction.objectStore('users');
        const request = store.get(username);

        request.onsuccess = () => {
            console.log('Resultado de búsqueda:', request.result);
            
            if (request.result && request.result.password === password) {
                // Login exitoso
                localStorage.setItem('loggedUser', username);
                
                Swal.fire({
                    icon: 'success',
                    title: '¡Bienvenido!',
                    text: `Hola ${username}, inicio de sesión exitoso.`,
                    timer: 1500,
                    showConfirmButton: false
                }).then(() => {
                    window.location.href = 'index.html';
                });
            } else {
                // Credenciales incorrectas
                errorDiv.textContent = 'Usuario o contraseña incorrectos.';
                errorDiv.classList.remove('d-none');
                
                // Rehabilitar botón
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
                
                // Limpiar contraseña por seguridad
                document.getElementById('loginPassword').value = '';
            }
        };
        
        request.onerror = () => {
            console.error('Error al obtener usuario');
            errorDiv.textContent = 'Error al verificar usuario. Intenta de nuevo.';
            errorDiv.classList.remove('d-none');
            
            // Rehabilitar botón
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        };
        
    } catch (error) {
        console.error('Error en login:', error);
        errorDiv.textContent = 'Error interno. Intenta de nuevo.';
        errorDiv.classList.remove('d-none');
        
        // Rehabilitar botón
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
    }
});

// ==========================
//  REGISTRO
// ==========================
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('registerUsername').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    const errorDiv = document.getElementById('registerError');
    const successDiv = document.getElementById('registerSuccess');
    const submitBtn = e.target.querySelector('button[type="submit"]');

    // Ocultar mensajes previos
    errorDiv.classList.add('d-none');
    successDiv.classList.add('d-none');

    // Validaciones
    if (!username || !password || !confirmPassword) {
        errorDiv.textContent = 'Todos los campos son requeridos.';
        errorDiv.classList.remove('d-none');
        return;
    }
    
    if (username.length < 3) {
        errorDiv.textContent = 'El usuario debe tener al menos 3 caracteres.';
        errorDiv.classList.remove('d-none');
        return;
    }
    
    if (password.length < 6) {
        errorDiv.textContent = 'La contraseña debe tener al menos 6 caracteres.';
        errorDiv.classList.remove('d-none');
        return;
    }
    
    if (password !== confirmPassword) {
        errorDiv.textContent = 'Las contraseñas no coinciden.';
        errorDiv.classList.remove('d-none');
        return;
    }

    // Validación de seguridad de contraseña (opcional pero recomendado)
    const hasNumber = /\d/.test(password);
    const hasLetter = /[a-zA-Z]/.test(password);
    
    if (!hasNumber || !hasLetter) {
        errorDiv.textContent = 'La contraseña debe contener letras y números.';
        errorDiv.classList.remove('d-none');
        return;
    }

    // Deshabilitar botón mientras procesa
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Registrando...';

    try {
        await openDB();
        const transaction = db.transaction(['users'], 'readwrite');
        const store = transaction.objectStore('users');
        const request = store.add({ username, password });

        request.onsuccess = () => {
            console.log('Usuario registrado exitosamente:', username);
            
            Swal.fire({
                icon: 'success',
                title: '¡Registro exitoso!',
                text: `Usuario ${username} registrado correctamente. Ahora puedes iniciar sesión.`,
                confirmButtonText: 'Entendido'
            });
            
            // Limpiar formulario
            document.getElementById('registerForm').reset();
            
            // Rehabilitar botón
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        };
        
        request.onerror = (event) => {
            console.error('Error en registro:', event.target.error);
            
            if (event.target.error.name === 'ConstraintError') {
                errorDiv.textContent = 'El usuario ya existe. Por favor elige otro nombre.';
            } else {
                errorDiv.textContent = 'Error al registrar usuario. Intenta de nuevo.';
            }
            errorDiv.classList.remove('d-none');
            
            // Rehabilitar botón
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        };
        
    } catch (error) {
        console.error('Error en registro:', error);
        errorDiv.textContent = 'Error interno. Intenta de nuevo.';
        errorDiv.classList.remove('d-none');
        
        // Rehabilitar botón
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
    }
});

// ==========================
//  VERIFICACIÓN DE SESIÓN EXISTENTE
// ==========================
document.addEventListener('DOMContentLoaded', () => {
    const loggedUser = localStorage.getItem('loggedUser');
    
    if (loggedUser) {
        // Si ya hay una sesión activa, redirigir al index
        Swal.fire({
            icon: 'info',
            title: 'Ya tienes una sesión activa',
            text: `Estás conectado como ${loggedUser}`,
            timer: 1500,
            showConfirmButton: false
        }).then(() => {
            window.location.href = 'index.html';
        });
    }
    
    // Agregar efecto de focus a los campos
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            if (this.value === '') {
                this.parentElement.classList.remove('focused');
            }
        });
    });
});

// ==========================
//  MOSTRAR/OCULTAR CONTRASEÑA
// ==========================
function togglePasswordVisibility(inputId, iconElement) {
    const input = document.getElementById(inputId);
    const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
    input.setAttribute('type', type);
    
    // Cambiar icono (si usas FontAwesome o similar)
    if (iconElement) {
        iconElement.classList.toggle('fa-eye');
        iconElement.classList.toggle('fa-eye-slash');
    }
}

// ==========================
//  VALIDACIÓN EN TIEMPO REAL
// ==========================
document.getElementById('registerPassword')?.addEventListener('input', function() {
    const password = this.value;
    const feedback = document.getElementById('passwordFeedback');
    
    if (!feedback) return;
    
    let strength = 0;
    let messages = [];
    
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    if (password.length === 0) {
        feedback.textContent = '';
        feedback.className = '';
    } else if (strength < 2) {
        feedback.textContent = 'Contraseña débil';
        feedback.className = 'text-danger small';
    } else if (strength < 4) {
        feedback.textContent = 'Contraseña media';
        feedback.className = 'text-warning small';
    } else {
        feedback.textContent = 'Contraseña fuerte';
        feedback.className = 'text-success small';
    }
});

// Verificar coincidencia de contraseñas en tiempo real
document.getElementById('registerConfirmPassword')?.addEventListener('input', function() {
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = this.value;
    const feedback = document.getElementById('confirmPasswordFeedback');
    
    if (!feedback) return;
    
    if (confirmPassword.length === 0) {
        feedback.textContent = '';
        feedback.className = '';
    } else if (password === confirmPassword) {
        feedback.textContent = 'Las contraseñas coinciden';
        feedback.className = 'text-success small';
    } else {
        feedback.textContent = 'Las contraseñas no coinciden';
        feedback.className = 'text-danger small';
    }
});