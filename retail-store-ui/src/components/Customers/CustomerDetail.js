import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getCustomer, deleteCustomer } from '../../services/api';

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);

  useEffect(() => {
    getCustomer(id).then(({ data }) => setCustomer(data));
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this customer?')) return;
    await deleteCustomer(id);
    navigate('/customers');
  };

  if (!customer) return <div className="container">Loading…</div>;

  return (
    <div className="container">
      <h1>Customer Detail</h1>
      <div className="detail-card">
        <p><strong>ID:</strong> {customer.id}</p>
        <p><strong>Name:</strong> {customer.name} {customer.surname}</p>
        <p><strong>Email:</strong> {customer.email}</p>
        <p><strong>Address:</strong> {customer.address || '—'}</p>
        <p><strong>Birth Date:</strong> {customer.birth_date || '—'}</p>
        <div style={{ marginTop: '1rem' }}>
          <Link to={`/customers/${id}/edit`} className="btn btn-primary" style={{ marginRight: '0.5rem' }}>Edit</Link>
          <button className="btn btn-danger" onClick={handleDelete}>Delete</button>{' '}
          <Link to="/customers" className="btn btn-secondary">Back</Link>
        </div>
      </div>
    </div>
  );
}
