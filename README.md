# WhatsApp Business Safety Platform

A fully functional, production-ready web dashboard for WhatsApp Business safety and campaign monitoring. Built with vanilla HTML, CSS, and JavaScript.

![Dashboard Preview](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Tech Stack](https://img.shields.io/badge/Stack-HTML%20%7C%20CSS%20%7C%20JavaScript-blue)
![Chart.js](https://img.shields.io/badge/Charts-Chart.js-orange)

## 📋 Overview

This dashboard provides a comprehensive interface for managing WhatsApp Business communications with built-in safety controls, campaign monitoring, and real-time analytics. 

The application features a **unified sidebar navigation** that allows seamless switching between:

1. **Team Inbox** - A WhatsApp-style chat interface for managing customer conversations
2. **Safety Dashboard** - Real-time monitoring of message metrics, safety gates, and campaign performance

## ✨ Features

### Team Inbox
- 📱 Channel management (All Channels, WhatsApp, WhatsApp Calls)
- 💬 Real-time chat interface with message bubbles
- 📝 Template message system with quick selection
- 🏷️ Contact tags and notes management
- 📊 CX Score tracking
- 🔍 Chat filters (All, Active, Assigned, Unassigned)
- 🤖 Simulated customer replies for testing

### Safety Dashboard
- 📈 Live metric cards (Health Score, Blocked Rate, Failed Rate, Daily Limit)
- 🛡️ Safety Gate Status Panel with toggleable controls
- 📉 Message Activity Timeline (Chart.js visualization)
- 📋 Campaign Safety Monitor with auto-actions
- 🚨 Global Kill Switch for emergency message stopping
- 🔔 Toast notifications for system events

### Bonus Features
- 🌙 Dark mode toggle
- ⌨️ Keyboard shortcuts
- 💾 LocalStorage persistence
- 🎨 Smooth animations and transitions
- 📱 Responsive design

## 🚀 Getting Started

### Option 1: Direct Browser (Simplest)

Simply open the `index.html` file directly in your web browser:

```
Double-click index.html
```

> Note: Some features may be limited due to browser security restrictions with file:// protocol.

### Option 2: Local HTTP Server (Recommended)

#### Using Python:
```bash
# Navigate to project directory
cd path/to/project

# Python 3
python -m http.server 8080

# Python 2
python -m SimpleHTTPServer 8080
```

#### Using Node.js:
```bash
# Install http-server globally
npm install -g http-server

# Run server
http-server -p 8080
```

#### Using VS Code:
1. Install "Live Server" extension
2. Right-click `index.html`
3. Select "Open with Live Server"

Then open your browser and navigate to:
```
http://localhost:8080
```

## 📁 Project Structure

```
├── index.html          # Main HTML file with both pages
├── css/
│   └── styles.css      # Complete styling (~2000 lines)
├── js/
│   ├── utils.js        # Utility functions (formatting, toast, simulation)
│   ├── state.js        # Centralized state management with localStorage
│   ├── chat.js         # Chat functionality module
│   ├── charts.js       # Chart.js integration
│   └── dashboard.js    # Dashboard functionality module
└── README.md           # This file
```

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + 1` | Switch to Team Inbox |
| `Ctrl/Cmd + 2` | Switch to Dashboard |
| `Ctrl/Cmd + K` | Toggle Global Kill Switch |
| `Escape` | Close any open modal |

## 🎯 How It Works

### State Management
All application data is managed through a centralized state object (`AppState`) that:
- Initializes with mock data on first load
- Persists to localStorage automatically
- Provides methods for state updates

### Message Simulation
The system simulates realistic message delivery with:
- Random delivery outcomes (Delivered, Failed, Blocked)
- Outcome probabilities affected by safety settings
- Automatic customer replies for testing

### Safety Gates
Toggle any safety gate to see immediate effects:
- **Opt-in Validation** - Validates user consent
- **24h Session Rule** - Enforces WhatsApp's 24-hour window
- **Rate Limiter** - Controls message sending speed
- **Warm-up Mode** - Gradually increases sending volume
- **Template Enforcement** - Requires approved templates
- **Global Kill Switch** - Stops all messaging immediately

## 🛠️ Technologies Used

- **HTML5** - Semantic markup
- **CSS3** - Flexbox, Grid, CSS Variables, Animations
- **Vanilla JavaScript (ES6+)** - No frameworks
- **Chart.js** - Data visualization
- **LocalStorage** - Data persistence

## 📝 Customization

### Adding Templates
Edit the `state.js` file and add to the `templates` array:

```javascript
{
    id: 'tmpl_new',
    name: 'Your Template Name',
    category: 'Marketing',
    content: 'Hello {{name}}, your message here...',
    buttons: ['Button 1', 'Button 2'],
    signature: 'Your Signature'
}
```

### Modifying Colors
Edit CSS variables in `styles.css`:

```css
:root {
    --primary-green: #25D366;
    --primary-blue: #007BFF;
    --success-green: #22C55E;
    --warning-amber: #F59E0B;
    --danger-red: #EF4444;
}
```

### Resetting Data
Open browser console and run:
```javascript
AppState.reset();
location.reload();
```

## 📄 License

This project is open source and available for personal and commercial use.

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

---

Built with ❤️ for WhatsApp Business safety and campaign management.

