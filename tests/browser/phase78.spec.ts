import { test, expect } from "@playwright/test"
import type { Page } from "@playwright/test"
import { SESSION_SCHEMA_VERSION, SESSION_STORAGE_KEY } from "../../src/platform/persistence"
import { sessionState } from "../unit/fixtures/session-fixtures"

const harness = "/tests/browser/harness.html"
const field = (page: Page) => page.getByLabel("technical-answer", { exact: true })
async function start(page: Page, mode = "persist") {
  await page.goto(`${harness}?mode=${mode}`)
  await page.getByRole("radio", { name: "technical-objective-1", exact: false }).check()
  await page.getByRole("button", { name: "Commencer", exact: true }).click()
}
async function submit(page: Page, value: string) {
  await field(page).fill(value)
  await page.getByTestId("validate-step").click()
}
async function stored(page: Page) {
  return page.evaluate((key) => localStorage.getItem(key), SESSION_STORAGE_KEY)
}
async function seed(page: Page, raw: string) {
  await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), { key: SESSION_STORAGE_KEY, value: raw })
}

test("Phase 7 saves state only, resumes a partial journey, and clears a confirmed reset", async ({ page }) => {
  await start(page)
  await submit(page, "persisted-value-1")
  await expect.poll(() => stored(page)).toContain("persisted-value-1")
  const payload = JSON.parse((await stored(page))!)
  expect(Object.keys(payload).sort()).toEqual(["schemaVersion", "state"])
  expect(Object.keys(payload.state).sort()).toEqual(["activeStepId", "answers", "objectiveId", "preferences"])
  await page.reload()
  await expect(page.getByRole("heading", { level: 2, name: "technical-step-2", exact: true })).toBeVisible()
  await expect(page.getByRole("status")).toContainText("Votre session a été reprise")
  await page.getByRole("button", { name: "Retour", exact: true }).click()
  await expect(field(page)).toHaveValue("persisted-value-1")
  await page.getByTestId("validate-step").click()
  await submit(page, "persisted-value-2")
  await page.reload()
  await expect(page.locator("main")).toHaveAttribute("data-view", "summary")
  await page.getByRole("button", { name: "Recommencer", exact: true }).click()
  await page.getByRole("button", { name: "Confirmer et recommencer" }).click()
  await expect.poll(() => stored(page)).toBeNull()
  await page.reload()
  await expect(page.locator("main")).toHaveAttribute("data-view", "goal-selection")
  await expect(page.locator('input[type="radio"]:checked')).toHaveCount(0)
})

test("Phase 7 preserves the latest state through a rapid sequence of commands", async ({ page }) => {
  await start(page)
  await page.getByLabel("technical-preference-1", { exact: true }).selectOption("value-reorder")
  await page.getByRole("button", { name: "Retour", exact: true }).click()
  await submit(page, "optional-persisted")
  await expect.poll(async () => JSON.parse((await stored(page)) ?? "null")?.state.activeStepId).toBe("step-1")
  await page.reload()
  await expect(page.locator('.answer-row[data-step-id="step-tail"]')).toContainText("optional-persisted")
  await expect(page.getByLabel("technical-preference-1", { exact: true })).toHaveValue("value-reorder")
})

for (const [name, payload] of [
  ["corruption", "not-json"],
  ["unknown version", JSON.stringify({ schemaVersion: 99, state: sessionState() })],
  ["unknown objective", JSON.stringify({ schemaVersion: 1, state: { ...sessionState(), objectiveId: "missing" } })],
  ["invalid cursor", JSON.stringify({ schemaVersion: 1, state: { ...sessionState(), activeStepId: "step-hidden" } })],
  ["invalid answer", JSON.stringify({ schemaVersion: 1, state: { ...sessionState(), answers: { "step-1": "" } } })],
] as const) {
  test(`Phase 7 discards ${name} and permits a fresh journey`, async ({ page }) => {
    await seed(page, payload)
    await page.goto(`${harness}?mode=persist`)
    await expect(page.getByRole("status")).toContainText("La sauvegarde ne peut pas être reprise")
    await expect.poll(() => stored(page)).toBeNull()
    await page.getByRole("radio", { name: "technical-objective-1", exact: false }).check()
    await page.getByRole("button", { name: "Commencer", exact: true }).click()
    await expect(field(page)).toHaveValue("")
  })
}

