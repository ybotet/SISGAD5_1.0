// components/queja/QuejaEstadoBadge.tsx
interface QuejaEstadoBadgeProps {
  estado: string | null;
  showIcon?: boolean;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const ESTADO_CONFIG = {
  Abierta: {
    bgColor: "bg-blue-100",
    textColor: "text-blue-700",
    borderColor: "border-blue-200",
    icon: "ri-inbox-unarchive-line",
    label: "Abierta",
    description: "Queja recibida y en proceso",
  },
  Asignada: {
    bgColor: "bg-amber-100",
    textColor: "text-amber-700",
    borderColor: "border-amber-200",
    icon: "ri-user-star-line",
    label: "Asignada",
    description: "Asignada a un técnico",
  },
  Probada: {
    bgColor: "bg-purple-100",
    textColor: "text-purple-700",
    borderColor: "border-purple-200",
    icon: "ri-flask-line",
    label: "Probada",
    description: "Pruebas realizadas",
  },
  Resuelta: {
    bgColor: "bg-emerald-100",
    textColor: "text-emerald-700",
    borderColor: "border-emerald-200",
    icon: "ri-checkbox-circle-line",
    label: "Resuelta",
    description: "Solución aplicada",
  },
  Cerrada: {
    bgColor: "bg-gray-100",
    textColor: "text-gray-600",
    borderColor: "border-gray-200",
    icon: "ri-archive-line",
    label: "Cerrada",
    description: "Caso cerrado",
  },
  Pendiente: {
    bgColor: "bg-red-100",
    textColor: "text-red-700",
    borderColor: "border-red-200",
    icon: "ri-timer-flash-line",
    label: "Pendiente",
    description: "Esperando acción",
  },
};

const sizeClasses = {
  sm: {
    icon: "text-xs",
    padding: "p-1",
    text: "text-xs",
    gap: "gap-1",
  },
  md: {
    icon: "text-sm",
    padding: "p-1.5",
    text: "text-sm",
    gap: "gap-1.5",
  },
  lg: {
    icon: "text-base",
    padding: "p-2",
    text: "text-base",
    gap: "gap-2",
  },
};

export default function QuejaEstadoBadge({
  estado,
  showIcon = true,
  showLabel = true,
  size = "md",
  className = "",
}: QuejaEstadoBadgeProps) {
  const config = ESTADO_CONFIG[estado as keyof typeof ESTADO_CONFIG] || {
    bgColor: "bg-slate-100",
    textColor: "text-slate-500",
    borderColor: "border-slate-200",
    icon: "ri-question-line",
    label: "Sin estado",
  };

  const sizeConfig = sizeClasses[size];

  return (
    <div className={`flex items-center ${sizeConfig.gap} ${className}`}>
      {showIcon && (
        <div
          className={`
          ${config.bgColor} 
          ${sizeConfig.padding}
          rounded-full 
          transition-all duration-200 
          hover:scale-105 
          hover:shadow-sm
        `}
        >
          <i className={`${config.icon} ${config.textColor} ${sizeConfig.icon}`}></i>
        </div>
      )}
      {showLabel && (
        <span className={`font-semibold ${config.textColor} ${sizeConfig.text}`}>
          {config.label}
        </span>
      )}
    </div>
  );
}
