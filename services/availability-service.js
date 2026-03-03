/**
 * availability-service.js
 * Servicio para consultar disponibilidad de productos por bandera/país
 * Caso de Uso 8: Consulta de disponibilidad de un producto y bandera
 */

class AvailabilityService {
    constructor() {
        // Este servicio no necesita storage, consulta datos de otros servicios
    }

    /**
     * Obtiene disponibilidad de productos por bandera
     * @param {string} bandera - Bandera/país del barco (opcional)
     * @param {string} productoId - ID del producto (opcional)
     * @returns {Array} Lista de disponibilidad
     */
    getAvailability(bandera = null, productoId = null) {
        if (!window.InventoryService || !window.BoatService || !window.ProductService) {
            console.error('Servicios requeridos no disponibles');
            return [];
        }

        const inventory = window.InventoryService.getAll();
        const boats = window.BoatService.getAll();
        const products = window.ProductService.getAll();

        // Construir disponibilidad
        const availability = [];

        inventory.forEach(item => {
            const boat = boats.find(b => b.id === item.barcoId);
            const product = products.find(p => p.id === item.productoId);

            if (!boat || !product) return;

            // Filtrar por bandera si se especifica
            if (bandera && boat.bandera !== bandera) return;

            // Filtrar por producto si se especifica
            if (productoId && item.productoId !== productoId) return;

            availability.push({
                barcoId: boat.id,
                barcoNombre: boat.nombre,
                barcoMatricula: boat.matricula,
                bandera: boat.bandera,
                productoId: product.id,
                productoNombre: product.nombre,
                productoCategoria: product.categoria,
                cantidad: item.cantidad,
                unidad: item.unidad,
                precioUnitario: product.precioUnitario || 0,
                valorTotal: (product.precioUnitario || 0) * item.cantidad,
                estadoBarco: boat.estadoActual,
                ultimaActualizacion: item.updatedAt
            });
        });

        return availability;
    }

    /**
     * Obtiene disponibilidad agrupada por bandera
     * @param {string} productoId - ID del producto (opcional)
     * @returns {Object} Disponibilidad agrupada por bandera
     */
    getAvailabilityByFlag(productoId = null) {
        const availability = this.getAvailability(null, productoId);
        const grouped = {};

        availability.forEach(item => {
            if (!grouped[item.bandera]) {
                grouped[item.bandera] = {
                    bandera: item.bandera,
                    totalBarcos: 0,
                    productos: {},
                    valorTotal: 0
                };
            }

            grouped[item.bandera].totalBarcos++;
            grouped[item.bandera].valorTotal += item.valorTotal;

            if (!grouped[item.bandera].productos[item.productoId]) {
                grouped[item.bandera].productos[item.productoId] = {
                    productoId: item.productoId,
                    productoNombre: item.productoNombre,
                    productoCategoria: item.productoCategoria,
                    cantidadTotal: 0,
                    unidad: item.unidad,
                    barcos: []
                };
            }

            grouped[item.bandera].productos[item.productoId].cantidadTotal += item.cantidad;
            grouped[item.bandera].productos[item.productoId].barcos.push({
                barcoId: item.barcoId,
                barcoNombre: item.barcoNombre,
                cantidad: item.cantidad
            });
        });

        return grouped;
    }

    /**
     * Obtiene disponibilidad agrupada por producto
     * @param {string} bandera - Bandera/país (opcional)
     * @returns {Object} Disponibilidad agrupada por producto
     */
    getAvailabilityByProduct(bandera = null) {
        const availability = this.getAvailability(bandera, null);
        const grouped = {};

        availability.forEach(item => {
            if (!grouped[item.productoId]) {
                grouped[item.productoId] = {
                    productoId: item.productoId,
                    productoNombre: item.productoNombre,
                    productoCategoria: item.productoCategoria,
                    cantidadTotal: 0,
                    unidad: item.unidad,
                    valorTotal: 0,
                    banderas: {},
                    totalBarcos: 0
                };
            }

            grouped[item.productoId].cantidadTotal += item.cantidad;
            grouped[item.productoId].valorTotal += item.valorTotal;
            grouped[item.productoId].totalBarcos++;

            if (!grouped[item.productoId].banderas[item.bandera]) {
                grouped[item.productoId].banderas[item.bandera] = {
                    bandera: item.bandera,
                    cantidad: 0,
                    barcos: []
                };
            }

            grouped[item.productoId].banderas[item.bandera].cantidad += item.cantidad;
            grouped[item.productoId].banderas[item.bandera].barcos.push({
                barcoId: item.barcoId,
                barcoNombre: item.barcoNombre,
                cantidad: item.cantidad
            });
        });

        return grouped;
    }

