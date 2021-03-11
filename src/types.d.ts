interface IModelBase {
  _id: string;
}

interface IUserBase extends IModelBase {
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

interface IMember extends IModelBase {
  firstName: string;
  lastName: string;
}
