# GamePlan Analytics Dashboard

A comprehensive analytics and reporting dashboard for GamePlan, built with Nuxt.js and Nuxt UI. This application provides real-time insights into employee activity, task management, performance metrics, and team analytics by connecting to the GamePlan API.

## 🎯 Overview

GamePlan Analytics Dashboard is a modern, full-stack web application designed to help teams and managers track and analyze their workforce productivity. Built with Vue 3, Nuxt.js, and deployed on Cloudflare Pages, it offers:

- **Real-time Analytics**: Live data synchronization with GamePlan API
- **Employee Activity Tracking**: Monitor updates, comments, and engagement
- **Task Management Insights**: Track completion rates, backlogs, and task distribution
- **Performance Metrics**: Individual and team-level performance analytics
- **Risk Indicators**: Early warning system for potential productivity issues
- **Interactive Dashboards**: Visual charts and graphs for data analysis
- **Team Management**: Configure teams, members, and organizational structure
- **Secure API Integration**: Proxy-based authentication for secure API access

### Key Capabilities

- **Employee Monitoring**: Track which employees have updated their status, commented, or have pending tasks
- **Backlog Management**: Identify and manage overdue tasks across the organization
- **Performance Analysis**: View completion rates, activity trends, and productivity metrics
- **Date-based Filtering**: Filter tasks, activities, and reports by specific date ranges
- **Multi-team Support**: Manage and analyze data across multiple teams
- **Responsive Design**: Access analytics from desktop, tablet, or mobile devices

## ✨ Features

### 📊 Dashboard
- **Key Metrics Overview**: Real-time KPI cards showing critical metrics at a glance
  - Employees not updated today
  - Employees not commented today
  - Total backlog tasks
  - Average completion rate
- **Statistics**: Total tasks, comments, and employees with backlog
- **Interactive Charts**: Visual representation of data trends

### 📈 Performance Analytics
- **Performance Metrics**: Individual and team performance tracking
- **Risk Indicators**: Early warning system for potential issues
- **Team Metrics**: Team-level productivity and engagement analytics
- **Trend Analysis**: Historical data visualization over time

### 📋 Reports
- **Backlog Report**: View employees with overdue tasks
- **Completion Rate Report**: Task completion statistics by employee
- **Activity Reports**:
  - Employees not updated today
  - Employees not updated yesterday
  - Employees not commented today
- **Tasks by Date**: Filter and view tasks by specific date ranges

### ⚙️ Settings
- **Team Management**: Configure teams and members
- **API Configuration**: Set up GamePlan API credentials
- **Notifications**: Manage notification preferences
- **Security**: Security and access control settings

### 🎨 User Experience
- **Dark/Light Mode**: Automatic theme switching
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Real-time Updates**: Live data synchronization
- **Error Handling**: Comprehensive error reporting and debugging

## 🛠️ Tech Stack