for (const mode of ["persist-blocked", "persist-save-failed"]) {
  test(`Phase 7 ${mode} never blocks completion or undoes a successful answer`, async ({ page }) => {
    await start(page, mode)
    await submit(page, "value-1")
    await submit(page, "value-2")
    await expect(page.locator("main")).toHaveAttribute("data-view", "summary")
    await expect(page.getByText("value-1", { exact: true }).first()).toBeVisible()
    await expect(page.getByRole("status")).toContainText("La sauvegarde locale est indisponible")
  })
}

test("Phase 7 failed removal still resets the in-memory session and reports the storage limitation", async ({ page }) => {
  await start(page, "persist-clear-failed")
  await submit(page, "value-1")
  await submit(page, "value-2")
  await page.getByRole("button", { name: "Recommencer", exact: true }).click()
  await page.getByRole("button", { name: "Confirmer et recommencer" }).click()
  await expect(page.locator("main")).toHaveAttribute("data-view", "goal-selection")
  await expect(page.getByRole("status")).toContainText("La sauvegarde locale est indisponible")
  await page.getByRole("radio", { name: "technical-objective-1", exact: false }).check()
  await page.getByRole("button", { name: "Commencer", exact: true }).click()
  await expect(field(page)).toHaveValue("")
})

test("Phase 7 never saves away pending invalidation marks, and resumes saving after correction", async ({ page }) => {
  await start(page)
  const preference = page.getByLabel("technical-preference-1", { exact: true })
  await preference.selectOption("value-reorder")
  await page.getByRole("button", { name: "Retour", exact: true }).click()
  await submit(page, "retained-optional")
  await expect.poll(() => stored(page)).toContain("retained-optional")
  await preference.selectOption("value-alt")
  await expect.poll(() => stored(page)).toBeNull()
  await expect(page.getByRole("status")).toContainText("Des réponses restent à corriger")
  await preference.selectOption("value-1")
  await expect(page.getByTestId("invalidated-answers")).toContainText("retained-optional")
  await expect.poll(() => stored(page)).toBeNull()
  await page.getByTestId("invalidated-answers").getByRole("button").click()
  await field(page).fill("corrected-optional")
  await page.getByTestId("save-revision").click()
  await expect.poll(() => stored(page)).toContain("corrected-optional")
  await page.reload()
  await expect(page.getByTestId("invalidated-answers")).toHaveCount(0)
  await expect(page.locator('.answer-row[data-step-id="step-tail"]')).toContainText("corrected-optional")
})

test("Phase 7 revalidates hidden saved answers without inventing a history", async ({ page }) => {
  await seed(page, JSON.stringify({ schemaVersion: SESSION_SCHEMA_VERSION,
    state: sessionState({ answers: { "step-hidden": "retained-hidden" } }) }))
  await page.goto(`${harness}?mode=persist`)
  await expect(page.getByTestId("invalidated-answers")).toContainText("retained-hidden")
  await expect(page.getByTestId("current-adaptation")).toHaveCount(0)
  await expect.poll(() => stored(page)).toBeNull()
})

function luminance(hex: string) {
  const parts = hex.trim().replace("#", "").match(/.{2}/g)!.map((part) => {
    const channel = parseInt(part, 16) / 255
    return channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4
  })
  return parts[0] * .2126 + parts[1] * .7152 + parts[2] * .0722
}
function contrast(first: string, second: string) {
  const a = luminance(first), b = luminance(second)
  return (Math.max(a, b) + .05) / (Math.min(a, b) + .05)
}

