const express = require('express');
const router = express.Router();
const Node = require('../models/Node');

// POST / - Create a new node
router.post('/', async (req, res) => {
  try {
    const { text, scenario } = req.body;

    if (!text || !scenario) {
      return res.status(400).json({ error: 'Text and scenario are required' });
    }

    const newNode = new Node({
      text,
      scenario
    });

    const savedNode = await newNode.save();
    res.status(201).json(savedNode);
  } catch (error) {
    console.error('Error creating node:', error);
    res.status(500).json({ error: 'Server error while creating node' });
  }
});

// GET /:id - Fetch a single Node by its ID
router.get('/:id', async (req, res) => {
  try {
    const node = await Node.findById(req.params.id);
    if (!node) {
      return res.status(404).json({ error: 'Node not found' });
    }
    res.json(node);
  } catch (error) {
    console.error('Error fetching node:', error);
    res.status(500).json({ error: 'Server error while fetching node' });
  }
});

// POST /:id/choices - Add a new Choice to an existing Node
router.post('/:id/choices', async (req, res) => {
  try {
    const { text, nextNode, probability, effort, reward } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Choice text is required' });
    }

    const node = await Node.findById(req.params.id);
    if (!node) {
      return res.status(404).json({ error: 'Node not found' });
    }

    const newChoice = {
      text,
      nextNode: nextNode || undefined, // undefined avoids casting empty string to ObjectId
      probability: probability !== undefined ? probability : 1,
      effort: effort !== undefined ? effort : 0,
      reward: reward !== undefined ? reward : 0
    };

    node.choices.push(newChoice);
    const updatedNode = await node.save();
    
    res.status(201).json(updatedNode);
  } catch (error) {
    console.error('Error adding choice:', error);
    res.status(500).json({ error: 'Server error while adding choice' });
  }
});

// PUT /:id/choices/:choiceId - Update an existing choice
router.put('/:id/choices/:choiceId', async (req, res) => {
  try {
    const { text, nextNode, probability, effort, reward } = req.body;
    
    const node = await Node.findById(req.params.id);
    if (!node) {
      return res.status(404).json({ error: 'Node not found' });
    }

    const choice = node.choices.id(req.params.choiceId);
    if (!choice) {
      return res.status(404).json({ error: 'Choice not found' });
    }

    // Update fields if provided
    if (text !== undefined) choice.text = text;
    if (nextNode !== undefined) choice.nextNode = nextNode || null; 
    if (probability !== undefined) choice.probability = probability;
    if (effort !== undefined) choice.effort = effort;
    if (reward !== undefined) choice.reward = reward;

    const updatedNode = await node.save();
    res.json(updatedNode);
  } catch (error) {
    console.error('Error updating choice:', error);
    res.status(500).json({ error: 'Server error while updating choice' });
  }
});

module.exports = router;
