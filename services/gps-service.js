// Servicio de GPS
const GPSService = {
    STORAGE_KEY: 'boat_system_gps_positions',
    MOCK_VERSION_KEY: 'boat_system_gps_version',
    MOCK_VERSION: '3',   // Incrementar para forzar reset de coordenadas en todos los clientes

    // Inicializar datos mock
    initMockData: function() {
        const mockPositions = [
            {
                id: 'GPS001',
                barcoId: 'B001',
                // Atlántico Norte central - lejos de cualquier costa
                lat: 35.0,
                lng: -30.0,
                velocidad: 15,
                rumbo: 180,
                timestamp: new Date().toISOString()
            },
            {
                id: 'GPS002',
                barcoId: 'B002',
                // Pacífico Norte central - lejos de cualquier costa
                lat: 32.0,
                lng: -148.0,
                velocidad: 12,
                rumbo: 90,
                timestamp: new Date().toISOString()
            },
            {
                id: 'GPS003',
                barcoId: 'B003',
                // Mediterráneo occidental - entre Baleares y Argelia
                lat: 38.0,
                lng: 5.5,
                velocidad: 8,
                rumbo: 270,
                timestamp: new Date().toISOString()
            },
            {
                id: 'GPS004',
                barcoId: 'B004',
                // Pacífico Sur - lejos al oeste de Chile
                lat: -38.0,
                lng: -90.0,
                velocidad: 18,
                rumbo: 45,
                timestamp: new Date().toISOString()
            },
            {
                id: 'GPS005',
                barcoId: 'B005',
                // Atlántico Sur central - lejos de la costa
                lat: -28.0,
                lng: -28.0,
                velocidad: 10,
                rumbo: 135,
                timestamp: new Date().toISOString()
            },
            {
                id: 'GPS006',
                barcoId: 'B006',
                // Atlántico Sur - zona austral, lejos de Argentina
                lat: -46.0,
                lng: -40.0,
                velocidad: 14,
                rumbo: 220,
                timestamp: new Date().toISOString()
            },
            {
                id: 'GPS007',
                barcoId: 'B007',
                // Atlántico Sur - lejos de la costa de Brasil
                lat: -33.0,
                lng: -20.0,
                velocidad: 11,
                rumbo: 60,
                timestamp: new Date().toISOString()
            }
        ];

        const storedVersion = localStorage.getItem(this.MOCK_VERSION_KEY);
        if (storedVersion !== this.MOCK_VERSION) {
            // Versión nueva: reinicializar todas las posiciones con coordenadas oceánicas correctas
            this.saveAll(mockPositions);
            localStorage.setItem(this.MOCK_VERSION_KEY, this.MOCK_VERSION);
        } else {
            // Versión vigente: solo añadir barcos que aún no tengan entrada
            const existing = this.getAll();
            var changed = false;
            const existingIds = new Set(existing.map(function(p) { return p.barcoId; }));
            mockPositions.forEach(function(mock) {
                if (!existingIds.has(mock.barcoId)) {
                    existing.push(mock);
                    changed = true;
                }
            });
            if (changed) {
                GPSService.saveAll(existing);
            }
        }
    },
    
    // Obtener todas las posiciones
    getAll: function() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    },
    
    // Guardar todas las posiciones
    saveAll: function(positions) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(positions));
    },
    
    // Registrar nueva posición
    create: function(positionData) {
        const positions = this.getAll();
        
        // Validar datos
        if (!this.validate(positionData)) {
            return { success: false, message: 'Datos de posición inválidos' };
        }
        
        const sequentialIds = positions
            .map(p => p.id)
            .filter(id => /^GPS\d{3}$/.test(id));
        const newId = Helpers.generateSequentialId('GPS', sequentialIds);
        
        const newPosition = {
            id: newId,
            barcoId: positionData.barcoId,
            lat: parseFloat(positionData.lat),
            lng: parseFloat(positionData.lng),
            velocidad: parseFloat(positionData.velocidad) || 0,
            rumbo: parseFloat(positionData.rumbo) || 0,
            timestamp: new Date().toISOString()
        };
        
        positions.push(newPosition);
        
        // Mantener solo las últimas 1000 posiciones
        if (positions.length > 1000) {
            positions.shift();
        }
        
        this.saveAll(positions);
        
        return { success: true, message: 'Posición registrada', data: newPosition };
    },
    
    // Obtener última posición de un barco
    getLatestByBoat: function(barcoId) {
        const positions = this.getAll();
        const boatPositions = positions.filter(p => p.barcoId === barcoId);
        
        if (boatPositions.length === 0) return null;
        
        return boatPositions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
    },
    
    // Obtener historial de posiciones de un barco
    getTrackByBoat: function(barcoId, limit = 100) {
        const positions = this.getAll();
        const boatPositions = positions
            .filter(p => p.barcoId === barcoId)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, limit);
        
        return boatPositions;
    },
    
    // Obtener últimas posiciones de todos los barcos
    getLatestPositions: function() {
        const positions = this.getAll();
        const boatIds = [...new Set(positions.map(p => p.barcoId))];
        
        return boatIds.map(barcoId => this.getLatestByBoat(barcoId)).filter(p => p !== null);
    },
    
    // Simular movimiento de barco (para testing)
    simulateMovement: function(barcoId, speedKnots = 100) {
        const lastPosition = this.getLatestByBoat(barcoId);
        
        if (!lastPosition) {
            return { success: false, message: 'No se encontró posición previa' };
        }
        
        // Mover el barco en su rumbo actual
        const distanceKm = GeoUtils.knotsToKmh(speedKnots) / 600; // distancia en 1 minuto
        const newPos = GeoUtils.getDestinationPoint(
            lastPosition.lat,
            lastPosition.lng,
            distanceKm,
            lastPosition.rumbo
        );
        
        return this.create({
            barcoId: barcoId,
            lat: newPos.lat,
            lng: newPos.lng,
            velocidad: speedKnots,
            rumbo: lastPosition.rumbo
        });
    },
    
    // Actualizar posición automáticamente
    updatePosition: function(barcoId, lat, lng, velocidad, rumbo) {
        return this.create({
            barcoId: barcoId,
            lat: lat,
            lng: lng,
            velocidad: velocidad || 0,
            rumbo: rumbo || 0
        });
    },
    
    // Validar datos de posición
    validate: function(positionData) {
        if (!positionData.barcoId) return false;
        const lat = Number(positionData.lat);
        const lng = Number(positionData.lng);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
        if (!GeoUtils.isValidCoordinates(positionData.lat, positionData.lng)) return false;
        return true;
    },
    
    // Limpiar posiciones antiguas
    clearOldPositions: function(daysOld = 30) {
        const positions = this.getAll();
        const cutoffDate = DateUtils.addDays(new Date(), -daysOld);
        
        const filtered = positions.filter(p => new Date(p.timestamp) > cutoffDate);
        this.saveAll(filtered);
        
        return { success: true, message: `Eliminadas ${positions.length - filtered.length} posiciones antiguas` };
    },
    
    // Exportar track de un barco
    exportTrack: function(barcoId) {
        const track = this.getTrackByBoat(barcoId, 1000);
        Helpers.exportJSON(track, `track_${barcoId}.json`);
    }
};

// Exponer al objeto window e inicializar
if (typeof window !== 'undefined') {
    window.GPSService = GPSService;
    GPSService.initMockData();
}
