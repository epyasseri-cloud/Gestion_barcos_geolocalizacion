// Validador de formularios
const Validator = {
    // Validar email
    isValidEmail: function(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    },
    
    // Validar contraseña (mínimo 6 caracteres)
    isValidPassword: function(password) {
        return password && password.length >= 6;
    },
    
    // Validar que el campo no esté vacío
    isNotEmpty: function(value) {
        return value && value.trim() !== '';
    },
    
    // Validar que las contraseñas coincidan
    passwordsMatch: function(password, confirmPassword) {
        return password === confirmPassword;
    },
    
    // Validar formulario de login
    validateLoginForm: function(email, password, role) {
        const errors = [];
        
        if (!this.isNotEmpty(email)) {
            errors.push('El email es requerido');
        } else if (!this.isValidEmail(email)) {
            errors.push('El email no es válido');
        }
        
        if (!this.isNotEmpty(password)) {
            errors.push('La contraseña es requerida');
        }
        
        if (!this.isNotEmpty(role)) {
            errors.push('El rol es requerido');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    },
    
    // Validar formulario de registro
    validateRegisterForm: function(nombre, apellido, email, password, confirmPassword, role) {
        const errors = [];
        
        if (!this.isNotEmpty(nombre)) {
            errors.push('El nombre es requerido');
        }
        
        if (!this.isNotEmpty(apellido)) {
            errors.push('El apellido es requerido');
        }
        
        if (!this.isNotEmpty(email)) {
            errors.push('El email es requerido');
        } else if (!this.isValidEmail(email)) {
            errors.push('El email no es válido');
        }
        
        if (!this.isNotEmpty(password)) {
            errors.push('La contraseña es requerida');
        } else if (!this.isValidPassword(password)) {
            errors.push('La contraseña debe tener al menos 6 caracteres');
        }
        
        if (!this.passwordsMatch(password, confirmPassword)) {
            errors.push('Las contraseñas no coinciden');
        }
        
        if (!this.isNotEmpty(role)) {
            errors.push('El rol es requerido');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
};
