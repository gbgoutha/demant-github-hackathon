import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getOrders, deleteOrder, exportUrl } from '../../services/api';

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');

  const load = async () => {
    const { data } = await getOrders(search || undefined);
    setOrders(data);
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e) => {
    e.preventDefault();
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this order?')) return;
    await deleteOrder(id);
    load();
  };

  return (
    <div className="container">
      <h1>Orders</h1>

      <div className="toolbar">
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            placeholder="Search by order # or customer name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn btn-primary btn-sm" type="submit">Search</button>
        </form>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <div className="export-buttons">
            <a href={exportUrl('orders', 'excel')} className="btn btn-secondary btn-sm" download>Excel</a>
            <a href={exportUrl('orders', 'pdf')} className="btn btn-secondary btn-sm" download>PDF</a>
          </div>
          <Link to="/orders/new" className="btn btn-success">+ New Order</Link>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th><th>Order #</th><th>Date</th><th>Customer</th><th>Products</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>{o.id}</td>
              <td><Link to={`/orders/${o.id}`}>{o.order_number}</Link></td>
              <td>{o.purchase_date}</td>
              <td>{o.customer ? `${o.customer.name} ${o.customer.surname}` : o.customer_id}</td>
              <td>{o.products.map((p) => p.name).join(', ') || '—'}</td>
              <td>
                <Link to={`/orders/${o.id}/edit`} className="btn btn-primary btn-sm" style={{ marginRight: '0.3rem' }}>Edit</Link>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(o.id)}>Delete</button>
              </td>
            </tr>
          ))}
          {orders.length === 0 && (
            <tr><td colSpan="6" style={{ textAlign: 'center' }}>No orders found</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
