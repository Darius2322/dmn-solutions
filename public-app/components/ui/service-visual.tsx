import * as Icons from "lucide-react";

const TONES: Record<string, { from: string; to: string; Icon: keyof typeof Icons }> = {
  digital_technology: { from: "217 55% 30%", to: "217 60% 18%", Icon: "Code2" },
  electrical: { from: "28 62% 42%", to: "24 60% 26%", Icon: "Zap" },
  computer_training: { from: "205 65% 38%", to: "217 55% 22%", Icon: "GraduationCap" },
  isp: { from: "217 55% 30%", to: "205 60% 24%", Icon: "Wifi" },
};

// Flat, on-brand panel (colour + fine grid + one icon) used instead of stock photos.
export function ServiceVisual({ category, className = "" }: { category: string; className?: string }) {
  const tone = TONES[category] ?? TONES.digital_technology;
  const Icon = (Icons as any)[tone.Icon] ?? Icons.Wrench;
  return (
    <div
      aria-hidden
      className={`relative flex h-full w-full items-center justify-center overflow-hidden ${className}`}
      style={{ background: `linear-gradient(135deg, hsl(${tone.from}), hsl(${tone.to}))` }}
    >
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <Icon className="relative h-12 w-12 text-white/90 sm:h-14 sm:w-14" strokeWidth={1.5} />
    </div>
  );
}
