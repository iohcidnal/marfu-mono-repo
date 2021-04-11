import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { IUserAuthDto, IUserDto, IUserBase } from '@common';
import model from './user.model';

export async function authenticate(payload: IUserDto): Promise<IUserAuthDto | null> {
  const user = await model.findOne({ userName: payload.userName }).lean();
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

export async function create(payload: IUserDto): Promise<IUserBase> {
  const user: IUserDto = {
    ...payload,
    password: bcrypt.hashSync(payload.password, 8)
  };
  const doc = await model.create(user);

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
