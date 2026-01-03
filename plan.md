Sí, Emeldo. Aquí tienes un plan de implementación tipo “roadmap de ingeniería” para ScanStock, alineado con offline-first, paywall limpio, y listo para App Store. (V1 → V1.2)

⸻

🛠️ Plan de Implementación — ScanStock

0) Setup inicial (Día 0–1)

Objetivo: repositorio, base técnica y estándares.
	•	Repo (GitHub) + ramas: main, dev
	•	CI básico: lint + tests
	•	Stack recomendado:
	•	React Native + Expo (rápido para App Store)
	•	SQLite (expo-sqlite o WatermelonDB si quieres más robustez)
	•	FileSystem para fotos/backups
	•	Convenciones:
	•	Clean architecture simple: domain/, data/, ui/
	•	Feature folders: inventory/, scanner/, backup/, billing/

Entregable: app abre, navegación lista, DB inicial creada.

⸻

V1 (rápido) — Offline + Pro Local (backup archivo)

1) Módulo de datos local (Día 1–3)

Objetivo: inventario completo offline.
	•	Modelo SQLite:
	•	products(id, name, barcode, price, stock, photo_path, updated_at)
	•	settings(key, value)
	•	CRUD productos
	•	Índices:
	•	barcode unique
	•	updated_at index
	•	Capa repositorio:
	•	ProductRepository
	•	SettingsRepository

Criterio de listo: puedes crear/editar/buscar productos y no se pierde nada al reiniciar.

⸻

2) UI MVP (Día 3–6)

Objetivo: pantallas principales operativas.
	•	Home (lista + search + +/- stock)
	•	Producto detalle
	•	Crear/Editar producto
	•	Ajustes

Extras de calidad:
	•	Empty states (inventario vacío)
	•	Validaciones (nombre requerido, precio numérico)
	•	Formato moneda

Criterio de listo: flujo completo sin scanner.

⸻

3) Scanner (Día 6–8)

Objetivo: scan rápido con fallback.
	•	Cámara + detección barcode
	•	Si existe barcode → abre detalle
	•	Si no existe → abre “Crear producto” con barcode prellenado
	•	Vibración / sonido (opcional)

Criterio de listo: escaneas 20 productos seguidos sin crashear.

⸻

4) Fotos de producto (Día 8–9)

Objetivo: catálogo usable.
	•	Tomar foto / seleccionar de galería
	•	Guardar en sandbox local (ruta persistente)
	•	Miniaturas en lista

Criterio de listo: fotos persisten tras cerrar app.

⸻

5) Pro Local — Backup & Restore (Día 9–12)

Objetivo: vender el pago único con valor real.

Backup:
	•	Exportar:
	•	db.sqlite (o dump JSON si prefieres)
	•	carpeta photos/
	•	manifest.json (versión, device, timestamp, app_version)
	•	Comprimir en ZIP
	•	Guardar en Files / compartir

Restore:
	•	Importar ZIP
	•	Validar manifest
	•	Reemplazar DB + fotos (con confirmación)
	•	Reiniciar cache/UI

Exportar (Pro):
	•	CSV (productos)
	•	PDF simple (lista)

Criterio de listo: backup/restore probado en otro teléfono o simulador limpio.

⸻

6) Paywall + IAP (Día 12–15)

Objetivo: monetización sin fricción.
	•	Estados de plan:
	•	Free
	•	Pro Local (one-time)
	•	Pro Cloud (sub)
	•	Integración In-App Purchases (StoreKit / Google Billing vía librería RN)
	•	Pantalla “Copia de seguridad” (paywall)
	•	Feature gating:
	•	Free: no export/backup
	•	Pro Local: sí backup local + export
	•	Cloud: habilita UI cloud (aunque aún no exista en V1)

Criterio de listo: compras funcionan en sandbox + restore de compra.

⸻

7) QA + Release V1 (Día 15–18)
	•	Test cases:
	•	0→1000 productos
	•	scan repetido
	•	backup/restore con fotos
	•	app kill/reopen
	•	Performance:
	•	búsqueda rápida (index)
	•	lista con paginación si necesario
	•	App Store:
	•	screenshots (basados en D)
	•	privacidad: “datos no recolectados” (si aplica)

Entregable V1: Offline completo + Pro Local.

⸻

V1.1 — Cloud Backup Manual

8) Backend mínimo (Semana 3)

Objetivo: cloud sin sync engine.

Servicios:
	•	Auth (email+pass o Apple/Google)
	•	API:
	•	POST /backup (subida)
	•	GET /backup/latest
	•	GET /backup/list (historial)
	•	Storage blob (S3/GCS/Azure)
	•	Metadata DB (Postgres o Firestore):
	•	user_id, size, timestamp, version

Criterio de listo: puedes subir ZIP y bajarlo en otro dispositivo.

⸻

9) App: Cloud manual (Semana 3)
	•	Login
	•	Botón “Backup ahora”
	•	Botón “Restaurar último”
	•	Mostrar:
	•	último backup
	•	espacio usado
	•	historial simple

Entregable V1.1: Cloud manual estable.

⸻

V1.2 — Cloud Automático + Restore robusto

10) Auto-backup diario (Semana 4)
	•	Detectar cambios (flag “dirty” por updated_at / contador)
	•	Job 1 vez al día si hay cambios
	•	Retry/backoff
	•	Limitar versiones (ej. últimas 10)

Entregable V1.2: backup automático + versiones.

⸻

✅ Checklist de “Definition of Done”

Para cada entrega:
	•	Sincronicidad: no bloquea UI
	•	Datos persistentes y consistentes
	•	Manejo de errores con mensajes claros
	•	Pruebas en dispositivo real
	•	Crash-free sessions (mínimo)

⸻

⏱️ Estimación rápida (realista)
	•	V1: ~3 semanas
	•	V1.1: +1 semana
	•	V1.2: +1 semana

⸻
