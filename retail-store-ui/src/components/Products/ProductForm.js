import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createProduct, getProduct, updateProduct } from '../../services/api';

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({ name: '', description: '', price: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      getProduct(id).then(({ data }) => setForm({
        name: data.name,
        description: data.description || '',
        price: String(data.price),
      }));
    }
  }, [id, isEdit]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        name: form.name,
        description: form.description || null,
        price: parseFloat(form.price),
      };
      if (isEdit) {
        await updateProduct(id, payload);
      } else {
        await createProduct(payload);
      }
      navigate('/products');
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong');
    }
  };

  return (
    <div className="container">
      <h1>{isEdit ? 'Edit Product' : 'New Product'}</h1>
      {error && <div className="error">{error}</div>}

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows="3" />
          </div>
          <div className="form-group">
            <label>Price</label>
            <input name="price" type="number" step="0.01" min="0" value={form.price} onChange={handleChange} required />
          </div>
          <button className="btn btn-success" type="submit">{isEdit ? 'Update' : 'Create'}</button>{' '}
          <button className="btn btn-secondary" type="button" onClick={() => navigate('/products')}>Cancel</button>
        </form>
      </div>
    </div>
  );
}
