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

export interface INewUserDto extends IUserDto {
  confirmPassword: string;
  pin1: string;
  pin2: string;
  pin3: string;
  pin4: string;
  pin5: string;
  pin6: string;
}

export interface IMemberDto extends IModelBase {
  firstName: string;
  lastName: string;
  createdBy: string;
}

export interface IDashboardDto extends IMemberDto {
  status?: MedicationStatus;
}

export type MedicationStatus = 'DONE' | 'COMING' | 'PAST_DUE';

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
  endDate?: string;
  frequencies?: IFrequencyDto[];
  status?: MedicationStatus;
  createdBy: string;
}

export interface IFrequencyLogDto extends IModelBase {
  frequencyId: string;
  administeredDate: string;
  administeredTime: string;
  note: string;
  administeredBy: string;
}

export interface IMedicationPostPutPayload {
  medication: IMedicationDto;
  clientDateTime: string;
  timeZone: string;
}

export type signInMode = 'REGISTERED' | 'SIGNED_OUT';
