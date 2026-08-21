export default function AuthInput({ label, ...props }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-ink-soft dark:text-slate-300">
        {label}
      </span>
      <input
        {...props}
        className="w-full rounded-md border border-ink/15 bg-transparent px-3 py-2 text-sm placeholder:text-ink-muted focus:border-brand dark:border-white/15 dark:placeholder:text-slate-500"
      />
    </label>
  );
}
