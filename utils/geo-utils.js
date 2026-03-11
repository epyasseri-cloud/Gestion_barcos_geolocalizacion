// Utilidades geográficas
const GeoUtils = {
    // Calcular distancia entre dos puntos (Haversine formula)
    // Retorna distancia en kilómetros
    calculateDistance: function(lat1, lng1, lat2, lng2) {
        const R = 6371; // Radio de la Tierra en km
        const dLat = this.toRadians(lat2 - lat1);
        const dLng = this.toRadians(lng2 - lng1);
        
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
                  Math.sin(dLng / 2) * Math.sin(dLng / 2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        
        return distance;
    },
    
    // Convertir grados a radianes
    toRadians: function(degrees) {
        return degrees * (Math.PI / 180);
    },
    
    // Convertir radianes a grados
    toDegrees: function(radians) {
        return radians * (180 / Math.PI);
    },
    
    // Calcular rumbo entre dos puntos (bearing)
    calculateBearing: function(lat1, lng1, lat2, lng2) {
        const dLng = this.toRadians(lng2 - lng1);
        const y = Math.sin(dLng) * Math.cos(this.toRadians(lat2));
        const x = Math.cos(this.toRadians(lat1)) * Math.sin(this.toRadians(lat2)) -
                  Math.sin(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * Math.cos(dLng);
        
        const bearing = this.toDegrees(Math.atan2(y, x));
        return (bearing + 360) % 360;
    },
    
    // Obtener punto a cierta distancia y rumbo
    getDestinationPoint: function(lat, lng, distance, bearing) {
        const R = 6371; // Radio de la Tierra en km
        const d = distance / R;
        const brng = this.toRadians(bearing);
        
        const lat1 = this.toRadians(lat);
        const lng1 = this.toRadians(lng);
        
        const lat2 = Math.asin(
            Math.sin(lat1) * Math.cos(d) +
            Math.cos(lat1) * Math.sin(d) * Math.cos(brng)
        );
        
        const lng2 = lng1 + Math.atan2(
            Math.sin(brng) * Math.sin(d) * Math.cos(lat1),
            Math.cos(d) - Math.sin(lat1) * Math.sin(lat2)
        );
        
        return {
            lat: this.toDegrees(lat2),
            lng: this.toDegrees(lng2)
        };
    },
    
    // Calcular punto medio entre dos puntos
    getMidpoint: function(lat1, lng1, lat2, lng2) {
        const dLng = this.toRadians(lng2 - lng1);
        const lat1Rad = this.toRadians(lat1);
        const lat2Rad = this.toRadians(lat2);
        const lng1Rad = this.toRadians(lng1);
        
        const Bx = Math.cos(lat2Rad) * Math.cos(dLng);
        const By = Math.cos(lat2Rad) * Math.sin(dLng);
        
        const lat3 = Math.atan2(
            Math.sin(lat1Rad) + Math.sin(lat2Rad),
            Math.sqrt((Math.cos(lat1Rad) + Bx) * (Math.cos(lat1Rad) + Bx) + By * By)
        );
        
        const lng3 = lng1Rad + Math.atan2(By, Math.cos(lat1Rad) + Bx);
        
        return {
            lat: this.toDegrees(lat3),
            lng: this.toDegrees(lng3)
        };
    },
    
    // Validar coordenadas
    isValidCoordinates: function(lat, lng) {
        return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
    },
    
    // Convertir knots a km/h
    knotsToKmh: function(knots) {
        return knots * 1.852;
    },
    
    // Convertir km/h a knots
    kmhToKnots: function(kmh) {
        return kmh / 1.852;
    },
    
    // Calcular velocidad promedio
    calculateAverageSpeed: function(distance, timeMinutes) {
        if (timeMinutes === 0) return 0;
        const hours = timeMinutes / 60;
        return distance / hours; // km/h
    },
    
    // Calcular tiempo estimado de llegada
    calculateETA: function(distance, speedKnots) {
        if (speedKnots === 0) return 0;
        const speedKmh = this.knotsToKmh(speedKnots);
        return (distance / speedKmh) * 60; // minutos
    },
    
    // Generar coordenadas aleatorias en un rango
    generateRandomCoordinates: function(centerLat, centerLng, radiusKm) {
        const randomBearing = Math.random() * 360;
        const randomDistance = Math.random() * radiusKm;
        return this.getDestinationPoint(centerLat, centerLng, randomDistance, randomBearing);
    },
    
    // Verificar si un punto está dentro de un radio
    isWithinRadius: function(lat1, lng1, lat2, lng2, radiusKm) {
        const distance = this.calculateDistance(lat1, lng1, lat2, lng2);
        return distance <= radiusKm;
    },
    
    // Encontrar el punto más cercano
    findNearest: function(targetLat, targetLng, points) {
        if (!points || points.length === 0) return null;
        
        let nearest = null;
        let minDistance = Infinity;
        
        points.forEach(point => {
            const distance = this.calculateDistance(targetLat, targetLng, point.lat, point.lng);
            if (distance < minDistance) {
                minDistance = distance;
                nearest = { ...point, distance: distance };
            }
        });
        
        return nearest;
    },
    
    // Ordenar puntos por distancia
    sortByDistance: function(targetLat, targetLng, points) {
        return points.map(point => ({
            ...point,
            distance: this.calculateDistance(targetLat, targetLng, point.lat, point.lng)
        })).sort((a, b) => a.distance - b.distance);
    },
    
    // Obtener bounds para un conjunto de coordenadas
    getBounds: function(coordinates) {
        if (!coordinates || coordinates.length === 0) return null;
        
        let minLat = Infinity, maxLat = -Infinity;
        let minLng = Infinity, maxLng = -Infinity;
        
        coordinates.forEach(coord => {
            if (coord.lat < minLat) minLat = coord.lat;
            if (coord.lat > maxLat) maxLat = coord.lat;
            if (coord.lng < minLng) minLng = coord.lng;
            if (coord.lng > maxLng) maxLng = coord.lng;
        });
        
        return {
            southWest: { lat: minLat, lng: minLng },
            northEast: { lat: maxLat, lng: maxLng }
        };
    },

    // Interpolar puntos a lo largo de un círculo máximo (gran círculo)
    // Devuelve un array de numPoints+1 puntos {lat, lng} desde (lat1,lng1) hasta (lat2,lng2)
    interpolateGreatCircle: function(lat1, lng1, lat2, lng2, numPoints) {
        numPoints = numPoints || 20;
        const points = [];
        const lat1r = this.toRadians(lat1);
        const lng1r = this.toRadians(lng1);
        const lat2r = this.toRadians(lat2);
        const lng2r = this.toRadians(lng2);

        // Distancia angular total entre los dos puntos
        const d = 2 * Math.asin(Math.sqrt(
            Math.pow(Math.sin((lat2r - lat1r) / 2), 2) +
            Math.cos(lat1r) * Math.cos(lat2r) *
            Math.pow(Math.sin((lng2r - lng1r) / 2), 2)
        ));

        for (let i = 0; i <= numPoints; i++) {
            const f = i / numPoints;
            if (d < 1e-10) {
                // Misma ubicación
                points.push({ lat: lat1, lng: lng1 });
                continue;
            }
            const A = Math.sin((1 - f) * d) / Math.sin(d);
            const B = Math.sin(f * d) / Math.sin(d);
            const x = A * Math.cos(lat1r) * Math.cos(lng1r) + B * Math.cos(lat2r) * Math.cos(lng2r);
            const y = A * Math.cos(lat1r) * Math.sin(lng1r) + B * Math.cos(lat2r) * Math.sin(lng2r);
            const z = A * Math.sin(lat1r) + B * Math.sin(lat2r);
            const lat = this.toDegrees(Math.atan2(z, Math.sqrt(x * x + y * y)));
            const lng = this.toDegrees(Math.atan2(y, x));
            points.push({ lat: lat, lng: lng });
        }
        return points;
    },

    // Convertir kilómetros a millas náuticas
    kmToNauticalMiles: function(km) {
        return km / 1.852;
    },

    // Convertir millas náuticas a kilómetros
    nauticalMilesToKm: function(nm) {
        return nm * 1.852;
    }
};
