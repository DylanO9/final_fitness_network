# Workouts API

Simple Express.js API for managing user workouts.

---

## Routes

### GET `/api/workouts/`
- **Description:** Retrieve all workouts for the logged-in user.
- **Authentication:** Requires a valid JWT token.

---

### POST `/api/workouts/`
- **Description:** Create a new workout for the logged-in user.
- **Authentication:** Requires a valid JWT token.
- **Request Body:**  
  - `workout_name` (string) - The name of the workout.  
  - `workout_category` (string) - The category of the workout.

---

### PUT `/api/workouts/`
- **Description:** Update an existing workout for the logged-in user.
- **Authentication:** Requires a valid JWT token.
- **Query Parameters:**  
  - `workout_id` (integer) - The ID of the workout to update.
- **Request Body:**  
  - `workout_name` (string) - The updated name of the workout.  
  - `workout_category` (string) - The updated category of the workout.

---

### DELETE `/api/workouts/:workout_id`
- **Description:** Delete a workout for the logged-in user.
- **Authentication:** Requires a valid JWT token.
- **Path Parameters:**  
  - `workout_id` (integer) - The ID of the workout to delete.