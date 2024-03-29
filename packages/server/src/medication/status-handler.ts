import { IFrequencyDto, IFrequencyLogDto, MedicationStatus } from '@common';

const ONE_HOUR_IN_MILLISECONDS = 3600000;

interface IStatusHandler {
  getStatus: () => MedicationStatus | undefined;
  setNext: (nextHandler?: IStatusHandler) => IStatusHandler | undefined;
}

export default function getFrequencyStatus(
  clientDateTime: string,
  timeZone: string,
  freqLogs: IFrequencyLogDto[],
  frequency: IFrequencyDto
): MedicationStatus {
  const doneHandler = markWithDoneHandler();
  const comingHandler = markWithComingHandler();
  const pastDueHandler = markWithPastDueHandler();

  doneHandler.setNext(comingHandler)?.setNext(pastDueHandler)?.setNext();

  return doneHandler.getStatus() ?? 'DONE';

  function markWithDoneHandler(): IStatusHandler {
    let _nextHandler: IStatusHandler | undefined;

    function getStatus() {
      if (freqLogs?.find(log => log.frequencyId.toString() === frequency._id.toString())) {
        return 'DONE';
      }

      return _nextHandler?.getStatus();
    }

    function setNext(nextHandler?: IStatusHandler) {
      _nextHandler = nextHandler;
      return _nextHandler;
    }

    return {
      getStatus,
      setNext
    };
  }

  function markWithComingHandler(): IStatusHandler {
    let _nextHandler: IStatusHandler | undefined;

    function getStatus() {
      const frequencyDateTime = toTzDate(frequency.time);
      const currentDateTime = new Date(clientDateTime);

      const diff = Math.abs(currentDateTime.valueOf() - frequencyDateTime.valueOf());
      // One hour before and one hour after is coming
      if (diff <= ONE_HOUR_IN_MILLISECONDS) {
        return 'COMING';
      }

      return _nextHandler?.getStatus();
    }

    function setNext(nextHandler?: IStatusHandler) {
      _nextHandler = nextHandler;
      return _nextHandler;
    }

    return {
      getStatus,
      setNext
    };
  }

  function markWithPastDueHandler(): IStatusHandler {
    let _nextHandler: IStatusHandler | undefined;

    function getStatus() {
      const frequencyDateTime = toTzDate(frequency.time);
      const currentDateTime = new Date(clientDateTime);
      const diff = currentDateTime.valueOf() - frequencyDateTime.valueOf();
      // If currentDateTime is past frequencyDateTime and currentDateTime is more than an hour, return past due
      if (Math.sign(diff) > -1 && diff > ONE_HOUR_IN_MILLISECONDS) {
        return 'PAST_DUE';
      }

      return _nextHandler?.getStatus();
    }

    function setNext(nextHandler?: IStatusHandler) {
      _nextHandler = nextHandler;
      return _nextHandler;
    }

    return {
      getStatus,
      setNext
    };
  }

  function toTzDate(time: string): Date {
    const currentDateTime = new Date(clientDateTime);
    const [hh, mm] = time.split(':');
    const dateTime = new Date(
      currentDateTime.getFullYear(),
      currentDateTime.getMonth(),
      currentDateTime.getDate(),
      Number(hh),
      Number(mm)
    ).toLocaleString('en-US', { timeZone }); // Make sure we're in sync with the client's time zone.

    return new Date(dateTime);
  }
}
