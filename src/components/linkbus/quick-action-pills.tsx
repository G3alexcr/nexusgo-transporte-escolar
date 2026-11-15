import { Navigation, Phone, MessageCircle, Send } from 'lucide-react';

export interface QuickActionPillsProps {
  lat?: number | undefined;
  lng?: number | undefined;
  locationName?: string | undefined;
  phone?: string | undefined;
  whatsappMessage?: string | undefined;
  className?: string | undefined;
  size?: 'sm' | 'md' | undefined;
  showNav?: boolean | undefined;
  showContact?: boolean | undefined;
}

export function QuickActionPills({
  lat,
  lng,
  locationName,
  phone,
  whatsappMessage,
  className = '',
  size = 'sm',
  showNav = true,
  showContact = true,
}: QuickActionPillsProps) {
  const cleanPhone = phone ? phone.replace(/\D/g, '') : '';
  const crPhone = cleanPhone.length === 8 ? `506${cleanPhone}` : cleanPhone;

  // URLs
  const wazeUrl =
    lat !== undefined && lng !== undefined
      ? `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`
      : locationName
      ? `https://waze.com/ul?q=${encodeURIComponent(locationName + ', Costa Rica')}&navigate=yes`
      : 'https://waze.com';

  const mapsUrl =
    lat !== undefined && lng !== undefined
      ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
      : locationName
      ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(locationName + ', Costa Rica')}`
      : 'https://maps.google.com';

  const waUrl = crPhone
    ? `https://wa.me/${crPhone}${
        whatsappMessage ? `?text=${encodeURIComponent(whatsappMessage)}` : ''
      }`
    : '#';

  const telUrl = crPhone ? `tel:+${crPhone}` : '#';

  const pillClass =
    size === 'sm'
      ? 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-150 hover:shadow-sm active:scale-95 bg-white/95 dark:bg-slate-900 shadow-[0_1px_2px_rgba(0,0,0,0.05)]'
      : 'inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-semibold border transition-all duration-150 hover:shadow-md active:scale-95 bg-white/95 dark:bg-slate-900 shadow-sm';

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      {/* 1. WAZE */}
      {showNav && (
        <a
          href={wazeUrl}
          target="_blank"
          rel="noopener noreferrer"
          title={`Abrir ${locationName || 'destino'} en Waze`}
          className={`${pillClass} border-blue-200 text-blue-600 hover:border-blue-300 hover:bg-blue-50/60 dark:border-blue-900/60 dark:text-blue-400 dark:hover:bg-blue-950/40`}
        >
          <Send className="h-3 w-3 -rotate-45 text-blue-500 fill-blue-500/20" />
          <span>Waze</span>
        </a>
      )}

      {/* 2. GOOGLE MAPS */}
      {showNav && (
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          title={`Abrir ${locationName || 'destino'} en Google Maps`}
          className={`${pillClass} border-indigo-200 text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/60 dark:border-indigo-900/60 dark:text-indigo-400 dark:hover:bg-indigo-950/40`}
        >
          <Navigation className="h-3 w-3 text-indigo-500 fill-indigo-500/20" />
          <span>Maps</span>
        </a>
      )}

      {/* 3. WHATSAPP */}
      {showContact && cleanPhone && (
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          title={`Escribir por WhatsApp a ${phone}`}
          className={`${pillClass} border-emerald-200 text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50/60 dark:border-emerald-900/60 dark:text-emerald-400 dark:hover:bg-emerald-950/40`}
        >
          <MessageCircle className="h-3.5 w-3.5 text-emerald-500" />
          <span>WhatsApp</span>
        </a>
      )}

      {/* 4. LLAMAR */}
      {showContact && cleanPhone && (
        <a
          href={telUrl}
          title={`Llamar a ${phone}`}
          className={`${pillClass} border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800`}
        >
          <Phone className="h-3 w-3 text-slate-600 dark:text-slate-300" />
          <span>Llamar</span>
        </a>
      )}
    </div>
  );
}
