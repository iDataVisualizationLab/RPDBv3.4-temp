export * from "./data";
export * from "./users";


export const API_BASE = process.env.API_BASE_URL!;
export const API_GET_PROXY = `${API_BASE}/get-proxy?path=`
export async function handleResponse<T = any>(res: Response): Promise<T> {
  const json = await res.json();

  if (!res.ok) {
    const error = new Error(json?.detail || "Request failed");
    (error as any).detail = json?.detail || json;
    throw error;
  }

  return json.data || json;
}

export function getAuthHeaders(extraHeaders: HeadersInit = {}): HeadersInit {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");
  return {
    ...extraHeaders,
    Authorization: `Bearer ${token}`,
  };
}