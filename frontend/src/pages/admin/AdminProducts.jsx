import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import { api } from '../../context/AuthContext';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form toggles & states
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [sku, setSku] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [active, setActive] = useState(true);

  const [imageFile, setImageFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [search, setSearch] = useState('');

  const fetchProductsAndOptions = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes, brandRes] = await Promise.all([
        api.get('/products'),
        api.get('/admin/categories'),
        api.get('/admin/brands')
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
      setBrands(brandRes.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsAndOptions();
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);
    setUploadingImage(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setImageUrl(response.data.url);
    } catch (err) {
      alert('Failed to upload product image to server');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    
    const payload = {
      name,
      description,
      price: parseFloat(price),
      stockQuantity: parseInt(stockQuantity),
      categoryId: parseInt(categoryId),
      brandId: parseInt(brandId),
      sku,
      imageUrl,
      active
    };

    try {
      if (editingId) {
        await api.put(`/admin/products/${editingId}`, payload);
        alert('Product details updated successfully');
      } else {
        await api.post('/admin/products', payload);
        alert('New product cataloged successfully');
      }
      
      // Reset forms and reload list
      handleResetForm();
      fetchProductsAndOptions();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save product details');
    }
  };

  const handleEditClick = (product) => {
    setEditingId(product.id);
    setName(product.name);
    setDescription(product.description || '');
    setPrice(String(product.price));
    setStockQuantity(String(product.stockQuantity));
    setCategoryId(product.category ? String(product.category.id) : '');
    setBrandId(product.brand ? String(product.brand.id) : '');
    setSku(product.sku);
    setImageUrl(product.imageUrl || '');
    setActive(product.active);
    setShowForm(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to deactivate (soft-delete) this product?')) return;
    try {
      await api.delete(`/admin/products/${productId}`);
      alert('Product deactivated successfully');
      fetchProductsAndOptions();
    } catch (err) {
      alert('Failed to deactivate product');
    }
  };

  const handleResetForm = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setPrice('');
    setStockQuantity('');
    setCategoryId('');
    setBrandId('');
    setSku('');
    setImageUrl('');
    setActive(true);
    setImageFile(null);
    setShowForm(false);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container-fluid px-4">
      <div className="row g-4">
        {/* Sidebar Nav */}
        <div className="col-lg-3">
          <AdminSidebar />
        </div>

        {/* Product Management Area */}
        <div className="col-lg-9">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h3 className="fw-bold">Product Management</h3>
              <span className="small text-secondary">List, create, update, or deactivate store catalog products.</span>
            </div>
            {!showForm && (
              <button onClick={() => setShowForm(true)} className="btn btn-premium rounded-pill px-4">
                + Catalog Product
              </button>
            )}
          </div>

          {showForm ? (
            /* Create / Edit Form Card */
            <div className="glass-panel p-4 mb-4">
              <h5 className="fw-bold mb-4">{editingId ? 'Edit Product Settings' : 'Catalog New Product'}</h5>
              <form onSubmit={handleSaveProduct} className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Product Name</label>
                  <input type="text" className="form-control" placeholder="Classic Leather Jacket" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">SKU Stock Code</label>
                  <input type="text" className="form-control" placeholder="M-JCK-LEA-001" value={sku} onChange={(e) => setSku(e.target.value)} required />
                </div>
                
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Price ($)</label>
                  <input type="number" step="0.01" className="form-control" placeholder="129.99" value={price} onChange={(e) => setPrice(e.target.value)} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Available Stock Quantity</label>
                  <input type="number" className="form-control" placeholder="15" value={stockQuantity} onChange={(e) => setStockQuantity(e.target.value)} required />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Category</label>
                  <select className="form-select" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Brand</label>
                  <select className="form-select" value={brandId} onChange={(e) => setBrandId(e.target.value)} required>
                    <option value="">Select Brand</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div className="col-12">
                  <label className="form-label small fw-semibold text-secondary">Description</label>
                  <textarea className="form-control" rows="3" placeholder="Enter product details..." value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
                </div>

                {/* File Upload image */}
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Product Image File</label>
                  <input type="file" className="form-control" accept="image/*" onChange={handleImageUpload} />
                  {uploadingImage && <span className="small text-muted mt-1 d-block">Uploading image file to server...</span>}
                </div>
                
                {/* Image URL fallback */}
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-secondary">Image URL Link (Fallback)</label>
                  <input type="text" className="form-control" placeholder="http://images.unsplash..." value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
                </div>

                {/* Image preview */}
                {imageUrl && (
                  <div className="col-12 my-2">
                    <span className="small text-secondary fw-semibold d-block mb-1">Image Preview</span>
                    <img src={imageUrl} alt="preview" className="rounded border" style={{ maxHeight: '100px', objectFit: 'contain' }} />
                  </div>
                )}

                <div className="col-12 d-flex gap-3 align-items-center mb-2">
                  <label className="d-flex gap-2 align-items-center cursor-pointer">
                    <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
                    <span className="small fw-semibold text-secondary">Available for Customers (Active)</span>
                  </label>
                </div>

                <div className="col-12 d-flex gap-2 justify-content-end mt-4">
                  <button type="button" onClick={handleResetForm} className="btn btn-link text-decoration-none text-muted">Cancel</button>
                  <button type="submit" className="btn btn-premium px-4 rounded-pill">Save Product Settings</button>
                </div>
              </form>
            </div>
          ) : (
            /* Products Table List */
            <div className="glass-panel p-4">
              {/* Search Bar filter */}
              <div className="mb-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search catalog products by name or SKU..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status"></div>
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead>
                      <tr className="small text-secondary">
                        <th>Image</th>
                        <th>Product Details</th>
                        <th>SKU</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Status</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="small">
                      {filteredProducts.map((prod) => (
                        <tr key={prod.id}>
                          <td>
                            <img src={prod.imageUrl} alt={prod.name} className="rounded" style={{ width: '45px', height: '55px', objectFit: 'cover' }} />
                          </td>
                          <td>
                            <span className="fw-bold d-block">{prod.name}</span>
                            <span className="text-muted d-block">{prod.category?.name} | {prod.brand?.name}</span>
                          </td>
                          <td className="font-monospace text-muted">{prod.sku}</td>
                          <td className="fw-bold">${prod.price.toFixed(2)}</td>
                          <td>
                            <span className={`fw-semibold ${prod.stockQuantity <= 5 ? 'text-warning' : 'text-secondary'}`}>
                              {prod.stockQuantity} items
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${prod.active ? 'bg-success' : 'bg-danger'} px-2.5 py-1 text-white`}>
                              {prod.active ? 'Active' : 'Disabled'}
                            </span>
                          </td>
                          <td className="text-end">
                            <div className="d-flex justify-content-end gap-2">
                              <button onClick={() => handleEditClick(prod)} className="btn btn-sm btn-light border py-1">
                                Edit
                              </button>
                              <button onClick={() => handleDeleteProduct(prod.id)} className="btn btn-sm btn-outline-danger py-1">
                                Deactivate
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4 bg-light rounded border border-secondary border-opacity-10">
                  <p className="text-secondary small mb-0">No matching products cataloged.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;
