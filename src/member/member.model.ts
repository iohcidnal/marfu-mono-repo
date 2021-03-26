import mongoose from 'mongoose';

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

interface IMemberDocument extends IMemberDto, mongoose.Document {
  _id: string;
}
interface IMemberModel extends mongoose.Model<IMemberDocument> {
  toDto: (doc: IMemberDocument | null) => IMemberDto;
}

export default mongoose.model<IMemberDocument, IMemberModel>('member', MemberSchema);