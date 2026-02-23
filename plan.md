# Plan: Scanner Flow + QR Support

## Estado Actual

### Lo que existe (V1 completado):
- Scanner de códigos de barras (EAN13, EAN8, UPC-A, Code128, etc.)
- Flujo: Escanear → Verificar si existe → Crear/Ver producto
- Base de datos SQLite con campo `barcode`
- UI del scanner con animaciones
- CRUD completo de productos
- Fotos de productos
- Backup/Export (Pro)

### Lo que falta:
- Soporte para escanear QR codes
- Generación de QR codes propios
- Guardar/compartir QR codes

---

## Fase 1: Habilitar escaneo de QR codes

### 1.1 Actualizar configuración del scanner
**Archivo:** `app/(tabs)/scanner.tsx`

- [ ] Agregar `'qr'` al array `barcodeScannerSettings.barcodeTypes`
- [ ] Detectar tipo de código escaneado (barcode vs QR)
- [ ] Mostrar icono diferente según tipo detectado

### 1.2 UI del scanner
- [ ] Actualizar texto instructivo para incluir QR
- [ ] Indicador visual cuando se detecta QR vs barcode

---

## Fase 2: Mejorar flujo de escaneo → nuevo producto

### 2.1 Scanner como punto de entrada principal
**Cambios en:** `app/(tabs)/scanner.tsx`

Flujo actual:
```
Abrir Scanner → Escanear código →
  ├─ Producto existe → Ver/Editar producto
  └─ Producto nuevo → Crear con código pre-llenado
```

Mejoras:
- [ ] Feedback más claro cuando se detecta código nuevo vs existente
- [ ] Animación de éxito diferenciada

### 2.2 Pantalla de nuevo producto mejorada
**Archivo:** `app/product/new.tsx`

- [ ] Mostrar el código escaneado prominentemente en la parte superior
- [ ] Opción de re-escanear si el código es incorrecto
- [ ] Modo "escaneo continuo" después de guardar (ya existe, verificar)

---

## Fase 3: Generación y guardado de QR codes

### 3.1 Instalar dependencias
```bash
npx expo install react-native-qrcode-svg react-native-svg
```

### 3.2 Crear servicio de QR
**Nuevo archivo:** `src/services/qr/qrGenerator.ts`

Funcionalidades:
- [ ] Generar QR con datos del producto
- [ ] Formato del QR: JSON con info básica
```json
{
  "app": "scanstock",
  "v": 1,
  "barcode": "123456789",
  "name": "Producto X",
  "price": 10.99
}
```
- [ ] Capturar QR como imagen para guardar

### 3.3 Componente ProductQR
**Nuevo archivo:** `src/components/ProductQR.tsx`

- [ ] Mostrar QR del producto
- [ ] Tamaño configurable
- [ ] Colores personalizables (marca)

### 3.4 Modal de QR
**Nuevo archivo:** `src/components/QRModal.tsx`

- [ ] Modal fullscreen con QR grande
- [ ] Botón "Guardar en Fotos"
- [ ] Botón "Compartir"
- [ ] Info del producto debajo del QR

### 3.5 Integrar en pantalla de producto
**Archivo:** `app/product/[id].tsx`

- [ ] Agregar botón "Ver QR" en la sección de acciones
- [ ] Abrir QRModal al presionar

### 3.6 Guardar QR en galería
**Archivo:** `src/services/qr/qrGenerator.ts`

- [ ] Usar `expo-media-library` para guardar
- [ ] Usar `expo-sharing` para compartir

---

## Fase 4: Importar desde QR (Opcional)

### 4.1 Detectar QR de ScanStock
- [ ] Al escanear QR, verificar si es formato ScanStock
- [ ] Si es de ScanStock, pre-llenar TODOS los campos
- [ ] Mostrar preview de datos antes de crear

---

## Archivos a modificar/crear

### Modificar:
| Archivo | Cambios |
|---------|---------|
| `app/(tabs)/scanner.tsx` | Agregar soporte QR |
| `app/product/[id].tsx` | Botón ver QR |
| `app/product/new.tsx` | Mostrar código escaneado |
| `package.json` | Nuevas dependencias |

### Crear:
| Archivo | Descripción |
|---------|-------------|
| `src/services/qr/qrGenerator.ts` | Servicio de generación |
| `src/components/ProductQR.tsx` | Componente QR |
| `src/components/QRModal.tsx` | Modal con QR y acciones |

---

## Orden de implementación

| # | Tarea | Prioridad |
|---|-------|-----------|
| 1 | Habilitar QR en scanner | Alta |
| 2 | Instalar dependencias QR | Alta |
| 3 | Crear servicio qrGenerator | Alta |
| 4 | Crear componente ProductQR | Alta |
| 5 | Crear QRModal | Alta |
| 6 | Integrar QR en detalle de producto | Alta |
| 7 | Guardar QR en galería | Media |
| 8 | Compartir QR | Media |
| 9 | Mejorar UI scanner (feedback) | Media |
| 10 | Importar desde QR | Baja |

---

## Preguntas pendientes

1. **Formato del QR**: ¿Solo barcode o info completa?
2. **Estilo del QR**: ¿Logo de la app en el centro?
3. **Permisos**: ¿Solicitar permiso de galería al instalar o al usar?
