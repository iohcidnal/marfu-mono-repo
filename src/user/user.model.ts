import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    userName: {
      type: String,
      unique: true,
      required: true
    },
    password: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

UserSchema.statics.toDto = function (doc: IUserDocument): IUserBase {
  return {
    _id: doc._id,
    firstName: doc.firstName,
    lastName: doc.lastName
  };
};

interface IUserDocument extends IUser, mongoose.Document {
  _id: string;
}
interface IUserModel extends mongoose.Model<IUserDocument> {
  toDto: (doc: IUserDocument | null) => IUserBase;
}

export default mongoose.model<IUserDocument, IUserModel>('user', UserSchema);
