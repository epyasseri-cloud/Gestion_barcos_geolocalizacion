// Funciones auxiliares generales
const Helpers = {
    // Generar ID único
    generateId: function(prefix = 'ID') {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        return `${prefix}${timestamp}${random}`;
    },
    
    // Generar ID numérico secuencial
    generateSequentialId: function(prefix, existingIds) {
        const numbers = existingIds
            .filter(id => id.startsWith(prefix))
            .map(id => parseInt(id.replace(prefix, '')))
            .filter(num => !isNaN(num));
        
        const maxNum = numbers.length > 0 ? Math.max(...numbers) : 0;
        return prefix + String(maxNum + 1).padStart(3, '0');
    },
    
    // Capitalizar primera letra
    capitalize: function(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    },
    
    // Capitalizar cada palabra
    capitalizeWords: function(str) {
        if (!str) return '';
        return str.split(' ').map(word => this.capitalize(word)).join(' ');
    },
    
    // Truncar texto
    truncate: function(str, maxLength = 50) {
        if (!str || str.length <= maxLength) return str;
        return str.substring(0, maxLength) + '...';
    },
    
    // Ordenar array de objetos
    sortBy: function(array, key, ascending = true) {
        return array.sort((a, b) => {
            const valA = a[key];
            const valB = b[key];
            
            if (valA < valB) return ascending ? -1 : 1;
            if (valA > valB) return ascending ? 1 : -1;
            return 0;
        });
    },
    
    // Filtrar array de objetos
    filterBy: function(array, key, value) {
        return array.filter(item => {
            const itemValue = item[key];
            if (typeof itemValue === 'string' && typeof value === 'string') {
                return itemValue.toLowerCase().includes(value.toLowerCase());
            }
            return itemValue === value;
        });
    },
    
    // Buscar en array de objetos (múltiples campos)
    search: function(array, searchTerm, fields) {
        if (!searchTerm) return array;
        
        const term = searchTerm.toLowerCase();
        return array.filter(item => {
            return fields.some(field => {
                const value = item[field];
                if (value === null || value === undefined) return false;
                return String(value).toLowerCase().includes(term);
            });
        });
    },
    
    // Agrupar array por campo
    groupBy: function(array, key) {
        return array.reduce((groups, item) => {
            const groupKey = item[key];
            if (!groups[groupKey]) {
                groups[groupKey] = [];
            }
            groups[groupKey].push(item);
            return groups;
        }, {});
    },
    
    // Eliminar duplicados
    unique: function(array) {
        return [...new Set(array)];
    },
    
    // Copiar al portapapeles
    copyToClipboard: function(text) {
        if (navigator.clipboard) {
            return navigator.clipboard.writeText(text);
        } else {
            // Fallback para navegadores antiguos
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            return Promise.resolve();
        }
    },
    
    // Descargar contenido como archivo
    downloadFile: function(content, filename, type = 'text/plain') {
        const blob = new Blob([content], { type: type });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },
    
    // Exportar JSON
    exportJSON: function(data, filename = 'export.json') {
        const json = JSON.stringify(data, null, 2);
        this.downloadFile(json, filename, 'application/json');
    },
    
    // Exportar CSV
    exportCSV: function(data, filename = 'export.csv', headers = null) {
        if (data.length === 0) return;
        
        const keys = headers || Object.keys(data[0]);
        const csvContent = [
            keys.join(','),
            ...data.map(row => keys.map(key => {
                const value = row[key];
                // Escapar valores con comas o comillas
                if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            }).join(','))
        ].join('\n');
        
        this.downloadFile(csvContent, filename, 'text/csv');
    },
    
    // Debounce (retrasar ejecución)
    debounce: function(func, delay = 300) {
        let timeoutId;
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    },
    
    // Throttle (limitar frecuencia de ejecución)
    throttle: function(func, limit = 300) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    // Clonar objeto profundo
    deepClone: function(obj) {
        return JSON.parse(JSON.stringify(obj));
    },
    
    // Comparar dos objetos
    isEqual: function(obj1, obj2) {
        return JSON.stringify(obj1) === JSON.stringify(obj2);
    },
    
    // Obtener valor de objeto anidado por path
    getNestedValue: function(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    },
    
    // Establecer valor en objeto anidado por path
    setNestedValue: function(obj, path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((current, key) => {
            if (!current[key]) current[key] = {};
            return current[key];
        }, obj);
        target[lastKey] = value;
    },
    
    // Formatear número con separador de miles
    formatNumber: function(number, decimals = 0) {
        return Number(number).toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },
    
    // Calcular porcentaje
    percentage: function(value, total) {
        if (total === 0) return 0;
        return ((value / total) * 100).toFixed(2);
    },
    
    // Esperar (promesa con delay)
    sleep: function(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
    
    // Verificar si es móvil
    isMobile: function() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
};
