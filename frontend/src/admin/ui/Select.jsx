export function Select({ className = "", ...props }) {
  return (
    <select
      {...props}
      className={[
        "h-12 px-4 rounded-xl bg-black/40 border border-white/10 text-white w-full",
        "outline-none transition focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className,
      ].join(" ")}
    />
  );
}
