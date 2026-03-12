// Inicialización del mapa
const MapManager = {
    map: null,
    markers: {},

    createSvgIconMarkup: function(type, options = {}) {
        const primary = options.primary || '#0d6efd';
        const accent = options.accent || '#ffffff';
        const outline = options.outline || 'rgba(15, 23, 42, 0.35)';

        if (type === 'boat') {
            return `
                <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
                    <defs>
                        <filter id="boat-shadow" x="-50%" y="-50%" width="200%" height="200%">
                            <feDropShadow dx="0" dy="1.5" stdDeviation="1.4" flood-color="rgba(15,23,42,0.28)"/>
                        </filter>
                    </defs>
                    <g filter="url(#boat-shadow)">
                        <circle cx="17" cy="17" r="14" fill="${accent}" fill-opacity="0.96" stroke="${outline}" stroke-width="1"/>
                        <path d="M9 19.5h16l-2.5 5.5H11.5L9 19.5z" fill="${primary}" stroke="${outline}" stroke-width="0.6" stroke-linejoin="round"/>
                        <path d="M13 12h5.2l3 3.1v4H13V12z" fill="${primary}" fill-opacity="0.9"/>
                        <path d="M18.2 10.3l3.8 1.8-3.8 1.8z" fill="${primary}"/>
                        <path d="M12 22.6c1.1.85 2.2.85 3.3 0 1.1-.85 2.2-.85 3.3 0 1.1.85 2.2.85 3.3 0" fill="none" stroke="#7dd3fc" stroke-width="1.5" stroke-linecap="round"/>
                    </g>
                </svg>`;
        }

        return `
            <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
                <defs>
                    <filter id="port-shadow" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="0" dy="1.5" stdDeviation="1.4" flood-color="rgba(15,23,42,0.28)"/>
                    </filter>
                </defs>
                <g filter="url(#port-shadow)">
                    <path d="M17 3.8c-5.25 0-9.5 4.13-9.5 9.24 0 6.62 7.56 13.37 8.47 14.16a1.55 1.55 0 0 0 2.06 0c0.91-.79 8.47-7.54 8.47-14.16 0-5.11-4.25-9.24-9.5-9.24z" fill="${primary}" stroke="${outline}" stroke-width="0.8"/>
                    <circle cx="17" cy="13" r="5.2" fill="${accent}"/>
                    <path d="M17 8.8v7.3M14 11.5h6M15 14.3c0 1.7.65 2.8 2 3.5 1.35-.7 2-1.8 2-3.5" fill="none" stroke="${primary}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </g>
            </svg>`;
    },

    createLeafletIcon: function(type, options = {}) {
        return L.divIcon({
            html: `<div style="width:34px;height:34px;display:flex;align-items:center;justify-content:center;">${this.createSvgIconMarkup(type, options)}</div>`,
            className: `${type}-marker-icon`,
            iconSize: [34, 34],
            iconAnchor: [17, 17],
            popupAnchor: [0, -14]
        });
    },
    
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
        
        const icon = this.createLeafletIcon('boat', {
            primary: color,
            accent: '#f8fbff'
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
        const icon = this.createLeafletIcon('port', {
            primary: '#0f766e',
            accent: '#f8fffd'
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
