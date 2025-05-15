# Architecture Overview

## System Components

- **Frontend**: Next.js + TypeScript SPA, uses WebSockets for real-time features.
- **Backend**: Node.js/Express REST API, handles authentication, business logic, and data storage.
- **Messaging**: WebSocket server for chat and notifications.
- **Media**: AWS S3 for storing videos and photos.
- **Data Engineering**: Kafka for event streaming, Snowflake for analytics.

## Data Flow

1. User uploads PR video via frontend.
2. Backend validates and stores metadata, uploads media to S3.
3. Feed and analytics events are published to Kafka.
4. Snowflake consumes events for reporting and dashboards.

## Key Directories

- `frontend/web` - React web app
- `frontend/mobile` - React Native mobile app
- `/backend` - Node.js API
- `/shared` - Shared types and utilities

See [docs/ERD.md](docs/ERD.md) for database schema.
