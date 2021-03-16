import memberModel from './member.model';

export async function create(payload: IMember): Promise<IMember> {
  const doc = await memberModel.create(payload);
  return memberModel.toDto(doc);
}

export async function getAll(): Promise<IMember[]> {
  const result = memberModel.find().populate('createdBy', '_id firstName lastName');
  return result;
}
