interface IUserBase {
  userId: string;
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
