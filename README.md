# Synk Workflows - Modular AI Workflow Platform

A professional web application platform that supports multiple AI-powered workflows with a unified design system. Currently implements a **Legal Transcript Analyzer** with architecture designed to easily add more workflows.

## Features

### Platform Features
- 🎨 Professional SaaS-style interface with unified design system
- 🔐 Secure API key management (stored locally)
- 💰 Real-time cost tracking across sessions
- 🔄 Multi-LLM support (Claude, GPT-4, Gemini)
- 📊 Modular workflow system for easy extensibility
- 📱 Responsive design for mobile and desktop

### Legal Transcript Analyzer Workflow
- 📄 Drag-and-drop file upload for court transcripts
- 🧠 AI-powered analysis with paralegal-level expertise
- 💡 Three output sections:
  - **Key Takeaways**: 5-7 critical bullet points
  - **Summary**: 2-3 paragraph narrative
  - **Action Items**: Numbered list with deadlines and parties
- ⚡ Cost-efficient hierarchical processing
- 📥 Export results as JSON or Text
- 🎯 Intelligent chunking to minimize LLM costs

## Tech Stack

### Frontend
- **React 18** with Vite for fast development
- **Tailwind CSS** for styling
- **Zustand** for state management
- **React Router** for navigation
- **Lucide React** for icons

### Backend
- **Node.js** with Express
- **Multi-LLM SDKs**:
  - Anthropic Claude SDK
  - OpenAI SDK
  - Google Generative AI SDK

## Project Structure

```
synk-workflows/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/      # Navigation, Settings, Workflow Selector
│   │   │   ├── shared/      # Reusable components (FileUpload, etc.)
│   │   │   └── workflows/   # Workflow-specific components
│   │   │       └── legal-transcript/
│   │   ├── services/        # API client, store, utilities
│   │   └── styles/          # Global styles
│   ├── index.html
│   └── package.json
├── backend/                  # Node.js backend API
│   ├── src/
│   │   ├── routes/          # API routes
│   │   ├── services/        # LLM service, workflow services
│   │   └── utils/           # Text processing utilities
│   └── package.json
├── sample-data/              # Sample legal transcripts for testing
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- API keys from at least one provider:
  - [Anthropic Claude](https://console.anthropic.com/)
  - [OpenAI](https://platform.openai.com/api-keys)
  - [Google AI](https://ai.google.dev/)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd synk-workflows
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install

   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # In the backend directory
   cd backend
   cp .env.example .env
   ```

   Optionally, you can add your API keys to the `.env` file:
   ```env
   PORT=5000
   NODE_ENV=development

   # Optional: Add API keys here (or configure via UI)
   ANTHROPIC_API_KEY=your_key_here
   OPENAI_API_KEY=your_key_here
   GOOGLE_API_KEY=your_key_here
   ```

