import model from './frequency-log.model';

export async function create(payload: IFrequencyLogDto): Promise<IFrequencyLogDto> {
  const doc = await model.create(payload);
  return model.toDto(doc);
}

export async function getByFrequencyId(id: string): Promise<IFrequencyLogDto[]> {
  const docs = await model
    .find({ frequencyId: id })
    .populate('administeredBy', 'firstName lastName')
    .exec();
  return docs.map(doc => model.toDto(doc));
}

export async function getAllByFrequencyIds(
  frequencyIds: string[] | undefined
): Promise<IFrequencyLogDto[] | null> {
  if (!frequencyIds) return null;
  const docs = await model.find().where('frequencyId').in(frequencyIds).exec();
  return docs;
}
