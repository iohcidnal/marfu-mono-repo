import { v4 as createUuid } from 'uuid';
import bcrypt from 'bcryptjs';

import userModel from './user-model';

function userService() {
  async function create(payload: IUser): Promise<IUser> {
    const doc: IUser = {
      ...payload,
      userId: createUuid(),
      password: bcrypt.hashSync(payload.password!, 8)
    };
    const result = await userModel.create(doc);

    return userModel.toDto(result);
  }

  async function getByUserId(userId: string): Promise<IUser> {
    const doc = await userModel.findOne({ userId }).exec();
    const result = userModel.toDto(doc);

    return result;
  }

  return { create, getByUserId };
}

export default userService();
