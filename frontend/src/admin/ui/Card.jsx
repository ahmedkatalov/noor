export function Card({ title, right, children }) {
  return (
    <section className="rounded-2xl bg-white/[0.04] border border-white/10 p-4 md:p-5 shadow-sm">
      {(title || right) && (
        <div className="flex items-center justify-between gap-3 mb-4">
          {title ? <h2 className="font-bold text-white text-lg">{title}</h2> : <span />}
          {right}
        </div>
      )}
      <div>{children}</div>
    </section>
  );
}
