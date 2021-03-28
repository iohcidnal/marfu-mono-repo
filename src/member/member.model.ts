import mongoose from 'mongoose';
import medicationModel from '../medication/medication.model';
import freqModel from '../medication/frequency.model';

const MemberSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String
    },
    createdBy: { required: true, type: mongoose.Schema.Types.ObjectId, ref: 'user' }
  },
  { timestamps: true }
);

MemberSchema.statics.toDto = function (doc: IMemberDocument): IMemberDto {
  return {
    _id: doc._id,
    firstName: doc.firstName,
    lastName: doc.lastName
  };
};

// Middleware to delete all related frequencies and medications for the member to delete
MemberSchema.pre('findOneAndDelete', async function () {
  const member: IMemberDocument = await this.findOne(this.getQuery()).lean();
  const medications = await medicationModel.find({ memberId: member._id });
  const promises = medications.map(med => freqModel.deleteMany({ medicationId: med._id }));
  await Promise.allSettled(promises);
  await medicationModel.deleteMany({ memberId: member._id });
});

interface IMemberDocument extends IMemberDto, mongoose.Document {
  _id: string;
}

interface IMemberModel extends mongoose.Model<IMemberDocument> {
  toDto: (doc: IMemberDocument | null) => IMemberDto;
}

export default mongoose.model<IMemberDocument, IMemberModel>('member', MemberSchema);
