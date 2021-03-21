interface IModelBase {
  _id: string;
}

interface IUserBase extends IModelBase {
  firstName: string;
  lastName: string;
}

interface IUser extends IUserBase {
  userName: string;
  password: string;
}

interface IUserAuth extends IUserBase {
  authToken: string;
}

interface IMember extends IModelBase {
  firstName: string;
  lastName: string;
}

const enum medicationStatus {
  NEW = 'NEW',
  DONE = 'DONE',
  COMING = 'COMING',
  PAST_DUE = 'PAST_DUE'
}

interface IFrequencyDto extends IModelBase {
  medicationId: string;
  dateTime: Date;
  status?: medicationStatus;
}

interface IMedicationDto extends IModelBase {
  medicationName: string;
  dosage: string;
  route: string;
  startDate: Date;
  endDate: Date;
  frequencies?: IFrequencyDto[];
}

interface IFrequencyLogDto extends IModelBase {
  frequencyId: string;
  administeredDateTime: Date;
  note: string;
  administeredBy: string;
}
