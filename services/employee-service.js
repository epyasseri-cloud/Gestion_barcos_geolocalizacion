// Servicio de Empleados
const EmployeeService = {
    storageKey: 'boat_system_employees',
    
    // Inicializar con datos mock
    init: function() {
        if (!localStorage.getItem(this.storageKey)) {
            fetch('../data/employees-mock.json')
                .then(response => response.json())
                .then(data => {
                    localStorage.setItem(this.storageKey, JSON.stringify(data));
                })
                .catch(error => {
                    console.error('Error loading mock employees:', error);
                    localStorage.setItem(this.storageKey, JSON.stringify([]));
                });
        }
    },
    
    // Obtener todos los empleados
    getAll: function() {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : [];
    },
    
    // Obtener empleado por ID
    getById: function(id) {
        const employees = this.getAll();
        return employees.find(emp => emp.id === id);
    },
    
    // Crear nuevo empleado
    create: function(employeeData) {
        const employees = this.getAll();
        
        // Validar datos requeridos
        if (!employeeData.nombre || !employeeData.apellido) {
            return { success: false, message: 'Nombre y apellido son obligatorios' };
        }
        
        if (!employeeData.email || !Validator.isValidEmail(employeeData.email)) {
            return { success: false, message: 'Email inválido' };
        }
        
        if (!employeeData.documento) {
            return { success: false, message: 'Documento es obligatorio' };
        }
        
        // Verificar documento duplicado
        if (employees.some(emp => emp.documento === employeeData.documento)) {
            return { success: false, message: 'Ya existe un empleado con ese documento' };
        }
        
        // Verificar email duplicado
        if (employees.some(emp => emp.email === employeeData.email)) {
            return { success: false, message: 'Ya existe un empleado con ese email' };
        }
        
        // Generar ID
        const newId = Helpers.generateId('EMP', employees);
        
        const newEmployee = {
            id: newId,
            nombre: employeeData.nombre,
            apellido: employeeData.apellido,
            documento: employeeData.documento,
            email: employeeData.email,
            telefono: employeeData.telefono || '',
            rol: employeeData.rol || 'Marinero',
            barcoAsignado: employeeData.barcoAsignado || null,
            fechaContratacion: employeeData.fechaContratacion || new Date().toISOString().split('T')[0],
            estado: employeeData.estado || 'Activo',
            direccion: employeeData.direccion || '',
            salario: parseFloat(employeeData.salario) || 0,
            fechaCreacion: new Date().toISOString()
        };
        
        employees.push(newEmployee);
        localStorage.setItem(this.storageKey, JSON.stringify(employees));
        
        return { success: true, employee: newEmployee, message: 'Empleado creado exitosamente' };
    },
    
    // Actualizar empleado
    update: function(id, employeeData) {
        const employees = this.getAll();
        const index = employees.findIndex(emp => emp.id === id);
        
        if (index === -1) {
            return { success: false, message: 'Empleado no encontrado' };
        }
        
        // Validar datos
        if (!employeeData.nombre || !employeeData.apellido) {
            return { success: false, message: 'Nombre y apellido son obligatorios' };
        }
        
        if (!employeeData.email || !Validator.isValidEmail(employeeData.email)) {
            return { success: false, message: 'Email inválido' };
        }
        
        // Verificar documento duplicado (excepto el mismo empleado)
        if (employees.some(emp => emp.documento === employeeData.documento && emp.id !== id)) {
            return { success: false, message: 'Ya existe otro empleado con ese documento' };
        }
        
        // Verificar email duplicado (excepto el mismo empleado)
        if (employees.some(emp => emp.email === employeeData.email && emp.id !== id)) {
            return { success: false, message: 'Ya existe otro empleado con ese email' };
        }
        
        // Actualizar datos
        employees[index] = {
            ...employees[index],
            nombre: employeeData.nombre,
            apellido: employeeData.apellido,
            documento: employeeData.documento,
            email: employeeData.email,
            telefono: employeeData.telefono,
            rol: employeeData.rol,
            barcoAsignado: employeeData.barcoAsignado,
            fechaContratacion: employeeData.fechaContratacion,
            estado: employeeData.estado,
            direccion: employeeData.direccion,
            salario: parseFloat(employeeData.salario) || 0,
            fechaModificacion: new Date().toISOString()
        };
        
        localStorage.setItem(this.storageKey, JSON.stringify(employees));
        
        return { success: true, employee: employees[index], message: 'Empleado actualizado exitosamente' };
    },
    
    // Eliminar empleado
    delete: function(id) {
        const employees = this.getAll();
        const index = employees.findIndex(emp => emp.id === id);
        
        if (index === -1) {
            return { success: false, message: 'Empleado no encontrado' };
        }
        
        const deletedEmployee = employees[index];
        employees.splice(index, 1);
        localStorage.setItem(this.storageKey, JSON.stringify(employees));
        
        return { success: true, employee: deletedEmployee, message: 'Empleado eliminado exitosamente' };
    },
    
    // Buscar empleados
    search: function(query) {
        if (!query) return this.getAll();
        
        const normalizedQuery = query.toLowerCase().trim();
        return this.getAll().filter(emp => 
            emp.nombre.toLowerCase().includes(normalizedQuery) ||
            emp.apellido.toLowerCase().includes(normalizedQuery) ||
            emp.documento.toLowerCase().includes(normalizedQuery) ||
            emp.email.toLowerCase().includes(normalizedQuery) ||
            emp.rol.toLowerCase().includes(normalizedQuery) ||
            emp.id.toLowerCase().includes(normalizedQuery)
        );
    },
    
    // Filtrar por rol
    filterByRole: function(rol) {
        if (!rol) return this.getAll();
        return this.getAll().filter(emp => emp.rol === rol);
    },
    
    // Filtrar por estado
    filterByStatus: function(estado) {
        if (!estado) return this.getAll();
        return this.getAll().filter(emp => emp.estado === estado);
    },
    
    // Filtrar por barco asignado
    filterByBoat: function(barcoId) {
        if (!barcoId) return this.getAll();
        return this.getAll().filter(emp => emp.barcoAsignado === barcoId);
    },
    
    // Obtener empleados sin asignar
    getUnassigned: function() {
        return this.getAll().filter(emp => !emp.barcoAsignado && emp.estado === 'Activo');
    },
    
    // Asignar empleado a barco
    assignToBoat: function(employeeId, boatId) {
        const employees = this.getAll();
        const index = employees.findIndex(emp => emp.id === employeeId);
        
        if (index === -1) {
            return { success: false, message: 'Empleado no encontrado' };
        }
        
        employees[index].barcoAsignado = boatId;
        employees[index].fechaModificacion = new Date().toISOString();
        
        localStorage.setItem(this.storageKey, JSON.stringify(employees));
        
        return { success: true, employee: employees[index], message: 'Empleado asignado al barco' };
    },
    
    // Desasignar empleado de barco
    unassignFromBoat: function(employeeId) {
        return this.assignToBoat(employeeId, null);
    },
    
    // Ordenar empleados
    sort: function(employees, field, order = 'asc') {
        return Helpers.sortArray(employees, field, order);
    },
    
    // Obtener roles únicos
    getRoles: function() {
        const employees = this.getAll();
        const roles = [...new Set(employees.map(emp => emp.rol))];
        return roles.sort();
    },
    
    // Contar empleados por rol
    countByRole: function() {
        const employees = this.getAll();
        const counts = {};
        
        employees.forEach(emp => {
            counts[emp.rol] = (counts[emp.rol] || 0) + 1;
        });
        
        return counts;
    },
    
    // Contar empleados por estado
    countByStatus: function() {
        const employees = this.getAll();
        const counts = {
            'Activo': 0,
            'Inactivo': 0
        };
        
        employees.forEach(emp => {
            counts[emp.estado] = (counts[emp.estado] || 0) + 1;
        });
        
        return counts;
    },
    
    // Exportar a JSON
    exportJSON: function() {
        const employees = this.getAll();
        const dataStr = JSON.stringify(employees, null, 2);
        Helpers.downloadFile(dataStr, 'empleados.json', 'application/json');
    },
    
    // Exportar a CSV
    exportCSV: function() {
        const employees = this.getAll();
        
        if (employees.length === 0) {
            return { success: false, message: 'No hay empleados para exportar' };
        }
        
        const headers = ['ID', 'Nombre', 'Apellido', 'Documento', 'Email', 'Teléfono', 'Rol', 'Barco', 'Fecha Contratación', 'Estado', 'Salario'];
        const rows = employees.map(emp => [
            emp.id,
            emp.nombre,
            emp.apellido,
            emp.documento,
            emp.email,
            emp.telefono,
            emp.rol,
            emp.barcoAsignado || 'Sin asignar',
            emp.fechaContratacion,
            emp.estado,
            emp.salario
        ]);
        
        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        Helpers.downloadFile(csv, 'empleados.csv', 'text/csv');
        
        return { success: true, message: 'Empleados exportados a CSV' };
    },
    
    // Obtener estadísticas
    getStats: function() {
        const employees = this.getAll();
        
        return {
            total: employees.length,
            activos: employees.filter(emp => emp.estado === 'Activo').length,
            inactivos: employees.filter(emp => emp.estado === 'Inactivo').length,
            asignados: employees.filter(emp => emp.barcoAsignado).length,
            sinAsignar: employees.filter(emp => !emp.barcoAsignado).length,
            porRol: this.countByRole(),
            salarioPromedio: employees.length > 0 
                ? employees.reduce((sum, emp) => sum + emp.salario, 0) / employees.length 
                : 0
        };
    }
};

// Exponer al objeto window
if (typeof window !== 'undefined') {
    window.EmployeeService = EmployeeService;
    EmployeeService.init();
}
