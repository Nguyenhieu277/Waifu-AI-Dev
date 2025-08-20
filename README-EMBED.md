# Waifu AI Widget - Integration Guide

Hướng dẫn tích hợp nhân vật AI Tú Như vào website của bạn.

## 🚀 Quick Start

### Method 1: Auto-Init (Khuyên dùng)

```html
<!-- Thêm vào <head> hoặc trước </body> -->
<script src="https://your-domain.com/embed.js"></script>
<div data-waifu-ai 
     data-theme="default"
     data-size="medium" 
     data-position="bottom-right"
     data-show-background="true"
     data-base-url="https://your-domain.com">
</div>
```

### Method 2: Manual Integration

```html
<script src="https://your-domain.com/embed.js"></script>
<script>
  // Create widget
  const widget = WaifuAI.create({
    theme: 'default',      // 'default', 'dark', 'minimal'
    size: 'medium',        // 'small', 'medium', 'large'
    position: 'bottom-right', // 'bottom-right', 'bottom-left', 'center'
    showBackground: true,   // true/false
    baseUrl: 'https://your-domain.com'
  });

  // Control widget
  widget.toggle();  // Show/hide
  widget.destroy(); // Remove completely
</script>
```

### Method 3: Direct Iframe

```html
<iframe src="https://your-domain.com/widget?theme=default&size=medium&position=center&showBackground=true"
        width="384" 
        height="500"
        frameborder="0"
        allow="microphone"
        style="border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
</iframe>
```

## ⚙️ Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `theme` | string | 'default' | Theme: 'default', 'dark', 'minimal' |
| `size` | string | 'medium' | Size: 'small', 'medium', 'large' |
| `position` | string | 'bottom-right' | Position: 'bottom-right', 'bottom-left', 'center' |
| `showBackground` | boolean | true | Show/hide background image |
| `baseUrl` | string | current domain | Your widget server URL |

## 📐 Dimensions

| Size | Width | Height |
|------|-------|--------|
| Small | 320px | 400px |
| Medium | 384px | 500px |
| Large | 500px | 600px |

## 🎨 Themes

- **Default**: Light theme với gradient xanh-hồng
- **Dark**: Dark mode với background tối
- **Minimal**: Clean white background

## 📱 Responsive Design

Widget tự động responsive và hoạt động tốt trên:
- Desktop browsers
- Mobile devices
- Tablets

## 🔧 Advanced Usage

### Embed trong specific element

```html
<div id="my-widget"></div>
<script>
  WaifuAI.embed('my-widget', {
    theme: 'dark',
    size: 'large'
  });
</script>
```

### Listen for widget events

```javascript
const widget = WaifuAI.create({...});

// Listen for messages from widget
window.addEventListener('message', (event) => {
  if (event.data.type === 'waifu-ready') {
    console.log('Widget is ready!');
  }
});
```

## 🔒 Security

- CORS được cấu hình để cho phép embedding
- Microphone access chỉ khi user cho phép
- Secure communication giữa iframe và parent

## 🌐 Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 📝 Examples

### E-commerce Website

```html
<!-- Thêm AI assistant vào trang bán hàng -->
<script src="https://your-domain.com/embed.js"></script>
<div data-waifu-ai 
     data-theme="minimal"
     data-size="medium"
     data-position="bottom-right">
</div>
```

### Blog/Content Site

```html
<!-- Embed vào sidebar -->
<div id="sidebar-widget"></div>
<script src="https://your-domain.com/embed.js"></script>
<script>
  WaifuAI.embed('sidebar-widget', {
    theme: 'default',
    size: 'small',
    showBackground: false
  });
</script>
```

### Landing Page

```html
<!-- Center widget trên landing page -->
<div class="hero-section">
  <iframe src="https://your-domain.com/widget?theme=dark&size=large&position=center"
          width="500" height="600" frameborder="0" allow="microphone">
  </iframe>
</div>
```

## 🚨 Troubleshooting

### Widget không hiển thị
- Kiểm tra console errors
- Đảm bảo script được load đúng
- Verify CORS settings

### Microphone không hoạt động
- Website cần HTTPS để access microphone
- User phải grant permission
- Check browser compatibility

### Performance issues
- Sử dụng size='small' cho mobile
- Consider lazy loading
- Optimize cho slow connections

## 📞 Support

- Demo: https://your-domain.com/demo
- Issues: GitHub Issues
- Docs: README.md

## 📄 License

MIT License - Free for personal and commercial use.
