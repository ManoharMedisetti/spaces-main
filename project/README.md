# TutorWise Spaces

Your intelligent learning workspace for organizing study materials and chatting with an AI tutor.

## Environment Configuration

### Production
Set `VITE_API_BASE` to your HTTPS backend URL in production builds:
```bash
VITE_API_BASE=https://api.mybackend.com
```

### Development
Omit `VITE_API_BASE` locally to proxy API calls to `localhost:8000` during development.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

The build will use the `VITE_API_BASE` environment variable if set, otherwise defaults to `/api` for production deployments with proxy configuration.