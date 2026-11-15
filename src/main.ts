import { mountApplication } from "./app/app"
import { loadDemoCatalog } from "./data/catalog"
import { demoAnswerFields, demoPreferenceLabels } from "./data/demo-fields"
import { createLabels } from "./data/labels"
import { createSessionPersistence } from "./platform/persistence"
import { createChoiceRenderer } from "./ui/components/choice-renderer"
import "./ui/tokens.css"

const root = document.querySelector<HTMLDivElement>("#app")

if (!root) {
  throw new Error("Application root not found")
}

const appRoot = root
const answerRenderer = createChoiceRenderer(demoAnswerFields)
let application: ReturnType<typeof mountApplication> | undefined
function boot() {
  application?.destroy()
  const catalog = loadDemoCatalog("QRY-01")
  application = mountApplication(appRoot, catalog.ok
    ? {
      catalog: catalog.data, persistence: createSessionPersistence(), answerRenderer,
      labels: createLabels(catalog.data, demoAnswerFields, demoPreferenceLabels),
    }
    : { bootError: catalog.error.code, retryBoot: boot })
}
boot()
