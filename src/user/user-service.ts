import { v4 as createUuid } from 'uuid';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import userModel from './user-model';

function userService() {
  async function authenticate(payload: IUser): Promise<IUserAuth | null> {
    const user = await userModel.findOne({ userName: payload.userName });
    if (!user) return null;

    const isPasswordValid = bcrypt.compareSync(payload.password, user.password);
    if (!isPasswordValid) return null;

    const authToken = jwt.sign({ id: user.userId }, process.env.SECRET as string, {
      expiresIn: 86400 // 24 hours
    });

    console.log('authToken :>> ', authToken);

    return {
      userId: user.userId,
      firstName: user.firstName,
      lastName: user.lastName,
      authToken
    };
  }

  async function create(payload: IUser): Promise<IUserBase> {
    const user: IUser = {
      ...payload,
      userId: createUuid(),
      password: bcrypt.hashSync(payload.password, 8)
    };
    const doc = await userModel.create(user);

    return userModel.toDto(doc);
  }

  return {
    authenticate,
    create
  };
}

export default userService();
