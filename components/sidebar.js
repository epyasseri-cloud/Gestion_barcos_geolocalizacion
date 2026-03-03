// Componente Sidebar
const Sidebar = {
    getMenuByRole: function(role) {
        const menus = {
            admin: [
                { id: 'dashboard', label: 'Dashboard', url: 'dashboard.html' },
                { id: 'owners', label: 'Dueños', url: 'owners-list.html' },
                { id: 'boats', label: 'Barcos', url: 'boats-list.html' },
                { id: 'employees', label: 'Empleados', url: 'employees-list.html' },
                { id: 'products', label: 'Productos', url: 'products-list.html' },
                { id: 'trips', label: 'Viajes', url: 'trips-list.html' },
                { id: 'map', label: 'Mapa GPS', url: 'map-view.html' },
                { id: 'reports', label: 'Reportes', url: 'reports.html' }
            ],
            tripulacion: [
                { id: 'trips', label: 'Mis Viajes', url: 'trips-list.html' },
                { id: 'map', label: 'Mapa GPS', url: 'map-view.html' },
                { id: 'boat', label: 'Mi Barco', url: 'boat-detail.html' }
            ],
            supervisor: [
                { id: 'products', label: 'Productos', url: 'products-list.html' },
                { id: 'warehouse', label: 'Bodega', url: 'warehouse-movements.html' },
                { id: 'inventory', label: 'Inventario', url: 'inventory-view.html' }
            ],
            gerente_operaciones: [
                { id: 'map', label: 'Mapa GPS', url: 'map-view.html' },
                { id: 'availability', label: 'Disponibilidad', url: 'product-availability.html' },
                { id: 'nearest', label: 'Localizar Barcos', url: 'nearest-boat-finder.html' },
                { id: 'statistics', label: 'Estadísticas', url: 'trip-statistics.html' }
            ],
            gerente_finanzas: [
                { id: 'statistics', label: 'Estadísticas', url: 'trip-statistics.html' },
                { id: 'reports', label: 'Reportes', url: 'reports.html' }
            ]
        };
        
        return menus[role] || [];
    },
    
    render: function(containerId) {
        const user = Session.getCurrentUser();
        
        if (!user) {
            return '';
        }
        
        const menuItems = this.getMenuByRole(user.role);
        
        let sidebarHTML = '<aside><h3>Menú</h3><ul>';
        
        if (menuItems.length === 0) {
            sidebarHTML += '<li>No hay opciones disponibles</li>';
        } else {
            menuItems.forEach(item => {
                sidebarHTML += `<li><a href="${item.url}">${item.label}</a></li>`;
            });
        }
        
        sidebarHTML += '</ul></aside>';
        
        if (containerId) {
            document.getElementById(containerId).innerHTML = sidebarHTML;
        }
        
        return sidebarHTML;
    }
};
