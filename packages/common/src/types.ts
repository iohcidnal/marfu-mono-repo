export interface IModelBase {
  _id: string;
}

export interface IUserBase extends IModelBase {
  firstName: string;
  lastName: string;
}

export interface IUserDto extends IUserBase {
  userName: string;
  password: string;
}

export interface IMemberDto extends IModelBase {
  firstName: string;
  lastName: string;
  createdBy: string;
}

export interface IDashboardDto extends IMemberDto {
  status: medicationStatus;
}

export const enum medicationStatus {
  NEW = 'NEW',
  DONE = 'DONE',
  COMING = 'COMING',
  PAST_DUE = 'PAST_DUE'
}

export interface IFrequencyDto extends IModelBase {
  medicationId?: string;
  time: string;
  status?: medicationStatus;
}

export interface IMedicationDto extends IModelBase {
  memberId: string;
  medicationName: string;
  dosage: string;
  route: string;
  note?: string;
  startDate: string;
  endDate: string;
  frequencies?: IFrequencyDto[];
  status?: medicationStatus;
  createdBy: string;
}

export interface IFrequencyLogDto extends IModelBase {
  frequencyId: string;
  administeredDateTime: Date;
  note: string;
  administeredBy: string;
}
