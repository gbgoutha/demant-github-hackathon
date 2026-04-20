import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, deleteProduct, exportUrl } from '../../services/api';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');

  const load = async () => {
    const { data } = await getProducts(search || undefined);
    setProducts(data);
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e) => {
    e.preventDefault();
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    await deleteProduct(id);
    load();
  };

  return (
    <div className="container">
      <h1>Products</h1>

      <div className="toolbar">
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            placeholder="Search by name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn btn-primary btn-sm" type="submit">Search</button>
        </form>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <div className="export-buttons">
            <a href={exportUrl('products', 'excel')} className="btn btn-secondary btn-sm" download>Excel</a>
            <a href={exportUrl('products', 'pdf')} className="btn btn-secondary btn-sm" download>PDF</a>
          </div>
          <Link to="/products/new" className="btn btn-success">+ New Product</Link>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th><th>Name</th><th>Description</th><th>Price</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td><Link to={`/products/${p.id}`}>{p.name}</Link></td>
              <td>{p.description || '—'}</td>
              <td>${p.price.toFixed(2)}</td>
              <td>
                <Link to={`/products/${p.id}/edit`} className="btn btn-primary btn-sm" style={{ marginRight: '0.3rem' }}>Edit</Link>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>Delete</button>
              </td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr><td colSpan="5" style={{ textAlign: 'center' }}>No products found</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
