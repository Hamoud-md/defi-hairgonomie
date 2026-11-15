import { expect, test } from "@playwright/test"
import type { Page } from "@playwright/test"

// Tests on the BUILT production bundle served by `vite preview` (no harness,
// no technical fixture): cahier §11 A01, A03, A05, A06, A07, A08, A10, A11, A14.
const QA = "docs/qa"

function watch(page: Page) {
  const requests: string[] = []
  const failures: string[] = []
  page.on("request", (request) => requests.push(request.url()))
  page.on("requestfailed", (request) => failures.push(request.url()))
  page.on("pageerror", (error) => failures.push(error.message))
  return { requests, failures }
}

async function noHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  expect(overflow).toBeLessThanOrEqual(1)
}

test("A01/A14 — the production preview shows the S01 objective from local assets only", async ({ page }) => {
  const { requests, failures } = watch(page)
  const response = await page.goto("/")
  expect(response?.status()).toBe(200)
  await expect(page.getByRole("radio", { name: /Préparer ma participation à un atelier numérique/ })).toBeVisible()
  await expect(page.getByText("Aucun objectif disponible")).toHaveCount(0)
  await expect(page.locator("body")).not.toContainText("technical-")
  expect(requests.some((url) => /\/assets\/.+\.js$/.test(url))).toBe(true)
  expect(requests.every((url) => url.startsWith("http://127.0.0.1:5179/"))).toBe(true)
  expect(failures).toEqual([])
  await page.screenshot({ path: `${QA}/s01-e01-objectif.png`, fullPage: true })
})

test("A03/A05/A06/A07/A08 — S01 end to end in the normal application", async ({ page }) => {
  const { failures } = watch(page)
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto("/")

  // S01-2: choose the objective and start.
  await page.getByRole("radio", { name: /Préparer ma participation/ }).check()
  await page.getByRole("button", { name: "Commencer" }).click()
  await expect(page.getByRole("heading", { name: "Mon niveau" })).toBeVisible()
  await expect(page.getByText("Étape 1 sur 3")).toBeVisible()

  // A06: empty required answer is refused next to the field, focus on the field.
  await page.getByRole("button", { name: "Continuer" }).click()
  await expect(page.getByRole("alert").filter({ hasText: "Renseignez une réponse" })).toBeVisible()
  await expect(page.getByRole("radiogroup", { name: "Mon aisance numérique" })).toBeFocused()
  await expect(page.getByRole("radiogroup")).toHaveAttribute("aria-invalid", "true")

  // A05: a real business field, saved in the session.
  await page.getByRole("radio", { name: /Débutant/ }).check()
  await page.getByRole("button", { name: "Continuer" }).click()
  await expect(page.getByRole("heading", { name: "Mon support de travail" })).toBeVisible()
  await expect(page.getByText("Étape 2 sur 3")).toBeVisible()
  await expect(page.locator("[data-step-id=niveau]")).toContainText("Débutant")
  await page.screenshot({ path: `${QA}/s01-e02-avant-adaptation.png`, fullPage: true })

  // A03: essentiel -> guide reveals the optional step and explains why.
  await page.getByLabel("Quantité d'explications souhaitée").selectOption("guide")
  await expect(page.getByTestId("current-adaptation")).toBeVisible()
  await expect(page.getByTestId("current-adaptation")).toContainText("parcours guidé")
  await expect(page.getByTestId("current-adaptation")).toContainText("Visibilité")
  await expect(page.getByText("Étape 3 sur 4")).toBeVisible()
  await expect(page.locator("[data-step-id=niveau]")).toContainText("Débutant")
  await page.screenshot({ path: `${QA}/s01-e02-apres-adaptation.png`, fullPage: true })

  // Back reaches the revealed step without losing answers.
  await page.getByRole("button", { name: "Retour" }).click()
  await expect(page.getByRole("heading", { name: "Conseils complémentaires" })).toBeVisible()
  await page.getByRole("checkbox", { name: "J'ai lu ces conseils" }).check()
  await page.getByRole("button", { name: "Continuer" }).click()

  await page.getByRole("radio", { name: "Ordinateur" }).check()
  await page.getByRole("button", { name: "Continuer" }).click()
  await expect(page.getByRole("heading", { name: "Ma checklist" })).toBeVisible()
  await page.getByRole("radio", { name: "Je suis prêt" }).check()
  await page.getByRole("button", { name: "Continuer" }).click()

  // A08: faithful summary, true completion.
  await expect(page.getByText("Parcours terminé")).toBeVisible()
  await expect(page.getByText("3 / 3 étapes requises validées")).toBeVisible()
  const main = page.getByRole("main")
  await expect(main).toContainText("Débutant")
  await expect(main).toContainText("Ordinateur")
  await expect(main).toContainText("Je suis prêt")
  await expect(main).toContainText("Guidé")
  await expect(main).toContainText("aucune inscription")
  await page.screenshot({ path: `${QA}/s01-e03-synthese.png`, fullPage: true })

  // A07: go back and correct the level; the summary is adjusted.
  await page.getByRole("button", { name: "Modifier", exact: true }).click()
  await page.locator("[data-step-id=niveau]").getByRole("button", { name: "Modifier cette réponse" }).click()
  await page.getByRole("radio", { name: /Autonome/ }).check()
  await page.getByRole("button", { name: "Enregistrer la correction" }).click()
  await expect(page.locator("[data-step-id=niveau]")).toContainText("Autonome")
  await page.getByRole("button", { name: "Voir la synthèse" }).click()
  await expect(main).toContainText("Autonome")
  await expect(main).not.toContainText("Débutant")
  await expect(page.getByText("Parcours terminé")).toBeVisible()

  // F10: confirmed reset back to E01.
  await page.getByRole("button", { name: "Recommencer" }).click()
  await page.getByRole("button", { name: "Confirmer et recommencer" }).click()
  await expect(page.getByRole("radio", { name: /Préparer ma participation/ })).not.toBeChecked()
  expect(failures).toEqual([])
})

