# RescueMesh — Plan de implementación

Tablero del plan de acción para construir el **MVP de RescueMesh** según el PRD.

RescueMesh convierte reportes humanos desordenados en incidentes estructurados y priorizados, con **QVAC local** y, en una segunda fase, **replicación Pear**. No reemplaza WhatsApp. No afirma funcionar sin ningún canal físico.

> WhatsApp communicates. RescueMesh coordinates.

Este repo es el plan, no el producto. La fuente de verdad del alcance es [`docs/PRD.md`](./docs/PRD.md).

## Cómo usarlo

```bash
npm install
npm run dev
```

La app queda en [http://127.0.0.1:43147](http://127.0.0.1:43147).

Marca tareas a medida que las cierres. El avance se guarda en el navegador.

La versión en Markdown está en [`PLAN.md`](./PLAN.md).

## Orden obligatorio (PRD §27)

0. **Skeleton** — UI, roles, incidente fake, dashboard.
1. **QVAC Crisis Copilot** — texto → QVAC local → JSON → persistencia → dashboard. Submission QVAC + General.
2. **Pear / RescueMesh** — dos peers, sync de incidentes y estados. Submission QVAC + Pears + General.
3. **Demo Reliability** — modelo precargado, errores, OBS, ensayo de 7 pasos.
4. **Stretch** — audio, traducción, deduplicación, tercer peer. Solo si el núcleo ya funciona.

Si Pear no llega, no se cancela: se presenta el copilot local.

## Stack de este tablero

Next.js, TypeScript, Tailwind CSS y shadcn/ui. Sin backend.
