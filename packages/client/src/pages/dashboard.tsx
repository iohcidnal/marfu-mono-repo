import { GetServerSideProps } from 'next';
import { IMemberDto, IMedicationDto } from '@common';
import { MembersDashboard } from '../components';
import { fetcher } from '../utils';

export default function Dashboard({ membersWithMeds }) {
  return <MembersDashboard membersWithMeds={membersWithMeds} />;
}

export const getServerSideProps: GetServerSideProps = async context => {
  const result = await fetcher({ url: `${process.env.NEXT_PUBLIC_API}members` }, context);
  if (result.status !== 200) {
    return {
      redirect: {
        permanent: false,
        destination: '/'
      }
    };
  }

  const members: IMemberDto[] = result.data;
  const memberIds = { memberIds: members.map(dto => dto._id) };

  const dashboardResult = await fetcher(
    {
      url: `${process.env.NEXT_PUBLIC_API}medications/dashboard`,
      method: 'POST',
      payload: memberIds
    },
    context
  );
  const medications: IMedicationDto[] = dashboardResult.data;
  const membersWithMeds = medications.reduce((acc, med) => {
    const member = members.find(m => m._id === med.memberId);
    acc.push({
      ...member,
      ...med
    });
    return acc;
  }, []);

  return {
    props: {
      membersWithMeds
    }
  };
};
