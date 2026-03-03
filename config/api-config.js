// Configuración de API
const ApiConfig = {
    // Base URL de la API (cambiar en producción)
    baseUrl: 'http://localhost:3000/api',
    
    // Timeout para peticiones (en milisegundos)
    timeout: 30000,
    
    // Endpoints
    endpoints: {
        // Autenticación
        auth: {
            login: '/auth/login',
            register: '/auth/register',
            logout: '/auth/logout',
            refresh: '/auth/refresh'
        },
        
        // Dueños
        owners: {
            list: '/owners',
            create: '/owners',
            get: '/owners/:id',
            update: '/owners/:id',
            delete: '/owners/:id'
        },
        
        // Barcos
        boats: {
            list: '/boats',
            create: '/boats',
            get: '/boats/:id',
            update: '/boats/:id',
            delete: '/boats/:id',
            byOwner: '/boats/owner/:ownerId'
        },
        
        // Empleados
        employees: {
            list: '/employees',
            create: '/employees',
            get: '/employees/:id',
            update: '/employees/:id',
            delete: '/employees/:id',
            byBoat: '/employees/boat/:boatId'
        },
        
        // Productos
        products: {
            list: '/products',
            create: '/products',
            get: '/products/:id',
            update: '/products/:id',
            delete: '/products/:id',
            byCategory: '/products/category/:category'
        },
        
        // Viajes
        trips: {
            list: '/trips',
            create: '/trips',
            get: '/trips/:id',
            update: '/trips/:id',
            delete: '/trips/:id',
            start: '/trips/:id/start',
            finish: '/trips/:id/finish',
            active: '/trips/active',
            byBoat: '/trips/boat/:boatId'
        },
        
        // Bodega
        warehouse: {
            movements: '/warehouse/movements',
            create: '/warehouse/movements',
            inventory: '/warehouse/inventory/:boatId',
            byProduct: '/warehouse/product/:productId'
        },
        
        // GPS
        gps: {
            positions: '/gps/positions',
            create: '/gps/positions',
            latest: '/gps/positions/latest/:boatId',
            track: '/gps/track/:boatId',
            nearest: '/gps/nearest'
        },
        
        // Reportes
        reports: {
            availability: '/reports/availability',
            statistics: '/reports/statistics',
            tripsByCountry: '/reports/trips/country'
        }
    },
    
    // Headers por defecto
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    
    // Modo de desarrollo (usar datos mock)
    useMockData: true,
    
    // Reintentos en caso de error
    retry: {
        enabled: true,
        maxAttempts: 3,
        delay: 1000
    }
};
