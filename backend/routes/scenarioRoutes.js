const express = require('express');
const router = express.Router();
const Scenario = require('../models/Scenario');
const Node = require('../models/Node');

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

// GET / - List all scenarios
router.get('/', async (req, res) => {
  try {
    const scenarios = await Scenario.find().sort({ createdAt: -1 });
    res.json(scenarios);
  } catch (error) {
    console.error('Error fetching scenarios:', error);
    res.status(500).json({ error: 'Server error while fetching scenarios' });
  }
});

// GET /:id - Get a single scenario
router.get('/:id', async (req, res) => {
  try {
    const scenario = await Scenario.findById(req.params.id);
    if (!scenario) return res.status(404).json({ error: 'Scenario not found' });
    res.json(scenario);
  } catch (error) {
    console.error('Error fetching scenario:', error);
    res.status(500).json({ error: 'Server error while fetching scenario' });
  }
});

// GET /:id/nodes - Get all nodes for a scenario
router.get('/:id/nodes', async (req, res) => {
  try {
    const nodes = await Node.find({ scenario: req.params.id });
    res.json(nodes);
  } catch (error) {
    console.error('Error fetching nodes:', error);
    res.status(500).json({ error: 'Server error while fetching nodes' });
  }
});

// PUT /:id - Update a scenario (e.g. to set rootNode)
router.put('/:id', async (req, res) => {
  try {
    const { title, description, rootNode } = req.body;
    
    const scenario = await Scenario.findById(req.params.id);
    if (!scenario) {
      return res.status(404).json({ error: 'Scenario not found' });
    }

    if (title !== undefined) scenario.title = title;
    if (description !== undefined) scenario.description = description;
    if (rootNode !== undefined) scenario.rootNode = rootNode || null;

    const updatedScenario = await scenario.save();
    res.json(updatedScenario);
  } catch (error) {
    console.error('Error updating scenario:', error);
    res.status(500).json({ error: 'Server error while updating scenario' });
  }
});

// GET /:id/best-path - Calculate the best path using DFS
router.get('/:id/best-path', async (req, res) => {
  try {
    const scenarioId = req.params.id;
    
    // 1. Fetch Scenario to get rootNode
    const scenario = await Scenario.findById(scenarioId);
    if (!scenario) {
      return res.status(404).json({ error: 'Scenario not found' });
    }
    
    if (!scenario.rootNode) {
      return res.status(400).json({ error: 'Scenario has no root node assigned' });
    }

    // 2. Fetch all nodes for this scenario
    const nodes = await Node.find({ scenario: scenarioId });
    if (!nodes || nodes.length === 0) {
      return res.status(400).json({ error: 'No nodes found for this scenario' });
    }

    // 3. Build in-memory dictionary for instant lookup
    const nodeMap = {};
    nodes.forEach(node => {
      nodeMap[node._id.toString()] = node;
    });

    let maxScore = -Infinity;
    let bestPath = [];

    // 4. Recursive DFS Function
    const dfs = (currentNodeId, currentPath, currentScore, visited) => {
      // Prevent infinite loops (cycles)
      if (visited.has(currentNodeId)) return;
      
      const node = nodeMap[currentNodeId];
      if (!node) return; // Dead end or invalid node ref

      visited.add(currentNodeId);

      // Check if it's a leaf node (no choices, or choices with no valid nextNode)
      const hasValidChoices = node.choices && node.choices.some(c => c.nextNode);
      
      if (!hasValidChoices) {
        // Leaf node reached, check if we have a new max score
        if (currentScore > maxScore) {
          maxScore = currentScore;
          bestPath = [...currentPath];
        }
      } else {
        // Recurse through valid choices
        for (const choice of node.choices) {
          if (choice.nextNode) {
            const choiceScore = (choice.reward || 0) - (choice.effort || 0);
            const step = {
              nodeText: node.text,
              choiceText: choice.text,
              choiceScore
            };
            
            dfs(
              choice.nextNode.toString(),
              [...currentPath, step],
              currentScore + choiceScore,
              new Set(visited) // Pass a copy of visited to allow diverse branch traversal
            );
          }
        }
      }
    };

    // 5. Start DFS traversal from the root node
    dfs(
      scenario.rootNode.toString(),
      [], // initial path
      0,  // initial score
      new Set() // initial visited set
    );
    
    res.json({
      bestPath,
      maxScore: maxScore === -Infinity ? 0 : maxScore
    });

  } catch (error) {
    console.error('Error calculating best path:', error);
    res.status(500).json({ error: 'Server error while calculating best path' });
  }
});

module.exports = router;
