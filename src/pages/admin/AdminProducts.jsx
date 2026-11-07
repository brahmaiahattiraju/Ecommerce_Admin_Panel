import { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, Search, X, AlertTriangle, AlertCircle, 
  RefreshCw, UploadCloud, Image, Check, Sparkles, Wand2, CheckCheck, Lightbulb 
} from 'lucide-react';
import { adminAPI, categoryAPI, uploadAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatINR } from '../../utils/currency';
import { generateAICopywriting } from '../../utils/aiCopywriter';
import '../../styles/admin.css';

const PRESET_GALLERY = {
  mobiles: [
    { name: 'iPhone 16 Pro Max', url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format' },
    { name: 'Galaxy S24 Ultra', url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format' },
    { name: 'OnePlus 12 5G', url: 'https://images.unsplash.com/photo-1565630916779-e303be97b6f5?w=800&auto=format' },
    { name: 'Pixel 9 Pro XL', url: 'https://images.unsplash.com/photo-1573148195900-7845dcb9b127?w=800&auto=format' }
  ],
  electronics: [
    { name: 'Ultra Laptop', url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format' },
    { name: 'Flagship Phone', url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format' },
    { name: 'Smart Watch', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format' },
    { name: 'Pro Tablet', url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format' }
  ],
  audio: [
    { name: 'Studio Headphones', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format' },
    { name: 'Wireless Earbuds', url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format' },
    { name: 'Bluetooth Speaker', url: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format' },
    { name: 'Hi-Fi System', url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format' }
  ],
  'home-living': [
    { name: 'Modern Lamp', url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format' },
    { name: 'Leather Chair', url: 'https://images.unsplash.com/photo-1580481077195-c3a821a506cb?w=800&auto=format' },
    { name: 'Ceramic Vase', url: 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=800&auto=format' },
    { name: 'Aroma Diffuser', url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&auto=format' }
  ],
  fashion: [
    { name: 'Leather Jacket', url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format' },
    { name: 'Sport Sneaker', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format' },
    { name: 'Luxury Watch', url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format' },
    { name: 'Designer Shades', url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&auto=format' }
  ],
  fitness: [
    { name: 'Smart Dumbbells', url: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format' },
    { name: 'Eco Yoga Mat', url: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&auto=format' },
    { name: 'Resistance Bands', url: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=800&auto=format' },
    { name: 'Thermal Bottle', url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format' }
  ]
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const initialForm = {
    name: '',
    slug: '',
    description: '',
    price: '',
    comparePrice: '',
    stockQuantity: '',
    imageUrl: '',
    categoryId: '',
    featured: false,
    rating: 5.0,
  };

  const [formData, setFormData] = useState(initialForm);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [presetTab, setPresetTab] = useState('electronics');
  const [fileDetails, setFileDetails] = useState(null);

  // AI Copywriter Assistant State
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiTone, setAiTone] = useState('luxury');
  const [aiResult, setAiResult] = useState(null);
  const [aiGenerating, setAiGenerating] = useState(false);

  const handleOpenAiCopywriter = () => {
    const initialName = formData.name || '';
    setAiPrompt(initialName);
    setAiModalOpen(true);
    if (initialName.trim()) {
      const generated = generateAICopywriting({ name: initialName, tone: aiTone, categories });
      setAiResult(generated);
    }
  };

  const handleRunAiGeneration = (customTone) => {
    const toneToUse = customTone || aiTone;
    const nameToUse = aiPrompt.trim() || formData.name || 'AURA Flagship Device';
    setAiGenerating(true);
    setTimeout(() => {
      const res = generateAICopywriting({ name: nameToUse, tone: toneToUse, categories });
      setAiResult(res);
      setAiGenerating(false);
      toast.success('✨ Generated fresh copy with AI!');
    }, 350);
  };

  const handleApplyAiCopy = (applyAll = true) => {
    if (!aiResult) return;
    setFormData((prev) => {
      const updated = {
        ...prev,
        description: aiResult.description,
      };
      if (applyAll) {
        if (!prev.name && aiResult.name) updated.name = aiResult.name;
        if (aiResult.suggestedCategory) updated.categoryId = aiResult.suggestedCategory.id;
        if (!prev.price || prev.price === '') updated.price = aiResult.suggestedPrice;
        if (!prev.comparePrice || prev.comparePrice === '') updated.comparePrice = aiResult.suggestedComparePrice;
      }
      return updated;
    });
    toast.success(applyAll ? '✨ All AI specs applied to product form!' : '✨ AI description inserted into form!');
    setAiModalOpen(false);
  };

  const processFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, WEBP, etc.)');
      return;
    }

    setFileDetails({
      name: file.name,
      size: `${(file.size / 1024).toFixed(1)} KB`
    });

    // 1. Instant local preview using FileReader so the admin immediately sees the photo
    const reader = new FileReader();
    reader.onload = (e) => {
      setFormData((prev) => ({ ...prev, imageUrl: e.target.result }));
    };
    reader.readAsDataURL(file);

    // 2. Upload to Cloudinary in the background
    setUploading(true);
    try {
      const res = await uploadAPI.uploadImage(file, 'ecommerce/products');
      if (res && res.url) {
        setFormData((prev) => ({ ...prev, imageUrl: res.url }));
        toast.success('Image uploaded to Cloudinary successfully!');
      }
    } catch (err) {
      console.warn('Cloudinary upload error:', err);
      toast.info('Local image preview loaded. You can proceed or pick a photo from Presets below.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    processFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    processFile(file);
  };

  const loadData = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [prods, cats] = await Promise.all([
        adminAPI.getAllProducts(),
        categoryAPI.list(),
      ]);
      const productList = Array.isArray(prods) ? prods : (prods?.content || []);
      const categoryList = Array.isArray(cats) ? cats : (cats?.content || []);
      setProducts(productList);
      setCategories(categoryList);
    } catch (err) {
      const msg = err.message || 'Failed to load products';
      setLoadError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData(initialForm);
    setModalOpen(true);
  };

  const openEditModal = (p) => {
    setEditingProduct(p);
    setFormData({
      name: p.name || '',
      slug: p.slug || '',
      description: p.description || '',
      price: p.price ?? '',
      comparePrice: p.comparePrice ?? '',
      stockQuantity: p.stockQuantity ?? 0,
      imageUrl: p.imageUrl || '',
      categoryId: p.category?.id || '',
      featured: p.featured || false,
      rating: p.rating || 5.0,
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      toast.error('Product name is required');
      return;
    }
    const numPrice = parseFloat(formData.price);
    if (isNaN(numPrice) || numPrice <= 0) {
      toast.error('Please enter a valid price greater than 0');
      return;
    }
    const numStock = parseInt(formData.stockQuantity, 10);
    if (isNaN(numStock) || numStock < 0) {
      toast.error('Please enter a valid stock quantity (0 or more)');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        slug: formData.slug?.trim() || formData.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: formData.description?.trim() || '',
        price: numPrice,
        comparePrice: formData.comparePrice ? parseFloat(formData.comparePrice) : null,
        stockQuantity: numStock,
        categoryId: formData.categoryId ? parseInt(formData.categoryId, 10) : null,
        imageUrl: formData.imageUrl?.trim() || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
        featured: !!formData.featured,
        rating: parseFloat(formData.rating || 5.0),
      };

      if (editingProduct) {
        await adminAPI.updateProduct(editingProduct.id, payload);
        toast.success(`"${payload.name}" updated successfully!`);
      } else {
        await adminAPI.createProduct(payload);
        toast.success(`"${payload.name}" created successfully!`);
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await adminAPI.deleteProduct(id);
        toast.success('Product removed');
        loadData();
      } catch (err) {
        toast.error(err.message || 'Failed to delete product');
      }
    }
  };

  const handleToggleFeatured = async (p) => {
    try {
      const updated = await adminAPI.toggleFeatured(p.id);
      setProducts((prev) => prev.map((item) => (item.id === p.id ? { ...item, featured: updated.featured } : item)));
      toast.success(updated.featured ? `"${p.name}" featured on storefront!` : `"${p.name}" unfeatured`);
    } catch (err) {
      toast.error(err.message || 'Failed to toggle featured status');
    }
  };

  const handleAdjustStock = async (p, delta) => {
    try {
      const updated = await adminAPI.adjustStock(p.id, delta);
      setProducts((prev) => prev.map((item) => (item.id === p.id ? { ...item, stockQuantity: updated.stockQuantity } : item)));
      toast.success(`Inventory updated: ${updated.stockQuantity} units in stock`);
    } catch (err) {
      toast.error(err.message || 'Failed to update stock');
    }
  };

  const productList = Array.isArray(products) ? products : (products?.content || []);
  const totalStockUnits = productList.reduce((acc, p) => acc + (p.stockQuantity || 0), 0);
  const lowStockCount = productList.filter((p) => (p.stockQuantity || 0) < 5).length;
  const featuredCount = productList.filter((p) => p.featured).length;

  const filtered = productList.filter((p) => {
    const matchesSearch = p.name?.toLowerCase().includes(search.toLowerCase()) ||
                          p.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCat === 'ALL' || (p.category && String(p.category.id) === String(selectedCat));
    return matchesSearch && matchesCat;
  });

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Product Catalog</h1>
          <p className="admin-page-subtitle">Manage inventory, prices, images, and collections</p>
        </div>
        <button onClick={openCreateModal} className="btn btn-primary">
          <Plus size={18} /> New Product
        </button>
      </div>

      {/* Load Error Banner */}
      {loadError && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.35)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--accent-rose)' }}>
            <AlertCircle size={22} style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#fff' }}>Catalog Loading Issue</div>
              <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.8)', marginTop: '0.2rem' }}>{loadError}</div>
            </div>
          </div>
          <button 
            onClick={loadData} 
            className="btn btn-outline" 
            style={{ fontSize: '0.8rem', padding: '0.45rem 0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0, backgroundColor: 'rgba(239, 68, 68, 0.2)' }}
          >
            <RefreshCw size={14} /> Retry Loading
          </button>
        </div>
      )}

      {/* KPI Cards Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <div className="admin-card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.35rem' }}>Total Catalog SKUs</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>{products.length}</div>
        </div>
        <div className="admin-card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.35rem' }}>Total Stock Units</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>{totalStockUnits}</div>
        </div>
        <div className="admin-card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.35rem' }}>Featured Showcase</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-amber)' }}>{featuredCount}</div>
        </div>
        <div className="admin-card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.35rem' }}>Low Stock Warnings</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: lowStockCount > 0 ? 'var(--accent-rose)' : 'var(--text-muted)' }}>
            {lowStockCount}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="admin-filter-bar">
        <div className="admin-search-box">
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search by title, SKU, keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={selectedCat}
          onChange={(e) => setSelectedCat(e.target.value)}
          className="admin-select"
        >
          <option value="ALL">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="admin-card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock & Quick Adjust</th>
                  <th>Featured</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      No products found matching criteria
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => {
                    const isLowStock = p.stockQuantity < 5;
                    return (
                      <tr key={p.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                            <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.04)', flexShrink: 0 }}>
                              <img
                                src={p.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200'}
                                alt={p.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SKU: PROD-{p.id}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="admin-badge" style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
                            {p.category?.name || 'Unassigned'}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 700 }}>{formatINR(p.price)}</div>
                          {p.comparePrice && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                              {formatINR(p.comparePrice)}
                            </div>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              padding: '0.2rem 0.6rem',
                              borderRadius: 'var(--radius-pill)',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              backgroundColor: isLowStock ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                              color: isLowStock ? 'var(--accent-rose)' : 'var(--accent-emerald)',
                              minWidth: '70px',
                              justifyContent: 'center'
                            }}>
                              {isLowStock && <AlertTriangle size={12} />}
                              {p.stockQuantity}
                            </span>
                            <div style={{ display: 'inline-flex', gap: '0.25rem' }}>
                              <button
                                onClick={() => handleAdjustStock(p, -5)}
                                className="btn btn-outline"
                                style={{ padding: '0.2rem 0.45rem', fontSize: '0.7rem', height: '24px' }}
                                title="Decrease stock by 5"
                              >
                                -5
                              </button>
                              <button
                                onClick={() => handleAdjustStock(p, 5)}
                                className="btn btn-outline"
                                style={{ padding: '0.2rem 0.45rem', fontSize: '0.7rem', height: '24px' }}
                                title="Add 5 units to stock"
                              >
                                +5
                              </button>
                            </div>
                          </div>
                        </td>
                        <td>
                          <button
                            onClick={() => handleToggleFeatured(p)}
                            style={{
                              background: p.featured ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                              border: p.featured ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid var(--border-glass)',
                              color: p.featured ? 'var(--accent-amber)' : 'var(--text-muted)',
                              padding: '0.3rem 0.65rem',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              transition: 'all var(--transition-fast)'
                            }}
                            title="Click to toggle featured status on storefront"
                          >
                            <span>{p.featured ? '★ Featured' : '☆ Regular'}</span>
                          </button>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                            <button
                              onClick={() => openEditModal(p)}
                              className="btn btn-outline"
                              style={{ padding: '0.35rem 0.6rem' }}
                              title="Edit product"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(p.id, p.name)}
                              className="btn btn-outline"
                              style={{ padding: '0.35rem 0.6rem', color: 'var(--accent-rose)' }}
                              title="Delete product"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form for Create/Edit */}
      {modalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card" style={{ maxWidth: '640px' }}>
            <div className="admin-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                <button
                  type="button"
                  onClick={handleOpenAiCopywriter}
                  style={{
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(6, 182, 212, 0.25) 100%)',
                    border: '1px solid rgba(99, 102, 241, 0.45)',
                    color: '#c7d2fe',
                    padding: '0.25rem 0.65rem',
                    borderRadius: '6px',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                  title="Generate luxury description, specs, category, and pricing with AI"
                >
                  <Sparkles size={13} color="#38bdf8" />
                  <span>✨ AI Copywriter</span>
                </button>
              </div>
              <button onClick={() => setModalOpen(false)} style={{ color: 'var(--text-muted)', cursor: 'pointer', background: 'transparent', border: 'none' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="admin-modal-body">
              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aura Studio Pro Wireless Headphones"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="24999"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Compare Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="29999"
                    value={formData.comparePrice}
                    onChange={(e) => setFormData({ ...formData, comparePrice: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Stock Units *</label>
                  <input
                    type="number"
                    required
                    placeholder="25"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="form-input"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Enhanced Product Image Section */}
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Image size={15} color="#febd69" /> Product Image & Photography
                  </span>
                  {uploading && <span style={{ fontSize: '0.78rem', color: '#febd69', fontWeight: 600 }}>Syncing to Cloud...</span>}
                </label>

                {/* 1. Drag & Drop Upload Zone */}
                <div
                  className={`upload-dropzone${isDragging ? ' dragging' : ''}`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('admin-file-picker')?.click()}
                  style={{ marginBottom: '1rem' }}
                >
                  <UploadCloud size={30} color={isDragging ? '#febd69' : '#94a3b8'} />
                  <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 600, color: '#f8fafc' }}>
                    {isDragging ? 'Drop your image here' : 'Drag & drop image here, or browse files'}
                  </p>
                  <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                    Supports PNG, JPG, WebP, AVIF (instant local preview + cloud sync)
                  </span>
                  <input
                    id="admin-file-picker"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                </div>

                {/* 2. Active Image Preview Card */}
                {formData.imageUrl && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', marginBottom: '1rem' }}>
                    <div style={{ width: '70px', height: '70px', borderRadius: '4px', overflow: 'hidden', border: '1px solid #febd69', flexShrink: 0, background: '#000' }}>
                      <img src={formData.imageUrl} alt="Selected preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontSize: '0.8rem', fontWeight: 600 }}>
                        <Check size={14} /> Image Selected & Active
                      </div>
                      <p style={{ fontSize: '0.74rem', color: '#94a3b8', margin: '0.2rem 0 0', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {fileDetails ? `${fileDetails.name} (${fileDetails.size})` : formData.imageUrl}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, imageUrl: '' }));
                        setFileDetails(null);
                      }}
                      className="btn btn-outline"
                      style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', color: '#f87171' }}
                    >
                      Clear
                    </button>
                  </div>
                )}

                {/* 3. Curated High-Res Photography Presets */}
                <div style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#febd69', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Sparkles size={13} /> Or 1-Click Pick from Curated Presets:
                    </span>
                  </div>

                  {/* Preset Category Tabs */}
                  <div className="preset-category-tabs">
                    {[
                      { id: 'mobiles', label: '📱 Mobiles' },
                      { id: 'electronics', label: '💻 Electronics' },
                      { id: 'audio', label: '🎧 Audio' },
                      { id: 'home-living', label: '🏠 Home' },
                      { id: 'fashion', label: '👕 Fashion' },
                      { id: 'fitness', label: '🏋️ Fitness' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        type="button"
                        className={`preset-tab-btn${presetTab === tab.id ? ' active' : ''}`}
                        onClick={() => setPresetTab(tab.id)}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Preset Photos Grid */}
                  <div className="preset-grid">
                    {(PRESET_GALLERY[presetTab] || []).map((preset, idx) => (
                      <div
                        key={idx}
                        className={`preset-card${formData.imageUrl === preset.url ? ' active' : ''}`}
                        onClick={() => {
                          setFormData(prev => ({ ...prev, imageUrl: preset.url }));
                          setFileDetails({ name: preset.name, size: 'Curated 4K' });
                          toast.success(`Selected "${preset.name}"!`);
                        }}
                        title={`Select ${preset.name}`}
                      >
                        <img src={preset.url} alt={preset.name} />
                        <span className="preset-card-label">{preset.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. External URL Fallback */}
                <div>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '0.35rem' }}>
                    Or paste direct image URL:
                  </span>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.imageUrl}
                    onChange={(e) => {
                      setFormData({ ...formData, imageUrl: e.target.value });
                      setFileDetails(null);
                    }}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>Product Description</label>
                  <button
                    type="button"
                    onClick={handleOpenAiCopywriter}
                    style={{
                      background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)',
                      border: '1px solid rgba(99, 102, 241, 0.4)',
                      color: '#c7d2fe',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '5px',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    <Sparkles size={12} color="#38bdf8" />
                    <span>Generate with AI Copywriter</span>
                  </button>
                </div>
                <textarea
                  rows={4}
                  placeholder="Provide rich details about craftsmanship, specs, and materials..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="form-input"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="featured-check"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="featured-check" style={{ fontSize: '0.9rem', cursor: 'pointer', userSelect: 'none' }}>
                  Feature this product on homepage carousel & trending showcase
                </label>
              </div>

              <div className="admin-modal-footer">
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-outline" disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving Product...' : (editingProduct ? 'Save Changes' : 'Create Product')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Copywriter Modal Assistant */}
      {aiModalOpen && (
        <div className="admin-modal-overlay" style={{ zIndex: 1100 }}>
          <div className="admin-modal-card" style={{ maxWidth: '680px', border: '1px solid rgba(99, 102, 241, 0.4)', boxShadow: '0 25px 60px -15px rgba(99, 102, 241, 0.3)' }}>
            <div className="admin-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
                }}>
                  <Sparkles size={18} color="#fff" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, background: 'linear-gradient(135deg, #fff 40%, #c7d2fe 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    AURA Studio AI Copywriter
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    Generate luxury descriptions, high-converting bullet points & pricing in seconds
                  </span>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setAiModalOpen(false)} 
                style={{ color: 'var(--text-muted)', cursor: 'pointer', background: 'transparent', border: 'none', padding: '0.4rem' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="admin-modal-body" style={{ maxHeight: 'calc(85vh - 140px)', overflowY: 'auto', padding: '1.25rem 0' }}>
              {/* Prompt Input */}
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Product Title / Concept Keywords</span>
                  <span style={{ fontSize: '0.74rem', color: '#38bdf8' }}>e.g. brand, model, key feature</span>
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g. Anker Prime 27,650mAh Power Bank (250W)"
                    className="form-input"
                    style={{ flex: 1 }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleRunAiGeneration();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRunAiGeneration()}
                    disabled={aiGenerating}
                    className="btn btn-primary"
                    style={{
                      background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                      border: 'none',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.5rem 1rem'
                    }}
                  >
                    {aiGenerating ? <RefreshCw size={15} className="spin" /> : <Wand2 size={15} />}
                    <span>{aiGenerating ? 'Writing...' : 'Generate Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Quick Preset Chips */}
              <div style={{ marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block', marginBottom: '0.4rem' }}>
                  Try quick luxury product presets:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {[
                    'Anker Prime 27,650mAh 250W Power Bank',
                    'Aura Studio Pro Wireless Titanium Headphones',
                    'OnePlus 12 5G (Flowy Emerald)',
                    'Aura Chrono Titan Smartwatch',
                    'Ultra 140W GaN Travel Fast Charger'
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setAiPrompt(preset);
                        setAiGenerating(true);
                        setTimeout(() => {
                          const res = generateAICopywriting({ name: preset, tone: aiTone, categories });
                          setAiResult(res);
                          setAiGenerating(false);
                        }, 300);
                      }}
                      style={{
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#e2e8f0',
                        padding: '0.25rem 0.55rem',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseOver={(e) => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.color = '#c7d2fe'; }}
                      onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'; e.currentTarget.style.color = '#e2e8f0'; }}
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tone of Voice Selector */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ marginBottom: '0.4rem' }}>Tone of Voice</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  {[
                    { id: 'luxury', label: '💎 Luxury & Prestige', desc: 'Poetic, elevated, atelier focus' },
                    { id: 'technical', label: '⚡ Technical & Specs', desc: 'Engineering benchmarks, metrics' },
                    { id: 'retail', label: '🎯 High-Converting', desc: 'Benefits, convenience, CTA' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setAiTone(t.id);
                        if (aiResult || aiPrompt) {
                          handleRunAiGeneration(t.id);
                        }
                      }}
                      style={{
                        textAlign: 'left',
                        padding: '0.6rem 0.75rem',
                        borderRadius: '8px',
                        border: aiTone === t.id ? '1px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.08)',
                        background: aiTone === t.id ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                        color: aiTone === t.id ? '#c7d2fe' : '#cbd5e1',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: '0.78rem' }}>{t.label}</div>
                      <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '0.2rem' }}>{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Generated Preview Output */}
              {aiResult && (
                <div style={{
                  background: 'rgba(99, 102, 241, 0.06)',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                  borderRadius: '10px',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800, color: '#38bdf8', background: 'rgba(56, 189, 248, 0.12)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                        AI Generated Copy
                      </span>
                      {aiResult.suggestedCategory && (
                        <span style={{ fontSize: '0.72rem', color: '#a7f3d0', background: 'rgba(16, 185, 129, 0.12)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                          Category: {aiResult.suggestedCategory.name}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.82rem', fontWeight: 700 }}>
                      <span style={{ color: '#febd69' }}>MSRP: {formatINR(aiResult.suggestedPrice)}</span>
                      <span style={{ color: '#94a3b8', textDecoration: 'line-through' }}>{formatINR(aiResult.suggestedComparePrice)}</span>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, marginBottom: '0.3rem' }}>
                      Narrative Overview:
                    </div>
                    <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: 1.55, color: '#f1f5f9', whiteSpace: 'pre-line' }}>
                      {aiResult.shortDescription}
                    </p>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, marginBottom: '0.35rem' }}>
                      Key Selling Highlights:
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                      {aiResult.bulletPoints.map((bp, i) => (
                        <li key={i} style={{ marginBottom: '0.25rem' }}>{bp}</li>
                      ))}
                    </ul>
                  </div>

                  {aiResult.seoKeywords && (
                    <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                      <strong style={{ color: '#cbd5e1' }}>SEO Tags: </strong> {aiResult.seoKeywords}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="admin-modal-footer" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button 
                type="button" 
                onClick={() => setAiModalOpen(false)} 
                className="btn btn-outline"
                style={{ fontSize: '0.82rem' }}
              >
                Close
              </button>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => handleApplyAiCopy(false)}
                  disabled={!aiResult}
                  className="btn btn-outline"
                  style={{ fontSize: '0.82rem', color: '#a5b4fc', borderColor: 'rgba(99, 102, 241, 0.4)' }}
                >
                  Insert Description Only
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyAiCopy(true)}
                  disabled={!aiResult}
                  className="btn btn-primary"
                  style={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                    border: 'none',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    boxShadow: '0 4px 15px rgba(99, 102, 241, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <Sparkles size={14} />
                  <span>Apply All to Form (Name, Price & Copy)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
