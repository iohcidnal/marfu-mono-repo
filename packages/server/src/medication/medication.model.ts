import mongoose from 'mongoose';
import { IMedicationDto } from '@common';

const MedicationSchema = new mongoose.Schema(
  {
    memberId: {
      type: String,
      required: true
    },
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
    note: {
      type: String,
      required: false
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

/* istanbul ignore next */
MedicationSchema.statics.toDto = function (doc: IMedicationDocument): IMedicationDto {
  return {
    _id: doc._id,
    memberId: doc.memberId,
    medicationName: doc.medicationName,
    dosage: doc.dosage,
    route: doc.route,
    note: doc.note,
    startDate: doc.startDate,
    endDate: doc.endDate,
    createdBy: doc.createdBy
  };
};

export default mongoose.model<IMedicationDocument, IMedicationModel>(
  'medication',
  MedicationSchema
);
