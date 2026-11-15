import { copy, errorMessage } from "../copy"

export function element<K extends keyof HTMLElementTagNameMap>(tag: K, className = "", text?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag)
  node.className = className
  if (text !== undefined) node.textContent = text
  return node
}

export function button(label: string, action?: () => void, primary = false): HTMLButtonElement {
  const node = element("button", primary ? "button button-primary" : "button button-secondary", label)
  node.type = "button"
  node.addEventListener("click", (event) => {
    if (event.detail > 1) { event.preventDefault(); return }
    action?.()
  })
  return node
}

export function emptyState(title: string, body: string): HTMLElement {
  const box = element("section", "empty-state")
  const mark = element("span", "empty-mark", "↗")
  mark.setAttribute("aria-hidden", "true")
  box.append(mark, element("h2", "", title), element("p", "muted", body))
  return box
}

export function errorState(code: string, retry: () => void): HTMLElement {
  const box = element("section", "error-state")
  box.setAttribute("role", "alert")
  box.append(element("h2", "", copy.errorTitle), element("p", "", errorMessage(code)), button(copy.retry, retry))
  return box
}

export function localError(message: string, id: string): HTMLElement {
  const node = element("p", "field-error", message)
  node.id = id
  node.setAttribute("role", "alert")
  return node
}

export function idFor(kind: string, id: string): string { return `${kind}-${encodeURIComponent(id)}` }
