interface User {
  id: number;
  username: string;
  fullName: string;
}

function userRepository() {
  function get() {
    const user: User = {
      id: 1331,
      username: 'test-username',
      fullName: 'Joey Tribiani'
    };

    return user;
  }

  return { get };
}

export default userRepository();
