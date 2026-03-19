/**
 * trip-service.js
 * Servicio para gestión de viajes de barcos
 * Caso de Uso 3: Gestión del viaje
 */

class TripService {
    constructor() {
        this.storageKey = 'boat_system_trips';
        this.TRIP_STATES = {
            EN_CURSO: 'En curso',
            FINALIZADO: 'Finalizado',
            CANCELADO: 'Cancelado',
            PAUSADO: 'Pausado'
        };
        this.initializeStorage();
    }

    /**
     * Inicializa el almacenamiento si no existe
     */
    initializeStorage() {
        if (!localStorage.getItem(this.storageKey)) {
            localStorage.setItem(this.storageKey, JSON.stringify([]));
        }
    }

    /**
     * Obtiene todos los viajes
     * @returns {Array} Lista de viajes
     */
    getAll() {
        try {
            const trips = localStorage.getItem(this.storageKey);
            return trips ? JSON.parse(trips) : [];
        } catch (error) {
            console.error('Error al obtener viajes:', error);
            return [];
        }
    }

    /**
     * Obtiene un viaje por ID
     * @param {string} id - ID del viaje
     * @returns {Object|null} Viaje encontrado
     */
    getById(id) {
        const trips = this.getAll();
        return trips.find(trip => trip.id === id) || null;
    }

