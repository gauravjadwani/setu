// routes/users.js
const express = require('express');
const router = express.Router();
const redisClient = require('../config/redisConfig');  
const { v4: uuidv4 } = require('uuid'); // For generating unique user IDs

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user with a server-generated user ID
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the user
 *               email:
 *                 type: string
 *                 description: Email of the user
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Email already registered or invalid input
 *       500:
 *         description: Internal server error
 */
router.post('/', async (req, res) => {
    const { name, email } = req.body;

    if (!name || !email) {
        return res.status(400).send('Name and email are required.');
    }

    // Generate a unique user ID
    const userId = uuidv4();

    try {
        // Check if user with the same email already exists
        const existingUser = await redisClient.hgetall(`user:email:${email}`);
        if (Object.keys(existingUser).length > 0) {
            return res.status(400).send('Email already registered.');
        }

        // Store user details in Redis
        const user = {
            userId,
            name,
            email
        };

        await redisClient.hmset(`user:${userId}`, user);
        await redisClient.hmset(`user:email:${email}`, user);

        res.status(201).json({ userId, name, email });
    } catch (e) {
        console.error(e);
        return res.status(500).send('Error creating user.');
    }
});

/**
 * @swagger
 * /users/{userId}/liability:
 *   get:
 *     summary: Retrieve the total liability for a specific user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: The unique identifier of the user for whom the liability is being queried
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved the liability information for the user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                   description: The unique identifier of the user
 *                 totalOwed:
 *                   type: number
 *                   format: float
 *                   description: The total amount of money the user owes to others
 *                 totalTake:
 *                   type: number
 *                   format: float
 *                   description: The total amount of money that others owe to the user
 *                 balances:
 *                   type: object
 *                   additionalProperties:
 *                     type: number
 *                     format: float
 *                   description: A dictionary of balances with other users, where keys are user IDs and values are amounts
 *       400:
 *         description: Bad request due to invalid user ID format
 *       404:
 *         description: No balances found for the specified user
 *       500:
 *         description: Internal server error while fetching the balances
 */
router.get('/:userId/liability', (req, res) => {
    const { userId } = req.params;

    // Get all balance records for this user
    redisClient.hgetall(`user:${userId}:balances`, (err, balances) => {
        if (err) return res.status(500).send('Error fetching balances.');
        if (!balances) return res.status(404).send('No balances found for this user.');

        let totalOwed = 0;
        let totalTake = 0;

        // Calculate total amounts owed or to take
        for (const [otherUser, balance] of Object.entries(balances)) {
            if (balance < 0) {
                totalOwed += Math.abs(balance); // This user owes others
            } else {
                totalTake += parseFloat(balance); // Others owe this user
            }
        }

        res.json({
            userId,
            totalOwed,
            totalTake,
            balances
        });
    });
});
module.exports = router;