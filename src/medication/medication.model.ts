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
    frequency: [{ type: Date, required: true }],
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    createdBy: { required: true, type: mongoose.Schema.Types.ObjectId, ref: 'user' }
  },
  { timestamps: true }
);

interface IMedicationDocument extends IMedication, mongoose.Document {
  _id: string;
}

interface IMedicationModel extends mongoose.Model<IMedicationDocument> {
  toDto: (doc: IMedicationDocument) => IMedication;
}

MedicationSchema.statics.toDto = function (doc: IMedicationDocument): IMedication {
  return {
    _id: doc._id,
    medicationName: doc.medicationName,
    dosage: doc.dosage,
    route: doc.route,
    frequency: doc.frequency,
    startDate: doc.startDate,
    endDate: doc.endDate,
    status: medicationStatus.NEW
  };
};

export default mongoose.model<IMedicationDocument, IMedicationModel>(
  'medication',
  MedicationSchema
);
