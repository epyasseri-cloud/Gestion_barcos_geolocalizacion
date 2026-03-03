/**
 * statistics-service.js
 * Servicio para generar estadísticas de viajes por país
 * Caso de Uso 10: Consultar estadística de viajes por país
 */

class StatisticsService {
    constructor() {
        // Este servicio no necesita storage, calcula estadísticas de otros servicios
    }

    /**
     * Obtiene estadísticas de viajes por país/bandera
     * @param {Object} options - Opciones de filtrado
     * @returns {Object} Estadísticas agrupadas por país
     */
    getTripStatsByCountry(options = {}) {
        if (!window.TripService || !window.BoatService) {
            console.error('Servicios requeridos no disponibles');
            return {};
        }

        let trips = window.TripService.getAll();

        // Filtrar por rango de fechas
        if (options.fechaInicio && options.fechaFin) {
            trips = window.TripService.getTripsByDateRange(options.fechaInicio, options.fechaFin);
        }

        // Filtrar por estado
        if (options.estado) {
            trips = trips.filter(trip => trip.estado === options.estado);
        }

        const boats = window.BoatService.getAll();
        const statsByCountry = {};

        trips.forEach(trip => {
            const boat = boats.find(b => b.id === trip.barcoId);
            if (!boat) return;

            const country = boat.bandera;

            if (!statsByCountry[country]) {
                statsByCountry[country] = {
                    pais: country,
                    totalViajes: 0,
                    viajesEnCurso: 0,
                    viajesFinalizados: 0,
                    viajesPausados: 0,
                    viajesCancelados: 0,
                    totalBarcos: new Set(),
                    totalPuertosOrigen: new Set(),
                    totalPuertosDestino: new Set(),
                    distanciaTotal: 0,
                    duracionTotalDias: 0,
                    viajes: []
                };
            }

            statsByCountry[country].totalViajes++;
            statsByCountry[country].totalBarcos.add(trip.barcoId);
            statsByCountry[country].totalPuertosOrigen.add(trip.puertoOrigen);
            statsByCountry[country].totalPuertosDestino.add(trip.puertoDestino);

            // Contar por estado
            switch (trip.estado) {
                case 'En curso':
                    statsByCountry[country].viajesEnCurso++;
                    break;
                case 'Finalizado':
                    statsByCountry[country].viajesFinalizados++;
                    break;
                case 'Pausado':
                    statsByCountry[country].viajesPausados++;
                    break;
                case 'Cancelado':
                    statsByCountry[country].viajesCancelados++;
                    break;
            }

            // Acumular distancia
            if (trip.distanciaEstimada) {
                statsByCountry[country].distanciaTotal += trip.distanciaEstimada;
            }

            // Calcular duración si el viaje está finalizado
            if (trip.fechaFin) {
                const duracion = (new Date(trip.fechaFin) - new Date(trip.fechaInicio)) / (1000 * 60 * 60 * 24);
                statsByCountry[country].duracionTotalDias += duracion;
            }

            statsByCountry[country].viajes.push({
                tripId: trip.id,
                barcoId: trip.barcoId,
                puertoOrigen: trip.puertoOrigen,
                puertoDestino: trip.puertoDestino,
                fechaInicio: trip.fechaInicio,
                fechaFin: trip.fechaFin,
                estado: trip.estado
            });
        });

        // Convertir Sets a conteos y calcular promedios
        Object.keys(statsByCountry).forEach(country => {
            const stats = statsByCountry[country];
            stats.totalBarcos = stats.totalBarcos.size;
            stats.totalPuertosOrigen = stats.totalPuertosOrigen.size;
            stats.totalPuertosDestino = stats.totalPuertosDestino.size;

            // Promedios
            stats.distanciaPromedio = stats.totalViajes > 0 
                ? (stats.distanciaTotal / stats.totalViajes).toFixed(2)
                : 0;

            stats.duracionPromedioDias = stats.viajesFinalizados > 0
                ? (stats.duracionTotalDias / stats.viajesFinalizados).toFixed(2)
                : 0;
        });

        return statsByCountry;
    }

    /**
     * Obtiene resumen general de estadísticas
     * @param {Object} options - Opciones de filtrado
     * @returns {Object} Resumen general
     */
    getGeneralSummary(options = {}) {
        const statsByCountry = this.getTripStatsByCountry(options);
        const countries = Object.keys(statsByCountry);

        if (countries.length === 0) {
            return {
                totalPaises: 0,
                totalViajes: 0,
                totalBarcos: 0,
                distanciaTotal: 0,
                duracionTotal: 0
            };
        }

        const summary = {
            totalPaises: countries.length,
            totalViajes: 0,
            totalBarcos: new Set(),
            distanciaTotal: 0,
            duracionTotal: 0,
            viajesEnCurso: 0,
            viajesFinalizados: 0,
            viajesPausados: 0,
            viajesCancelados: 0
        };

        countries.forEach(country => {
            const stats = statsByCountry[country];
            summary.totalViajes += stats.totalViajes;
            summary.distanciaTotal += stats.distanciaTotal;
            summary.duracionTotal += stats.duracionTotalDias;
            summary.viajesEnCurso += stats.viajesEnCurso;
            summary.viajesFinalizados += stats.viajesFinalizados;
            summary.viajesPausados += stats.viajesPausados;
            summary.viajesCancelados += stats.viajesCancelados;

            stats.viajes.forEach(trip => {
                summary.totalBarcos.add(trip.barcoId);
            });
        });

        summary.totalBarcos = summary.totalBarcos.size;
        summary.distanciaPromedio = summary.totalViajes > 0
            ? (summary.distanciaTotal / summary.totalViajes).toFixed(2)
            : 0;
        summary.duracionPromedio = summary.viajesFinalizados > 0
            ? (summary.duracionTotal / summary.viajesFinalizados).toFixed(2)
            : 0;

        return summary;
    }

