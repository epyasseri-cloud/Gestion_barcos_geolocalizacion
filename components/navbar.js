// Componente Navbar
const Navbar = {
    render: function(containerId) {
        const user = Session.getCurrentUser();
        
        if (!user) {
            return '';
        }
        
        const navHTML = `
            <nav>
                <strong>Sistema de Geolocalización de Barcos</strong> | 
                <span>Usuario: ${user.nombre} ${user.apellido} (${user.role})</span> | 
                <a href="../auth/views/profile.html">Mi Perfil</a> | 
                <a href="#" onclick="Auth.logout(); return false;">Cerrar Sesión</a>
            </nav>
            <hr>
        `;
        
        if (containerId) {
            document.getElementById(containerId).innerHTML = navHTML;
        }
        
        return navHTML;
    }
};
