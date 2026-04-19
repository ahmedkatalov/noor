export function Textarea({ className = "", ...props }) {
  return (
    <textarea
      {...props}
      className={[
        "min-h-[90px] px-4 py-3 rounded-xl bg-black/40 border border-white/10 outline-none text-white w-full",
        className
      ].join(" ")}
    />
  );
}
