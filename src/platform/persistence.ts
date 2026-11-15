import type { ContractResult, OperationId, PersistedSession, SessionPersistence } from "../domain/models"
import { failure, isSessionState } from "../domain/validation"

export const SESSION_STORAGE_KEY = "le-chemin-vivant.session.v1"
export const SESSION_SCHEMA_VERSION = 1
type StoragePort = Pick<Storage, "getItem" | "setItem" | "removeItem">

function isPersistedSession(value: unknown): value is PersistedSession {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false
  const record = value as Record<string, unknown>
  return Object.keys(record).sort().join(",") === "schemaVersion,state"
    && record.schemaVersion === SESSION_SCHEMA_VERSION && isSessionState(record.state)
}

export function createSessionPersistence(
  getStorage: () => StoragePort | null = () => window.localStorage,
): SessionPersistence {
  const unavailable = (operation: OperationId) => failure("STORAGE_UNAVAILABLE", operation, "Local storage is unavailable")
  return {
    async load(): Promise<ContractResult<PersistedSession | null>> {
      let raw: string | null
      try {
        const storage = getStorage()
        if (storage === null) return unavailable("PERSIST-LOAD")
        raw = storage.getItem(SESSION_STORAGE_KEY)
      } catch { return unavailable("PERSIST-LOAD") }
      if (raw === null) return { ok: true, data: null, error: null }
      try {
        const parsed: unknown = JSON.parse(raw)
        if (!isPersistedSession(parsed)) return failure("STORED_SESSION_INVALID", "PERSIST-LOAD", "Saved session format or version is invalid")
        return { ok: true, data: parsed, error: null }
      } catch { return failure("STORED_SESSION_INVALID", "PERSIST-LOAD", "Saved session cannot be decoded") }
    },
    async save(session): Promise<ContractResult<void>> {
      if (!isPersistedSession(session)) return failure("STORED_SESSION_INVALID", "PERSIST-SAVE", "Session format or version is invalid")
      try {
        const storage = getStorage()
        if (storage === null) return unavailable("PERSIST-SAVE")
        storage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ schemaVersion: session.schemaVersion, state: session.state }))
        return { ok: true, data: undefined, error: null }
      } catch { return unavailable("PERSIST-SAVE") }
    },
    async clear(): Promise<ContractResult<void>> {
      try {
        const storage = getStorage()
        if (storage === null) return unavailable("PERSIST-CLEAR")
        storage.removeItem(SESSION_STORAGE_KEY)
        return { ok: true, data: undefined, error: null }
      } catch { return unavailable("PERSIST-CLEAR") }
    },
  }
}
