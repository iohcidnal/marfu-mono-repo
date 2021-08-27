import { Request, Response } from 'express';
import mongoose from 'mongoose';

import model from './frequency-log.model';
import * as controller from './frequency-log.controller';
import { IFrequencyLogDto } from '../../../common/src';
import _ from 'lodash';

const req = {} as Request;
const res = {} as Response;
const next = jest.fn();

res.status = jest.fn().mockImplementation(() => ({
  json: jest.fn(result => result)
}));

afterEach(jest.clearAllMocks);

describe('frequency log', () => {
  const frequencyLog: IFrequencyLogDto = {
    _id: mongoose.Types.ObjectId().toHexString(),
    frequencyId: mongoose.Types.ObjectId().toHexString(),
    administeredBy: mongoose.Types.ObjectId().toHexString(),
    administeredDate: '12/25/2021',
    administeredTime: '9:00',
    note: 'fake note'
  };

  describe('post', () => {
    it('should create frequency log', async () => {
      req.body = frequencyLog;
      model.create = jest.fn().mockResolvedValue(frequencyLog);

      const result = await controller.post(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(model.create).toHaveBeenCalledWith(frequencyLog);
      expect(result).toEqual(frequencyLog);
    });

    it('should catch thrown error', async () => {
      req.body = frequencyLog;
      model.create = jest.fn(() => {
        throw new Error();
      });

      const result = await controller.post(req, res, next);

      expect(next).toHaveBeenCalledWith(new Error());
      expect(result).toBeUndefined();
    });
  });

  describe('getByFrequencyId', () => {
    it('should return frequency log', async () => {
      model.find = jest.fn().mockImplementation(() => ({
        lean: jest.fn(() => ({
          populate: jest.fn(() => [frequencyLog])
        }))
      }));
      req.params = { frequencyId: 'fake-id' };

      const result = await controller.getByFrequencyId(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(model.find).toHaveBeenCalledWith(req.params);
      expect(result).toEqual([frequencyLog]);
    });

    it('should catch thrown error', async () => {
      model.find = jest.fn(() => {
        throw new Error();
      });
      req.params = { frequencyId: 'fake-id' };

      const result = await controller.getByFrequencyId(req, res, next);

      expect(next).toHaveBeenCalledWith(new Error());
      expect(result).toBeUndefined();
    });
  });

  describe('put', () => {
    it('should update frequency log', async () => {
      model.findByIdAndUpdate = jest.fn().mockImplementation(() => frequencyLog);
      req.body = frequencyLog;

      const result = await controller.put(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(frequencyLog._id, frequencyLog, {
        lean: true,
        new: true
      });
      expect(result).toEqual(frequencyLog);
    });

    it('should catch thrown error', async () => {
      model.findByIdAndUpdate = jest.fn(() => {
        throw new Error();
      });
      req.body = frequencyLog;

      const result = await controller.put(req, res, next);

      expect(next).toHaveBeenCalledWith(new Error());
      expect(result).toBeUndefined();
    });
  });
});
