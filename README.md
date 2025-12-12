# GamePlan Analytics Dashboard

A comprehensive analytics and reporting dashboard for GamePlan, built with Nuxt.js and Nuxt UI. This application provides real-time insights into employee activity, task management, performance metrics, and team analytics by connecting to the GamePlan API.

## 🎯 Overview

GamePlan Analytics Dashboard is a modern web application that helps teams and managers track:
- Employee activity and engagement
- Task completion rates and backlogs
- Performance metrics and trends
- Team productivity and risk indicators
- Real-time updates and notifications

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

```
Gameplanvue/
├── app/
│   ├── components/          # Vue components
│   │   ├── analytics/       # Analytics and KPI components
│   │   ├── common/          # Shared components
│   │   ├── customers/       # Customer management
│   │   ├── home/            # Home page components
│   │   ├── inbox/           # Inbox components
│   │   ├── reports/         # Report components
│   │   └── settings/        # Settings components
│   ├── composables/         # Composable functions
│   │   ├── services/        # API and service layer
│   │   └── utils/           # Utility functions
│   ├── layouts/             # Layout components
│   ├── pages/               # Application pages
│   │   ├── reports/         # Report pages
│   │   └── settings/        # Settings pages
│   ├── stores/              # Pinia stores
│   ├── types/               # TypeScript type definitions
│   └── utils/               # Utility functions
├── server/
│   └── api/
│       └── gameplan/        # GamePlan API proxy
├── public/                  # Static assets
└── nuxt.config.ts          # Nuxt configuration
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

The dashboard integrates with GamePlan API to fetch:
- **Tasks** (GP Task): Task data, status, assignments, due dates
- **Comments** (GP Comment): Comments and communication
- **Activities** (GP Activity): Activity logs and updates
- **Projects** (GP Project): Project information
- **Teams** (GP Team): Team structure and members

All API calls are proxied through `/api/gameplan/[...path]` to handle authentication securely.

## 🧪 Development

### Linting

```bash
pnpm lint
```

### Type Checking

```bash
pnpm typecheck
```

## 🚢 Deployment

The application can be deployed to any platform that supports Node.js:

- **Vercel**: Zero-config deployment for Nuxt applications
- **Netlify**: Automatic deployments with Git integration
- **Docker**: Containerized deployment
- **Traditional hosting**: Build and serve the production output

### Build Output

The production build creates an optimized output in the `.output` directory that can be served by any Node.js server or static hosting service.

## 📝 License

This project is private and proprietary.

## 🤝 Contributing

This is a private project. For issues or feature requests, please contact the project maintainers.

## 🔄 Renovate Integration

This repository includes Renovate configuration for automated dependency updates. Install the [Renovate GitHub app](https://github.com/apps/renovate/installations/select_target) to enable automatic dependency management.

---

Built with ❤️ using [Nuxt.js](https://nuxt.com) and [Nuxt UI](https://ui.nuxt.com)
