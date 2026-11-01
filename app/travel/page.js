import Image from "next/image";
import Icon from "@/components/Icon";
import LoadingLink from "@/components/LoadingLink";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import WorldMap from "@/components/WorldMap";
import { getProfile } from "@/lib/profile";
import { getAlbums, visitedCountries } from "@/lib/travel";
import { countryName } from "@/lib/world";

export const revalidate = 60;

export const metadata = {
  title: "Travel · Ittehad Rahman",
  description: "Countries I've visited, with an album for each trip.",
};

export default async function TravelPage() {
  const [p, albums] = await Promise.all([getProfile(), getAlbums()]);
  const home = p.travel?.home ?? "";
  const visited = visitedCountries(p, albums);
  const names = visited.map(countryName).filter(Boolean).sort();

  return (
    <div className="wrap">
      <SiteHeader profile={p} />

      <header className="block-head page-head">
        <p className="kicker">
          <Icon name="globe" size={14} /> Off the clock
        </p>
        <h1 className="page-title">Places I&apos;ve been</h1>
        {p.travel?.intro && <p className="muted page-lead">{p.travel.intro}</p>}
      </header>

      <section className="tile map-tile">
        <WorldMap visited={visited} home={home} label={`World map. Visited: ${names.join(", ")}. Home: ${countryName(home)}.`} />
        <div className="map-foot">
          <p className="map-count">
            <strong>{names.length}</strong> {names.length === 1 ? "country" : "countries"} visited
          </p>
          <ul className="map-legend">
            <li>
              <span className="swatch visited" /> Visited
            </li>
            {home && (
              <li>
                <span className="swatch home" /> Home ({countryName(home)})
              </li>
            )}
          </ul>
        </div>
        <div className="chips">
          {names.map((n) => (
            <span key={n}>{n}</span>
          ))}
        </div>
      </section>

      <section className="block">
        <div className="block-head">
          <p className="kicker">Albums</p>
          <h2>Trips</h2>
        </div>
        {albums.length === 0 ? (
          <div className="tile empty-state">
            <Icon name="camera" />
            <p className="big">Albums are on their way.</p>
            <p className="muted">Each trip will get its own story and photos here.</p>
          </div>
        ) : (
          <ul className="album-grid">
            {albums.map((a) => (
              <li key={a.slug}>
                <LoadingLink href={`/travel/${a.slug}`} className="tile link-tile album-card">
                  <div className="album-cover">
                    {a.cover ? (
                      <Image src={a.cover.src} alt={a.cover.alt} fill sizes="(max-width: 620px) 100vw, (max-width: 960px) 50vw, 380px" />
                    ) : (
                      <span className="album-cover-empty">
                        <Icon name="camera" size={28} />
                      </span>
                    )}
                  </div>
                  <div className="album-text">
                    <p className="label">
                      <Icon name="pin" size={14} /> {[a.place, a.country].filter(Boolean).join(", ")}
                    </p>
                    <h3>{a.title}</h3>
                    {a.dates && <p className="muted small">{a.dates}</p>}
                    {a.description && <p className="muted album-excerpt">{a.description}</p>}
                    <span className="see-all">
                      {a.photoCount} {a.photoCount === 1 ? "photo" : "photos"} <Icon name="arrow" size={14} />
                    </span>
                  </div>
                </LoadingLink>
              </li>
            ))}
          </ul>
        )}
      </section>

      <SiteFooter name={p.name} />
    </div>
  );
}
