import { Request, Response } from 'express';
import mongoose from 'mongoose';

import { validateUser } from './index';
import UserModel from '../user/user.model';

interface IReq extends Request {
  session: any;
  _id: string;
}

const req = {} as IReq;
const res = {} as Response;
const next = jest.fn();

res.status = jest.fn().mockImplementation(() => ({
  json: jest.fn(result => result)
}));

beforeAll(async () => {
  const mongoUrl = process.env.MONGO_URL as string;
  await mongoose.connect(mongoUrl, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true
  });
});

afterAll(() => {
  // Close mongoose connection for Jest to exit properly
  mongoose.connection.close();
});

afterEach(async () => {
  jest.clearAllMocks();
  await mongoose.connection.db.dropDatabase();
});

describe('validateUser', () => {
  const user = {
    _id: '012345678901234567890124',
    firstName: 'Chandler',
    lastName: 'Bing',
    userName: 'chandlerbing',
    password: 'password123'
  };

  it('should be unauthorized when user is not found', async () => {
    const model = new UserModel(user);
    await model.save();
    req.session = {
      user: { _id: 'abc345678901234567890124' }
    };

    const result = await validateUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(result).toEqual({ message: 'User not found.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should set req._id when user is found', async () => {
    const model = new UserModel(user);
    await model.save();
    req.session = {
      user: { _id: user._id }
    };

    await validateUser(req, res, next);

    expect(req._id).toBe(user._id);
    expect(next).toHaveBeenCalled();
  });

  it('should be unauthorized when user is undefined', async () => {
    req.session = { user: undefined };
    const result = await validateUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(result).toEqual({ message: 'User not authenticated.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next with error', async () => {
    UserModel.findById = jest.fn(() => {
      throw new Error('Fake error');
    });
    req.session = {
      user: { _id: 'abc345678901234567890124' }
    };
    const result = await validateUser(req, res, next);

    expect(result).toBeUndefined();
    expect(next).toHaveBeenCalledWith(new Error('Fake error'));
  });
});
