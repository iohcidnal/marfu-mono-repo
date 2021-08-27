import model from './frequency-log.model';
import { IFrequencyLogDto } from '@common';

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

export async function update(payload: IFrequencyLogDto): Promise<IFrequencyLogDto | null> {
  const doc = await model.findByIdAndUpdate(payload._id, payload, { lean: true, new: true });
  return doc;
}
