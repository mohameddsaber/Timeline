const express = require('express');
const router = express.Router();
const Scenario = require('../models/Scenario');

// POST / - Create a new scenario
router.post('/', async (req, res) => {
  try {
    const { title, description } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const newScenario = new Scenario({
      title,
      description
    });

    const savedScenario = await newScenario.save();
    res.status(201).json(savedScenario);
  } catch (error) {
    console.error('Error creating scenario:', error);
    res.status(500).json({ error: 'Server error while creating scenario' });
  }
});

module.exports = router;
