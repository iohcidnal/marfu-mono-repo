import mongoose from 'mongoose';

const MedicationSchema = new mongoose.Schema(
  {
    medicationName: {
      type: String,
      required: true
    },
    dosage: {
      type: String,
      required: true
    },
    route: {
      type: String,
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: { type: Date },
    frequencies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'frequency'
      }
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'user'
    }
  },
  { timestamps: true }
);

interface IMedicationDocument extends IMedicationDto, mongoose.Document {
  _id: string;
}

interface IMedicationModel extends mongoose.Model<IMedicationDocument> {
  toDto: (doc: IMedicationDocument) => IMedicationDto;
}

MedicationSchema.statics.toDto = function (doc: IMedicationDocument): IMedicationDto {
  return {
    _id: doc._id,
    medicationName: doc.medicationName,
    dosage: doc.dosage,
    route: doc.route,
    startDate: doc.startDate,
    endDate: doc.endDate
  };
};

export default mongoose.model<IMedicationDocument, IMedicationModel>(
  'medication',
  MedicationSchema
);