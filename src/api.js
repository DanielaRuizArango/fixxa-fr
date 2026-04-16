const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Limpia la sesión y notifica a la app que el token expiró.
 * El hook useAuthError escucha este evento y redirige al login.
 */
const handleTokenExpired = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userName');
    localStorage.removeItem('userId');
    localStorage.removeItem('technicianId');
    localStorage.removeItem('clientId');
    window.dispatchEvent(new Event('auth:expired'));
};

export const fetchData = async (endpoint, options = {}) => {
    try {
        const isFormData = options.body instanceof FormData;
        const token = localStorage.getItem('token');

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                ...options.headers,
            },
        });

        // Token expirado o no autenticado → redirigir automáticamente al login
        if (response.status === 401) {
            handleTokenExpired();
            const error = new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
            error.status = 401;
            throw error;
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const error = new Error(errorData.message || `Error: ${response.statusText}`);
            error.status = response.status;
            error.data = errorData;
            throw error;
        }

        const data = await response.json();

        // Custom error handling for 200 OK responses with status: "error" (e.g. form validation)
        if (data && data.status === 'error') {
            const error = new Error(data.message || 'Error');
            error.data = data;
            throw error;
        }

        return data;
    } catch (error) {
        // No re-loggear errores de autenticación (ya se loggean arriba)
        if (error.status !== 401) {
            console.error('API call failed:', error);
        }
        throw error;
    }
};

export const getStorageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const storageBase = import.meta.env.VITE_API_STORAGE_URL || 'http://localhost:8000/storage';
    // Remove leading slash if present
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${storageBase}/${cleanPath}`;
};
