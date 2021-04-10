import { Request, Response } from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

import { authenticateUser } from './index';
import UserModel from '../user/user.model';

const req = {} as Request;
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

afterEach(jest.clearAllMocks);

describe('authenticateUser', () => {
  afterEach(async () => {
    await mongoose.connection.db.dropDatabase();
  });

  it('should be unauthorized when auth header is missing', async () => {
    req.get = jest.fn().mockReturnValue(null);
    const result = await authenticateUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(result).toEqual({ message: 'Authorization missing.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should be unauthorized when auth header is invalid', async () => {
    req.get = jest.fn().mockReturnValue('fake-token');
    const result = await authenticateUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(result).toEqual({ message: 'Invalid bearer token.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should be unauthorized when user is not found', async () => {
    const model = new UserModel({
      _id: '012345678901234567890124',
      firstName: 'Chandler',
      lastName: 'Bing',
      userName: 'chandlerbing',
      password: 'password123'
    });
    await model.save();
    const token = '012345678901234567890123';
    req.get = jest.fn().mockReturnValue('Bearer ' + token);
    jwt.verify = jest.fn(token => ({ _id: token }));

    const result = await authenticateUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(jwt.verify).toHaveBeenCalledWith(token, undefined);
    expect(result).toEqual({ message: 'User not found.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next when user is authenticated', async () => {
    const token = '012345678901234567890123';
    const model = new UserModel({
      _id: token,
      firstName: 'Chandler',
      lastName: 'Bing',
      userName: 'chandlerbing',
      password: 'password123'
    });
    await model.save();
    req.get = jest.fn().mockReturnValue('Bearer ' + token);
    jwt.verify = jest.fn(token => ({ _id: token }));

    const result = await authenticateUser(req, res, next);

    expect(result).toBeUndefined();
    expect(res.status).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it('should call next with error', async () => {
    req.get = jest.fn(() => {
      throw new Error('Fake error');
    });
    const result = await authenticateUser(req, res, next);

    expect(result).toBeUndefined();
    expect(next).toHaveBeenCalledWith(new Error('Fake error'));
  });
});
