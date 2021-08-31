import { Request, Response } from 'express';
import mongoose from 'mongoose';

import { IMedicationPostPutPayload, IMedicationDto, IFrequencyDto } from '../../../common/src';
import * as controller from './medication.controller';
import medicationModel from './medication.model';
import freqModel from './frequency.model';
import freqLogModel from '../frequency-log/frequency-log.model';

const req = {} as Request;
const res = {} as Response;
const next = jest.fn();

const json = jest.fn(result => result);
res.status = jest.fn().mockImplementation(() => ({
  json
}));

/**
 * This test does not use @shelf/jest-mongodb (mongodbMemoryServer) to demonstrate
 * another approach which is to just mock your models using jest.
 */

const medicationDocs = [
  {
    _id: '6060bd138f88b122aa5aeb6b',
    frequencies: [
      {
        // status = 'DONE'. This will be in the freq logs
        _id: '6060bd138f88b122aa5aeb68',
        time: '17:00',
        medicationId: '6060bd138f88b122aa5aeb6b'
      },
      {
        // status = 'COMING'. Schedule time is 45 mins after current time
        _id: '6060bd138f88b122aa5aeb69',
        time: '09:45',
        medicationId: '6060bd138f88b122aa5aeb6b'
      },
      {
        // status = 'COMING'. Schedule time is an hour past current time
        _id: '6060bd138f88b122aa5aeb6b',
        time: '10:00',
        medicationId: '6060bd138f88b122aa5aeb6b'
      },
      {
        // status = 'COMING'. Schedule time is an hour before current time
        _id: '6060bd138f88b122aa5aeb6c',
        time: '08:00',
        medicationId: '6060bd138f88b122aa5aeb6b'
      },
      {
        // status = 'PAST_DUE'. Schedule time is more than an hour past current time
        _id: '6060bd138f88b122aa5aeb6a',
        time: '07:59',
        medicationId: '6060bd138f88b122aa5aeb6b'
      },
      {
        // status = 'DONE'. Schedule time is far from current time
        _id: '6060bd138f88b122aa5aeb7a',
        time: '11:00',
        medicationId: '6060bd138f88b122aa5aeb6b'
      }
    ],
    memberId: '6060bd088f88b122aa5aeb67',
    medicationName: 'Medication 2',
    dosage: '10 mg',
    route: 'Mouth',
    startDate: '2021-10-01',
    endDate: '2021-12-31',
    createdBy: '605414174f8e96171beabbb7'
  }
];

afterEach(jest.clearAllMocks);

