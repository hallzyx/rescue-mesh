# Operations

This document covers running the demo director, warming QVAC, starting and stopping peers, and recovering when Peer A is dead.

## Quick path

1. Start A, B, and C as in [Getting Started](GETTING_STARTED.md).
2. Open http://127.0.0.1:43147/demo.
3. Wait for `AI LOCAL ✓` and `P2P CONNECTED ✓`.
4. Record the [7-step script](DEMO.md).

## Demo director

`/demo` is the OBS control surface. It:

- polls P2P status on 43147–43149;
- introduces swarm keys when the mesh is still empty;
- warms QVAC on all three peers;
- opens Reporter, Brigade, and Command with `?demo=1`;
- stops a living peer or starts a dead one.

If you killed Peer A, the director on A is gone. Use http://127.0.0.1:43148/demo.

## Start and stop

| Action | How |
| --- | --- |
| Stop | `POST /api/demo/stop` on that peer. Two-click confirm. Process exits. |
| Start | `POST /api/demo/start` with `{ "peer": "a" \| "b" \| "c" }` from any living peer. Spawns `npx next dev`. |

Both routes return 403 unless the Host is loopback. Playwright tests must not POST stop against a shared server.

`Ctrl+C` in the terminal still works.

## Windows

Use PowerShell environment variables, not `npm run dev:peer-*`. See [Getting Started](GETTING_STARTED.md).

Do not POST stop from a remote host. The kill-switch is a laptop demo control, not a production admin API.

## Logs

Watch the three Next terminals. QVAC SDK parse failures log and then use the local engine. P2P introduce retries while the other process is still binding.

```bash
docker compose logs -f peer-a
```

## Fallback without Pear

If the mesh never connects:

1. Stay on Peer A.
2. Report → QVAC → dashboard on the same process.
3. Narrate Local Crisis Intelligence Copilot. Do not claim a network.

## Related documents

- [Demo script](DEMO.md)
- [Getting started](GETTING_STARTED.md)
- [QVAC](QVAC.md)
- [Pear](PEAR.md)
- [Security](SECURITY.md)
