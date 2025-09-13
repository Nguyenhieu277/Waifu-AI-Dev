"use client";

import React, { useState, useCallback } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface ClothingActionBarProps {
  onToggleClothing: (clothingType: 'glasses' | 'jacket', isEnabled: boolean) => void;
  className?: string;
}

interface ClothingState {
  glasses: boolean;
  jacket: boolean;
}

interface TransitionState {
  glasses: boolean;
  jacket: boolean;
}

const ClothingActionBar: React.FC<ClothingActionBarProps> = ({ 
  onToggleClothing, 
  className = '' 
}) => {
  const [clothingState, setClothingState] = useState<ClothingState>({
    glasses: false,
    jacket: true // Mặc định có áo khoác - đồng bộ với Model.tsx
  });

  const [isTransitioning, setIsTransitioning] = useState<TransitionState>({
    glasses: false,
    jacket: false
  });

  const handleToggleGlasses = useCallback(() => {
    const newState = !clothingState.glasses;
    setClothingState(prev => ({ ...prev, glasses: newState }));
    
    // Show transition state
    setIsTransitioning(prev => ({ ...prev, glasses: true }));
    
    // Call model control function if available
    if (typeof window !== 'undefined' && (window as any).ptitModelControls) {
      (window as any).ptitModelControls.toggleGlasses(newState);
    }
    
    onToggleClothing('glasses', newState);
    
    // Clear transition state after animation - faster feedback
    setTimeout(() => {
      setIsTransitioning(prev => ({ ...prev, glasses: false }));
    }, 800);
  }, [clothingState.glasses, onToggleClothing]);

  const handleToggleJacket = useCallback(() => {
    const newState = !clothingState.jacket;
    setClothingState(prev => ({ ...prev, jacket: newState }));
    
    // Show transition state
    setIsTransitioning(prev => ({ ...prev, jacket: true }));
    
    // Call model control function if available
    if (typeof window !== 'undefined' && (window as any).ptitModelControls) {
      (window as any).ptitModelControls.toggleJacket(newState);
    }
    
    onToggleClothing('jacket', newState);
    
    // Clear transition state after animation - faster feedback
    setTimeout(() => {
      setIsTransitioning(prev => ({ ...prev, jacket: false }));
    }, 800);
  }, [clothingState.jacket, onToggleClothing]);

  return (
    <div className={`
      fixed top-4 right-4 z-20
      flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2
      bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-gray-200
      transition-all duration-300 hover:shadow-xl
      max-w-[calc(100vw-2rem)] sm:max-w-none
      ${className}
    `}>
      {/* Glasses Toggle */}
      <button
        onClick={handleToggleGlasses}
        className={`
          flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-full font-medium text-xs sm:text-sm
          transition-all duration-300 ease-in-out hover:scale-105 active:scale-95
          transform-gpu
          ${clothingState.glasses 
            ? 'bg-blue-500 text-white shadow-md hover:bg-blue-600 hover:shadow-lg' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
          }
        `}
        title={clothingState.glasses ? "Tháo kính" : "Đeo kính"}
      >
        <div className="relative">
          {clothingState.glasses ? (
            <EyeIcon className="w-5 h-5" />
          ) : (
            <EyeSlashIcon className="w-5 h-5" />
          )}
          {/* Glasses status indicator with transition animation */}
          <div className={`
            absolute -top-1 -right-1 w-2 h-2 rounded-full transition-all duration-300
            ${isTransitioning.glasses 
              ? 'bg-yellow-400 animate-pulse' 
              : clothingState.glasses 
                ? 'bg-green-400' 
                : 'bg-gray-400'
            }
          `}></div>
        </div>
        <span className="hidden sm:inline">
          {clothingState.glasses ? "Có kính" : "Không kính"}
        </span>
      </button>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-300"></div>

      {/* Jacket Toggle */}
      <button
        onClick={handleToggleJacket}
        className={`
          flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-full font-medium text-xs sm:text-sm
          transition-all duration-300 ease-in-out hover:scale-105 active:scale-95
          transform-gpu
          ${clothingState.jacket 
            ? 'bg-purple-500 text-white shadow-md hover:bg-purple-600 hover:shadow-lg' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
          }
        `}
        title={clothingState.jacket ? "Cởi áo khoác" : "Mặc áo khoác"}
      >
        <div className="relative">
          {/* Jacket icon */}
          <svg 
            className="w-5 h-5" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
            {clothingState.jacket && (
              <>
                <path d="M6 21V9a9 9 0 0 1 18 0v12"/>
                <path d="M6 10h4"/>
                <path d="M14 10h4"/>
              </>
            )}
          </svg>
          {/* Status indicator with transition animation */}
          <div className={`
            absolute -top-1 -right-1 w-2 h-2 rounded-full transition-all duration-300
            ${isTransitioning.jacket 
              ? 'bg-yellow-400 animate-pulse' 
              : clothingState.jacket 
                ? 'bg-green-400' 
                : 'bg-red-400'
            }
          `}></div>
        </div>
        <span className="hidden sm:inline">
          {clothingState.jacket ? "Có áo" : "Không áo"}
        </span>
      </button>

      {/* Action indicator - more compact for top-right position */}
      <div className="flex items-center gap-1 text-xs text-gray-500">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        <span className="hidden lg:inline">Trang phục</span>
      </div>
    </div>
  );
};

export default ClothingActionBar;
