import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

type CardAccent = 'blue' | 'amber' | 'teal' | 'violet';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  accent?: CardAccent;
  children: ReactNode;
}

const accentStyles: Record<
  CardAccent,
  { hoverBg: string; iconBg: string; iconFg: string }
> = {
  blue: {
    hoverBg: 'hover:bg-blue-500/5 dark:hover:bg-blue-400/5',
    iconBg: 'bg-blue-500/10',
    iconFg: 'text-blue-600 dark:text-blue-400',
  },
  amber: {
    hoverBg: 'hover:bg-amber-500/5 dark:hover:bg-amber-400/5',
    iconBg: 'bg-amber-500/10',
    iconFg: 'text-amber-600 dark:text-amber-400',
  },
  teal: {
    hoverBg: 'hover:bg-teal-500/5 dark:hover:bg-teal-400/5',
    iconBg: 'bg-teal-500/10',
    iconFg: 'text-teal-600 dark:text-teal-400',
  },
  violet: {
    hoverBg: 'hover:bg-violet-500/5 dark:hover:bg-violet-400/5',
    iconBg: 'bg-violet-500/10',
    iconFg: 'text-violet-600 dark:text-violet-400',
  },
};

function FeatureCard({
  icon: Icon,
  title,
  accent = 'blue',
  children,
}: FeatureCardProps) {
  const styles = accentStyles[accent];

  return (
    <div
      className={`group rounded-xl border border-fd-border bg-fd-card p-5 transition-colors duration-200 ${styles.hoverBg}`}
    >
      <div
        className={`mb-3 flex size-10 items-center justify-center rounded-lg ${styles.iconBg} ${styles.iconFg}`}
      >
        <Icon className="size-5" />
      </div>
      <h3 className="mb-1.5 text-sm font-semibold text-fd-foreground">
        {title}
      </h3>
      <div className="text-sm leading-relaxed text-fd-muted-foreground [&_code]:rounded-sm [&_code]:bg-fd-muted/60 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-xs [&_code]:font-mono [&_p]:m-0">
        {children}
      </div>
    </div>
  );
}

function FeatureCards({ children }: { children: ReactNode }) {
  return (
    <div className="not-prose grid grid-cols-1 gap-4 sm:grid-cols-2">
      {children}
    </div>
  );
}

export { FeatureCard, FeatureCards };
