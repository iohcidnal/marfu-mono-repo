import { Request, Response } from 'express';
import mongoose from 'mongoose';

import * as controller from './member.controller';
import memberModel from './member.model';
import userModel from '../user/user.model';
import medicationModel from '../medication/medication.model';
import freqModel from '../medication/frequency.model';

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

// TODO: Group tests together by verb to make it more clear.

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

    const result = await controller.getAll(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(result).toHaveLength(2);
  });

  it('should call next with error', async () => {
    memberModel.find = jest.fn(() => {
      throw new Error('Fake error');
    });

    const result = await controller.getAll(req, res, next);

    expect(res.status).not.toHaveBeenCalled();
    expect(result).toBeUndefined();
    expect(next).toHaveBeenCalledWith(expect.objectContaining(new Error()));
  });

  describe('get by id', () => {
    it('should return the correct member', async () => {
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
      // ID that we will be looking for
      req.params = {
        id: model._id
      };

      model = new memberModel({
        firstName: 'Chandler',
        lastName: 'Bing',
        createdBy: new mongoose.Types.ObjectId('012345678901234567890123')
      });
      await model.save();

      const result = await controller.getById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(result).toMatchObject(
        expect.objectContaining({
          firstName: 'Joey',
          lastName: 'Tribiani',
          createdBy: new mongoose.Types.ObjectId('012345678901234567890123')
        })
      );
    });
  });

  it('should update', async () => {
    const createdByModel = new userModel({
      _id: new mongoose.Types.ObjectId('012345678901234567890123'),
      firstName: 'Ross',
      lastName: 'Gellar',
      userName: 'rossgellar',
      password: 'fakepassword2'
    });
    await createdByModel.save();

    const model = new memberModel({
      firstName: 'Joey',
      lastName: 'Tribiani',
      createdBy: new mongoose.Types.ObjectId('012345678901234567890123')
    });
    await model.save();

    req.body = {
      _id: model._id,
      firstName: 'Joey2',
      lastName: 'Tribiani2'
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await controller.put(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(result.firstName).toBe('Joey2');
    expect(result.lastName).toBe('Tribiani2');
  });

  it('PUT should call next with error', async () => {
    memberModel.findByIdAndUpdate = jest.fn(() => {
      throw new Error('Fake error');
    });
    const result = await controller.put(req, res, next);

    expect(res.status).not.toHaveBeenCalled();
    expect(result).toBeUndefined();
    expect(next).toHaveBeenCalledWith(expect.objectContaining(new Error()));
  });

  it('should DELETE member and its related records', async () => {
    const createdByModel = new userModel({
      _id: new mongoose.Types.ObjectId('012345678901234567890123'),
      firstName: 'Ross',
      lastName: 'Gellar',
      userName: 'rossgellar',
      password: 'fakepassword2'
    });
    await createdByModel.save();

    const model = new memberModel({
      firstName: 'Joey',
      lastName: 'Tribiani',
      createdBy: new mongoose.Types.ObjectId('012345678901234567890123')
    });
    await model.save();

    medicationModel.deleteMany = jest.fn();
    freqModel.deleteMany = jest.fn();

    const medication = new medicationModel({
      memberId: model._id,
      medicationName: 'fake med',
      dosage: 'fake dosage',
      route: 'fake route',
      startDate: new Date(),
      frequencies: [mongoose.Types.ObjectId(), mongoose.Types.ObjectId()],
      createdBy: createdByModel._id
    });
    await medication.save();

    req.params = {
      id: model._id
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await controller.deleteById(req, res, next);

    expect(result.firstName).toBe('Joey');
    expect(medicationModel.deleteMany).toHaveBeenCalled();
    expect(freqModel.deleteMany).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('DELETE should call next with error', async () => {
    const result = await controller.deleteById(req, res, next);

    expect(res.status).not.toHaveBeenCalled();
    expect(result).toBeUndefined();
    expect(next).toHaveBeenCalledWith(expect.objectContaining(new Error()));
  });
});