4. **Start the application**

   **Option 1: Run both servers concurrently (from root directory)**
   ```bash
   npm run dev
   ```

   **Option 2: Run servers separately**

   Terminal 1 (Backend):
   ```bash
   cd backend
   npm run dev
   ```

   Terminal 2 (Frontend):
   ```bash
   cd frontend
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Usage Guide

### First Time Setup

1. **Configure API Keys**
   - Navigate to **Settings** in the top navigation
   - Add API keys for your preferred AI provider(s)
   - Click **Validate** to test each key
   - Click **Save Settings**

2. **Select a Workflow**
   - Return to the home page
   - Click on **Legal Transcript Analyzer** to launch the workflow

### Using Legal Transcript Analyzer

1. **Upload a Transcript**
   - Drag and drop a `.txt` file, or click "Browse Files"
   - Maximum file size: 10MB

2. **Select AI Model**
   - Choose your preferred provider (Claude, GPT-4, or Gemini)
   - Select a model tier:
     - **Premium**: Best quality, higher cost (recommended for final analysis)
     - **Fast**: Cost-efficient, faster processing (good for drafts)

3. **Analyze**
   - Click **Analyze Transcript**
   - Wait for processing (typically 30-60 seconds for standard transcripts)
   - View real-time cost tracking

4. **Review Results**
   - **Key Takeaways**: Critical legal developments
   - **Summary**: Comprehensive narrative of proceedings
   - **Action Items**: Deadlines and required actions

5. **Export Results**
   - **Export as JSON**: Structured data for integration
   - **Export as Text**: Human-readable document

## Cost Optimization

The platform uses intelligent processing strategies to minimize costs:

### Hierarchical Processing
- **Small transcripts** (<4000 tokens): Direct processing
- **Large transcripts** (>4000 tokens):
  1. Uses fast/cheap models (Haiku, Mini, Flash) for initial chunking
  2. Extracts key segments (motions, rulings, testimony)
  3. Generates mini-summaries per segment
  4. Uses premium model only for final synthesis

### Example Costs
- Small transcript (2,000 tokens): ~$0.01 - $0.05
- Medium transcript (8,000 tokens): ~$0.05 - $0.15
- Large transcript (20,000 tokens): ~$0.10 - $0.30

*Actual costs depend on provider and model selection*

## Adding New Workflows

The platform is designed for easy extensibility:

1. **Create workflow component**
   ```jsx
   // frontend/src/components/workflows/your-workflow/YourWorkflow.jsx
   import React from 'react';
   // Use shared components: FileUpload, LLMSelector, etc.
   ```

2. **Add backend service**
   ```javascript
   // backend/src/services/yourWorkflowService.js
   import llmService from './llmService.js';
   // Implement your workflow logic
   ```

3. **Create API route**
   ```javascript
   // backend/src/routes/yourWorkflow.js
   import express from 'express';
   const router = express.Router();
   // Add your endpoints
   ```

4. **Register in router**
   ```jsx
   // frontend/src/App.jsx
   <Route path="/workflow/your-workflow" element={<YourWorkflow />} />
   ```

5. **Add to workflow selector**
   ```jsx
   // frontend/src/components/layout/WorkflowSelector.jsx
   // Add your workflow to the workflows array
   ```

## API Documentation

### Endpoints

#### `POST /api/workflow/legal-transcript`
Process a legal transcript

**Request Body:**
```json
{
  "text": "transcript content",
  "provider": "anthropic",
  "model": "claude-3-5-sonnet-20241022",
  "apiKey": "your-api-key",
  "strategy": "balanced"
}
```

**Response:**
```json
{
  "success": true,
  "results": {
    "keyTakeaways": "...",
    "summary": "...",
    "actionItems": "...",
    "totalCost": 0.0234,
    "metadata": {...}
  }
}
```

#### `GET /api/workflow/models/:provider`
Get available models for a provider

#### `POST /api/settings/validate-key`
Validate an API key

#### `GET /api/settings/providers`
Get list of supported providers

## Development

### Frontend Development
```bash
cd frontend
npm run dev        # Start dev server
npm run build      # Build for production
npm run preview    # Preview production build
```

### Backend Development
```bash
cd backend
npm run dev        # Start with nodemon (auto-reload)
npm start          # Start production server
```

## Security Notes

- API keys are stored in browser's local storage
- Keys are never sent to our servers
- All API calls are made directly from backend to AI providers
- No data persistence on server side
- Recommended: Use environment variables for server-side keys

## Troubleshooting

### Issue: "API key not configured"
**Solution**: Go to Settings and add your API key for the selected provider

### Issue: CORS errors
**Solution**: Ensure backend is running on port 5000 and frontend on port 3000

### Issue: "Cannot connect to backend"
**Solution**: Check that backend server is running (`cd backend && npm run dev`)

### Issue: Large transcript takes too long
**Solution**: Use a faster model (Haiku, Mini, or Flash) for initial processing

## Future Workflows

The platform is designed to support additional workflows:
- ✅ Legal Transcript Analyzer (implemented)
- 📋 Contract Review Workflow (planned)
- 🔍 Legal Research Workflow (planned)
- 📝 Document Drafting Workflow (planned)

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues, questions, or feature requests, please open an issue on GitHub.

---

**Built with ❤️ for legal professionals and AI enthusiasts**
