import model from './medication.model';

const ONE_HOUR_IN_MILLISECONDS = 3600000;

export async function create(payload: IMedication): Promise<IMedication> {
  const doc = await model.create(payload);
  return model.toDto(doc);
}

export async function getAll(clientDateTime: string): Promise<IMedication[]> {
  const docs = await model.find().exec();
  const result: IMedication[] = docs.map(doc => {
    const frequencyStatus = getFrequencyStatus(clientDateTime, doc);
    return {
      _id: doc._id,
      medicationName: doc.medicationName,
      dosage: doc.dosage,
      frequency: frequencyStatus,
      route: doc.route,
      startDate: doc.startDate,
      endDate: doc.endDate
    };
  });

  return result;
}

function getFrequencyStatus(clientDateTime: string, doc: IMedication): IFrequency[] {
  const currentDateTime = new Date(clientDateTime);

  const status = doc.frequency.reduce((accumulator: IFrequency[], freq) => {
    // TODO: Check if freq._id is in the medication logs. If it is, mark frequency with DONE.

    const freqDateTime = createFrequencyDateTime(currentDateTime, freq.freqDateTime);

    if (freqDateTime >= currentDateTime) {
      const diff = freqDateTime.valueOf() - currentDateTime.valueOf();
      const isFreqWithinAnHour = diff <= ONE_HOUR_IN_MILLISECONDS;
      if (isFreqWithinAnHour) {
        accumulator.push({
          _id: freq._id,
          freqDateTime,
          freqStatus: medicationStatus.COMING
        });

        return accumulator;
      }
    }

    if (freqDateTime < currentDateTime) {
      const diff = currentDateTime.valueOf() - freqDateTime.valueOf();
      const isFreqPastWithinAnHour = diff <= ONE_HOUR_IN_MILLISECONDS;
      accumulator.push({
        _id: freq._id,
        freqDateTime,
        freqStatus: isFreqPastWithinAnHour ? medicationStatus.COMING : medicationStatus.PAST_DUE
      });

      return accumulator;
    }

    return accumulator;
  }, []);

  return status;
}

/**
 * Creates a new date and time by concatinating freq time to the current date
 */
function createFrequencyDateTime(currentDateTime: Date, freqDateTime: Date): Date {
  return new Date(
    currentDateTime.getFullYear(),
    currentDateTime.getMonth(),
    currentDateTime.getDate(),
    freqDateTime.getHours(),
    freqDateTime.getMinutes()
  );
}
