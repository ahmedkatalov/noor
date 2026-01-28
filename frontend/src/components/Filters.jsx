export default function Filters({
  categories = [],
  selectedCategoryId,
  selectedSubcategoryId,
  onChangeCategory,
  onChangeSubcategory
}) {
  const root = categories.filter((c) => !c.parent_id);
  const subsMap = categories.reduce((acc, c) => {
    if (c.parent_id) {
      acc[c.parent_id] = acc[c.parent_id] || [];
      acc[c.parent_id].push(c);
    }
    return acc;
  }, {});

  const subs = selectedCategoryId ? (subsMap[selectedCategoryId] || []) : [];

  return (
    <div className="w-full">
      {/* root categories */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          className={[
            "shrink-0 px-4 py-2 rounded-2xl border text-sm font-semibold transition",
            !selectedCategoryId
              ? "bg-white text-black border-white"
              : "bg-white/10 text-white border-white/20 hover:bg-white/15"
          ].join(" ")}
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
            className={[
              "shrink-0 px-4 py-2 rounded-2xl border text-sm font-semibold transition",
              selectedCategoryId === c.id
                ? "bg-white text-black border-white"
                : "bg-white/10 text-white border-white/20 hover:bg-white/15"
            ].join(" ")}
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
        <div className="mt-3 flex gap-2 flex-wrap">
          <button
            className={[
              "px-3 py-2 rounded-2xl border text-xs font-semibold transition",
              !selectedSubcategoryId
                ? "bg-white text-black border-white"
                : "bg-white/10 text-white border-white/20 hover:bg-white/15"
            ].join(" ")}
            onClick={() => onChangeSubcategory(null)}
          >
            Все
          </button>

          {subs.map((s) => (
            <button
              key={s.id}
              className={[
                "px-3 py-2 rounded-2xl border text-xs font-semibold transition",
                selectedSubcategoryId === s.id
                  ? "bg-white text-black border-white"
                  : "bg-white/10 text-white border-white/20 hover:bg-white/15"
              ].join(" ")}
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
