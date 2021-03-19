import model from './medication.model';

export async function create(payload: IMedication): Promise<IMedication> {
  const doc = await model.create(payload);
  return model.toDto(doc);
}

export async function getAll(clientDateTime: string): Promise<IMedication[]> {
  const dateTime = new Date(clientDateTime);
  console.log('dateTime :>> ', dateTime);
  const docs = await model.find().populate('createdBy', '_id firstName lastName');
  // TODO: Compute status based on dateTime and frequency

  return docs.map(doc => model.toDto(doc));
}
