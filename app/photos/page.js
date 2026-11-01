import Image from "next/image";
import LoadingLink from "@/components/LoadingLink";
import Icon from "@/components/Icon";
import { getProfile } from "@/lib/profile";
import { getPhotos, formatPhotoDate } from "@/lib/photos";

export const revalidate = 60;

export const metadata = {
  title: "Photography · Ittehad Rahman",
  description: "Photos by Ittehad Rahman.",
};

export default async function PhotosPage() {
  const [p, { photos }] = await Promise.all([getProfile(), getPhotos()]);
  const firstName = p.name.split(" ")[0];

  return (
    <div className="wrap">
      <nav className="nav" aria-label="Main">
        <LoadingLink className="mark" href="/">
          {firstName}
          <i />
        </LoadingLink>
        <LoadingLink className="btn small" href="/#life">
          <Icon name="back" size={16} /> Back to portfolio
        </LoadingLink>
      </nav>

      <header className="block-head photos-head">
        <p className="kicker">
          <Icon name="camera" size={14} /> Off the clock
        </p>
        <h1 className="page-title">Photography</h1>
        <p className="muted">{p.interests?.photography}</p>
      </header>

      {photos.length === 0 ? (
        <div className="tile empty-state">
          <Icon name="camera" />
          <p className="big">Photos are on their way.</p>
          <p className="muted">Check back soon.</p>
        </div>
      ) : (
        <ul className="photo-wall">
          {photos.map((ph, i) => {
            const date = formatPhotoDate(ph.date);
            const hasText = ph.title || date || ph.description;
            return (
              <li key={ph.file} className="tile photo-card">
                <a className="photo-frame" href={ph.src} target="_blank" rel="noreferrer" aria-label={`Open ${ph.alt} full size`}>
                  <Image
                    src={ph.src}
                    alt={ph.alt}
                    fill
                    sizes="(max-width: 620px) 100vw, (max-width: 960px) 50vw, 380px"
                    priority={i < 3}
                  />
                </a>
                {hasText && (
                  <div className="photo-text">
                    {date && (
                      <time className="label" dateTime={ph.date}>
                        {date}
                      </time>
                    )}
                    {ph.title && <h2>{ph.title}</h2>}
                    {ph.description && <p className="muted">{ph.description}</p>}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <footer>
        <span>
          © {new Date().getFullYear()} {p.name}
        </span>
        <LoadingLink href="/">Back to portfolio</LoadingLink>
      </footer>
    </div>
  );
}