test("Phase 8 checks text and focus token contrasts rather than relying on colour alone", async ({ page }) => {
  await start(page, "normal")
  const colors = await page.evaluate(() => {
    const style = getComputedStyle(document.documentElement)
    return Object.fromEntries(["--ink", "--paper", "--muted", "--accent", "--warm", "--focus", "--error"]
      .map((key) => [key, style.getPropertyValue(key).trim()]))
  })
  for (const key of ["--ink", "--muted", "--accent", "--warm", "--error"]) expect(contrast(colors[key], colors["--paper"])).toBeGreaterThanOrEqual(4.5)
  expect(contrast(colors["--focus"], "#f6f5ef")).toBeGreaterThanOrEqual(3)
  await page.getByTestId("validate-step").click()
  await expect(field(page)).toBeFocused()
  await expect(field(page)).toHaveAttribute("aria-invalid", "true")
  const descriptionId = await field(page).getAttribute("aria-describedby")
  await expect(page.locator(`#${descriptionId}`)).toContainText("Renseignez une réponse")
  await expect(page.getByText("Étape requise", { exact: true })).toBeVisible()
})

for (const width of [640, 768, 1440]) {
  test(`Phase 8 200% layout zoom at ${width}px keeps forms and the modal usable`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 })
    await start(page, "normal")
    await page.evaluate(() => { document.documentElement.style.zoom = "2" })
    const fits = async () => expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await fits()
    await submit(page, "zoom-1")
    await submit(page, "zoom-2")
    await fits()
    await page.getByRole("button", { name: "Recommencer", exact: true }).click()
    await expect(page.getByRole("button", { name: "Annuler", exact: true })).toBeFocused()
    await page.keyboard.press("Shift+Tab")
    await expect(page.getByRole("button", { name: "Confirmer et recommencer" })).toBeFocused()
    await fits()
    if (width === 640) await page.screenshot({ path: "test-results/phase8-zoom.png", fullPage: true })
    await page.keyboard.press("Escape")
    await expect(page.getByRole("button", { name: "Recommencer", exact: true })).toBeFocused()
  })
}

test("Phase 8 reduced motion and forced colours retain the full keyboard journey and visible feedback", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce", forcedColors: "active" })
  await start(page, "normal")
  await expect(page.getByRole("heading", { level: 1 })).toBeFocused()
  await page.keyboard.press("Tab")
  await expect(field(page)).toBeFocused()
  expect(await field(page).evaluate((input) => getComputedStyle(input).outlineStyle)).not.toBe("none")
  await page.keyboard.type("reduced-1")
  await page.keyboard.press("Enter")
  await page.keyboard.press("Tab")
  await page.keyboard.type("reduced-2")
  await page.keyboard.press("Enter")
  await expect(page.getByText("Parcours terminé", { exact: true })).toBeVisible()
  expect(await page.evaluate(() => document.getAnimations().filter((animation) => animation.playState === "running").length)).toBe(0)
})

test("Phase 8 form controls have accessible names and valid local error references", async ({ page }) => {
  await start(page, "normal")
  await page.getByTestId("validate-step").click()
  const issues = await page.evaluate(() => {
    const problems: string[] = []
    for (const control of document.querySelectorAll<HTMLInputElement>("input, select, textarea, button")) {
      if (control.hidden) continue
      const label = control.getAttribute("aria-label") || control.labels?.[0]?.textContent || control.textContent
      if (!label?.trim()) problems.push(`missing-name:${control.tagName}`)
      for (const id of (control.getAttribute("aria-describedby") ?? "").split(" ").filter(Boolean)) {
        if (!document.getElementById(id)) problems.push(`missing-description:${id}`)
      }
    }
    return problems
  })
  expect(issues).toEqual([])
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1)
  await expect(page.getByTestId("live-region")).toHaveAttribute("aria-live", "polite")
  await expect(page.getByRole("alert")).toBeVisible()
})
