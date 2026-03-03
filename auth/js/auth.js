// Sistema de autenticación
const Auth = {
    // Clave para localStorage de usuarios
    USERS_KEY: 'boat_system_users',
    
    // Inicializar usuarios por defecto
    initDefaultUsers: function() {
        const users = this.getAllUsers();
        
        if (users.length === 0) {
            // Crear usuarios por defecto para testing
            const defaultUsers = [
                {
                    id: 'USR001',
                    nombre: 'Admin',
                    apellido: 'Sistema',
                    email: 'admin@sistema.com',
                    password: 'admin123',
                    role: 'admin',
                    fechaRegistro: new Date().toISOString()
                },
                {
                    id: 'USR002',
                    nombre: 'Carlos',
                    apellido: 'Marinero',
                    email: 'tripulacion@sistema.com',
                    password: 'trip123',
                    role: 'tripulacion',
                    fechaRegistro: new Date().toISOString()
                },
                {
                    id: 'USR003',
                    nombre: 'Juan',
                    apellido: 'Supervisor',
                    email: 'supervisor@sistema.com',
                    password: 'super123',
                    role: 'supervisor',
                    fechaRegistro: new Date().toISOString()
                }
            ];
            
            localStorage.setItem(this.USERS_KEY, JSON.stringify(defaultUsers));
        }
    },
    
    // Obtener todos los usuarios
    getAllUsers: function() {
        const usersStr = localStorage.getItem(this.USERS_KEY);
        return usersStr ? JSON.parse(usersStr) : [];
    },
    
    // Guardar usuarios
    saveUsers: function(users) {
        localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    },
    
    // Generar ID único para usuario
    generateUserId: function() {
        const users = this.getAllUsers();
        const maxId = users.reduce((max, user) => {
            const num = parseInt(user.id.replace('USR', ''));
            return num > max ? num : max;
        }, 0);
        
        return 'USR' + String(maxId + 1).padStart(3, '0');
    },
    
    // Registrar nuevo usuario
    register: function(nombre, apellido, email, password, role) {
        // Validar datos
        const validation = Validator.validateRegisterForm(nombre, apellido, email, password, password, role);
        
        if (!validation.isValid) {
            return {
                success: false,
                message: validation.errors.join('. ')
            };
        }
        
        // Verificar si el email ya existe
        const users = this.getAllUsers();
        const existingUser = users.find(u => u.email === email);
        
        if (existingUser) {
            return {
                success: false,
                message: 'El email ya está registrado'
            };
        }
        
        // Crear nuevo usuario
        const newUser = {
            id: this.generateUserId(),
            nombre: nombre,
            apellido: apellido,
            email: email,
            password: password, // En producción debería estar encriptado
            role: role,
            fechaRegistro: new Date().toISOString()
        };
        
        users.push(newUser);
        this.saveUsers(users);
        
        return {
            success: true,
            message: 'Usuario registrado exitosamente',
            user: newUser
        };
    },
    
    // Iniciar sesión
    login: function(email, password, role) {
        // Inicializar usuarios por defecto si no existen
        this.initDefaultUsers();
        
        // Validar datos
        const validation = Validator.validateLoginForm(email, password, role);
        
        if (!validation.isValid) {
            return {
                success: false,
                message: validation.errors.join('. ')
            };
        }
        
        // Buscar usuario
        const users = this.getAllUsers();
        const user = users.find(u => 
            u.email === email && 
            u.password === password && 
            u.role === role
        );
        
        if (!user) {
            return {
                success: false,
                message: 'Credenciales incorrectas'
            };
        }
        
        // Crear sesión
        const userData = {
            id: user.id,
            nombre: user.nombre,
            apellido: user.apellido,
            email: user.email,
            role: user.role,
            fechaRegistro: user.fechaRegistro
        };
        
        Session.create(userData);
        
        return {
            success: true,
            message: 'Login exitoso',
            user: userData
        };
    },
    
    // Cerrar sesión
    logout: function() {
        Session.destroy();
        window.location.href = '../auth/views/login.html';
    },
    
    // Verificar si el usuario está autenticado
    isAuthenticated: function() {
        return Session.isActive();
    },
    
    // Obtener usuario actual
    getCurrentUser: function() {
        return Session.getCurrentUser();
    },
    
    // Verificar permisos por rol
    checkPermission: function(requiredRoles) {
        const user = this.getCurrentUser();
        
        if (!user) {
            return false;
        }
        
        if (Array.isArray(requiredRoles)) {
            return requiredRoles.includes(user.role);
        }
        
        return user.role === requiredRoles;
    }
};

// Inicializar usuarios por defecto al cargar el script
Auth.initDefaultUsers();
