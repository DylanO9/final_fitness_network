# Real-Time Messaging Documentation

This document describes how real-time messaging is implemented in the application.

---

## Architecture Overview

- **Backend:** Node.js/Express with Socket.io for WebSocket communication and PostgreSQL for message persistence.
- **Frontend:** Next.js using `socket.io-client` for real-time updates.
- **Authentication:** JWT tokens are required for establishing WebSocket connections.

---

## WebSocket Server

- **Port:** `3001`
- **Library:** [Socket.io](https://socket.io/)
- **Authentication:** JWT token is sent during the handshake.

### Example Server-Side Events

- `join_conversation` — Join a chat room (conversation)
- `send_message` — Send a new message
- `receive_message` — Receive a new message broadcast from the server

---