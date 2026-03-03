// Formateadores de datos
const Formatters = {
    // Formatear fecha
    formatDate: function(date, format = 'DD/MM/YYYY') {
        if (!date) return '';
        
        const d = new Date(date);
        if (isNaN(d.getTime())) return '';
        
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');
        
        return format
            .replace('DD', day)
            .replace('MM', month)
            .replace('YYYY', year)
            .replace('HH', hours)
            .replace('mm', minutes)
            .replace('ss', seconds);
    },
    
    // Formatear fecha y hora
    formatDateTime: function(date) {
        return this.formatDate(date, 'DD/MM/YYYY HH:mm:ss');
    },
    
    // Formatear solo hora
    formatTime: function(date) {
        return this.formatDate(date, 'HH:mm:ss');
    },
    
    // Fecha relativa (hace 2 días, etc)
    formatRelativeDate: function(date) {
        if (!date) return '';
        
        const d = new Date(date);
        const now = new Date();
        const diffMs = now - d;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return 'Justo ahora';
        if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
        if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
        if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
        
        return this.formatDate(date);
    },
    
    // Formatear moneda
    formatCurrency: function(amount, currency = 'USD', locale = 'es-ES') {
        if (amount === null || amount === undefined) return '';
        
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency
        }).format(amount);
    },
    
    // Formatear número
    formatNumber: function(number, decimals = 0) {
        if (number === null || number === undefined) return '';
        return Number(number).toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },
    
    // Formatear porcentaje
    formatPercentage: function(value, total, decimals = 2) {
        if (total === 0) return '0%';
        const percentage = (value / total) * 100;
        return percentage.toFixed(decimals) + '%';
    },
    
    // Formatear teléfono
    formatPhone: function(phone) {
        if (!phone) return '';
        const cleaned = phone.replace(/\D/g, '');
        
        if (cleaned.length === 10) {
            return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
        }
        return phone;
    },
    
    // Formatear email (ocultar parcialmente)
    formatEmail: function(email, hide = false) {
        if (!email) return '';
        if (!hide) return email;
        
        const [name, domain] = email.split('@');
        const visibleChars = Math.min(3, name.length);
        const hiddenName = name.slice(0, visibleChars) + '*'.repeat(name.length - visibleChars);
        return `${hiddenName}@${domain}`;
    },
    
    // Formatear documento (DNI, RUT, etc)
    formatDocument: function(doc) {
        if (!doc) return '';
        return doc.replace(/(\d{2})(\d{3})(\d{3})/, '$1.$2.$3');
    },
    
    // Formatear coordenadas GPS
    formatCoordinates: function(lat, lng, decimals = 4) {
        if (lat === null || lng === null) return '';
        return `${Number(lat).toFixed(decimals)}, ${Number(lng).toFixed(decimals)}`;
    },
    
    // Formatear distancia
    formatDistance: function(distanceKm) {
        if (distanceKm === null || distanceKm === undefined) return '';
        
        if (distanceKm < 1) {
            return `${Math.round(distanceKm * 1000)} m`;
        }
        return `${distanceKm.toFixed(2)} km`;
    },
    
    // Formatear velocidad (nudos)
    formatSpeed: function(knots) {
        if (knots === null || knots === undefined) return '';
        return `${knots.toFixed(1)} nudos`;
    },
    
    // Formatear peso
    formatWeight: function(weight, unit = 'Kg') {
        if (weight === null || weight === undefined) return '';
        return `${this.formatNumber(weight, 2)} ${unit}`;
    },
    
    // Formatear capacidad
    formatCapacity: function(capacity) {
        if (capacity === null || capacity === undefined) return '';
        return `${this.formatNumber(capacity)} Ton`;
    },
    
    // Formatear tamaño de archivo
    formatFileSize: function(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    },
    
    // Formatear duración (en minutos)
    formatDuration: function(minutes) {
        if (!minutes) return '0 min';
        
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        
        if (hours === 0) return `${mins} min`;
        if (mins === 0) return `${hours} h`;
        return `${hours} h ${mins} min`;
    },
    
    // Formatear booleano
    formatBoolean: function(value, trueText = 'Sí', falseText = 'No') {
        return value ? trueText : falseText;
    },
    
    // Formatear estado (con color)
    formatStatus: function(status) {
        const statusMap = {
            'Activo': { color: 'green', text: '✓ Activo' },
            'Inactivo': { color: 'red', text: '✗ Inactivo' },
            'En Mantenimiento': { color: 'orange', text: '⚠ En Mantenimiento' },
            'En Viaje': { color: 'blue', text: '⛵ En Viaje' },
            'En Curso': { color: 'blue', text: '⏳ En Curso' },
            'Finalizado': { color: 'green', text: '✓ Finalizado' },
            'Cancelado': { color: 'red', text: '✗ Cancelado' },
            'Planificado': { color: 'gray', text: '📋 Planificado' }
        };
        
        return statusMap[status] || { color: 'black', text: status };
    },
    
    // Truncar texto
    truncate: function(text, maxLength = 50, suffix = '...') {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + suffix;
    },
    
    // Formatear lista
    formatList: function(array, separator = ', ', lastSeparator = ' y ') {
        if (!array || array.length === 0) return '';
        if (array.length === 1) return array[0];
        
        const allButLast = array.slice(0, -1).join(separator);
        const last = array[array.length - 1];
        return allButLast + lastSeparator + last;
    }
};
