import { copy } from "../copy"
import { button, element } from "./common"

export function confirmDialog(root: HTMLElement, onConfirm: () => void): () => void {
  const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null
  const dialog = element("dialog", "")
  const title = element("h2", "", copy.dialogTitle)
  title.id = "restart-dialog-title"
  const description = element("p", "", copy.dialogBody)
  description.id = "restart-dialog-description"
  dialog.setAttribute("aria-labelledby", title.id)
  dialog.setAttribute("aria-describedby", description.id)
  const actions = element("div", "actions")
  const cancel = button(copy.cancel, () => dialog.close())
  const confirm = button(copy.confirm, () => { dialog.close(); onConfirm() }, true)
  cancel.autofocus = true
  dialog.addEventListener("keydown", (event) => {
    if (event.key !== "Tab") return
    if (event.shiftKey && document.activeElement === cancel) {
      event.preventDefault(); confirm.focus()
    } else if (!event.shiftKey && document.activeElement === confirm) {
      event.preventDefault(); cancel.focus()
    }
  })
  actions.append(cancel, confirm)
  dialog.append(title, description, actions)
  dialog.addEventListener("close", () => {
    dialog.remove()
    if (trigger?.isConnected) trigger.focus()
  }, { once: true })
  root.append(dialog)
  dialog.showModal()
  cancel.focus()
  return () => { if (dialog.open) dialog.close(); dialog.remove() }
}
