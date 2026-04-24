const mongoose = require('mongoose');

const choiceSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  nextNode: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Node',
  },
  probability: {
    type: Number,
    min: 0,
    max: 1,
    default: 1,
  },
  effort: {
    type: Number,
    min: 0,
    max: 10,
    default: 0,
  },
  reward: {
    type: Number,
    min: 0,
    max: 10,
    default: 0,
  },
});

const nodeSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  scenario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scenario',
    required: true,
  },
  choices: [choiceSchema],
}, { timestamps: true });

module.exports = mongoose.model('Node', nodeSchema);
