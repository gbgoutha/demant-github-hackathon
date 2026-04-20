import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createCustomer, getCustomer, updateCustomer } from '../../services/api';

export default function CustomerForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    name: '', surname: '', address: '', birth_date: '', email: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      getCustomer(id).then(({ data }) => setForm({
        name: data.name,
        surname: data.surname,
        address: data.address || '',
        birth_date: data.birth_date || '',
        email: data.email,
      }));
    }
  }, [id, isEdit]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        ...form,
        birth_date: form.birth_date || null,
        address: form.address || null,
      };
      if (isEdit) {
        await updateCustomer(id, payload);
      } else {
        await createCustomer(payload);
      }
      navigate('/customers');
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong');
    }
  };

  return (
    <div className="container">
      <h1>{isEdit ? 'Edit Customer' : 'New Customer'}</h1>
      {error && <div className="error">{error}</div>}

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Surname</label>
            <input name="surname" value={form.surname} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Address</label>
            <input name="address" value={form.address} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Birth Date</label>
            <input name="birth_date" type="date" value={form.birth_date} onChange={handleChange} />
          </div>
          <button className="btn btn-success" type="submit">{isEdit ? 'Update' : 'Create'}</button>{' '}
          <button className="btn btn-secondary" type="button" onClick={() => navigate('/customers')}>Cancel</button>
        </form>
      </div>
    </div>
  );
}
