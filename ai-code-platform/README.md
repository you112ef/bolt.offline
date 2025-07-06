# 🧠 AI Code Platform

[![React](https://img.shields.io/badge/React-18.2-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-purple)](https://vitejs.dev/)
[![Ollama](https://img.shields.io/badge/Ollama-Local%20LLM-green)](https://ollama.ai/)

A powerful web-based platform that uses **local Large Language Models (LLM)** to generate deployable full-stack applications from URLs or project descriptions. Built with React, TypeScript, and Ollama for privacy-focused, offline-capable AI development.

## ✨ Features

### 🚀 Core Functionality
- **Local LLM Integration**: Powered by Ollama (Mistral, LLaMA 3, CodeLLaMA, Phi-3)
- **Real-time Code Streaming**: Watch your code generate in real-time
- **Live Preview**: Instant preview of generated React components
- **Project Management**: Save, load, and manage generated projects locally
- **One-click Deployment**: Deploy to Vercel, Netlify, or export to GitHub

### 🛠️ Advanced Features
- **Mobile Optimizations**: Touch gestures, responsive design, device detection
- **Platform Testing**: Automated test cases for code generation quality
- **Custom Integrations**: VS Code extension, GitHub API, deployment tools
- **Ollama Setup**: Guided installation and model management
- **Dark/Light Mode**: Automatic theme detection with manual toggle
- **Export Options**: Download as ZIP, copy to clipboard, save locally

## 🎯 Demo Examples

### URL Analysis
```
Input: https://notion.so
Output: Collaborative document UI with blocks, editing, and sharing
```

### App Descriptions
```
Input: "CRM system with login and dashboard"
Output: Complete CRM with authentication, dashboard, and data management

Input: "Todo app with categories"
Output: Feature-rich todo application with categorization and persistence

Input: "E-commerce product gallery"
Output: Product showcase with cart, filtering, and checkout flow
```

## 🔧 Installation & Setup

### Prerequisites
- **Node.js** 18+ or **Bun** 1.0+
- **Ollama** (for local LLM inference)

### 1. Clone & Install
```bash
git clone <repository-url>
cd ai-code-platform
/home/scrapybara/.bun/bin/bun install  # or npm install
```

### 2. Install Ollama
```bash
# macOS/Linux
curl -fsSL https://ollama.ai/install.sh | sh

# Windows
# Download from https://ollama.ai/download

# Verify installation
ollama --version
```

### 3. Download LLM Models
```bash
# Recommended models
ollama pull mistral          # 7B params, great for general coding
ollama pull llama3          # 8B params, excellent reasoning
ollama pull codellama       # 7B params, optimized for code
ollama pull phi3            # 3.8B params, lightweight option

# Start Ollama server
ollama serve
```

### 4. Start Development Server
```bash
/home/scrapybara/.bun/bin/bun dev  # or npm run dev
```

Visit `http://localhost:5173` to access the platform.

## 🎮 Usage Guide

### Basic Workflow
1. **Setup**: Configure Ollama endpoint and select your preferred model
2. **Input**: Enter a URL to analyze or describe your app idea
3. **Generate**: Watch as the AI creates your React application in real-time
4. **Preview**: See your app rendered live in the preview tab
5. **Deploy**: Export code or deploy directly to hosting platforms

### Advanced Features

#### Mobile Development
- Touch gesture support for mobile interactions
- Responsive design patterns automatically applied
- Device-specific optimizations and components

#### Testing & Quality
- Automated test cases for common app patterns
- Code quality evaluation and suggestions
- Performance optimization recommendations

#### Integrations
- **VS Code Extension**: Generate code directly in your editor
- **GitHub Integration**: Create repositories and push code automatically
- **Deployment Tools**: One-click deploy to Vercel, Netlify, or other platforms

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom utilities
- **Icons**: Lucide React
- **LLM**: Ollama (Local inference)
- **Storage**: LocalStorage for projects and settings

### Project Structure
```
src/
├── App.tsx              # Main application component
├── main.tsx             # React entry point
├── index.css            # Global styles and utilities
├── components/          # Reusable UI components
├── hooks/               # Custom React hooks
├── services/            # API and business logic
└── utils/               # Helper functions
```

### Local LLM Integration
The platform communicates with Ollama through its REST API:
- **Endpoint**: `http://localhost:11434` (configurable)
- **Streaming**: Real-time token generation
- **Models**: Support for multiple model types
- **Fallback**: Graceful degradation when models are unavailable

## 🚀 Deployment

### Build for Production
```bash
/home/scrapybara/.bun/bin/bun run build  # or npm run build
```

### Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Deploy to Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

### Self-Hosted Deployment
```bash
# Build the application
/home/scrapybara/.bun/bin/bun run build

# Serve the dist folder with any static server
npx serve dist
# or
python -m http.server 3000 -d dist
```

## ⚙️ Configuration

### Environment Variables
Create a `.env.local` file:
```env
VITE_OLLAMA_ENDPOINT=http://localhost:11434
VITE_DEFAULT_MODEL=mistral
VITE_APP_NAME=AI Code Platform
```

### Ollama Configuration
```bash
# Set environment variables for Ollama
export OLLAMA_HOST=0.0.0.0:11434
export OLLAMA_NUM_PARALLEL=2
export OLLAMA_MAX_LOADED_MODELS=2

# Custom model parameters
ollama create mymodel -f Modelfile
```

## 🔍 Troubleshooting

### Common Issues

#### Ollama Connection Failed
```bash
# Check if Ollama is running
ollama list

# Restart Ollama service
ollama serve

# Test connection
curl http://localhost:11434/api/version
```

#### Model Not Found
```bash
# List available models
ollama list

# Pull missing model
ollama pull mistral

# Check model status
ollama show mistral
```

#### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules dist .vite
/home/scrapybara/.bun/bin/bun install
/home/scrapybara/.bun/bin/bun run build
```

## 📊 Performance

### Optimization Features
- **Code Splitting**: Automatic chunk splitting for faster loads
- **Lazy Loading**: Components loaded on demand
- **Local Storage**: Efficient project caching
- **Streaming**: Real-time code generation reduces perceived latency

### Recommended Hardware
- **RAM**: 8GB+ (16GB for larger models)
- **CPU**: Multi-core processor for better model performance
- **Storage**: SSD recommended for faster model loading

## 🤝 Contributing

### Development Setup
```bash
git clone <repository-url>
cd ai-code-platform
/home/scrapybara/.bun/bin/bun install
/home/scrapybara/.bun/bin/bun dev
```

### Adding New Features
1. Create feature branch: `git checkout -b feature/new-feature`
2. Implement changes with TypeScript
3. Add tests if applicable
4. Update documentation
5. Submit pull request

### Code Style
- **TypeScript**: Strict mode enabled
- **Formatting**: Prettier with 2-space indentation
- **Linting**: ESLint with React hooks rules
- **Naming**: camelCase for variables, PascalCase for components

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Ollama Team** for local LLM infrastructure
- **Anthropic** for inspiring conversational AI interfaces
- **Vercel** for excellent deployment platform
- **React Team** for the amazing framework
- **Community** for feedback and contributions

## 🔗 Links

- [Ollama Documentation](https://ollama.ai/docs)
- [React Documentation](https://reactjs.org/docs)
- [Vite Documentation](https://vitejs.dev/guide)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

---

**Built with ❤️ by Scout AI** | [Website](https://scout.new) | [Twitter](https://x.com/scoutdotnew)
