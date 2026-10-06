// Centralized API client for UrbanFlow frontend
import router from '@/components/utility/router';
import { API_BASE_URL } from './apiConfig';

export function getAuthHeaders() {
  const token = localStorage.getItem('JWT');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['x-access-token'] = token;
  }
  return headers;
}

export async function request(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  const headers = {
    ...getAuthHeaders(),
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401 || response.status === 403) {
    // If unauthorized, redirect to login
    if (window.location.pathname !== '/login') {
      router.push('/login');
    }
  }

  return response;
}

export const api = {
  get: (endpoint, options) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options) =>
    request(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint, body, options) =>
    request(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),
  delete: (endpoint, options) => request(endpoint, { ...options, method: 'DELETE' }),
};

export default api;
