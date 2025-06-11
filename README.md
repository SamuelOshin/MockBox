# MockBox - API Mock Builder

A modern, feature-rich API mocking platform built with Next.js, TypeScript, and Tailwind CSS.

## Features

- 🚀 **AI-Powered Mock Generation** - Generate realistic mock data using advanced AI
- ⚡ **Lightning Fast** - Create and deploy mocks in seconds
- 🌍 **Global Distribution** - Deploy mocks globally with edge caching
- 🔒 **Enterprise Security** - Bank-grade security with authentication and rate limiting
- 📊 **Real-time Analytics** - Monitor API usage with detailed metrics
- 👥 **Team Collaboration** - Share mocks with workspaces and permissions

## Components

### ScrollbarContainer

A reusable component for custom scrollbars with theme support.

#### Usage

```tsx
import { ScrollbarContainer } from "@/components/ui/scrollbar-container"

<ScrollbarContainer
  height="400px"
  width="100%"
  thumbColor="#888888"
  trackColor="#f1f1f1"
  scrollbarWidth="8px"
  theme="dark"
>
  {content}
</ScrollbarContainer>
```

#### Props

- `children`: React.ReactNode - Content to be scrolled
- `height`: string | number - Container height
- `width`: string | number - Container width
- `maxHeight`: string | number - Maximum height
- `maxWidth`: string | number - Maximum width
- `thumbColor`: string - Scrollbar thumb color
- `trackColor`: string - Scrollbar track color
- `scrollbarWidth`: string - Scrollbar width (responsive)
- `scrollbarHeight`: string - Scrollbar height (responsive)
- `borderRadius`: string - Scrollbar border radius
- `hoverOpacity`: number - Opacity on hover
- `transition`: string - CSS transition
- `direction`: "vertical" | "horizontal" | "both" - Scroll direction
- `theme`: "light" | "dark" | "auto" - Theme mode
- `touchSupport`: boolean - Enable touch scrolling
- `rtlSupport`: boolean - Enable RTL support

#### Features

- ✅ **Theme Support** - Light, dark, and auto themes
- ✅ **Responsive Design** - Adapts to mobile and desktop
- ✅ **Cross-browser Compatibility** - Works in all modern browsers
- ✅ **Touch Support** - Optimized for mobile devices
- ✅ **RTL Support** - Right-to-left language support
- ✅ **Accessibility** - WCAG compliant with focus states
- ✅ **Performance** - Optimized with CSS custom properties
- ✅ **Customizable** - Extensive theming options

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Code Editor**: Monaco Editor

## License

MIT License - see LICENSE file for details.