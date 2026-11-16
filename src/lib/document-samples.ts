// Helper utilities to generate high-resolution authentic mockups of Costa Rican transportation documents
// (CTP Permit, Dekra RTV, INS Policy, Marchamo, Vehicle Title, MOPT Driver License C-2, SINPE Voucher, Digital Receipt, Pre-Op Inspection)

export function generateCtpPermitSvg(placa: string, permiso: string, vencimiento: string, chofer: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
    <rect width="600" height="400" fill="#ffffff" stroke="#cbd5e1" stroke-width="4" rx="8"/>
    <!-- Top header band -->
    <rect x="0" y="0" width="600" height="75" fill="#0f172a"/>
    <text x="300" y="28" fill="#fbbf24" font-family="sans-serif" font-size="12" font-weight="900" text-anchor="middle" letter-spacing="2">REPÚBLICA DE COSTA RICA · MOPT</text>
    <text x="300" y="48" fill="#ffffff" font-family="sans-serif" font-size="14" font-weight="800" text-anchor="middle">CONSEJO DE TRANSPORTE PÚBLICO (CTP)</text>
    <text x="300" y="65" fill="#94a3b8" font-family="sans-serif" font-size="10" text-anchor="middle">PERMISO ESPECIAL DE TRANSPORTE DE ESTUDIANTES</text>
    
    <!-- Watermark / Shield -->
    <circle cx="300" cy="230" r="85" fill="#f8fafc" stroke="#e2e8f0" stroke-width="2"/>
    <text x="300" y="235" fill="#cbd5e1" font-family="sans-serif" font-size="48" font-weight="bold" text-anchor="middle" opacity="0.3">CTP</text>

    <!-- Permit Body -->
    <g transform="translate(40, 105)">
      <text x="0" y="15" fill="#64748b" font-family="sans-serif" font-size="10" font-weight="bold">CÓDIGO DE AUTORIZACIÓN REGULATORIA:</text>
      <rect x="0" y="22" width="240" height="32" fill="#fef3c7" stroke="#f59e0b" rx="4"/>
      <text x="12" y="44" fill="#78350f" font-family="monospace" font-size="16" font-weight="bold">${permiso}</text>

      <text x="280" y="15" fill="#64748b" font-family="sans-serif" font-size="10" font-weight="bold">PLACA VEHÍCULO ASIGNADO:</text>
      <rect x="280" y="22" width="240" height="32" fill="#0f172a" rx="4"/>
      <text x="400" y="44" fill="#fbbf24" font-family="monospace" font-size="18" font-weight="bold" text-anchor="middle">${placa}</text>

      <text x="0" y="85" fill="#64748b" font-family="sans-serif" font-size="10" font-weight="bold">TITULAR / CONDUCTOR AUTORIZADO:</text>
      <text x="0" y="105" fill="#0f172a" font-family="sans-serif" font-size="14" font-weight="bold">${chofer}</text>

      <text x="280" y="85" fill="#64748b" font-family="sans-serif" font-size="10" font-weight="bold">FECHA LÍMITE DE VIGENCIA:</text>
      <text x="280" y="105" fill="#15803d" font-family="monospace" font-size="14" font-weight="bold">Vigente hasta ${vencimiento}</text>

      <line x1="0" y1="130" x2="520" y2="130" stroke="#e2e8f0" stroke-width="1.5"/>

      <text x="0" y="155" fill="#475569" font-family="sans-serif" font-size="9.5">Habilitación conforme a la Ley N° 7969, Decreto Ejecutivo N° 35249-MOPT</text>
      <text x="0" y="172" fill="#475569" font-family="sans-serif" font-size="9.5">y resoluciones vinculantes de la Autoridad Reguladora de los Servicios Públicos (ARESEP).</text>

      <!-- Stamp -->
      <g transform="translate(370, 150)">
        <circle cx="60" cy="50" r="42" fill="none" stroke="#2563eb" stroke-width="2" stroke-dasharray="4 2"/>
        <text x="60" y="42" fill="#1d4ed8" font-family="sans-serif" font-size="8" font-weight="bold" text-anchor="middle">CONSEJO TRANSPORTE PÚBLICO</text>
        <text x="60" y="55" fill="#1d4ed8" font-family="sans-serif" font-size="9" font-weight="bold" text-anchor="middle">APROBADO</text>
        <text x="60" y="68" fill="#1d4ed8" font-family="sans-serif" font-size="7" text-anchor="middle">DEPARTAMENTO DE INSPECCIÓN</text>
      </g>
    </g>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function generateMarchamoSvg(placa: string, ano: number): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 380" width="100%" height="100%">
    <rect width="600" height="380" fill="#047857" rx="12"/>
    <rect x="15" y="15" width="570" height="350" fill="#ecfdf5" rx="8" stroke="#059669" stroke-width="3"/>
    
    <!-- Top banner -->
    <rect x="15" y="15" width="570" height="65" fill="#065f46" rx="6 6 0 0"/>
    <text x="300" y="40" fill="#a7f3d0" font-family="sans-serif" font-size="11" font-weight="900" text-anchor="middle" letter-spacing="2">INSTITUTO NACIONAL DE SEGUROS · COSTA RICA</text>
    <text x="300" y="62" fill="#ffffff" font-family="sans-serif" font-size="18" font-weight="900" text-anchor="middle">DERECHO DE CIRCULACIÓN ${ano}</text>

    <!-- Marchamo contents -->
    <g transform="translate(45, 105)">
      <rect x="0" y="0" width="240" height="90" fill="#ffffff" stroke="#a7f3d0" rx="6"/>
      <text x="15" y="25" fill="#047857" font-family="sans-serif" font-size="10" font-weight="bold">PLACA VEHICULAR</text>
      <text x="15" y="65" fill="#0f172a" font-family="monospace" font-size="28" font-weight="900">${placa}</text>

      <rect x="270" y="0" width="240" height="90" fill="#ffffff" stroke="#a7f3d0" rx="6"/>
      <text x="285" y="25" fill="#047857" font-family="sans-serif" font-size="10" font-weight="bold">ESTADO FISCAL & SEGURO SOA</text>
      <text x="285" y="65" fill="#15803d" font-family="sans-serif" font-size="22" font-weight="900">AL DÍA (PAGADO)</text>

      <g transform="translate(0, 115)">
        <text x="0" y="20" fill="#475569" font-family="sans-serif" font-size="10.5">Seguro Obligatorio Automotor (SOA) Estudiantil incluido.</text>
        <text x="0" y="38" fill="#475569" font-family="sans-serif" font-size="10.5">Autorizado para circular en toda la red vial de Costa Rica.</text>
      </g>

      <!-- Security Hologram icon -->
      <g transform="translate(400, 120)">
        <circle cx="50" cy="40" r="35" fill="#fbbf24" stroke="#d97706" stroke-width="2"/>
        <text x="50" y="38" fill="#78350f" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="middle">HOLOGRAMA</text>
        <text x="50" y="52" fill="#78350f" font-family="sans-serif" font-size="12" font-weight="black" text-anchor="middle">${ano}</text>
      </g>
    </g>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function generateDekraSvg(placa: string, vencimiento: string, estado: string): string {
  const isOk = estado === 'Al día';
  const color = isOk ? '#16a34a' : '#d97706';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 380" width="100%" height="100%">
    <rect width="600" height="380" fill="#ffffff" stroke="#cbd5e1" stroke-width="3" rx="10"/>
    <rect x="0" y="0" width="600" height="70" fill="#1e293b"/>
    <text x="300" y="32" fill="#ffffff" font-family="sans-serif" font-size="20" font-weight="900" text-anchor="middle">DEKRA</text>
    <text x="300" y="52" fill="#94a3b8" font-family="sans-serif" font-size="10" text-anchor="middle">INSPECCIÓN TÉCNICA VEHICULAR · COSTA RICA</text>

    <rect x="420" y="18" width="150" height="34" fill="${color}" rx="6"/>
    <text x="495" y="40" fill="#ffffff" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">${isOk ? 'APROBADO' : 'PENDIENTE'}</text>

    <g transform="translate(40, 95)">
      <text x="0" y="20" fill="#64748b" font-family="sans-serif" font-size="10" font-weight="bold">PLACA INSPECCIONADA:</text>
      <text x="0" y="50" fill="#0f172a" font-family="monospace" font-size="24" font-weight="900">${placa}</text>

      <text x="260" y="20" fill="#64748b" font-family="sans-serif" font-size="10" font-weight="bold">VIGENCIA INSPECCIÓN SEMESTRAL:</text>
      <text x="260" y="50" fill="${color}" font-family="monospace" font-size="20" font-weight="bold">${vencimiento}</text>

      <rect x="0" y="80" width="520" height="120" fill="#f8fafc" stroke="#e2e8f0" rx="8"/>
      <g transform="translate(15, 105)">
        <text x="0" y="0" fill="#1e293b" font-family="sans-serif" font-size="11" font-weight="bold">1. Frenos y Ejes de Dirección: <tspan fill="#16a34a">CERO DEFECTOS GRAVES</tspan></text>
        <text x="0" y="22" fill="#1e293b" font-family="sans-serif" font-size="11" font-weight="bold">2. Emisiones de Gases y Humo: <tspan fill="#16a34a">CONFORME NORMA MOPT</tspan></text>
        <text x="0" y="44" fill="#1e293b" font-family="sans-serif" font-size="11" font-weight="bold">3. Luces y Sistema Eléctrico: <tspan fill="#16a34a">APROBADO</tspan></text>
        <text x="0" y="66" fill="#1e293b" font-family="sans-serif" font-size="11" font-weight="bold">4. Salidas y Ventanas de Emergencia: <tspan fill="#16a34a">OPERATIVAS</tspan></text>
      </g>

      <text x="0" y="230" fill="#94a3b8" font-family="sans-serif" font-size="9">Hoja Verde Oficial de Inspección Semestral Obligatoria para Transporte Estudiantil - Decreto MOPT.</text>
    </g>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function generateLicenseSvg(nombre: string, cedula: string, tipo: string = 'C-2', vencimiento: string = '18/04/2028'): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 380" width="100%" height="100%">
    <rect width="600" height="380" fill="#f1f5f9" rx="14" stroke="#94a3b8" stroke-width="3"/>
    
    <!-- Top Bar with Costa Rica flag colors -->
    <rect x="0" y="0" width="600" height="12" fill="#1d4ed8"/>
    <rect x="0" y="12" width="600" height="6" fill="#ffffff"/>
    <rect x="0" y="18" width="600" height="14" fill="#dc2626"/>
    <rect x="0" y="32" width="600" height="6" fill="#ffffff"/>
    <rect x="0" y="38" width="600" height="12" fill="#1d4ed8"/>

    <text x="300" y="70" fill="#0f172a" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle" letter-spacing="1">REPÚBLICA DE COSTA RICA</text>
    <text x="300" y="88" fill="#475569" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">DIRECCIÓN GENERAL DE EDUCACIÓN VIAL · MOPT</text>
    <text x="300" y="104" fill="#1e293b" font-family="sans-serif" font-size="14" font-weight="black" text-anchor="middle">LICENCIA DE CONDUCIR</text>

    <!-- Photo Placeholder -->
    <g transform="translate(40, 125)">
      <rect x="0" y="0" width="130" height="160" fill="#e2e8f0" stroke="#cbd5e1" stroke-width="2" rx="6"/>
      <circle cx="65" cy="60" r="30" fill="#94a3b8"/>
      <path d="M 25 145 C 25 105, 105 105, 105 145 Z" fill="#94a3b8"/>
      <text x="65" y="155" fill="#64748b" font-family="sans-serif" font-size="9" text-anchor="middle">CONDUCTOR</text>
    </g>

    <!-- License Info -->
    <g transform="translate(195, 125)">
      <rect x="270" y="0" width="95" height="50" fill="#fef3c7" stroke="#f59e0b" rx="6"/>
      <text x="317" y="20" fill="#78350f" font-family="sans-serif" font-size="9" font-weight="bold" text-anchor="middle">TIPO</text>
      <text x="317" y="42" fill="#0f172a" font-family="sans-serif" font-size="18" font-weight="black" text-anchor="middle">${tipo}</text>

      <text x="0" y="18" fill="#64748b" font-family="sans-serif" font-size="9" font-weight="bold">NOMBRE COMPLETO:</text>
      <text x="0" y="38" fill="#0f172a" font-family="sans-serif" font-size="15" font-weight="bold">${nombre}</text>

      <text x="0" y="70" fill="#64748b" font-family="sans-serif" font-size="9" font-weight="bold">IDENTIFICACIÓN / CÉDULA:</text>
      <text x="0" y="90" fill="#0f172a" font-family="monospace" font-size="14" font-weight="bold">${cedula}</text>

      <text x="0" y="122" fill="#64748b" font-family="sans-serif" font-size="9" font-weight="bold">AUTORIZACIÓN:</text>
      <text x="0" y="138" fill="#15803d" font-family="sans-serif" font-size="11" font-weight="bold">Transporte Público / Buseta Escolar</text>

      <text x="0" y="165" fill="#64748b" font-family="sans-serif" font-size="9" font-weight="bold">VENCIMIENTO:</text>
      <text x="90" y="165" fill="#0f172a" font-family="monospace" font-size="11" font-weight="bold">${vencimiento}</text>

      <text x="210" y="165" fill="#64748b" font-family="sans-serif" font-size="9" font-weight="bold">PUNTOS COSEVI:</text>
      <text x="300" y="165" fill="#15803d" font-family="monospace" font-size="11" font-weight="bold">0 pts (Limpia)</text>
    </g>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function generateCirculacionSvg(placa: string, marcaModelo: string, ano: number): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 380" width="100%" height="100%">
    <rect width="600" height="380" fill="#ffffff" stroke="#cbd5e1" stroke-width="3" rx="10"/>
    <rect x="0" y="0" width="600" height="60" fill="#0369a1"/>
    <text x="300" y="26" fill="#e0f2fe" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="middle" letter-spacing="1">REGISTRO NACIONAL DE COSTA RICA</text>
    <text x="300" y="46" fill="#ffffff" font-family="sans-serif" font-size="14" font-weight="900" text-anchor="middle">TARJETA DE CIRCULACIÓN OFICIAL</text>

    <g transform="translate(40, 85)">
      <text x="0" y="15" fill="#64748b" font-family="sans-serif" font-size="10" font-weight="bold">PLACA NACIONAL:</text>
      <rect x="0" y="22" width="180" height="35" fill="#f8fafc" stroke="#cbd5e1" rx="4"/>
      <text x="90" y="46" fill="#0f172a" font-family="monospace" font-size="18" font-weight="black" text-anchor="middle">${placa}</text>

      <text x="220" y="15" fill="#64748b" font-family="sans-serif" font-size="10" font-weight="bold">MARCA Y MODELO:</text>
      <text x="220" y="45" fill="#0f172a" font-family="sans-serif" font-size="14" font-weight="bold">${marcaModelo}</text>

      <text x="440" y="15" fill="#64748b" font-family="sans-serif" font-size="10" font-weight="bold">AÑO FABRICACIÓN:</text>
      <text x="440" y="45" fill="#0f172a" font-family="monospace" font-size="14" font-weight="bold">${ano}</text>

      <line x1="0" y1="80" x2="520" y2="80" stroke="#e2e8f0" stroke-width="1.5"/>

      <text x="0" y="110" fill="#475569" font-family="sans-serif" font-size="11">Categoría: <strong>Microbús / Buseta de Transporte Estudiantil</strong></text>
      <text x="0" y="135" fill="#475569" font-family="sans-serif" font-size="11">Combustible: <strong>Diésel Ecológico</strong></text>
      <text x="0" y="160" fill="#475569" font-family="sans-serif" font-size="11">Carrocería: <strong>Cerrada con ventanillas panorámicas de seguridad</strong></text>
      <text x="0" y="185" fill="#475569" font-family="sans-serif" font-size="11">Restricciones: <strong>Uso exclusivo servicio público transporte de estudiantes</strong></text>

      <g transform="translate(370, 110)">
        <rect width="140" height="70" fill="#f0f9ff" stroke="#0284c7" rx="6"/>
        <text x="70" y="25" fill="#0369a1" font-family="sans-serif" font-size="9" font-weight="bold" text-anchor="middle">REGISTRO PÚBLICO</text>
        <text x="70" y="42" fill="#0284c7" font-family="sans-serif" font-size="11" font-weight="black" text-anchor="middle">CERTIFICADO</text>
        <text x="70" y="58" fill="#64748b" font-family="sans-serif" font-size="8" text-anchor="middle">TOMO 2026 · FOLIO 88</text>
      </g>
    </g>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function generateInsPolicySvg(placa: string, poliza: string, vencimiento: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 380" width="100%" height="100%">
    <rect width="600" height="380" fill="#ffffff" stroke="#cbd5e1" stroke-width="3" rx="10"/>
    <rect x="0" y="0" width="600" height="60" fill="#0284c7"/>
    <text x="300" y="26" fill="#e0f2fe" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="middle" letter-spacing="1">INSTITUTO NACIONAL DE SEGUROS (INS)</text>
    <text x="300" y="46" fill="#ffffff" font-family="sans-serif" font-size="14" font-weight="900" text-anchor="middle">PÓLIZA COLECTIVA DE RESPONSABILIDAD CIVIL ESTUDIANTIL</text>

    <g transform="translate(40, 85)">
      <text x="0" y="15" fill="#64748b" font-family="sans-serif" font-size="10" font-weight="bold">PÓLIZA N°:</text>
      <text x="0" y="40" fill="#0284c7" font-family="monospace" font-size="18" font-weight="black">${poliza}</text>

      <text x="260" y="15" fill="#64748b" font-family="sans-serif" font-size="10" font-weight="bold">PLACA ASEGURADA:</text>
      <text x="260" y="40" fill="#0f172a" font-family="monospace" font-size="18" font-weight="black">${placa}</text>

      <text x="0" y="80" fill="#64748b" font-family="sans-serif" font-size="10" font-weight="bold">VENCIMIENTO DE COBERTURA:</text>
      <text x="0" y="102" fill="#15803d" font-family="monospace" font-size="14" font-weight="bold">${vencimiento}</text>

      <rect x="0" y="125" width="520" height="90" fill="#f0fdf4" stroke="#86efac" rx="6"/>
      <g transform="translate(15, 150)">
        <text x="0" y="0" fill="#166534" font-family="sans-serif" font-size="10" font-weight="bold">✓ Cobertura Médica Hospitalaria por Estudiante Pasajero: ₡25,000,000</text>
        <text x="0" y="20" fill="#166534" font-family="sans-serif" font-size="10" font-weight="bold">✓ Daños a Terceros y Bienes Públicos: ₡100,000,000</text>
        <text x="0" y="40" fill="#166534" font-family="sans-serif" font-size="10" font-weight="bold">✓ Asistencia Vial 24/7 y Grúa de Emergencia Escolar</text>
      </g>
    </g>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function generateAssistantBadgeSvg(nombre: string, codigo: string = 'ASIST-CTP-2024-512'): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 380" width="100%" height="100%">
    <rect width="600" height="380" fill="#ffffff" stroke="#cbd5e1" stroke-width="3" rx="10"/>
    <rect x="0" y="0" width="600" height="60" fill="#4338ca"/>
    <text x="300" y="26" fill="#e0e7ff" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="middle" letter-spacing="1">CONSEJO DE TRANSPORTE PÚBLICO (CTP)</text>
    <text x="300" y="46" fill="#ffffff" font-family="sans-serif" font-size="14" font-weight="900" text-anchor="middle">ACREDITACIÓN OFICIAL DE ASISTENTE DE BUSETA</text>

    <g transform="translate(40, 95)">
      <rect x="0" y="0" width="120" height="150" fill="#f1f5f9" stroke="#cbd5e1" rx="6"/>
      <circle cx="60" cy="55" r="28" fill="#a5b4fc"/>
      <path d="M 25 135 C 25 95, 95 95, 95 135 Z" fill="#a5b4fc"/>
      <text x="60" y="145" fill="#4338ca" font-family="sans-serif" font-size="8" font-weight="bold" text-anchor="middle">ASISTENTE</text>

      <g transform="translate(150, 10)">
        <text x="0" y="15" fill="#64748b" font-family="sans-serif" font-size="9" font-weight="bold">NOMBRE COMPLETO:</text>
        <text x="0" y="38" fill="#0f172a" font-family="sans-serif" font-size="15" font-weight="bold">${nombre}</text>

        <text x="0" y="70" fill="#64748b" font-family="sans-serif" font-size="9" font-weight="bold">CÓDIGO DE REGISTRO CTP:</text>
        <text x="0" y="90" fill="#4338ca" font-family="monospace" font-size="14" font-weight="bold">${codigo}</text>

        <text x="0" y="120" fill="#64748b" font-family="sans-serif" font-size="9" font-weight="bold">CAPACITACIONES:</text>
        <text x="0" y="136" fill="#15803d" font-family="sans-serif" font-size="10" font-weight="bold">Primeros Auxilios Cruz Roja · Manejo de Niños y Evacuación</text>
      </g>
    </g>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function generateSinpeVoucherSvg(
  banco: string,
  comprobanteRef: string,
  monto: number,
  emisor: string,
  destinatario: string,
  telefonoDestino = "8841-2390",
  fechaHora?: string
): string {
  const fecha = fechaHora || "13/11/2026, 19:10";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 680" width="100%" height="100%">
    <rect width="500" height="680" fill="#ffffff" rx="16" stroke="#cbd5e1" stroke-width="3"/>
    
    <!-- Bank Header -->
    <rect x="0" y="0" width="500" height="110" fill="#0f172a" rx="16"/>
    <rect x="0" y="80" width="500" height="30" fill="#0f172a"/>
    <circle cx="250" cy="50" r="26" fill="#10b981"/>
    <path d="M241 50 L247 56 L260 43" stroke="#ffffff" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="250" y="96" fill="#fbbf24" font-family="sans-serif" font-size="12" font-weight="900" text-anchor="middle" letter-spacing="1">TRANSFERENCIA SINPE MÓVIL EXITOSA</text>
    
    <!-- Bank Name -->
    <text x="250" y="145" fill="#64748b" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">${banco}</text>
    
    <!-- Amount -->
    <text x="250" y="190" fill="#0f172a" font-family="sans-serif" font-size="36" font-weight="900" text-anchor="middle">₡${monto.toLocaleString('es-CR')}</text>
    <text x="250" y="214" fill="#16a34a" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">Fondos debitados en tiempo real</text>
    
    <!-- Card details -->
    <g transform="translate(40, 235)">
      <rect width="420" height="340" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1.5" rx="12"/>
      
      <text x="24" y="32" fill="#64748b" font-family="sans-serif" font-size="10.5" font-weight="bold">DESTINATARIO (TRANSPORTISTA):</text>
      <text x="24" y="52" fill="#0f172a" font-family="sans-serif" font-size="14" font-weight="800">${destinatario}</text>
      <text x="24" y="72" fill="#2563eb" font-family="monospace" font-size="13" font-weight="bold">Teléfono: +506 ${telefonoDestino}</text>
      
      <line x1="24" y1="90" x2="396" y2="90" stroke="#e2e8f0" stroke-width="1"/>
      
      <text x="24" y="115" fill="#64748b" font-family="sans-serif" font-size="10.5" font-weight="bold">PERSONA QUE PAGA (ENCARGADO):</text>
      <text x="24" y="135" fill="#0f172a" font-family="sans-serif" font-size="13" font-weight="700">${emisor}</text>
      
      <line x1="24" y1="155" x2="396" y2="155" stroke="#e2e8f0" stroke-width="1"/>
      
      <text x="24" y="180" fill="#64748b" font-family="sans-serif" font-size="10.5" font-weight="bold">NÚMERO DE COMPROBANTE / REFERENCIA:</text>
      <rect x="24" y="190" width="372" height="32" fill="#fef3c7" stroke="#f59e0b" rx="6"/>
      <text x="36" y="211" fill="#92400e" font-family="monospace" font-size="14" font-weight="800">${comprobanteRef}</text>
      
      <text x="24" y="248" fill="#64748b" font-family="sans-serif" font-size="10.5" font-weight="bold">FECHA Y HORA DE TRANSACCIÓN:</text>
      <text x="24" y="268" fill="#0f172a" font-family="monospace" font-size="12" font-weight="600">${fecha}</text>
      
      <text x="24" y="295" fill="#64748b" font-family="sans-serif" font-size="10.5" font-weight="bold">DETALLE / CONCEPTO:</text>
      <text x="24" y="315" fill="#0f172a" font-family="sans-serif" font-size="12" font-weight="600">Mensualidad Transporte Escolar Nexus Go · Costa Rica</text>
    </g>
    
    <!-- Footer / Security Stamp -->
    <g transform="translate(40, 595)">
      <text x="210" y="20" fill="#94a3b8" font-family="sans-serif" font-size="9" text-anchor="middle">Transacción interbancaria liquidada vía Banco Central de Costa Rica (BCCR)</text>
      <text x="210" y="35" fill="#94a3b8" font-family="sans-serif" font-size="9" text-anchor="middle">Comprobante electrónico oficial para fines de control de transporte estudiantil</text>
      <text x="210" y="52" fill="#10b981" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">● ESTADO: ACREDITADO EN CUENTA DESTINO</text>
    </g>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Sample photo URLs of school busetas
export const DEFAULT_BUSETA_PHOTO = 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&auto=format&fit=crop&q=80';
export const DEFAULT_BUSETA_PHOTOS = [
  'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494515843206-f3117d3f51b7?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1557223562-6c77ef16210f?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1509749837427-ac94a2553d0e?w=800&auto=format&fit=crop&q=80',
];

export function generateDigitalReceiptSvg(
  reciboNumero: string,
  alumno: string,
  apoderado: string,
  monto: number,
  mes = "Octubre 2026",
  fechaAprobado?: string,
  emisorNombre = "Carlos Solís Morales",
  buseta = "SJ-4821",
  colegio = "Lincoln School"
): string {
  const fecha = fechaAprobado || "13/11/2026, 19:15";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 550 720" width="100%" height="100%">
    <rect width="550" height="720" fill="#ffffff" rx="16" stroke="#cbd5e1" stroke-width="3"/>
    
    <!-- Top Header Ribbon -->
    <rect x="0" y="0" width="550" height="120" fill="#0f172a" rx="16"/>
    <rect x="0" y="80" width="550" height="40" fill="#0f172a"/>
    
    <text x="40" y="42" fill="#fbbf24" font-family="sans-serif" font-size="16" font-weight="900" letter-spacing="1">NEXUS GO COSTA RICA</text>
    <text x="40" y="62" fill="#94a3b8" font-family="sans-serif" font-size="11">Plataforma de Transporte Estudiantil Seguro · BCCR SINPE</text>
    <text x="40" y="98" fill="#ffffff" font-family="sans-serif" font-size="13" font-weight="bold">RECIBO ELECTRÓNICO OFICIAL DE MENSUALIDAD</text>

    <!-- Receipt No Badge -->
    <rect x="360" y="24" width="150" height="52" fill="#1e293b" stroke="#334155" rx="8"/>
    <text x="435" y="44" fill="#94a3b8" font-family="sans-serif" font-size="9.5" text-anchor="middle" font-weight="bold">N° DE COMPROBANTE</text>
    <text x="435" y="64" fill="#fbbf24" font-family="monospace" font-size="13" text-anchor="middle" font-weight="900">${reciboNumero}</text>

    <!-- Stamp PAGADO -->
    <g transform="translate(370, 140)">
      <rect x="0" y="0" width="140" height="45" fill="#ecfdf5" stroke="#10b981" stroke-width="2.5" rx="8"/>
      <text x="70" y="28" fill="#059669" font-family="sans-serif" font-size="16" font-weight="900" text-anchor="middle" letter-spacing="2">PAGADO</text>
      <text x="70" y="40" fill="#059669" font-family="sans-serif" font-size="7.5" font-weight="bold" text-anchor="middle">VERIFICADO & EMITIDO</text>
    </g>

    <!-- Body Information Box -->
    <g transform="translate(40, 140)">
      <text x="0" y="20" fill="#64748b" font-family="sans-serif" font-size="10.5" font-weight="bold">PERÍODO / MES CANCELADO:</text>
      <text x="0" y="45" fill="#0f172a" font-family="sans-serif" font-size="20" font-weight="900">${mes}</text>

      <rect x="0" y="65" width="470" height="1" fill="#e2e8f0"/>

      <text x="0" y="95" fill="#64748b" font-family="sans-serif" font-size="10.5" font-weight="bold">ESTUDIANTE BENEFICIARIO:</text>
      <text x="0" y="115" fill="#0f172a" font-family="sans-serif" font-size="15" font-weight="800">${alumno}</text>
      <text x="0" y="132" fill="#475569" font-family="sans-serif" font-size="11.5">Centro Educativo: <b>${colegio}</b></text>

      <rect x="0" y="148" width="470" height="1" fill="#e2e8f0"/>

      <text x="0" y="175" fill="#64748b" font-family="sans-serif" font-size="10.5" font-weight="bold">ENCARGADO / RESPONSABLE QUE PAGA:</text>
      <text x="0" y="195" fill="#0f172a" font-family="sans-serif" font-size="14" font-weight="700">${apoderado}</text>

      <rect x="0" y="210" width="470" height="1" fill="#e2e8f0"/>

      <text x="0" y="235" fill="#64748b" font-family="sans-serif" font-size="10.5" font-weight="bold">TRANSPORTISTA / OPERADOR AUTORIZADO CTP:</text>
      <text x="0" y="255" fill="#0f172a" font-family="sans-serif" font-size="14" font-weight="700">${emisorNombre}</text>
      <text x="0" y="272" fill="#475569" font-family="sans-serif" font-size="11.5">Unidad Escolar Asignada: <b>Placa ${buseta}</b></text>

      <rect x="0" y="288" width="470" height="1" fill="#e2e8f0"/>

      <text x="0" y="315" fill="#64748b" font-family="sans-serif" font-size="10.5" font-weight="bold">MÉTODO DE PAGO UTILIZADO:</text>
      <text x="0" y="335" fill="#16a34a" font-family="sans-serif" font-size="13" font-weight="800">Transferencia Bancaria SINPE Móvil BCCR</text>

      <!-- Total Box -->
      <rect x="0" y="360" width="470" height="85" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5" rx="10"/>
      <text x="25" y="395" fill="#64748b" font-family="sans-serif" font-size="12" font-weight="bold">MONTO TOTAL CANCELADO (CRC):</text>
      <text x="25" y="430" fill="#0f172a" font-family="sans-serif" font-size="30" font-weight="900">₡${monto.toLocaleString('es-CR')}</text>
      <text x="445" y="420" fill="#10b981" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="end">Cancelado al 100%</text>
    </g>

    <!-- Footer Verification & QR -->
    <g transform="translate(40, 620)">
      <line x1="0" y1="0" x2="470" y2="0" stroke="#cbd5e1" stroke-dasharray="4 2"/>
      <text x="0" y="25" fill="#64748b" font-family="sans-serif" font-size="10">Fecha de confirmación y emisión: <b>${fecha}</b></text>
      <text x="0" y="42" fill="#94a3b8" font-family="sans-serif" font-size="9">Comprobante emitido de conformidad con la normativa del Consejo de Transporte Público (CTP).</text>
      <text x="0" y="56" fill="#94a3b8" font-family="sans-serif" font-size="9">Este recibo es válido para justificación de gastos de transporte escolar.</text>
    </g>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function generatePreOpCertificateSvg(
  folio: string,
  placa: string,
  chofer: string,
  fechaHora?: string,
  km = 142350,
  colegio = "Lincoln School"
): string {
  const fecha = fechaHora || "13/11/2026, 06:15 AM";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 780" width="100%" height="100%">
    <rect width="600" height="780" fill="#ffffff" rx="14" stroke="#cbd5e1" stroke-width="3"/>
    
    <!-- Header Band -->
    <rect x="0" y="0" width="600" height="110" fill="#0f172a" rx="14"/>
    <rect x="0" y="80" width="600" height="30" fill="#0f172a"/>
    <text x="300" y="32" fill="#fbbf24" font-family="sans-serif" font-size="11" font-weight="900" text-anchor="middle" letter-spacing="2">REPÚBLICA DE COSTA RICA · MOPT · CTP</text>
    <text x="300" y="56" fill="#ffffff" font-family="sans-serif" font-size="15" font-weight="900" text-anchor="middle">CONSTANCIA DIGITAL DE INSPECCIÓN PRE-OPERATIVA</text>
    <text x="300" y="76" fill="#94a3b8" font-family="sans-serif" font-size="10" text-anchor="middle">TRANSPORTE ESTUDIANTIL · REQUISITO TÉCNICO DIARIO</text>

    <!-- Folio & Status Badge -->
    <rect x="400" y="90" width="160" height="42" fill="#ecfdf5" stroke="#10b981" stroke-width="2" rx="6"/>
    <text x="480" y="107" fill="#059669" font-family="sans-serif" font-size="8.5" font-weight="bold" text-anchor="middle">RESULTADO DE INSPECCIÓN</text>
    <text x="480" y="124" fill="#047857" font-family="sans-serif" font-size="12" font-weight="900" text-anchor="middle">APROBADA · 100%</text>

    <!-- Identification Details -->
    <g transform="translate(40, 135)">
      <text x="0" y="16" fill="#64748b" font-family="sans-serif" font-size="9.5" font-weight="bold">PLACA VEHICULAR:</text>
      <rect x="0" y="24" width="160" height="32" fill="#0f172a" rx="4"/>
      <text x="80" y="46" fill="#fbbf24" font-family="monospace" font-size="18" font-weight="900" text-anchor="middle">${placa}</text>

      <text x="180" y="16" fill="#64748b" font-family="sans-serif" font-size="9.5" font-weight="bold">CONDUCTOR AUTORIZADO:</text>
      <text x="180" y="44" fill="#0f172a" font-family="sans-serif" font-size="14" font-weight="800">${chofer}</text>

      <text x="0" y="82" fill="#64748b" font-family="sans-serif" font-size="9.5" font-weight="bold">FOLIO DE AUDITORÍA CTP:</text>
      <text x="0" y="98" fill="#2563eb" font-family="monospace" font-size="13" font-weight="bold">${folio}</text>

      <text x="260" y="82" fill="#64748b" font-family="sans-serif" font-size="9.5" font-weight="bold">FECHA Y HORA DE REGISTRO:</text>
      <text x="260" y="98" fill="#0f172a" font-family="monospace" font-size="13" font-weight="bold">${fecha}</text>

      <line x1="0" y1="115" x2="520" y2="115" stroke="#e2e8f0" stroke-width="1.5"/>

      <!-- Checklist Items Matrix -->
      <text x="0" y="138" fill="#0f172a" font-family="sans-serif" font-size="11" font-weight="900">PUNTOS DE VERIFICACIÓN CRÍTICOS CTP / TRÁNSITO:</text>

      <g transform="translate(0, 150)">
        <rect width="520" height="34" fill="#f8fafc" stroke="#e2e8f0" rx="6"/>
        <circle cx="20" cy="17" r="9" fill="#10b981"/>
        <path d="M16 17 L19 20 L24 14" stroke="#ffffff" stroke-width="2.5" fill="none"/>
        <text x="38" y="21" fill="#0f172a" font-family="sans-serif" font-size="11" font-weight="bold">1. Luces, Direccionales, Freno e Intermitentes</text>
        <text x="470" y="21" fill="#16a34a" font-family="sans-serif" font-size="10" font-weight="900" text-anchor="end">CONFORME</text>

        <g transform="translate(0, 42)">
          <rect width="520" height="34" fill="#f8fafc" stroke="#e2e8f0" rx="6"/>
          <circle cx="20" cy="17" r="9" fill="#10b981"/>
          <path d="M16 17 L19 20 L24 14" stroke="#ffffff" stroke-width="2.5" fill="none"/>
          <text x="38" y="21" fill="#0f172a" font-family="sans-serif" font-size="11" font-weight="bold">2. Cinturones de Seguridad Funcionales en Butacas</text>
          <text x="470" y="21" fill="#16a34a" font-family="sans-serif" font-size="10" font-weight="900" text-anchor="end">CONFORME</text>
        </g>

        <g transform="translate(0, 84)">
          <rect width="520" height="34" fill="#f8fafc" stroke="#e2e8f0" rx="6"/>
          <circle cx="20" cy="17" r="9" fill="#10b981"/>
          <path d="M16 17 L19 20 L24 14" stroke="#ffffff" stroke-width="2.5" fill="none"/>
          <text x="38" y="21" fill="#0f172a" font-family="sans-serif" font-size="11" font-weight="bold">3. Extintor ABC Vigente con Precinto y Botiquín</text>
          <text x="470" y="21" fill="#16a34a" font-family="sans-serif" font-size="10" font-weight="900" text-anchor="end">CONFORME</text>
        </g>

        <g transform="translate(0, 126)">
          <rect width="520" height="34" fill="#f8fafc" stroke="#e2e8f0" rx="6"/>
          <circle cx="20" cy="17" r="9" fill="#10b981"/>
          <path d="M16 17 L19 20 L24 14" stroke="#ffffff" stroke-width="2.5" fill="none"/>
          <text x="38" y="21" fill="#0f172a" font-family="sans-serif" font-size="11" font-weight="bold">4. Salida de Emergencia Rotulada y Mecanismo Operativo</text>
          <text x="470" y="21" fill="#16a34a" font-family="sans-serif" font-size="10" font-weight="900" text-anchor="end">CONFORME</text>
        </g>

        <g transform="translate(0, 168)">
          <rect width="520" height="34" fill="#f8fafc" stroke="#e2e8f0" rx="6"/>
          <circle cx="20" cy="17" r="9" fill="#10b981"/>
          <path d="M16 17 L19 20 L24 14" stroke="#ffffff" stroke-width="2.5" fill="none"/>
          <text x="38" y="21" fill="#0f172a" font-family="sans-serif" font-size="11" font-weight="bold">5. Estado de Llantas (Labrado > 2mm) y Nivel Combustible</text>
          <text x="470" y="21" fill="#16a34a" font-family="sans-serif" font-size="10" font-weight="900" text-anchor="end">CONFORME</text>
        </g>

        <g transform="translate(0, 210)">
          <rect width="520" height="34" fill="#f8fafc" stroke="#e2e8f0" rx="6"/>
          <circle cx="20" cy="17" r="9" fill="#10b981"/>
          <path d="M16 17 L19 20 L24 14" stroke="#ffffff" stroke-width="2.5" fill="none"/>
          <text x="38" y="21" fill="#0f172a" font-family="sans-serif" font-size="11" font-weight="bold">6. Documentación Reglamentaria a Bordo (CTP / Dekra / INS)</text>
          <text x="470" y="21" fill="#16a34a" font-family="sans-serif" font-size="10" font-weight="900" text-anchor="end">CONFORME</text>
        </g>
      </g>

      <!-- Bottom odometer & signature band -->
      <g transform="translate(0, 415)">
        <rect width="520" height="75" fill="#f1f5f9" stroke="#cbd5e1" rx="8"/>
        <text x="20" y="25" fill="#64748b" font-family="sans-serif" font-size="9.5" font-weight="bold">ODÓMETRO INICIAL REGISTRADO:</text>
        <text x="20" y="52" fill="#0f172a" font-family="monospace" font-size="18" font-weight="900">${km.toLocaleString('es-CR')} km</text>

        <text x="280" y="25" fill="#64748b" font-family="sans-serif" font-size="9.5" font-weight="bold">DESTINO Y SERVICIO ASIGNADO:</text>
        <text x="280" y="48" fill="#0f172a" font-family="sans-serif" font-size="12" font-weight="bold">Recorrido Escolar · ${colegio}</text>
      </g>

      <!-- Signature Stamp -->
      <g transform="translate(280, 505)">
        <circle cx="65" cy="50" r="42" fill="none" stroke="#2563eb" stroke-width="2" stroke-dasharray="4 2"/>
        <text x="65" y="42" fill="#1d4ed8" font-family="sans-serif" font-size="8" font-weight="bold" text-anchor="middle">CONSEJO TRANSPORTE PÚBLICO</text>
        <text x="65" y="55" fill="#1d4ed8" font-family="sans-serif" font-size="9" font-weight="bold" text-anchor="middle">INSPECCIÓN C-2 OK</text>
        <text x="65" y="68" fill="#1d4ed8" font-family="sans-serif" font-size="7" text-anchor="middle">FIRMA DIGITAL AUTORIZADA</text>
      </g>

      <text x="0" y="535" fill="#475569" font-family="sans-serif" font-size="9">Inspección realizada conforme al Decreto Ejecutivo N° 35249-MOPT</text>
      <text x="0" y="550" fill="#475569" font-family="sans-serif" font-size="9">y normativas de fiscalización de la Policía de Tránsito de Costa Rica.</text>
    </g>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function generateStudentContractSvg(
  folio: string,
  alumnoNombre: string,
  apoderadoNombre: string,
  cedulaApoderado: string,
  colegio: string,
  chofer: string,
  placa: string,
  cuotaColones: number,
  fechaFirma: string,
  signatureDataUrl?: string
): string {
  const cuotaFormateada = `₡${cuotaColones.toLocaleString('es-CR')}`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 650 920" width="100%" height="100%">
    <rect width="650" height="920" fill="#ffffff" stroke="#cbd5e1" stroke-width="4" rx="10"/>
    
    <!-- Top Header Ribbon -->
    <rect x="0" y="0" width="650" height="85" fill="#0f172a" rx="10 10 0 0"/>
    <text x="325" y="28" fill="#fbbf24" font-family="sans-serif" font-size="11" font-weight="900" text-anchor="middle" letter-spacing="2">REPÚBLICA DE COSTA RICA · MOPT</text>
    <text x="325" y="48" fill="#ffffff" font-family="sans-serif" font-size="14" font-weight="800" text-anchor="middle">CONSEJO DE TRANSPORTE PÚBLICO (CTP)</text>
    <text x="325" y="68" fill="#94a3b8" font-family="sans-serif" font-size="10.5" text-anchor="middle">CONTRATO OFICIAL DE TRANSPORTE DE ESTUDIANTES · PERÍODO LECTIVO 2026</text>

    <!-- Folio & Law Reference -->
    <g transform="translate(45, 105)">
      <rect x="0" y="0" width="560" height="34" fill="#fef3c7" stroke="#f59e0b" rx="6"/>
      <text x="14" y="22" fill="#78350f" font-family="sans-serif" font-size="10.5" font-weight="bold">FOLIO REGISTRAL CTP:</text>
      <text x="170" y="22" fill="#b45309" font-family="monospace" font-size="12" font-weight="900">${folio}</text>
      <text x="545" y="22" fill="#78350f" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="end">Ley 7969 / Dec. 35249-MOPT</text>

      <!-- Parties Section -->
      <g transform="translate(0, 48)">
        <rect width="560" height="118" fill="#f8fafc" stroke="#e2e8f0" rx="8"/>
        
        <!-- Column 1: Transportista & Buseta -->
        <text x="14" y="22" fill="#64748b" font-family="sans-serif" font-size="9" font-weight="bold">1. TRANSPORTISTA AUTORIZADO (OPERADOR):</text>
        <text x="14" y="40" fill="#0f172a" font-family="sans-serif" font-size="12" font-weight="bold">${chofer}</text>
        <text x="14" y="56" fill="#475569" font-family="sans-serif" font-size="10">Licencia C-2 Profesional · Conductor Titular</text>
        <text x="14" y="74" fill="#0f172a" font-family="monospace" font-size="11" font-weight="bold">Unidad Buseta Placa: ${placa}</text>
        <text x="14" y="92" fill="#15803d" font-family="sans-serif" font-size="9.5" font-weight="bold">✓ Póliza Colectiva INS & RTV Dekra Al Día</text>

        <!-- Column 2: Estudiante & Apoderado -->
        <text x="300" y="22" fill="#64748b" font-family="sans-serif" font-size="9" font-weight="bold">2. ENCARGADO(A) & BENEFICIARIO:</text>
        <text x="300" y="40" fill="#0f172a" font-family="sans-serif" font-size="12" font-weight="bold">${apoderadoNombre}</text>
        <text x="300" y="56" fill="#475569" font-family="monospace" font-size="10">Cédula Identidad: ${cedulaApoderado}</text>
        <text x="300" y="74" fill="#0f172a" font-family="sans-serif" font-size="11" font-weight="bold">Estudiante: ${alumnoNombre}</text>
        <text x="300" y="92" fill="#b45309" font-family="sans-serif" font-size="10" font-weight="bold">Colegio: ${colegio} · Cuota: ${cuotaFormateada}/mes</text>
      </g>

      <!-- Clauses Header -->
      <g transform="translate(0, 182)">
        <text x="0" y="0" fill="#0f172a" font-family="sans-serif" font-size="11" font-weight="900" letter-spacing="0.5">CLÁUSULAS REGULATORIAS DEL SERVICIO DE TRANSPORTE ESCOLAR:</text>

        <!-- Clause 1 -->
        <rect x="0" y="10" width="560" height="52" fill="#ffffff" stroke="#e2e8f0" rx="6"/>
        <text x="12" y="28" fill="#0f172a" font-family="sans-serif" font-size="10" font-weight="bold">PRIMERA: Objeto y Recorrido Escolar Acordado</text>
        <text x="12" y="44" fill="#475569" font-family="sans-serif" font-size="9">El transportista se compromete al traslado diario del estudiante desde la parada autorizada hasta el centro educativo y viceversa en la unidad ${placa}.</text>

        <!-- Clause 2 -->
        <rect x="0" y="68" width="560" height="52" fill="#ffffff" stroke="#e2e8f0" rx="6"/>
        <text x="12" y="86" fill="#0f172a" font-family="sans-serif" font-size="10" font-weight="bold">SEGUNDA: Horarios, Puntualidad y Tolerancia en Parada</text>
        <text x="12" y="102" fill="#475569" font-family="sans-serif" font-size="9">El estudiante deberá estar listo en el punto con 5 minutos de antelación. Tolerancia máxima de espera: 3 minutos para salvaguardar el horario general.</text>

        <!-- Clause 3 -->
        <rect x="0" y="126" width="560" height="52" fill="#ffffff" stroke="#e2e8f0" rx="6"/>
        <text x="12" y="144" fill="#0f172a" font-family="sans-serif" font-size="10" font-weight="bold">TERCERA: Seguridad, Cinturones de 3 Puntos y Acompañante CTP</text>
        <text x="12" y="160" fill="#475569" font-family="sans-serif" font-size="9">Uso obligatorio de cinturón en butaca. La unidad cuenta con asistente acreditada CTP y prohibición absoluta de pararse durante el trayecto.</text>

        <!-- Clause 4 -->
        <rect x="0" y="184" width="560" height="52" fill="#ffffff" stroke="#e2e8f0" rx="6"/>
        <text x="12" y="202" fill="#0f172a" font-family="sans-serif" font-size="10" font-weight="bold">CUARTA: Coberturas de Seguro Colectivo Estudiantil INS</text>
        <text x="12" y="218" fill="#475569" font-family="sans-serif" font-size="9">Cobertura activa de Responsabilidad Civil por lesión o muerte y póliza de gastos médicos colectivos de estudiantes suscrita ante el INS.</text>

        <!-- Clause 5 -->
        <rect x="0" y="242" width="560" height="52" fill="#ffffff" stroke="#e2e8f0" rx="6"/>
        <text x="12" y="260" fill="#0f172a" font-family="sans-serif" font-size="10" font-weight="bold">QUINTA: Protocolo Estricto de Retiro y Entrega del Menor</text>
        <text x="12" y="276" fill="#475569" font-family="sans-serif" font-size="9">El estudiante solo se entregará al encargado titular o a los autorizados registrados en Nexus Go. Nadie sin autorización previa podrá recibir al alumno.</text>

        <!-- Clause 6 -->
        <rect x="0" y="300" width="560" height="52" fill="#ffffff" stroke="#e2e8f0" rx="6"/>
        <text x="12" y="318" fill="#0f172a" font-family="sans-serif" font-size="10" font-weight="bold">SEXTA: Condiciones de Pago y Cancelación de Mensualidad</text>
        <text x="12" y="334" fill="#475569" font-family="sans-serif" font-size="9">La mensualidad pactada de ${cuotaFormateada} se cancelará dentro de los primeros 5 días naturales del mes vía SINPE Móvil o transferencia bancaria.</text>
      </g>

      <!-- Signature & Digital Acceptance Block -->
      <g transform="translate(0, 560)">
        <rect width="560" height="150" fill="#f8fafc" stroke="#cbd5e1" rx="8"/>
        
        <!-- Left: Signature Box -->
        <text x="16" y="22" fill="#64748b" font-family="sans-serif" font-size="9.5" font-weight="bold">FIRMA Y ACEPTACIÓN DIGITAL DEL ENCARGADO(A):</text>
        <rect x="16" y="30" width="280" height="80" fill="#ffffff" stroke="#94a3b8" stroke-dasharray="3 3" rx="6"/>
        
        ${signatureDataUrl ? `
          <image href="${signatureDataUrl}" x="26" y="35" width="260" height="70" preserveAspectRatio="xMidYMid meet" />
        ` : `
          <!-- Handwritten-like vector stroke representation -->
          <path d="M 40 85 Q 70 45 110 75 T 180 65 T 250 80" stroke="#1e293b" stroke-width="2.5" fill="none"/>
          <text x="156" y="98" fill="#64748b" font-family="sans-serif" font-size="9" text-anchor="middle">Firma Digital Registrada en Pantalla</text>
        `}

        <text x="16" y="125" fill="#0f172a" font-family="sans-serif" font-size="10" font-weight="bold">${apoderadoNombre}</text>
        <text x="16" y="138" fill="#64748b" font-family="monospace" font-size="9">Cédula: ${cedulaApoderado} · Firmado digitalmente el ${fechaFirma}</text>

        <!-- Right: Official CTP Electronic Stamp -->
        <g transform="translate(390, 20)">
          <circle cx="65" cy="55" r="48" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-dasharray="5 3"/>
          <circle cx="65" cy="55" r="42" fill="none" stroke="#2563eb" stroke-width="1"/>
          <text x="65" y="35" fill="#1d4ed8" font-family="sans-serif" font-size="7.5" font-weight="900" text-anchor="middle">CONSEJO TRANSPORTE PÚBLICO</text>
          <text x="65" y="48" fill="#1e40af" font-family="sans-serif" font-size="8" font-weight="900" text-anchor="middle">REPÚBLICA DE COSTA RICA</text>
          <text x="65" y="62" fill="#15803d" font-family="sans-serif" font-size="10" font-weight="900" text-anchor="middle">CONTRATO REGISTRADO</text>
          <text x="65" y="74" fill="#1e40af" font-family="monospace" font-size="7" font-weight="bold" text-anchor="middle">${folio}</text>
          <text x="65" y="85" fill="#475569" font-family="sans-serif" font-size="6.5" text-anchor="middle">FISCALIZACIÓN ESTUDIANTIL</text>
        </g>
      </g>

      <!-- Legal footer notice -->
      <g transform="translate(0, 725)">
        <text x="0" y="10" fill="#94a3b8" font-family="sans-serif" font-size="8">Documento digital suscrito con plena validez jurídica según la Ley N° 8454 (Certificados, Firmas Digitales y Documentos Electrónicos de Costa Rica).</text>
        <text x="0" y="22" fill="#94a3b8" font-family="sans-serif" font-size="8">Copia archivada en los servidores autorizados de Nexus Go CR y disponible para inspección del CTP y centros educativos afiliados.</text>
      </g>
    </g>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function generatePassengerManifestSvg(
  folio: string,
  van: {
    patente: string;
    marcaModelo?: string | undefined;
    cap?: number | undefined;
    chofer: string;
    licenciaNumero?: string | undefined;
    licenciaTipo?: string | undefined;
    licenciaVencimiento?: string | undefined;
    asistente?: string | undefined;
    carnetAsistente?: string | undefined;
    permisoCtp?: string | undefined;
    vencimientoCtp?: string | undefined;
    polizaIns?: string | undefined;
    vencimientoIns?: string | undefined;
    dekraRtv?: string | undefined;
    colegio: string;
    ruta: string;
  },
  alumnos: Array<{
    id: string;
    nombre: string;
    curso: string;
    colegio: string;
    apoderado: string;
    telefonoApoderado?: string | undefined;
    direccion: string;
    cedulaMenor?: string | undefined;
  }>,
  fechaHora: string
): string {
  const totalAlumnos = alumnos.length;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 750 960" width="100%" height="100%">
    <rect width="750" height="960" fill="#ffffff" stroke="#cbd5e1" stroke-width="4" rx="10"/>

    <!-- Top Navy Header Banner -->
    <rect x="0" y="0" width="750" height="90" fill="#0f172a" rx="10 10 0 0"/>
    <text x="375" y="28" fill="#fbbf24" font-family="sans-serif" font-size="11.5" font-weight="900" text-anchor="middle" letter-spacing="2">REPÚBLICA DE COSTA RICA · MOPT</text>
    <text x="375" y="50" fill="#ffffff" font-family="sans-serif" font-size="15" font-weight="900" text-anchor="middle">CONSEJO DE TRANSPORTE PÚBLICO (CTP)</text>
    <text x="375" y="70" fill="#94a3b8" font-family="sans-serif" font-size="10.5" font-weight="bold" text-anchor="middle">MANIFIESTO OFICIAL DE ESTUDIANTES TRANSPORTADOS · CONTROL EN CARRETERA</text>

    <!-- Top Registry Bar -->
    <g transform="translate(35, 105)">
      <rect width="680" height="34" fill="#fef3c7" stroke="#f59e0b" rx="6"/>
      <text x="14" y="22" fill="#78350f" font-family="sans-serif" font-size="10.5" font-weight="bold">FOLIO CTP FISCALIZACIÓN:</text>
      <text x="185" y="22" fill="#b45309" font-family="monospace" font-size="12" font-weight="900">${folio}</text>
      <text x="665" y="22" fill="#78350f" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="end">Fecha/Hora: ${fechaHora}</text>

      <!-- Unit and Crew Operational Card -->
      <g transform="translate(0, 46)">
        <rect width="680" height="122" fill="#f8fafc" stroke="#e2e8f0" rx="8"/>

        <!-- Column 1: Unit & Permits -->
        <text x="15" y="20" fill="#64748b" font-family="sans-serif" font-size="9" font-weight="bold">UNIDAD ASIGNADA:</text>
        <rect x="15" y="28" width="105" height="26" fill="#0f172a" rx="4"/>
        <text x="67" y="46" fill="#fbbf24" font-family="monospace" font-size="14" font-weight="900" text-anchor="middle">${van.patente}</text>
        <text x="130" y="38" fill="#0f172a" font-family="sans-serif" font-size="11" font-weight="bold">${van.marcaModelo || 'Toyota Coaster'}</text>
        <text x="130" y="52" fill="#475569" font-family="sans-serif" font-size="9.5">Capacidad CTP: ${van.cap || 16} asientos autorizados</text>

        <text x="15" y="76" fill="#0f172a" font-family="monospace" font-size="10" font-weight="bold">Permiso CTP: ${van.permisoCtp || 'CTP-TE-2024-8841'}</text>
        <text x="15" y="92" fill="#15803d" font-family="sans-serif" font-size="9.5" font-weight="bold">Venc. CTP: ${van.vencimientoCtp || '31/12/2026'} · Dekra: ${van.dekraRtv || '15/11/2026'}</text>
        <text x="15" y="108" fill="#1d4ed8" font-family="sans-serif" font-size="9.5" font-weight="bold">Póliza INS: ${van.polizaIns || 'INS-RESP-CIVIL-99214'} (Vigente)</text>

        <!-- Column 2: Crew & Destination -->
        <text x="360" y="20" fill="#64748b" font-family="sans-serif" font-size="9" font-weight="bold">TRIPULACIÓN AUTORIZADA:</text>
        <text x="360" y="38" fill="#0f172a" font-family="sans-serif" font-size="11.5" font-weight="bold">Chofer: ${van.chofer}</text>
        <text x="360" y="52" fill="#475569" font-family="monospace" font-size="9.5">Licencia: ${van.licenciaTipo || 'C-2 Profesional'} (Cédula: ${van.licenciaNumero || '1-1142-0892'})</text>
        <text x="360" y="68" fill="#0f172a" font-family="sans-serif" font-size="10.5" font-weight="bold">Acompañante CTP: ${van.asistente || 'Patricia Mora Jiménez'}</text>
        <text x="360" y="82" fill="#64748b" font-family="monospace" font-size="9.5">Carnet Acompañante: ${van.carnetAsistente || 'ASIST-CTP-2024-881'}</text>
        
        <line x1="360" y1="92" x2="665" y2="92" stroke="#e2e8f0" stroke-width="1"/>
        <text x="360" y="108" fill="#b45309" font-family="sans-serif" font-size="10" font-weight="bold">Colegio Destino: ${van.colegio} · ${totalAlumnos} alumnos en lista</text>
      </g>

      <!-- Students Manifest Table -->
      <g transform="translate(0, 185)">
        <text x="0" y="0" fill="#0f172a" font-family="sans-serif" font-size="11" font-weight="900" letter-spacing="0.5">LISTA NOMINAL DE ESTUDIANTES AUTORIZADOS A BORDO (POLICÍA DE TRÁNSITO):</text>

        <!-- Table Header -->
        <g transform="translate(0, 10)">
          <rect width="680" height="26" fill="#0f172a" rx="4"/>
          <text x="12" y="17" fill="#ffffff" font-family="sans-serif" font-size="9.5" font-weight="bold">N°</text>
          <text x="40" y="17" fill="#ffffff" font-family="sans-serif" font-size="9.5" font-weight="bold">ESTUDIANTE / GRADO</text>
          <text x="230" y="17" fill="#ffffff" font-family="sans-serif" font-size="9.5" font-weight="bold">ID / TIM MENOR</text>
          <text x="330" y="17" fill="#ffffff" font-family="sans-serif" font-size="9.5" font-weight="bold">ENCARGADO TITULAR & TEL</text>
          <text x="510" y="17" fill="#ffffff" font-family="sans-serif" font-size="9.5" font-weight="bold">PARADA AUTORIZADA</text>
          <text x="670" y="17" fill="#ffffff" font-family="sans-serif" font-size="9.5" font-weight="bold" text-anchor="end">ESTADO</text>
        </g>

        <!-- Table Rows -->
        <g transform="translate(0, 40)">
          ${alumnos.slice(0, 8).map((a, idx) => {
            const y = idx * 46;
            const cedula = a.cedulaMenor || `1-2${String(340 + idx).padStart(3, '0')}-${String(100 + idx).padStart(4, '0')}`;
            const tel = a.telefonoApoderado || '8841-9230';
            const isAlt = idx % 2 === 1;
            return `
              <rect x="0" y="${y}" width="680" height="42" fill="${isAlt ? '#f8fafc' : '#ffffff'}" stroke="#e2e8f0" rx="3"/>
              <text x="12" y="${y + 25}" fill="#0f172a" font-family="monospace" font-size="11" font-weight="bold">${idx + 1}</text>
              <text x="40" y="${y + 19}" fill="#0f172a" font-family="sans-serif" font-size="10.5" font-weight="bold">${a.nombre}</text>
              <text x="40" y="${y + 33}" fill="#64748b" font-family="sans-serif" font-size="9">${a.curso} · ${a.colegio}</text>
              
              <text x="230" y="${y + 25}" fill="#0f172a" font-family="monospace" font-size="9.5">${cedula}</text>
              
              <text x="330" y="${y + 19}" fill="#0f172a" font-family="sans-serif" font-size="9.5" font-weight="bold">${a.apoderado}</text>
              <text x="330" y="${y + 33}" fill="#2563eb" font-family="monospace" font-size="9">${tel}</text>
              
              <text x="510" y="${y + 25}" fill="#475569" font-family="sans-serif" font-size="9" width="130">${a.direccion.slice(0, 28)}</text>
              
              <rect x="625" y="${y + 12}" width="48" height="18" fill="#dcfce7" rx="3"/>
              <text x="649" y="${y + 25}" fill="#15803d" font-family="sans-serif" font-size="8.5" font-weight="bold" text-anchor="middle">A BORDO</text>
            `;
          }).join('')}
        </g>
      </g>

      <!-- Signature & CTP Road Inspection Seal -->
      <g transform="translate(0, 620)">
        <rect width="680" height="115" fill="#f8fafc" stroke="#cbd5e1" rx="8"/>

        <!-- Left: Driver signature -->
        <g transform="translate(20, 15)">
          <text x="0" y="14" fill="#64748b" font-family="sans-serif" font-size="9" font-weight="bold">FIRMA DEL CONDUCTOR RESPONSABLE:</text>
          <line x1="0" y1="65" x2="220" y2="65" stroke="#475569" stroke-width="1.5"/>
          <text x="110" y="80" fill="#0f172a" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="middle">${van.chofer}</text>
          <text x="110" y="93" fill="#64748b" font-family="monospace" font-size="8.5" text-anchor="middle">Lic. C-2 · Céd. ${van.licenciaNumero || '1-1142-0892'}</text>
        </g>

        <!-- Center: Assistant signature -->
        <g transform="translate(260, 15)">
          <text x="0" y="14" fill="#64748b" font-family="sans-serif" font-size="9" font-weight="bold">ACOMPAÑANTE DE TRANSPORTE CTP:</text>
          <line x1="0" y1="65" x2="200" y2="65" stroke="#475569" stroke-width="1.5"/>
          <text x="100" y="80" fill="#0f172a" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="middle">${van.asistente || 'Patricia Mora Jiménez'}</text>
          <text x="100" y="93" fill="#64748b" font-family="monospace" font-size="8.5" text-anchor="middle">Carnet: ${van.carnetAsistente || 'ASIST-CTP-2024-881'}</text>
        </g>

        <!-- Right: Official CTP Traffic Police Stamp -->
        <g transform="translate(540, 10)">
          <circle cx="55" cy="45" r="42" fill="none" stroke="#2563eb" stroke-width="2" stroke-dasharray="4 2"/>
          <circle cx="55" cy="45" r="37" fill="none" stroke="#2563eb" stroke-width="1"/>
          <text x="55" y="32" fill="#1d4ed8" font-family="sans-serif" font-size="7" font-weight="bold" text-anchor="middle">CONSEJO TRANSPORTE PÚBLICO</text>
          <text x="55" y="44" fill="#1e40af" font-family="sans-serif" font-size="8.5" font-weight="900" text-anchor="middle">FISCALIZADO</text>
          <text x="55" y="56" fill="#15803d" font-family="sans-serif" font-size="8" font-weight="bold" text-anchor="middle">TRÁNSITO OK</text>
          <text x="55" y="68" fill="#475569" font-family="monospace" font-size="6.5" text-anchor="middle">DECRETO N° 35249</text>
        </g>
      </g>

      <!-- Legal note footer -->
      <g transform="translate(0, 755)">
        <text x="0" y="10" fill="#94a3b8" font-family="sans-serif" font-size="8">Documento oficial exigido por la Policía de Tránsito y el Consejo de Transporte Público (CTP) según el Decreto Ejecutivo N° 35249-MOPT.</text>
        <text x="0" y="22" fill="#94a3b8" font-family="sans-serif" font-size="8">Cualquier pasajero transportado no registrado en este manifiesto o sin póliza colectiva de seguro INS constituye infracción grave a la Ley N° 9078.</text>
      </g>
    </g>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
