# React + Express Broadcast Notification Demo

This project demonstrates a React Query notification UI with cross-tab synchronization using the BroadcastChannel API and a mocked Node.js + Express backend.

## What it does

- Shows unread notification count in the header
- Opens a notification list when the count is clicked
- Marks a notification as read through the backend
- Updates the React Query cache locally without refetching the count
- Broadcasts the updated count to other tabs
- Uses localStorage as a fallback for new tabs

## Run locally

### Backend

```bash
cd server
npm install
npm start
```

### Frontend

```bash
cd client
npm install
npm start
```

Open http://localhost:3000 in two browser tabs to see the sync behavior.

The backend listens on http://localhost:5001 by default because port 5000 is commonly used by macOS services.

## API endpoints

- GET /notifications/count
- GET /notifications
- POST /notifications/:id/read