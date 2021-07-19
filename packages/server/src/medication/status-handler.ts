import { IFrequencyDto, IFrequencyLogDto, MedicationStatus } from '@common';

const ONE_HOUR_IN_MILLISECONDS = 3600000;

interface IStatusHandler {
  getStatus: () => MedicationStatus | undefined;
  setNext: (nextHandler?: IStatusHandler) => IStatusHandler | undefined;
}

export default function getFrequencyStatus(
  clientDateTime: string,
  freqLogs: IFrequencyLogDto[],
  frequency: IFrequencyDto
): MedicationStatus {
  const doneHandler = markWithDoneHandler();
  const comingHandler = markWithComingHandler();
  const pastDueHandler = markWithPastDueHandler();

  doneHandler.setNext(comingHandler)?.setNext(pastDueHandler)?.setNext();

  return doneHandler.getStatus() ?? MedicationStatus.DONE;

  function markWithDoneHandler(): IStatusHandler {
    let _nextHandler: IStatusHandler | undefined;

    function getStatus() {
      if (freqLogs?.find(log => log.frequencyId === frequency._id)) {
        return MedicationStatus.DONE;
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
      const frequencyDateTime = toDate(frequency.time);
      const currentDateTime = new Date(clientDateTime);
      const diff = Math.abs(frequencyDateTime.valueOf() - currentDateTime.valueOf());
      // One hour before and one hour after is coming
      if (diff <= ONE_HOUR_IN_MILLISECONDS) {
        return MedicationStatus.COMING;
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
      const frequencyDateTime = toDate(frequency.time);
      const currentDateTime = new Date(clientDateTime);
      const diff = Math.abs(frequencyDateTime.valueOf() - currentDateTime.valueOf());
      // Greater than one hour is past due
      if (diff > ONE_HOUR_IN_MILLISECONDS) {
        return MedicationStatus.PAST_DUE;
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

  function toDate(time: string): Date {
    const currentDateTime = new Date(clientDateTime);
    const [hh, mm] = time.split(':');
    const dateTime = new Date(
      currentDateTime.getFullYear(),
      currentDateTime.getMonth(),
      currentDateTime.getDate(),
      Number(hh),
      Number(mm)
    );

    return dateTime;
  }
}
