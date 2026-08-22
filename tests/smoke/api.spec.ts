import { expect, test } from "@playwright/test";
import { GRAU_EN, GRAU_ES, ROUTES } from "../fixtures";

test.describe("smoke: pages", () => {
  for (const route of ROUTES) {
    test(`GET ${route} returns HTML`, async ({ request }) => {
      const response = await request.get(route);
      expect(response.status(), route).toBeLessThan(500);
      const contentType = response.headers()["content-type"] ?? "";
      expect(contentType).toMatch(/text\/html/);
    });
  }
});

test.describe("smoke: QVAC API", () => {
  test("status reports local processing and no cloud API", async ({ request }) => {
    const response = await request.get("/api/qvac/status");
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.externalApi).toBe(false);
    expect(["local-engine", "qvac-sdk"]).toContain(body.provider);
  });

  test("warmup completes", async ({ request }) => {
    const response = await request.post("/api/qvac/warmup");
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.ready).toBe(true);
  });

  test("rejects missing rawReport", async ({ request }) => {
    const response = await request.post("/api/qvac/analyze", { data: {} });
    expect(response.status()).toBe(400);
  });

  test("short report fails validation", async ({ request }) => {
    const response = await request.post("/api/qvac/analyze", {
      data: { rawReport: "too short" },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.extraction).toBeUndefined();
    expect(body.issues?.[0]?.field).toBe("rawReport");
  });

  test("Av. Grau EN → CRITICAL rescue+medical", async ({ request }) => {
    const response = await request.post("/api/qvac/analyze", {
      data: { rawReport: GRAU_EN },
    });
    expect(response.ok()).toBeTruthy();
    const { extraction } = await response.json();
    expect(extraction.priority).toBe("critical");
    expect(extraction.location).toBe("Av. Grau 120");
    expect(extraction.affectedPeople).toBe(3);
    expect(extraction.trappedPeople).toBe(1);
    expect(extraction.medicalEmergency).toBe(true);
    expect(extraction.needs).toEqual(expect.arrayContaining(["rescue", "medical"]));
    expect(extraction.needs).not.toContain("infrastructure");
  });

  test("Av. Grau ES → English operational summary", async ({ request }) => {
    const response = await request.post("/api/qvac/analyze", {
      data: { rawReport: GRAU_ES },
    });
    expect(response.ok()).toBeTruthy();
    const { extraction } = await response.json();
    expect(extraction.priority).toBe("critical");
    expect(extraction.summary).toMatch(/CRITICAL/i);
    expect(extraction.summary).not.toMatch(/Se cayó/);
    expect(extraction.needs).toEqual(expect.arrayContaining(["rescue", "medical"]));
  });
});

test.describe("smoke: P2P API", () => {
  test("status has peer identity and no central backend fields", async ({ request }) => {
    const response = await request.get("/api/p2p/status");
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.peerId).toMatch(/^[A-F0-9]{6}$/);
    expect(typeof body.publicKey).toBe("string");
    expect(body.publicKey.length).toBeGreaterThan(8);
    expect(typeof body.isolated).toBe("boolean");
    expect(typeof body.connectedCount).toBe("number");
    expect(Array.isArray(body.connectedPeers)).toBe(true);
  });

  test("publish and list incident", async ({ request }) => {
    const incident = {
      id: `inc-smoke-${Date.now()}`,
      createdAt: new Date().toISOString(),
      createdByPeerId: "SMOKE1",
      rawReport: GRAU_EN,
      priority: "critical",
      status: "new",
      location: "Av. Grau 120",
      affectedPeople: 3,
      trappedPeople: 1,
      medicalEmergency: true,
      needs: ["rescue", "medical"],
      summary: "CRITICAL smoke incident at Av. Grau 120.",
      syncStatus: "pending",
    };

    const posted = await request.post("/api/p2p/incidents", { data: { incident } });
    expect(posted.ok()).toBeTruthy();
    const saved = await posted.json();
    expect(saved.incident.id).toBe(incident.id);
    expect(["pending", "synced"]).toContain(saved.incident.syncStatus);

    const listed = await request.get("/api/p2p/incidents");
    expect(listed.ok()).toBeTruthy();
    const { incidents } = await listed.json();
    expect(incidents.some((item: { id: string }) => item.id === incident.id)).toBe(true);
  });

  test("rejects incident without id", async ({ request }) => {
    const response = await request.post("/api/p2p/incidents", { data: {} });
    expect(response.status()).toBe(400);
  });
});
