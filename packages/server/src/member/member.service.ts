import { IDashboardDto, IMemberDto, MedicationStatus } from '@common';
import model from './member.model';
import * as medicationService from '../medication/medication.service';

export async function create(payload: IMemberDto): Promise<IMemberDto> {
  const doc = await model.create(payload);
  return model.toDto(doc);
}

export async function getAll(): Promise<IMemberDto[]> {
  const docs = await model.find().lean().populate('createdBy', '_id firstName lastName');
  return docs;
}

export async function getAllForDashboard(clientDateTime: string): Promise<IDashboardDto[]> {
  const memberDocs = await model
    .find()
    .sort({ firstName: 1, lastName: 1 })
    .lean()
    .populate('createdBy', '_id firstName lastName');
  const result: IDashboardDto[] = [];

  for await (const member of memberDocs) {
    let status = MedicationStatus.DONE;
    const medications = await medicationService.getAllByMemberId(
      member._id.toString(),
      clientDateTime
    );
    // status is `past due` if there are some past due.
    // `Coming` if there are some coming. Otherwise, status is `done`.
    if (medications.some(med => med.status === MedicationStatus.PAST_DUE)) {
      status = MedicationStatus.PAST_DUE;
    } else if (medications.some(med => med.status === MedicationStatus.COMING)) {
      status = MedicationStatus.COMING;
    }
    result.push({
      _id: member._id,
      firstName: member.firstName,
      lastName: member.lastName,
      status,
      createdBy: member.createdBy
    });
  }

  return result;
}

export async function getById(id: string): Promise<IMemberDto | null> {
  const doc = model.findById(id).lean();
  return doc;
}

export async function update(payload: IMemberDto): Promise<IMemberDto | null> {
  const doc = await model.findByIdAndUpdate(payload._id, payload, { lean: true, new: true });
  return doc;
}

export async function deleteById(id: string): Promise<IMemberDto | null> {
  // This triggers `findOneAndDelete` middleware to delete related records
  const result = await model.findOneAndDelete({ _id: id });
  return result;
}
