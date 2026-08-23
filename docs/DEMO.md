# RescueMesh demo script

Control screen: [http://127.0.0.1:43147/demo](http://127.0.0.1:43147/demo)

## Automated script

```bash
npm run test:demo
```

Starts Peer A (`:43147`) and Peer B (`:43148`) if they are down, walks the 7 steps in Chromium, and requires B to receive the incident over Pear. No skip.

## Before recording

Start the mesh as in [Getting Started](GETTING_STARTED.md). Then:

1. Open [http://127.0.0.1:43147/demo](http://127.0.0.1:43147/demo). The director introduces A and B if the mesh is still empty.
2. Wait for **AI LOCAL ✓** and **P2P CONNECTED ✓**. Do not record on `P2P ISOLATED` or Peer IDs `------` / `offline`.
3. From the director: **Open Report Emergency** (A) and **Open Dashboard** (B), side by side, with `?demo=1`.

## Fallback without Pear

If P2P does not connect, record only Peer A:

1. `/reporter/report?demo=1` → Plaza San Martin example → confirm.
2. `/responder?demo=1` on the same instance → local dashboard.
3. Narration: **Local Crisis Intelligence Copilot** (QVAC). Do not claim a mesh.

## 7-step flow

### Step 1 — Runtime

Show the top bar:

```text
AI LOCAL ✓
P2P CONNECTED ✓
CENTRAL SERVER NONE
```

Open Network on both peers briefly.

### Step 2 — The Reporter writes

Peer A (`/reporter/report?demo=1`):

> A bus crashed into a storefront. There are three of us. One person is trapped and another one is bleeding. We are at Plaza San Martin.

Click **EN example (demo)** → **Submit report**.

### Step 3 — QVAC structures it

Show **Analyzing locally…** and the card:

```text
CRITICAL
Plaza San Martin
3 affected · 1 trapped · Medical emergency
Needs: Rescue, Medical
```

Confirm and save.

### Step 4 — The Responder receives it

Peer B (`/responder?demo=1`): **New critical incident** at the top of the dashboard.

### Step 5 — Honest diagnostics

Open `/reporter/network?demo=1` and `/responder/network?demo=1`.

Read Peer IDs from runtime. Do not use fixtures.

### Step 6 — Stop Peer A

On the director (`/demo`) or Peer A (`?demo=1`): **Stop Peer A** → confirm. It kills the Node process, not just the tab. `Ctrl+C` in the terminal still works.

### Step 7 — The incident remains

Peer B still shows the incident.

> **The original reporter is gone. The incident isn't.**

That is the end of the 7-step script. If recording continues:

1. **Command Center** (`http://127.0.0.1:43149/responder?demo=1`) — same replica, another store.
2. **Network** on B — Peer A reads OFFLINE without a reload.
3. If A is dead, open the director on B: `http://127.0.0.1:43148/demo`. The A control becomes **Start Peer A**.

## Expected errors (clean UI)

| Situation | What the UI shows |
| --- | --- |
| Invalid QVAC JSON | Manual review (no stack trace) |
| QVAC down | Banner + manual form |
| P2P isolated | ISOLATED + `syncStatus: pending` |
| Corrupt localStorage | Warning banner + demo seed restored |

## Stretch

### Audio → QVAC

On `/reporter/report`, click **Dictate report (local)**. Uses the browser Web Speech API (no cloud STT). Transcript follows the same QVAC pipeline.

### Operational translation

Click **ES example (translation)** and submit. `rawReport` stays Spanish; the dashboard `summary` is English.

### Dedup

If two incidents share area, similar impact, and ≤30 minutes, they appear under **Likely duplicates** on the Responder dashboard. They are not deleted or merged automatically.

### Third peer

```bash
npx next dev --port 43149
```

Open `http://127.0.0.1:43149` → Command Center. Three stores, three Peer IDs, one mesh.

## Credibility checklist

- [ ] Plaza San Martin → CRITICAL + rescue + medical
- [ ] Network Diagnostics without fixtures
- [ ] Stopping A does not delete the incident on B
- [ ] External AI API: NONE
- [ ] Central backend: NONE
