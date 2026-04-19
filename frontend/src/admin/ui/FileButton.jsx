export function FileButton({ label, disabled, onPick }) {
  return (
    <label
      className={[
        "inline-flex items-center justify-center w-full px-4 py-3 rounded-xl",
        "border border-white/20 bg-white/10 hover:bg-white/15 cursor-pointer transition text-center",
        disabled ? "opacity-40 pointer-events-none" : ""
      ].join(" ")}
    >
      <span className="text-sm text-white font-medium">{label}</span>
      <input
        type="file"
        accept="image/*,image/gif"
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onPick(file);
          e.target.value = "";
        }}
      />
    </label>
  );
}
