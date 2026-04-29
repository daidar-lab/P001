import { API_URL } from "@/config/api";

const BASE_API_URL = `${API_URL}/api`;

export async function fetchStats(token?: string | null) {
  try {
    const headers: any = { "cache": "no-store" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${BASE_API_URL}/relatorios/stats`, {
      headers: token ? { "Authorization": `Bearer ${token}` } : {},
      cache: "no-store",
    });
    
    if (!res.ok) throw new Error("Falha ao buscar estatísticas");
    const data = await res.json();
    return data.data; // Retornando .data para facilitar o uso
  } catch (error) {
    console.error("Error fetching stats:", error);
    return null;
  }
}

export async function fetchRelatorios(token?: string | null) {
  try {
    const res = await fetch(`${BASE_API_URL}/relatorios`, {
      headers: token ? { "Authorization": `Bearer ${token}` } : {},
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Falha ao buscar relatórios");
    return res.json();
  } catch (error) {
    console.error("Error fetching relatorios:", error);
    return null;
  }
}
