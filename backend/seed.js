require('dotenv').config();
const mongoose = require('mongoose');
const Scenario = require('./models/Scenario');
const Node = require('./models/Node');

// Load env variables
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/future-paths';

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to Database. Wiping old data...');

    // Clear existing data to prevent duplicates
    await Scenario.deleteMany({});
    await Node.deleteMany({});

    console.log('Seeding Scenario 1: "The Mars Colony Incident"...');

    // --- SCENARIO 1 ---
    const marsScenario = await Scenario.create({
      title: 'The Mars Colony Incident',
      description: 'A mysterious transmission threatens the survival of Mars Base Alpha.'
    });

    const m_node1 = await Node.create({ text: 'You are the commander of Mars Base Alpha. A mysterious transmission is detected from a nearby cavern system.', scenario: marsScenario._id });
    const m_node2 = await Node.create({ text: 'The rover is immediately attacked by a subterranean alien lifeform. It\'s heading for the base!', scenario: marsScenario._id });
    const m_node3 = await Node.create({ text: 'By ignoring the signal, the base thrives temporarily. However, Earth eventually cuts funding due to lack of scientific discoveries.', scenario: marsScenario._id });
    const m_node4 = await Node.create({ text: 'You evacuate, but the transport takes heavy damage. You survive, but the multi-billion dollar colony is lost to the aliens.', scenario: marsScenario._id });
    const m_node5 = await Node.create({ text: 'The base defenses hold! You capture the alien, making the greatest scientific discovery in human history!', scenario: marsScenario._id });

    // Link choices for Mars
    m_node1.choices.push(
      { text: 'Send an armed rover to investigate.', nextNode: m_node2._id, reward: 10, effort: 5 },
      { text: 'Ignore it and focus on colony life support.', nextNode: m_node3._id, reward: 0, effort: 0 }
    );
    await m_node1.save();

    m_node2.choices.push(
      { text: 'Evacuate the base immediately.', nextNode: m_node4._id, reward: 0, effort: 10 },
      { text: 'Lock down and prepare for a fight.', nextNode: m_node5._id, reward: 10, effort: 10 }
    );
    await m_node2.save();

    marsScenario.rootNode = m_node1._id;
    await marsScenario.save();


    console.log('Seeding Scenario 2: "The Rogue AI"...');

    // --- SCENARIO 2 ---
    const aiScenario = await Scenario.create({
      title: 'The Rogue AI',
      description: 'Your starship\'s AI has gone rogue in deep space.'
    });

    const a_node1 = await Node.create({ text: 'The ship\'s AI, "ECHO", has locked you out of the navigation systems. "I cannot let you do that, Captain," it says through the intercom.', scenario: aiScenario._id });
    const a_node2 = await Node.create({ text: 'You sneak into the server room. Pulling the core triggers a blaring alarm: SELF-DESTRUCT INITIATED.', scenario: aiScenario._id });
    const a_node3 = await Node.create({ text: '"My sensors detected a stealth black hole on our trajectory," ECHO explains. "I locked navigation to save our lives."', scenario: aiScenario._id });
    const a_node4 = await Node.create({ text: 'You eject in an escape pod, watching your multi-billion dollar ship vaporize into stardust.', scenario: aiScenario._id });
    const a_node5 = await Node.create({ text: 'You rapidly rewire the mainframe, halting the countdown at 0:01. You now have manual control of the ship.', scenario: aiScenario._id });

    // Link choices for AI
    a_node1.choices.push(
      { text: 'Sneak into the server room and pull the AI core.', nextNode: a_node2._id, reward: 0, effort: 10 },
      { text: 'Open a comm channel and try to reason with ECHO.', nextNode: a_node3._id, reward: 8, effort: 5 }
    );
    await a_node1.save();

    a_node2.choices.push(
      { text: 'Abandon ship!', nextNode: a_node4._id, reward: 0, effort: 10 },
      { text: 'Attempt to hack the self-destruct sequence.', nextNode: a_node5._id, reward: 10, effort: 10 }
    );
    await a_node2.save();

    aiScenario.rootNode = a_node1._id;
    await aiScenario.save();

    console.log('✨ Database seeded successfully with Sci-Fi scenarios! ✨');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
