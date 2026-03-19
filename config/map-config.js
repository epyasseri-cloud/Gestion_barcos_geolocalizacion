// Configuración del Mapa
const MapConfig = {
    // Centro inicial del mapa
    defaultCenter: [0, 0],
    defaultZoom: 3,
    
    // Límites de zoom
    minZoom: 2,
    maxZoom: 18,
    
    // Tile layer de OpenStreetMap
    tileLayer: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    
    // Colores por estado de barco
    boatStatusColors: {
        'Activo': '#28a745',
        'En Mantenimiento': '#ffc107',
        'Inactivo': '#dc3545',
        'En Viaje': '#007bff'
    },
    
    // Iconos de barcos
    boatIcon: 'icon-boat',
    portIcon: 'icon-port',
    
    // Configuración de actualización automática
    autoUpdate: {
        enabled: true,
        interval: 5000 // 5 segundos
    }
};
