import { IUserBase } from '@common';

const friends: IUserBase[] = [
  {
    _id: 'test-id',
    firstName: 'Joey',
    lastName: 'Tribianni'
  },
  {
    _id: 'test-id2',
    firstName: 'Chandler',
    lastName: 'Bing'
  }
];

export default function Home() {
  return (
    <div>
      <h1>Friends</h1>
      <ul>
        {friends.map(friend => (
          <li key={friend._id}>
            {friend.firstName} {friend.lastName}
          </li>
        ))}
      </ul>
    </div>
  );
}
