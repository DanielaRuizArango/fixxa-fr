import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

const echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY || 'fixxakey',
    wsHost: import.meta.env.VITE_REVERB_HOST || '127.0.0.1',
    wsPort: import.meta.env.VITE_REVERB_PORT ? parseInt(import.meta.env.VITE_REVERB_PORT) : 8080,
    wssPort: import.meta.env.VITE_REVERB_PORT ? parseInt(import.meta.env.VITE_REVERB_PORT) : 8080,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME || 'http') === 'https',
    enabledTransports: ['ws', 'wss'],
    authEndpoint: `${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'}/broadcasting/auth`,
    auth: {
        headers: {
            get Authorization() {
                const token = localStorage.getItem('token');
                return token ? `Bearer ${token}` : '';
            },
            Accept: 'application/json',
        },
    },
});

export default echo;
