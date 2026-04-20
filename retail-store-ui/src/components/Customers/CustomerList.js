import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCustomers, deleteCustomer, exportUrl } from '../../services/api';

export default function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');

  const load = async () => {
    const { data } = await getCustomers(search || undefined);
    setCustomers(data);
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e) => {
    e.preventDefault();
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this customer?')) return;
    await deleteCustomer(id);
    load();
  };

  return (
    <div className="container">
      <h1>Customers</h1>

      <div className="toolbar">
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            placeholder="Search by name, surname, email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn btn-primary btn-sm" type="submit">Search</button>
        </form>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <div className="export-buttons">
            <a href={exportUrl('customers', 'excel')} className="btn btn-secondary btn-sm" download>Excel</a>
            <a href={exportUrl('customers', 'pdf')} className="btn btn-secondary btn-sm" download>PDF</a>
          </div>
          <Link to="/customers/new" className="btn btn-success">+ New Customer</Link>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th><th>Name</th><th>Surname</th><th>Email</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td><Link to={`/customers/${c.id}`}>{c.name}</Link></td>
              <td>{c.surname}</td>
              <td>{c.email}</td>
              <td>
                <Link to={`/customers/${c.id}/edit`} className="btn btn-primary btn-sm" style={{ marginRight: '0.3rem' }}>Edit</Link>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>Delete</button>
              </td>
            </tr>
          ))}
          {customers.length === 0 && (
            <tr><td colSpan="5" style={{ textAlign: 'center' }}>No customers found</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
