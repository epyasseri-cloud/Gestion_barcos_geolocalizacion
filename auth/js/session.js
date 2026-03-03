// Gestión de sesiones
const Session = {
    // Clave para localStorage
    SESSION_KEY: 'boat_system_session',
    
    // Crear sesión
    create: function(user) {
        const sessionData = {
            user: user,
            timestamp: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 horas
        };
        
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
        return true;
    },
    
    // Obtener sesión actual
    get: function() {
        const sessionStr = localStorage.getItem(this.SESSION_KEY);
        
        if (!sessionStr) {
            return null;
        }
        
        try {
            const session = JSON.parse(sessionStr);
            
            // Verificar si la sesión ha expirado
            if (new Date(session.expiresAt) < new Date()) {
                this.destroy();
                return null;
            }
            
            return session;
        } catch (e) {
            return null;
        }
    },
    
    // Obtener usuario actual
    getCurrentUser: function() {
        const session = this.get();
        return session ? session.user : null;
    },
    
    // Verificar si hay sesión activa
    isActive: function() {
        return this.get() !== null;
    },
    
    // Destruir sesión
    destroy: function() {
        localStorage.removeItem(this.SESSION_KEY);
        return true;
    },
    
    // Actualizar sesión
    update: function(userData) {
        const session = this.get();
        if (session) {
            session.user = { ...session.user, ...userData };
            localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
            return true;
        }
        return false;
    },
    
    // Verificar rol del usuario
    hasRole: function(role) {
        const user = this.getCurrentUser();
        return user && user.role === role;
    },
    
    // Verificar si el usuario tiene uno de los roles especificados
    hasAnyRole: function(roles) {
        const user = this.getCurrentUser();
        return user && roles.includes(user.role);
    }
};
