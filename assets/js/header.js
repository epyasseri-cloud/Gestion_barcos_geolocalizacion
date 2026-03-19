/**
 * Header y Navbar - Componente Reutilizable
 * Gestiona la renderización del header y navegación en todas las páginas
 */

const AppHeader = {
    /**
     * Renderizar header con navbar
     * @param {string} containerId - ID del elemento donde insertar el header
     * @param {string} currentPage - Página actual para marcar como activa
     * @param {object} userInfo - Información del usuario {name, role}
     */
    render: function(containerId = 'app-header-container', currentPage = '', userInfo = null) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container con ID '${containerId}' no encontrado`);
            return;
        }

        const navItems = this.getNavItems();
        const userName = userInfo?.name || 'Usuario';
        const userRole = userInfo?.role || 'Sistema';

        let navLinksHtml = navItems.map(item => {
            const isActive = currentPage.toLowerCase() === item.id.toLowerCase() ? 'active' : '';
            return `<li><a href="${item.href}" class="${isActive}">${item.label}</a></li>`;
        }).join('');

        const headerHtml = `
            <header class="app-header">
                <div class="app-header-container">
                    <a href="dashboard.html" class="app-logo">
                        <span></span>
                        <span>GeoBarcos</span>
                    </a>
                    
                    <button class="nav-toggle" id="navToggle" aria-label="Toggle menu">
                        <span>☰</span>
                    </button>
                    
                    <ul class="app-navbar" id="appNavbar">
                        ${navLinksHtml}
                    </ul>
                    
                    <div class="user-menu">
                        <div class="user-info">
                            <span class="user-name">${userName}</span>
                            <span class="user-role">${userRole}</span>
                        </div>
                        <a href="#" class="logout-btn" onclick="AppHeader.logout(event)">Cerrar Sesión</a>
                    </div>
                </div>
            </header>
        `;

        container.innerHTML = headerHtml;
        this.setupToggleMenu();
        this.setActivePage(currentPage);
    },

    /**
     * Obtener ítems de navegación principales
     */
    getNavItems: function() {
        return [
            { id: 'dashboard', label: 'Dashboard', href: 'dashboard.html' },
            { id: 'map', label: 'Mapa GPS', href: 'map-view.html' },
            { id: 'boats', label: 'Barcos', href: 'boats-list.html' },
            { id: 'warehouse', label: 'Bodega', href: 'warehouse-list.html' },
            { id: 'employees', label: 'Empleados', href: 'employees-list.html' },
            { id: 'products', label: 'Productos', href: 'products-list.html' },
            { id: 'owners', label: 'Propietarios', href: 'owners-list.html' },
            { id: 'trips', label: 'Viajes', href: 'trips-list.html' }
        ];
    },

    /**
     * Configurar toggle de menú en móvil
     */
    setupToggleMenu: function() {
        const toggle = document.getElementById('navToggle');
        const navbar = document.getElementById('appNavbar');

        if (toggle && navbar) {
            toggle.addEventListener('click', () => {
                navbar.classList.toggle('active');
                toggle.textContent = navbar.classList.contains('active') ? '✕' : '☰';
            });

            // Cerrar menú al hacer click en un enlace
            navbar.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    navbar.classList.remove('active');
                    toggle.textContent = '☰';
                });
            });
        }
    },

    /**
     * Marcar página actual como activa
     */
    setActivePage: function(currentPage) {
        if (!currentPage) return;

        const navbar = document.getElementById('appNavbar');
        if (!navbar) return;

        navbar.querySelectorAll('a').forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href.includes(currentPage.toLowerCase())) {
                link.classList.add('active');
            }
        });
    },

    /**
     * Renderizar breadcrumb
     * @param {array} breadcrumbs - Array con {label, href}
     * @param {string} containerId - ID del contenedor breadcrumb
     */
    renderBreadcrumb: function(breadcrumbs = [], containerId = 'breadcrumb-container') {
        const container = document.getElementById(containerId);
        if (!container || !Array.isArray(breadcrumbs) || breadcrumbs.length === 0) {
            return;
        }

        const breadcrumbHtml = breadcrumbs.map((item, index) => {
            if (index === breadcrumbs.length - 1) {
                // Último elemento (actual, sin enlace)
                return `<span>${item.label}</span>`;
            }
            return `<a href="${item.href}">${item.label}</a><span class="breadcrumb-separator">/</span>`;
        }).join('');

        container.innerHTML = `<nav class="app-breadcrumb">${breadcrumbHtml}</nav>`;
    },

    /**
     * Manejo de logout
     */
    logout: function(event) {
        event.preventDefault();
        
        if (window.Session && typeof Session.logout === 'function') {
            Session.logout();
        } else {
            // Fallback si Session no está disponible
            localStorage.clear();
            window.location.href = '../auth/views/login.html';
        }
    },

    /**
     * Actualizar información del usuario en el header
     */
    updateUserInfo: function(name, role) {
        const userName = document.querySelector('.user-name');
        const userRole = document.querySelector('.user-role');

        if (userName) userName.textContent = name;
        if (userRole) userRole.textContent = role;
    }
};

/**
 * Auto-inicialización del header al cargar la página
 */
function initAutoHeader() {
    // Buscar contenedor existente
    let headerContainer = document.getElementById('app-header-container');
    
    // Si no existe, crearlo al inicio del body
    if (!headerContainer && document.body) {
        headerContainer = document.createElement('div');
        headerContainer.id = 'app-header-container';
        document.body.insertBefore(headerContainer, document.body.firstChild);
    }
    
    if (headerContainer) {
        // Extraer nombre de página del archivo actual
        let currentPage = window.location.pathname.split('/').pop().replace('.html', '');
        
        // Intentar obtener info del usuario
        let userInfo = null;
        if (typeof Session !== 'undefined' && Session.getUser) {
            userInfo = Session.getUser();
        }
        
        // Renderizar header
        AppHeader.render('app-header-container', currentPage, userInfo);
    }
}

// Auto-inicializar cuando el DOM esté listo
if (typeof window !== 'undefined') {
    window.AppHeader = AppHeader;
    
    // Si el script se carga después que el DOM está listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAutoHeader);
    } else {
        initAutoHeader();
    }
}
