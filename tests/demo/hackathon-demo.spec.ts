import { expect, test, type Page } from "@playwright/test";

const GRAU =
  "Part of my building collapsed. There are three of us. One person is trapped and another one is bleeding. We are at Av. Grau 120.";

const PEER_A = process.env.RESCUEMESH_URL ?? "http://127.0.0.1:43147";
const PEER_B = process.env.RESCUEMESH_PEER_B_URL ?? "http://127.0.0.1:43148";

type P2PStatus = {
  peerId: string;
  publicKey: string;
  swarmPublicKey?: string;
  connectedCount: number;
  isolated: boolean;
};

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

async function fetchStatus(base: string): Promise<P2PStatus> {
  const response = await fetch(`${base}/api/p2p/status`);
  if (!response.ok) {
    throw new Error(`${base}/api/p2p/status → ${response.status}`);
  }
  return response.json() as Promise<P2PStatus>;
}

async function introduce(from: string, swarmPublicKey: string) {
  const response = await fetch(`${from}/api/p2p/introduce`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ publicKey: swarmPublicKey }),
  });
  if (!response.ok) {
    throw new Error(`${from}/api/p2p/introduce → ${response.status} ${await response.text()}`);
  }
}

async function connectMesh() {
  const [a, b] = await Promise.all([fetchStatus(PEER_A), fetchStatus(PEER_B)]);
  expect(a.swarmPublicKey, "Peer A swarm key").toMatch(/^[a-f0-9]{64}$/i);
  expect(b.swarmPublicKey, "Peer B swarm key").toMatch(/^[a-f0-9]{64}$/i);

  await introduce(PEER_A, b.swarmPublicKey!);
  await introduce(PEER_B, a.swarmPublicKey!);

  for (let attempt = 0; attempt < 20; attempt++) {
    const [nextA, nextB] = await Promise.all([fetchStatus(PEER_A), fetchStatus(PEER_B)]);
    if (nextA.connectedCount > 0 && nextB.connectedCount > 0) {
      return { a: nextA, b: nextB };
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error("A y B no formaron mesh P2P (Hyperswarm joinPeer).");
}

/**
 * Guion oficial del PRD §33 — ambos peers arriba.
 * Pasos 1–7 en Peer A (mismo proceso / persistencia local).
 * El test P2P exige réplica A → B por Pear.
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

  test("Demo P2P — Peer B recibe el incidente de Peer A", async ({ request }) => {
    const mesh = await connectMesh();
    expect(mesh.a.peerId).not.toBe(mesh.b.peerId);

    const analyzed = await request.post("/api/qvac/analyze", {
      data: { rawReport: GRAU },
    });
    const { extraction } = await analyzed.json();
    const incident = {
      id: `inc-demo-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
      createdByPeerId: mesh.a.peerId,
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
    for (let attempt = 0; attempt < 20; attempt++) {
      const listed = await fetch(`${PEER_B}/api/p2p/incidents`).then((response) => response.json());
      found = (listed.incidents ?? []).some((item: { id: string }) => item.id === incident.id);
      if (found) break;
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    expect(found, `Peer B debía recibir ${incident.id} por Pear/Hyperswarm`).toBeTruthy();
  });
});
