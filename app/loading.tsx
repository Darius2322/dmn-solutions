// app/loading.tsx
export default function Loading() {
  return (
    <div className="min-h-screen bg-[#07070f] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-electric to-neon animate-pulse" />
        <div className="text-white/30 font-syne font-semibold text-sm tracking-wider">Loading…</div>
      </div>
    </div>
  );
}
