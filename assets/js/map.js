// Inicialización del mapa
const MapManager = {
    map: null,
    markers: {},
    
    // Inicializar mapa
    init: function(containerId, centerLat = 0, centerLng = 0, zoom = 3) {
        this.map = L.map(containerId).setView([centerLat, centerLng], zoom);
        
        L.tileLayer(MapConfig.tileLayer, {
            attribution: MapConfig.attribution,
            minZoom: MapConfig.minZoom,
            maxZoom: MapConfig.maxZoom
        }).addTo(this.map);
        
        return this.map;
    },
    
    // Crear marcador de barco
    createBoatMarker: function(boat) {
        const lat = Number(boat.lat);
        const lng = Number(boat.lng);

        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
        
        const color = MapConfig.boatStatusColors[boat.estado] || '#333';
        
        const icon = L.divIcon({
            html: `<div style="font-size: 24px; text-shadow: 0 0 3px white;">${MapConfig.boatIcon}</div>`,
            className: 'boat-marker',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });
        
        const marker = L.marker([lat, lng], { icon: icon });
        
        const popupContent = `
            <strong>${boat.nombre}</strong><br>
            ID: ${boat.id}<br>
            Estado: <span style="color: ${color};">${boat.estado}</span><br>
            Velocidad: ${boat.velocidad || 0} nudos<br>
            Coordenadas: ${lat.toFixed(4)}, ${lng.toFixed(4)}
        `;
        
        marker.bindPopup(popupContent);
        marker.addTo(this.map);
        
        this.markers[boat.id] = marker;
        return marker;
    },
    
    // Crear marcador de puerto
    createPortMarker: function(port) {
        const icon = L.divIcon({
            html: `<div style="font-size: 24px; text-shadow: 0 0 3px white;">${MapConfig.portIcon}</div>`,
            className: 'port-marker',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });
        
        const marker = L.marker([port.lat, port.lng], { icon: icon });
        
        const popupContent = `
            <strong>${port.name}</strong><br>
            País: ${port.country}<br>
            Coordenadas: ${port.lat.toFixed(4)}, ${port.lng.toFixed(4)}
        `;
        
        marker.bindPopup(popupContent);
        marker.addTo(this.map);
        
        return marker;
    },
    
    // Actualizar posición de barco
    updateBoatPosition: function(boatId, lat, lng) {
        if (this.markers[boatId]) {
            this.markers[boatId].setLatLng([lat, lng]);
        }
    },
    
    // Eliminar marcador
    removeMarker: function(markerId) {
        if (this.markers[markerId]) {
            this.map.removeLayer(this.markers[markerId]);
            delete this.markers[markerId];
        }
    },
    
    // Limpiar todos los marcadores
    clearMarkers: function() {
        Object.keys(this.markers).forEach(id => {
            this.removeMarker(id);
        });
    },
    
    // Centrar en coordenadas
    centerOn: function(lat, lng, zoom = null) {
        if (zoom) {
            this.map.setView([lat, lng], zoom);
        } else {
            this.map.panTo([lat, lng]);
        }
    },
    
    // Ajustar vista a todos los marcadores
    fitToMarkers: function() {
        const markerArray = Object.values(this.markers);
        if (markerArray.length === 0) return;
        
        const group = L.featureGroup(markerArray);
        this.map.fitBounds(group.getBounds().pad(0.1));
    },
    
    // Dibujar línea entre dos puntos
    drawLine: function(lat1, lng1, lat2, lng2, options = {}) {
        const defaultOptions = {
            color: '#007bff',
            weight: 2,
            opacity: 0.7,
            dashArray: '5, 10'
        };
        
        const lineOptions = { ...defaultOptions, ...options };
        const line = L.polyline([[lat1, lng1], [lat2, lng2]], lineOptions);
        line.addTo(this.map);
        
        return line;
    },
    
    // Dibujar círculo
    drawCircle: function(lat, lng, radiusKm, options = {}) {
        const defaultOptions = {
            color: '#dc3545',
            fillColor: '#dc3545',
            fillOpacity: 0.1,
            weight: 2
        };
        
        const circleOptions = { ...defaultOptions, ...options };
        const circle = L.circle([lat, lng], {
            ...circleOptions,
            radius: radiusKm * 1000 // convertir a metros
        });
        circle.addTo(this.map);
        
        return circle;
    },

    // Dibujar polilínea con múltiples waypoints (p.ej., ruta de círculo máximo)
    // waypoints: array de { lat, lng }
    drawPolyline: function(waypoints, options = {}) {
        const defaultOptions = {
            color: '#0d6efd',
            weight: 3,
            opacity: 0.85,
            dashArray: '10, 6'
        };
        const lineOptions = { ...defaultOptions, ...options };
        const latLngs = waypoints.map(p => [p.lat, p.lng]);
        const polyline = L.polyline(latLngs, lineOptions);
        polyline.addTo(this.map);
        return polyline;
    },

    // Ajustar la vista del mapa para incluir un conjunto de puntos adicionales
    // junto con los marcadores ya registrados en this.markers
    fitToPoints: function(extraPoints = []) {
        const latLngs = extraPoints.map(p => [p.lat, p.lng]);
        const markerLatLngs = Object.values(this.markers)
            .filter(m => m.getLatLng)
            .map(m => [m.getLatLng().lat, m.getLatLng().lng]);
        const allLatLngs = [...latLngs, ...markerLatLngs];
        if (allLatLngs.length === 0) return;
        const bounds = L.latLngBounds(allLatLngs);
        this.map.fitBounds(bounds.pad(0.15));
    }
};
