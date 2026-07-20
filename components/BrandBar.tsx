/* eslint-disable @next/next/no-img-element */

// Barra superior navy com a logo (branca) — usada no wizard e no resultado.
export default function BrandBar({ children }: { children?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-10 border-b border-navy-mid bg-navy">
      <div className="mx-auto flex max-w-2xl flex-col gap-3 px-6 py-3">
        <img src="/logo.png" alt="Instituto do Olho Seco" className="h-8 w-auto self-start" />
        {children}
      </div>
    </header>
  );
}
