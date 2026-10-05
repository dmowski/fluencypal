export function Banner({ children, tone }: { children: string | undefined; tone: "bad" }) {
  if (!children) return null;
  const color = tone === "bad" ? "border-red-900 bg-red-950/40 text-red-200" : "";
  return <p className={`rounded-xl border px-4 py-3 text-sm ${color}`}>{children}</p>;
}
