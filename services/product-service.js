// Servicio de Productos
const ProductService = {
    storageKey: 'boat_system_products',
    
    // Categorías disponibles
    CATEGORIES: {
        PRIMARY: 'Primaria',
        MANUFACTURE: 'Manufactura'
    },
    
    // Unidades de medida
    UNITS: ['Kg', 'Ton', 'Lata', 'Caja', 'Paquete', 'Unidad', 'Litro'],
    
    // Inicializar con datos mock
    init: function() {
        if (!localStorage.getItem(this.storageKey)) {
            fetch('../data/products-mock.json')
                .then(response => response.json())
                .then(data => {
                    localStorage.setItem(this.storageKey, JSON.stringify(data));
                })
                .catch(error => {
                    console.error('Error loading mock products:', error);
                    localStorage.setItem(this.storageKey, JSON.stringify([]));
                });
        }
    },
    
    // Obtener todos los productos
    getAll: function() {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : [];
    },
    
    // Obtener producto por ID
    getById: function(id) {
        const products = this.getAll();
        return products.find(prod => prod.id === id);
    },
    
    // Crear nuevo producto
    create: function(productData) {
        const products = this.getAll();
        
        // Validar datos requeridos
        if (!productData.nombre) {
            return { success: false, message: 'El nombre es obligatorio' };
        }
        
        if (!productData.categoria) {
            return { success: false, message: 'La categoría es obligatoria' };
        }
        
        if (!productData.unidadMedida) {
            return { success: false, message: 'La unidad de medida es obligatoria' };
        }
        
        // Verificar nombre duplicado
        if (products.some(prod => prod.nombre.toLowerCase() === productData.nombre.toLowerCase())) {
            return { success: false, message: 'Ya existe un producto con ese nombre' };
        }
        
        // Generar ID
        const newId = Helpers.generateId('PROD', products);
        
        const newProduct = {
            id: newId,
            nombre: productData.nombre,
            categoria: productData.categoria,
            descripcion: productData.descripcion || '',
            unidadMedida: productData.unidadMedida,
            precioUnitario: parseFloat(productData.precioUnitario) || 0,
            stock: parseInt(productData.stock) || 0,
            estado: productData.estado || 'Activo',
            fechaCreacion: new Date().toISOString()
        };
        
        products.push(newProduct);
        localStorage.setItem(this.storageKey, JSON.stringify(products));
        
        return { success: true, product: newProduct, message: 'Producto creado exitosamente' };
    },
    
    // Actualizar producto
    update: function(id, productData) {
        const products = this.getAll();
        const index = products.findIndex(prod => prod.id === id);
        
        if (index === -1) {
            return { success: false, message: 'Producto no encontrado' };
        }
        
        // Validar datos
        if (!productData.nombre) {
            return { success: false, message: 'El nombre es obligatorio' };
        }
        
        if (!productData.categoria) {
            return { success: false, message: 'La categoría es obligatoria' };
        }
        
        // Verificar nombre duplicado (excepto el mismo producto)
        if (products.some(prod => prod.nombre.toLowerCase() === productData.nombre.toLowerCase() && prod.id !== id)) {
            return { success: false, message: 'Ya existe otro producto con ese nombre' };
        }
        
        // Actualizar datos
        products[index] = {
            ...products[index],
            nombre: productData.nombre,
            categoria: productData.categoria,
            descripcion: productData.descripcion,
            unidadMedida: productData.unidadMedida,
            precioUnitario: parseFloat(productData.precioUnitario) || 0,
            stock: parseInt(productData.stock) || 0,
            estado: productData.estado,
            fechaModificacion: new Date().toISOString()
        };
        
        localStorage.setItem(this.storageKey, JSON.stringify(products));
        
        return { success: true, product: products[index], message: 'Producto actualizado exitosamente' };
    },
    
    // Eliminar producto
    delete: function(id) {
        const products = this.getAll();
        const index = products.findIndex(prod => prod.id === id);
        
        if (index === -1) {
            return { success: false, message: 'Producto no encontrado' };
        }
        
        const deletedProduct = products[index];
        products.splice(index, 1);
        localStorage.setItem(this.storageKey, JSON.stringify(products));
        
        return { success: true, product: deletedProduct, message: 'Producto eliminado exitosamente' };
    },
    
    // Buscar productos
    search: function(query) {
        if (!query) return this.getAll();
        
        const normalizedQuery = query.toLowerCase().trim();
        return this.getAll().filter(prod => 
            prod.nombre.toLowerCase().includes(normalizedQuery) ||
            prod.descripcion.toLowerCase().includes(normalizedQuery) ||
            prod.categoria.toLowerCase().includes(normalizedQuery) ||
            prod.id.toLowerCase().includes(normalizedQuery)
        );
    },
    
    // Filtrar por categoría
    filterByCategory: function(categoria) {
        if (!categoria) return this.getAll();
        return this.getAll().filter(prod => prod.categoria === categoria);
    },
    
    // Filtrar por estado
    filterByStatus: function(estado) {
        if (!estado) return this.getAll();
        return this.getAll().filter(prod => prod.estado === estado);
    },
    
    // Obtener productos primarios
    getPrimaryProducts: function() {
        return this.filterByCategory(this.CATEGORIES.PRIMARY);
    },
    
    // Obtener productos manufacturados
    getManufacturedProducts: function() {
        return this.filterByCategory(this.CATEGORIES.MANUFACTURE);
    },
    
    // Actualizar stock
    updateStock: function(id, quantity, operation = 'set') {
        const products = this.getAll();
        const index = products.findIndex(prod => prod.id === id);
        
        if (index === -1) {
            return { success: false, message: 'Producto no encontrado' };
        }
        
        const product = products[index];
        let newStock = product.stock;
        
        switch(operation) {
            case 'add':
                newStock += quantity;
                break;
            case 'subtract':
                newStock -= quantity;
                if (newStock < 0) {
                    return { success: false, message: 'Stock insuficiente' };
                }
                break;
            case 'set':
                newStock = quantity;
                break;
            default:
                return { success: false, message: 'Operación inválida' };
        }
        
        products[index].stock = newStock;
        products[index].fechaModificacion = new Date().toISOString();
        
        localStorage.setItem(this.storageKey, JSON.stringify(products));
        
        return { success: true, product: products[index], message: 'Stock actualizado' };
    },
    
    // Ordenar productos
    sort: function(products, field, order = 'asc') {
        return Helpers.sortArray(products, field, order);
    },
    
    // Contar productos por categoría
    countByCategory: function() {
        const products = this.getAll();
        const counts = {
            [this.CATEGORIES.PRIMARY]: 0,
            [this.CATEGORIES.MANUFACTURE]: 0
        };
        
        products.forEach(prod => {
            counts[prod.categoria] = (counts[prod.categoria] || 0) + 1;
        });
        
        return counts;
    },
    
    // Contar productos por estado
    countByStatus: function() {
        const products = this.getAll();
        const counts = {
            'Activo': 0,
            'Inactivo': 0
        };
        
        products.forEach(prod => {
            counts[prod.estado] = (counts[prod.estado] || 0) + 1;
        });
        
        return counts;
    },
    
    // Obtener estadísticas
    getStats: function() {
        const products = this.getAll();
        const categoryCounts = this.countByCategory();
        const statusCounts = this.countByStatus();
        
        return {
            total: products.length,
            primaria: categoryCounts[this.CATEGORIES.PRIMARY],
            manufactura: categoryCounts[this.CATEGORIES.MANUFACTURE],
            activos: statusCounts['Activo'],
            inactivos: statusCounts['Inactivo'],
            valorTotal: products.reduce((sum, prod) => sum + (prod.precioUnitario * prod.stock), 0),
            precioPromedio: products.length > 0 
                ? products.reduce((sum, prod) => sum + prod.precioUnitario, 0) / products.length 
                : 0
        };
    },
    
    // Exportar a JSON
    exportJSON: function() {
        const products = this.getAll();
        const dataStr = JSON.stringify(products, null, 2);
        Helpers.downloadFile(dataStr, 'productos.json', 'application/json');
    },
    
    // Exportar a CSV
    exportCSV: function() {
        const products = this.getAll();
        
        if (products.length === 0) {
            return { success: false, message: 'No hay productos para exportar' };
        }
        
        const headers = ['ID', 'Nombre', 'Categoría', 'Descripción', 'Unidad', 'Precio', 'Stock', 'Estado'];
        const rows = products.map(prod => [
            prod.id,
            prod.nombre,
            prod.categoria,
            prod.descripcion,
            prod.unidadMedida,
            prod.precioUnitario,
            prod.stock,
            prod.estado
        ]);
        
        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        Helpers.downloadFile(csv, 'productos.csv', 'text/csv');
        
        return { success: true, message: 'Productos exportados a CSV' };
    }
};

// Exponer al objeto window e inicializar
if (typeof window !== 'undefined') {
    window.ProductService = ProductService;
    ProductService.init();
}
