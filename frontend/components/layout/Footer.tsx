export function Footer() {
  return (
    <footer
      className="mt-24 border-t border-zinc-200 bg-zinc-50 py-12"
      data-kami-mock-source="adr-0004-site-profile"
    >
      <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
        <p className="text-sm text-zinc-500">
          &copy; {new Date().getFullYear()} Felix_SANA. All rights reserved.
        </p>
        <p className="mt-2 text-xs text-zinc-400">
          Designed with restraint and whitespace.
        </p>
      </div>
    </footer>
  );
}
