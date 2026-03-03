// Utilidades de fecha
const DateUtils = {
    // Obtener fecha actual
    now: function() {
        return new Date();
    },
    
    // Obtener fecha actual en ISO
    nowISO: function() {
        return new Date().toISOString();
    },
    
    // Parsear fecha
    parse: function(dateString) {
        return new Date(dateString);
    },
    
    // Verificar si es fecha válida
    isValid: function(date) {
        const d = new Date(date);
        return !isNaN(d.getTime());
    },
    
    // Agregar días
    addDays: function(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    },
    
    // Agregar horas
    addHours: function(date, hours) {
        const result = new Date(date);
        result.setHours(result.getHours() + hours);
        return result;
    },
    
    // Agregar minutos
    addMinutes: function(date, minutes) {
        const result = new Date(date);
        result.setMinutes(result.getMinutes() + minutes);
        return result;
    },
    
    // Diferencia en días
    diffDays: function(date1, date2) {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        const diffTime = Math.abs(d2 - d1);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    },
    
    // Diferencia en horas
    diffHours: function(date1, date2) {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        const diffTime = Math.abs(d2 - d1);
        return Math.floor(diffTime / (1000 * 60 * 60));
    },
    
    // Diferencia en minutos
    diffMinutes: function(date1, date2) {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        const diffTime = Math.abs(d2 - d1);
        return Math.floor(diffTime / (1000 * 60));
    },
    
    // Es hoy
    isToday: function(date) {
        const d = new Date(date);
        const today = new Date();
        return d.toDateString() === today.toDateString();
    },
    
    // Es ayer
    isYesterday: function(date) {
        const d = new Date(date);
        const yesterday = this.addDays(new Date(), -1);
        return d.toDateString() === yesterday.toDateString();
    },
    
    // Es este mes
    isThisMonth: function(date) {
        const d = new Date(date);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    },
    
    // Es este año
    isThisYear: function(date) {
        const d = new Date(date);
        const now = new Date();
        return d.getFullYear() === now.getFullYear();
    },
    
    // Inicio del día
    startOfDay: function(date) {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d;
    },
    
    // Fin del día
    endOfDay: function(date) {
        const d = new Date(date);
        d.setHours(23, 59, 59, 999);
        return d;
    },
    
    // Inicio del mes
    startOfMonth: function(date) {
        const d = new Date(date);
        d.setDate(1);
        d.setHours(0, 0, 0, 0);
        return d;
    },
    
    // Fin del mes
    endOfMonth: function(date) {
        const d = new Date(date);
        d.setMonth(d.getMonth() + 1);
        d.setDate(0);
        d.setHours(23, 59, 59, 999);
        return d;
    },
    
    // Comparar fechas (sin horas)
    compareDates: function(date1, date2) {
        const d1 = this.startOfDay(date1);
        const d2 = this.startOfDay(date2);
        
        if (d1 < d2) return -1;
        if (d1 > d2) return 1;
        return 0;
    },
    
    // Está entre dos fechas
    isBetween: function(date, startDate, endDate) {
        const d = new Date(date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return d >= start && d <= end;
    },
    
    // Obtener rango de fechas
    getDateRange: function(startDate, endDate) {
        const dates = [];
        let currentDate = new Date(startDate);
        const end = new Date(endDate);
        
        while (currentDate <= end) {
            dates.push(new Date(currentDate));
            currentDate = this.addDays(currentDate, 1);
        }
        
        return dates;
    },
    
    // Nombre del mes
    getMonthName: function(date, short = false) {
        const months = short 
            ? ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
            : ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        
        return months[new Date(date).getMonth()];
    },
    
    // Nombre del día
    getDayName: function(date, short = false) {
        const days = short
            ? ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
            : ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        
        return days[new Date(date).getDay()];
    },
    
    // Timestamp en segundos
    getTimestamp: function(date = null) {
        return Math.floor((date ? new Date(date) : new Date()).getTime() / 1000);
    },
    
    // Desde timestamp
    fromTimestamp: function(timestamp) {
        return new Date(timestamp * 1000);
    }
};
