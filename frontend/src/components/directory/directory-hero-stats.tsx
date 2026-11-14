import { cn } from "@/lib/utils";

export interface DirectoryHeroStat {
  label: string;
  value: string;
}

/**
 * The compact data band used at the bottom of every directory hero.
 * Mirrors the Majors header so the four Explore pages share one rhythm.
 */
export function DirectoryHeroStats({ stats }: { stats: readonly DirectoryHeroStat[] }) {
  return (
    <div className="mt-8 border-t border-[#E6E8F0]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <dl className="grid grid-cols-3 divide-x divide-[#E6E8F0]">
          {stats.map((stat, idx) => (
            <div
              key={stat.label}
              className={cn(
                "py-4",
                idx === 0 ? "pr-4" : "pl-4",
                idx === stats.length - 1 && "pr-0"
              )}
            >
              <dt className="text-[12px] font-semibold leading-snug text-[#68708A]">
                {stat.label}
              </dt>
              <dd className="mt-1 text-xl font-extrabold tabular-nums text-[#111965] sm:text-[23px]">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
