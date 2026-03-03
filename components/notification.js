// Sistema de Notificaciones
const Notification = {
    NOTIFICATION_KEY: 'boat_system_notifications',
    containerId: 'notificationContainer',
    
    // Tipos de notificación
    types: {
        SUCCESS: 'success',
        ERROR: 'error',
        WARNING: 'warning',
        INFO: 'info'
    },
    
    // Inicializar contenedor de notificaciones
    init: function(containerId) {
        if (containerId) {
            this.containerId = containerId;
        }
        
        // Crear contenedor si no existe
        if (!document.getElementById(this.containerId)) {
            const container = document.createElement('div');
            container.id = this.containerId;
            document.body.appendChild(container);
        }
    },
    
    // Mostrar notificación
    show: function(message, type = this.types.INFO, duration = 3000) {
        this.init();
        
        const notification = document.createElement('div');
        notification.className = 'notification notification-' + type;
        notification.innerHTML = `
            <p><strong>[${type.toUpperCase()}]</strong> ${message}</p>
            <button onclick="this.parentElement.remove()">X</button>
        `;
        
        const container = document.getElementById(this.containerId);
        container.appendChild(notification);
        
        // Auto-eliminar después del tiempo especificado
        if (duration > 0) {
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, duration);
        }
        
        // Guardar en historial
        this.saveToHistory(message, type);
    },
    
    // Notificación de éxito
    success: function(message, duration = 3000) {
        this.show(message, this.types.SUCCESS, duration);
    },
    
    // Notificación de error
    error: function(message, duration = 5000) {
        this.show(message, this.types.ERROR, duration);
    },
    
    // Notificación de advertencia
    warning: function(message, duration = 4000) {
        this.show(message, this.types.WARNING, duration);
    },
    
    // Notificación informativa
    info: function(message, duration = 3000) {
        this.show(message, this.types.INFO, duration);
    },
    
    // Guardar en historial
    saveToHistory: function(message, type) {
        const history = this.getHistory();
        
        history.unshift({
            message: message,
            type: type,
            timestamp: new Date().toISOString()
        });
        
        // Mantener solo las últimas 50 notificaciones
        if (history.length > 50) {
            history.splice(50);
        }
        
        localStorage.setItem(this.NOTIFICATION_KEY, JSON.stringify(history));
    },
    
    // Obtener historial de notificaciones
    getHistory: function() {
        const historyStr = localStorage.getItem(this.NOTIFICATION_KEY);
        return historyStr ? JSON.parse(historyStr) : [];
    },
    
    // Limpiar historial
    clearHistory: function() {
        localStorage.removeItem(this.NOTIFICATION_KEY);
    },
    
    // Limpiar todas las notificaciones visibles
    clearAll: function() {
        const container = document.getElementById(this.containerId);
        if (container) {
            container.innerHTML = '';
        }
    }
};
