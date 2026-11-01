import Icon from "@/components/Icon";
import LoadingLink from "@/components/LoadingLink";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { getProfile } from "@/lib/profile";

export const revalidate = 60;

export const metadata = {
  title: "Projects · Ittehad Rahman",
  description: "Platforms, websites and research projects built by Ittehad Rahman.",
};

export default async function ProjectsPage() {
  const p = await getProfile();

  return (
    <div className="wrap">
      <SiteHeader profile={p} />

      <header className="block-head page-head">
        <p className="kicker">Projects</p>
        <h1 className="page-title">Things I&apos;ve built</h1>
        <p className="muted page-lead">
          Live platforms, client websites and research. Most of it sits where software meets a real operation: a
          classroom, a hospital, a doctor&apos;s chamber.
        </p>
      </header>

      <div className="bento">
        {p.projects.map((proj) => (
          <article key={proj.slug} className={`tile project big-tile ${proj.featured ? "c4" : "c2"}`}>
            <div className="row">
              <span className="kind">{proj.kind}</span>
              {proj.link && (
                <a className="see-all" href={proj.link} target="_blank" rel="noreferrer">
                  Visit site <Icon name="arrow" size={14} />
                </a>
              )}
            </div>
            <h2 className="project-title">{proj.name}</h2>
            <p>{proj.summary}</p>
            {proj.featured && proj.caseStudy && (
              <p className="muted">
                <strong>Outcome:</strong> {proj.caseStudy.outcome}
              </p>
            )}
            <div className="chips small">
              {proj.stack.map((s) => (
                <span key={s}>{s}</span>
              ))}
            </div>
            <LoadingLink className="btn small details-btn" href={`/projects/${proj.slug}`}>
              {proj.caseStudy ? "Read the case study" : "See details"} <Icon name="arrow" size={14} />
            </LoadingLink>
          </article>
        ))}
      </div>

      <SiteFooter name={p.name} />
    </div>
  );
}
