export function SetupMissing({ missing }: { missing: string[] }) {
  return (
    <section className="grid gap-2 rounded-2xl border border-amber-900/80 bg-amber-950/30 p-4 text-sm text-amber-100">
      <p>
        The server has no API key yet ({missing.join(", ")}). Audio never goes through this app server; the key is
        used only for the SDP exchange.
      </p>
      <ol className="list-decimal space-y-1 pl-5 text-amber-50/90">
        <li>Create an Alibaba Cloud Model Studio API key. International keys match the default Singapore endpoint.</li>
        <li>Enable billing on that account. A card is usually required before realtime calls work.</li>
        <li>
          Copy <code>.env.example</code> to <code>.env</code> in <code>realtimeQwen</code> and set{" "}
          <code>DASHSCOPE_API_KEY</code>.
        </li>
        <li>Restart <code>pnpm dev</code>.</li>
      </ol>
    </section>
  );
}
