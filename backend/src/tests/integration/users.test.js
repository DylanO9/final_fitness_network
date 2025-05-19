const request = require('supertest');
const app = require('../../app'); // Adjust the path to your app file
let token = null;

// interface User {
//     user_id: number;
//     username: string;
//     email: string;
//     password_hash: string;
//     bio: string;
//     avatar_url: string;
//     height: number;
//     weight: number;
//     age: number;
//     created_at: Date;
// }

describe('Users Integration Tests', () => {
    describe('POST /api/users/signup', () => {
        it('should register a new user', async () => {
            const newUser = {
                username: 'testuser',
                email: 'testuser@gmail.com',
                password: 'password123',
            };
            const res = await request(app)
                .post('/api/users/signup')
                .send(newUser);
            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('user');
            expect(res.body).toHaveProperty('token');
            // store the token for later use
            token = res.body.token;
            console.log('Token:', token);
        });
    });

    describe('POST /api/users/login', () => {
        it('should login an existing user', async () => {
            const user = {
                username: 'testuser',
                password: 'password123',
            };
            const res = await request(app)
                .post('/api/users/login')
                .send(user);
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('user');
            expect(res.body).toHaveProperty('token');

            // store the token for later use
            expect(res.body.user).toHaveProperty('user_id');
            expect(res.body.user).toHaveProperty('username');
            expect(res.body.user).toHaveProperty('email');
            expect(res.body.user).toHaveProperty('password_hash');
            expect(res.body.user).toHaveProperty('bio');
            expect(res.body.user).toHaveProperty('avatar_url');
            expect(res.body.user).toHaveProperty('height');
            expect(res.body.user).toHaveProperty('weight');
            expect(res.body.user).toHaveProperty('age');
            expect(res.body.user).toHaveProperty('created_at');
            token = res.body.token;
        });
        }
    );

    describe('GET /api/users/:username', () => {
        it('should get a user by username', async () => {
            const res = await request(app)
                .get('/api/users/testuser')
                .set('Authorization', `Bearer ${token}`);
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('user_id');
            expect(res.body).toHaveProperty('username');
            expect(res.body).toHaveProperty('email');
            expect(res.body).toHaveProperty('password_hash');
            expect(res.body).toHaveProperty('bio');
            expect(res.body).toHaveProperty('avatar_url');
            expect(res.body).toHaveProperty('height');
            expect(res.body).toHaveProperty('weight');
            expect(res.body).toHaveProperty('age');
            expect(res.body).toHaveProperty('created_at');
        });
    }
    );

    describe('GET /api/users/me', () => {
        it('should get the current user', async () => {
            const res = await request(app)
                .get('/api/users/me')
                .set('Authorization', `Bearer ${token}`);
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('user_id');
            expect(res.body).toHaveProperty('username');
            expect(res.body).toHaveProperty('email');
            expect(res.body).toHaveProperty('password_hash');
            expect(res.body).toHaveProperty('bio');
            expect(res.body).toHaveProperty('avatar_url');
            expect(res.body).toHaveProperty('height');
            expect(res.body).toHaveProperty('weight');
            expect(res.body).toHaveProperty('age');
            expect(res.body).toHaveProperty('created_at');
            });
        }
    );

    describe('GET /api/users', () => {
        it('should get all users', async () => {
            const res = await request(app)
                .get('/api/users/')
            expect(res.statusCode).toBe(200);
            expect(res.body).toBeInstanceOf(Array);
        });
    });

    describe('DELETE /api/users/:username', () => {
        it('should delete a user by username', async () => {
            const res = await request(app)
                .delete('/api/users/')
                .set('Authorization', `Bearer ${token}`);
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('message', 'User deleted successfully');
        });
    });

});