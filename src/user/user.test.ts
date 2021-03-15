import { Request, Response } from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import UserModel from './user.model';
import * as controller from './user.controller';
import { validateNewUser, authenticateUser } from './user.middlewares';

const req = {} as Request;
const res = {} as Response;
const next = jest.fn();

res.status = jest.fn().mockImplementation(() => ({
  json: jest.fn(result => result)
}));

beforeAll(async () => {
  const mongoUrl = process.env.MONGO_URL as string;
  await mongoose.connect(
    mongoUrl,
    { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true },
    err => {
      if (err) {
        console.error(err);
        process.exit(1);
      }
    }
  );
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
      bcrypt.compareSync = jest.fn(() => true);
      jwt.sign = jest.fn(() => 'fake-jwt');

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

    it("should return 404 when userName doesn't match", async () => {
      req.body = { userName: 'rossgellar123', password: 'fakepassword' };
      const result = await controller.authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(result).toEqual({ message: 'User name or password do not match.' });
    });

    it("should return 404 when password doesn't match", async () => {
      bcrypt.compareSync = jest.fn().mockReturnValue(false);
      req.body = { userName: 'rossgellar', password: 'fakepassword123' };
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
});
