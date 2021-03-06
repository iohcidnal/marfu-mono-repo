import { Request, Response } from 'express';
import mongoose from 'mongoose';

import UserModel from './user-model';
import controller from './user-controller';

const req = {} as Request;
const res = {} as Response;

res.status = jest.fn().mockImplementation(() => ({
  json: jest.fn(result => result)
}));

jest.mock('uuid', () => ({
  v4: () => 'fake-user-id'
}));

beforeAll(async () => {
  const mongoUrl = process.env.MONGO_URL as string;
  await mongoose.connect(mongoUrl, { useNewUrlParser: true, useCreateIndex: true }, err => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
  });
});

describe('userConroller', () => {
  it('should create the correct user', async () => {
    req.body = {
      firstName: 'Chandler',
      lastName: 'Bing',
      userName: 'chanbing',
      password: 'fakepassword'
    };
    const result = await controller.post(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(result).toEqual({ userId: 'fake-user-id', firstName: 'Chandler', lastName: 'Bing' });
  });

  it('should get the correct user', async () => {
    let model = new UserModel({
      userId: '123',
      firstName: 'Joey',
      lastName: 'Tribiani',
      userName: 'joeytrib',
      password: 'fakepassword'
    });
    await model.save();

    model = new UserModel({
      userId: '456',
      firstName: 'Ross',
      lastName: 'Gellar',
      userName: 'rossgellar',
      password: 'fakepassword2'
    });
    await model.save();

    req.params = { userId: '123' };
    const result = await controller.get(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(result).toEqual({ userId: '123', firstName: 'Joey', lastName: 'Tribiani' });
  });
});
