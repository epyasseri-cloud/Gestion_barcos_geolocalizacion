// Servicio de Dueños (Owners)
const OwnerService = {
    STORAGE_KEY: 'boat_system_owners',
    
    // Inicializar datos mock
    initMockData: function() {
        const existing = this.getAll();
        if (existing.length === 0) {
            const mockOwners = [
                {
                    id: 'OWN001',
                    nombre: 'Juan',
                    apellido: 'Pérez García',
                    documento: '12345678',
                    email: 'juan.perez@email.com',
                    telefono: '+34 611 222 333',
                    direccion: 'Calle Marina 123, Barcelona',
                    pais: 'España',
                    fechaRegistro: '2025-01-15T10:30:00Z'
                },
                {
                    id: 'OWN002',
                    nombre: 'María',
                    apellido: 'López Martínez',
                    documento: '87654321',
                    email: 'maria.lopez@email.com',
                    telefono: '+54 911 444 555',
                    direccion: 'Av. del Puerto 456, Buenos Aires',
                    pais: 'Argentina',
                    fechaRegistro: '2025-03-20T14:15:00Z'
                },
                {
                    id: 'OWN003',
                    nombre: 'Carlos',
                    apellido: 'Rodríguez Silva',
                    documento: '45678912',
                    email: 'carlos.rodriguez@email.com',
                    telefono: '+52 55 7788 9900',
                    direccion: 'Calle del Mar 789, Veracruz',
                    pais: 'México',
                    fechaRegistro: '2025-06-10T09:00:00Z'
                }
            ];
            
            this.saveAll(mockOwners);
        }
    },
    
    // Obtener todos los dueños
    getAll: function() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    },
    
    // Guardar todos los dueños
    saveAll: function(owners) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(owners));
    },
    
    // Obtener dueño por ID
    getById: function(id) {
        const owners = this.getAll();
        return owners.find(owner => owner.id === id) || null;
    },
    
    // Crear nuevo dueño
    create: function(ownerData) {
        const owners = this.getAll();
        
        // Validar datos
        const validation = this.validate(ownerData);
        if (!validation.isValid) {
            return { success: false, message: validation.errors.join(', ') };
        }
        
        // Verificar email único
        if (owners.some(o => o.email === ownerData.email)) {
            return { success: false, message: 'El email ya está registrado' };
        }
        
        // Generar ID
        const newId = Helpers.generateSequentialId('OWN', owners.map(o => o.id));
        
        const newOwner = {
            id: newId,
            nombre: ownerData.nombre,
            apellido: ownerData.apellido,
            documento: ownerData.documento,
            email: ownerData.email,
            telefono: ownerData.telefono || '',
            direccion: ownerData.direccion || '',
            pais: ownerData.pais || '',
            fechaRegistro: new Date().toISOString()
        };
        
        owners.push(newOwner);
        this.saveAll(owners);
        
        return { success: true, message: 'Dueño creado exitosamente', data: newOwner };
    },
    
    // Actualizar dueño
    update: function(id, ownerData) {
        const owners = this.getAll();
        const index = owners.findIndex(o => o.id === id);
        
        if (index === -1) {
            return { success: false, message: 'Dueño no encontrado' };
        }
        
        // Validar datos
        const validation = this.validate(ownerData);
        if (!validation.isValid) {
            return { success: false, message: validation.errors.join(', ') };
        }
        
        // Verificar email único (excepto el mismo dueño)
        if (owners.some(o => o.email === ownerData.email && o.id !== id)) {
            return { success: false, message: 'El email ya está registrado' };
        }
        
        const updatedOwner = {
            ...owners[index],
            nombre: ownerData.nombre,
            apellido: ownerData.apellido,
            documento: ownerData.documento,
            email: ownerData.email,
            telefono: ownerData.telefono || '',
            direccion: ownerData.direccion || '',
            pais: ownerData.pais || ''
        };
        
        owners[index] = updatedOwner;
        this.saveAll(owners);
        
        return { success: true, message: 'Dueño actualizado exitosamente', data: updatedOwner };
    },
    
    // Eliminar dueño
    delete: function(id) {
        const owners = this.getAll();
        const index = owners.findIndex(o => o.id === id);
        
        if (index === -1) {
            return { success: false, message: 'Dueño no encontrado' };
        }
        
        // Verificar si tiene barcos asociados
        // TODO: Implementar verificación cuando exista el servicio de barcos
        
        owners.splice(index, 1);
        this.saveAll(owners);
        
        return { success: true, message: 'Dueño eliminado exitosamente' };
    },
    
    // Validar datos de dueño
    validate: function(ownerData) {
        const errors = [];
        
        if (!ownerData.nombre || ownerData.nombre.trim() === '') {
            errors.push('El nombre es requerido');
        }
        
        if (!ownerData.apellido || ownerData.apellido.trim() === '') {
            errors.push('El apellido es requerido');
        }
        
        if (!ownerData.documento || ownerData.documento.trim() === '') {
            errors.push('El documento es requerido');
        }
        
        if (!ownerData.email || ownerData.email.trim() === '') {
            errors.push('El email es requerido');
        } else if (!Validator.isValidEmail(ownerData.email)) {
            errors.push('El email no es válido');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    },
    
    // Buscar dueños
    search: function(searchTerm) {
        if (!searchTerm) return this.getAll();
        
        const owners = this.getAll();
        return Helpers.search(owners, searchTerm, ['nombre', 'apellido', 'email', 'documento', 'pais']);
    },
    
    // Filtrar por país
    filterByCountry: function(country) {
        const owners = this.getAll();
        return owners.filter(o => o.pais === country);
    },
    
    // Ordenar dueños
    sort: function(field = 'nombre', ascending = true) {
        const owners = this.getAll();
        return Helpers.sortBy(owners, field, ascending);
    },
    
    // Obtener países únicos
    getCountries: function() {
        const owners = this.getAll();
        const countries = owners.map(o => o.pais).filter(c => c);
        return Helpers.unique(countries).sort();
    },
    
    // Contar dueños
    count: function() {
        return this.getAll().length;
    },
    
    // Exportar a JSON
    exportJSON: function() {
        const owners = this.getAll();
        Helpers.exportJSON(owners, 'duenos.json');
    },
    
    // Exportar a CSV
    exportCSV: function() {
        const owners = this.getAll();
        Helpers.exportCSV(owners, 'duenos.csv');
    }
};

// Exponer al objeto window e inicializar
if (typeof window !== 'undefined') {
    window.OwnerService = OwnerService;
    OwnerService.initMockData();
}
