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