    /**
     * Obtiene top N países por número de viajes
     * @param {number} limit - Número de países a retornar
     * @param {Object} options - Opciones de filtrado
     * @returns {Array} Top países
     */
    getTopCountriesByTrips(limit = 10, options = {}) {
        const statsByCountry = this.getTripStatsByCountry(options);
        
        return Object.values(statsByCountry)
            .sort((a, b) => b.totalViajes - a.totalViajes)
            .slice(0, limit)
            .map(stats => ({
                pais: stats.pais,
                totalViajes: stats.totalViajes,
                totalBarcos: stats.totalBarcos,
                distanciaTotal: stats.distanciaTotal,
                duracionPromedio: stats.duracionPromedioDias
            }));
    }

    /**
     * Obtiene top N países por distancia recorrida
     * @param {number} limit - Número de países a retornar
     * @param {Object} options - Opciones de filtrado
     * @returns {Array} Top países
     */
    getTopCountriesByDistance(limit = 10, options = {}) {
        const statsByCountry = this.getTripStatsByCountry(options);
        
        return Object.values(statsByCountry)
            .sort((a, b) => b.distanciaTotal - a.distanciaTotal)
            .slice(0, limit)
            .map(stats => ({
                pais: stats.pais,
                distanciaTotal: stats.distanciaTotal,
                totalViajes: stats.totalViajes,
                distanciaPromedio: stats.distanciaPromedio
            }));
    }

    /**
     * Obtiene estadísticas de viajes por mes
     * @param {string} pais - País/bandera (opcional)
     * @param {number} year - Año (opcional)
     * @returns {Array} Estadísticas mensuales
     */
    getTripsByMonth(pais = null, year = null) {
        if (!window.TripService || !window.BoatService) {
            return [];
        }

        let trips = window.TripService.getAll();
        const boats = window.BoatService.getAll();

        // Filtrar por país
        if (pais) {
            trips = trips.filter(trip => {
                const boat = boats.find(b => b.id === trip.barcoId);
                return boat && boat.bandera === pais;
            });
        }

        // Filtrar por año
        if (year) {
            trips = trips.filter(trip => {
                const tripYear = new Date(trip.fechaInicio).getFullYear();
                return tripYear === year;
            });
        }

        // Agrupar por mes
        const monthlyStats = {};
        const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                       'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

        trips.forEach(trip => {
            const date = new Date(trip.fechaInicio);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const monthName = months[date.getMonth()];

            if (!monthlyStats[monthKey]) {
                monthlyStats[monthKey] = {
                    mes: monthName,
                    año: date.getFullYear(),
                    totalViajes: 0,
                    viajesFinalizados: 0,
                    viajesEnCurso: 0
                };
            }

            monthlyStats[monthKey].totalViajes++;
            if (trip.estado === 'Finalizado') {
                monthlyStats[monthKey].viajesFinalizados++;
            } else if (trip.estado === 'En curso') {
                monthlyStats[monthKey].viajesEnCurso++;
            }
        });

        return Object.values(monthlyStats).sort((a, b) => {
            const dateA = `${a.año}-${months.indexOf(a.mes) + 1}`;
            const dateB = `${b.año}-${months.indexOf(b.mes) + 1}`;
            return dateA.localeCompare(dateB);
        });
    }

