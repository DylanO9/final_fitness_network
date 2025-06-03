export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/users/login',
    SIGNUP: '/api/users/signup',
    ME: '/api/users/me',
  },
  USERS: {
    ALL: '/api/users',
  },
  EXERCISES: {
    ALL: '/api/exercises/all',
    BY_WORKOUT: (workoutId: number) => `/api/exercises/?workout_id=${workoutId}`,
    ADD_TO_WORKOUT: '/api/exercises/add-existing-exercises',
    UPDATE: (exerciseId: number) => `/api/exercises/?exercise_id=${exerciseId}`,
    DELETE: (exerciseId: number) => `/api/exercises/${exerciseId}`,
    CREATE: '/api/exercises/no-workout',
    UPDATE_EXERCISES: '/api/exercises/update-exercises',
  },
  WORKOUTS: {
    ALL: '/api/workouts',
    UPDATE: (workoutId: number) => `/api/workouts/?workout_id=${workoutId}`,
    DELETE: (workoutId: number) => `/api/workouts/${workoutId}`,
    CREATE: '/api/workouts',
  },
  FRIENDS: {
    ALL: '/api/friends',
    REQUESTS: '/api/friends/request',
    SEND_REQUEST: '/api/friends/request',
    RESPOND: '/api/friends/respond',
    DELETE: (friendId: number) => `/api/friends/${friendId}`,
  },
  MESSAGES: {
    CONVERSATIONS: '/api/messages/conversations',
    BY_USER: (userId: number) => `/api/messages/${userId}`,
  },
}; 