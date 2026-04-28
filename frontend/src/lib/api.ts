const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export async function fetchStats() {
  try {
    const res = await fetch(`${API_URL}/relatorios/stats`, {
      cache: "no-store", // Ensure we get fresh data
    });
    if (!res.ok) throw new Error("Falha ao buscar estatísticas");
    return res.json();
  } catch (error) {
    console.error("Error fetching stats:", error);
    return null;
  }
}

export async function fetchRelatorios() {
  try {
    const res = await fetch(`${API_URL}/relatorios`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Falha ao buscar relatórios");
    return res.json();
  } catch (error) {
    console.error("Error fetching relatorios:", error);
    return null;
  }
}
