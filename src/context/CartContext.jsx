import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { productAPI } from '../services/api';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { token, isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('aura_guest_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [cartId, setCartId] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated || !token) {
      try {
        const saved = localStorage.getItem('aura_guest_cart');
        setCartItems(saved ? JSON.parse(saved) : []);
      } catch {
        setCartItems([]);
      }
      return;
    }
    try {
      // Sync guest cart to backend if any
      const guestSaved = localStorage.getItem('aura_guest_cart');
      if (guestSaved) {
        const guestItems = JSON.parse(guestSaved);
        if (guestItems && guestItems.length > 0) {
          for (const it of guestItems) {
            const pid = it.product?.id || it.productId || it.id;
            if (pid) {
              await fetch('/api/cart/items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ productId: pid, quantity: it.quantity || 1 })
              }).catch(() => {});
            }
          }
          localStorage.removeItem('aura_guest_cart');
        }
      }

      const res = await fetch('/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCartId(data.id);
        setCartItems(data.items || []);
      }
    } catch (e) {
      console.error('Failed to fetch cart', e);
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, quantity = 1, productDetails = null) => {
    if (isAuthenticated && token) {
      try {
        const res = await fetch('/api/cart/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ productId, quantity })
        });
        if (res.ok) {
          const data = await res.json();
          setCartItems(data.items || []);
          return true;
        }
      } catch (e) {
        console.error('Failed to add to backend cart', e);
      }
      return false;
    }

    // Guest Cart support
    try {
      let product = productDetails;
      if (!product) {
        product = await productAPI.byId(productId).catch(() => null);
      }
      if (!product) {
        product = { id: productId, name: 'Curated Luxury Item', price: 999.00 };
      }

      setCartItems((prev) => {
        const existingIdx = prev.findIndex((it) => (it.product?.id || it.productId || it.id) === productId);
        let updated;
        if (existingIdx >= 0) {
          updated = [...prev];
          updated[existingIdx] = {
            ...updated[existingIdx],
            quantity: updated[existingIdx].quantity + quantity
          };
        } else {
          updated = [
            ...prev,
            {
              id: Date.now() + Math.random(),
              productId,
              product,
              productName: product.name,
              price: product.price,
              quantity,
              imageUrl: product.imageUrl,
            }
          ];
        }
        localStorage.setItem('aura_guest_cart', JSON.stringify(updated));
        return updated;
      });
      return true;
    } catch (e) {
      console.error('Failed to add to guest cart', e);
      return false;
    }
  };

  const updateQuantity = async (cartItemId, quantity) => {
    if (quantity <= 0) {
      return removeItem(cartItemId);
    }

    if (isAuthenticated && token) {
      try {
        const res = await fetch(`/api/cart/items/${cartItemId}?quantity=${quantity}`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setCartItems(data.items || []);
        }
      } catch (e) {
        console.error('Failed to update quantity', e);
      }
      return;
    }

    // Guest cart update
    setCartItems((prev) => {
      const updated = prev.map((item) => (item.id === cartItemId ? { ...item, quantity } : item));
      localStorage.setItem('aura_guest_cart', JSON.stringify(updated));
      return updated;
    });
  };

  const removeItem = async (cartItemId) => {
    if (isAuthenticated && token) {
      try {
        const res = await fetch(`/api/cart/items/${cartItemId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setCartItems(data.items || []);
        }
      } catch (e) {
        console.error('Failed to remove item', e);
      }
      return;
    }

    // Guest cart remove
    setCartItems((prev) => {
      const updated = prev.filter((item) => item.id !== cartItemId);
      localStorage.setItem('aura_guest_cart', JSON.stringify(updated));
      return updated;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('aura_guest_cart');
  };

  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.price || item.product?.price || 0;
    return sum + price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartId,
        itemCount,
        subtotal,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        fetchCart,
        drawerOpen,
        setDrawerOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}

