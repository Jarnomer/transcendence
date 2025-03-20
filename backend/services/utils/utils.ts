import { Database } from 'sqlite';

export async function queryWithJsonParsingObject<T extends Record<string, any>>(
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
      jsonFields.includes(key as keyof T) && typeof value === 'string' ? JSON.parse(value) : value,
    ])
  ) as T;
}

export async function queryWithJsonParsingArray<T extends Record<string, any>>(
  db: Database,
  query: string,
  params: any[],
  jsonFields: (keyof T)[]
): Promise<T[]> {
  // Use `db.all` to get all rows
  const results = await db.all(query, params);
  if (!results || results.length === 0) return [];

  // Map over each result and parse JSON fields
  return results.map(
    (result) =>
      Object.fromEntries(
        Object.entries(result).map(([key, value]) => [
          key,
          jsonFields.includes(key as keyof T) && typeof value === 'string'
            ? JSON.parse(value)
            : value,
        ])
      ) as T
  );
}
