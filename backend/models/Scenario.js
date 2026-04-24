const mongoose = require('mongoose');

const scenarioSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  rootNode: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Node',
  },
}, { timestamps: true });

module.exports = mongoose.model('Scenario', scenarioSchema);
