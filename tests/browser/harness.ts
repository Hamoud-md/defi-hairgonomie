import { mountApplication } from "../../src/app/app"
import { createShell } from "../../src/app/shell"
import { focusHeading } from "../../src/platform/navigation"
import { createSessionController } from "../../src/application/session-controller"
import { loadCatalog } from "../../src/data/catalog"
import { element, button, emptyState } from "../../src/ui/components/common"
import type { AnswerRenderer } from "../../src/ui/components/answer-form"
import type { ContractResult, ViewId } from "../../src/domain/models"
import { createSessionPersistence } from "../../src/platform/persistence"
import { adaptationContents } from "../unit/fixtures/adaptation-fixtures"
import "../../src/ui/tokens.css"

const mode = new URLSearchParams(location.search).get("mode") ?? "normal"
const root = document.getElementById("app")!
const source = mode === "empty" ? { objectives: [], steps: [], preferences: [], rules: [] } : adaptationContents()
const contents = {
  ...source,
  objectives: source.objectives.map((objective) => ({ ...objective, titre: `technical-${objective.id}`, description: `technical-description-${objective.id}` })),
  preferences: source.preferences.map((preference) => ({ ...preference, description: `technical-${preference.id}` })),
}
const loaded = loadCatalog(contents, "QRY-01")
if (!loaded.ok) throw new Error(loaded.error.message)
let catalog = loaded.data
if (mode === "invalid") catalog = { ...catalog, getRules: () => [{ id: "invalid", condition: { kind: "always" },
  stepIds: ["unknown"], effect: { kind: "step_order", order: 0 }, explication: "technical" }] }

const renderer: AnswerRenderer = ({ draft, id, onChange }) => {
  if (mode === "render-error") throw new Error("technical-render-error")
  const field = element("div", "field")
  const label = element("label", "", "technical-answer")
  label.htmlFor = id
  const input = element("input", "")
  input.id = id; input.type = "text"
  input.value = typeof draft === "string" ? draft : draft?.join(", ") ?? ""
  input.addEventListener("input", () => onChange(input.value))
  field.append(label, input)
  return { element: field, control: input, read: () => {
    if (mode === "reader-error") throw new Error("technical-read-error")
    return mode === "invalid-answer" ? 42 as unknown as string : input.value
  } }
}

if (mode === "shell") {
  const shell = createShell(root)
  shell.setStatus("technical-status")
  const views: ViewId[] = ["goal-selection", "journey", "summary"]
  let index = 0
  function show() {
    const content = emptyState("technical-empty", "technical-description")
    content.append(button("technical-next-view", () => { index = (index + 1) % views.length; show(); focusHeading(shell.main) }))
    shell.render(views[index], `technical-${views[index]}`, content)
  }
  show()
} else {
  const controller = createSessionController(catalog)
  const select = controller.selectObjective
  controller.selectObjective = (input) => {
    root.dataset.selectionCommands = String(Number(root.dataset.selectionCommands ?? "0") + 1)
    return select(input)
  }
  if (mode === "command-error") controller.validateStep = () => { throw new Error("technical-command-error") }
  if (mode === "unknown-error") controller.validateStep = () => ({ ok: false, data: null, error: {
    code: "UNKNOWN_CODE", operation: "CMD-03", message: "technical",
  } }) as unknown as ReturnType<typeof controller.validateStep>
  if (mode === "session-missing") controller.getSessionView = () => ({ ok: false, data: null,
    error: { code: "SESSION_REQUIRED", operation: "QRY-02", message: "technical" } }) as ContractResult<never>
  const persistence = mode === "persist-blocked" ? createSessionPersistence(() => { throw new Error("technical-storage-denied") })
    : mode === "persist-save-failed" ? createSessionPersistence(() => ({
      getItem: (key) => localStorage.getItem(key), removeItem: (key) => localStorage.removeItem(key),
      setItem: () => { throw new Error("technical-quota") },
    }))
    : mode === "persist-clear-failed" ? createSessionPersistence(() => ({
      getItem: (key) => localStorage.getItem(key), setItem: (key, value) => localStorage.setItem(key, value),
      removeItem: () => { throw new Error("technical-remove-denied") },
    })) : mode.startsWith("persist") ? createSessionPersistence() : undefined
  const app = mountApplication(root, { catalog, controller, persistence,
    ...(mode === "missing-fields" ? {} : { answerRenderer: renderer }) })
  // Test synchronization only: not shipped in the application bundle.
  app.ready.then(() => { root.dataset.bootReady = "true" })
}