    /**
     * Obtiene rutas más frecuentes
     * @param {string} pais - País/bandera (opcional)
     * @param {number} limit - Número de rutas a retornar
     * @returns {Array} Rutas más frecuentes
     */
    getMostFrequentRoutes(pais = null, limit = 10) {
        if (!window.TripService || !window.BoatService) {
            return [];
        }

        let trips = window.TripService.getAll();
        const boats = window.BoatService.getAll();

        // Filtrar por país
        if (pais) {
            trips = trips.filter(trip => {
                const boat = boats.find(b => b.id === trip.barcoId);
                return boat && boat.bandera === pais;
            });
        }

        // Contar rutas
        const routes = {};
        trips.forEach(trip => {
            const routeKey = `${trip.puertoOrigen} → ${trip.puertoDestino}`;
            if (!routes[routeKey]) {
                routes[routeKey] = {
                    origen: trip.puertoOrigen,
                    destino: trip.puertoDestino,
                    ruta: routeKey,
                    frecuencia: 0,
                    distanciaPromedio: 0,
                    distanciaTotal: 0,
                    duracionPromedio: 0,
                    duracionTotal: 0,
                    viajesFinalizados: 0
                };
            }

            routes[routeKey].frecuencia++;

            if (trip.distanciaEstimada) {
                routes[routeKey].distanciaTotal += trip.distanciaEstimada;
            }

            if (trip.fechaFin) {
                const duracion = (new Date(trip.fechaFin) - new Date(trip.fechaInicio)) / (1000 * 60 * 60 * 24);
                routes[routeKey].duracionTotal += duracion;
                routes[routeKey].viajesFinalizados++;
            }
        });

        // Calcular promedios
        Object.keys(routes).forEach(routeKey => {
            const route = routes[routeKey];
            route.distanciaPromedio = route.frecuencia > 0
                ? (route.distanciaTotal / route.frecuencia).toFixed(2)
                : 0;
            route.duracionPromedio = route.viajesFinalizados > 0
                ? (route.duracionTotal / route.viajesFinalizados).toFixed(2)
                : 0;
        });

        return Object.values(routes)
            .sort((a, b) => b.frecuencia - a.frecuencia)
            .slice(0, limit);
    }

    /**
     * Obtiene comparativa entre países
     * @param {Array} paises - Lista de países a comparar
     * @param {Object} options - Opciones de filtrado
     * @returns {Array} Comparativa
     */
    compareCountries(paises, options = {}) {
        const allStats = this.getTripStatsByCountry(options);
        const comparison = [];

        paises.forEach(pais => {
            if (allStats[pais]) {
                comparison.push({
                    pais: pais,
                    totalViajes: allStats[pais].totalViajes,
                    viajesFinalizados: allStats[pais].viajesFinalizados,
                    totalBarcos: allStats[pais].totalBarcos,
                    distanciaTotal: allStats[pais].distanciaTotal,
                    distanciaPromedio: allStats[pais].distanciaPromedio,
                    duracionPromedio: allStats[pais].duracionPromedioDias
                });
            }
        });

        return comparison;
    }

    /**
     * Genera reporte completo de estadísticas
     * @param {Object} options - Opciones del reporte
     * @returns {Object} Reporte completo
     */
    generateReport(options = {}) {
        return {
            fecha: new Date().toISOString(),
            filtros: options,
            resumenGeneral: this.getGeneralSummary(options),
            estadisticasPorPais: this.getTripStatsByCountry(options),
            topPaises: this.getTopCountriesByTrips(10, options),
            topPaisesDistancia: this.getTopCountriesByDistance(10, options),
            estadisticasMensuales: this.getTripsByMonth(options.pais, options.año),
            rutasFrecuentes: this.getMostFrequentRoutes(options.pais, 10)
        };
    }

    /**
     * Exporta estadísticas a JSON
     * @param {Object} data - Datos a exportar
     * @returns {string} JSON string
     */
    exportJSON(data) {
        return JSON.stringify(data, null, 2);
    }

    /**
     * Exporta estadísticas de países a CSV
     * @param {Object} statsByCountry - Estadísticas por país
     * @returns {string} CSV string
     */
    exportCSV(statsByCountry) {
        const data = Object.values(statsByCountry);
        if (data.length === 0) return '';

        const headers = ['País', 'Total Viajes', 'En Curso', 'Finalizados', 'Pausados', 'Cancelados', 
                        'Total Barcos', 'Distancia Total', 'Distancia Promedio', 'Duración Promedio (días)'];
        
        const rows = data.map(stats => [
            stats.pais,
            stats.totalViajes,
            stats.viajesEnCurso,
            stats.viajesFinalizados,
            stats.viajesPausados,
            stats.viajesCancelados,
            stats.totalBarcos,
            stats.distanciaTotal,
            stats.distanciaPromedio,
            stats.duracionPromedioDias
        ]);

        return [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');
    }

    /**
     * Obtiene datos para gráficos
     * @param {string} chartType - Tipo de gráfico (bar, pie, line)
     * @param {Object} options - Opciones
     * @returns {Object} Datos formateados para gráficos
     */
    getChartData(chartType, options = {}) {
        const statsByCountry = this.getTripStatsByCountry(options);
        const countries = Object.keys(statsByCountry).sort((a, b) => 
            statsByCountry[b].totalViajes - statsByCountry[a].totalViajes
        ).slice(0, options.limit || 10);

        switch (chartType) {
            case 'bar':
                return {
                    labels: countries,
                    datasets: [{
                        label: 'Total Viajes',
                        data: countries.map(country => statsByCountry[country].totalViajes)
                    }]
                };

            case 'pie':
                return {
                    labels: countries,
                    data: countries.map(country => statsByCountry[country].totalViajes)
                };

            case 'line':
                const monthlyData = this.getTripsByMonth(options.pais, options.año);
                return {
                    labels: monthlyData.map(m => `${m.mes} ${m.año}`),
                    datasets: [{
                        label: 'Viajes por Mes',
                        data: monthlyData.map(m => m.totalViajes)
                    }]
                };

            default:
                return {};
        }
    }
}

// Crear instancia global
window.StatisticsService = new StatisticsService();
