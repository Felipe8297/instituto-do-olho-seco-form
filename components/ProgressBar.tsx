interface Props {
  current: number; // 1-based
  total: number;
}

export default function ProgressBar({ current, total }: Props) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="w-full">
      <div className="mb-1.5 flex items-baseline justify-end">
        <span className="text-xs font-semibold text-mute">{pct}%</span>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-line"
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={1}
        aria-valuemax={total}
      >
        <div
          className="h-full rounded-full bg-amber transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
