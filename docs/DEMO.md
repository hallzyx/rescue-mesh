# RescueMesh — Guion de demo (Fase 3)

Pantalla de control: [`/demo`](http://127.0.0.1:43147/demo)

## Preparación (antes de grabar)

```bash
# Terminal A — Reporter
npm run dev:peer-a

# Terminal B — Responder
npm run dev:peer-b
```

1. Abre `/demo` en una tercera ventana o usa OBS para capturar A + B lado a lado.
2. Espera **AI LOCAL ✓** (QVAC warmup completo).
3. Verifica **P2P CONNECTED ✓** en ambas instancias (`?demo=1` activa tipografía grande).

## Fallback sin Pear

Si P2P no conecta, graba solo Peer A:

1. `/reporter/report?demo=1` → ejemplo Av. Grau 120 → confirmar.
2. `/responder?demo=1` en la misma instancia → dashboard local.
3. Narración: **Local Crisis Intelligence Copilot** (QVAC + General).

---

## Flujo de 7 pasos

### Paso 1 — Runtime

Mostrar barra superior:

```text
AI LOCAL ✓
P2P CONNECTED ✓
CENTRAL SERVER NONE
```

Abrir Network en ambos peers brevemente.

### Paso 2 — Reporter escribe

Peer A (`/reporter/report?demo=1`):

> Part of my building collapsed. There are three of us. One person is trapped and another one is bleeding. We are at Av. Grau 120.

Pulsar **Usar ejemplo del demo** → **Enviar reporte**.

### Paso 3 — QVAC estructura

Mostrar **Analyzing locally…** y la tarjeta:

```text
CRITICAL
Av. Grau 120
3 affected · 1 trapped · Medical emergency
Needs: Rescue, Medical
```

Confirmar y guardar.

### Paso 4 — Responder recibe

Peer B (`/responder?demo=1`): banner **NEW CRITICAL INCIDENT** arriba del dashboard.

### Paso 5 — Diagnóstico

Abrir `/reporter/network?demo=1` y `/responder/network?demo=1`.

Leer Peer IDs reales del runtime (no hardcodeados).

### Paso 6 — Cerrar Peer A

Matar el proceso del Reporter (`Ctrl+C` en terminal A).

### Paso 7 — El incidente permanece

Peer B sigue mostrando el incidente.

> **The original reporter is gone. The incident isn't.**

---

## Errores esperados (UI limpia)

| Situación | Qué muestra la UI |
|-----------|-------------------|
| JSON QVAC inválido | Revisión manual (sin stack trace) |
| QVAC caído | Banner + formulario manual |
| P2P aislado | ISOLATED + `syncStatus: pending` |
| localStorage corrupto | Banner de advertencia + seed restaurado |

---

## Checklist de credibilidad

- [ ] Av. Grau 120 → CRITICAL + rescue + medical (estable)
- [ ] Network Diagnostics sin fixtures
- [ ] Cerrar A no borra incidente en B
- [ ] External AI API: NONE
- [ ] Central backend: NONE
