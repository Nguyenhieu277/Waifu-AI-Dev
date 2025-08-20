"use client";
import { memo } from 'react';

interface SimpleWatermarkProps {
  size?: 'small' | 'medium' | 'large';
}

const SimpleWatermark: React.FC<SimpleWatermarkProps> = memo(({ size = 'medium' }) => {
  // Kích thước logo dựa trên prop size
  const logoSizes = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24', 
    large: 'w-32 h-32'
  };

  const logoSize = logoSizes[size];

  return (
    <div className="absolute inset-0 z-[5] pointer-events-none overflow-hidden">
      {/* Logo watermark bên trái nhân vật */}
      <div className="absolute top-1/2 left-8 transform -translate-y-1/2">
        <img 
          src="/static/logoPTIT.png" 
          alt="PTIT Logo" 
          className={`${logoSize} opacity-15 object-contain rotate-12 drop-shadow-lg`}
        />
      </div>
      
      {/* Logo watermark bên phải nhân vật */}
      <div className="absolute top-1/2 right-8 transform -translate-y-1/2">
        <img 
          src="/static/logoPTIT.png" 
          alt="PTIT Logo" 
          className={`${logoSize} opacity-15 object-contain -rotate-12 drop-shadow-lg`}
        />
      </div>

      {/* Logo watermark nhỏ hơn ở góc trên trái */}
      <div className="absolute top-6 left-6">
        <img 
          src="/static/logoPTIT.png" 
          alt="PTIT Logo" 
          className="w-12 h-12 opacity-10 object-contain rotate-45"
        />
      </div>

      {/* Logo watermark nhỏ hơn ở góc trên phải */}
      <div className="absolute top-6 right-6">
        <img 
          src="/static/logoPTIT.png" 
          alt="PTIT Logo" 
          className="w-12 h-12 opacity-10 object-contain -rotate-45"
        />
      </div>

      {/* Logo watermark nhỏ hơn ở góc dưới trái */}
      <div className="absolute bottom-6 left-6">
        <img 
          src="/static/logoPTIT.png" 
          alt="PTIT Logo" 
          className="w-12 h-12 opacity-10 object-contain -rotate-30"
        />
      </div>

      {/* Logo watermark nhỏ hơn ở góc dưới phải */}
      <div className="absolute bottom-6 right-6">
        <img 
          src="/static/logoPTIT.png" 
          alt="PTIT Logo" 
          className="w-12 h-12 opacity-10 object-contain rotate-30"
        />
      </div>

      {/* Logo trung tâm mờ làm background */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <img 
          src="/static/logoPTIT.png" 
          alt="PTIT Logo" 
          className="w-48 h-48 opacity-5 object-contain"
        />
      </div>
    </div>
  );
});

SimpleWatermark.displayName = 'SimpleWatermark';

export default SimpleWatermark;
