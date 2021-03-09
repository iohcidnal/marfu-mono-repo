import { Request, Response } from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import UserModel from './user-model';
import controller from './user-controller';
import { validateNewUser } from './user-middlewares';

const req = {} as Request;
const res = {} as Response;
const next = jest.fn();

res.status = jest.fn().mockImplementation(() => ({
  json: jest.fn(result => result)
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

afterAll(() => {
  // Close mongoose connection for Jest to exit properly
  mongoose.connection.close();
});

afterEach(jest.clearAllMocks);

describe('userConroller', () => {
  it('should create the correct user', async () => {
    req.body = {
      firstName: 'Chandler',
      lastName: 'Bing',
      userName: 'chanbing',
      password: 'fakepassword'
    };
    const result = await controller.post(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(result).toEqual(expect.objectContaining({ firstName: 'Chandler', lastName: 'Bing' }));
  });

  it('should fail validation', async () => {
    req.body = { userName: 'chanbing', password: 'fakepassword' };
    const result = await controller.post(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ _message: 'user validation failed' })
    );
    expect(result).toBeUndefined();
  });

  describe('authenticate', () => {
    beforeAll(async () => {
      let model = new UserModel({
        firstName: 'Joey',
        lastName: 'Tribiani',
        userName: 'joeytrib',
        password: 'fakepassword'
      });
      await model.save();

      model = new UserModel({
        firstName: 'Ross',
        lastName: 'Gellar',
        userName: 'rossgellar',
        password: 'fakepassword2'
      });
      await model.save();
    });

    it('should get the correct user', async () => {
      jest.spyOn(bcrypt, 'compareSync').mockImplementation(() => true);
      jest.spyOn(jwt, 'sign').mockImplementation(() => 'fake-jwt');

      req.body = { userName: 'rossgellar', password: 'fakepassword2' };
      const result = await controller.authenticate(req, res, next);

      expect(result).toEqual(
        expect.objectContaining({
          firstName: 'Ross',
          lastName: 'Gellar',
          authToken: 'fake-jwt'
        })
      );
    });

    it("should return 404 when password doesn't match", async () => {
      jest.spyOn(bcrypt, 'compareSync').mockImplementation(() => false);

      req.body = { userName: 'rossgellar', password: 'fakepassword123' };
      const result = await controller.authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(result).toEqual({ message: 'User name or password do not match.' });
    });

    it("should return 404 when userName doesn't match", async () => {
      jest.spyOn(bcrypt, 'compareSync').mockImplementation(() => false);

      req.body = { userName: 'rossgellar123', password: 'fakepassword' };
      const result = await controller.authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(result).toEqual({ message: 'User name or password do not match.' });
    });

    it('should call next with error', async () => {
      req.body = null;
      const result = await controller.authenticate(req, res, next);

      expect(next).toHaveBeenCalledWith(new Error("Cannot read property 'userName' of null"));
      expect(result).toBeUndefined();
    });
  });
});

describe('user middlewares', () => {
  describe('validateNewUser', () => {
    it('should fail when username is missing', () => {
      req.body = { firstName: 'Joey', lastName: 'Tribiani', password: 'password!' };
      validateNewUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });

    it('should fail when password is missing', () => {
      req.body = { firstName: 'Joey', lastName: 'Tribiani', userName: 'joeytrib' };
      validateNewUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next', () => {
      req.body = {
        firstName: 'Chandler',
        lastName: 'Bing',
        userName: 'chanbing',
        password: 'fakepassword'
      };
      validateNewUser(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });
});
