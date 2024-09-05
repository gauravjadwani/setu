const express = require('express');
const router = express.Router();
const redisClient = require('../config/redisConfig');

/**
 * @swagger
 * components:
 *   schemas:
 *     Expense:
 *       type: object
 *       required:
 *         - description
 *         - amount
 *         - paidBy
 *         - splitBetween
 *       properties:
 *         description:
 *           type: string
 *           description: Description of the expense
 *         amount:
 *           type: number
 *           description: Total amount of the expense
 *         paidBy:
 *           type: string
 *           description: Name of the person who paid
 *         splitBetween:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the member
 *               percentage:
 *                 type: number
 *                 description: Percentage split for the member
 */

/**
 * @swagger
 * /expenses/add:
 *   post:
 *     summary: Add a new expense to a group
 *     tags: [Expenses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Expense'
 *     responses:
 *       200:
 *         description: Expense added successfully
 *       400:
 *         description: Error, total percentage does not add up to 100%
 *       500:
 *         description: Internal server error
 */
// Route to add an expense with percentage-based splits
router.post('/add', (req, res) => {
    const { groupId, expense } = req.body;
    const { amount, splitBetween, paidBy } = expense;


    splitBetween.forEach(person => {
        const amountOwed = (person.percentage / 100) * amount;


        const balanceKeyPayer = `user:${paidBy}:balances:${person.user}`;
        const balanceKeyParticipant = `user:${person.user}:balances:${paidBy}`;

        redisClient.incrbyfloat(balanceKeyPayer, amountOwed, (err) => {
            if (err) return res.status(500).send('Error updating balances.');
        });

        redisClient.decrbyfloat(balanceKeyParticipant, amountOwed, (err) => {
            if (err) return res.status(500).send('Error updating balances.');
        });
    });
});

/**
 * @swagger
 * /expenses/{groupId}:
 *   get:
 *     summary: Get all expenses for a group
 *     tags: [Expenses]
 *     parameters:
 *       - in: path
 *         name: groupId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the group
 *     responses:
 *       200:
 *         description: List of all expenses for the group
 *       404:
 *         description: Group not found
 *       500:
 *         description: Internal server error
 */
// Route to get all expenses of a group
router.get('/:groupId', (req, res) => {
    const { groupId } = req.params;

    redisClient.lrange(`group:${groupId}:expenses`, 0, -1, (err, expenses) => {
        if (err) return res.status(500).send('Error fetching expenses.');
        res.json(expenses.map(e => JSON.parse(e)));
    });
});

module.exports = router;
