#!/bin/sh
set -eu

export RESCUEMESH_P2P_HOST="${RESCUEMESH_P2P_HOST:-http://127.0.0.1:43700}"
export RESCUEMESH_P2P_HOST_PORT="${RESCUEMESH_P2P_HOST_PORT:-43700}"

nohup node /app/p2p/node-host.cjs >/tmp/p2p-host.log 2>&1 &
HOST_PID=$!

# No trap EXIT: `exec next` would kill the host. Docker stops the cgroup.

for _ in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20; do
  if node -e "fetch('http://127.0.0.1:${RESCUEMESH_P2P_HOST_PORT}/status').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"; then
    break
  fi
  if ! kill -0 "$HOST_PID" 2>/dev/null; then
    echo "[entrypoint] p2p-host exited" >&2
    cat /tmp/p2p-host.log >&2 || true
    exit 1
  fi
  sleep 0.5
done

if ! node -e "fetch('http://127.0.0.1:${RESCUEMESH_P2P_HOST_PORT}/status').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"; then
  echo "[entrypoint] p2p-host no respondió a tiempo" >&2
  cat /tmp/p2p-host.log >&2 || true
  exit 1
fi

exec ./node_modules/.bin/next start -H 0.0.0.0 -p "${PORT:-43147}"
