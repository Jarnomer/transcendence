export type SessionData = {
  gameId?: string;
  queueId?: string;
  mode?: string;
  difficulty?: string;
};

const SESSION_KEY = 'user-session';

export default class SessionManager {
  private static instance: SessionManager;
  private cache: SessionData = {};

  private constructor(private storage: Storage = localStorage) {}

  public static getInstance(storage?: Storage): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager(storage ?? localStorage);
    }
    return SessionManager.instance;
  }

  private load(): SessionData {
    if (Object.keys(this.cache).length > 0) return this.cache;

    try {
      const raw = this.storage.getItem(SESSION_KEY);
      this.cache = raw ? JSON.parse(raw) : {};
    } catch (err) {
      console.warn('[SessionManager] Failed to parse session data:', err);
      this.cache = {};
    }

    return this.cache;
  }

  private save(): void {
    try {
      this.storage.setItem(SESSION_KEY, JSON.stringify(this.cache));
    } catch (err) {
      console.error('[SessionManager] Failed to save session data:', err);
    }
  }

  get<K extends keyof SessionData>(key: K): SessionData[K] {
    return this.load()[key];
  }

  set<K extends keyof SessionData>(key: K, value: SessionData[K]): void {
    this.load();
    this.cache[key] = value;
    this.save();
  }

  remove<K extends keyof SessionData>(key: K): void {
    this.load();
    delete this.cache[key];
    this.save();
  }

  clear(): void {
    this.cache = {};
    try {
      this.storage.removeItem(SESSION_KEY);
    } catch (err) {
      console.warn('[SessionManager] Failed to clear session data:', err);
    }
  }
}
