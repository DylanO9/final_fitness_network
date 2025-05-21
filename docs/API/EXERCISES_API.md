# Exercise API

Express.js API for managing exercises and their associations with workouts.

---

## Routes

### GET `/api/exercises/all`
- **Description:** Retrieve all exercises for the logged-in user.
- **Authentication:** Requires a valid JWT token.
- **Response:** Returns an array of exercise objects.

---

### GET `/api/exercises/`
- **Description:** Get all exercises for a specific workout.
- **Authentication:** Requires a valid JWT token.
- **Query Parameters:**
  - `workout_id` (integer) - The ID of the workout.
- **Response:** Returns an array of exercise objects.

---

### POST `/api/exercises/`
- **Description:** Create a new exercise and associate it with a workout.
- **Authentication:** Requires a valid JWT token.
- **Request Body:**
  - `workout_id` (integer) - The ID of the workout.
  - `exercise_name` (string) - Name of the exercise.
  - `description` (string) - Description of the exercise.
  - `exercise_category` (string) - Category of the exercise.
- **Response:** Returns the created exercise object.

---

### POST `/api/exercises/no-workout`
- **Description:** Create a new exercise without associating it with a workout.
- **Authentication:** Requires a valid JWT token.
- **Request Body:**
  - `exercise_name` (string) - Name of the exercise.
  - `description` (string) - Description of the exercise.
  - `exercise_category` (string) - Category of the exercise.
- **Response:** Returns the created exercise object.

---

### PUT `/api/exercises/`
- **Description:** Update an existing exercise.
- **Authentication:** Requires a valid JWT token.
- **Query Parameters:**
  - `exercise_id` (integer) - The ID of the exercise to update.
- **Request Body:**
  - `exercise_name` (string) - Updated name of the exercise.
  - `description` (string) - Updated description of the exercise.
  - `exercise_category` (string) - Updated category of the exercise.
- **Response:** Returns the updated exercise object.

---

### DELETE `/api/exercises/:exercise_id`
- **Description:** Delete an exercise and its workout associations.
- **Authentication:** Requires a valid JWT token.
- **Path Parameters:**
  - `exercise_id` (integer) - The ID of the exercise to delete.
- **Response:** Returns the deleted exercise object.

---

### POST `/api/exercises/add-to-workout`
- **Description:** Add an existing exercise to a workout.
- **Authentication:** Requires a valid JWT token.
- **Request Body:**
  - `workout_id` (integer) - The ID of the workout.
  - `exercise_id` (integer) - The ID of the exercise.
- **Response:** Returns a success message.

---

### POST `/api/exercises/add-existing-exercises`
- **Description:** Add multiple existing exercises to a workout.
- **Authentication:** Requires a valid JWT token.
- **Request Body:**
  - `workout_id` (integer) - The ID of the workout.
  - `exercise_ids` (array) - Array of exercise IDs to add.
- **Response:** Returns a success message.

---

### PUT `/api/exercises/update-exercises`
- **Description:** Update the list of exercises associated with a workout.
- **Authentication:** Requires a valid JWT token.
- **Request Body:**
  - `workout_id` (integer) - The ID of the workout.
  - `exercise_ids` (array) - New array of exercise IDs.
- **Response:** Returns a success message.