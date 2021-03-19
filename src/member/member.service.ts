import model from './member.model';

export async function create(payload: IMember): Promise<IMember> {
  const doc = await model.create(payload);
  return model.toDto(doc);
}

export async function getAll(): Promise<IMember[]> {
  const docs = await model.find().populate('createdBy', '_id firstName lastName');
  return docs.map(doc => model.toDto(doc));
}
