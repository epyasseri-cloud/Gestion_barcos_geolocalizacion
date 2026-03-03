// Configuración general del sistema
const Config = {
    // Información de la aplicación
    app: {
        name: 'Sistema de Geolocalización de Barcos',
        version: '1.0.0',
        author: 'Sistema',
        description: 'Sistema de gestión y geolocalización de embarcaciones marítimas'
    },
    
    // Configuración de sesiones
    session: {
        duration: 24 * 60 * 60 * 1000, // 24 horas en milisegundos
        autoRenew: true
    },
    
    // Configuración de almacenamiento
    storage: {
        prefix: 'boat_system_',
        keys: {
            users: 'users',
            session: 'session',
            notifications: 'notifications',
            owners: 'owners',
            boats: 'boats',
            employees: 'employees',
            products: 'products',
            trips: 'trips',
            warehouse: 'warehouse',
            gps: 'gps_positions'
        }
    },
    
    // Configuración de paginación
    pagination: {
        defaultPageSize: 10,
        maxPageSize: 100,
        pageSizeOptions: [5, 10, 25, 50, 100]
    },
    
    // Configuración de validación
    validation: {
        minPasswordLength: 6,
        maxLoginAttempts: 5,
        lockoutDuration: 15 * 60 * 1000 // 15 minutos
    },
    
    // Configuración de notificaciones
    notifications: {
        defaultDuration: 3000,
        errorDuration: 5000,
        warningDuration: 4000,
        successDuration: 3000,
        maxHistory: 50
    },
    
    // Formatos de fecha
    dateFormats: {
        short: 'DD/MM/YYYY',
        long: 'DD/MM/YYYY HH:mm:ss',
        time: 'HH:mm:ss'
    },
    
    // Configuración de barcos
    boats: {
        types: ['Pesquero', 'Carga', 'Pasajeros', 'Tanquero', 'Otros'],
        statuses: ['Activo', 'En Mantenimiento', 'Inactivo', 'En Viaje']
    },
    
    // Configuración de productos
    products: {
        categories: ['Primaria', 'Manufactura'],
        units: ['Kg', 'Ton', 'Lt', 'Unidad', 'Caja']
    },
    
    // Configuración de viajes
    trips: {
        statuses: ['Planificado', 'En Curso', 'Finalizado', 'Cancelado']
    }
};
