import Image from "next/image";
import { notFound } from "next/navigation";
import Icon from "@/components/Icon";
import LoadingLink from "@/components/LoadingLink";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { getProfile } from "@/lib/profile";
import { getAlbum, getAlbums } from "@/lib/travel";
import { formatPhotoDate } from "@/lib/photos";

export const revalidate = 60;

export async function generateStaticParams() {
  return (await getAlbums()).map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const album = await getAlbum(slug);
  if (!album) return { title: "Trip not found" };
  return {
    title: `${album.title} · Travel · Ittehad Rahman`,
    description: album.description.slice(0, 160) || `Photos from ${album.country}.`,
  };
}

export default async function AlbumPage({ params }) {
  const { slug } = await params;
  const [p, album] = await Promise.all([getProfile(), getAlbum(slug)]);
  if (!album) notFound();

  return (
    <div className="wrap">
      <SiteHeader profile={p} />

      <LoadingLink className="back-link" href="/travel">
        <Icon name="back" size={16} /> All trips
      </LoadingLink>

      <header className="tile album-hero">
        <p className="label">
          <Icon name="pin" size={14} /> {[album.place, album.country].filter(Boolean).join(", ")}
          {album.dates && ` · ${album.dates}`}
        </p>
        <h1 className="page-title">{album.title}</h1>
        {album.description && (
          <div className="album-story">
            {album.description.split(/\n{2,}/).map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        )}
      </header>

      {album.photos.length === 0 ? (
        <div className="tile empty-state">
          <Icon name="camera" />
          <p className="big">Photos from this trip are coming soon.</p>
        </div>
      ) : (
        <ul className="photo-wall album-photos">
          {album.photos.map((ph, i) => {
            const date = formatPhotoDate(ph.date);
            return (
              <li key={ph.id} className="tile photo-card">
                <a className="photo-frame" href={ph.src} target="_blank" rel="noreferrer" aria-label={`Open ${ph.alt} full size`}>
                  <Image
                    src={ph.src}
                    alt={ph.alt}
                    fill
                    sizes="(max-width: 620px) 100vw, (max-width: 960px) 50vw, 380px"
                    priority={i < 3}
                  />
                </a>
                {(ph.title || date || ph.description) && (
                  <div className="photo-text">
                    {ph.title && <p className="photo-sentence">{ph.title}</p>}
                    {ph.description && <p className="muted small">{ph.description}</p>}
                    {date && (
                      <time className="label" dateTime={ph.date}>
                        {date}
                      </time>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <SiteFooter name={p.name} />
    </div>
  );
}
