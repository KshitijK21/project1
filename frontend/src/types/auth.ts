export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  role: string;
}

export interface RegisterResponse {
  message: string;
  user_id: string;
  email: string;
  access_token: string;
  token_type: string;
  role: string;
}

export interface ApiError {
  detail: string;
}