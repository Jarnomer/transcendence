import { Database } from "sqlite";

export async function queryWithJsonParsing<T extends Record<string, any>>(
    db: Database,
    query: string,
    params: any[],
    jsonFields: (keyof T)[]
  ): Promise<T> {
    const result = await db.get(query, params);
    if (!result) return result;
  
    return Object.fromEntries(
      Object.entries(result).map(([key, value]) => [
        key,
        jsonFields.includes(key as keyof T) && typeof value === "string" ? JSON.parse(value) : value,
      ])
    ) as T;
  }
  