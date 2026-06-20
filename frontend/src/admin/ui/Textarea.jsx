export function Textarea({ className = "", ...props }) {
  return (
    <textarea
      {...props}
      className={[
        "min-h-[90px] px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white w-full",
        "outline-none transition focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20",
        "placeholder:text-white/40",
        className,
      ].join(" ")}
    />
  );
}
