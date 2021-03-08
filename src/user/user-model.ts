import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      unique: true,
      required: true
    },
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
    userId: doc.userId,
    firstName: doc.firstName,
    lastName: doc.lastName
  };
};

interface IUserDocument extends IUser, mongoose.Document {}
interface IUserModel extends mongoose.Model<IUserDocument> {
  toDto: (doc: IUserDocument | null) => IUserBase;
}

export default mongoose.model<IUserDocument, IUserModel>('user', UserSchema);
