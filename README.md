# Arsonist-MCP AI

**Autonomous Cybersecurity Command Center**

An AI-powered penetration testing command center featuring autonomous vulnerability hunting, Burp Suite mastery training, and intelligent agent orchestration via Model Context Protocol (MCP).

![Arsonist-MCP AI](https://img.shields.io/badge/Arsonist--MCP-AI-red?style=for-the-badge&logo=ai&logoColor=white)
![React](https://img.shields.io/badge/React-18.2.0-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue?style=flat-square&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.4.19-646CFF?style=flat-square&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.0-38B2AC?style=flat-square&logo=tailwind-css)

## 🚀 Features

- **Autonomous Agents**: AI-powered penetration testing agents that hunt vulnerabilities independently
- **Burp Suite Integration**: Seamless integration with Burp Suite for advanced web application testing
- **Real-time Monitoring**: Live traffic monitoring and vulnerability detection
- **Training Modules**: Interactive Burp Suite mastery training with AI guidance
- **Comprehensive Reports**: Detailed vulnerability reports with severity analysis
- **Interactive Terminal**: Built-in terminal for direct command execution
- **Model Context Protocol**: MCP integration for enhanced AI capabilities

## 🛠️ Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: Redux Toolkit
- **Routing**: React Router
- **AI Integration**: Google Generative AI
- **Backend Services**: Supabase, Stripe
- **3D Graphics**: React Three Fiber
- **Charts**: Recharts

## 📦 Installation

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone <YOUR_GIT_URL>
   cd arsonist-mcp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 🏗️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## 📁 Project Structure

```
src/
├── components/
│   ├── features/          # Feature-specific components
│   │   ├── AgentCard.tsx
│   │   ├── AgentLogStream.tsx
│   │   ├── InteractiveTerminal.tsx
│   │   └── ...
│   ├── layout/            # Layout components
│   │   ├── AppLayout.tsx
│   │   ├── Sidebar.tsx
│   │   └── TopBar.tsx
│   └── ui/                # Reusable UI components (shadcn/ui)
├── pages/                 # Main application pages
│   ├── Dashboard.tsx
│   ├── Agents.tsx
│   ├── Training.tsx
│   ├── Reports.tsx
│   └── Settings.tsx
├── stores/                # Redux store configuration
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions
├── types/                 # TypeScript type definitions
└── constants/             # Application constants
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GOOGLE_AI_API_KEY=your_google_ai_api_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key
```

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push

### Netlify

1. Build command: `npm run build`
2. Publish directory: `dist`
3. Configure environment variables in Netlify dashboard

### Manual Deployment

```bash
npm run build
# Deploy the 'dist' folder to your hosting provider
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is private and proprietary.

## 🆘 Support

For support or questions, please contact the development team.

## 🔒 Security

This application is designed for ethical cybersecurity testing only. Use responsibly and only on systems you have explicit permission to test.

---

**Built with ❤️ for the cybersecurity community**
