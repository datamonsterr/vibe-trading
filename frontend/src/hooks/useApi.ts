import useSWR from "swr";
import { api, type HealthResponse, type RootResponse } from "../services/api";

const fetcher = async <T,>(apiCall: () => Promise<{ data: T }>) => {
  const response = await apiCall();
  return response.data;
};

export function useHealth() {
  return useSWR<HealthResponse>("/health", () => fetcher(api.health));
}

export function useRoot() {
  return useSWR<RootResponse>("/", () => fetcher(api.root));
}
