export function EmptyState({
  title = "Nothing here yet",
  hint = "Like Nepal's slip cordon on a good day — empty, but full of potential. Run `npm run migrate && npm run seed` to fill the site with content.",
}: {
  title?: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-secondary/30 px-6 py-14 text-center">
      <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-accent text-2xl">
        🦆
      </div>
      <h3 className="font-heading text-lg font-semibold">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{hint}</p>
    </div>
  );
}
