import { Request, Response } from 'express';
import mongoose from 'mongoose';

import { validateUser } from './index';

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

afterEach(async () => {
  jest.clearAllMocks();
  await mongoose.connection.db.dropDatabase();
});

describe('validateUser', () => {
  it('should fail when token is missing', async () => {
    req.headers = {};
    const result = await validateUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(result).toEqual({ message: 'Token is missing.' });
  });

  it.todo('test other lines');
});
