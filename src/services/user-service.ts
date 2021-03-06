import { v4 as createUuid } from 'uuid';
import { userModel } from '../models';

function userService() {
  async function create(payload: IUser): Promise<IUser> {
    const doc: IUser = { ...payload, userId: createUuid() };
    const result = await userModel.create(doc);

    return userModel.toDto(result);
  }

  async function get(userId: string): Promise<IUser> {
    const doc = await userModel.findOne({ userId }).exec();
    const result = userModel.toDto(doc);

    return result;
  }

  return { create, get };
}

export default userService();
