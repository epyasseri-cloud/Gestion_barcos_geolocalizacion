/**
 * warehouse-service.js
 * Servicio para gestión de movimientos de bodega
 * Caso de Uso 5: Movimientos de bodega
 */

class WarehouseService {
    constructor() {
        this.storageKey = 'boat_system_warehouse_movements';
        this.MOVEMENT_TYPES = {
            INGRESO: 'Ingreso',
            EGRESO: 'Egreso',
            TRASLADO: 'Traslado'
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
     * Obtiene todos los movimientos
     * @returns {Array} Lista de movimientos
     */
    getAll() {
        try {
            const movements = localStorage.getItem(this.storageKey);
            return movements ? JSON.parse(movements) : [];
        } catch (error) {
            console.error('Error al obtener movimientos:', error);
            return [];
        }
    }

    /**
     * Obtiene un movimiento por ID
     * @param {string} id - ID del movimiento
     * @returns {Object|null} Movimiento encontrado
     */
    getById(id) {
        const movements = this.getAll();
        return movements.find(mov => mov.id === id) || null;
    }

    /**
     * Registra un nuevo movimiento
     * @param {Object} movementData - Datos del movimiento
     * @returns {Object} Resultado de la operación
     */
    create(movementData) {
        try {
            // Validaciones
            const validation = this.validateMovement(movementData);
            if (!validation.valid) {
                return { success: false, error: validation.error };
            }

            const movements = this.getAll();
            
            const newMovement = {
                id: this.generateId(),
                barcoId: movementData.barcoId,
                productoId: movementData.productoId,
                tipo: movementData.tipo,
                cantidad: parseFloat(movementData.cantidad),
                unidad: movementData.unidad,
                fecha: movementData.fecha || new Date().toISOString(),
                responsableId: movementData.responsableId,
                observaciones: movementData.observaciones || '',
                // Solo para traslados
                barcoOrigenId: movementData.barcoOrigenId || null,
                barcoDestinoId: movementData.barcoDestinoId || null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            movements.push(newMovement);
            localStorage.setItem(this.storageKey, JSON.stringify(movements));

            // Actualizar inventario
            this.updateInventoryAfterMovement(newMovement);

            return { success: true, data: newMovement };
        } catch (error) {
            console.error('Error al crear movimiento:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Actualiza un movimiento existente
     * @param {string} id - ID del movimiento
     * @param {Object} updateData - Datos a actualizar
     * @returns {Object} Resultado de la operación
     */
    update(id, updateData) {
        try {
            const movements = this.getAll();
            const index = movements.findIndex(mov => mov.id === id);

            if (index === -1) {
                return { success: false, error: 'Movimiento no encontrado' };
            }

            movements[index] = {
                ...movements[index],
                ...updateData,
                id: movements[index].id, // Preservar ID
                updatedAt: new Date().toISOString()
            };

            localStorage.setItem(this.storageKey, JSON.stringify(movements));
            return { success: true, data: movements[index] };
        } catch (error) {
            console.error('Error al actualizar movimiento:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Elimina un movimiento
     * @param {string} id - ID del movimiento
     * @returns {Object} Resultado de la operación
     */
    delete(id) {
        try {
            const movements = this.getAll();
            const filteredMovements = movements.filter(mov => mov.id !== id);

            if (movements.length === filteredMovements.length) {
                return { success: false, error: 'Movimiento no encontrado' };
            }

            localStorage.setItem(this.storageKey, JSON.stringify(filteredMovements));
            return { success: true };
        } catch (error) {
            console.error('Error al eliminar movimiento:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Valida un movimiento
     * @param {Object} movementData - Datos del movimiento
     * @returns {Object} Resultado de la validación
     */
    validateMovement(movementData) {
        if (!movementData.tipo || !Object.values(this.MOVEMENT_TYPES).includes(movementData.tipo)) {
            return { valid: false, error: 'Tipo de movimiento inválido' };
        }

        if (!movementData.productoId) {
            return { valid: false, error: 'Debe especificar un producto' };
        }

        if (!movementData.cantidad || movementData.cantidad <= 0) {
            return { valid: false, error: 'La cantidad debe ser mayor a 0' };
        }

        // Validaciones específicas por tipo
        if (movementData.tipo === this.MOVEMENT_TYPES.TRASLADO) {
            if (!movementData.barcoOrigenId || !movementData.barcoDestinoId) {
                return { valid: false, error: 'El traslado requiere barco origen y destino' };
            }
            if (movementData.barcoOrigenId === movementData.barcoDestinoId) {
                return { valid: false, error: 'El barco origen y destino no pueden ser el mismo' };
            }
        } else {
            if (!movementData.barcoId) {
                return { valid: false, error: 'Debe especificar un barco' };
            }
        }

        return { valid: true };
    }

    /**
     * Actualiza el inventario después de un movimiento
     * @param {Object} movement - Movimiento registrado
     */
    updateInventoryAfterMovement(movement) {
        if (!window.InventoryService) return;

        switch (movement.tipo) {
            case this.MOVEMENT_TYPES.INGRESO:
                window.InventoryService.addStock(
                    movement.barcoId,
                    movement.productoId,
                    movement.cantidad
                );
                break;

            case this.MOVEMENT_TYPES.EGRESO:
                window.InventoryService.removeStock(
                    movement.barcoId,
                    movement.productoId,
                    movement.cantidad
                );
                break;

            case this.MOVEMENT_TYPES.TRASLADO:
                window.InventoryService.removeStock(
                    movement.barcoOrigenId,
                    movement.productoId,
                    movement.cantidad
                );
                window.InventoryService.addStock(
                    movement.barcoDestinoId,
                    movement.productoId,
                    movement.cantidad
                );
                break;
        }
    }

    /**
     * Registra un ingreso
     * @param {Object} ingresoData - Datos del ingreso
     * @returns {Object} Resultado de la operación
     */
    registrarIngreso(ingresoData) {
        return this.create({
            ...ingresoData,
            tipo: this.MOVEMENT_TYPES.INGRESO
        });
    }

    /**
     * Registra un egreso
     * @param {Object} egresoData - Datos del egreso
     * @returns {Object} Resultado de la operación
     */
    registrarEgreso(egresoData) {
        return this.create({
            ...egresoData,
            tipo: this.MOVEMENT_TYPES.EGRESO
        });
    }

    /**
     * Registra un traslado
     * @param {Object} trasladoData - Datos del traslado
     * @returns {Object} Resultado de la operación
     */
    registrarTraslado(trasladoData) {
        return this.create({
            ...trasladoData,
            tipo: this.MOVEMENT_TYPES.TRASLADO,
            barcoId: null // No aplica para traslados
        });
    }

    /**
     * Obtiene movimientos por barco
     * @param {string} barcoId - ID del barco
     * @returns {Array} Lista de movimientos
     */
    getByBoat(barcoId) {
        return this.getAll().filter(mov => 
            mov.barcoId === barcoId || 
            mov.barcoOrigenId === barcoId || 
            mov.barcoDestinoId === barcoId
        );
    }

    /**
     * Obtiene movimientos por producto
     * @param {string} productoId - ID del producto
     * @returns {Array} Lista de movimientos
     */
    getByProduct(productoId) {
        return this.getAll().filter(mov => mov.productoId === productoId);
    }

    /**
     * Obtiene movimientos por tipo
     * @param {string} tipo - Tipo de movimiento
     * @returns {Array} Lista de movimientos
     */
    getByType(tipo) {
        return this.getAll().filter(mov => mov.tipo === tipo);
    }

    /**
     * Obtiene movimientos por responsable
     * @param {string} responsableId - ID del responsable
     * @returns {Array} Lista de movimientos
     */
    getByResponsible(responsableId) {
        return this.getAll().filter(mov => mov.responsableId === responsableId);
    }

    /**
     * Obtiene movimientos por rango de fechas
     * @param {string} fechaInicio - Fecha de inicio
     * @param {string} fechaFin - Fecha de fin
     * @returns {Array} Lista de movimientos
     */
    getByDateRange(fechaInicio, fechaFin) {
        const movements = this.getAll();
        const start = new Date(fechaInicio);
        const end = new Date(fechaFin);

        return movements.filter(mov => {
            const movDate = new Date(mov.fecha);
            return movDate >= start && movDate <= end;
        });
    }

    /**
     * Busca movimientos
     * @param {string} searchTerm - Término de búsqueda
     * @returns {Array} Lista de movimientos encontrados
     */
    search(searchTerm) {
        if (!searchTerm) return this.getAll();

        const term = searchTerm.toLowerCase();
        return this.getAll().filter(mov => {
            return (
                mov.id.toLowerCase().includes(term) ||
                mov.barcoId?.toLowerCase().includes(term) ||
                mov.productoId.toLowerCase().includes(term) ||
                mov.tipo.toLowerCase().includes(term) ||
                mov.observaciones?.toLowerCase().includes(term)
            );
        });
    }

    /**
     * Filtra movimientos por múltiples criterios
     * @param {Object} filters - Filtros {tipo, barcoId, productoId, etc.}
     * @returns {Array} Movimientos filtrados
     */
    filter(filters) {
        let result = this.getAll();

        if (filters.tipo) {
            result = result.filter(mov => mov.tipo === filters.tipo);
        }

        if (filters.barcoId) {
            result = result.filter(mov => 
                mov.barcoId === filters.barcoId || 
                mov.barcoOrigenId === filters.barcoId || 
                mov.barcoDestinoId === filters.barcoId
            );
        }

        if (filters.productoId) {
            result = result.filter(mov => mov.productoId === filters.productoId);
        }

        if (filters.responsableId) {
            result = result.filter(mov => mov.responsableId === filters.responsableId);
        }

        if (filters.fechaInicio && filters.fechaFin) {
            result = this.getByDateRange(filters.fechaInicio, filters.fechaFin);
        }

        return result;
    }

    /**
     * Obtiene estadísticas de movimientos
     * @returns {Object} Estadísticas
     */
    getStats() {
        const movements = this.getAll();
        
        return {
            total: movements.length,
            ingresos: movements.filter(m => m.tipo === this.MOVEMENT_TYPES.INGRESO).length,
            egresos: movements.filter(m => m.tipo === this.MOVEMENT_TYPES.EGRESO).length,
            traslados: movements.filter(m => m.tipo === this.MOVEMENT_TYPES.TRASLADO).length,
            // Últimos movimientos
            ultimosMovimientos: movements
                .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
                .slice(0, 10)
        };
    }

    /**
     * Cuenta movimientos por tipo
     * @returns {Object} Conteo por tipo
     */
    countByType() {
        const movements = this.getAll();
        const counts = {};

        Object.values(this.MOVEMENT_TYPES).forEach(type => {
            counts[type] = movements.filter(mov => mov.tipo === type).length;
        });

        return counts;
    }

    /**
     * Ordena movimientos por campo
     * @param {Array} movements - Lista de movimientos
     * @param {string} field - Campo a ordenar
     * @param {string} order - Orden (asc/desc)
     * @returns {Array} Lista ordenada
     */
    sortBy(movements, field, order = 'asc') {
        return [...movements].sort((a, b) => {
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
     * Exporta movimientos a JSON
     * @param {Array} movements - Movimientos a exportar (opcional)
     * @returns {string} JSON string
     */
    exportJSON(movements = null) {
        const data = movements || this.getAll();
        return JSON.stringify(data, null, 2);
    }

    /**
     * Exporta movimientos a CSV
     * @param {Array} movements - Movimientos a exportar (opcional)
     * @returns {string} CSV string
     */
    exportCSV(movements = null) {
        const data = movements || this.getAll();
        if (data.length === 0) return '';

        const headers = ['ID', 'Tipo', 'Barco', 'Producto', 'Cantidad', 'Unidad', 'Fecha', 'Responsable', 'Origen', 'Destino', 'Observaciones'];
        const rows = data.map(mov => [
            mov.id,
            mov.tipo,
            mov.barcoId || '',
            mov.productoId,
            mov.cantidad,
            mov.unidad,
            mov.fecha,
            mov.responsableId,
            mov.barcoOrigenId || '',
            mov.barcoDestinoId || '',
            mov.observaciones || ''
        ]);

        return [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');
    }

    /**
     * Genera un ID único para movimiento
     * @returns {string} ID generado
     */
    generateId() {
        const movements = this.getAll();
        const timestamp = Date.now();
        let id;
        let counter = 1;

        do {
            id = `MOV${String(movements.length + counter).padStart(5, '0')}`;
            counter++;
        } while (movements.some(mov => mov.id === id));

        return id;
    }

    /**
     * Limpia todos los movimientos (para testing)
     */
    clearAll() {
        localStorage.setItem(this.storageKey, JSON.stringify([]));
    }
}

// Crear instancia global
window.WarehouseService = new WarehouseService();
