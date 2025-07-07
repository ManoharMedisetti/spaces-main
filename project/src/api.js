import { useAuthStore } from './store/auth';

const BASE_URL = import.meta.env.VITE_API_BASE || 'https://8b108204e044.ngrok.app';

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
    body: JSON.stringify(data),
  }),
  
  // Spaces
  createSpace: (data) => request('/spaces/create_space', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  listSpaces: (owner_id) => request(`/spaces/list_spaces?owner_id=${owner_id}`),
  
  getSpace: (space_id) => request(`/spaces/space/${space_id}`),
  
  updateSpace: (space_id, data) => request(`/spaces/space/${space_id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  
  deleteSpace: (space_id) => request(`/spaces/space/${space_id}`, {
    method: 'DELETE',
  }),
  
  // Contents
  uploadContent: (space_id, title, owner_id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return request(`/contents/upload?space_id=${space_id}&title=${title}&owner_id=${owner_id}`, {
      method: 'POST',
      body: formData,
    });
  },
  
  getSpaceContents: (space_id) => request(`/contents/by_space/${space_id}`),
  
  // Chat
  sendMessage: (data) => request('/chat/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};