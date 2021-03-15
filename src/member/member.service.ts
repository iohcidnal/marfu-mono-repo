import memberModel from './member.model';

export async function create(payload: IMember): Promise<IMember> {
  return await memberModel.create(payload);
}

export async function getAll(): Promise<IMember[]> {
  const result = memberModel.find().populate('createdBy', '_id firstName lastName');
  return result;
}
