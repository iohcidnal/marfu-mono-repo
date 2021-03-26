import model from './member.model';

export async function create(payload: IMemberDto): Promise<IMemberDto> {
  const doc = await model.create(payload);
  return model.toDto(doc);
}

export async function getAll(): Promise<IMemberDto[]> {
  const docs = await model.find().lean().populate('createdBy', '_id firstName lastName');
  return docs;
}

export async function update(payload: IMemberDto): Promise<IMemberDto | null> {
  const doc = await model.findByIdAndUpdate(payload._id, payload, { lean: true, new: true });
  return doc;
}