describe('medication', () => {
  describe('get', () => {
    it('should get all medications with correct frequency status', async () => {
      medicationModel.find = jest.fn().mockImplementation(() => ({
        lean: jest.fn(() => ({
          populate: jest.fn(() => medicationDocs)
        }))
      }));

      freqLogModel.find = jest.fn().mockImplementation(() => ({
        lean: jest.fn(() => [{ frequencyId: '6060bd138f88b122aa5aeb68' }])
      }));

      req.params = { memberId: '6060bd088f88b122aa5aeb67' };
      // Current date time = Dec 25, 2021, 9:00 AM
      req.query = { dt: new Date(2021, 11, 25, 9, 0).toString(), tz: 'America/Denver' };

      // `any` needed for debugging test
      const result: any = await controller.getAllByMemberId(req, res, next);

      let frequency = result[0].frequencies.find(
        (freq: { _id: string }) => freq._id === '6060bd138f88b122aa5aeb68'
      );
      expect(frequency.status).toBe('DONE');

      frequency = result[0].frequencies.find(
        (freq: { _id: string }) => freq._id === '6060bd138f88b122aa5aeb69'
      );
      expect(frequency.status).toBe('COMING');

      frequency = result[0].frequencies.find(
        (freq: { _id: string }) => freq._id === '6060bd138f88b122aa5aeb6a'
      );
      expect(frequency.status).toBe('PAST_DUE');

      frequency = result[0].frequencies.find(
        (freq: { _id: string }) => freq._id === '6060bd138f88b122aa5aeb6b'
      );
      expect(frequency.status).toBe('COMING');

      frequency = result[0].frequencies.find(
        (freq: { _id: string }) => freq._id === '6060bd138f88b122aa5aeb6c'
      );
      expect(frequency.status).toBe('COMING');

      frequency = result[0].frequencies.find(
        (freq: { _id: string }) => freq._id === '6060bd138f88b122aa5aeb7a'
      );
      expect(frequency.status).toBe('DONE');
    });

    it('should call next with error', async () => {
      medicationModel.find = jest.fn().mockImplementation(() => ({
        lean: jest.fn(() => ({
          populate: jest.fn(() => {
            throw new Error();
          })
        }))
      }));

      req.params = { memberId: 'fake-id' };
      req.query = { dt: new Date(2021, 12, 25, 11, 0).toString(), tz: 'America/Denver' };
      const result = await controller.getAllByMemberId(req, res, next);

      expect(res.status).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
      expect(next).toHaveBeenCalledWith(new Error());
    });
  });

  describe('put', () => {
    const newFreq: IFrequencyDto = { _id: 'fake-new-id', time: 'fake-time', status: 'NEW' };
    const medication: IMedicationDto = {
      _id: mongoose.Types.ObjectId().toHexString(),
      memberId: mongoose.Types.ObjectId().toHexString(),
      medicationName: 'fake-medication',
      dosage: 'fake-dosage',
      route: 'fake-route',
      startDate: '8/1/2021',
      createdBy: mongoose.Types.ObjectId().toHexString(),
      frequencies: [
        newFreq,
        {
          _id: 'fake-delete-id',
          time: 'fake-time',
          status: 'DELETE'
        },
        {
          _id: 'fake-coming-id',
          time: 'fake-time',
          status: 'COMING'
        }
      ]
    };
    const payload: IMedicationPostPutPayload = {
      clientDateTime: '8/1/2021',
      timeZone: 'America/Denver',
      medication
    };

    it('should update medication', async () => {
      req.body = payload;
      freqModel.create = jest.fn();
      freqModel.findByIdAndDelete = jest.fn().mockImplementation(() => ({
        exec: jest.fn()
      }));
      freqModel.updateOne = jest.fn().mockImplementation(() => ({
        exec: jest.fn()
      }));
      medicationModel.findByIdAndUpdate = jest.fn().mockImplementation(() => ({
        populate: jest.fn(() => medication)
      }));
      freqLogModel.find = jest.fn().mockImplementation(() => ({
        lean: jest.fn()
      }));

      const result = await controller.put(req, res, next);

      expect(freqModel.create).toHaveBeenCalledWith(newFreq);
      expect(freqModel.findByIdAndDelete).toHaveBeenCalledWith('fake-delete-id');
      expect(freqModel.updateOne).toHaveBeenCalledWith(
        {
          _id: 'fake-coming-id'
        },
        { time: 'fake-time' }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith(result);
    });

    it('should catch thrown error', async () => {
      freqModel.create = jest.fn(() => {
        throw new Error();
      });
      req.body = payload;

      const result = await controller.put(req, res, next);

      expect(next).toHaveBeenCalledWith(new Error());
      expect(result).toBeUndefined();
    });
  });

  describe('delete', () => {
    it('should delete', async () => {
      medicationModel.findOneAndDelete = jest.fn();
      req.params = { id: 'fake-id' };

      const result = await controller.deleteById(req, res, next);

      expect(medicationModel.findOneAndDelete).toHaveBeenCalledWith({ _id: 'fake-id' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith(result);
    });

    it('should catch thrown error', async () => {
      medicationModel.findOneAndDelete = jest.fn(() => {
        throw new Error();
      });
      req.params = { id: 'fake-id' };

      const result = await controller.deleteById(req, res, next);

      expect(next).toHaveBeenCalledWith(new Error());
      expect(result).toBeUndefined();
    });
  });
});
