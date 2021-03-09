interface IUserBase {
  _id: string;
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

interface IMember {
  _id: string;
  firstName: string;
  lastName: string;
}
