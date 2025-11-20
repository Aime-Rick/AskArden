# Ask Arden Chatbot

## Overview

Ask Arden is an AI-powered chatbot application that provides intelligent responses to user questions. The application features a modern conversational interface built with React and Express, leveraging OpenAI's agent framework to deliver context-aware responses. The system uses a multi-agent workflow to classify questions and route them to appropriate knowledge sources, providing concise, helpful answers to users.

**Last Updated**: November 18, 2025
- Integrated new agent version with enhanced classification logic and upgraded models
- Added Markdown rendering support for bot responses

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack**: React with TypeScript, built using Vite as the build tool and development server.

**UI Framework**: Implements shadcn/ui component library with Radix UI primitives, providing accessible and customizable components. The design system uses Tailwind CSS with a custom configuration following the "new-york" style variant.

**State Management**: Uses TanStack Query (React Query) for server state management, handling API requests and caching. Session management is handled client-side using localStorage to persist user sessions across page refreshes.

**Routing**: Implements wouter as a lightweight routing solution, with the main chat interface at the root path.

**Design System**: Custom color palette extracted from the brand logo, featuring primary blue (#4A9FD8), lime green (#A8D84E), and neutral tones. Typography uses Inter/DM Sans fonts with a consistent spacing scale based on Tailwind units.

**Message Rendering**: Bot responses are rendered using ReactMarkdown with GitHub Flavored Markdown (remarkGfm) support, providing formatted text with:
- Bold, italic, and inline code styling
- Ordered and unordered lists
- Headings (H1-H3)
- Links (open in new tabs)
- Blockquotes and code blocks
User messages remain as plain text with whitespace preservation.

### Backend Architecture

**Runtime**: Node.js with Express.js server framework, using ES modules throughout the codebase.

**API Structure**: RESTful API endpoints for message handling, with POST `/api/messages` accepting user messages and returning both the user message and AI-generated response.

**Agent Framework**: Utilizes OpenAI's Agents SDK (`@openai/agents`) implementing a multi-agent workflow:
- **Classifier Agent (gpt-4.1-nano)**: Determines whether questions should use internal Q&A or fact-finding processes with comprehensive routing logic that prioritizes Spice World-related questions
- **Internal Q&A Agent (gpt-4.1-nano)**: Handles Spice World questions using file search tools with access to vector store vs_691b2685741881918f7ac84544d45cca
- **External Fact-Finding Agent (gpt-5 with reasoning)**: Handles general knowledge questions using web search and code interpreter tools with low-effort reasoning enabled
- **Default Agent (gpt-4.1-nano)**: Asks for clarification when questions are ambiguous

**Classification Logic**: The classifier uses detailed instructions to route questions:
- **Internal**: Questions explicitly or implicitly about Spice World (direct mention, "the company", or context-implied references)
- **External**: Questions about other companies, general world knowledge, or technical topics unrelated to Spice World
- **Default Behavior**: When ambiguous, assumes internal to prioritize company knowledge

**Storage Strategy**: Currently implements in-memory storage (`MemStorage` class) for both users and messages. The schema is defined using Drizzle ORM, indicating preparation for PostgreSQL database integration. Data models include:
- Users: id, username, password
- Messages: id, content, isUser flag, timestamp, sessionId

**Rationale**: In-memory storage allows for rapid development and testing without database setup overhead, while the Drizzle schema provides a clear migration path to persistent PostgreSQL storage.

### Data Storage Solutions

**ORM**: Drizzle ORM configured for PostgreSQL dialect with schema definitions in TypeScript. Migration files are configured to output to a `./migrations` directory.

**Database Readiness**: The application is architected to use PostgreSQL (via Neon serverless driver) but currently operates with in-memory storage as a fallback. The `DATABASE_URL` environment variable is checked but not required during development.

**Session Management**: Sessions are identified by client-generated UUIDs stored in localStorage, allowing message history to persist per user session.

## External Dependencies

### AI and ML Services

**OpenAI Platform**: Core dependency for AI capabilities through the `@openai/agents` package (v0.3.2), providing:
- Multi-agent orchestration
- File search tool (vector store: `vs_691b2685741881918f7ac84544d45cca`)
- Web search tool with configurable context size
- Code interpreter tool

### Database Services

**Neon Serverless PostgreSQL**: Configured via `@neondatabase/serverless` package (v0.10.4) for scalable PostgreSQL database access, though not currently active in the implementation.

### UI Component Libraries

**Radix UI**: Extensive use of Radix UI primitives for accessible, unstyled components including:
- Dialog, Popover, Toast for overlays
- Dropdown Menu, Select, Navigation Menu for interactions
- Form controls: Checkbox, Radio Group, Switch, Slider
- Data display: Avatar, Progress, Separator, Tabs

**Supporting Libraries**:
- `class-variance-authority`: For component variant management
- `cmdk`: Command palette functionality
- `lucide-react`: Icon system
- `date-fns`: Date formatting and manipulation
- `react-markdown`: Markdown rendering for bot responses
- `remark-gfm`: GitHub Flavored Markdown support for tables, task lists, and strikethrough

### Development Tools

**Vite**: Build tool and development server with HMR support, configured with Replit-specific plugins for error overlay, cartographer, and dev banner.

**TypeScript**: Strict type checking with path aliases configured for `@/` (client), `@shared/` (shared code), and `@assets/` (static assets).

**Drizzle Kit**: Database migration tool configured for PostgreSQL schema management.

### Styling and Design

**Tailwind CSS**: Utility-first CSS framework with custom configuration including:
- Custom border radius values
- Extended color system using HSL with CSS variables
- Custom shadows and elevation utilities
- Responsive design with mobile-first approach

**PostCSS**: CSS processing with Tailwind and Autoprefixer plugins.