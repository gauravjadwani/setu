const express = require('express');
const router = express.Router();
const redisClient = require('../config/redisConfig');  

/**
 * @swagger
 * components:
 *   schemas:
 *     Group:
 *       type: object
 *       required:
 *         - groupId
 *         - groupName
 *         - members
 *       properties:
 *         groupId:
 *           type: string
 *           description: Unique identifier for the group
 *         groupName:
 *           type: string
 *           description: Name of the group
 *         members:
 *           type: array
 *           items:
 *             type: string
 *           description: List of group members
 */

/**
 * @swagger
 * /groups/create:
 *   post:
 *     summary: Create a new group with multiple members
 *     tags: [Groups]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               groupId:
 *                 type: string
 *                 description: Unique ID for the group
 *               groupName:
 *                 type: string
 *                 description: Name of the group
 *               members:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of user IDs who are members of the group
 *     responses:
 *       201:
 *         description: Group created successfully
 *       400:
 *         description: Invalid input or group ID already exists
 *       500:
 *         description: Internal server error
 */

router.post('/create', async (req, res) => {
    const { groupId, groupName, members } = req.body;

    if (!groupId || !groupName || !Array.isArray(members) || members.length === 0) {
        return res.status(400).send('Invalid input.');
    }

    try {
        // Check if the group already exists
        const groupExists = await redisClient.exists(`group:${groupId}`);
        if (groupExists) {
            return res.status(400).send('Group ID already exists.');
        }

        // Validate members
        for (const memberId of members) {
            const userExists = await redisClient.exists(`user:${memberId}`);
            if (!userExists) {
                return res.status(400).send(`User with ID ${memberId} does not exist.`);
            }
        }

        // Store group metadata
        const groupMeta = {
            name: groupName,
            members: JSON.stringify(members),
        };

        await redisClient.hset(`group:${groupId}:meta`, groupMeta);
        res.status(201).send(`Group ${groupName} created successfully.`);
    } catch (e) {
        console.log(e);
        return res.status(500).send('Error creating group.');
    }
});

/**
 * @swagger
 * /groups/{groupId}/members/add:
 *   post:
 *     summary: Add new members to an existing group
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         description: ID of the group
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               members:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of user IDs to be added to the group
 *     responses:
 *       200:
 *         description: Members added successfully
 *       400:
 *         description: Invalid input or user ID does not exist
 *       404:
 *         description: Group not found
 *       500:
 *         description: Internal server error
 */
router.post('/:groupId/members/add', async (req, res) => {
    const { groupId } = req.params;
    const { members } = req.body;

    if (!Array.isArray(members) || members.length === 0) {
        return res.status(400).send('Invalid input. Members should be a non-empty array.');
    }

    try {
        // Check if the group exists
        const groupExists = await redisClient.exists(`group:${groupId}:meta`);
        if (!groupExists) {
            return res.status(404).send('Group not found.');
        }

        // Validate members
        for (const memberId of members) {
            const userExists = await redisClient.exists(`user:${memberId}`);
            if (!userExists) {
                return res.status(400).send(`User with ID ${memberId} does not exist.`);
            }
        }

        // Add members to the group
        const currentMembers = JSON.parse(await redisClient.hget(`group:${groupId}:meta`, 'members') || '[]');
        const updatedMembers = [...new Set([...currentMembers, ...members])]; // Ensure no duplicates

        await redisClient.hset(`group:${groupId}:meta`, 'members', JSON.stringify(updatedMembers));

        res.send('Members added successfully.');
    } catch (e) {
        console.log(e);
        return res.status(500).send('Error adding members.');
    }
});


/**
 * @swagger
 * /groups/{groupId}/members/remove:
 *   post:
 *     summary: Remove members from an existing group
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         description: ID of the group
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               members:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of user IDs to be removed from the group
 *     responses:
 *       200:
 *         description: Members removed successfully
 *       400:
 *         description: Invalid input or user ID does not exist
 *       404:
 *         description: Group not found
 *       500:
 *         description: Internal server error
 */
router.post('/:groupId/members/remove', async (req, res) => {
    const { groupId } = req.params;
    const { members } = req.body;

    if (!Array.isArray(members) || members.length === 0) {
        return res.status(400).send('Invalid input. Members should be a non-empty array.');
    }

    try {
        // Check if the group exists
        const groupExists = await redisClient.exists(`group:${groupId}:meta`);
        if (!groupExists) {
            return res.status(404).send('Group not found.');
        }

        // Remove members from the group
        const currentMembers = JSON.parse(await redisClient.hget(`group:${groupId}:meta`, 'members') || '[]');
        const updatedMembers = currentMembers.filter(member => !members.includes(member));

        await redisClient.hset(`group:${groupId}:meta`, 'members', JSON.stringify(updatedMembers));

        res.send('Members removed successfully.');
    } catch (e) {
        console.log(e);
        return res.status(500).send('Error removing members.');
    }
});

module.exports = router;

// Get group details
/**
 * @swagger
 * /groups/{groupId}:
 *   get:
 *     summary: Get details of a group
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: groupId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the group
 *     responses:
 *       200:
 *         description: Group details
 *       404:
 *         description: Group not found
 *       500:
 *         description: Internal server error
 */
router.get('/:groupId', (req, res) => {
    const { groupId } = req.params;

    redisClient.hgetall(`group:${groupId}:meta`, (err, groupMeta) => {
        if (err) return res.status(500).send('Error fetching group details.');
        if (!groupMeta) return res.status(404).send('Group not found.');

        res.json({
            groupId,
            groupName: groupMeta.name,
            members: JSON.parse(groupMeta.members),
        });
    });
});

module.exports = router;
