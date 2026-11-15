import type { ViewId } from "../domain/models"

// Navigation is presentation state only. The application checks command results.
export function createNavigation(initial: ViewId = "goal-selection") {
  let current = initial
  return { get current() { return current }, set(view: ViewId) { current = view } }
}

export function focusHeading(main: HTMLElement): void {
  main.querySelector<HTMLElement>("h1")?.focus()
}
