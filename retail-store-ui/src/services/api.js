import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000',
});

// ── Customers ──────────────────────────────────────────────
export const getCustomers   = (search) => API.get('/customers/', { params: { search } });
export const getCustomer    = (id)     => API.get(`/customers/${id}`);
export const createCustomer = (data)   => API.post('/customers/', data);
export const updateCustomer = (id, data) => API.put(`/customers/${id}`, data);
export const deleteCustomer = (id)     => API.delete(`/customers/${id}`);

// ── Products ───────────────────────────────────────────────
export const getProducts   = (search) => API.get('/products/', { params: { search } });
export const getProduct    = (id)     => API.get(`/products/${id}`);
export const createProduct = (data)   => API.post('/products/', data);
export const updateProduct = (id, data) => API.put(`/products/${id}`, data);
export const deleteProduct = (id)     => API.delete(`/products/${id}`);

// ── Orders ─────────────────────────────────────────────────
export const getOrders   = (search) => API.get('/orders/', { params: { search } });
export const getOrder    = (id)     => API.get(`/orders/${id}`);
export const createOrder = (data)   => API.post('/orders/', data);
export const updateOrder = (id, data) => API.put(`/orders/${id}`, data);
export const deleteOrder = (id)     => API.delete(`/orders/${id}`);

// ── Exports ────────────────────────────────────────────────
export const exportUrl = (resource, format) =>
  `${API.defaults.baseURL}/${resource}/export/${format}`;
