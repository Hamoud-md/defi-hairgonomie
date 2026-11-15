import { describe, expect, it } from "vitest"
import { createSessionPersistence, SESSION_SCHEMA_VERSION, SESSION_STORAGE_KEY } from "../../../src/platform/persistence"
import { sessionState } from "../fixtures/session-fixtures"

function memoryStorage() {
  const data = new Map<string, string>()
  return { data, getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => { data.set(key, value) }, removeItem: (key: string) => { data.delete(key) } }
}

describe("session persistence adapter", () => {
  it("round-trips only the version and state, independently of later caller mutation", async () => {
    const storage = memoryStorage()
    const adapter = createSessionPersistence(() => storage)
    expect(await adapter.load()).toEqual({ ok: true, data: null, error: null })
    const state = sessionState({ answers: { "step-1": ["value-1"] } })
    expect((await adapter.save({ schemaVersion: SESSION_SCHEMA_VERSION, state })).ok).toBe(true)
    ;(state.answers["step-1"] as string[]).push("changed")
    const raw = JSON.parse(storage.data.get(SESSION_STORAGE_KEY)!)
    expect(Object.keys(raw).sort()).toEqual(["schemaVersion", "state"])
    expect(Object.keys(raw.state).sort()).toEqual(["activeStepId", "answers", "objectiveId", "preferences"])
    const loaded = await adapter.load()
    expect(loaded).toMatchObject({ ok: true, data: { state: { answers: { "step-1": ["value-1"] } } } })
    if (loaded.ok && loaded.data) loaded.data.state.answers["step-1"] = "external"
    expect(await adapter.load()).toMatchObject({ ok: true, data: { state: { answers: { "step-1": ["value-1"] } } } })
    expect((await adapter.clear()).ok).toBe(true)
    expect(storage.data.has(SESSION_STORAGE_KEY)).toBe(false)
    expect(await adapter.load()).toEqual({ ok: true, data: null, error: null })
  })

  it.each(["not-json", "null", "[]", "{}", JSON.stringify({ schemaVersion: 99, state: sessionState() }),
    JSON.stringify({ schemaVersion: 1, state: { ...sessionState(), answers: { "step-1": 42 } } }),
    JSON.stringify({ schemaVersion: 1, state: { ...sessionState(), preferences: [] } }),
    JSON.stringify({ schemaVersion: 1, state: { ...sessionState(), answers: null } }),
    JSON.stringify({ schemaVersion: 1, state: sessionState(), catalogue: {} }),
    JSON.stringify({ schemaVersion: 1, state: { ...sessionState(), plan: {} } }),
  ])("rejects incompatible serialization: %s", async (raw) => {
    const storage = memoryStorage()
    storage.data.set(SESSION_STORAGE_KEY, raw)
    expect(await createSessionPersistence(() => storage).load())
      .toMatchObject({ ok: false, data: null, error: { code: "STORED_SESSION_INVALID", operation: "PERSIST-LOAD" } })
  })

  it("handles denied access, absent storage, quota failure and removal failure without throwing", async () => {
    for (const getStorage of [() => null, () => { throw new Error("denied") }]) {
      const adapter = createSessionPersistence(getStorage)
      expect(await adapter.load()).toMatchObject({ ok: false, error: { code: "STORAGE_UNAVAILABLE", operation: "PERSIST-LOAD" } })
      expect(await adapter.save({ schemaVersion: 1, state: sessionState() }))
        .toMatchObject({ ok: false, error: { code: "STORAGE_UNAVAILABLE", operation: "PERSIST-SAVE" } })
      expect(await adapter.clear()).toMatchObject({ ok: false, error: { code: "STORAGE_UNAVAILABLE", operation: "PERSIST-CLEAR" } })
    }
    const storage = memoryStorage()
    const adapter = createSessionPersistence(() => ({ ...storage,
      setItem: () => { throw new Error("quota") }, removeItem: () => { throw new Error("denied") },
    }))
    expect((await adapter.load()).ok).toBe(true)
    expect(await adapter.save({ schemaVersion: 1, state: sessionState() })).toMatchObject({ ok: false, error: { code: "STORAGE_UNAVAILABLE" } })
    expect(await adapter.clear()).toMatchObject({ ok: false, error: { code: "STORAGE_UNAVAILABLE" } })
  })
})
