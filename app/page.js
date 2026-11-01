import Image from "next/image";
import CopyEmail from "@/components/CopyEmail";
import ContactForm from "@/components/ContactForm";
import Icon from "@/components/Icon";
import LoadingLink from "@/components/LoadingLink";
import { getProfile } from "@/lib/profile";
import { getPhotos } from "@/lib/photos";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const revalidate = 60;

function initials(name) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");
}

// Placeholder squares keep the photo tiles in shape until real photos are added.
function PhotoGrid({ photos, count, sizes }) {
  const items = photos.slice(0, count);
  if (items.length === 0) {
    return (
      <div className="photos empty" aria-hidden="true">
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className={`ph ph${i % 4}`} />
        ))}
      </div>
    );
  }
  return (
    <div className="photos">
      {items.map((p) => (
        <figure key={p.src}>
          <Image src={p.src} alt={p.alt || ""} fill sizes={sizes} />
          {p.caption && <figcaption>{p.caption}</figcaption>}
        </figure>
      ))}
    </div>
  );
}

export default async function Home() {
  const [p, { avatar, photos }] = await Promise.all([getProfile(), getPhotos()]);
  const featured = p.projects.find((x) => x.featured) ?? p.projects[0];
  const links = [...(p.links?.profiles ?? []), { label: "Email", href: `mailto:${p.email}`, icon: "mail" }];

  return (
    <div className="wrap">
      <SiteHeader profile={p} home />

      {/* ---------- Hero bento ---------- */}
      <header id="top" className="bento hero-grid">
        <section className="tile intro c2 r2">
          <div className="avatar">
            {avatar ? (
              <Image src={avatar} alt={p.name} fill sizes="72px" priority />
            ) : (
              <span>{initials(p.name)}</span>
            )}
          </div>
          <div>
            <p className="eyebrow">{p.role}</p>
            <h1>
              {p.name}
              <span className="dot">.</span>
            </h1>
            <p className="lead">{p.lead}</p>
            <div className="cta">
              <a className="btn primary" href="#projects">See projects</a>
              {p.links?.cv ? (
                <a className="btn" href={p.links.cv} target="_blank" rel="noreferrer">
                  <Icon name="download" size={16} /> Download CV
                </a>
              ) : (
                <a className="btn" href="#contact">Get in touch</a>
              )}
            </div>
          </div>
        </section>

        <section className="tile c1">
          <Icon name="book" />
          <p className="label">Studying</p>
          <p className="big">{p.studying.degree}</p>
          <p className="muted">
            {p.studying.school} · until {p.studying.until}
          </p>
        </section>

        <section className="tile c1">
          <Icon name="pin" />
          <p className="label">Based in</p>
          <p className="big">{p.location}</p>
          <p className="muted">Originally from {p.hometown}</p>
        </section>

        <LoadingLink className="tile accent c2 link-tile" href={`/projects/${featured.slug}`}>
          <div className="row">
            <p className="label">Featured project</p>
            <Icon name="arrow" />
          </div>
          <p className="big">{featured.name}</p>
          <p>{featured.short ?? featured.summary}</p>
        </LoadingLink>

        <section className="tile ink c1">
          <p className="label">Find me</p>
          <ul className="link-list">
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href} target={l.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                  <Icon name={l.icon} size={18} /> {l.label}
                  {l.note && <span className="link-note">{l.note}</span>}
                  <Icon name="arrow" size={16} />
                </a>
              </li>
            ))}
          </ul>
        </section>

        <LoadingLink className="tile photo-tile c1 link-tile" href="/photos" aria-label="Photography: see all photos">
          <PhotoGrid photos={photos} count={1} sizes="(max-width: 620px) 100vw, 280px" />
          <span className="photo-label">
            <Icon name="camera" size={16} /> Photography
          </span>
        </LoadingLink>

        <section className="tile c2">
          <Icon name="code" />
          <p className="label">Toolkit</p>
          <div className="chips">
            {p.skills.map((s) => (
              <span key={s}>{s}</span>
            ))}
          </div>
        </section>
      </header>

      {/* ---------- Projects (short tiles; details live on /projects) ---------- */}
      <section id="projects" className="block">
        <div className="block-head row">
          <div>
            <p className="kicker">Selected projects</p>
            <h2>Things I&apos;ve built</h2>
          </div>
          <LoadingLink className="see-all" href="/projects">
            All projects <Icon name="arrow" size={16} />
          </LoadingLink>
        </div>
        <div className="bento">
          {p.projects.map((proj, i) => (
            <LoadingLink
              key={proj.slug}
              href={`/projects/${proj.slug}`}
              className={`tile link-tile project-card ${i < 2 ? "c2" : "c1"}${proj.featured ? " featured" : ""}`}
            >
              <span className="kind">{proj.kind}</span>
              <h3>{proj.name}</h3>
              <p className="muted">{proj.short ?? proj.summary}</p>
              <div className="chips small">
                {proj.stack.slice(0, i < 2 ? 4 : 3).map((s) => (
                  <span key={s}>{s}</span>
                ))}
              </div>
              <span className="see-all">
                Read more <Icon name="arrow" size={14} />
              </span>
            </LoadingLink>
          ))}
          {p.projects.length % 2 === 1 && (
            <LoadingLink href="/projects" className="tile link-tile ink c1 more-tile">
              <p className="label">Everything I&apos;ve built</p>
              <p className="big">All projects, with case studies</p>
              <Icon name="arrow" />
            </LoadingLink>
          )}
        </div>
      </section>

      {/* ---------- Experience + education ---------- */}
      <section id="experience" className="block">
        <div className="block-head">
          <p className="kicker">Experience and education</p>
          <h2>Where I&apos;ve been</h2>
        </div>
        <div className="bento">
          <div className="tile c2 r2">
            <Icon name="briefcase" />
            <ul className="roles">
              {p.experience.map((role) => (
                <li key={`${role.title}-${role.org}`}>
                  <div className="row">
                    <h3>{role.title}</h3>
                    <span className="kind">{role.tag}</span>
                  </div>
                  <p className="org">{role.org}</p>
                  {role.short && <p>{role.short}</p>}
                </li>
              ))}
            </ul>
            <LoadingLink className="see-all" href="/experience">
              Full experience <Icon name="arrow" size={14} />
            </LoadingLink>
          </div>
          {p.education.map((e) => (
            <div className="tile c2" key={e.degree}>
              <Icon name="cap" />
              <h3>{e.degree}</h3>
              <p className="muted">{e.meta}</p>
              <p>{e.note}</p>
              <LoadingLink className="see-all" href="/experience#education">
                Modules and details <Icon name="arrow" size={14} />
              </LoadingLink>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Off the clock ---------- */}
      <section id="life" className="block">
        <div className="block-head">
          <p className="kicker">Off the clock</p>
          <h2>Away from the keyboard</h2>
        </div>
        <div className="bento">
          <LoadingLink className="tile gallery link-tile c2 r2" href="/photos">
            <div className="row">
              <p className="label">
                <Icon name="camera" size={16} /> Photography
              </p>
              <span className="see-all">
                See all photos <Icon name="arrow" size={16} />
              </span>
            </div>
            <PhotoGrid photos={photos} count={photos.length ? Math.min(photos.length, 9) : 6} sizes="(max-width: 620px) 33vw, 200px" />
            <p className="muted">{p.interests.photography}</p>
          </LoadingLink>
          <LoadingLink className="tile link-tile c2 travel-tile" href="/travel">
            <div className="row">
              <Icon name="globe" />
              <span className="see-all">
                Map and trips <Icon name="arrow" size={14} />
              </span>
            </div>
            <p className="label">Travelling</p>
            <p className="big">{p.interests.travel}</p>
            {p.interests.places?.length > 0 && (
              <div className="chips">
                {p.interests.places.map((place) => (
                  <span key={place}>{place}</span>
                ))}
              </div>
            )}
          </LoadingLink>
          <div className="tile c2">
            <Icon name="paddle" />
            <p className="label">Table tennis and sport</p>
            <p>{p.interests.tableTennis}</p>
          </div>
        </div>
      </section>

      {/* ---------- Contact ---------- */}
      <section id="contact" className="block">
        <div className="tile contact c4">
          <div>
            <p className="kicker">Contact</p>
            <h2>Let&apos;s build something useful.</h2>
            <CopyEmail email={p.email} />
          </div>
          <ContactForm />
        </div>
      </section>

      <SiteFooter name={p.name} home />
    </div>
  );
}
