export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/login',
  },
  VENDORS: {
    LIST: '/vendors',
    DETAIL: (id) => `/vendors/${id}`,
  },
  PROJECTS: {
    CREATE: '/projects',
    LIST: '/projects',
    DETAIL: (id) => `/projects/${id}`,
    MESSAGES: (id) => `/projects/${id}/messages`,
    SEND_PROPOSAL: (id) => `/projects/${id}/proposals`, 
  },
MOU: {
    GENERATE: (projectId) => `/projects/${projectId}/mou`,
    GET_BY_PROJECT: (projectId) => `/projects/${projectId}/mou`,
    DETAIL: (mouId) => `/mou/${mouId}`,
    SIGN: (mouId) => `/mou/${mouId}/sign`,
    UPDATE_STATUS: (mouId) => `/mou/${mouId}/status`,
  }
};