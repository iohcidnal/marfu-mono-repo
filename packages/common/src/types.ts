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
  status: MedicationStatus;
}

export const enum MedicationStatus {
  DONE = 'DONE',
  COMING = 'COMING',
  PAST_DUE = 'PAST_DUE'
}

export interface IFrequencyDto extends IModelBase {
  medicationId?: string;
  time: string;
  status?: MedicationStatus | 'NEW' | 'DELETE';
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
  status?: MedicationStatus;
  createdBy: string;
}

export interface IFrequencyLogDto extends IModelBase {
  frequencyId: string;
  administeredDateTime: Date;
  note: string;
  administeredBy: string;
}
