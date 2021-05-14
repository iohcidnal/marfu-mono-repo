import { GetServerSideProps } from 'next';
import { IMemberDto, IMedicationDto } from '@common';
import { MembersDashboard } from '../components';

export default function Dashboard({ medications }) {
  return <MembersDashboard medications={medications} />;
}

export const getServerSideProps: GetServerSideProps = async context => {
  const option: RequestInit = {
    headers: context.req ? { cookie: context.req.headers.cookie } : undefined
  };
  // TODO: Make fetch re-usable for server side calls
  let result = await fetch(`${process.env.NEXT_PUBLIC_API}members`, option);

  if (result.status !== 200) {
    return {
      redirect: {
        permanent: false,
        destination: '/'
      }
    };
  }

  option.headers['Content-Type'] = 'application/json';
  const members: IMemberDto[] = await result.json();
  const memberIds = { memberIds: members.map(dto => dto._id) };
  result = await fetch(`${process.env.NEXT_PUBLIC_API}medications/dashboard`, {
    method: 'POST',
    body: JSON.stringify(memberIds),
    ...option
  });
  const medications: IMedicationDto[] = await result.json();
  const membersMeds = medications.reduce((acc, med) => {
    const member = members.find(m => m._id === med.memberId);
    acc.push({
      ...member,
      ...med
    });
    return acc;
  }, []);

  return {
    props: {
      medications: membersMeds
    }
  };
};
