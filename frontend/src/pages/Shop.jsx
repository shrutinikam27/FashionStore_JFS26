import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { api } from '../context/AuthContext';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  // States matching parameters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [categoryId, setCategoryId] = useState(searchParams.get('category') || '');
  const [brandId, setBrandId] = useState(searchParams.get('brand') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [sortBy, setSortBy] = useState('default');

  // Fetch filter options once
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          api.get('/categories'),
          api.get('/brands')
        ]);
        setCategories(catRes.data);
        setBrands(brandRes.data);
      } catch (err) {
        console.error('Error fetching filter options:', err);
      }
    };
    fetchOptions();
  }, []);

  // Sync state with URL changes (e.g., clicking category from home page)
  useEffect(() => {
    setCategoryId(searchParams.get('category') || '');
    setBrandId(searchParams.get('brand') || '');
    setSearch(searchParams.get('search') || '');
  }, [searchParams]);

  // Fetch products matching parameters
  useEffect(() => {
    const fetchFilteredProducts = async () => {
      setLoading(true);
      try {
        const params = {};
        if (categoryId) params.categoryId = categoryId;
        if (brandId) params.brandId = brandId;
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;
        if (search) params.search = search;

        const response = await api.get('/products', { params });
        
        // Sort in frontend
        let fetchedProds = response.data;
        if (sortBy === 'price-asc') {
          fetchedProds.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'price-desc') {
          fetchedProds.sort((a, b) => b.price - a.price);
        }

        setProducts(fetchedProds);
      } catch (err) {
        console.error('Error filtering products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredProducts();
  }, [categoryId, brandId, minPrice, maxPrice, search, sortBy]);

  const handleApplyFilters = (e) => {
    e.preventDefault();
    const newParams = {};
    if (search) newParams.search = search;
    if (categoryId) newParams.category = categoryId;
    if (brandId) newParams.brand = brandId;
    if (minPrice) newParams.minPrice = minPrice;
    if (maxPrice) newParams.maxPrice = maxPrice;
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategoryId('');
    setBrandId('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('default');
    setSearchParams({});
  };

  return (
    <div className="container">
      <div className="row g-4">
        {/* Sidebar Filters */}
        <div className="col-lg-3">
          <div className="glass-panel p-4 sticky-lg-top" style={{ top: '100px', zIndex: 1 }}>
            <h5 className="fw-bold mb-3 d-flex justify-content-between align-items-center">
              <span>Catalog Filters</span>
              <button 
                onClick={handleResetFilters} 
                className="btn btn-link text-decoration-none text-muted p-0 small"
                style={{ fontSize: '0.85rem' }}
              >
                Clear All
              </button>
            </h5>

            <form onSubmit={handleApplyFilters} className="d-flex flex-column gap-4">
              {/* Keyword search */}
              <div>
                <label className="form-label small fw-bold text-secondary">Search Keyword</label>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control py-2"
                    placeholder="Search fits..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="form-label small fw-bold text-secondary">Category</label>
                <select
                  className="form-select py-2"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Brand */}
              <div>
                <label className="form-label small fw-bold text-secondary">Brand</label>
                <select
                  className="form-select py-2"
                  value={brandId}
                  onChange={(e) => setBrandId(e.target.value)}
                >
                  <option value="">All Brands</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="form-label small fw-bold text-secondary">Price Range ($)</label>
                <div className="d-flex align-items-center gap-2">
                  <input
                    type="number"
                    className="form-control py-2"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                  <span className="text-muted">-</span>
                  <input
                    type="number"
                    className="form-control py-2"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-premium w-100 rounded-pill py-2.5 mt-2">
                Apply Filters
              </button>
            </form>
          </div>
        </div>

        {/* Catalog Grid */}
        <div className="col-lg-9">
          {/* Top Sort Bar */}
          <div className="glass-panel p-3 mb-4 d-flex flex-wrap justify-content-between align-items-center gap-3">
            <span className="fw-semibold text-secondary">
              Showing {products.length} {products.length === 1 ? 'Product' : 'Products'}
            </span>
            
            <div className="d-flex align-items-center gap-2">
              <span className="text-secondary small fw-semibold">Sort By</span>
              <select
                className="form-select py-1.5 px-3"
                style={{ width: '180px', fontSize: '0.9rem' }}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="default">New Arrivals</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Grid list */}
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : products.length > 0 ? (
            <div className="row g-4">
              {products.map((prod) => (
                <div key={prod.id} className="col-lg-4 col-md-6 col-6">
                  <ProductCard product={prod} />
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card text-center p-5 mt-4">
              <i className="bi bi-search-heart text-secondary fs-1 mb-2"></i>
              <h5 className="fw-bold">No Products Found</h5>
              <p className="text-secondary mb-0 small">
                We couldn't find any products matching your specific filters. Try expanding your search queries.
              </p>
              <button onClick={handleResetFilters} className="btn btn-premium rounded-pill px-4 mt-3">
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;
