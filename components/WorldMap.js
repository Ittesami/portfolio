import { renderMap } from "@/lib/world";

// Static SVG world map (no client JavaScript). Visited countries are filled
// with the accent colour, home in amber; small countries also get a dot.
export default function WorldMap({ visited, home, label }) {
  const map = renderMap({ visited, home });
  return (
    <svg className="world-map" viewBox={`0 0 ${map.width} ${map.height}`} role="img" aria-label={label}>
      <g>
        {map.countries.map((c) => (
          <path key={c.code ?? c.name} d={c.d} className={c.state ? `country ${c.state}` : "country"}>
            {c.state && <title>{c.state === "home" ? `${c.name} (home)` : c.name}</title>}
          </path>
        ))}
      </g>
      <g>
        {map.dots.map((d) => (
          <g key={d.code}>
            <circle cx={d.x} cy={d.y} r="9" className={`dot-halo ${d.state}`} />
            <circle cx={d.x} cy={d.y} r="4" className={`dot ${d.state}`}>
              <title>{d.name}</title>
            </circle>
          </g>
        ))}
      </g>
    </svg>
  );
}
