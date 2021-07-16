import mongoose from 'mongoose';
import { IFrequencyLogDto } from '@common';

const FrequencyLogSchema = new mongoose.Schema(
  {
    frequencyId: {
      required: true,
      type: mongoose.Schema.Types.ObjectId
    },
    administeredDate: {
      type: String,
      required: true
    },
    administeredTime: {
      type: String,
      required: true
    },
    note: {
      type: String
    },
    administeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'user'
    }
  },
  { timestamps: true }
);

interface IFrequencyLogDocument extends IFrequencyLogDto, mongoose.Document {
  _id: string;
}

interface IFrequencyModel extends mongoose.Model<IFrequencyLogDocument> {
  toDto: (doc: IFrequencyLogDocument) => IFrequencyLogDto;
}

FrequencyLogSchema.statics.toDto = function (doc: IFrequencyLogDocument): IFrequencyLogDto {
  return {
    _id: doc._id,
    frequencyId: doc.frequencyId,
    administeredDate: doc.administeredDate,
    administeredTime: doc.administeredTime,
    note: doc.note,
    administeredBy: doc.administeredBy
  };
};

export default mongoose.model<IFrequencyLogDocument, IFrequencyModel>(
  'frequency-log',
  FrequencyLogSchema
);
