import { expect, test, type Page } from "@playwright/test";

const GRAU =
  "Part of my building collapsed. There are three of us. One person is trapped and another one is bleeding. We are at Av. Grau 120.";

const PEER_B = process.env.RESCUEMESH_PEER_B_URL ?? "http://127.0.0.1:43148";

async function seedRole(page: Page, role: "reporter" | "responder") {
  await page.addInitScript((nextRole) => {
    window.localStorage.setItem("rescuemesh-role", nextRole);
    if (!window.localStorage.getItem("rescuemesh-peer-id")) {
      window.localStorage.setItem("rescuemesh-peer-id", "DEMO01");
    }
  }, role);
}

async function openAs(page: Page, role: "reporter" | "responder", path: string) {
  await seedRole(page, role);
  await page.goto(`${path}${path.includes("?") ? "&" : "?"}demo=1`);
}

async function peerBReachable(): Promise<boolean> {
  try {
    const response = await fetch(`${PEER_B}/api/p2p/status`, {
      signal: AbortSignal.timeout(1500),
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Guion oficial del PRD §33 — Local Crisis Intelligence Copilot.
 * Un solo proceso: el incidente vive en persistencia local (Fase 1 + fallback Fase 3).
 * Si hay un Peer B en :43148, el último test valida también la réplica P2P.
 */
test.describe("Demo hackathon — 7 pasos", () => {
  test("texto Grau → incidente CRITICAL → dashboard → el incidente permanece", async ({
    page,
    request,
  }) => {
    let incidentId = "";

    await test.step("Paso 1 — Mostrar el runtime (AI LOCAL · CENTRAL SERVER NONE)", async () => {
      await openAs(page, "reporter", "/reporter/network");
      await expect(page.getByText("AI LOCAL")).toBeVisible();
      await expect(page.getByText("CENTRAL SERVER NONE")).toBeVisible();
      await expect(page.getByText("NONE", { exact: true })).toBeVisible();
      await expect(page.getByText(/LOCAL ENGINE|QVAC SDK/)).toBeVisible();

      const status = await request.get("/api/qvac/status");
      expect((await status.json()).externalApi).toBe(false);
    });

    await test.step("Paso 2 — El Reporter escribe Av. Grau 120", async () => {
      await openAs(page, "reporter", "/reporter/report");
      await page.getByRole("button", { name: "Ejemplo EN (demo)" }).click();
      await expect(page.locator("#report")).toHaveValue(GRAU);
      await page.getByRole("button", { name: "Enviar reporte" }).click();
      await expect(page.getByText("Analyzing locally…")).toBeVisible();
    });

    await test.step("Paso 3 — QVAC produce CRITICAL (rescue + medical)", async () => {
      await expect(page.getByText("CRITICAL", { exact: true })).toBeVisible({ timeout: 20_000 });
      await expect(page.getByText("Av. Grau 120").first()).toBeVisible();
      await expect(page.getByText("3 affected")).toBeVisible();
      await expect(page.getByText("1 trapped")).toBeVisible();
      await expect(page.getByText("Medical emergency")).toBeVisible();
      await expect(page.getByText("Rescue", { exact: true })).toBeVisible();
      await expect(page.getByText("Medical", { exact: true })).toBeVisible();

      await page.getByRole("button", { name: "Confirmar y guardar" }).click();
      await expect(page.getByText("Incidente guardado localmente")).toBeVisible();
      const idText = await page.getByText(/ID:/).innerText();
      const match = idText.match(/inc-[a-z0-9]+/i);
      expect(match, "ID de incidente de demo").toBeTruthy();
      incidentId = match![0];
    });

    await test.step("Paso 4 — El Responder recibe NEW CRITICAL INCIDENT", async () => {
      await openAs(page, "responder", "/responder");
      await expect(page.getByText("New critical incident")).toBeVisible();
      await expect(page.getByText(incidentId).first()).toBeVisible();
      await expect(page.getByText("Av. Grau 120").first()).toBeVisible();
    });

    await test.step("Paso 5 — Network Diagnostics lee el runtime (sin fixtures)", async () => {
      await openAs(page, "responder", "/responder/network");
      await expect(page.getByText("Node")).toBeVisible();
      await expect(page.getByText("------")).toHaveCount(0);
      await expect(page.getByText("NONE", { exact: true })).toBeVisible();

      const p2p = await request.get("/api/p2p/status").then((response) => response.json());
      expect(p2p.peerId).toMatch(/^[A-F0-9]{6}$/);
    });

    await test.step("Paso 6 — Cerrar el Reporter (sesión / rol)", async () => {
      await page.getByRole("button", { name: "Cambiar rol" }).click();
      await expect(page.getByRole("heading", { name: "RescueMesh" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Entrar como Reporter" })).toBeVisible();
    });

    await test.step("Paso 7 — El incidente permanece (The original reporter is gone. The incident isn't.)", async () => {
      await openAs(page, "responder", "/responder");
      await expect(page.getByText(incidentId).first()).toBeVisible();
      await expect(page.getByText("New critical incident")).toBeVisible();

      await page.reload();
      await expect(page.getByText(incidentId).first()).toBeVisible();
    });
  });

  test("Demo P2P — Peer B recibe el incidente si está en :43148", async ({ request }) => {
    test.skip(
      !(await peerBReachable()),
      "Levanta Peer B con `npm run dev:peer-b` para este paso del demo.",
    );

    const analyzed = await request.post("/api/qvac/analyze", {
      data: { rawReport: GRAU },
    });
    const { extraction } = await analyzed.json();
    const incident = {
      id: `inc-demo-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
      createdByPeerId: "DEMOA1",
      rawReport: GRAU,
      priority: extraction.priority,
      status: "new",
      location: extraction.location,
      affectedPeople: extraction.affectedPeople,
      trappedPeople: extraction.trappedPeople,
      medicalEmergency: extraction.medicalEmergency,
      needs: extraction.needs,
      summary: extraction.summary,
      syncStatus: "pending",
    };

    const published = await request.post("/api/p2p/incidents", { data: { incident } });
    expect(published.ok()).toBeTruthy();

    let found = false;
    for (let attempt = 0; attempt < 15; attempt++) {
      const listed = await fetch(`${PEER_B}/api/p2p/incidents`).then((response) => response.json());
      found = (listed.incidents ?? []).some((item: { id: string }) => item.id === incident.id);
      if (found) break;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    expect(found, `Peer B debía recibir ${incident.id} por Pear/Hyperswarm`).toBeTruthy();
  });
});
