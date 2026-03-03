// Servicio de cálculo de distancias
const DistanceService = {
    // Encontrar el barco más cercano a un puerto
    findNearestBoatToPort: function(portId) {
        const port = Constants.PORTS.find(p => p.id === portId);
        if (!port) {
            return { success: false, message: 'Puerto no encontrado' };
        }
        
        const boats = BoatService.getAllWithPosition();
        if (boats.length === 0) {
            return { success: false, message: 'No hay barcos con posición GPS' };
        }
        
        const boatsWithDistance = boats.map(boat => {
            const distance = GeoUtils.calculateDistance(port.lat, port.lng, boat.lat, boat.lng);
            const bearing = GeoUtils.calculateBearing(boat.lat, boat.lng, port.lat, port.lng);
            const eta = GeoUtils.calculateETA(distance, boat.velocidad);
            
            return {
                ...boat,
                distance: distance,
                bearing: bearing,
                eta: eta
            };
        });
        
        const sorted = boatsWithDistance.sort((a, b) => a.distance - b.distance);
        
        return {
            success: true,
            port: port,
            nearestBoat: sorted[0],
            allBoats: sorted
        };
    },
    
    // Encontrar barcos dentro de un radio
    findBoatsInRadius: function(lat, lng, radiusKm) {
        const boats = BoatService.getAllWithPosition();
        
        const nearbyBoats = boats.filter(boat => {
            return GeoUtils.isWithinRadius(lat, lng, boat.lat, boat.lng, radiusKm);
        }).map(boat => {
            const distance = GeoUtils.calculateDistance(lat, lng, boat.lat, boat.lng);
            return { ...boat, distance: distance };
        }).sort((a, b) => a.distance - b.distance);
        
        return {
            success: true,
            count: nearbyBoats.length,
            boats: nearbyBoats
        };
    },
    
    // Calcular distancia entre dos barcos
    calculateDistanceBetweenBoats: function(boatId1, boatId2) {
        const boat1 = BoatService.getById(boatId1);
        const boat2 = BoatService.getById(boatId2);
        
        if (!boat1 || !boat2) {
            return { success: false, message: 'Barco no encontrado' };
        }
        
        if (!boat1.lat || !boat2.lat) {
            return { success: false, message: 'Los barcos no tienen posición GPS' };
        }
        
        const distance = GeoUtils.calculateDistance(boat1.lat, boat1.lng, boat2.lat, boat2.lng);
        const bearing = GeoUtils.calculateBearing(boat1.lat, boat1.lng, boat2.lat, boat2.lng);
        
        return {
            success: true,
            boat1: boat1,
            boat2: boat2,
            distance: distance,
            bearing: bearing
        };
    },
    
    // Calcular distancia de un barco a un puerto
    calculateDistanceToPort: function(boatId, portId) {
        const boat = BoatService.getById(boatId);
        const port = Constants.PORTS.find(p => p.id === portId);
        
        if (!boat) {
            return { success: false, message: 'Barco no encontrado' };
        }
        
        if (!port) {
            return { success: false, message: 'Puerto no encontrado' };
        }
        
        if (!boat.lat) {
            return { success: false, message: 'El barco no tiene posición GPS' };
        }
        
        const distance = GeoUtils.calculateDistance(boat.lat, boat.lng, port.lat, port.lng);
        const bearing = GeoUtils.calculateBearing(boat.lat, boat.lng, port.lat, port.lng);
        const eta = GeoUtils.calculateETA(distance, boat.velocidad);
        
        return {
            success: true,
            boat: boat,
            port: port,
            distance: distance,
            bearing: bearing,
            eta: eta
        };
    },
    
    // Listar todos los puertos con distancias desde un barco
    listPortsFromBoat: function(boatId) {
        const boat = BoatService.getById(boatId);
        
        if (!boat) {
            return { success: false, message: 'Barco no encontrado' };
        }
        
        if (!boat.lat) {
            return { success: false, message: 'El barco no tiene posición GPS' };
        }
        
        const portsWithDistance = Constants.PORTS.map(port => {
            const distance = GeoUtils.calculateDistance(boat.lat, boat.lng, port.lat, port.lng);
            const bearing = GeoUtils.calculateBearing(boat.lat, boat.lng, port.lat, port.lng);
            const eta = GeoUtils.calculateETA(distance, boat.velocidad);
            
            return {
                ...port,
                distance: distance,
                bearing: bearing,
                eta: eta
            };
        }).sort((a, b) => a.distance - b.distance);
        
        return {
            success: true,
            boat: boat,
            ports: portsWithDistance
        };
    }
};

// Exponer al objeto window
if (typeof window !== 'undefined') {
    window.DistanceService = DistanceService;
}
