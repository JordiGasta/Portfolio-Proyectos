interface VariacionBadgeProps {
  porcentaje: number;
}

export default function VariacionBadge({ porcentaje }: VariacionBadgeProps) {
  let color = "text-emerald-600";

  if (porcentaje < -10) {
    color = "text-rose-600";
  } else if (porcentaje < 0) {
    color = "text-amber-600";
  }

  return <span className={`text-sm font-medium ${color}`}>{porcentaje}%</span>;
}
