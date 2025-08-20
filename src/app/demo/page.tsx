"use client";
import { useState, useEffect } from 'react';
import Script from 'next/script';

export default function DemoPage() {
  const [config, setConfig] = useState({
    theme: 'default',
    size: 'medium',
    position: 'bottom-right',
    showBackground: true
  });
  
  const [origin, setOrigin] = useState('http://localhost:3000');

  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  const generateEmbedCode = () => {
    return `<!-- Waifu AI Widget -->
<script src="${origin}/embed.js"></script>
<div data-waifu-ai 
     data-theme="${config.theme}"
     data-size="${config.size}" 
     data-position="${config.position}"
     data-show-background="${config.showBackground}"
     data-base-url="${origin}">
</div>`;
  };

  const generateManualCode = () => {
    return `<!-- Manual Integration -->
<script src="${origin}/embed.js"></script>
<script>
  // Create widget
  const widget = WaifuAI.create({
    theme: '${config.theme}',
    size: '${config.size}',
    position: '${config.position}',
    showBackground: ${config.showBackground},
    baseUrl: '${origin}'
  });
</script>`;
  };

  const generateIframeCode = () => {
    const params = new URLSearchParams({
      theme: config.theme,
      size: config.size,
      position: 'center',
      showBackground: config.showBackground.toString()
    });
    
    const sizeStyles: Record<string, string> = {
      small: 'width="320" height="400"',
      medium: 'width="384" height="500"', 
      large: 'width="500" height="600"'
    };

    return `<!-- Direct Iframe Embed -->
<iframe src="${origin}/widget?${params.toString()}"
        ${sizeStyles[config.size] || sizeStyles.medium}
        frameborder="0"
        allow="microphone"
        style="border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
</iframe>`;
  };

  return (
    <>
      <Script src="/embed.js" strategy="beforeInteractive" />
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Waifu AI Widget - Demo & Integration
            </h1>
            <p className="text-lg text-gray-600">
              Tích hợp nhân vật AI Tú Như vào website của bạn một cách dễ dàng
            </p>
          </div>

          {/* Configuration Panel */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Cấu hình Widget</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Theme
                </label>
                <select 
                  value={config.theme}
                  onChange={(e) => setConfig({...config, theme: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="default">Default</option>
                  <option value="dark">Dark</option>
                  <option value="minimal">Minimal</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Size
                </label>
                <select 
                  value={config.size}
                  onChange={(e) => setConfig({...config, size: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Position
                </label>
                <select 
                  value={config.position}
                  onChange={(e) => setConfig({...config, position: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="bottom-right">Bottom Right</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="center">Center</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Show Background
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.showBackground}
                    onChange={(e) => setConfig({...config, showBackground: e.target.checked})}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Enable</span>
                </label>
              </div>
            </div>
          </div>

          {/* Integration Methods */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            
            {/* Auto-init Method */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-3 text-green-600">
                📋 Auto-Init (Recommended)
              </h3>
              <p className="text-gray-600 mb-4">
                Cách dễ nhất - chỉ cần copy/paste
              </p>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                <code>{generateEmbedCode()}</code>
              </pre>
              <button 
                onClick={() => navigator.clipboard.writeText(generateEmbedCode())}
                className="mt-3 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
              >
                Copy Code
              </button>
            </div>

            {/* Manual Method */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-3 text-blue-600">
                ⚙️ Manual Integration
              </h3>
              <p className="text-gray-600 mb-4">
                Cho developer muốn customize
              </p>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                <code>{generateManualCode()}</code>
              </pre>
              <button 
                onClick={() => navigator.clipboard.writeText(generateManualCode())}
                className="mt-3 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                Copy Code
              </button>
            </div>

            {/* Iframe Method */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-3 text-purple-600">
                🖼️ Direct Iframe
              </h3>
              <p className="text-gray-600 mb-4">
                Embed trực tiếp bằng iframe
              </p>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                <code>{generateIframeCode()}</code>
              </pre>
              <button 
                onClick={() => navigator.clipboard.writeText(generateIframeCode())}
                className="mt-3 bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition-colors"
              >
                Copy Code
              </button>
            </div>
          </div>

          {/* Live Demo */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Live Demo</h2>
            <div className="flex flex-col lg:flex-row gap-6">
              
              {/* Center positioned demo */}
              <div className="flex-1">
                <h3 className="text-lg font-medium mb-3">Center Position Demo:</h3>
                <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg min-h-[500px] flex items-center justify-center">
                  <iframe
                    src={`${origin}/widget?theme=${config.theme}&size=${config.size}&position=center&showBackground=${config.showBackground}`}
                    width={config.size === 'small' ? 320 : config.size === 'large' ? 500 : 384}
                    height={config.size === 'small' ? 400 : config.size === 'large' ? 600 : 500}
                    frameBorder="0"
                    allow="microphone"
                    style={{borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)'}}
                  />
                </div>
              </div>

              {/* Instructions */}
              <div className="lg:w-1/3">
                <h3 className="text-lg font-medium mb-3">Hướng dẫn sử dụng:</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Nhấn vào ô input để chat với Tú Như</li>
                  <li>Sử dụng microphone để nói chuyện</li>
                  <li>Nhân vật sẽ theo dõi chuột của bạn</li>
                  <li>Có tính năng text-to-speech tự động</li>
                  <li>Responsive trên mọi thiết bị</li>
                </ul>

                <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-medium text-yellow-800 mb-2">💡 Lưu ý:</h4>
                  <p className="text-sm text-yellow-700">
                    Widget sẽ tự động hiện ở góc màn hình khi position là bottom-right/bottom-left. 
                    Có nút toggle để ẩn/hiện widget.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
            <h2 className="text-2xl font-semibold mb-4">Tính năng</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-start space-x-3">
                <span className="text-2xl">🎭</span>
                <div>
                  <h3 className="font-medium">Live2D Animation</h3>
                  <p className="text-sm text-gray-600">Nhân vật anime sống động với Live2D</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <span className="text-2xl">🧠</span>
                <div>
                  <h3 className="font-medium">AI Chatbot</h3>
                  <p className="text-sm text-gray-600">Trò chuyện thông minh với Gemini AI</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <span className="text-2xl">🔊</span>
                <div>
                  <h3 className="font-medium">Text-to-Speech</h3>
                  <p className="text-sm text-gray-600">Giọng nói tự nhiên từ ElevenLabs</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <span className="text-2xl">🎤</span>
                <div>
                  <h3 className="font-medium">Speech-to-Text</h3>
                  <p className="text-sm text-gray-600">Nói chuyện bằng giọng nói</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <span className="text-2xl">📱</span>
                <div>
                  <h3 className="font-medium">Responsive</h3>
                  <p className="text-sm text-gray-600">Hoạt động tốt trên mọi thiết bị</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <span className="text-2xl">🎨</span>
                <div>
                  <h3 className="font-medium">Customizable</h3>
                  <p className="text-sm text-gray-600">Tùy chỉnh theme và kích thước</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