    /**
     * Obtiene lista de banderas disponibles con stock
     * @returns {Array} Lista de banderas
     */
    getAvailableFlags() {
        const availability = this.getAvailability();
        const flags = new Set();

        availability.forEach(item => {
            flags.add(item.bandera);
        });

        return Array.from(flags).sort();
    }

    /**
     * Obtiene lista de productos disponibles con stock
     * @param {string} bandera - Filtrar por bandera (opcional)
     * @returns {Array} Lista de productos
     */
    getAvailableProducts(bandera = null) {
        const availability = this.getAvailability(bandera, null);
        const productsMap = new Map();

        availability.forEach(item => {
            if (!productsMap.has(item.productoId)) {
                productsMap.set(item.productoId, {
                    productoId: item.productoId,
                    productoNombre: item.productoNombre,
                    productoCategoria: item.productoCategoria,
                    cantidadTotal: 0
                });
            }

            const product = productsMap.get(item.productoId);
            product.cantidadTotal += item.cantidad;
        });

        return Array.from(productsMap.values()).sort((a, b) => 
            a.productoNombre.localeCompare(b.productoNombre)
        );
    }

    /**
     * Busca disponibilidad por término
     * @param {string} searchTerm - Término de búsqueda
     * @returns {Array} Resultados
     */
    search(searchTerm) {
        if (!searchTerm) return this.getAvailability();

        const term = searchTerm.toLowerCase();
        const availability = this.getAvailability();

        return availability.filter(item => {
            return (
                item.barcoNombre.toLowerCase().includes(term) ||
                item.productoNombre.toLowerCase().includes(term) ||
                item.bandera.toLowerCase().includes(term) ||
                item.barcoMatricula.toLowerCase().includes(term)
            );
        });
    }

    /**
     * Filtra disponibilidad por múltiples criterios
     * @param {Object} filters - Filtros
     * @returns {Array} Disponibilidad filtrada
     */
    filter(filters) {
        let result = this.getAvailability();

        if (filters.bandera) {
            result = result.filter(item => item.bandera === filters.bandera);
        }

        if (filters.productoId) {
            result = result.filter(item => item.productoId === filters.productoId);
        }

        if (filters.categoria) {
            result = result.filter(item => item.productoCategoria === filters.categoria);
        }

        if (filters.minCantidad !== undefined) {
            result = result.filter(item => item.cantidad >= filters.minCantidad);
        }

        if (filters.estadoBarco) {
            result = result.filter(item => item.estadoBarco === filters.estadoBarco);
        }

        return result;
    }

    /**
     * Obtiene resumen de disponibilidad
     * @param {string} bandera - Bandera (opcional)
     * @param {string} productoId - Producto (opcional)
     * @returns {Object} Resumen
     */
    getSummary(bandera = null, productoId = null) {
        const availability = this.getAvailability(bandera, productoId);

        const summary = {
            totalItems: availability.length,
            totalBarcos: new Set(availability.map(item => item.barcoId)).size,
            totalProductos: new Set(availability.map(item => item.productoId)).size,
            totalBanderas: new Set(availability.map(item => item.bandera)).size,
            cantidadTotal: availability.reduce((sum, item) => sum + item.cantidad, 0),
            valorTotal: availability.reduce((sum, item) => sum + item.valorTotal, 0)
        };

        // Por categoría
        summary.porCategoria = {};
        availability.forEach(item => {
            if (!summary.porCategoria[item.productoCategoria]) {
                summary.porCategoria[item.productoCategoria] = {
                    cantidad: 0,
                    valor: 0,
                    productos: 0
                };
            }
            summary.porCategoria[item.productoCategoria].cantidad += item.cantidad;
            summary.porCategoria[item.productoCategoria].valor += item.valorTotal;
            summary.porCategoria[item.productoCategoria].productos++;
        });

        return summary;
    }

    /**
     * Obtiene estadísticas de disponibilidad por bandera
     * @returns {Array} Estadísticas por bandera
     */
    getStatsByFlag() {
        const byFlag = this.getAvailabilityByFlag();
        const stats = [];

        Object.keys(byFlag).forEach(flag => {
            const flagData = byFlag[flag];
            const productos = Object.values(flagData.productos);

            stats.push({
                bandera: flag,
                totalBarcos: flagData.totalBarcos,
                totalProductos: productos.length,
                cantidadTotal: productos.reduce((sum, p) => sum + p.cantidadTotal, 0),
                valorTotal: flagData.valorTotal,
                productosDetalle: productos.map(p => ({
                    nombre: p.productoNombre,
                    cantidad: p.cantidadTotal,
                    unidad: p.unidad
                }))
            });
        });

        return stats.sort((a, b) => b.valorTotal - a.valorTotal);
    }

