import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get('domain');
  
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };

  // Default widget configuration
  const defaultConfig = {
    theme: 'default',
    size: 'medium',
    position: 'bottom-right',
    showBackground: true,
    character: {
      name: 'Lara',
      personality: 'Dịu dàng và như một người mẹ, luôn háo hức trò chuyện và hỗ trợ',
    },
    features: {
      textToSpeech: true,
      speechToText: true,
      animations: true,
    }
  };

  // You could customize config based on domain here
  // For now, return default config
  return NextResponse.json(defaultConfig, { headers });
}

export async function POST(request: Request) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };

  try {
    const body = await request.json();
    const { domain, config } = body;

    // Here you could save custom configurations per domain
    // For now, just return the received config
    return NextResponse.json({ 
      success: true, 
      message: 'Configuration updated successfully',
      config 
    }, { headers });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Invalid configuration data' 
    }, { status: 400, headers });
  }
}

export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
