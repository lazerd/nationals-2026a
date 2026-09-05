import { EXERCISES } from '@/data/exercises';
import { Illustration } from '@/components/illustrations/render';
import { GalleryFilter } from './GalleryFilter';

export const metadata = { title: 'Illustration gallery' };

/**
 * Review surface for the figure system. Every illustration is rendered on the
 * server; the category filter only hides them, so the page stays static.
 */
export default function GalleryPage() {
  return (
    <main className="mx-auto max-w-[430px] px-4 pb-24 pt-8">
      <h1 className="scoreboard text-3xl">Illustrations</h1>
      <p className="mt-2 text-sm text-ink-quiet">
        {EXERCISES.length} exercises. Phone width, dark, as shipped.
      </p>

      <GalleryFilter
        items={EXERCISES.map((e) => ({
          id: e.id,
          name: e.name,
          category: e.category,
          svg: <Illustration name={e.illustration} />,
        }))}
      />
    </main>
  );
}
