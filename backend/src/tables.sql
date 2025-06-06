CREATE TABLE Users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    username VARCHAR(10) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    bio VARCHAR(250) DEFAULT '',
    avatar_url VARCHAR(255),
    height DECIMAL(5,2) DEFAULT 0,
    weight DECIMAL(5,2) DEFAULT 0,
    age INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Friends (
    user_id INT REFERENCES Users(user_id) NOT NULL,
    friend_id INT REFERENCES Users(user_id) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'accepted', 'declined')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, friend_id)
);

CREATE TABLE Workouts (
    workout_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(user_id) NOT NULL,
    workout_name VARCHAR(50) UNIQUE NOT NULL,
    workout_category VARCHAR(50) NOT NULL
);

CREATE TABLE Exercises (
    exercise_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(user_id) NOT NULL,
    exercise_name VARCHAR(50) NOT NULL,
    UNIQUE (user_id, exercise_name),   
    description TEXT,
    exercise_category VARCHAR(50) NOT NULL
);

CREATE TABLE Workout_Exercises (
    workout_exercise_id SERIAL PRIMARY KEY,
    workout_id INT REFERENCES Workouts(workout_id) NOT NULL,
    exercise_id INT REFERENCES Exercises(exercise_id) NOT NULL
);

CREATE TABLE Messages ( 
    message_id SERIAL PRIMARY KEY,
    sender_id INT REFERENCES Users(user_id) NOT NULL,
    receiver_id INT REFERENCES Users(user_id) NOT NULL,
    message_text TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Calendar_Entries (
    calendar_entry_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(user_id) NOT NULL,
    workout_id INT REFERENCES Workouts(workout_id) NOT NULL,
    workout_date DATE NOT NULL
);

CREATE TABLE Sets_Reps (
    set_rep_id SERIAL PRIMARY KEY,
    calendar_entry_id INT REFERENCES Calendar_Entries(calendar_entry_id) NOT NULL,
    workout_id INT REFERENCES Workouts(workout_id) NOT NULL,
    exercise_id INT REFERENCES Exercises(exercise_id) NOT NULL,
    set_number INT NOT NULL,
    reps INT NOT NULL,
    weight DECIMAL(5,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);