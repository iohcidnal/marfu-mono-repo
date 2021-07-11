import mongoose from 'mongoose';
import { IFrequencyDto, IMedicationDto } from '@common';

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
      type: String,
      required: true
    },
    endDate: {
      type: String,
      required: true
    },
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
  toDto: (doc: IMedicationDocument, frequenciesDto: IFrequencyDto[]) => IMedicationDto;
}

/* istanbul ignore next */
MedicationSchema.statics.toDto = function (
  doc: IMedicationDocument,
  frequenciesDto: IFrequencyDto[]
): IMedicationDto {
  return {
    _id: doc._id,
    memberId: doc.memberId,
    medicationName: doc.medicationName,
    dosage: doc.dosage,
    route: doc.route,
    note: doc.note,
    startDate: doc.startDate,
    endDate: doc.endDate,
    frequencies: frequenciesDto,
    createdBy: doc.createdBy
  };
};

export default mongoose.model<IMedicationDocument, IMedicationModel>(
  'medication',
  MedicationSchema
);
