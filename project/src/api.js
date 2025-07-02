import { apiRequest } from './lib/api.js';
import { useAuthStore } from './store/auth';

// Helper to get auth headers
const getAuthHeaders = () => {
  const { getAuthHeaders } = useAuthStore.getState();
  return getAuthHeaders();
};

export const apiService = {
  // Auth
  register: async (data) => {
    try {
      return await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      if (error.status === 401) {
        useAuthStore.getState().logout();
      }
      throw error;
    }
  },
  
  login: async (data) => {
    try {
      return await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      throw error;
    }
  },
  
  // Spaces
  createSpace: async (data) => {
    try {
      return await apiRequest('/spaces/create_space', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: getAuthHeaders(),
      });
    } catch (error) {
      if (error.status === 401) {
        useAuthStore.getState().logout();
      }
      throw error;
    }
  },
  
  listSpaces: async (owner_id) => {
    try {
      return await apiRequest(`/spaces/list_spaces?owner_id=${owner_id}`, {
        headers: getAuthHeaders(),
      });
    } catch (error) {
      if (error.status === 401) {
        useAuthStore.getState().logout();
      }
      throw error;
    }
  },
  
  getSpace: async (space_id) => {
    try {
      return await apiRequest(`/spaces/space/${space_id}`, {
        headers: getAuthHeaders(),
      });
    } catch (error) {
      if (error.status === 401) {
        useAuthStore.getState().logout();
      }
      throw error;
    }
  },
  
  updateSpace: async (space_id, data) => {
    try {
      return await apiRequest(`/spaces/space/${space_id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
        headers: getAuthHeaders(),
      });
    } catch (error) {
      if (error.status === 401) {
        useAuthStore.getState().logout();
      }
      throw error;
    }
  },
  
  deleteSpace: async (space_id) => {
    try {
      return await apiRequest(`/spaces/space/${space_id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
    } catch (error) {
      if (error.status === 401) {
        useAuthStore.getState().logout();
      }
      throw error;
    }
  },
  
  // Contents
  uploadContent: async (space_id, title, owner_id, file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      return await apiRequest(`/contents/upload?space_id=${space_id}&title=${title}&owner_id=${owner_id}`, {
        method: 'POST',
        body: formData,
        headers: getAuthHeaders(),
      });
    } catch (error) {
      if (error.status === 401) {
        useAuthStore.getState().logout();
      }
      throw error;
    }
  },
  
  getSpaceContents: async (space_id) => {
    try {
      return await apiRequest(`/contents/by_space/${space_id}`, {
        headers: getAuthHeaders(),
      });
    } catch (error) {
      if (error.status === 401) {
        useAuthStore.getState().logout();
      }
      throw error;
    }
  },
  
  // Chat
  sendMessage: async (data) => {
    try {
      return await apiRequest('/chat/', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: getAuthHeaders(),
      });
    } catch (error) {
      if (error.status === 401) {
        useAuthStore.getState().logout();
      }
      throw error;
    }
  },
};