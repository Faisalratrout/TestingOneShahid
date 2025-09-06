import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { removeToast } from '../../store/slices/toastSlice';
import './ToastContainer.css';

const ToastContainer: React.FC = () => {
  const dispatch = useDispatch();
  const toasts = useSelector((state: RootState) => state.toast.toasts);

  useEffect(() => {
    toasts.forEach(toast => {
      if (toast.duration && toast.duration > 0) {
        const timer = setTimeout(() => {
          dispatch(removeToast(toast.id));
        }, toast.duration);
        
        return () => clearTimeout(timer);
      }
    });
  }, [toasts, dispatch]);

  const handleRemoveToast = (id: string) => {
    dispatch(removeToast(id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type}`}
        >
          <div className="toast-content">
            <div className="toast-icon">
              {toast.type === 'success' && '✅'}
              {toast.type === 'error' && '❌'}
              {toast.type === 'warning' && '⚠️'}
              {toast.type === 'info' && 'ℹ️'}
            </div>
            <div className="toast-message">{toast.message}</div>
          </div>
          <button
            className="toast-close"
            onClick={() => handleRemoveToast(toast.id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
