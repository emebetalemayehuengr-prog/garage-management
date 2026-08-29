const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

const DEBUG = import.meta.env.DEV;

const getHeaders = (extra = {}) => {
  const token = localStorage.getItem('garage_token');
  const headers = { 'Content-Type': 'application/json', ...extra };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

export const api = {
  async get(endpoint, options = {}) {
    if (DEBUG) console.log(`[API GET] ${API_BASE}${endpoint}`, options);
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: getHeaders(options.headers)
    });
    if (!response.ok) {
      const err = new Error(`HTTP error! status: ${response.status}`);
      if (DEBUG) console.error(`[API GET ERROR] ${API_BASE}${endpoint}`, err);
      throw err;
    }
    return response.json();
  },

  async post(endpoint, data, options = {}) {
    if (DEBUG) console.log(`[API POST] ${API_BASE}${endpoint}`, data);
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(options.headers),
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const err = new Error(`HTTP error! status: ${response.status}`);
      if (DEBUG) console.error(`[API POST ERROR] ${API_BASE}${endpoint}`, err);
      throw err;
    }
    return response.json();
  },

  async put(endpoint, data, options = {}) {
    if (DEBUG) console.log(`[API PUT] ${API_BASE}${endpoint}`, data);
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(options.headers),
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const err = new Error(`HTTP error! status: ${response.status}`);
      if (DEBUG) console.error(`[API PUT ERROR] ${API_BASE}${endpoint}`, err);
      throw err;
    }
    return response.json();
  },

  async delete(endpoint, options = {}) {
    if (DEBUG) console.log(`[API DELETE] ${API_BASE}${endpoint}`);
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(options.headers)
    });
    if (!response.ok) {
      const err = new Error(`HTTP error! status: ${response.status}`);
      if (DEBUG) console.error(`[API DELETE ERROR] ${API_BASE}${endpoint}`, err);
      throw err;
    }
    return response.json();
  }
};
