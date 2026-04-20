import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProduct, deleteProduct } from '../../services/api';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    getProduct(id).then(({ data }) => setProduct(data));
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this product?')) return;
    await deleteProduct(id);
    navigate('/products');
  };

  if (!product) return <div className="container">Loading…</div>;

  return (
    <div className="container">
      <h1>Product Detail</h1>
      <div className="detail-card">
        <p><strong>ID:</strong> {product.id}</p>
        <p><strong>Name:</strong> {product.name}</p>
        <p><strong>Description:</strong> {product.description || '—'}</p>
        <p><strong>Price:</strong> ${product.price.toFixed(2)}</p>
        <div style={{ marginTop: '1rem' }}>
          <Link to={`/products/${id}/edit`} className="btn btn-primary" style={{ marginRight: '0.5rem' }}>Edit</Link>
          <button className="btn btn-danger" onClick={handleDelete}>Delete</button>{' '}
          <Link to="/products" className="btn btn-secondary">Back</Link>
        </div>
      </div>
    </div>
  );
}
