import { PLAN, FIRST_DATE, LAST_DATE } from '@/data/plan';
import { HomeRedirect } from '@/components/HomeRedirect';

export const metadata = { title: 'Nationals' };

/**
 * The way in. Today's date has to be resolved in the browser because the site
 * is statically generated, so the redirect happens client-side against the
 * user's timezone.
 */
export default function Home() {
  return (
    <HomeRedirect
      first={FIRST_DATE}
      last={LAST_DATE}
      dates={PLAN.map((d) => d.date)}
    />
  );
}
