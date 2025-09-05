const mongoose = require('mongoose');

const MuscleGroupSchema = new mongoose.Schema({
  Abs: Boolean,
  AbsObliques: Boolean,
  AbsStraightAbs: Boolean,
  Arms: Boolean,
  ArmsBiceps: Boolean,
  ArmsTriceps: Boolean,
  ArmsForearms: Boolean,
  Back: Boolean,
  BackLats: Boolean,
  BackUpperback: Boolean,
  BackLowerback: Boolean,
  CardiovascularSystem: Boolean,
  Chest: Boolean,
  ChestUpper: Boolean,
  ChestLower: Boolean,
  Feet: Boolean,
  Neck: Boolean,
  FullBody: Boolean,
  Legs: Boolean,
  LegsAbductor: Boolean,
  LegsAdductor: Boolean,
  LegsQuads: Boolean,
  LegsHamstrings: Boolean,
  LegsCalves: Boolean,
  LegsGlutes: Boolean,
});

const WorkoutSchema = new mongoose.Schema(
  {
    coachId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      default: null,
    },
    name: { type: String, required: true },
    description: String,
    importFromFile: { type: Boolean, default: false },
    visibility: {
      type: String,
      enum: ['Everyone', 'Private'],
      default: 'Everyone',
    },
    intensity: String,
    category: String,
    coverImage: String,
    videoUrl: String,
    images: [String],
    primary_muscle_group: MuscleGroupSchema,
    secondary_muscle_group: MuscleGroupSchema,
    embedding: { type: [Number], index: true },
    fitsocietyId: String,
    popularity: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Workout', WorkoutSchema);
