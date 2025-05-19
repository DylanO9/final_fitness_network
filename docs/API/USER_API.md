# User API

Simple Express.js API for user management and authentication.

---

## Routes

### GET `/api/users/`
- **Description:** Retrieve a list of all users.

---

### GET `/api/users/:username`
- **Description:** Retrieve a single user by their username.
- **Path Parameters:**  
  - `username` (string) - The username of the user to retrieve.

---

### GET `/api/users/me`
- **Description:** Retrieve the logged-in user's details.
- **Authentication:** Requires a valid JWT token.

---

### POST `/api/users/signup`
- **Description:** Register a new user account.
- **Request Body:**  
  - `username` (string) - The username of the new user.  
  - `email` (string) - The email of the new user.  
  - `password` (string) - The password for the new user account.
- **Response:**  
  - Returns the created user object and a JWT token.

---

### POST `/api/users/login`
- **Description:** Authenticate a user and receive a JWT token.
- **Request Body:**  
  - `username` (string) - The username of the user.  
  - `password` (string) - The password of the user.
- **Response:**  
  - Returns the authenticated user object and a JWT token.

---

### DELETE `/api/users/`
- **Description:** Delete the logged-in user's account.
- **Authentication:** Requires a valid JWT token.
- **Response:**  
  - Returns a success message if the user is deleted.  
  - Returns a 404 error if the user is not found.