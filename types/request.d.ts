interface IBtkAuthorization {
  isLoggedIn: boolean;
  account?: IAccountModel | null;
}

declare namespace Express {
  export interface Request {
    custom: {
      authorization: IBtkAuthorization;
    };
  }
}
