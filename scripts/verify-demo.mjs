const BASE = process.env.RESCUEMESH_URL ?? "http://127.0.0.1:43147";

const EN =
  "Part of my building collapsed. There are three of us. One person is trapped and another one is bleeding. We are at Av. Grau 120.";
const ES =
  "Se cayó parte del edificio. Somos tres, una persona está atrapada y otra está sangrando. Estamos en Av. Grau 120.";

async function analyze(rawReport) {
  const response = await fetch(`${BASE}/api/qvac/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rawReport }),
  });
  if (!response.ok) {
    throw new Error(`analyze failed: ${response.status}`);
  }
  return response.json();
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const en = await analyze(EN);
assert(en.extraction?.priority === "critical", `EN priority: ${en.extraction?.priority}`);
assert(en.extraction?.location === "Av. Grau 120", `EN location: ${en.extraction?.location}`);
assert(en.extraction?.affectedPeople === 3, `EN affected: ${en.extraction?.affectedPeople}`);
assert(en.extraction?.trappedPeople === 1, `EN trapped: ${en.extraction?.trappedPeople}`);
assert(en.extraction?.medicalEmergency === true, "EN medical");
assert(en.extraction?.needs.includes("rescue"), "EN rescue");
assert(en.extraction?.needs.includes("medical"), "EN medical need");
assert(!en.extraction?.needs.includes("infrastructure"), "EN should not tag infrastructure");

const es = await analyze(ES);
assert(es.extraction?.priority === "critical", `ES priority: ${es.extraction?.priority}`);
assert(es.extraction?.summary?.includes("CRITICAL"), `ES summary: ${es.extraction?.summary}`);
assert(!es.extraction?.summary?.includes("Se cayó"), "ES summary should be English");

const status = await fetch(`${BASE}/api/qvac/status`).then((r) => r.json());
assert(status.externalApi === false, "External AI API must be false");

console.log("Demo cases OK");
console.log(JSON.stringify({ en: en.extraction, es: es.extraction, status }, null, 2));
