import model from './member.model';

export async function create(payload: IMemberDto): Promise<IMemberDto> {
  const doc = await model.create(payload);
  return model.toDto(doc);
}

export async function getAll(): Promise<IMemberDto[]> {
  const docs = await model.find().lean().populate('createdBy', '_id firstName lastName');
  return docs;
}