test("A10 — responsive at 320 / 768 / 1440 px without horizontal overflow", async ({ page }) => {
  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto("/")
    await page.evaluate(() => localStorage.clear())
    await page.reload()
    await noHorizontalOverflow(page)
    await page.getByRole("radio", { name: /Préparer ma participation/ }).check()
    await page.getByRole("button", { name: "Commencer" }).click()
    await page.getByLabel("Quantité d'explications souhaitée").selectOption("guide")
    await expect(page.getByRole("heading", { name: "Mon niveau" })).toBeVisible()
    await noHorizontalOverflow(page)
    await expect(page.getByRole("button", { name: "Continuer" })).toBeInViewport({ ratio: 0 }).catch(async () => {
      await page.getByRole("button", { name: "Continuer" }).scrollIntoViewIfNeeded()
      await expect(page.getByRole("button", { name: "Continuer" })).toBeVisible()
    })
    if (width === 320) await page.screenshot({ path: `${QA}/s01-mobile-320.png`, fullPage: true })
  }
})

test("A11 — S01 is playable with the keyboard only", async ({ page }) => {
  await page.goto("/")
  const radio = page.getByRole("radio", { name: /Préparer ma participation/ })
  await radio.focus()
  await page.keyboard.press("Space")
  await expect(radio).toBeChecked()
  await page.keyboard.press("Enter")
  await expect(page.getByRole("heading", { name: "Mon niveau" })).toBeVisible()

  async function answer(name: RegExp) {
    const option = page.getByRole("radio", { name })
    await page.keyboard.press("Tab")
    for (let index = 0; index < 20 && !(await option.evaluate((node) => node === document.activeElement)); index++) {
      const focusedRadio = await page.evaluate(() => (document.activeElement as HTMLInputElement | null)?.type === "radio")
      await page.keyboard.press(focusedRadio ? "ArrowDown" : "Tab")
    }
    await expect(option).toBeFocused()
    await page.keyboard.press("Space")
    await expect(option).toBeChecked()
    await page.keyboard.press("Enter")
  }
  await answer(/Débutant/)
  await expect(page.getByRole("heading", { name: "Mon support de travail" })).toBeVisible()
  await answer(/Mobile/)
  await expect(page.getByRole("heading", { name: "Ma checklist" })).toBeVisible()
  await answer(/Des points restent à revoir/)
  await expect(page.getByText("Parcours terminé")).toBeVisible()
})
