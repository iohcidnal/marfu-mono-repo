import mongoose from 'mongoose';
import { IFrequencyDto, IMedicationDto } from '@common';
import frequencyModel from './frequency.model';
import frequencyLogModel from '../frequency-log/frequency-log.model';

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

// Middleware to delete all related frequencies and frequency logs for the medication to delete
MedicationSchema.pre('findOneAndDelete', async function () {
  const medication: IMedicationDocument = await this.findOne(this.getFilter()).lean();
  const frequencies = await frequencyModel.find({ medicationId: medication._id }).lean();
  const deleteManyPromises = frequencies.map(freq =>
    frequencyLogModel.deleteMany({ frequencyId: freq._id })
  );

  await Promise.allSettled(deleteManyPromises);
  await frequencyModel.deleteMany({ medicationId: medication._id });
});

export default mongoose.model<IMedicationDocument, IMedicationModel>(
  'medication',
  MedicationSchema
);
