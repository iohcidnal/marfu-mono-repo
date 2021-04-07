/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';

import * as controller from './medication.controller';
import medicationModel from './medication.model';
import freqLogModel from '../frequency-log/frequency-log.model';

const req = {} as Request;
const res = {} as Response;
const next = jest.fn();

res.status = jest.fn().mockImplementation(() => ({
  json: jest.fn(result => result)
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
        dateTime: new Date(2021, 12, 25, 10, 0),
        medicationId: '6060bd138f88b122aa5aeb6b'
      },
      {
        // status = 'COMING'. Schedule time is 30 mins past current time
        _id: '6060bd138f88b122aa5aeb69',
        dateTime: new Date(2021, 12, 25, 11, 30),
        medicationId: '6060bd138f88b122aa5aeb6b'
      },
      {
        // status = 'PAST_DUE'. Schedule time is more than an hour past current time
        _id: '6060bd138f88b122aa5aeb6a',
        dateTime: new Date(2021, 12, 25, 8, 0),
        medicationId: '6060bd138f88b122aa5aeb6b'
      },
      {
        // status = 'COMING'. Schedule time is an hour past current time
        _id: '6060bd138f88b122aa5aeb6b',
        dateTime: new Date(2021, 12, 25, 10, 0),
        medicationId: '6060bd138f88b122aa5aeb6b'
      },
      {
        // status = 'COMING'. Schedule time is more than an hour before current time
        _id: '6060bd138f88b122aa5aeb6c',
        dateTime: new Date(2021, 12, 25, 14, 0),
        medicationId: '6060bd138f88b122aa5aeb6b'
      }
    ],
    memberId: '6060bd088f88b122aa5aeb67',
    medicationName: 'Medication 2',
    dosage: '10 mg',
    route: 'Mouth',
    startDate: '2021-04-01T06:00:00.000Z',
    endDate: '2021-05-01T06:00:00.000Z',
    createdBy: '605414174f8e96171beabbb7'
  }
];

afterEach(jest.clearAllMocks);

describe('medication', () => {
  it('should GET all medications with correct frequency status', async () => {
    medicationModel.find = jest.fn().mockImplementation(() => ({
      lean: jest.fn(() => ({
        populate: jest.fn(() => medicationDocs)
      }))
    }));
    freqLogModel.find = jest.fn().mockImplementation(() => ({
      lean: jest.fn(() => ({
        where: jest.fn(() => ({
          in: jest.fn(() => [{ frequencyId: '6060bd138f88b122aa5aeb68' }])
        }))
      }))
    }));

    req.params = { memberId: 'fake-id' };
    req.body = { clientDateTime: new Date(2021, 12, 25, 11, 0) };
    const result: any = await controller.get(req, res, next);

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
  });

  it('GET should call next with error', async () => {
    medicationModel.find = jest.fn().mockImplementation(() => ({
      lean: jest.fn(() => ({
        populate: jest.fn(() => {
          throw new Error();
        })
      }))
    }));

    req.params = { memberId: 'fake-id' };
    req.body = { clientDateTime: new Date(2021, 12, 25, 11, 0) };
    const result: any = await controller.get(req, res, next);

    expect(res.status).not.toHaveBeenCalled();
    expect(result).toBeUndefined();
    expect(next).toHaveBeenCalledWith(expect.objectContaining(new Error()));
  });

  it.todo('should PUT');
});
