// Constantes del sistema
const Constants = {
    // Roles de usuario
    ROLES: {
        ADMIN: 'admin',
        TRIPULACION: 'tripulacion',
        SUPERVISOR: 'supervisor',
        GERENTE_OPERACIONES: 'gerente_operaciones',
        GERENTE_FINANZAS: 'gerente_finanzas'
    },
    
    // Nombres legibles de roles
    ROLE_NAMES: {
        admin: 'Administrador del Sistema',
        tripulacion: 'Tripulación',
        supervisor: 'Supervisor de Carga',
        gerente_operaciones: 'Gerente de Operaciones',
        gerente_finanzas: 'Gerente de Finanzas'
    },
    
    // Estados de barcos
    BOAT_STATUS: {
        ACTIVE: 'Activo',
        MAINTENANCE: 'En Mantenimiento',
        INACTIVE: 'Inactivo',
        IN_VOYAGE: 'En Viaje'
    },
    
    // Tipos de barcos
    BOAT_TYPES: {
        FISHING: 'Pesquero',
        CARGO: 'Carga',
        PASSENGER: 'Pasajeros',
        TANKER: 'Tanquero',
        OTHER: 'Otros'
    },
    
    // Estados de viajes
    TRIP_STATUS: {
        PLANNED: 'Planificado',
        IN_PROGRESS: 'En Curso',
        FINISHED: 'Finalizado',
        CANCELLED: 'Cancelado'
    },
    
    // Categorías de productos
    PRODUCT_CATEGORIES: {
        PRIMARY: 'Primaria',
        MANUFACTURED: 'Manufactura'
    },
    
    // Unidades de medida
    UNITS: {
        KG: 'Kg',
        TON: 'Ton',
        LT: 'Lt',
        UNIT: 'Unidad',
        BOX: 'Caja'
    },
    
    // Tipos de movimiento de bodega
    MOVEMENT_TYPES: {
        ENTRY: 'Ingreso',
        EXIT: 'Egreso',
        TRANSFER: 'Traslado'
    },
    
    // Tipos de notificación
    NOTIFICATION_TYPES: {
        SUCCESS: 'success',
        ERROR: 'error',
        WARNING: 'warning',
        INFO: 'info'
    },
    
    // Países/Banderas comunes
    COUNTRIES: [
        'Argentina',
        'Brasil',
        'Chile',
        'Colombia',
        'Ecuador',
        'España',
        'México',
        'Panamá',
        'Perú',
        'Uruguay',
        'Venezuela',
        'Estados Unidos'
    ],
    
    // Puertos principales
    PORTS: [
        { id: 'port_001', name: 'Puerto de Buenos Aires', country: 'Argentina',      lat: -34.6037, lng:  -58.3816 },
        { id: 'port_002', name: 'Puerto de Santos',        country: 'Brasil',         lat: -23.9608, lng:  -46.3339 },
        { id: 'port_003', name: 'Puerto de Valpara\u00edso', country: 'Chile',        lat: -33.0458, lng:  -71.6197 },
        { id: 'port_004', name: 'Puerto de Cartagena',     country: 'Colombia',       lat:  10.3910, lng:  -75.4794 },
        { id: 'port_005', name: 'Puerto de Guayaquil',     country: 'Ecuador',        lat:  -2.1894, lng:  -79.8772 },
        { id: 'port_006', name: 'Puerto de Barcelona',     country: 'Espa\u00f1a',    lat:  41.3851, lng:    2.1734 },
        { id: 'port_007', name: 'Puerto de Veracruz',      country: 'M\u00e9xico',    lat:  19.2006, lng:  -96.1429 },
        { id: 'port_008', name: 'Puerto de Callao',        country: 'Per\u00fa',      lat: -12.0464, lng:  -77.1428 },
        { id: 'port_009', name: 'Puerto de Vigo',          country: 'Espa\u00f1a',    lat:  42.2406, lng:   -8.7207 },
        { id: 'port_010', name: 'Puerto de Valencia',      country: 'Espa\u00f1a',    lat:  39.4699, lng:   -0.3763 },
        { id: 'port_011', name: 'Puerto de M\u00e1laga',  country: 'Espa\u00f1a',    lat:  36.7213, lng:   -4.4214 },
        { id: 'port_012', name: 'Puerto de C\u00e1diz',   country: 'Espa\u00f1a',    lat:  36.5297, lng:   -6.2923 },
        { id: 'port_013', name: 'Puerto de Santander',     country: 'Espa\u00f1a',    lat:  43.4623, lng:   -3.8100 },
        { id: 'port_014', name: 'Puerto de Algeciras',     country: 'Espa\u00f1a',    lat:  36.1408, lng:   -5.4500 },
        { id: 'port_015', name: 'Puerto de Lisboa',        country: 'Portugal',       lat:  38.7223, lng:   -9.1393 },
        { id: 'port_016', name: 'Puerto de Funchal',       country: 'Portugal',       lat:  32.6669, lng:  -16.9241 },
        { id: 'port_017', name: 'Puerto de G\u00e9nova',  country: 'Italia',          lat:  44.4056, lng:    8.9463 },
        { id: 'port_018', name: 'Puerto de N\u00e1poles', country: 'Italia',          lat:  40.8518, lng:   14.2681 },
        { id: 'port_019', name: 'Puerto de Palermo',       country: 'Italia',         lat:  38.1157, lng:   13.3615 },
        { id: 'port_020', name: 'Puerto de Casablanca',    country: 'Marruecos',      lat:  33.5883, lng:   -7.6114 },
        { id: 'port_021', name: 'Puerto de T\u00e1nger',  country: 'Marruecos',      lat:  35.7595, lng:   -5.8340 },
        { id: 'port_022', name: 'Puerto de Southampton',   country: 'Reino Unido',    lat:  50.9097, lng:   -1.4044 },
        { id: 'port_023', name: 'Puerto de Marsella',      country: 'Francia',        lat:  43.2965, lng:    5.3698 },
        { id: 'port_024', name: 'Puerto de Paita',         country: 'Per\u00fa',      lat:  -5.0892, lng:  -81.1144 },
        { id: 'port_025', name: 'Puerto de Manta',         country: 'Ecuador',        lat:  -0.9587, lng:  -80.7089 },
        { id: 'port_026', name: 'Puerto de Tokio',         country: 'Jap\u00f3n',     lat:  35.6167, lng:  139.7667 }
    ],
    
    // Mensajes del sistema
    MESSAGES: {
        LOGIN_SUCCESS: 'Sesión iniciada correctamente',
        LOGIN_ERROR: 'Error al iniciar sesión',
        LOGOUT_SUCCESS: 'Sesión cerrada correctamente',
        REGISTER_SUCCESS: 'Registro exitoso',
        SAVE_SUCCESS: 'Datos guardados correctamente',
        SAVE_ERROR: 'Error al guardar los datos',
        DELETE_SUCCESS: 'Eliminado correctamente',
        DELETE_ERROR: 'Error al eliminar',
        UPDATE_SUCCESS: 'Actualizado correctamente',
        UPDATE_ERROR: 'Error al actualizar',
        LOAD_ERROR: 'Error al cargar los datos',
        VALIDATION_ERROR: 'Error de validación',
        PERMISSION_DENIED: 'No tienes permisos para esta acción',
        SESSION_EXPIRED: 'Tu sesión ha expirado',
        NETWORK_ERROR: 'Error de conexión'
    },
    
    // Regex patterns
    PATTERNS: {
        EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        PHONE: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
        COORDINATES: /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/
    },
    
    // Configuración de mapa
    MAP: {
        DEFAULT_CENTER: [0, 0],
        DEFAULT_ZOOM: 3,
        MIN_ZOOM: 2,
        MAX_ZOOM: 18,
        TILE_LAYER: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        ATTRIBUTION: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    },
    
    // Límites de datos
    LIMITS: {
        MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
        MAX_BOATS_PER_OWNER: 100,
        MAX_EMPLOYEES_PER_BOAT: 50,
        MAX_PRODUCTS: 1000,
        MAX_GPS_HISTORY: 1000
    }
};
