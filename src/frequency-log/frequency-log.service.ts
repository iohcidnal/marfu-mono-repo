import model from './frequency-log.model';

export async function create(payload: IFrequencyLogDto): Promise<IFrequencyLogDto> {
  const doc = await model.create(payload);
  return model.toDto(doc);
}

export async function getByFrequencyId(id: string): Promise<IFrequencyLogDto[]> {
  const docs = await model
    .find({ frequencyId: id })
    .lean()
    .populate('administeredBy', 'firstName lastName');
  return docs;
}

export async function getAllByFrequencyIds(
  frequencyIds: string[] | undefined
): Promise<IFrequencyLogDto[] | null> {
  if (!frequencyIds) return null;

  const docs = await model.find().lean().where('frequencyId').in(frequencyIds);
  return docs;
}
