export function Input({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={[
        "h-12 px-4 rounded-xl bg-black/40 border border-white/10 text-white w-full",
        "outline-none transition focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20",
        "placeholder:text-white/40",
        className,
      ].join(" ")}
    />
  );
}
