import { Request, Response } from 'express';
import mongoose from 'mongoose';

import * as controller from './member.controller';
import memberModel from './member.model';
import userModel from '../user/user.model';

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
  mongoose.connection.close();
});

afterEach(async () => {
  jest.clearAllMocks();
  await mongoose.connection.db.dropDatabase();
});

describe('member', () => {
  it('should POST', async () => {
    req.body = {
      firstName: 'Joey',
      lastName: 'Tribiani',
      createdBy: new mongoose.Types.ObjectId('012345678901234567890123')
    };
    const result = await controller.post(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(result).toEqual(expect.objectContaining({ firstName: 'Joey', lastName: 'Tribiani' }));
  });

  it('POST should call next with error', async () => {
    memberModel.create = jest.fn(() => {
      throw new Error('Fake error');
    });

    const result = await controller.post(req, res, next);

    expect(res.status).not.toHaveBeenCalled();
    expect(result).toBeUndefined();
    expect(next).toHaveBeenCalledWith(expect.objectContaining(new Error()));
  });

  it('should get all members', async () => {
    const createdByModel = new userModel({
      _id: new mongoose.Types.ObjectId('012345678901234567890123'),
      firstName: 'Ross',
      lastName: 'Gellar',
      userName: 'rossgellar',
      password: 'fakepassword2'
    });
    await createdByModel.save();

    let model = new memberModel({
      firstName: 'Joey',
      lastName: 'Tribiani',
      createdBy: new mongoose.Types.ObjectId('012345678901234567890123')
    });
    await model.save();

    model = new memberModel({
      firstName: 'Chandler',
      lastName: 'Bing',
      createdBy: new mongoose.Types.ObjectId('012345678901234567890123')
    });
    await model.save();

    const result = await controller.get(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(result).toHaveLength(2);
  });

  it('should call next with error', async () => {
    memberModel.find = jest.fn(() => {
      throw new Error('Fake error');
    });

    const result = await controller.get(req, res, next);

    expect(res.status).not.toHaveBeenCalled();
    expect(result).toBeUndefined();
    expect(next).toHaveBeenCalledWith(expect.objectContaining(new Error()));
  });
});
