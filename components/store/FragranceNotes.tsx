"use client";

interface FragranceNotesProps {
  notes: { top: string[]; heart: string[]; base: string[] };
}

export function FragranceNotes({ notes }: FragranceNotesProps) {
  const layers = [
    { label: "Top Notes", items: notes.top },
    { label: "Base Notes", items: notes.base },
  ];

  return (
    <div className="space-y-4">
      <h3 className="font-body text-xl">Fragrance Notes</h3>
      <div className="space-y-3">
        {layers.map((layer, i) => (
          <div
            key={layer.label}
            className="border-l-2 border-brown pl-4"
            style={{ marginLeft: `${i * 12}px` }}
          >
            <p className="text-xs uppercase tracking-wider text-black/50">{layer.label}</p>
            <p className="text-sm">{layer.items.join(", ") || "—"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
