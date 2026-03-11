// Servicio de Barcos - CRUD Completo
const BoatService = {
    storageKey: 'boat_system_boats',
    
    // Tipos de barcos
    BOAT_TYPES: ['Pesquero', 'Carga', 'Pasajeros', 'Tanquero', 'Portacontenedores', 'Turístico'],
    
    // Estados de barcos
    BOAT_STATES: ['Activo', 'En Viaje', 'En Mantenimiento', 'En Puerto', 'Inactivo'],

    // Coordenadas por defecto para asegurar visualización en mapa
    // Posiciones oceánicas sincronizadas con gps-service.js
    DEFAULT_POSITIONS: {
        B001: { lat: 39.5,  lng: -12.0,  velocidad: 15, estado: 'En Viaje' },
        B002: { lat: 28.0,  lng: -130.0, velocidad: 12, estado: 'Activo' },
        B003: { lat: 37.5,  lng: 11.5,   velocidad: 8,  estado: 'En Mantenimiento' },
        B004: { lat: -35.0, lng: -50.0,  velocidad: 18, estado: 'En Viaje' },
        B005: { lat: -24.0, lng: -40.0,  velocidad: 10, estado: 'Activo' },
        B006: { lat: -42.0, lng: -58.0,  velocidad: 14, estado: 'En Viaje' },
        B007: { lat: -30.0, lng: -44.0,  velocidad: 11, estado: 'Activo' }
    },

    hasValidPosition: function(boat) {
        const lat = Number(boat?.lat);
        const lng = Number(boat?.lng);
        return Number.isFinite(lat) && Number.isFinite(lng);
    },

    ensurePositions: function(boats) {
        if (!Array.isArray(boats)) return [];

        let changed = false;
        const normalized = boats.map(boat => {
            if (this.hasValidPosition(boat)) {
                return {
                    ...boat,
                    lat: Number(boat.lat),
                    lng: Number(boat.lng)
                };
            }

            const defaults = this.DEFAULT_POSITIONS[boat.id];
            if (!defaults) return boat;

            changed = true;
            return {
                ...boat,
                lat: defaults.lat,
                lng: defaults.lng,
                velocidad: Number.isFinite(Number(boat.velocidad)) ? Number(boat.velocidad) : defaults.velocidad,
                estado: boat.estado || boat.estadoActual || defaults.estado
            };
        });

        return { boats: normalized, changed };
    },
    
    // Inicializar con datos mock
    init: function() {
        if (!localStorage.getItem(this.storageKey)) {
            this.initMockData();

            fetch('../data/boats-mock.json')
                .then(response => response.json())
                .then(data => {
                    if (Array.isArray(data) && data.length > 0) {
                        const currentBoats = this.getAll();
                        const currentById = {};

                        currentBoats.forEach(boat => {
                            currentById[boat.id] = boat;
                        });

                        const merged = data.map(boat => {
                            const current = currentById[boat.id];
                            if (!current) return boat;

                            return {
                                ...current,
                                ...boat,
                                lat: this.hasValidPosition(boat) ? Number(boat.lat) : current.lat,
                                lng: this.hasValidPosition(boat) ? Number(boat.lng) : current.lng,
                                velocidad: Number.isFinite(Number(boat.velocidad)) ? Number(boat.velocidad) : current.velocidad,
                                estado: boat.estado || boat.estadoActual || current.estado
                            };
                        });

                        const { boats: boatsWithPositions } = this.ensurePositions(merged);
                        localStorage.setItem(this.storageKey, JSON.stringify(boatsWithPositions));
                    }
                })
                .catch(error => {
                    console.error('Error loading mock boats:', error);
                });
        }
    },
    
    // Inicializar datos mock directamente
    initMockData: function() {
        const existingData = localStorage.getItem(this.storageKey);
        if (!existingData) {
            const mockBoats = [
                {
                    id: 'B001',
                    nombre: 'Atlántico Explorer',
                    matricula: 'MAT-001',
                    bandera: 'España',
                    tipo: 'Pesquero',
                    capacidadToneladas: 500,
                    dueñoId: 'OWN001',
                    estado: 'En Viaje',
                    lat: 40.4168,
                    lng: -3.7038,
                    velocidad: 15,
                    anoFabricacion: 2018,
                    fechaRegistro: '2025-01-20T10:00:00Z'
                },
                {
                    id: 'B002',
                    nombre: 'Pacífico Star',
                    matricula: 'MAT-002',
                    bandera: 'México',
                    tipo: 'Carga',
                    capacidadToneladas: 1200,
                    dueñoId: 'OWN003',
                    estado: 'Activo',
                    lat: 19.4326,
                    lng: -99.1332,
                    velocidad: 12,
                    anoFabricacion: 2020,
                    fechaRegistro: '2025-02-10T14:30:00Z'
                },
                {
                    id: 'B003',
                    nombre: 'Mediterráneo Queen',
                    matricula: 'MAT-003',
                    bandera: 'España',
                    tipo: 'Pasajeros',
                    capacidadToneladas: 800,
                    dueñoId: 'OWN001',
                    estado: 'En Mantenimiento',
                    lat: 41.9028,
                    lng: 12.4964,
                    velocidad: 8,
                    anoFabricacion: 2015,
                    fechaRegistro: '2025-03-15T09:00:00Z'
                },
                {
                    id: 'B004',
                    nombre: 'Austral Voyager',
                    matricula: 'MAT-004',
                    bandera: 'Argentina',
                    tipo: 'Tanquero',
                    capacidadToneladas: 2000,
                    dueñoId: 'OWN002',
                    estado: 'En Viaje',
                    lat: -34.6037,
                    lng: -58.3816,
                    velocidad: 18,
                    fechaRegistro: '2025-04-01T11:45:00Z'
                },
                {
                    id: 'B005',
                    nombre: 'Santos Navigator',
                    matricula: 'MAT-005',
                    bandera: 'Brasil',
                    tipo: 'Carga',
                    capacidadToneladas: 1500,
                    dueñoId: 'OWN002',
                    estado: 'Activo',
                    lat: -23.5505,
                    lng: -46.6333,
                    velocidad: 10,
                    fechaRegistro: '2025-05-20T16:20:00Z'
                }
            ];
            
            this.saveAll(mockBoats);
        }
    },
    
    // Obtener todos los barcos
    getAll: function() {
        const data = localStorage.getItem(this.storageKey);

        if (!data) {
            this.initMockData();
            const initializedData = localStorage.getItem(this.storageKey);
            return initializedData ? JSON.parse(initializedData) : [];
        }

        try {
            const boats = JSON.parse(data);
            if (!Array.isArray(boats)) {
                this.initMockData();
                const initializedData = localStorage.getItem(this.storageKey);
                return initializedData ? JSON.parse(initializedData) : [];
            }

            const { boats: normalizedBoats, changed } = this.ensurePositions(boats);
            if (changed) {
                this.saveAll(normalizedBoats);
            }

            return normalizedBoats;
        } catch (error) {
            console.error('Error parsing boats data:', error);
            this.initMockData();
            const initializedData = localStorage.getItem(this.storageKey);
            return initializedData ? JSON.parse(initializedData) : [];
        }
    },
    
    // Guardar todos los barcos
    saveAll: function(boats) {
        localStorage.setItem(this.storageKey, JSON.stringify(boats));
    },
    
    // Obtener barco por ID
    getById: function(id) {
        const boats = this.getAll();
        return boats.find(boat => boat.id === id) || null;
    },
    
    // Crear nuevo barco
    create: function(boatData) {
        const boats = this.getAll();
        
        if (!boatData.nombre || !boatData.matricula || !boatData.bandera) {
            return { success: false, message: 'Nombre, matrícula y bandera son obligatorios' };
        }
        
        if (boats.some(boat => boat.matricula === boatData.matricula)) {
            return { success: false, message: 'Ya existe un barco con esa matrícula' };
        }
        
        const newId = Helpers.generateId('B', boats);
        
        const newBoat = {
            id: newId,
            nombre: boatData.nombre,
            matricula: boatData.matricula,
            bandera: boatData.bandera,
            tipo: boatData.tipo || 'Carga',
            capacidadToneladas: parseFloat(boatData.capacidadToneladas) || 0,
            dueñoId: boatData.dueñoId || null,
            estado: boatData.estado || 'Activo',
            lat: parseFloat(boatData.lat) || 0,
            lng: parseFloat(boatData.lng) || 0,
            velocidad: parseFloat(boatData.velocidad) || 0,
            anoFabricacion: parseInt(boatData.anoFabricacion) || new Date().getFullYear(),
            fechaRegistro: boatData.fechaRegistro || new Date().toISOString().split('T')[0],
            fechaCreacion: new Date().toISOString()
        };
        
        boats.push(newBoat);
        this.saveAll(boats);
        
        return { success: true, boat: newBoat, message: 'Barco creado exitosamente' };
    },
    
    // Actualizar barco
    update: function(id, boatData) {
        const boats = this.getAll();
        const index = boats.findIndex(boat => boat.id === id);
        
        if (index === -1) {
            return { success: false, message: 'Barco no encontrado' };
        }
        
        if (!boatData.nombre || !boatData.matricula) {
            return { success: false, message: 'Nombre y matrícula son obligatorios' };
        }
        
        if (boats.some(boat => boat.matricula === boatData.matricula && boat.id !== id)) {
            return { success: false, message: 'Ya existe otro barco con esa matrícula' };
        }
        
        boats[index] = {
            ...boats[index],
            nombre: boatData.nombre,
            matricula: boatData.matricula,
            bandera: boatData.bandera,
            tipo: boatData.tipo,
            capacidadToneladas: parseFloat(boatData.capacidadToneladas) || 0,
            dueñoId: boatData.dueñoId,
            estado: boatData.estado,
            anoFabricacion: parseInt(boatData.anoFabricacion) || boats[index].anoFabricacion,
            fechaModificacion: new Date().toISOString()
        };
        
        this.saveAll(boats);
        
        return { success: true, boat: boats[index], message: 'Barco actualizado exitosamente' };
    },
    
    // Eliminar barco
    delete: function(id) {
        const boats = this.getAll();
        const index = boats.findIndex(boat => boat.id === id);
        
        if (index === -1) {
            return { success: false, message: 'Barco no encontrado' };
        }
        
        const deletedBoat = boats[index];
        boats.splice(index, 1);
        this.saveAll(boats);
        
        return { success: true, boat: deletedBoat, message: 'Barco eliminado exitosamente' };
    },
    
    // Buscar barcos
    search: function(query) {
        if (!query) return this.getAll();
        
        const normalizedQuery = query.toLowerCase().trim();
        return this.getAll().filter(boat => 
            boat.nombre.toLowerCase().includes(normalizedQuery) ||
            boat.matricula.toLowerCase().includes(normalizedQuery) ||
            boat.bandera.toLowerCase().includes(normalizedQuery) ||
            boat.tipo.toLowerCase().includes(normalizedQuery) ||
            boat.id.toLowerCase().includes(normalizedQuery)
        );
    },
    
    // Filtrar por bandera
    filterByFlag: function(bandera) {
        if (!bandera) return this.getAll();
        return this.getAll().filter(boat => boat.bandera === bandera);
    },
    
    // Filtrar por tipo
    filterByType: function(tipo) {
        if (!tipo) return this.getAll();
        return this.getAll().filter(boat => boat.tipo === tipo);
    },
    
    // Filtrar por estado
    filterByStatus: function(estado) {
        if (!estado) return this.getAll();
        return this.getAll().filter(boat => boat.estado === estado);
    },
    
    // Filtrar por dueño
    filterByOwner: function(dueñoId) {
        if (!dueñoId) return this.getAll();
        return this.getAll().filter(boat => boat.dueñoId === dueñoId);
    },
    
    // Actualizar posición del barco (para GPS)
    updatePosition: function(id, lat, lng, velocidad) {
        const boats = this.getAll();
        const index = boats.findIndex(b => b.id === id);
        
        if (index === -1) {
            return { success: false, message: 'Barco no encontrado' };
        }
        
        boats[index].lat = parseFloat(lat);
        boats[index].lng = parseFloat(lng);
        boats[index].velocidad = parseFloat(velocidad) || 0;
        boats[index].fechaUltimaActualizacion = new Date().toISOString();
        
        this.saveAll(boats);
        
        return { success: true, boat: boats[index] };
    },
    
    // Obtener barcos con posición (para el mapa)
    getAllWithPosition: function() {
        return this.getAll().filter(boat => {
            const lat = Number(boat.lat);
            const lng = Number(boat.lng);
            return Number.isFinite(lat) && Number.isFinite(lng);
        });
    },
    
    // Ordenar barcos
    sort: function(boats, field, order = 'asc') {
        return Helpers.sortArray(boats, field, order);
    },
    
    // Obtener banderas únicas
    getFlags: function() {
        const boats = this.getAll();
        const flags = [...new Set(boats.map(boat => boat.bandera))];
        return flags.sort();
    },
    
    // Contar barcos por bandera
    countByFlag: function() {
        const boats = this.getAll();
        const counts = {};
        
        boats.forEach(boat => {
            counts[boat.bandera] = (counts[boat.bandera] || 0) + 1;
        });
        
        return counts;
    },
    
    // Contar barcos por tipo
    countByType: function() {
        const boats = this.getAll();
        const counts = {};
        
        boats.forEach(boat => {
            counts[boat.tipo] = (counts[boat.tipo] || 0) + 1;
        });
        
        return counts;
    },
    
    // Obtener estadísticas
    getStats: function() {
        const boats = this.getAll();
        const typeCounts = this.countByType();
        
        return {
            total: boats.length,
            porTipo: typeCounts,
            capacidadTotal: boats.reduce((sum, boat) => sum + boat.capacidadToneladas, 0),
            enViaje: boats.filter(b => b.estado === 'En Viaje').length,
            activos: boats.filter(b => b.estado === 'Activo' || b.estado === 'En Viaje').length
        };
    },
    
    // Exportar a JSON
    exportJSON: function() {
        const boats = this.getAll();
        const dataStr = JSON.stringify(boats, null, 2);
        Helpers.downloadFile(dataStr, 'barcos.json', 'application/json');
    },
    
    // Exportar a CSV
    exportCSV: function() {
        const boats = this.getAll();
        
        if (boats.length === 0) {
            return { success: false, message: 'No hay barcos para exportar' };
        }
        
        const headers = ['ID', 'Nombre', 'Matrícula', 'Bandera', 'Tipo', 'Capacidad', 'Dueño', 'Estado'];
        const rows = boats.map(boat => [
            boat.id,
            boat.nombre,
            boat.matricula,
            boat.bandera,
            boat.tipo,
            boat.capacidadToneladas,
            boat.dueñoId || 'Sin dueño',
            boat.estado
        ]);
        
        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        Helpers.downloadFile(csv, 'barcos.csv', 'text/csv');
        
        return { success: true, message: 'Barcos exportados a CSV' };
    }
};

// Exponer al objeto window
if (typeof window !== 'undefined') {
    window.BoatService = BoatService;
    BoatService.init();
}
