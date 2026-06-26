import React, { useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export const Toast = ({ message, type = 'success', onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeStyles = {
    success: 'bg-zinc-900 border-emerald-500/30 text-emerald-400',
    error: 'bg-zinc-900 border-rose-500/30 text-rose-400',
    info: 'bg-zinc-900 border-gold-500/30 text-gold-400'
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-gold-400 shrink-0" />
  };

  return (
    <div className={`fixed bottom-4 right-4 left-4 sm:left-auto sm:bottom-6 sm:right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-xl animate-slide-up glass-panel-dark max-w-[calc(100vw-2rem)] sm:max-w-sm ${typeStyles[type]}`}>
      {icons[type]}
      <p className="text-sm font-sans text-stone-200">{message}</p>
      <button 
        onClick={onClose}
        className="text-stone-400 hover:text-stone-200 transition-colors ml-auto p-1 rounded-full hover:bg-white/5"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;
