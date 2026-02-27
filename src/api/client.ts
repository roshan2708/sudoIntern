import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'https://remotive.com/api',
    timeout: 15_000,
    headers: {
        Accept: 'application/json',
    },
});

// Response interceptor for consistent error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (axios.isAxiosError(error)) {
            const message =
                error.response?.data?.message ?? error.message ?? 'Network error';
            return Promise.reject(new Error(message));
        }
        return Promise.reject(error);
    },
);

export default apiClient;
