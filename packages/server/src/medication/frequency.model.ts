import mongoose from 'mongoose';

// Frequency schema's _id will be stored in the medication logs
const FrequencySchema = new mongoose.Schema({
  medicationId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  time: {
    type: mongoose.Schema.Types.String,
    required: true
  }
});

export default mongoose.model('frequency', FrequencySchema);
