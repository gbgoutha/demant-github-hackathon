import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getOrder, deleteOrder } from '../../services/api';

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    getOrder(id).then(({ data }) => setOrder(data));
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this order?')) return;
    await deleteOrder(id);
    navigate('/orders');
  };

  if (!order) return <div className="container">Loading…</div>;

  return (
    <div className="container">
      <h1>Order Detail</h1>
      <div className="detail-card">
        <p><strong>ID:</strong> {order.id}</p>
        <p><strong>Order #:</strong> {order.order_number}</p>
        <p><strong>Purchase Date:</strong> {order.purchase_date}</p>
        <p><strong>Customer:</strong> {order.customer ? `${order.customer.name} ${order.customer.surname}` : order.customer_id}</p>

        <h3 style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>Products</h3>
        {order.products.length > 0 ? (
          <table>
            <thead>
              <tr><th>Name</th><th>Price</th></tr>
            </thead>
            <tbody>
              {order.products.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>${p.price.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No products</p>
        )}

        <div style={{ marginTop: '1rem' }}>
          <Link to={`/orders/${id}/edit`} className="btn btn-primary" style={{ marginRight: '0.5rem' }}>Edit</Link>
          <button className="btn btn-danger" onClick={handleDelete}>Delete</button>{' '}
          <Link to="/orders" className="btn btn-secondary">Back</Link>
        </div>
      </div>
    </div>
  );
}
