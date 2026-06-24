import React, { createContext, useState, useEffect, useContext } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('pelligallery_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('pelligallery_cart', JSON.stringify(cart));
  }, [cart]);

  // Adds a package with its unique customizations list
  const addToCart = (pkg, selectedCustomizations = []) => {
    // Generate a unique identifier based on package id and customizations to group exact matches
    const sortedOpts = [...selectedCustomizations].sort((a, b) => a.id.localeCompare(b.id));
    const cartItemId = `${pkg.id}-${sortedOpts.map(o => o.id).join('_')}`;

    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(item => item.cartItemId === cartItemId);

      if (existingItemIndex !== -1) {
        // Increment quantity of identical matches
        const newCart = [...prevCart];
        newCart[existingItemIndex].quantity += 1;
        return newCart;
      } else {
        // Add new package line item
        return [
          ...prevCart,
          {
            cartItemId,
            package_id: pkg.id,
            name: pkg.name,
            base_price: parseFloat(pkg.price),
            quantity: 1,
            selected_customizations: sortedOpts,
            description: pkg.description
          }
        ];
      }
    });
  };

  const removeFromCart = (cartItemId) => {
    setCart(prevCart => prevCart.filter(item => item.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.cartItemId === cartItemId ? { ...item, quantity: parseInt(quantity, 10) } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Calculates subtotal: (base_price + customizations) * quantity
  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const customsPrice = item.selected_customizations.reduce((sum, opt) => sum + parseFloat(opt.price || 0), 0);
      return total + (item.base_price + customsPrice) * item.quantity;
    }, 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used inside a CartProvider');
  }
  return context;
};
