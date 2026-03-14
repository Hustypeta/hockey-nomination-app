import Link from "next/link";

export default function NominationNotFound() {
  return (
    <div className="min-h-screen bg-[#0c0e12] flex flex-col items-center justify-center px-4">
      <h1 className="font-display text-4xl text-white mb-2">
        Nominace nenalezena
      </h1>
      <p className="text-white/70 mb-8">
        Tato nominace neexistuje nebo byla smazána.
      </p>
      <Link
        href="/"
        className="px-6 py-3 rounded-xl bg-[#c41e3a] text-white font-display text-lg hover:bg-[#a01830] transition-colors"
      >
        Sestav si vlastní nominaci
      </Link>
    </div>
  );
}
