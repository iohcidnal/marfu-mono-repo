import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import userModel from './user-model';

export async function authenticate(payload: IUser): Promise<IUserAuth | null> {
  const user = await userModel.findOne({ userName: payload.userName }).exec();
  if (!user) return null;

  const isPasswordValid = bcrypt.compareSync(payload.password, user.password);
  if (!isPasswordValid) return null;

  const authToken = jwt.sign({ _id: user._id }, process.env.SECRET as string);

  return {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    authToken
  };
}

export async function create(payload: IUser): Promise<IUserBase> {
  const user: IUser = {
    ...payload,
    password: bcrypt.hashSync(payload.password, 8)
  };
  const doc = await userModel.create(user);

  return userModel.toDto(doc);
}
