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
        time: '17:00',
        medicationId: '6060bd138f88b122aa5aeb6b'
      },
      {
        // status = 'COMING'. Schedule time is 45 mins after current time
        _id: '6060bd138f88b122aa5aeb69',
        time: '11:45',
        medicationId: '6060bd138f88b122aa5aeb6b'
      },
      {
        // status = 'COMING'. Schedule time is an hour past current time
        _id: '6060bd138f88b122aa5aeb6b',
        time: '12:00',
        medicationId: '6060bd138f88b122aa5aeb6b'
      },
      {
        // status = 'COMING'. Schedule time is an hour before current time
        _id: '6060bd138f88b122aa5aeb6c',
        time: '10:00',
        medicationId: '6060bd138f88b122aa5aeb6b'
      },
      {
        // status = 'PAST_DUE'. Schedule time is more than an hour past current time
        _id: '6060bd138f88b122aa5aeb6a',
        time: '12:01',
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
  it('should GET all medications with correct frequency status', async () => {
    medicationModel.find = jest.fn().mockImplementation(() => ({
      lean: jest.fn(() => ({
        populate: jest.fn(() => medicationDocs)
      }))
    }));

    freqLogModel.find = jest.fn().mockImplementation(() => ({
      lean: jest.fn(() => [{ frequencyId: '6060bd138f88b122aa5aeb68' }])
    }));

    req.params = { memberId: '6060bd088f88b122aa5aeb67' };
    req.body = { clientDateTime: new Date(2021, 11, 25, 11, 0) };

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
    req.body = { clientDateTime: new Date(2021, 12, 25, 11, 0) }; // Dec 25, 2021, 11AM
    const result: any = await controller.getAllByMemberId(req, res, next);

    expect(res.status).not.toHaveBeenCalled();
    expect(result).toBeUndefined();
    expect(next).toHaveBeenCalledWith(expect.objectContaining(new Error()));
  });

  it.todo('should PUT');
});
