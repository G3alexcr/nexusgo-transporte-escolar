# Modelo de Cobros SaaS, Tarifas y MRR — LinkBus Costa Rica

Guía operativa y comercial para la gestión de suscripciones de transportistas escolares desde el **Centro de Mando SuperAdmin** (`/superadmin`).

---

## 1. ¿Qué es el MRR y cómo se calcula?

**MRR** (*Monthly Recurring Revenue* / **Ingreso Recurrente Mensual**) es la suma fija que factura LinkBus cada mes por todas las cuentas de transportistas que están pagando su suscripción.

- **Qué SÍ suma al MRR:** Únicamente las cuentas en estado **`Activo`**.
- **Qué NO suma al MRR:**
  - **`En prueba`:** Transportistas en período de prueba gratis.
  - **`Suspendido`:** Cuentas pausadas por falta de pago o baja temporal.

### Fórmula en tiempo real dentro de LinkBus
En `src/components/linkbus/superadmin-dashboard.tsx`, el KPI **Facturación SaaS (MRR)** se calcula automáticamente así:

```text
MRR = Suma de `montoMensualSaaS` de todos los transportistas con `estado === "Activo"`
```

---

## 2. Tabla Progresiva Oficial (Descuento Lineal de ₡500 por Buseta)

Modelo comercial oficial de **LinkBus Costa Rica**:
- **Tarifa base (1 buseta):** **₡15,000 / mes**
- **Descuento progresivo:** **-₡500 por cada buseta adicional** hasta un piso mínimo de **₡10,500 / buseta** a partir de **10 busetas o más**.
- **Fórmula:** `precio_buseta(n) = max(10500, 15000 - (n - 1) * 500)` · `total = n * precio_buseta(n)`

| Cantidad de busetas | Precio mensual por buseta | Total mensual a pagar | Diferencia por +1 buseta | Ahorro total vs tarifa base |
| :--- | ---: | ---: | ---: | ---: |
| **1 buseta** | ₡15,000 | **₡15,000** | — | ₡0 |
| **2 busetas** | ₡14,500 | **₡29,000** | +₡14,000 | ₡1,000 al mes |
| **3 busetas** | ₡14,000 | **₡42,000** | +₡13,000 | ₡3,000 al mes |
| **4 busetas** | ₡13,500 | **₡54,000** | +₡12,000 | ₡6,000 al mes |
| **5 busetas** | ₡13,000 | **₡65,000** | +₡11,000 | ₡10,000 al mes |
| **6 busetas** | ₡12,500 | **₡75,000** | +₡10,000 | ₡15,000 al mes |
| **7 busetas** | ₡12,000 | **₡84,000** | +₡9,000 | ₡21,000 al mes |
| **8 busetas** | ₡11,500 | **₡92,000** | +₡8,000 | ₡28,000 al mes |
| **9 busetas** | ₡11,000 | **₡99,000** | +₡7,000 | ₡36,000 al mes |
| **10 o más busetas** | ₡10,500 | **₡105,000 (por 10)** | +₡6,000 | ₡45,000+ al mes |

### Referencia para Colegios Públicos / Zonas Rurales
- En el panel **Tarifas & Facturación** del SuperAdmin puedes cambiar al preset **Público (₡10,000 → ₡7,000)** (tarifa base **₡10,000**, reduciendo **₡500** por unidad hasta un piso mínimo de **₡7,000/buseta**) o ajustar cualquier parámetro manualmente.

---

## 3. Ciclo de Vida del Transportista y Cuándo Cobrar

1. **Registro / Afiliación (`En prueba`):**
   - Se otorga un período de prueba gratis de **15 a 30 días** para que el transportista cargue sus busetas, choferes, rutas y alumnos sin fricción.
   - Durante esta etapa **no** suma al MRR.
2. **Activación (`Activo`):**
   - Al finalizar la prueba y confirmarse el primer pago (SINPE Móvil, transferencia bancaria o tarjeta), el SuperAdmin cambia el estado a **`Activo`**.
   - Desde ese momento su mensualidad empieza a sumar al **MRR**.
3. **Renovación Mensual:**
   - Se cobra **por adelantado entre los días 1 y 5 de cada mes**.
   - Si el transportista agrega o retira busetas durante el mes, el ajuste de plan o tarifa se aplica para el siguiente período mensual.
4. **Mora o Pausa (`Suspendido`):**
   - Si no se registra el pago después del recordatorio, se cambia el estado a **`Suspendido`** para pausar la cuenta y excluirla del MRR real.

---

## 4. Cómo Gestionarlo en el Centro de Mando (`/superadmin`)

Dentro del Sidebar del **SuperAdmin**:

1. **Ajustar precios globales de los planes:**
   - Ve a **Tarifas & Facturación**.
   - Edita el monto en colones (`₡`) de **Independiente**, **Empresa** o **Flota**; el cambio se guarda automáticamente.
   - Si quieres actualizar a todos los clientes según las busetas que tienen registradas en Supabase, haz clic en **"Aplicar según busetas reales"**.
2. **Ajustar un precio personalizado a un transportista:**
   - Ve a **Transportistas**.
   - Haz clic directamente sobre el monto `₡.../mes` en la fila del cliente, escribe el nuevo valor y presiona **OK** (o `Enter`).
3. **Cambiar el estado de cobro:**
   - En la columna **Estado** de la tabla **Transportistas**, cambia entre `Activo`, `En prueba` o `Suspendido`; el **MRR** se recalcula al instante.
4. **Control de flota y cumplimiento:**
   - **Flota Nacional**, **Alumnos Conectados** y **Cumplimiento CTP** se calculan en vivo leyendo las tablas `vans` y `alumnos` de Supabase.
