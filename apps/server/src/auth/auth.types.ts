export interface AuthUser {
  id: number;
  email: string;
  nickname: string;
}

export interface AuthPayload {
  token: string;
  user: AuthUser;
}
