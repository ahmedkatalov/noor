export function Card({ title, right, children }) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-4 md:p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-bold text-white">{title}</h2>
        {right}
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}
