"use client";
import { useEffect, useState, memo, Suspense } from 'react';
import dynamic from 'next/dynamic';
import ChatInput from "~/components/ChatInput";
import SimpleWatermark from "~/components/SimpleWatermark";
import { useSearchParams } from 'next/navigation';

const Box = dynamic(() => import("~/components/ChatterBox"), {ssr: false});
const Model = dynamic(() => import("~/components/Model"), {ssr: false});

const Dots = () => (
  <div className="flex space-x-2 animate-pulse">
    {[...Array(3)].map((_, i) => <div key={i} className="w-3 h-3 bg-gray-500 rounded-full"/>)}
  </div>
);

interface WidgetConfig {
  theme?: 'default' | 'dark' | 'minimal';
  size?: 'small' | 'medium' | 'large';
  position?: 'bottom-right' | 'bottom-left' | 'center';
  showBackground?: boolean;
}

function WidgetContent() {
  const [ready, setReady] = useState(false);
  const searchParams = useSearchParams();
  
  // Parse widget configuration from URL params
  const config: WidgetConfig = {
    theme: (searchParams.get('theme') as WidgetConfig['theme']) || 'default',
    size: (searchParams.get('size') as WidgetConfig['size']) || 'medium',
    position: (searchParams.get('position') as WidgetConfig['position']) || 'center',
    showBackground: searchParams.get('showBackground') !== 'false'
  };
  
  useEffect(() => {
    const s = document.createElement('script');
    s.src = '/live2dcubismcore.min.js';
    s.defer = true;
    s.onload = () => setReady(true);
    document.body.appendChild(s);
    
    return () => {
      document.body.removeChild(s);
    };
  }, []);

  // Size classes
  const sizeClasses = {
    small: 'w-80 h-96',
    medium: 'w-96 h-[500px]',
    large: 'w-[500px] h-[600px]'
  };

  // Position classes
  const positionClasses = {
    'bottom-right': 'fixed bottom-4 right-4',
    'bottom-left': 'fixed bottom-4 left-4',
    'center': 'relative w-full h-full'
  };

  // Theme classes
  const themeClasses = {
    default: 'bg-gradient-to-br from-blue-50 to-pink-50',
    dark: 'bg-gradient-to-br from-gray-900 to-gray-800 text-white',
    minimal: 'bg-white'
  };

  const containerClass = `
    ${sizeClasses[config.size!]} 
    ${positionClasses[config.position!]} 
    ${config.showBackground ? themeClasses[config.theme!] : 'bg-transparent'}
    rounded-lg shadow-lg overflow-hidden border border-gray-200
  `;

  return (
    <div className={containerClass}>
      {config.showBackground && (
        <>
          <div 
            className="absolute inset-0 z-0 overflow-hidden bg-cover bg-center opacity-30" 
            style={{backgroundImage:'url(/one.avif)'}}
          />
          <SimpleWatermark size={config.size === 'small' ? 'small' : config.size === 'large' ? 'large' : 'medium'}/>
        </>
      )}
      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
        <ChatInput/>
        <div className="flex-1 flex justify-center items-center w-full">
          {!ready ? <Dots/> : (<><Box/><Model/></>)}
        </div>
      </div>
    </div>
  );
}

export default function WidgetPage() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4">
      <Suspense fallback={<Dots />}>
        <WidgetContent />
      </Suspense>
    </main>
  );
}
