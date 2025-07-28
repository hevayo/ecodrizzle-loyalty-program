// API Configuration
export const apiConfig = {
    // Default to localhost for development, can be overridden by environment variable
    baseUrl: '/choreo-apis/loyalty-campaign/loyalty-api/v1',

    // Request timeout in milliseconds
    timeout: 120000,

    // Log API calls in development
    debug: import.meta.env.VITE_DEBUG !== 'false' && import.meta.env.DEV,
}

// Get configuration based on environment
export const getApiConfig = () => {
    return {
        ...apiConfig,
    }
}