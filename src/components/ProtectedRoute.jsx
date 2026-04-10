import { Navigate } from "react-router-dom";

/**
 * ProtectedRoute: redirige al login si no hay token en localStorage.
 * Uso: <ProtectedRoute><MiComponente /></ProtectedRoute>
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    // Si no hay token, redirigir al login
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // Si se especifican roles permitidos y el rol del usuario no está incluido
    if (allowedRoles && !allowedRoles.includes(role)) {
        // Redirigir según el rol real del usuario
        if (role === "client") return <Navigate to="/indexCustomer" replace />;
        if (role === "technician") return <Navigate to="/indexTechnician" replace />;
        if (role === "super_admin") return <Navigate to="/indexAdmin" replace />;
        if (role === "admin" || role === "moderator") return <Navigate to="/indexClientAdmin" replace />;
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
