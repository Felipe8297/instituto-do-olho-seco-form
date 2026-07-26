/* eslint-disable @next/next/no-img-element */

// Barra superior clara com a logo — usada no wizard e no resultado.
export default function BrandBar({ children }: { children?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-white shadow-soft">
      <div className="mx-auto flex max-w-2xl flex-col gap-3 px-6 py-3">
        <div className="flex items-center gap-16">
          <img src="/logo.png" alt="Instituto do Olho Seco" className="h-8 w-auto" />
          <span className="text-lg font-semibold text-ink sm:text-xl">Check In Consulta</span>
        </div>
        {children}
      </div>
    </header>
  );
}
