import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Check, Zap } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import '../styles/store.css';

function AmazonStarRating({ rating, reviewsCount = 120 }) {
  const score = rating || 4.5;
  return (
    <div className="amazon-rating-row">
      <div className="amazon-stars">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={13}
            fill={i <= Math.round(score) ? '#de7921' : 'none'}
            color={i <= Math.round(score) ? '#de7921' : '#94a3b8'}
          />
        ))}
      </div>
      <span className="amazon-rating-score">{score.toFixed(1)}</span>
      <span className="amazon-review-count">({reviewsCount.toLocaleString()})</span>
    </div>
  );
}

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const toast = useToast();

  const discount = product.comparePrice && product.comparePrice > product.price
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : (product.featured ? 22 : 0);

  const effectiveComparePrice = product.comparePrice || (discount > 0 ? Math.round(product.price * 1.25) : null);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const success = await addToCart(product.id, 1, product);
    if (success) {
      toast.success(`${product.name} added to your Amazon Cart!`);
    } else {
      toast.error('Could not add item to cart');
    }
  };

  return (
    <Link to={`/product/${product.id}`} className="product-card" id={`product-${product.id}`}>
      {/* Product Image Box */}
      <div className="product-image-container">
        <img
          src={product.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format'}
          alt={product.name}
          loading="lazy"
        />

        {/* Amazon Badges */}
        {discount >= 15 ? (
          <div className="product-tag-deal">
            <span className="badge-amazon-deal">Limited time deal</span>
          </div>
        ) : null}

        {product.featured && (
          <div className="product-tag-bestseller">
            <span className="badge-amazon-bestseller">#1 Best Seller</span>
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="product-details">
        <span className="product-brand-tag">
          {product.category?.name || 'Aura Store'}
        </span>

        <h3 className="product-title" title={product.name}>
          {product.name}
        </h3>

        <AmazonStarRating rating={product.rating} reviewsCount={product.reviewsCount || 148} />

        {/* Amazon Price Presentation */}
        <div className="amazon-price-row">
          {discount > 0 && (
            <span className="amazon-discount-badge">-{discount}%</span>
          )}
          <div className="amazon-main-price">
            <span className="amazon-price-currency">₹</span>
            <span>{Number(product.price).toLocaleString('en-IN')}</span>
          </div>
        </div>

        {effectiveComparePrice && (
          <div className="amazon-mrp-row">
            M.R.P.: <span className="amazon-mrp-val">₹{Number(effectiveComparePrice).toLocaleString('en-IN')}</span>
          </div>
        )}

        {/* Amazon Prime & Delivery Details */}
        <div className="amazon-prime-delivery">
          <span className="badge-amazon-prime">
            <span className="check">✓</span>prime
          </span>
          <span>Get it by <strong>Tomorrow, 11 AM</strong></span>
        </div>

        {product.stockQuantity <= 5 && product.stockQuantity > 0 && (
          <p style={{ fontSize: '0.74rem', color: '#b12704', fontWeight: 600, marginBottom: '0.5rem' }}>
            ⚡ Only {product.stockQuantity} left in stock - order soon.
          </p>
        )}
        {product.stockQuantity === 0 && (
          <p style={{ fontSize: '0.74rem', color: '#f87171', fontWeight: 600, marginBottom: '0.5rem' }}>
            Currently unavailable
          </p>
        )}

        {/* Amazon Yellow Add to Cart Button */}
        <div className="product-card-action">
          <button
            className="btn-amazon-card-cart"
            onClick={handleAddToCart}
            id={`add-cart-${product.id}`}
            type="button"
          >
            <ShoppingCart size={15} />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
    </Link>
  );
}
