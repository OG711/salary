const BASE_URL = '/api';

async function request(endpoint, options = {}) {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Categories
  getCategories: (type) => {
    const query = type ? `?type=${encodeURIComponent(type)}` : '';
    return request(`/categories${query}`);
  },

  createCategory: (data) => {
    return request('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Transactions
  getTransactions: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.type) params.append('type', filters.type);
    if (filters.categoryId) params.append('categoryId', filters.categoryId);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset) params.append('offset', filters.offset);

    const queryString = params.toString();
    return request(`/transactions${queryString ? `?${queryString}` : ''}`);
  },

  createTransaction: (data) => {
    return request('/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateTransaction: (id, data) => {
    return request(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteTransaction: (id) => {
    return request(`/transactions/${id}`, {
      method: 'DELETE',
    });
  },

  // Analytics
  getAnalyticsSummary: ({ startDate, endDate } = {}) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const queryString = params.toString();
    return request(`/analytics/summary${queryString ? `?${queryString}` : ''}`);
  },
};
