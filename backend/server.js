const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const { pipeline } = require('@xenova/transformers');
const Workout = require('./Workout');

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// --- MongoDB connection ---
mongoose
  .connect(
    'mongodb+srv://Jochem:AHcHbj2$@new-workout-demo.6lbaoup.mongodb.net/',
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error(err));

// --- Helper: Generate Embedding (Node.js native) ---
let extractor;
async function getExtractor() {
  if (!extractor) {
    extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return extractor;
}

async function getEmbedding(text) {
  try {
    const extractor = await getExtractor();
    const result = await extractor(text, {
      pooling: 'mean',
      normalize: true,
    });
    return Array.from(result.data);
  } catch (error) {
    console.error('Embedding generation failed:', error);
    throw new Error('Failed to generate embedding.');
  }
}

// --- Route: Add a workout (stores embedding) ---
app.post('/workouts/add', async (req, res) => {
  try {
    const { workoutName, description, category, intensity } = req.body;
    const inputText = `${workoutName}. ${description}`;

    // Generate the embedding from the input text
    const embedding = await getEmbedding(inputText);

    // Create a new workout document with all the fields and the embedding
    const workout = new Workout({
      workoutName,
      description,
      category,
      intensity,
      embedding,
    });

    await workout.save();
    res.json({ message: '✅ Workout saved', workout });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to save workout.' });
  }
});

// --- Route: Check for duplicates ---
app.post('/workouts/check', async (req, res) => {
  try {
    const { workoutName, description, category, intensity } = req.body;
    const inputText = `${workoutName}. ${description}. Category: ${category}. Intensity: ${intensity}.`;

    // 1. Create embedding for new workout
    const newEmbedding = await getEmbedding(inputText);

    // 2. Search for nearest matches in MongoDB
    const results = await Workout.aggregate([
      {
        $vectorSearch: {
          queryVector: newEmbedding,
          path: 'embedding',
          numCandidates: 10,
          limit: 1,
          index: 'workout_vector_index',
        },
      },
      {
        $project: {
          _id: 1,
          workoutName: 1,
          description: 1,
          category: 1,
          intensity: 1,
          _score: { $meta: 'vectorSearchScore' }, // <-- This line gets the score
        },
      },
    ]);

    // Check if a match was found and log the score
    if (results.length > 0) {
      const bestMatch = results[0];
      const similarityScore = bestMatch._score;

      // Log the score for debugging
      console.log(`Found a match with similarity score: ${similarityScore}`);

      if (similarityScore > 0.85) {
        // Check against the threshold
        return res.json({
          isDuplicate: true,
          message: '⚠️ Possible duplicate workout found!',
          matchedWith: {
            id: bestMatch._id,
            workoutName: bestMatch.workoutName,
            description: bestMatch.description,
            category: bestMatch.category,
            similarity: similarityScore,
          },
        });
      }
    }

    return res.json({
      isDuplicate: false,
      message: '✅ No duplicate found.',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});
// --- Route: Get all workouts ---
app.get('/workouts', async (req, res) => {
  try {
    const workouts = await Workout.find().select('-embedding'); // exclude large vectors
    res.json(workouts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.listen(5000, () => console.log('🚀 Server running on port 5000'));
