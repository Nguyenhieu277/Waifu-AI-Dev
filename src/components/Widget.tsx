"use client";
import { useEffect, useState, memo } from 'react';
import dynamic from 'next/dynamic';
import ChatInput from "./ChatInput";
import SimpleWatermark from "./SimpleWatermark";
import ClothingActionBar from "./ClothingActionBar";

const Box = dynamic(() => import("./ChatterBox"), {ssr: false});
const Model = dynamic(() => import("./Model"), {ssr: false});

const Dots = () => (
  <div className="flex space-x-2 animate-pulse">
    {[...Array(3)].map((_, i) => <div key={i} className="w-3 h-3 bg-gray-500 rounded-full"/>)}
  </div>
);

interface WidgetProps {
  theme?: 'default' | 'dark' | 'minimal';
  size?: 'small' | 'medium' | 'large';
  showBackground?: boolean;
  showClothingBar?: boolean;
  className?: string;
}

const Widget: React.FC<WidgetProps> = memo(({ 
  theme = 'default',
  size = 'medium',
  showBackground = true,
  showClothingBar = true,
  className = ''
}) => {
  const [ready, setReady] = useState(false);
  
  useEffect(() => {
    const s = document.createElement('script');
    s.src = '/live2dcubismcore.min.js';
    s.defer = true;
    s.onload = () => setReady(true);
    document.body.appendChild(s);
    
    return () => {
      if (document.body.contains(s)) {
        document.body.removeChild(s);
      }
    };
  }, []);

  const handleClothingToggle = (clothingType: 'glasses' | 'jacket', isEnabled: boolean) => {
    console.log(`Widget clothing toggle: ${clothingType} = ${isEnabled}`);
  };

  // Size classes
  const sizeClasses = {
    small: 'w-80 h-96',
    medium: 'w-96 h-[500px]',
    large: 'w-[500px] h-[600px]'
  };

  // Theme classes
  const themeClasses = {
    default: 'bg-gradient-to-br from-blue-50 to-pink-50',
    dark: 'bg-gradient-to-br from-gray-900 to-gray-800 text-white',
    minimal: 'bg-white'
  };

  const containerClass = `
    ${sizeClasses[size]} 
    ${showBackground ? themeClasses[theme] : 'bg-transparent'}
    rounded-lg shadow-lg overflow-hidden border border-gray-200 relative
    ${className}
  `.trim();

  return (
    <div className={containerClass}>
      {showBackground && (
        <>
          <div 
            className="absolute inset-0 z-0 overflow-hidden bg-cover bg-center opacity-30" 
            style={{backgroundImage:'url(/one.avif)'}}
          />
          <SimpleWatermark size={size}/>
        </>
      )}
      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
        <ChatInput/>
        <div className="flex-1 flex justify-center items-center w-full">
          {!ready ? <Dots/> : (<><Box/><Model onClothingToggle={handleClothingToggle}/></>)}
        </div>
        {ready && showClothingBar && (
          <ClothingActionBar 
            onToggleClothing={handleClothingToggle}
            className="top-2 right-2 transform scale-75"
          />
        )}
      </div>
    </div>
  );
});

Widget.displayName = 'Widget';

export default Widget;
