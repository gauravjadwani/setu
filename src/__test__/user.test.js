const request = require('supertest');
const express = require('express');
const redisMock = require('redis-mock');
const { promisify } = require('util');
const app = express();
const router = require('../routes/users'); // Adjust the path as necessary

app.use(express.json());
app.use('/users', router);

// Create a Redis client mock
const redisClient = redisMock.createClient();
const hgetallAsync = promisify(redisClient.hgetall).bind(redisClient);
const hmsetAsync = promisify(redisClient.hmset).bind(redisClient);
const flushallAsync = promisify(redisClient.flushall).bind(redisClient);

describe('User API', () => {
    let userId;
    const userEmail = 'john.doe@example.com';

    beforeEach(async () => {
        // Clear Redis mock database before each test
        await flushallAsync();
    });

    it('should create a new user', async () => {
        const response = await request(app)
            .post('/users')
            .send({
                name: 'John Doe',
                email: userEmail
            });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('userId');
        expect(response.body).toHaveProperty('name', 'John Doe');
        expect(response.body).toHaveProperty('email', userEmail);

        userId = response.body.userId;

        // Verify user stored in Redis
        const user = await hgetallAsync(`user:${userId}`);
        expect(user).toEqual({
            userId,
            name: 'John Doe',
            email: userEmail
        });
    });

    it('should not create a user with a duplicate email', async () => {
        await hmsetAsync(`user:email:${userEmail}`, {
            userId: 'existingUserId',
            name: 'Existing User',
            email: userEmail
        });

        const response = await request(app)
            .post('/users')
            .send({
                name: 'John Doe',
                email: userEmail
            });

        expect(response.status).toBe(400);
        expect(response.text).toBe('Email already registered.');
    });

    it('should retrieve user liability', async () => {
        // Set up user balances for testing
        await hmsetAsync(`user:${userId}:balances`, {
            'user2': '50',
            'user3': '-20'
        });

        const response = await request(app)
            .get(`/users/${userId}/liability`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('userId', userId);
        expect(response.body).toHaveProperty('totalOwed', 20);
        expect(response.body).toHaveProperty('totalTake', 50);
        expect(response.body).toHaveProperty('balances');
    });

    it('should handle user liability when no balances are found', async () => {
        const response = await request(app)
            .get(`/users/${userId}/liability`);

        expect(response.status).toBe(404);
        expect(response.text).toBe('No balances found for this user.');
    });

    it('should handle internal server error for liability retrieval', async () => {
        // Simulate Redis error
        jest.spyOn(redisClient, 'hgetall').mockImplementation((key, cb) => cb(new Error('Redis error'), null));

        const response = await request(app)
            .get(`/users/${userId}/liability`);

        expect(response.status).toBe(500);
        expect(response.text).toBe('Error fetching balances.');
    });
});
