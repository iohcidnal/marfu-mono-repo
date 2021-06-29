import { IMemberDto, IMedicationDto } from '@common';

interface IProps {
  member: IMemberDto;
  medications: IMedicationDto[];
}

export default function MemberInfo({ member, medications }: IProps) {
  // TODO: Display data in a form for CRUD operations
  return null;
}
