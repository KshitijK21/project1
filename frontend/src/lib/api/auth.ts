import apiClient from "./client";
import { LoginPayload, LoginResponse, RegisterPayload, RegisterResponse } from "@/types/auth";

export async function loginRequest(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>("/auth/login", payload);
  return data;
}

export async function registerRequest(payload: RegisterPayload): Promise<RegisterResponse> {
  const { data } = await apiClient.post<RegisterResponse>("/auth/register", payload);
  return data;
}