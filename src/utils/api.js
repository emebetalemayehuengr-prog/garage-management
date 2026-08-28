const API_BASE = import.meta.env.VITE_API_URL || '/api';

const getHeaders = (extra = {}) => {
  const headers = { 'Content-Type': 'application/json', ...extra };
  return headers;
};

export const api = {
  async get(endpoint, options = {}) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: getHeaders(options.headers)
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },

  async post(endpoint, data, options = {}) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(options.headers),
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },

  async put(endpoint, data, options = {}) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(options.headers),
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },

  async delete(endpoint, options = {}) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(options.headers)
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  }
};