- **Framework**: [Nuxt.js](https://nuxt.com) v4.2.2
- **UI Library**: [Nuxt UI](https://ui.nuxt.com) v4.2.1
- **State Management**: [Pinia](https://pinia.vuejs.org) v2.1.7
- **Charts**: [Unovis](https://unovis.dev) v1.6.2
- **Icons**: [Iconify](https://iconify.design) (Lucide, Simple Icons)
- **Date Handling**: [date-fns](https://date-fns.org) v4.1.0
- **Validation**: [Zod](https://zod.dev) v4.1.13
- **Language**: TypeScript
- **Package Manager**: pnpm

## 📦 Prerequisites

- Node.js 18+
- pnpm 10.23.0+
- GamePlan API credentials

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
pnpm install
```

### Configuration

1. Create a `.env` file in the root directory:

```env
VITE_GAMEPLAN_API_KEY=your_api_key_here
VITE_GAMEPLAN_API_BASE_URL=https://portal.technoservesolutions.com/api/resource/
```

2. Or use the provided `.env.example` as a template:

```bash
cp .env.example .env
```

Then edit `.env` with your actual GamePlan API credentials.

### Development Server

Start the development server on `http://localhost:3000`:

```bash
pnpm dev
```

### Production Build

Build the application for production:

```bash
pnpm build
```

Preview the production build locally:

```bash
pnpm preview
```

## 📁 Project Structure

```text
Gameplanvue/
├── app/
│   ├── components/          # Vue components
│   │   ├── analytics/       # Analytics and KPI components (6 files)
│   │   ├── common/          # Shared components (ApiKeySetup, EmptyDataState, ErrorDebugPanel)
│   │   ├── customers/       # Customer management components (2 files)
│   │   ├── home/            # Home page components (5 files)
│   │   ├── inbox/           # Inbox components (2 files)
│   │   ├── reports/         # Report components (4 files)
│   │   ├── settings/        # Settings components (1 file)
│   │   ├── TeamsMenu.vue    # Team selection menu
│   │   └── UserMenu.vue     # User profile menu
│   ├── composables/         # Composable functions
│   │   ├── services/        # API and service layer (6 files)
│   │   ├── utils/           # Utility functions (3 files)
│   │   ├── useDashboard.ts  # Dashboard data composable
│   │   └── useEmployeeQueries.ts  # Employee query composables
│   ├── layouts/             # Layout components
│   │   └── default.vue       # Default application layout
│   ├── pages/               # Application pages (routing)
│   │   ├── index.vue        # Home/dashboard page
│   │   ├── performance.vue  # Performance analytics page
│   │   ├── settings.vue     # Settings page
│   │   ├── reports/         # Report pages (6 files)
│   │   └── settings/        # Settings sub-pages (4 files)
│   ├── stores/              # Pinia state management
│   │   ├── api.ts           # API configuration store
│   │   ├── dataCache.ts     # Data caching store
│   │   ├── employee.ts      # Employee data store
│   │   └── query.ts         # Query management store
│   ├── types/               # TypeScript type definitions
│   │   ├── gameplan.ts      # GamePlan API types
│   │   ├── performance.ts   # Performance metrics types
│   │   ├── query.ts         # Query types
│   │   └── index.d.ts       # Global type definitions
│   ├── utils/               # Utility functions
│   │   └── index.ts         # Helper utilities
│   ├── assets/              # Static assets
│   │   └── css/
│   │       └── main.css     # Global styles
│   ├── app.config.ts        # App configuration
│   ├── app.vue              # Root component
│   └── error.vue            # Error page component
├── server/
│   └── api/
│       └── gameplan/
│           └── [...path].ts  # GamePlan API proxy endpoint
├── public/                  # Public static assets
│   └── favicon.ico          # Site favicon
├── dist/                    # Production build output (generated)
│   ├── _headers             # Cloudflare Pages headers
│   ├── _redirects           # Cloudflare Pages redirects
│   ├── _routes.json         # Cloudflare Pages routing
│   ├── _worker.js/          # Serverless worker functions
│   └── _nuxt/               # Nuxt build assets
├── nuxt.config.ts          # Nuxt configuration
├── tsconfig.json            # TypeScript configuration
├── eslint.config.mjs        # ESLint configuration
├── package.json             # Project dependencies and scripts
├── pnpm-lock.yaml          # pnpm lock file
└── renovate.json            # Renovate bot configuration
```

## 🔧 Configuration

### API Configuration

The application connects to GamePlan API through a proxy server. Configure the API in `nuxt.config.ts`:

```typescript
runtimeConfig: {
  gameplanApiKey: process.env.VITE_GAMEPLAN_API_KEY || '',
  public: {
    gameplanApiBaseUrl: process.env.VITE_GAMEPLAN_API_BASE_URL || 'https://portal.technoservesolutions.com/api/resource/'
  }
}
```

### Environment Variables

- `VITE_GAMEPLAN_API_KEY`: Your GamePlan API authentication token
- `VITE_GAMEPLAN_API_BASE_URL`: Base URL for the GamePlan API (defaults to TechnoServe Solutions portal)

## 📚 API Integration

The dashboard integrates with GamePlan API through a secure proxy server. All API requests are routed through the server-side proxy to protect API credentials.

### Supported GamePlan Resources

- **GP Task**: Task data, status, assignments, due dates, and completion tracking
- **GP Comment**: Comments, communication threads, and employee interactions
- **GP Activity**: Activity logs, updates, and employee engagement metrics
- **GP Project**: Project information, assignments, and project-level analytics
- **GP Team**: Team structure, members, and organizational hierarchy

### API Proxy Architecture

All API calls are proxied through `/api/gameplan/[...path]` endpoint which:
- Handles authentication securely on the server-side
- Supports API key via headers (`X-API-Key` or `Authorization`)
- Falls back to server-configured API key if not provided by client
- Provides CORS support for cross-origin requests
- Includes comprehensive error handling and logging
- Supports query parameters and filtering

### API Key Management

The proxy supports flexible API key management:
- **Server-side**: Configure `VITE_GAMEPLAN_API_KEY` in environment variables
- **Client-side**: Users can provide API key via the settings interface
- **Header-based**: API key can be sent via `X-API-Key` or `Authorization` headers

## 🧪 Development

### Development Workflow

1. **Clone the repository**
```bash
git clone <repository-url>
cd Gameplanvue
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Set up environment variables**
```bash
# Copy example env file
cp .env.example .env
# Edit .env with your GamePlan API credentials
```

4. **Start development server**
```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

### Available Scripts

- `pnpm dev` - Start development server with hot module replacement
- `pnpm build` - Build for production (outputs to `dist/`)
- `pnpm preview` - Preview production build locally
- `pnpm lint` - Run ESLint to check code quality
- `pnpm typecheck` - Run TypeScript type checking

### Linting

The project uses ESLint with Nuxt's recommended configuration:

```bash
pnpm lint
```

### Type Checking

TypeScript type checking ensures type safety across the codebase:

```bash
pnpm typecheck
```

### Code Style

The project follows:
- **Comma style**: No trailing commas
- **Brace style**: 1TBS (One True Brace Style)
- **TypeScript**: Strict mode enabled
- **Vue 3**: Composition API with `<script setup>`

## 🚢 Deployment

The application can be deployed to various platforms. This project is configured for **Cloudflare Pages** deployment using Wrangler.

### Cloudflare Pages Deployment with Wrangler

This project is optimized for deployment to Cloudflare Pages, which provides:
- Global CDN distribution
- Serverless functions for API routes
- Automatic HTTPS
- Fast edge network performance

#### Prerequisites

1. Install Wrangler CLI globally:
```bash
npm install -g wrangler
# or
pnpm add -g wrangler
```

2. Authenticate with Cloudflare:
```bash
wrangler login
```

#### Build Configuration

The project uses Nuxt's Nitro preset for Cloudflare Pages. Build the application:

```bash
pnpm build
```

This creates a production build in the `dist` directory with:
- Static assets optimized for CDN
- Serverless functions in `dist/_worker.js`
- Cloudflare-specific headers in `dist/_headers`
- Redirect rules in `dist/_redirects`

#### Deploy to Cloudflare Pages

##### Option 1: Using Wrangler CLI

Deploy directly from the command line:

```bash
# Deploy to production
wrangler pages deploy dist

# Deploy with a project name
wrangler pages deploy dist --project-name=gameplan-analytics

# Deploy to a specific branch
wrangler pages deploy dist --branch=main
```

##### Option 2: Using Cloudflare Dashboard

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Pages** → **Create a project**
3. Connect your Git repository (GitHub, GitLab, or Bitbucket)
4. Configure build settings:
   - **Build command**: `pnpm build`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (project root)
5. Add environment variables:
   - `VITE_GAMEPLAN_API_KEY`: Your GamePlan API key
   - `VITE_GAMEPLAN_API_BASE_URL`: GamePlan API base URL
6. Deploy!

#### Environment Variables

Set environment variables in Cloudflare Pages:

**Via Wrangler:**
```bash
wrangler pages secret put VITE_GAMEPLAN_API_KEY
wrangler pages secret put VITE_GAMEPLAN_API_BASE_URL
```

**Via Dashboard:**
1. Go to your Pages project → **Settings** → **Environment variables**
2. Add variables for Production, Preview, or both
3. Variables are automatically available during build and runtime

#### Custom Domain

1. In Cloudflare Pages dashboard, go to **Custom domains**
2. Add your domain
3. Update DNS records as instructed
4. SSL/TLS is automatically configured

#### Preview Deployments

Cloudflare Pages automatically creates preview deployments for pull requests:
- Each PR gets a unique preview URL
- Preview deployments use preview environment variables
- Perfect for testing before merging

### Other Deployment Options

- **Vercel**: Zero-config deployment for Nuxt applications
- **Netlify**: Automatic deployments with Git integration
- **Docker**: Containerized deployment
- **Traditional hosting**: Build and serve the production output from `.output` directory

### Build Output

The production build creates an optimized output in the `dist` directory that includes:
- Static assets with optimal caching headers
- Serverless worker functions for API routes
- Cloudflare Pages configuration files (`_headers`, `_redirects`, `_routes.json`)
- All assets ready for edge deployment

## 📝 License

This project is private and proprietary.

## 🤝 Contributing

This is a private project. For issues or feature requests, please contact the project maintainers.

## 🔄 Renovate Integration

This repository includes Renovate configuration for automated dependency updates. Install the [Renovate GitHub app](https://github.com/apps/renovate/installations/select_target) to enable automatic dependency management.

---

Built with ❤️ using [Nuxt.js](https://nuxt.com) and [Nuxt UI](https://ui.nuxt.com)
