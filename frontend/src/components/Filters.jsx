export default function Filters({
  categories = [],
  selectedCategoryId,
  selectedSubcategoryId,
  onChangeCategory,
  onChangeSubcategory,
}) {
  const root = categories.filter((c) => !c.parent_id);
  const subsMap = categories.reduce((acc, c) => {
    if (c.parent_id) {
      acc[c.parent_id] = acc[c.parent_id] || [];
      acc[c.parent_id].push(c);
    }
    return acc;
  }, {});

  const subs = selectedCategoryId ? subsMap[selectedCategoryId] || [] : [];

  const chip = (active) =>
    [
      "shrink-0 px-4 py-2 rounded-full border text-sm font-semibold transition active:scale-95",
      active
        ? "bg-amber-500 text-black border-amber-400 shadow shadow-amber-500/20"
        : "bg-white/10 text-white border-white/15 hover:bg-white/15",
    ].join(" ");

  const subChip = (active) =>
    [
      "px-3 py-1.5 rounded-full border text-xs font-semibold transition active:scale-95",
      active
        ? "bg-amber-500 text-black border-amber-400"
        : "bg-white/10 text-white border-white/15 hover:bg-white/15",
    ].join(" ");

  return (
    <div className="w-full">
      {/* root categories */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
        <button
          className={chip(!selectedCategoryId)}
          onClick={() => {
            onChangeCategory(null);
            onChangeSubcategory(null);
          }}
        >
          Все
        </button>

        {root.map((c) => (
          <button
            key={c.id}
            className={chip(selectedCategoryId === c.id)}
            onClick={() => {
              onChangeCategory(c.id);
              onChangeSubcategory(null);
            }}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* subcategories */}
      {selectedCategoryId && subs.length > 0 && (
        <div className="mt-3 flex gap-2 flex-wrap animate-fade-in">
          <button className={subChip(!selectedSubcategoryId)} onClick={() => onChangeSubcategory(null)}>
            Все
          </button>

          {subs.map((s) => (
            <button
              key={s.id}
              className={subChip(selectedSubcategoryId === s.id)}
              onClick={() => onChangeSubcategory(s.id)}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
