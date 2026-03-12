/**
 * inventory-service.js
 * Servicio para gestión de inventario de productos en barcos
 * Caso de Uso 5: Control de Inventario
 */

class InventoryService {
    constructor() {
        this.storageKey = 'boat_system_inventory';
        this.initializeStorage();
        this.seedInitialData();
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
     * Si no existe inventario, siembra datos mock para visualizaciones iniciales.
     * No sobreescribe datos ya existentes del usuario.
     */
    seedInitialData() {
        const existing = this.getAll();
        if (existing.length > 0) return;

        const now = new Date().toISOString();
        const mockInventory = [
            { barcoId: 'B001', productoId: 'PROD001', cantidad: 120, unidad: 'Unidades', ultimaActualizacion: now, createdAt: now, updatedAt: now },
            { barcoId: 'B001', productoId: 'PROD002', cantidad: 850, unidad: 'Kg',       ultimaActualizacion: now, createdAt: now, updatedAt: now },
            { barcoId: 'B002', productoId: 'PROD001', cantidad: 95,  unidad: 'Unidades', ultimaActualizacion: now, createdAt: now, updatedAt: now },
            { barcoId: 'B002', productoId: 'PROD004', cantidad: 420, unidad: 'Kg',       ultimaActualizacion: now, createdAt: now, updatedAt: now },
            { barcoId: 'B003', productoId: 'PROD003', cantidad: 610, unidad: 'Kg',       ultimaActualizacion: now, createdAt: now, updatedAt: now },
            { barcoId: 'B004', productoId: 'PROD005', cantidad: 730, unidad: 'Kg',       ultimaActualizacion: now, createdAt: now, updatedAt: now },
            { barcoId: 'B005', productoId: 'PROD006', cantidad: 540, unidad: 'Kg',       ultimaActualizacion: now, createdAt: now, updatedAt: now },
            { barcoId: 'B006', productoId: 'PROD007', cantidad: 160, unidad: 'Paquete',  ultimaActualizacion: now, createdAt: now, updatedAt: now },
            { barcoId: 'B007', productoId: 'PROD008', cantidad: 75,  unidad: 'Caja',     ultimaActualizacion: now, createdAt: now, updatedAt: now }
        ];

        localStorage.setItem(this.storageKey, JSON.stringify(mockInventory));
    }

    /**
     * Obtiene todo el inventario
     * @returns {Array} Lista de items de inventario
     */
    getAll() {
        try {
            const inventory = localStorage.getItem(this.storageKey);
            return inventory ? JSON.parse(inventory) : [];
        } catch (error) {
            console.error('Error al obtener inventario:', error);
            return [];
        }
    }

    /**
     * Obtiene un item de inventario específico
     * @param {string} barcoId - ID del barco
     * @param {string} productoId - ID del producto
     * @returns {Object|null} Item de inventario
     */
    getItem(barcoId, productoId) {
        const inventory = this.getAll();
        return inventory.find(item => 
            item.barcoId === barcoId && item.productoId === productoId
        ) || null;
    }

    /**
     * Obtiene inventario por barco
     * @param {string} barcoId - ID del barco
     * @returns {Array} Items de inventario del barco
     */
    getByBoat(barcoId) {
        return this.getAll().filter(item => item.barcoId === barcoId);
    }

    /**
     * Obtiene inventario por producto
     * @param {string} productoId - ID del producto
     * @returns {Array} Items de inventario del producto
     */
    getByProduct(productoId) {
        return this.getAll().filter(item => item.productoId === productoId);
    }

    /**
     * Añade stock a un barco
     * @param {string} barcoId - ID del barco
     * @param {string} productoId - ID del producto
     * @param {number} cantidad - Cantidad a añadir
     * @param {string} unidad - Unidad de medida (opcional)
     * @returns {Object} Resultado de la operación
     */
    addStock(barcoId, productoId, cantidad, unidad = null) {
        try {
            if (cantidad <= 0) {
                return { success: false, error: 'La cantidad debe ser mayor a 0' };
            }

            const inventory = this.getAll();
            const existingIndex = inventory.findIndex(item => 
                item.barcoId === barcoId && item.productoId === productoId
            );

            if (existingIndex !== -1) {
                // Actualizar item existente
                inventory[existingIndex].cantidad += cantidad;
                inventory[existingIndex].updatedAt = new Date().toISOString();
            } else {
                // Crear nuevo item
                // Obtener unidad del producto si no se especifica
                if (!unidad && window.ProductService) {
                    const product = window.ProductService.getById(productoId);
                    unidad = product ? product.unidadMedida : 'Unidad';
                }

                inventory.push({
                    barcoId,
                    productoId,
                    cantidad,
                    unidad: unidad || 'Unidad',
                    ultimaActualizacion: new Date().toISOString(),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
            }

            localStorage.setItem(this.storageKey, JSON.stringify(inventory));
            return { success: true, data: this.getItem(barcoId, productoId) };
        } catch (error) {
            console.error('Error al añadir stock:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Remueve stock de un barco
     * @param {string} barcoId - ID del barco
     * @param {string} productoId - ID del producto
     * @param {number} cantidad - Cantidad a remover
     * @returns {Object} Resultado de la operación
     */
    removeStock(barcoId, productoId, cantidad) {
        try {
            if (cantidad <= 0) {
                return { success: false, error: 'La cantidad debe ser mayor a 0' };
            }

            const inventory = this.getAll();
            const existingIndex = inventory.findIndex(item => 
                item.barcoId === barcoId && item.productoId === productoId
            );

            if (existingIndex === -1) {
                return { success: false, error: 'Producto no encontrado en inventario' };
            }

            // Verificar stock suficiente
            if (inventory[existingIndex].cantidad < cantidad) {
                return { 
                    success: false, 
                    error: `Stock insuficiente. Disponible: ${inventory[existingIndex].cantidad}`
                };
            }

            // Actualizar cantidad
            inventory[existingIndex].cantidad -= cantidad;
            inventory[existingIndex].updatedAt = new Date().toISOString();

            // Si la cantidad es 0, eliminar el item
            if (inventory[existingIndex].cantidad === 0) {
                inventory.splice(existingIndex, 1);
            }

            localStorage.setItem(this.storageKey, JSON.stringify(inventory));
            return { success: true, data: this.getItem(barcoId, productoId) };
        } catch (error) {
            console.error('Error al remover stock:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Establece el stock de un producto en un barco
     * @param {string} barcoId - ID del barco
     * @param {string} productoId - ID del producto
     * @param {number} cantidad - Cantidad a establecer
     * @param {string} unidad - Unidad de medida (opcional)
     * @returns {Object} Resultado de la operación
     */
    setStock(barcoId, productoId, cantidad, unidad = null) {
        try {
            if (cantidad < 0) {
                return { success: false, error: 'La cantidad no puede ser negativa' };
            }

            const inventory = this.getAll();
            const existingIndex = inventory.findIndex(item => 
                item.barcoId === barcoId && item.productoId === productoId
            );

            if (cantidad === 0) {
                // Si la cantidad es 0, eliminar el item
                if (existingIndex !== -1) {
                    inventory.splice(existingIndex, 1);
                }
            } else {
                if (existingIndex !== -1) {
                    // Actualizar item existente
                    inventory[existingIndex].cantidad = cantidad;
                    if (unidad) inventory[existingIndex].unidad = unidad;
                    inventory[existingIndex].updatedAt = new Date().toISOString();
                } else {
                    // Crear nuevo item
                    if (!unidad && window.ProductService) {
                        const product = window.ProductService.getById(productoId);
                        unidad = product ? product.unidadMedida : 'Unidad';
                    }

                    inventory.push({
                        barcoId,
                        productoId,
                        cantidad,
                        unidad: unidad || 'Unidad',
                        ultimaActualizacion: new Date().toISOString(),
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    });
                }
            }

            localStorage.setItem(this.storageKey, JSON.stringify(inventory));
            return { success: true, data: this.getItem(barcoId, productoId) };
        } catch (error) {
            console.error('Error al establecer stock:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Verifica si hay stock disponible
     * @param {string} barcoId - ID del barco
     * @param {string} productoId - ID del producto
     * @param {number} cantidadRequerida - Cantidad requerida
     * @returns {boolean} True si hay stock suficiente
     */
    hasStock(barcoId, productoId, cantidadRequerida) {
        const item = this.getItem(barcoId, productoId);
        return item && item.cantidad >= cantidadRequerida;
    }

    /**
     * Obtiene la cantidad disponible de un producto en un barco
     * @param {string} barcoId - ID del barco
     * @param {string} productoId - ID del producto
     * @returns {number} Cantidad disponible
     */
    getAvailableQuantity(barcoId, productoId) {
        const item = this.getItem(barcoId, productoId);
        return item ? item.cantidad : 0;
    }

    /**
     * Obtiene productos con stock bajo (cantidad < umbral)
     * @param {number} umbral - Cantidad mínima
     * @returns {Array} Items con stock bajo
     */
    getLowStock(umbral = 10) {
        return this.getAll().filter(item => item.cantidad < umbral);
    }

    /**
     * Obtiene productos sin stock
     * @returns {Array} Items sin stock
     */
    getOutOfStock() {
        return this.getAll().filter(item => item.cantidad === 0);
    }

    /**
     * Obtiene el total de stock de un producto en todos los barcos
     * @param {string} productoId - ID del producto
     * @returns {number} Total de stock
     */
    getTotalStockByProduct(productoId) {
        const items = this.getByProduct(productoId);
        return items.reduce((total, item) => total + item.cantidad, 0);
    }

    /**
     * Obtiene el total de stock en un barco
     * @param {string} barcoId - ID del barco
     * @returns {number} Total de items diferentes
     */
    getTotalItemsByBoat(barcoId) {
        const items = this.getByBoat(barcoId);
        return items.length;
    }

    /**
     * Obtiene estadísticas de inventario
     * @returns {Object} Estadísticas
     */
    getStats() {
        const inventory = this.getAll();
        
        const stats = {
            totalItems: inventory.length,
            totalProducts: new Set(inventory.map(item => item.productoId)).size,
            totalBoats: new Set(inventory.map(item => item.barcoId)).size,
            lowStockItems: this.getLowStock().length,
            outOfStockItems: this.getOutOfStock().length
        };

        // Calcular valor total si ProductService está disponible
        if (window.ProductService) {
            stats.totalValue = inventory.reduce((total, item) => {
                const product = window.ProductService.getById(item.productoId);
                if (product && product.precioUnitario) {
                    return total + (product.precioUnitario * item.cantidad);
                }
                return total;
            }, 0);
        }

        return stats;
    }

    /**
     * Obtiene resumen de inventario por barco
     * @param {string} barcoId - ID del barco
     * @returns {Object} Resumen del inventario
     */
    getBoatSummary(barcoId) {
        const items = this.getByBoat(barcoId);
        
        const summary = {
            barcoId,
            totalItems: items.length,
            products: items.map(item => ({
                productoId: item.productoId,
                cantidad: item.cantidad,
                unidad: item.unidad
            }))
        };

        // Calcular valor total si ProductService está disponible
        if (window.ProductService) {
            summary.totalValue = items.reduce((total, item) => {
                const product = window.ProductService.getById(item.productoId);
                if (product && product.precioUnitario) {
                    return total + (product.precioUnitario * item.cantidad);
                }
                return total;
            }, 0);
        }

        return summary;
    }

    /**
     * Obtiene resumen de inventario por producto
     * @param {string} productoId - ID del producto
     * @returns {Object} Resumen del producto
     */
    getProductSummary(productoId) {
        const items = this.getByProduct(productoId);
        
        return {
            productoId,
            totalStock: this.getTotalStockByProduct(productoId),
            boats: items.map(item => ({
                barcoId: item.barcoId,
                cantidad: item.cantidad,
                unidad: item.unidad
            })),
            boatsCount: items.length
        };
    }

    /**
     * Busca en inventario
     * @param {string} searchTerm - Término de búsqueda
     * @returns {Array} Items encontrados
     */
    search(searchTerm) {
        if (!searchTerm) return this.getAll();

        const term = searchTerm.toLowerCase();
        return this.getAll().filter(item => {
            return (
                item.barcoId.toLowerCase().includes(term) ||
                item.productoId.toLowerCase().includes(term) ||
                item.unidad.toLowerCase().includes(term)
            );
        });
    }

    /**
     * Filtra inventario por múltiples criterios
     * @param {Object} filters - Filtros {barcoId, productoId, minCantidad, maxCantidad}
     * @returns {Array} Items filtrados
     */
    filter(filters) {
        let result = this.getAll();

        if (filters.barcoId) {
            result = result.filter(item => item.barcoId === filters.barcoId);
        }

        if (filters.productoId) {
            result = result.filter(item => item.productoId === filters.productoId);
        }

        if (filters.minCantidad !== undefined) {
            result = result.filter(item => item.cantidad >= filters.minCantidad);
        }

        if (filters.maxCantidad !== undefined) {
            result = result.filter(item => item.cantidad <= filters.maxCantidad);
        }

        if (filters.lowStock) {
            result = result.filter(item => item.cantidad < 10);
        }

        return result;
    }

    /**
     * Ordena inventario por campo
     * @param {Array} items - Lista de items
     * @param {string} field - Campo a ordenar
     * @param {string} order - Orden (asc/desc)
     * @returns {Array} Lista ordenada
     */
    sortBy(items, field, order = 'asc') {
        return [...items].sort((a, b) => {
            let valueA = a[field];
            let valueB = b[field];

            // Manejar fechas
            if (field.includes('fecha') || field.includes('At') || field.includes('Actualizacion')) {
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
     * Exporta inventario a JSON
     * @param {Array} items - Items a exportar (opcional)
     * @returns {string} JSON string
     */
    exportJSON(items = null) {
        const data = items || this.getAll();
        return JSON.stringify(data, null, 2);
    }

    /**
     * Exporta inventario a CSV
     * @param {Array} items - Items a exportar (opcional)
     * @returns {string} CSV string
     */
    exportCSV(items = null) {
        const data = items || this.getAll();
        if (data.length === 0) return '';

        const headers = ['Barco ID', 'Producto ID', 'Cantidad', 'Unidad', 'Última Actualización'];
        const rows = data.map(item => [
            item.barcoId,
            item.productoId,
            item.cantidad,
            item.unidad,
            item.updatedAt
        ]);

        return [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');
    }

    /**
     * Limpia todo el inventario (para testing)
     */
    clearAll() {
        localStorage.setItem(this.storageKey, JSON.stringify([]));
    }

    /**
     * Elimina inventario de un barco específico
     * @param {string} barcoId - ID del barco
     * @returns {Object} Resultado de la operación
     */
    clearBoatInventory(barcoId) {
        try {
            const inventory = this.getAll();
            const filtered = inventory.filter(item => item.barcoId !== barcoId);
            localStorage.setItem(this.storageKey, JSON.stringify(filtered));
            return { success: true };
        } catch (error) {
            console.error('Error al limpiar inventario del barco:', error);
            return { success: false, error: error.message };
        }
    }
}

// Crear instancia global
window.InventoryService = new InventoryService();
