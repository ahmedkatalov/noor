export function Input({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={[
        "h-12 px-4 rounded-xl bg-black/40 border border-white/10 outline-none text-white w-full",
        className
      ].join(" ")}
    />
  );
}
