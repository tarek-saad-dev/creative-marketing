"use client";

import { useMemo, useState } from "react";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PublicPackageCard } from "@/server/services/commercial-landing.service";

type PackageComparisonProps = {
  packages: PublicPackageCard[];
};

export function PackageComparison({ packages }: PackageComparisonProps) {
  const rows = useMemo(() => {
    const map = new Map<
      string,
      {
        title: string;
        category: string | null;
        byPackage: Record<string, boolean | null>;
      }
    >();

    for (const pkg of packages) {
      for (const feature of pkg.features) {
        const key = `${feature.category ?? "general"}::${feature.title}`;
        const existing = map.get(key) ?? {
          title: feature.title,
          category: feature.category,
          byPackage: {},
        };
        existing.byPackage[pkg.id] = feature.included;
        map.set(key, existing);
      }
    }

    return [...map.values()];
  }, [packages]);

  const [selectedIndex, setSelectedIndex] = useState(0);

  if (packages.length < 2 || rows.length === 0) return null;

  return (
    <div className="card-glow space-y-4 rounded-2xl card-glass p-5 sm:p-6">
      <h3 className="font-headline text-xl font-semibold text-foreground">
        مقارنة سريعة
      </h3>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <caption className="sr-only">مقارنة مميزات الباكدجات</caption>
          <thead>
            <tr>
              <th scope="col" className="body-text-muted p-3 text-start">
                الميزة
              </th>
              {packages.map(pkg => (
                <th
                  key={pkg.id}
                  scope="col"
                  className="p-3 text-start font-semibold text-foreground"
                >
                  {pkg.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr
                key={`${row.category}-${row.title}`}
                className="border-t border-white/10"
              >
                <th
                  scope="row"
                  className="p-3 text-start font-medium text-foreground"
                >
                  {row.title}
                </th>
                {packages.map(pkg => {
                  const value = row.byPackage[pkg.id];
                  return (
                    <td key={pkg.id} className="p-3">
                      {value === true ? (
                        <span className="inline-flex items-center gap-1 text-brand-aqua">
                          <Check className="h-4 w-4" aria-hidden="true" />
                          <span className="sr-only">مشمول في {pkg.name}</span>
                        </span>
                      ) : value === false ? (
                        <span className="inline-flex items-center gap-1 text-foreground-muted">
                          <X className="h-4 w-4" aria-hidden="true" />
                          <span className="sr-only">
                            غير مشمول في {pkg.name}
                          </span>
                        </span>
                      ) : (
                        <span className="text-foreground-muted">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile tabs */}
      <div className="md:hidden">
        <TabGroup selectedIndex={selectedIndex} onChange={setSelectedIndex}>
          <TabList className="flex gap-2 overflow-x-auto pb-2">
            {packages.map(pkg => (
              <Tab
                key={pkg.id}
                className={({ selected }) =>
                  cn(
                    "min-h-11 shrink-0 rounded-pill px-4 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    selected
                      ? "bg-primary text-primary-foreground"
                      : "card-glass text-foreground"
                  )
                }
              >
                {pkg.name}
              </Tab>
            ))}
          </TabList>
          <TabPanels>
            {packages.map(pkg => (
              <TabPanel key={pkg.id} className="space-y-2 pt-2">
                {pkg.features.map(feature => (
                  <div
                    key={feature.id}
                    className="flex items-start gap-2 rounded-xl card-glass px-3 py-2 text-sm"
                  >
                    {feature.included ? (
                      <Check
                        className="mt-0.5 h-4 w-4 text-brand-aqua"
                        aria-hidden="true"
                      />
                    ) : (
                      <X
                        className="mt-0.5 h-4 w-4 text-foreground-muted"
                        aria-hidden="true"
                      />
                    )}
                    <span>
                      <span className="sr-only">
                        {feature.included ? "مشمول: " : "غير مشمول: "}
                      </span>
                      {feature.title}
                    </span>
                  </div>
                ))}
              </TabPanel>
            ))}
          </TabPanels>
        </TabGroup>
      </div>
    </div>
  );
}
