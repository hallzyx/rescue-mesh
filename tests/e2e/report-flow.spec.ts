import { expect, test, type Page } from "@playwright/test";

async function seedRole(page: Page, role: "reporter" | "responder") {
  await page.addInitScript((nextRole) => {
    window.localStorage.setItem("rescuemesh-role", nextRole);
    if (!window.localStorage.getItem("rescuemesh-peer-id")) {
      window.localStorage.setItem("rescuemesh-peer-id", "E2E001");
    }
  }, role);
}

async function openAs(page: Page, role: "reporter" | "responder", path: string) {
  await seedRole(page, role);
  await page.goto(path);
}

test.describe("e2e: reporter → QVAC → dashboard", () => {
  test("home shows three instance roles", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Enter as Reporter" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Enter as Responder" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Enter as Command Center" })).toBeVisible();
  });

  test("choosing Reporter opens the reporter home", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Enter as Reporter" }).click();
    await expect(page.getByRole("heading", { name: "Report with clarity" })).toBeVisible();
  });

  test("demo director lists 7 steps", async ({ page }) => {
    await page.goto("/demo");
    await expect(page.getByRole("heading", { name: /Phase 3/ })).toBeVisible();
    await expect(page.getByText("Step 7")).toBeVisible();
    await expect(
      page.getByText("The original reporter is gone. The incident isn't.", { exact: true }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /Stop Peer A|Start Peer A/ })).toBeVisible();
  });

  test("Plaza San Martin report becomes a persisted CRITICAL incident", async ({ page }) => {
    await openAs(page, "reporter", "/reporter/report");
    await expect(page.getByRole("heading", { name: "Report Emergency" })).toBeVisible();

    await page.getByRole("button", { name: "EN example (demo)" }).click();
    await expect(page.locator("#report")).toHaveValue(/Plaza San Martin/);

    await page.getByRole("button", { name: "Submit report" }).click();
    await expect(page.getByText("Analyzing locally…")).toBeVisible();
    await expect(page.getByText("CRITICAL", { exact: true })).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(/Plaza San Mart/i).first()).toBeVisible();
    await expect(page.getByText("Medical emergency")).toBeVisible();

    await page.getByRole("button", { name: "Confirm and save" }).click();
    await expect(page.getByText("Incident saved locally")).toBeVisible();

    const idText = await page.getByText(/ID:/).innerText();
    const match = idText.match(/inc-[a-z0-9]+/i);
    expect(match, "saved incident id").toBeTruthy();
    const incidentId = match![0];

    await page.getByRole("button", { name: "View my reports" }).click();
    await expect(page.getByRole("heading", { name: "My Reports" })).toBeVisible();
    await expect(page.getByText(incidentId)).toBeVisible();

    await openAs(page, "responder", "/responder");
    await expect(page.getByRole("heading", { name: "RESCUEMESH" })).toBeVisible();
    await expect(page.getByText(incidentId).first()).toBeVisible();
    await expect(page.getByText("New critical incident")).toBeVisible();

    await page.goto(`/responder/incidents/${incidentId}`);
    await expect(page.getByText("Raw report")).toBeVisible();
    await expect(page.getByRole("button", { name: "Acknowledge" })).toBeEnabled();
    await page.getByRole("button", { name: "Acknowledge" }).click();
    await expect(page.getByText("ACKNOWLEDGED", { exact: true })).toBeVisible();
  });

  test("Spanish example yields English operational summary", async ({ page }) => {
    await openAs(page, "reporter", "/reporter/report");
    await expect(page.getByRole("heading", { name: "Report Emergency" })).toBeVisible();
    await page.getByRole("button", { name: "ES example (translation)" }).click();
    await page.getByRole("button", { name: "Submit report" }).click();
    await expect(page.getByText("CRITICAL", { exact: true })).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText(/CRITICAL incident at Plaza San Mart/i)).toBeVisible();
    await expect(page.getByText("Un bus se estrelló contra un local")).toHaveCount(0);
  });

  test("network diagnostics show runtime values", async ({ page }) => {
    await openAs(page, "reporter", "/reporter/network");
    await expect(page.getByText("Central backend")).toBeVisible();
    await expect(page.getByText("NONE", { exact: true })).toBeVisible();
    await expect(page.getByText(/LOCAL ENGINE|QVAC SDK/)).toBeVisible();
    await expect(page.getByText("ISOLATED", { exact: true })).toBeVisible();
  });
});
