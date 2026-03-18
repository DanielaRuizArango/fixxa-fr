const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const fetchData = async (endpoint, options = {}) => {
    try {
        const isFormData = options.body instanceof FormData;
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
                ...options.headers,
            },
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
};
