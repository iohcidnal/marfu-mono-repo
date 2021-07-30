import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { IUserDto, IUserBase, INewUserDto, signInMode } from '@common';
import model from './user.model';

export async function authenticate(payload: IUserDto): Promise<string | null> {
  const user = await model.findOne({ userName: payload.userName }).lean();
  if (!user) return null;

  const isPasswordValid = bcrypt.compareSync(payload.password, user.password);
  if (!isPasswordValid) return null;

  const token = jwt.sign(
    { userId: user._id, firsName: user.firstName, lastName: user.lastName },
    process.env.SECRET as string,
    { expiresIn: '14 days' }
  );

  return token;
}

export async function create(payload: INewUserDto): Promise<signInMode> {
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
  await model.create(newUser);

  return 'REGISTERED';
}

export async function update(payload: IUserDto): Promise<IUserBase | null> {
  const user: IUserDto = {
    ...payload,
    password: bcrypt.hashSync(payload.password, 8)
  };
  const doc = await model.findByIdAndUpdate(payload._id, user, { new: true, lean: true });

  return doc;
}
