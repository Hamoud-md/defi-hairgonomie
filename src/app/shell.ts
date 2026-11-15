import type { ViewId } from "../domain/models"
import { copy } from "../ui/copy"
import { element } from "../ui/components/common"
import { getLanguage, setLanguage } from "../ui/i18n"
import type { SupportedLanguage } from "../ui/i18n"

export function createShell(
  root: HTMLElement,
  options?: { onLanguageChange?: (lang: SupportedLanguage) => void },
) {
  const shell = element("div", "app-shell")
  const skip = element("a", "skip-link", copy.skip)
  skip.href = "#main-content"
  skip.addEventListener("click", (event) => { event.preventDefault(); main.focus() })
  const header = element("header", "app-header")
  const brand = element("div", "brand")
  const mark = element("span", "brand-mark", "↗")
  mark.setAttribute("aria-hidden", "true")
  const brandName = element("span", "brand-name", copy.brand)
  brand.append(mark, brandName)

  const navContainer = element("div", "app-header-nav")
  const steps = element("ol", "view-steps")
  const views: ViewId[] = ["goal-selection", "journey", "summary"]
  const labelElements: HTMLElement[] = []
  const items = views.map((view, index) => {
    const item = element("li", "")
    const number = element("span", "view-number", `0${index + 1}`)
    const lbl = element("span", "view-label", copy.views[view])
    labelElements.push(lbl)
    item.append(number, lbl)
    steps.append(item)
    return item
  })
  steps.setAttribute("aria-label", copy.viewStepsLabel)

  const langSwitcher = element("div", "lang-switcher")
  langSwitcher.setAttribute("role", "group")
  langSwitcher.setAttribute("aria-label", "Language / Langue / اللغة")
  const langButtons: Record<SupportedLanguage, HTMLButtonElement> = {
    fr: element("button", "lang-btn", "FR"),
    en: element("button", "lang-btn", "EN"),
    ar: element("button", "lang-btn", "العربية"),
  }
  for (const [code, btn] of Object.entries(langButtons) as [SupportedLanguage, HTMLButtonElement][]) {
    btn.type = "button"
    btn.tabIndex = -1
    btn.dataset.lang = code
    btn.setAttribute("aria-pressed", String(getLanguage() === code))
    if (getLanguage() === code) btn.classList.add("is-active")
    btn.addEventListener("click", () => {
      if (getLanguage() !== code) {
        setLanguage(code)
        updateLanguageDisplay()
        options?.onLanguageChange?.(code)
      }
    })
    langSwitcher.append(btn)
  }

  navContainer.append(steps, langSwitcher)
  header.append(brand, navContainer)

  const main = element("main", "main-content")
  main.id = "main-content"
  main.tabIndex = -1
  const live = element("div", "sr-only")
  live.setAttribute("aria-live", "polite")
  live.setAttribute("aria-atomic", "true")
  live.dataset.testid = "live-region"
  const status = element("div", "status-banner")
  status.setAttribute("role", "status")
  status.hidden = true
  const footer = element("footer", "app-footer")
  const footerEyebrow = element("span", "", copy.eyebrow)
  const footerNote = element("span", "", copy.sessionNote)
  footer.append(footerEyebrow, footerNote)

  shell.append(skip, header, main, status, live, footer)
  root.replaceChildren(shell)

  function updateLanguageDisplay() {
    const cur = getLanguage()
    brandName.textContent = copy.brand
    skip.textContent = copy.skip
    steps.setAttribute("aria-label", copy.viewStepsLabel)
    views.forEach((candidate, index) => {
      labelElements[index].textContent = copy.views[candidate]
    })
    footerEyebrow.textContent = copy.eyebrow
    footerNote.textContent = copy.sessionNote
    for (const [code, btn] of Object.entries(langButtons) as [SupportedLanguage, HTMLButtonElement][]) {
      const active = code === cur
      btn.setAttribute("aria-pressed", String(active))
      btn.classList.toggle("is-active", active)
    }
  }

  function render(view: ViewId, title: string, content: HTMLElement) {
    main.dataset.view = view
    views.forEach((candidate, index) => {
      if (candidate === view) items[index].setAttribute("aria-current", "step")
      else items[index].removeAttribute("aria-current")
    })
    updateLanguageDisplay()
    const heading = element("h1", "page-title", title)
    heading.tabIndex = -1
    const intro = element("div", "page-heading")
    intro.append(element("p", "eyebrow", copy.eyebrow), heading)
    main.replaceChildren(intro, content)
  }

  return {
    main,
    render,
    updateLanguageDisplay,
    announce(message: string) { live.textContent = message },
    setStatus(message: string) { status.textContent = message; status.hidden = message.length === 0 },
  }
}
