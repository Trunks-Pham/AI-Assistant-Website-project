# AI Chat Assistant

A modern, full-stack chat interface for interacting with your local LM Studio AI model.

## Features

- Clean, modern chat UI with message bubbles
- Real-time message streaming and responses
- Auto-scroll to latest messages
- Fully responsive design (mobile, tablet, desktop)
- Enter key support for quick sending
- Comprehensive error handling
- Local LM Studio integration

## Tech Stack

- **Frontend**: Next.js 14 (App Router)
- **Backend**: Next.js API Routes (Node.js)
- **Styling**: TailwindCSS
- **Language**: JavaScript (ES6+)
- **UI Components**: shadcn/ui with Lucide icons

## Prerequisites

- **Node.js** v22 or higher
- **npm** or **pnpm**
- **LM Studio** running locally with an API token
  - Download: https://lmstudio.ai/
  - Must be running on `http://localhost:xxxx`

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
npm install
# or
pnpm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and replace the token:

```env
LM_STUDIO_URL=http://localhost:xxxx/v1
LM_STUDIO_TOKEN=your_actual_token_here
```

**How to get your LM Studio token:**
1. Open LM Studio application
2. Go to Settings → API Configuration
3. Copy the API token
4. Paste it in `.env.local`

### 3. Start Development Server

```bash
npm run dev
# or
pnpm dev
```

The application will be available at `http://localhost:3000`

### 4. Ensure LM Studio is Running

- Open LM Studio application
- Load your preferred model
- Start the local API server
- Verify it's accessible at `http://localhost:xxxx/v1`

## Project Structure

```
.
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.js          # API endpoint for chat
│   ├── page.js                   # Main chat page
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
├── public/                        # Static assets
├── .env.local                     # Environment variables (create this)
├── .env.local.example             # Environment template
├── package.json                   # Dependencies
├── tailwind.config.ts             # TailwindCSS config
├── postcss.config.mjs             # PostCSS config
├── next.config.mjs                # Next.js config
└── tsconfig.json                  # TypeScript config
```

## API Reference

### POST /api/chat

Send a message to the chat assistant.

**Request:**
```json
{
  "message": "What is the capital of France?"
}
```

**Response (Success):**
```json
{
  "content": "The capital of France is Paris..."
}
```

**Response (Error):**
```json
{
  "error": "Error message describing what went wrong"
}
```

**Error Cases:**
- 400: Empty or missing message
- 503: LM Studio is offline or not responding
- 500: Internal server error

## Usage

1. Type your message in the input box at the bottom
2. Press Enter or click the Send button
3. Wait for the AI response
4. Continue the conversation

## Troubleshooting

### "LM Studio is offline" error
- Ensure LM Studio application is running
- Check that the API server is started
- Verify the URL is `http://localhost:xxxx`

### Messages not sending
- Check that your message is not empty
- Ensure LM Studio token is correctly set in `.env.local`
- Check browser console for detailed error messages

### Slow responses
- This depends on your model size and hardware
- Larger models take longer to generate responses
- Try a smaller/faster model in LM Studio

## Building for Production

```bash
npm run build
npm start
```

## Development Notes

- The app uses the `use client` directive for client-side rendering
- Messages are stored in local React state (not persisted)
- Each conversation starts fresh when the page is refreshed
- The API validates all inputs server-side

## License

MIT

## Support

For issues with LM Studio, visit: https://lmstudio.ai/
For issues with this application, check the console for error messages.
