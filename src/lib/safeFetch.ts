export async function safeFetchJson<T>(url: string, options?: RequestInit, fallbackValue?: T): Promise<T> {
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      if (fallbackValue !== undefined) return fallbackValue;
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    return data;
  } catch (err) {
    if (fallbackValue !== undefined) return fallbackValue;
    throw err;
  }
}

export async function safeResponseJson<T>(res: Response, fallbackValue: T): Promise<T> {
  try {
    if (!res.ok) return fallbackValue;
    const data = await res.json();
    return data !== undefined ? data : fallbackValue;
  } catch {
    return fallbackValue;
  }
}