    /**
     * Obtiene estadísticas de disponibilidad por producto
     * @returns {Array} Estadísticas por producto
     */
    getStatsByProduct() {
        const byProduct = this.getAvailabilityByProduct();
        const stats = [];

        Object.keys(byProduct).forEach(prodId => {
            const productData = byProduct[prodId];
            const banderas = Object.values(productData.banderas);

            stats.push({
                productoId: prodId,
                productoNombre: productData.productoNombre,
                productoCategoria: productData.productoCategoria,
                cantidadTotal: productData.cantidadTotal,
                unidad: productData.unidad,
                valorTotal: productData.valorTotal,
                totalBarcos: productData.totalBarcos,
                totalBanderas: banderas.length,
                banderasDetalle: banderas.map(b => ({
                    bandera: b.bandera,
                    cantidad: b.cantidad,
                    barcos: b.barcos.length
                }))
            });
        });

        return stats.sort((a, b) => b.cantidadTotal - a.cantidadTotal);
    }

    /**
     * Verifica si hay disponibilidad de un producto en una bandera
     * @param {string} productoId - ID del producto
     * @param {string} bandera - Bandera
     * @param {number} cantidadRequerida - Cantidad requerida (opcional)
     * @returns {Object} Información de disponibilidad
     */
    checkAvailability(productoId, bandera, cantidadRequerida = 0) {
        const availability = this.getAvailability(bandera, productoId);

        const totalDisponible = availability.reduce((sum, item) => sum + item.cantidad, 0);
        const barcosDisponibles = availability.length;

        return {
            disponible: totalDisponible > 0 && totalDisponible >= cantidadRequerida,
            cantidadDisponible: totalDisponible,
            cantidadRequerida: cantidadRequerida,
            barcosDisponibles: barcosDisponibles,
            barcos: availability.map(item => ({
                barcoId: item.barcoId,
                barcoNombre: item.barcoNombre,
                cantidad: item.cantidad,
                estadoBarco: item.estadoBarco
            }))
        };
    }

    /**
     * Ordena disponibilidad por campo
     * @param {Array} availability - Lista de disponibilidad
     * @param {string} field - Campo a ordenar
     * @param {string} order - Orden (asc/desc)
     * @returns {Array} Lista ordenada
     */
    sortBy(availability, field, order = 'asc') {
        return [...availability].sort((a, b) => {
            let valueA = a[field];
            let valueB = b[field];

            // Manejar null/undefined
            if (valueA == null) return 1;
            if (valueB == null) return -1;

            if (valueA < valueB) return order === 'asc' ? -1 : 1;
            if (valueA > valueB) return order === 'asc' ? 1 : -1;
            return 0;
        });
    }

    /**
     * Exporta disponibilidad a JSON
     * @param {Array} availability - Datos a exportar (opcional)
     * @returns {string} JSON string
     */
    exportJSON(availability = null) {
        const data = availability || this.getAvailability();
        return JSON.stringify(data, null, 2);
    }

    /**
     * Exporta disponibilidad a CSV
     * @param {Array} availability - Datos a exportar (opcional)
     * @returns {string} CSV string
     */
    exportCSV(availability = null) {
        const data = availability || this.getAvailability();
        if (data.length === 0) return '';

        const headers = ['Barco', 'Matrícula', 'Bandera', 'Producto', 'Categoría', 'Cantidad', 'Unidad', 'Precio Unit.', 'Valor Total', 'Estado Barco'];
        const rows = data.map(item => [
            item.barcoNombre,
            item.barcoMatricula,
            item.bandera,
            item.productoNombre,
            item.productoCategoria,
            item.cantidad,
            item.unidad,
            item.precioUnitario,
            item.valorTotal,
            item.estadoBarco
        ]);

        return [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');
    }

    /**
     * Genera reporte de disponibilidad
     * @param {Object} options - Opciones del reporte
     * @returns {Object} Reporte generado
     */
    generateReport(options = {}) {
        const availability = this.getAvailability(options.bandera, options.productoId);
        const summary = this.getSummary(options.bandera, options.productoId);

        return {
            fecha: new Date().toISOString(),
            filtros: {
                bandera: options.bandera || 'Todas',
                producto: options.productoId || 'Todos'
            },
            resumen: summary,
            disponibilidad: availability,
            estadisticasPorBandera: this.getStatsByFlag(),
            estadisticasPorProducto: this.getStatsByProduct()
        };
    }
}

// Crear instancia global
window.AvailabilityService = new AvailabilityService();
