import { ReactNode } from "react";

export function PageHeader({ title, subtitle }: { title: ReactNode; subtitle?: ReactNode }) {
  return (
    <section className="bg-navy pb-10 pt-28 text-white">
      <div className="mx-auto max-w-7xl px-4">
        <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
        {subtitle ? <p className="mt-2 text-white/70">{subtitle}</p> : null}
      </div>
    </section>
  );
}
