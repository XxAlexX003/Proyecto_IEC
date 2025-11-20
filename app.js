// ==========================
//  UTILIDADES GENERALES
// ==========================

// Convierte años/meses/días a años (año comercial de 360 días)
function tiempoDesglosadoAnios(anios, meses, dias) {
    var a = Number(anios);
    var m = Number(meses);
    var d = Number(dias);

    if (isNaN(a)) a = 0;
    if (isNaN(m)) m = 0;
    if (isNaN(d)) d = 0;

    return a + (m / 12) + (d / 360);
}

// Convierte una tasa dada en cierto periodo a tasa anual simple (decimal)
function tasaAPeriodoAnual(valorPorciento, periodo) {
    var r = Number(valorPorciento);
    if (isNaN(r) || r < 0) return NaN;

    var dec = r / 100;

    switch (periodo) {
        case "anual":      return dec;
        case "semestral":  return dec * 2;
        case "trimestral": return dec * 4;
        case "mensual":    return dec * 12;
        case "diaria360":  return dec * 360;
        case "diaria365":  return dec * 365;
        default:           return dec;
    }
}

// Formateos
function formatMoney(x) {
    return "$" + x.toFixed(2);
}

function formatPercent(i) {
    return (i * 100).toFixed(4) + " %";
}

// Habilitar / deshabilitar un input
function setDisabled(id, disabled) {
    var el = document.getElementById(id);
    if (!el) return;
    el.disabled = disabled;
    if (disabled) {
        el.value = "";
    }
}

// Para tiempo de INTERÉS SIMPLE
function setDisabledTiempoSimple(disabled) {
    ["tAnos", "tMeses", "tDias"].forEach(function (id) {
        setDisabled(id, disabled);
    });
}

// Para tiempo de DESCUENTO SIMPLE
function setDisabledTiempoDesc(disabled) {
    ["tDescAnos", "tDescMeses", "tDescDias"].forEach(function (id) {
        setDisabled(id, disabled);
    });
}

// Desglosa t (años, base 360) en años / meses / días aprox.
function desglosarTiempo360(tAnios) {
    var totalDias = tAnios * 360;
    var anios = Math.floor(totalDias / 360);
    var diasRestantes = totalDias % 360;
    var meses = Math.floor(diasRestantes / 30);
    var dias = Math.round(diasRestantes % 30);

    return {
        anios: anios,
        meses: meses,
        dias: dias,
        texto: anios + " años, " + meses + " meses, " + dias + " días (aprox.)"
    };
}

// ==========================
//  SISTEMA DE AUTENTICACIÓN MEJORADO
// ==========================

// Configuración de IndexedDB
const AUTH_CONFIG = {
    dbName: 'UserDB',
    dbVersion: 1,
    storeName: 'users',
    sessionKey: 'loggedUser'
};

// Verificar si el usuario está autenticado
function isUserAuthenticated() {
    const loggedUser = localStorage.getItem(AUTH_CONFIG.sessionKey);
    return loggedUser !== null && loggedUser.trim() !== '';
}

// Obtener el usuario actual
function getCurrentUser() {
    return localStorage.getItem(AUTH_CONFIG.sessionKey);
}

// Cerrar sesión
function logout() {
    localStorage.removeItem(AUTH_CONFIG.sessionKey);
    window.location.reload();
}

// Validar sesión con IndexedDB (opcional para mayor seguridad)
async function validateSessionWithDB() {
    const username = getCurrentUser();
    if (!username) return false;

    try {
        const db = await openAuthDB();
        const transaction = db.transaction([AUTH_CONFIG.storeName], 'readonly');
        const store = transaction.objectStore(AUTH_CONFIG.storeName);
        
        return new Promise((resolve) => {
            const request = store.get(username);
            request.onsuccess = () => {
                resolve(request.result !== undefined);
            };
            request.onerror = () => {
                resolve(false);
            };
        });
    } catch (error) {
        console.error('Error validando sesión:', error);
        return false;
    }
}

// Abrir conexión a IndexedDB (auxiliar)
function openAuthDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(AUTH_CONFIG.dbName, AUTH_CONFIG.dbVersion);
        
        request.onsuccess = (event) => {
            resolve(event.target.result);
        };
        
        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

// Mostrar/Ocultar elementos según autenticación
function toggleAuthElements() {
    const isAuthenticated = isUserAuthenticated();
    
    // Elementos de resultados (a mostrar si está autenticado)
    const resultElements = document.querySelectorAll('[data-auth-result]');
    resultElements.forEach(el => {
        if (isAuthenticated) {
            el.classList.remove('d-none');
        } else {
            el.classList.add('d-none');
        }
    });
    
    // Elementos de login requerido (a mostrar si NO está autenticado)
    const loginRequiredElements = document.querySelectorAll('[data-auth-required]');
    loginRequiredElements.forEach(el => {
        if (isAuthenticated) {
            el.classList.add('d-none');
        } else {
            el.classList.remove('d-none');
        }
    });
}

// Proteger botones de cálculo
function protectCalculationButtons() {
    const calcButtons = document.querySelectorAll('[data-calc-button]');
    
    calcButtons.forEach(button => {
        const originalClick = button.onclick;
        
        button.addEventListener('click', function(e) {
            if (!isUserAuthenticated()) {
                e.preventDefault();
                e.stopPropagation();
                
                Swal.fire({
                    icon: 'warning',
                    title: 'Autenticación requerida',
                    text: 'Debes iniciar sesión para realizar cálculos.',
                    confirmButtonText: 'Ir a Login',
                    showCancelButton: true,
                    cancelButtonText: 'Cancelar'
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.location.href = 'login.html';
                    }
                });
                
                return false;
            }
        });
    });
}

// Actualizar navbar según estado de autenticación
function updateNavbar() {
    const authLink = document.getElementById('authLink');
    if (!authLink) return;
    
    const loggedUser = getCurrentUser();
    
    if (loggedUser) {
        authLink.innerHTML = `<a class="nav-link" href="#" id="logout">Logout (${loggedUser})</a>`;
        const logoutBtn = document.getElementById('logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                Swal.fire({
                    icon: 'question',
                    title: '¿Cerrar sesión?',
                    text: '¿Estás seguro de que quieres cerrar sesión?',
                    showCancelButton: true,
                    confirmButtonText: 'Sí, cerrar sesión',
                    cancelButtonText: 'Cancelar'
                }).then((result) => {
                    if (result.isConfirmed) {
                        logout();
                    }
                });
            });
        }
    } else {
        authLink.innerHTML = `<a class="nav-link" href="login.html">Login</a>`;
    }
}

// ==========================
//  INICIALIZACIÓN
// ==========================
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar tooltips de Bootstrap
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Actualizar navbar
    updateNavbar();
    
    // Toggle de elementos según autenticación
    toggleAuthElements();
    
    // Proteger botones de cálculo
    protectCalculationButtons();
    
    console.log('Sistema de autenticación inicializado');
    console.log('Usuario autenticado:', isUserAuthenticated() ? getCurrentUser() : 'Ninguno');
});