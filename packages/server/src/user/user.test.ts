import { Request, Response } from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

import userModel from './user.model';
import * as controller from './user.controller';
import { validateNewUser } from './user.middlewares';

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

describe('user', () => {
  const newUser = {
    _id: mongoose.Types.ObjectId().toHexString(),
    firstName: 'Chandler',
    lastName: 'Bing',
    userName: 'chanbing',
    password: 'fakepassword',
    confirmPassword: 'fakepassword',
    pin1: '1',
    pin2: '2',
    pin3: '3',
    pin4: '4',
    pin5: '5',
    pin6: '6'
  };
  beforeAll(() => {
    global.process.env.INVITE_KEY = '123456';
  });

  it('should create the correct user', async () => {
    req.body = newUser;
    const result = await controller.post(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    // Just returning a string. In real world, return created resource instead.
    expect(result).toBe('REGISTERED');
  });

  it('should fail when username already exists', async () => {
    req.body = newUser;
    const result = await controller.post(req, res, next);

    expect(next).toHaveBeenCalledWith(Error('Username already exists. Please select a new one.'));
    expect(result).toBeUndefined();
  });

  it('should fail when invitation code is not valid', async () => {
    req.body = {
      _id: mongoose.Types.ObjectId().toHexString(),
      firstName: 'Ross',
      lastName: 'Gellar',
      userName: 'rossgellar',
      password: 'fakepassword',
      confirmPassword: 'fakepassword',
      pin1: '1',
      pin2: '2',
      pin3: '3',
      pin4: '4',
      pin5: '5',
      pin6: '5'
    };
    const result = await controller.post(req, res, next);

    expect(next).toHaveBeenCalledWith(
      Error('Invitation code is not valid. Please contact your system administrator.')
    );
    expect(result).toBeUndefined();
  });

  describe('authenticate', () => {
    beforeAll(async () => {
      process.env.SECRET = 'fake-secret';
      let model = new userModel({
        firstName: 'Joey',
        lastName: 'Tribiani',
        userName: 'joeytrib',
        password: 'fakepassword'
      });
      await model.save();
      model = new userModel({
        firstName: 'Ross',
        lastName: 'Gellar',
        userName: 'rossgellar',
        password: 'fakepassword2'
      });
      await model.save();
    });

    it('should get the correct user', async () => {
      bcrypt.compareSync = jest.fn(() => true);

      req.body = { userName: 'rossgellar', password: 'fakepassword2' };
      const result = await controller.authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(result).toBeTruthy();
    });

    it("should return 404 when userName doesn't match", async () => {
      req.body = { userName: 'rossgellar123', password: 'fakepassword' };
      const result = await controller.authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(result).toEqual({ message: 'Username or password do not match.' });
    });

    it("should return 404 when password doesn't match", async () => {
      bcrypt.compareSync = jest.fn().mockReturnValue(false);
      req.body = { userName: 'rossgellar', password: 'fakepassword123' };
      const result = await controller.authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(result).toEqual({ message: 'Username or password do not match.' });
    });

    it('should call next with error', async () => {
      req.body = null;
      const result = await controller.authenticate(req, res, next);

      expect(next).toHaveBeenCalledWith(new Error("Cannot read property 'userName' of null"));
      expect(result).toBeUndefined();
    });
  });

  it('should update user', async () => {
    await mongoose.connection.db.dropDatabase();
    bcrypt.hashSync = jest.fn(password => `hash-${password}`);
    const model = new userModel({
      firstName: 'Joey',
      lastName: 'Tribiani',
      userName: 'joeytrib',
      password: 'fakepassword'
    });
    const user = await model.save();

    req.body = {
      _id: user._id,
      firstName: 'Joey2',
      password: 'fakepassword2'
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await controller.put(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(result.firstName).toBe('Joey2');
    expect(result.lastName).toBe('Tribiani');
    expect(result.password).toBe('hash-fakepassword2');
  });

  it('should call next with error', async () => {
    userModel.findByIdAndUpdate = jest.fn(() => {
      throw new Error('Fake error');
    });
    const result = await controller.put(req, res, next);

    expect(res.status).not.toHaveBeenCalled();
    expect(result).toBeUndefined();
    expect(next).toHaveBeenCalledWith(expect.objectContaining(new Error()));
  });
});

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
