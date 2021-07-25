import bcrypt from 'bcryptjs';

import { IUserDto, IUserBase, INewUserDto } from '@common';
import model from './user.model';

export async function authenticate(payload: IUserDto): Promise<IUserBase | null> {
  const user = await model.findOne({ userName: payload.userName }).lean();
  if (!user) return null;

  const isPasswordValid = bcrypt.compareSync(payload.password, user.password);
  if (!isPasswordValid) return null;

  return {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName
  };
}

export async function create(payload: INewUserDto): Promise<IUserBase> {
  // Check if email already exists
  const user = await model.findOne({ userName: payload.userName }).lean();
  if (user) {
    throw new Error('Username already exists. Please select a new one.');
  }
  // Check if invitation code is valid
  const { pin1, pin2, pin3, pin4, pin5, pin6, ...otherProps } = payload;
  const inviteKey = `${pin1}${pin2}${pin3}${pin4}${pin5}${pin6}`;
  if (inviteKey !== (process.env.INVITE_KEY as string)) {
    throw new Error('Invitation code is not valid. Please contact your system administrator.');
  }

  const newUser: IUserDto = {
    ...otherProps,
    password: bcrypt.hashSync(payload.password, 8)
  };
  const doc = await model.create(newUser);

  return model.toDto(doc);
}

export async function update(payload: IUserDto): Promise<IUserBase | null> {
  const user: IUserDto = {
    ...payload,
    password: bcrypt.hashSync(payload.password, 8)
  };
  const doc = await model.findByIdAndUpdate(payload._id, user, { new: true, lean: true });

  return doc;
}
