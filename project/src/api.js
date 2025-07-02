import { useAuthStore } from './store/auth';

const BASE_URL = 'https://13.201.91.4:8000';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function request(endpoint, options = {}) {
  const { getAuthHeaders, logout } = useAuthStore.getState();
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...options.headers,
    },
    ...options,
  };

  // Remove Content-Type for FormData
  if (options.body instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    
    // Handle 401 - Unauthorized
    if (response.status === 401) {
      logout();
      throw new ApiError('Unauthorized', 401);
    }
    
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    
    if (!response.ok) {
      throw new ApiError(
        data.detail || data.message || `HTTP ${response.status}`,
        response.status,
        data
      );
    }
    
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(error.message, 0, null);
  }
}

export const api = {
  // Auth
  register: (data) => request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  login: (data) => request('/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      username: data.email,
      password: data.password,
    }),
  }),
  
  // Spaces
  createSpace: (data) => request('/spaces/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  listSpaces: (owner_id) => request(`/spaces/?owner_id=${owner_id}`),
  
  getSpace: (space_id) => request(`/spaces/${space_id}`),
  
  updateSpace: (space_id, data) => request(`/spaces/${space_id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  deleteSpace: (space_id) => request(`/spaces/${space_id}`, {
    method: 'DELETE',
  }),
  
  // Contents
  uploadContent: (space_id, title, owner_id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('space_id', space_id);
    formData.append('owner_id', owner_id);
    
    return request('/contents/upload', {
      method: 'POST',
      body: formData,
    });
  },
  
  getSpaceContents: (space_id) => request(`/contents/?space_id=${space_id}`),
  
  // Chat
  sendMessage: (data) => request('/chat/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};
