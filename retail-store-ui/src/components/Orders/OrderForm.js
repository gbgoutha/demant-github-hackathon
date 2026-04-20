import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  createOrder, getOrder, updateOrder, getCustomers, getProducts,
} from '../../services/api';

export default function OrderForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    order_number: '', purchase_date: '', customer_id: '', product_ids: [],
  });
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    getCustomers().then(({ data }) => setCustomers(data));
    getProducts().then(({ data }) => setProducts(data));

    if (isEdit) {
      getOrder(id).then(({ data }) => setForm({
        order_number: data.order_number,
        purchase_date: data.purchase_date,
        customer_id: String(data.customer_id),
        product_ids: data.products.map((p) => p.id),
      }));
    }
  }, [id, isEdit]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleProductToggle = (productId) => {
    setForm((prev) => {
      const ids = prev.product_ids.includes(productId)
        ? prev.product_ids.filter((pid) => pid !== productId)
        : [...prev.product_ids, productId];
      return { ...prev, product_ids: ids };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        order_number: form.order_number,
        purchase_date: form.purchase_date,
        customer_id: parseInt(form.customer_id, 10),
        product_ids: form.product_ids,
      };
      if (isEdit) {
        await updateOrder(id, payload);
      } else {
        await createOrder(payload);
      }
      navigate('/orders');
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong');
    }
  };

  return (
    <div className="container">
      <h1>{isEdit ? 'Edit Order' : 'New Order'}</h1>
      {error && <div className="error">{error}</div>}

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Order Number</label>
            <input name="order_number" value={form.order_number} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Purchase Date</label>
            <input name="purchase_date" type="date" value={form.purchase_date} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Customer</label>
            <select name="customer_id" value={form.customer_id} onChange={handleChange} required>
              <option value="">-- Select customer --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name} {c.surname}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Products</label>
            <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid #ccc', borderRadius: '4px', padding: '0.5rem' }}>
              {products.map((p) => (
                <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem', fontWeight: 'normal', fontSize: '0.9rem' }}>
                  <input
                    type="checkbox"
                    checked={form.product_ids.includes(p.id)}
                    onChange={() => handleProductToggle(p.id)}
                  />
                  {p.name} — ${p.price.toFixed(2)}
                </label>
              ))}
              {products.length === 0 && <span style={{ color: '#999' }}>No products available</span>}
            </div>
          </div>
          <button className="btn btn-success" type="submit">{isEdit ? 'Update' : 'Create'}</button>{' '}
          <button className="btn btn-secondary" type="button" onClick={() => navigate('/orders')}>Cancel</button>
        </form>
      </div>
    </div>
  );
}
