const mongoose = require('mongoose');

const WorkoutSchema = new mongoose.Schema({
  workoutName: String,
  description: String,
  category: String,
  intensity: String,
  embedding: {
    type: [Number],
    index: true,
  },
});

module.exports = mongoose.model('Workout', WorkoutSchema);
