# Smart Washing System - Professional Landing Page

A modern, premium landing page for a smart washing machine system built with React, Vite, Tailwind CSS, and Framer Motion.

## 🚀 Features

- **Modern Design**: Clean, premium UI with glassmorphism effects
- **Smooth Animations**: Framer Motion animations on scrolling and interactions
- **Fully Responsive**: Works perfectly on desktop, tablet, and mobile devices
- **Video Background**: Full-screen hero section with video background
- **Infinite Scrolling Cards**: Auto-scrolling feature cards
- **Interactive Components**: Hover effects, button animations, and smooth transitions
- **Fast Performance**: Built with Vite for lightning-fast development and builds

## 🎨 Design System

### Colors
- **Primary**: #4DA8DA (Blue)
- **Aqua**: #7FD1B9 (Accent)
- **Orange**: #F4A261 (CTA Buttons)
- **Dark Text**: #333333
- **Light Text**: #777777

### Features
- Glassmorphism (blur + transparency)
- Rounded corners (rounded-2xl)
- Soft shadows
- Gradient backgrounds
- Smooth spacing

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx           # Fixed navbar with menu
│   │   ├── HeroSection.jsx       # Full-screen video hero
│   │   ├── InfoSection.jsx       # Information section
│   │   ├── SlidingCards.jsx      # Infinite scrolling cards
│   │   ├── FeatureGrid.jsx       # Premium features grid
│   │   ├── CTASection.jsx        # Call-to-action section
│   │   └── Footer.jsx            # Footer with links
│   ├── App.jsx                   # Main app component
│   ├── main.jsx                  # Entry point
│   └── index.css                 # Global styles
├── asset/
│   └── homevdo.mp4              # Hero video background
├── index.html                    # HTML template
├── package.json                  # Dependencies
├── vite.config.js               # Vite configuration
├── tailwind.config.js           # Tailwind configuration
└── postcss.config.js            # PostCSS configuration
```

## 🛠️ Installation

1. **Clone or navigate to the project**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

5. **Preview production build**
   ```bash
   npm run preview
   ```

## 📦 Dependencies

- **React** - UI library
- **React DOM** - React rendering
- **Framer Motion** - Animation library
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Next generation frontend tooling

## 🎬 Sections

### 1. Navbar
- Fixed at top with glassmorphism effect
- Logo with gradient text
- Menu items with hover effects
- "Connect" button
- Mobile-responsive hamburger menu

### 2. Hero Section
- Full-screen video background (homevdo.mp4)
- Large gradient heading
- Subheading with light text
- "Get Started" CTA button
- Smooth fade-in animations

### 3. Info Section
- "Revolutionizing Laundry with Smart Technology" heading
- Descriptive paragraph about IoT and automation
- Subtle illustration space

### 4. Sliding Cards
- Horizontal infinite scrolling cards
- 6 feature cards with icons
- Smooth continuous animation
- Gradient fade effects on edges

### 5. Feature Grid
- 4 premium feature cards
- Icons with hover animations
- Hover lift effect with shadow increase
- Animated accent line on hover

### 6. CTA Section
- Call-to-action with heading and description
- Two button options
- Gradient background

### 7. Footer
- Company information
- Quick links (Product, Company, Legal)
- Social media links
- Copyright notice

## 🎨 Animations

- **Navbar**: Fade-in from top on page load
- **Hero Content**: Staggered fade-in animations
- **Sections**: Fade-in with slide animations on scroll
- **Cards**: Hover lift effect with shadow increase
- **Buttons**: Scale and glow effects on hover
- **Scrolling Cards**: Continuous infinite animation

## 📱 Responsive Breakpoints

- **Mobile**: < 768px - Stack vertically, simplified navigation
- **Tablet**: 768px - 1024px - Two-column layouts
- **Desktop**: > 1024px - Full-featured layouts

## 🚀 Deployment

The project can be deployed to:
- Vercel (recommended for Vite projects)
- Netlify
- GitHub Pages
- Any static hosting service

Build and deploy:
```bash
npm run build
# Upload the 'dist' folder to your hosting service
```

## 📝 Customization

### Colors
Edit `tailwind.config.js` to change the color scheme:
```javascript
colors: {
  primary: '#4DA8DA',
  aqua: '#7FD1B9',
  accent: '#F4A261',
}
```

### Video
Replace `asset/homevdo.mp4` with your own video file.

### Text Content
Edit individual component files to update copy and messaging.

### Animations
Adjust Framer Motion variants in component files for different animation effects.

## 📧 Support

For issues or questions, please refer to the component documentation in each file.

## 📄 License

This project is private and proprietary.

---

**Built with ❤️ using React, Vite, Tailwind CSS, and Framer Motion**
