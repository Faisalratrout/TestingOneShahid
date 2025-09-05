import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { toggleCart } from '../../store/slices/cartSlice';
import './CartButton.css';

const CartButton: React.FC = () => {
  const dispatch = useDispatch();
  const { totalItems } = useSelector((state: RootState) => state.cart);

  const handleClick = () => {
    dispatch(toggleCart());
  };

  return (
    <button 
      className={`cart-button ${totalItems > 0 ? 'has-items' : ''}`}
      onClick={handleClick}
    >
      <span className="cart-icon">🛒</span>
      <span>Cart</span>
      {totalItems > 0 && (
        <span className="cart-badge">{totalItems}</span>
      )}
    </button>
  );
};

export default CartButton;
