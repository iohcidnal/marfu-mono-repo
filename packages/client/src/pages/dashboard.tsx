import { GetServerSideProps } from 'next';

export default function Dashboard(props) {
  // TODO: Display dashboard items
  return (
    <>
      <h1>{props.message}</h1>
      <ul>
        {props.data.map(d => (
          <li key={d}>{d}</li>
        ))}
      </ul>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async context => {
  // TODO: Make fetch re-usable for server side calls
  const result = await fetch(`${process.env.NEXT_PUBLIC_API}users/dashboard`, {
    method: 'GET',
    headers: context.req ? { cookie: context.req.headers.cookie } : undefined
  });

  if (result.status !== 200) {
    return {
      redirect: {
        permanent: false,
        destination: '/'
      }
    };
  }

  const data = await result.json();

  return {
    props: {
      data
    }
  };
};
