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
            const errorData = await response.json().catch(() => ({}));
            const error = new Error(errorData.message || `Error: ${response.statusText}`);
            error.data = errorData;
            throw error;
        }

        const data = await response.json();

        // Custom error handling for 200 OK responses with status: "error" (e.g. form validation)
        if (data && data.status === "error") {
            const error = new Error(data.message || "Error");
            error.data = data;
            throw error;
        }

        return data;
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
};