    /**
     * Crea un nuevo viaje
     * @param {Object} tripData - Datos del viaje
     * @returns {Object} Resultado de la operación
     */
    create(tripData) {
        try {
            // Validar que el barco no tenga un viaje activo
            const validation = this.validateNoActiveTrip(tripData.barcoId);
            if (!validation.valid) {
                return { success: false, error: validation.error };
            }

            const trips = this.getAll();
            
            const newTrip = {
                id: tripData.id || this.generateId(),
                barcoId: tripData.barcoId,
                puertoOrigen: tripData.puertoOrigen,
                puertoDestino: tripData.puertoDestino,
                fechaInicio: tripData.fechaInicio || new Date().toISOString(),
                fechaFin: tripData.fechaFin || null,
                estado: tripData.estado || this.TRIP_STATES.EN_CURSO,
                tripulacion: tripData.tripulacion || [],
                coordenadasRuta: tripData.coordenadasRuta || [],
                observaciones: tripData.observaciones || '',
                distanciaEstimada: tripData.distanciaEstimada || null,
                cargaTransportada: tripData.cargaTransportada || [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            trips.push(newTrip);
            localStorage.setItem(this.storageKey, JSON.stringify(trips));

            // Actualizar estado del barco a "En viaje"
            if (window.BoatService) {
                const boat = window.BoatService.getById(tripData.barcoId);
                if (boat) {
                    window.BoatService.update(tripData.barcoId, { estadoActual: 'En viaje' });
                }
            }

            return { success: true, data: newTrip };
        } catch (error) {
            console.error('Error al crear viaje:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Actualiza un viaje existente
     * @param {string} id - ID del viaje
     * @param {Object} updateData - Datos a actualizar
     * @returns {Object} Resultado de la operación
     */
    update(id, updateData) {
        try {
            const trips = this.getAll();
            const index = trips.findIndex(trip => trip.id === id);

            if (index === -1) {
                return { success: false, error: 'Viaje no encontrado' };
            }

            trips[index] = {
                ...trips[index],
                ...updateData,
                id: trips[index].id, // Preservar ID
                updatedAt: new Date().toISOString()
            };

            localStorage.setItem(this.storageKey, JSON.stringify(trips));
            return { success: true, data: trips[index] };
        } catch (error) {
            console.error('Error al actualizar viaje:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Elimina un viaje
     * @param {string} id - ID del viaje
     * @returns {Object} Resultado de la operación
     */
    delete(id) {
        try {
            const trips = this.getAll();
            const filteredTrips = trips.filter(trip => trip.id !== id);

            if (trips.length === filteredTrips.length) {
                return { success: false, error: 'Viaje no encontrado' };
            }

            localStorage.setItem(this.storageKey, JSON.stringify(filteredTrips));
            return { success: true };
        } catch (error) {
            console.error('Error al eliminar viaje:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Inicia un viaje
     * @param {Object} tripData - Datos del viaje
     * @returns {Object} Resultado de la operación
     */
    startTrip(tripData) {
        return this.create(tripData);
    }

    /**
     * Finaliza un viaje activo
     * @param {string} tripId - ID del viaje
     * @param {Object} endData - Datos de finalización (observaciones, etc.)
     * @returns {Object} Resultado de la operación
     */
    endTrip(tripId, endData = {}) {
        try {
            const trip = this.getById(tripId);
            
            if (!trip) {
                return { success: false, error: 'Viaje no encontrado' };
            }

            if (trip.estado !== this.TRIP_STATES.EN_CURSO) {
                return { success: false, error: 'El viaje no está en curso' };
            }

            const updateData = {
                estado: this.TRIP_STATES.FINALIZADO,
                fechaFin: new Date().toISOString(),
                observacionesFin: endData.observaciones || ''
            };

            const result = this.update(tripId, updateData);

            // Actualizar estado del barco a "En puerto"
            if (result.success && window.BoatService) {
                const boat = window.BoatService.getById(trip.barcoId);
                if (boat) {
                    window.BoatService.update(trip.barcoId, { estadoActual: 'En puerto' });
                }
            }

            return result;
        } catch (error) {
            console.error('Error al finalizar viaje:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Pausa un viaje activo
     * @param {string} tripId - ID del viaje
     * @param {string} motivo - Motivo de la pausa
     * @returns {Object} Resultado de la operación
     */
    pauseTrip(tripId, motivo = '') {
        const trip = this.getById(tripId);
        
        if (!trip) {
            return { success: false, error: 'Viaje no encontrado' };
        }

        if (trip.estado !== this.TRIP_STATES.EN_CURSO) {
            return { success: false, error: 'El viaje no está en curso' };
        }

        return this.update(tripId, {
            estado: this.TRIP_STATES.PAUSADO,
            motivoPausa: motivo
        });
    }

    /**
     * Reanuda un viaje pausado
     * @param {string} tripId - ID del viaje
     * @returns {Object} Resultado de la operación
     */
    resumeTrip(tripId) {
        const trip = this.getById(tripId);
        
        if (!trip) {
            return { success: false, error: 'Viaje no encontrado' };
        }

        if (trip.estado !== this.TRIP_STATES.PAUSADO) {
            return { success: false, error: 'El viaje no está pausado' };
        }

        return this.update(tripId, {
            estado: this.TRIP_STATES.EN_CURSO,
            motivoPausa: null
        });
    }

    /**
     * Cancela un viaje
     * @param {string} tripId - ID del viaje
     * @param {string} motivo - Motivo de cancelación
     * @returns {Object} Resultado de la operación
     */
    cancelTrip(tripId, motivo = '') {
        const trip = this.getById(tripId);
        
        if (!trip) {
            return { success: false, error: 'Viaje no encontrado' };
        }

        const result = this.update(tripId, {
            estado: this.TRIP_STATES.CANCELADO,
            motivoCancelacion: motivo,
            fechaFin: new Date().toISOString()
        });

        // Actualizar estado del barco a "En puerto"
        if (result.success && window.BoatService) {
            window.BoatService.update(trip.barcoId, { estadoActual: 'En puerto' });
        }

        return result;
    }

    /**
     * Obtiene viajes activos (en curso)
     * @returns {Array} Lista de viajes activos
     */
    getActiveTrips() {
        return this.getAll().filter(trip => trip.estado === this.TRIP_STATES.EN_CURSO);
    }

    /**
     * Obtiene viajes finalizados
     * @returns {Array} Lista de viajes finalizados
     */
    getCompletedTrips() {
        return this.getAll().filter(trip => trip.estado === this.TRIP_STATES.FINALIZADO);
    }

    /**
     * Obtiene viajes pausados
     * @returns {Array} Lista de viajes pausados
     */
    getPausedTrips() {
        return this.getAll().filter(trip => trip.estado === this.TRIP_STATES.PAUSADO);
    }

    /**
     * Obtiene viajes por barco
     * @param {string} barcoId - ID del barco
     * @returns {Array} Lista de viajes del barco
     */
    getTripsByBoat(barcoId) {
        return this.getAll().filter(trip => trip.barcoId === barcoId);
    }

    /**
     * Obtiene el viaje activo de un barco
     * @param {string} barcoId - ID del barco
     * @returns {Object|null} Viaje activo del barco
     */
    getActiveTripByBoat(barcoId) {
        return this.getAll().find(trip => 
            trip.barcoId === barcoId && trip.estado === this.TRIP_STATES.EN_CURSO
        ) || null;
    }

    /**
     * Valida que un barco no tenga viajes activos
     * @param {string} barcoId - ID del barco
     * @returns {Object} Resultado de la validación
     */
    validateNoActiveTrip(barcoId) {
        const activeTrip = this.getActiveTripByBoat(barcoId);
        
        if (activeTrip) {
            return {
                valid: false,
                error: `El barco ya tiene un viaje activo (${activeTrip.id})`
            };
        }

        return { valid: true };
    }

    /**
     * Obtiene viajes por estado
     * @param {string} estado - Estado del viaje
     * @returns {Array} Lista de viajes
     */
    getTripsByState(estado) {
        return this.getAll().filter(trip => trip.estado === estado);
    }

    /**
     * Obtiene viajes por rango de fechas
     * @param {string} fechaInicio - Fecha de inicio
     * @param {string} fechaFin - Fecha de fin
     * @returns {Array} Lista de viajes
     */
    getTripsByDateRange(fechaInicio, fechaFin) {
        const trips = this.getAll();
        const start = new Date(fechaInicio);
        const end = new Date(fechaFin);

        return trips.filter(trip => {
            const tripStart = new Date(trip.fechaInicio);
            return tripStart >= start && tripStart <= end;
        });
    }

    /**
     * Busca viajes por múltiples criterios
     * @param {string} searchTerm - Término de búsqueda
     * @returns {Array} Lista de viajes encontrados
     */
    search(searchTerm) {
        if (!searchTerm) return this.getAll();

        const term = searchTerm.toLowerCase();
        return this.getAll().filter(trip => {
            return (
                trip.id.toLowerCase().includes(term) ||
                trip.puertoOrigen.toLowerCase().includes(term) ||
                trip.puertoDestino.toLowerCase().includes(term) ||
                trip.estado.toLowerCase().includes(term) ||
                (trip.observaciones && trip.observaciones.toLowerCase().includes(term))
            );
        });
    }

    /**
     * Filtra viajes por puerto de origen
     * @param {string} puerto - Nombre del puerto
     * @returns {Array} Lista de viajes
     */
    filterByOriginPort(puerto) {
        return this.getAll().filter(trip => trip.puertoOrigen === puerto);
    }

    /**
     * Filtra viajes por puerto de destino
     * @param {string} puerto - Nombre del puerto
     * @returns {Array} Lista de viajes
     */
    filterByDestinationPort(puerto) {
        return this.getAll().filter(trip => trip.puertoDestino === puerto);
    }

    /**
     * Obtiene estadísticas de viajes
     * @returns {Object} Estadísticas
     */
    getStats() {
        const trips = this.getAll();
        
        const stats = {
            total: trips.length,
            enCurso: trips.filter(t => t.estado === this.TRIP_STATES.EN_CURSO).length,
            finalizados: trips.filter(t => t.estado === this.TRIP_STATES.FINALIZADO).length,
            pausados: trips.filter(t => t.estado === this.TRIP_STATES.PAUSADO).length,
            cancelados: trips.filter(t => t.estado === this.TRIP_STATES.CANCELADO).length
        };

        // Calcular duración promedio de viajes finalizados
        const completedTrips = trips.filter(t => t.estado === this.TRIP_STATES.FINALIZADO && t.fechaFin);
        if (completedTrips.length > 0) {
            const totalDuration = completedTrips.reduce((sum, trip) => {
                const duration = new Date(trip.fechaFin) - new Date(trip.fechaInicio);
                return sum + duration;
            }, 0);
            stats.duracionPromedioDias = (totalDuration / (1000 * 60 * 60 * 24) / completedTrips.length).toFixed(2);
        } else {
            stats.duracionPromedioDias = 0;
        }

        return stats;
    }

    /**
     * Cuenta viajes por estado
     * @returns {Object} Conteo por estado
     */
    countByState() {
        const trips = this.getAll();
        const counts = {};

        Object.values(this.TRIP_STATES).forEach(state => {
            counts[state] = trips.filter(trip => trip.estado === state).length;
        });

        return counts;
    }

    /**
     * Obtiene puertos únicos (origen y destino)
     * @returns {Object} Lista de puertos
     */
    getUniquePorts() {
        const trips = this.getAll();
        const origenes = new Set();
        const destinos = new Set();

        trips.forEach(trip => {
            origenes.add(trip.puertoOrigen);
            destinos.add(trip.puertoDestino);
        });

        return {
            origenes: Array.from(origenes).sort(),
            destinos: Array.from(destinos).sort(),
            todos: Array.from(new Set([...origenes, ...destinos])).sort()
        };
    }

    /**
     * Ordena viajes por campo
     * @param {Array} trips - Lista de viajes
     * @param {string} field - Campo a ordenar
     * @param {string} order - Orden (asc/desc)
     * @returns {Array} Lista ordenada
     */
    sortBy(trips, field, order = 'asc') {
        return [...trips].sort((a, b) => {
            let valueA = a[field];
            let valueB = b[field];

            // Manejar fechas
            if (field.includes('fecha') || field.includes('At')) {
                valueA = new Date(valueA);
                valueB = new Date(valueB);
            }

            // Manejar null/undefined
            if (valueA == null) return 1;
            if (valueB == null) return -1;

            if (valueA < valueB) return order === 'asc' ? -1 : 1;
            if (valueA > valueB) return order === 'asc' ? 1 : -1;
            return 0;
        });
    }

    /**
     * Exporta viajes a JSON
     * @param {Array} trips - Viajes a exportar (opcional)
     * @returns {string} JSON string
     */
    exportJSON(trips = null) {
        const data = trips || this.getAll();
        return JSON.stringify(data, null, 2);
    }

    /**
     * Exporta viajes a CSV
     * @param {Array} trips - Viajes a exportar (opcional)
     * @returns {string} CSV string
     */
    exportCSV(trips = null) {
        const data = trips || this.getAll();
        if (data.length === 0) return '';

        const headers = ['ID', 'Barco ID', 'Puerto Origen', 'Puerto Destino', 'Fecha Inicio', 'Fecha Fin', 'Estado', 'Tripulación', 'Observaciones'];
        const rows = data.map(trip => [
            trip.id,
            trip.barcoId,
            trip.puertoOrigen,
            trip.puertoDestino,
            trip.fechaInicio,
            trip.fechaFin || '',
            trip.estado,
            trip.tripulacion.join(';'),
            trip.observaciones || ''
        ]);

        return [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');
    }

    /**
     * Añade una coordenada a la ruta del viaje
     * @param {string} tripId - ID del viaje
     * @param {Object} coordenada - Coordenada {lat, lng, timestamp}
     * @returns {Object} Resultado de la operación
     */
    addRouteCoordinate(tripId, coordenada) {
        const trip = this.getById(tripId);
        
        if (!trip) {
            return { success: false, error: 'Viaje no encontrado' };
        }

        const coordenadasRuta = trip.coordenadasRuta || [];
        coordenadasRuta.push({
            lat: coordenada.lat,
            lng: coordenada.lng,
            timestamp: coordenada.timestamp || new Date().toISOString()
        });

        return this.update(tripId, { coordenadasRuta });
    }

    /**
     * Genera un ID único para viaje
     * @returns {string} ID generado
     */
    generateId() {
        const trips = this.getAll();
        const sequentialNumbers = trips
            .map(trip => {
                const match = /^TRIP(\d{4})$/.exec(trip.id);
                return match ? parseInt(match[1], 10) : null;
            })
            .filter(num => num !== null);

        const nextNumber = sequentialNumbers.length > 0
            ? Math.max(...sequentialNumbers) + 1
            : 1;

        return `TRIP${String(nextNumber).padStart(4, '0')}`;
    }

    /**
     * Limpia todos los viajes (para testing)
     */
    clearAll() {
        localStorage.setItem(this.storageKey, JSON.stringify([]));
    }
}

// Crear instancia global
window.TripService = new TripService();
