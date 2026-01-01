# WhatsApp Business Platform UI

A clean, static HTML/CSS UI template for a WhatsApp Business Platform dashboard and team inbox.

## 📁 Project Structure

```
dadhe/
├── index.html          # Dashboard page (main landing)
├── inbox.html          # Team Inbox page
├── README.md
└── css/
    ├── variables.css   # CSS custom properties / design tokens
    ├── base.css        # Reset and base styles
    ├── layout.css      # App container, sidebar, page structure
    ├── components.css  # Buttons, badges, toggles, cards, tables
    ├── dashboard.css   # Dashboard-specific styles
    ├── inbox.css       # Team inbox-specific styles
    └── responsive.css  # Media queries for responsive design
```

## 🚀 Getting Started

Simply open `index.html` in your browser to view the Dashboard, or `inbox.html` to view the Team Inbox.

No build tools, no JavaScript dependencies - just plain HTML and CSS.

## 📄 Pages

### Dashboard (`index.html`)
- Health Score metrics
- Safety Gate Status Panel
- Message Activity Timeline (placeholder)
- Campaign Safety Monitor table

### Team Inbox (`inbox.html`)
- Channel list sidebar
- Contact list with conversation previews
- Chat window with message bubbles
- Contact details panel

## 🔗 Navigation

Use the sidebar navigation to switch between pages:
- Click **Team Inbox** to go to `inbox.html`
- Click **Dashboard** to go to `index.html`

On mobile, use the bottom navigation bar.

## 🎨 Customization

### Colors & Theming
Edit `css/variables.css` to customize:
- Primary colors
- Status colors
- Background colors
- Text colors
- Spacing
- Border radius
- Typography

### Adding New Pages
1. Create a new HTML file
2. Include the CSS files in the same order as existing pages
3. Copy the sidebar navigation structure
4. Add your page content

## 📱 Responsive Design

The UI is fully responsive:
- **Desktop (1200px+)**: Full sidebar with text labels
- **Tablet (992px-1199px)**: Collapsed sidebar with icons only
- **Mobile (768px and below)**: Bottom navigation bar, single-column layout

## 🛠️ Technologies

- HTML5
- CSS3 (Custom Properties, Grid, Flexbox)
- Google Fonts (Inter)

No JavaScript required for the static UI display.
