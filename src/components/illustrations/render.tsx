import * as registry from './index';

type IllustrationComponent = () => React.ReactElement;

/**
 * Resolves an exercise's `illustration` field to its component. Kept in a
 * server component so a day page only ships the handful of SVGs it actually
 * uses rather than all fifty.
 */
export function Illustration({ name, className }: { name: string; className?: string }) {
  const Component = (registry as unknown as Record<string, IllustrationComponent | undefined>)[name];
  if (!Component) {
    // The validator makes this unreachable; if it ever happens, the card should
    // still render rather than take the whole morning down.
    return null;
  }
  return (
    <div className={className}>
      <Component />
    </div>
  );
}
