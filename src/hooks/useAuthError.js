import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * useAuthError
 *
 * Hook global que escucha el evento `auth:expired` disparado por api.js
 * cuando el servidor responde con 401 (token vencido o inválido).
 *
 * Redirige automáticamente al login sin que cada componente tenga que
 * manejar este caso individualmente.
 *
 * Uso: montar una sola vez en App.jsx
 */
const useAuthError = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const handleExpired = () => {
            navigate('/login', { replace: true });
        };

        window.addEventListener('auth:expired', handleExpired);
        return () => window.removeEventListener('auth:expired', handleExpired);
    }, [navigate]);
};

export default useAuthError;
