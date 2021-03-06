import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      unique: true,
      required: true
    },
    firstName: String,
    lastName: String,
    userName: {
      type: String,
      unique: true,
      required: true
    },
    password: String
  },
  { timestamps: true }
);

UserSchema.statics.toDto = function (doc: IUserDocument) {
  const dto: IUser = {
    userId: doc.userId,
    firstName: doc.firstName,
    lastName: doc.lastName
  };
  return dto;
};

interface IUserDocument extends IUser, mongoose.Document {}
interface IUserModel extends mongoose.Model<IUserDocument> {
  toDto: (doc: IUserDocument | null) => IUser;
}

export default mongoose.model<IUserDocument, IUserModel>('user', UserSchema);
