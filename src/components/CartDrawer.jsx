import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { formatINR } from '../utils/currency';
import '../styles/store.css';

export default function CartDrawer({ onClose }) {
  const { cartItems, itemCount, subtotal, updateQuantity, removeItem } = useCart();
  const toast = useToast();

  const handleRemove = async (itemId, name) => {
    await removeItem(itemId);
    toast.info(`${name || 'Item'} removed from bag`);
  };

  const handleQty = async (itemId, newQty) => {
    if (newQty < 1) return;
    await updateQuantity(itemId, newQty);
  };

  const tax = subtotal * 0.18; // 18% GST standard in India
  const total = subtotal + tax;

  return (
    <>
      <div className="cart-drawer-overlay" onClick={onClose} />
      <div className="cart-drawer">
        {/* Header */}
        <div className="cart-drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShoppingBag size={20} />
            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
              Shopping Bag
              {itemCount > 0 && (
                <span style={{ marginLeft: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                  ({itemCount} {itemCount === 1 ? 'item' : 'items'})
                </span>
              )}
            </h3>
          </div>
          <button onClick={onClose} className="icon-btn" id="cart-close-btn">
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        <div className="cart-drawer-items">
          {cartItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <ShoppingBag size={56} color="var(--text-dim)" style={{ marginBottom: '1rem' }} />
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Your bag is currently empty</p>
              <button onClick={onClose} className="btn btn-primary btn-sm">
                Explore Catalog
              </button>
            </div>
          ) : (
            cartItems.map(item => {
              const name = item.product?.name || item.productName || 'Luxury Wares';
              const img = item.product?.imageUrl || item.imageUrl || 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=200&auto=format';
              const price = item.price || item.product?.price || 0;
              return (
                <div key={item.id} className="cart-item-card">
                  <img
                    src={img}
                    alt={name}
                    className="cart-item-img"
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {name}
                    </p>
                    <p style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.6rem' }}>
                      {formatINR(price * item.quantity)}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div className="quantity-selector" style={{ border: '1px solid var(--border-glass)' }}>
                        <button className="qty-btn" onClick={() => handleQty(item.id, item.quantity - 1)}>
                          <Minus size={13} />
                        </button>
                        <span className="qty-value" style={{ fontSize: '0.85rem' }}>{item.quantity}</span>
                        <button className="qty-btn" onClick={() => handleQty(item.id, item.quantity + 1)}>
                          <Plus size={13} />
                        </button>
                      </div>
                      <button onClick={() => handleRemove(item.id, name)} className="icon-btn delete-btn">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="cart-drawer-footer">
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              <span>Subtotal</span>
              <span>{formatINR(subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              <span>GST (18%)</span>
              <span>{formatINR(tax)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.05rem', borderTop: '1px solid var(--border-glass)', paddingTop: '0.75rem' }}>
              <span>Grand Total</span>
              <span style={{ color: 'var(--text-primary)' }}>{formatINR(total)}</span>
            </div>
            <Link to="/cart" className="btn btn-secondary" onClick={onClose} style={{ textAlign: 'center' }}>
              Review Full Bag
            </Link>
            <Link to="/checkout" className="btn btn-primary" onClick={onClose} style={{ textAlign: 'center' }}>
              Secure Checkout <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
