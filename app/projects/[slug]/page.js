import { notFound } from "next/navigation";
import Icon from "@/components/Icon";
import LoadingLink from "@/components/LoadingLink";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { getProfile } from "@/lib/profile";

export const revalidate = 60;

export async function generateStaticParams() {
  const p = await getProfile();
  return p.projects.map((proj) => ({ slug: proj.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const proj = (await getProfile()).projects.find((x) => x.slug === slug);
  if (!proj) return { title: "Project not found" };
  return { title: `${proj.name} · Ittehad Rahman`, description: proj.short ?? proj.summary };
}

export default async function ProjectPage({ params }) {
  const { slug } = await params;
  const p = await getProfile();
  const index = p.projects.findIndex((x) => x.slug === slug);
  if (index < 0) notFound();
  const proj = p.projects[index];
  const others = p.projects.filter((x) => x.slug !== slug);
  const cs = proj.caseStudy;

  return (
    <div className="wrap">
      <SiteHeader profile={p} />

      <LoadingLink className="back-link" href="/projects">
        <Icon name="back" size={16} /> All projects
      </LoadingLink>

      <div className="bento project-detail">
        <header className="tile c4 project-hero">
          <span className="kind">{proj.kind}</span>
          <h1 className="page-title">{proj.name}</h1>
          <p className="lead project-lead">{proj.summary}</p>
          {(proj.link || proj.repo) && (
            <div className="cta">
              {proj.link && (
                <a className="btn primary" href={proj.link} target="_blank" rel="noreferrer">
                  Visit the live site <Icon name="arrow" size={16} />
                </a>
              )}
              {proj.repo && (
                <a className="btn" href={proj.repo} target="_blank" rel="noreferrer">
                  Source code <Icon name="arrow" size={16} />
                </a>
              )}
            </div>
          )}
        </header>

        {cs ? (
          <>
            <section className="tile c2">
              <p className="label">The problem</p>
              <p className="big">{cs.problem}</p>
            </section>
            <section className="tile accent c2">
              <p className="label">Outcome</p>
              <p className="big">{cs.outcome}</p>
            </section>
            <section className="tile c4">
              <p className="label">How I built it</p>
              <p className="detail-text">{cs.approach}</p>
            </section>
          </>
        ) : null}

        <section className={`tile ${cs ? "c4" : "c2"}`}>
          <Icon name="code" />
          <p className="label">Built with</p>
          <div className="chips">
            {proj.stack.map((s) => (
              <span key={s}>{s}</span>
            ))}
          </div>
        </section>

        {!cs && (
          <section className="tile ink c2">
            <p className="label">Status</p>
            <p className="big">{proj.kind}</p>
            {proj.link && <p>Open the live site to see it in use.</p>}
          </section>
        )}
      </div>

      {others.length > 0 && (
        <section className="block">
          <div className="block-head">
            <p className="kicker">More projects</p>
          </div>
          <div className="bento">
            {others.slice(0, 4).map((o) => (
              <LoadingLink key={o.slug} href={`/projects/${o.slug}`} className="tile link-tile project-card c1">
                <span className="kind">{o.kind}</span>
                <h3>{o.name}</h3>
                <p className="muted">{o.short ?? o.summary}</p>
                <span className="see-all">
                  Read more <Icon name="arrow" size={14} />
                </span>
              </LoadingLink>
            ))}
          </div>
        </section>
      )}

      <SiteFooter name={p.name} />
    </div>
  );
}
