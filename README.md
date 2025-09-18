
# Waifu AI - PTIT Ami Virtual Assistant

<div align="center">
  <img src="public/ptit.png" alt="PTIT Ami" width="200" height="200"/>
  
  **An interactive AI-powered virtual assistant featuring a Live2D character with advanced chat capabilities**
  
  [![Next.js](https://img.shields.io/badge/Next.js-14.2.32-black?style=flat-square&logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
  [![Live2D](https://img.shields.io/badge/Live2D-Cubism-4.0-orange?style=flat-square)](https://www.live2d.com/)
  [![pnpm](https://img.shields.io/badge/pnpm-9.2.0-pink?style=flat-square&logo=pnpm)](https://pnpm.io/)
</div>

## 🌟 Features

### 🤖 AI-Powered Chat
- **Gemini AI Integration**: Advanced conversational AI using Google's Gemini 2.5 Flash model
- **Vietnamese Language Support**: Native Vietnamese conversation with PTIT Ami character
- **Sentiment Analysis**: Dynamic emotional responses based on message content
- **Fallback System**: Robust error handling with multiple AI model fallbacks

### 🎭 Live2D Character - PTIT Ami
- **16 Unique Expressions**: From happy to sad, including special toggles (glasses, jacket)
- **11 Motion Groups**: Idle animations, greetings, hitbox responses, and special interactions
- **Advanced Hitbox System**: 5 distinct interaction areas (hair, face, head, upper body, body)
- **Real-time Lip Sync**: Mouth animation during speech synthesis
- **Drag & Zoom**: Interactive model positioning with persistent storage
- **Mobile Support**: Touch gestures, pinch-to-zoom, and responsive design

### 🎵 Voice Synthesis
- **ElevenLabs Integration**: High-quality text-to-speech conversion
- **Custom Voice Support**: Configurable voice ID for personalized experience
- **Real-time Audio**: Synchronized speech with Live2D animations

### 🎨 Multiple Interfaces
- **Full Demo Page**: Complete interactive experience
- **Embeddable Widget**: Customizable widget for integration
- **Theme Support**: Default, dark, and minimal themes
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18 or higher)
- **pnpm** (v9.2.0 or higher)
- **API Keys** (see Configuration section)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Nguyenhieu277/Waifu-AI-Dev.git
   cd Waifu-AI-Dev
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` with your API keys:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
   VOICE_ID=EXAVITQu4vr4xnSDxMaL
   NODE_ENV=development
   ```

4. **Run the development server**
   ```bash
   pnpm dev
   ```

5. **Open your browser**
   - Demo: [http://localhost:3000](http://localhost:3000)
   - Widget: [http://localhost:3000/widget](http://localhost:3000/widget)

## 🔧 Configuration

### API Keys Setup

#### Gemini AI (Required)
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Add to `.env.local` as `GEMINI_API_KEY`

#### ElevenLabs (Required for Voice)
1. Sign up at [ElevenLabs](https://elevenlabs.io/speech-synthesis)
2. Get your API key from the dashboard
3. Add to `.env.local` as `ELEVENLABS_API_KEY`
4. Optionally change `VOICE_ID` to your preferred voice

### Widget Configuration

The embeddable widget supports URL parameters:

```
/widget?theme=dark&size=large&position=bottom-right&showBackground=false
```

**Parameters:**
- `theme`: `default` | `dark` | `minimal`
- `size`: `small` | `medium` | `large`
- `position`: `bottom-right` | `bottom-left` | `center`
- `showBackground`: `true` | `false`

## 📁 Project Structure

```
Waifu-AI-Dev/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   │   ├── chat/          # Gemini AI chat endpoint
│   │   │   ├── speech-to-text/ # Speech recognition
│   │   │   ├── synthasize/    # Text-to-speech
│   │   │   └── widget/        # Widget configuration
│   │   ├── demo/              # Demo page
│   │   ├── widget/            # Widget page
│   │   └── page.tsx           # Main page
│   ├── components/            # React Components
│   │   ├── Model.tsx          # Live2D Model (main character)
│   │   ├── ChatterBox.tsx     # Chat interface
│   │   ├── ChatInput.tsx      # Input component
│   │   ├── Widget.tsx         # Embeddable widget
│   │   └── SimpleWatermark.tsx # Watermark component
│   ├── atoms/                 # Jotai state management
│   │   └── ChatAtom.ts        # Chat state
│   ├── types/                 # TypeScript types
│   │   └── chat.ts            # Chat message types
│   └── styles/                # Global styles
│       └── globals.css        # Tailwind CSS
├── public/
│   ├── model/PTIT_Ami/        # Live2D Model Assets
│   │   ├── Expressions/       # 16 expression files
│   │   ├── Motions/           # 11 motion groups
│   │   └── PTIT_SDK.*         # Model files
│   ├── live2dcubismcore.min.js # Live2D Core
│   └── *.avif                 # Background images
├── static/                    # Static assets
└── README.md
```

## 🎮 Interactive Features

### Live2D Model Controls

**Mouse/Touch Interactions:**
- **Single Click**: General interaction with random responses
- **Double Click**: Special area-specific interactions
- **Drag**: Move the model around
- **Scroll/Pinch**: Zoom in/out
- **Hover**: Eye tracking follows cursor

**Keyboard Shortcuts:**
- `1, 2, 3`: Greeting motions
- `h`: Heart motion
- `n`: Head nod
- `s`: Head shake
- `p`: Hair stroking
- `f`: Face interaction
- `u`: Upper body interaction
- `b`: Body interaction
- `r`: Reset to default

**Hitbox Areas:**
- **Hair**: Gentle stroking → Blush expressions
- **Face**: Friendly touches → Cute expressions
- **Head**: General patting → Happy responses
- **Upper Body**: Shoulder area → Wave motions
- **Body**: Waist area → Special interactions

### Chat Features

**AI Personality:**
- **Character**: Ami, a friendly PTIT student
- **Language**: Vietnamese with English support
- **Tone**: Warm, empathetic, and supportive
- **Response Length**: 4-6 sentences, concise and engaging

**Sentiment Analysis:**
- **Happy**: Excited expressions and motions
- **Sad**: Comforting responses with gentle animations
- **Love**: Heart expressions and special motions
- **Angry**: Understanding responses with calming animations

## 🛠️ Development

### Available Scripts

```bash
# Development
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server

# Code Quality
pnpm lint         # Run Biome linter
pnpm format       # Format code with Biome
```

### Tech Stack

- **Framework**: Next.js 14.2.32 (App Router)
- **Language**: TypeScript 5.9.2
- **Styling**: Tailwind CSS 3.4.17
- **State Management**: Jotai 2.14.0
- **Live2D**: PIXI.js 6.5.10 + pixi-live2d-display 0.4.0
- **AI**: Google Generative AI 0.24.1
- **Voice**: ElevenLabs 2.15.0
- **Package Manager**: pnpm 9.2.0

## 🎨 Customization

### Adding New Expressions
1. Add expression files to `public/model/PTIT_Ami/Expressions/`
2. Update `EXPRESSIONS` object in `Model.tsx`
3. Add sentiment analysis keywords if needed

### Adding New Motions
1. Add motion files to `public/model/PTIT_Ami/Motions/`
2. Update `MOTIONS` object in `Model.tsx`
3. Configure hitbox responses in `MOTION_GROUPS`

### Customizing AI Personality
Edit the `createSystemMessage` function in `src/app/api/chat/route.ts` to modify:
- Character personality
- Response style
- Language preferences
- Conversation rules

## 📱 Embedding

### Basic Widget Embed
```html
<iframe 
  src="http://localhost:3000/widget?theme=default&size=medium"
  width="400" 
  height="500"
  frameborder="0">
</iframe>
```

### Advanced Integration
```javascript
// Load the widget script
const script = document.createElement('script');
script.src = '/embed.js';
document.head.appendChild(script);

// Initialize widget
window.WaifuWidget.init({
  theme: 'dark',
  size: 'large',
  position: 'bottom-right'
});
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Original Inspiration**: [wAIfu](https://github.com/unteifu/wAIfu) - The original waifu AI project
- **Live2D Technology**: Live2D Cubism SDK for character animation
- **PTIT Ami Model**: Custom Live2D model created for this project
- **Google Gemini**: Advanced AI conversation capabilities
- **ElevenLabs**: High-quality voice synthesis

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/Nguyenhieu277/Waifu-AI-Dev/issues) page
2. Create a new issue with detailed information
3. Join our community discussions

---

## Credits to the [original repo](https://github.com/unteifu/wAIfu) 
