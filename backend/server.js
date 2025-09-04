require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const axios = require('axios');
const { getEmbedding } = require('./embeddingService');
const Workout = require('./models/Workout');
const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- Route: Add a workout ---
app.post('/workouts/add', async (req, res) => {
  try {
    const { workoutName, description, category, intensity } = req.body;
    const inputText = `${workoutName}. ${description}. Category: ${category}. Intensity: ${intensity}.`;
    const embedding = await getEmbedding(inputText);

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
    const newEmbedding = await getEmbedding(inputText);

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
          _score: { $meta: 'vectorSearchScore' },
        },
      },
    ]);

    if (results.length > 0) {
      const bestMatch = results[0];
      const similarityScore = bestMatch._score;

      if (similarityScore > 0.85) {
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

    res.json({
      isDuplicate: false,
      message: '✅ No duplicate found.',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// --- Route: Check for typos and grammar ---
app.post('/workouts/lint', async (req, res) => {
  const { description } = req.body;
  if (!description) {
    return res.status(400).json({ message: 'Description is required.' });
  }

  try {
    const languageToolRes = await axios.post(
      'https://api.languagetoolplus.com/v2/check',
      `text=${encodeURIComponent(description)}&language=en-US`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    res.json(languageToolRes.data.matches);
  } catch (err) {
    console.error('LanguageTool API Error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to check for typos.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));