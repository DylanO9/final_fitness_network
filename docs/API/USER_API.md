# User API

Simple Express.js API for user management and authentication.

---

## Routes

### GET `/api/users/`
- **Description:** Retrieve a list of all users.

---

### GET `/api/users/:username`
- **Description:** Retrieve a single user by their username.

---

### POST `/api/users/signup`
- **Description:** Register a new user account.
- **Request Body:**  
  - `username` (string)
  - `email` (string)
  - `password` (string)

---

### POST `/api/users/login`
- **Description:** Authenticate a user and receive a JWT token.
- **Request Body:**  
  - `username` (string)
  - `password` (string)

---
