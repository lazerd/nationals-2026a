import * as Illos from '@/components/illustrations';
import { EXERCISES } from '@/data/exercises';

export const metadata = { title: 'Illustration gallery' };

type Comp = () => React.ReactElement;

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ only?: string }>;
}) {
  const { only } = await searchParams;
  const registry = Illos as unknown as Record<string, Comp | undefined>;
  const inScope = only ? EXERCISES.filter((e) => e.category === only) : EXERCISES;
  const built = inScope.filter((e) => registry[e.illustration]);
  const missing = inScope.filter((e) => !registry[e.illustration]);

  return (
    <main className="mx-auto max-w-[430px] px-4 pb-24 pt-8">
      <h1 className="scoreboard text-3xl">Illustrations</h1>
      <p className="mt-2 text-sm text-ink-quiet">
        {built.length} of {inScope.length} built. Phone width, dark, as shipped.
      </p>

      <div className="mt-8 space-y-5">
        {built.map((e) => {
          const C = registry[e.illustration]!;
          return (
            <figure key={e.id} className="rounded-lg border border-line bg-surface p-3">
              <figcaption className="mb-1 flex items-baseline justify-between gap-3">
                <span className="text-[15px] font-semibold">{e.name}</span>
                <span className="text-[11px] text-ink-faint">{e.category}</span>
              </figcaption>
              <div className="rounded bg-ground">
                <C />
              </div>
            </figure>
          );
        })}
      </div>

      {missing.length > 0 && (
        <section className="mt-10">
          <h2 className="text-sm font-semibold text-warn">Not yet drawn ({missing.length})</h2>
          <ul className="mt-2 space-y-1 text-xs text-ink-quiet">
            {missing.map((e) => (
              <li key={e.id}>
                {e.name} <span className="text-ink-faint">· {e.illustration}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
