import { IMemberDto } from '@common';
import model from './member.model';

export async function create(payload: IMemberDto): Promise<IMemberDto> {
  const doc = await model.create(payload);
  return model.toDto(doc);
}

export async function getAll(): Promise<IMemberDto[]> {
  const docs = await model.find().lean().populate('createdBy', '_id firstName lastName');
  return docs;
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
