import { API_BASE_URL, getAuthHeaders, API_ENDPOINTS } from '../config/api';

export interface User {
  user_id: number;
  username: string;
  email: string;
  password_hash: string;
  bio: string;
  avatar_url: string;
  height: number;
  weight: number;
  age: number;
  created_at: string;
}

export interface Exercise {
  exercise_id: number;
  user_id: number;
  exercise_name: string;
  description: string;
  exercise_category: string;
}

export interface Workout {
  workout_id: number;
  user_id: number;
  workout_name: string;
  workout_category: string;
}

export interface Friend {
  friend_id: number;
  user_id: number;
  friend_user_id: number;
  username: string;
  avatar_url: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
}

export interface Message {
  message_id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  message_text?: string;
  message?: string;
  sent_at: string;
  created_at: string;
  username?: string;
  avatar_url?: string;
}

export interface Conversation {
  user_id: number;
  username: string;
  avatar_url: string;
  last_message?: string;
  last_message_time?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface CalendarEntryWithExercises {
  calendar_entry_id: number;
  user_id: number;
  workout_id: number;
  workout_date: string;
  workout_name: string;
  workout_category: string;
  exercises: {
    exercise_id: number;
    exercise_name: string;
    exercise_category: string;
    sets_reps: {
      set_number: number;
      reps: number;
      weight: number;
      notes: string;
    }[];
  }[];
}


export interface CalendarEntry {
  calendar_entry_id: number;
  user_id: number;
  workout_id: number;
  date: string;
  workout_name: string;
  workout_category: string;
}

export interface SetRep {
  set_rep_id: number;
  calendar_entry_id: number;
  workout_id: number;
  exercise_id: number;
  set_number: number;
  reps: number;
  weight: number;
  notes: string;
  created_at: string;
}

class ApiClient {
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const headers = getAuthHeaders();
      
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('API request failed:', error);
      return { error: error instanceof Error ? error.message : 'An unknown error occurred' };
    }
  }

  // Auth endpoints
  static async login(username: string, password: string): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  static async signup(email: string, username: string, password: string): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>(API_ENDPOINTS.AUTH.SIGNUP, {
      method: 'POST',
      body: JSON.stringify({ email, username, password }),
    });
  }

  static async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request<User>(API_ENDPOINTS.AUTH.ME);
  }

  // User endpoints
  static async getAllUsers(): Promise<ApiResponse<User[]>> {
    return this.request<User[]>(API_ENDPOINTS.USERS.ALL);
  }

  // Exercise endpoints
  static async getAllExercises(): Promise<ApiResponse<Exercise[]>> {
    return this.request<Exercise[]>(API_ENDPOINTS.EXERCISES.ALL);
  }

  static async getExercisesByWorkout(workoutId: number): Promise<ApiResponse<Exercise[]>> {
    return this.request<Exercise[]>(API_ENDPOINTS.EXERCISES.BY_WORKOUT(workoutId));
  }

  static async addExercisesToWorkout(workoutId: number, exerciseIds: number[]): Promise<ApiResponse<{ message: string }>> {
    return this.request(API_ENDPOINTS.EXERCISES.ADD_TO_WORKOUT, {
      method: 'POST',
      body: JSON.stringify({ workout_id: workoutId, exercise_ids: exerciseIds }),
    });
  }

  static async updateWorkoutExercises(workoutId: number, exerciseIds: number[]): Promise<ApiResponse<{ message: string }>> {
    return this.request(API_ENDPOINTS.EXERCISES.UPDATE_EXERCISES, {
      method: 'PUT',
      body: JSON.stringify({ workout_id: workoutId, exercise_ids: exerciseIds }),
    });
  }

  static async updateExercise(exerciseId: number, exerciseData: Partial<Exercise>): Promise<ApiResponse<Exercise>> {
    return this.request<Exercise>(API_ENDPOINTS.EXERCISES.UPDATE(exerciseId), {
      method: 'PUT',
      body: JSON.stringify(exerciseData),
    });
  }

  static async deleteExercise(exerciseId: number): Promise<ApiResponse<void>> {
    return this.request(API_ENDPOINTS.EXERCISES.DELETE(exerciseId), {
      method: 'DELETE',
    });
  }

  static async createExercise(exerciseData: Partial<Exercise>): Promise<ApiResponse<Exercise>> {
    return this.request<Exercise>(API_ENDPOINTS.EXERCISES.CREATE, {
      method: 'POST',
      body: JSON.stringify(exerciseData),
    });
  }

  // Workout endpoints
  static async getAllWorkouts(): Promise<ApiResponse<Workout[]>> {
    return this.request<Workout[]>(API_ENDPOINTS.WORKOUTS.ALL);
  }

  static async updateWorkout(workoutId: number, workoutData: Partial<Workout>): Promise<ApiResponse<Workout>> {
    return this.request<Workout>(API_ENDPOINTS.WORKOUTS.UPDATE(workoutId), {
      method: 'PUT',
      body: JSON.stringify(workoutData),
    });
  }

  static async deleteWorkout(workoutId: number): Promise<ApiResponse<void>> {
    return this.request(API_ENDPOINTS.WORKOUTS.DELETE(workoutId), {
      method: 'DELETE',
    });
  }

  static async createWorkout(workoutData: Partial<Workout>): Promise<ApiResponse<Workout>> {
    return this.request<Workout>(API_ENDPOINTS.WORKOUTS.CREATE, {
      method: 'POST',
      body: JSON.stringify(workoutData),
    });
  }

  // Friend endpoints
  static async getAllFriends(): Promise<ApiResponse<Friend[]>> {
    return this.request<Friend[]>(API_ENDPOINTS.FRIENDS.ALL);
  }

  static async getFriendRequests(): Promise<ApiResponse<Friend[]>> {
    return this.request<Friend[]>(API_ENDPOINTS.FRIENDS.REQUESTS);
  }

  static async sendFriendRequest(friendId: number): Promise<ApiResponse<void>> {
    return this.request(API_ENDPOINTS.FRIENDS.SEND_REQUEST, {
      method: 'POST',
      body: JSON.stringify({ friend_id: friendId}),
    });
  }

  static async respondToFriendRequest(friendId: number, status: 'accepted' | 'declined'): Promise<ApiResponse<void>> {
    return this.request(API_ENDPOINTS.FRIENDS.RESPOND, {
      method: 'PUT',
      body: JSON.stringify({ friend_id: friendId, status }),
    });
  }

  static async deleteFriend(friendId: number): Promise<ApiResponse<void>> {
    return this.request(API_ENDPOINTS.FRIENDS.DELETE(friendId), {
      method: 'DELETE',
    });
  }

  // Message endpoints
  static async getConversations(): Promise<ApiResponse<Conversation[]>> {
    return this.request<Conversation[]>(API_ENDPOINTS.MESSAGES.CONVERSATIONS);
  }

  static async getMessagesByUser(userId: number): Promise<ApiResponse<Message[]>> {
    return this.request<Message[]>(API_ENDPOINTS.MESSAGES.BY_USER(userId));
  }

  // Calendar endpoints
  static async getCalendarEntries(): Promise<ApiResponse<CalendarEntry[]>> {
    return this.request<CalendarEntry[]>(API_ENDPOINTS.CALENDAR.ENTRIES);
  }
  static async getCalendarEntriesByDate(date: string): Promise<ApiResponse<CalendarEntryWithExercises[]>> {
    return this.request<CalendarEntryWithExercises[]>(API_ENDPOINTS.CALENDAR.BY_DATE(date));
  }

  static async addWorkoutToCalendar(date: string, workoutId: number): Promise<ApiResponse<CalendarEntry>> {
    return this.request<CalendarEntry>(API_ENDPOINTS.CALENDAR.ADD_WORKOUT, {
      method: 'POST',
      body: JSON.stringify({ workout_date: date, workout_id: workoutId }),
    });
  }

  static async getSetsAndReps(entryId: number): Promise<ApiResponse<SetRep[]>> {
    return this.request<SetRep[]>(API_ENDPOINTS.CALENDAR.SETS_REPS(entryId));
  }

  static async addSetRep(entryId: number, setData: Partial<SetRep>): Promise<ApiResponse<SetRep>> {
    return this.request<SetRep>(API_ENDPOINTS.CALENDAR.ADD_SET(entryId), {
      method: 'POST',
      body: JSON.stringify(setData),
    });
  }

  static async updateSet(entryId: number, setId: number, setData: Partial<SetRep>): Promise<ApiResponse<SetRep>> {
    return this.request<SetRep>(API_ENDPOINTS.CALENDAR.UPDATE_SET(entryId, setId), {
      method: 'PUT',
      body: JSON.stringify(setData),
    });
  }

  static async deleteSet(entryId: number, setId: number): Promise<ApiResponse<void>> {
    return this.request(API_ENDPOINTS.CALENDAR.DELETE_SET(entryId, setId), {
      method: 'DELETE',
    });
  }

  static async deleteWorkoutFromCalendar(entryId: number): Promise<ApiResponse<void>> {
    return this.request(API_ENDPOINTS.CALENDAR.DELETE_WORKOUT_FROM_CALENDAR(entryId), {
      method: 'DELETE',
    });
  }

}

export default ApiClient; 