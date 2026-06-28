# PropNexAi Frontend

This is the frontend application for the PropNexAi Campaign Manager, delivering a modern, glassmorphic UI for managing email campaigns and contacts.

## 🚀 Technologies Used
- **React 19 & Vite**: Ultra-fast frontend development
- **TypeScript**: Static typing
- **Tailwind CSS v4**: Next-generation utility-first CSS framework featuring a custom premium glassmorphism theme
- **Zustand**: Lightweight global state management
- **React Router v7**: Application routing
- **Socket.io-client**: Real-time websocket consumer for live progress bars
- **Lucide React**: Beautiful, consistent iconography

## 📦 Getting Started

### Prerequisites
- Node.js (v18 or higher)

### Installation
1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure your `.env` file (if any API URLs need to be overridden):
   ```env
   VITE_API_URL=http://localhost:3000/api
   VITE_WS_URL=http://localhost:3000
   ```

### Running the App
**Development Mode**:
```bash
npm run dev
```

**Production Build**:
```bash
npm run build
npm run preview
```

## 🎨 Design System
The application uses a custom-built premium aesthetic configured via Tailwind v4:
- **Typography**: Google Fonts `Outfit`
- **Theme**: Light-themed glassmorphism (`glass`, `glass-card`)
- **Accents**: Soft indigo and purple gradients
