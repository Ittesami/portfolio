import Icon from "@/components/Icon";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { getProfile } from "@/lib/profile";

export const revalidate = 60;

export const metadata = {
  title: "Experience · Ittehad Rahman",
  description: "Work experience, education and skills of Ittehad Rahman.",
};

export default async function ExperiencePage() {
  const p = await getProfile();

  return (
    <div className="wrap">
      <SiteHeader profile={p} />

      <header className="block-head page-head">
        <p className="kicker">Experience</p>
        <h1 className="page-title">Where I&apos;ve been</h1>
        <p className="muted page-lead">
          Data analysis, full-stack development and six years of teaching, now alongside an MSc in Artificial
          Intelligence at Brunel.
        </p>
      </header>

      <section className="bento">
        {p.experience.map((role) => (
          <article key={`${role.title}-${role.org}`} className="tile c2 big-tile role-tile">
            <div className="row">
              <span className="kind">{role.tag}</span>
              <Icon name="briefcase" size={18} />
            </div>
            <h2 className="project-title">{role.title}</h2>
            <p className="org-line">{role.org}</p>
            <p className="detail-text">{role.summary}</p>
          </article>
        ))}
      </section>

      <section id="education" className="block">
        <div className="block-head">
          <p className="kicker">Education</p>
          <h2>Study</h2>
        </div>
        <div className="bento">
          {p.education.map((e) => (
            <article className="tile c2 big-tile" key={e.degree}>
              <Icon name="cap" />
              <h3 className="project-title">{e.degree}</h3>
              <p className="muted">{e.meta}</p>
              <p>{e.note}</p>
              {e.modules?.length > 0 && (
                <>
                  <p className="label modules-label">Modules</p>
                  <ul className="modules">
                    {e.modules.map((m) => (
                      <li key={m}>{m}</li>
                    ))}
                  </ul>
                </>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="block">
        <div className="bento">
          <div className="tile c4">
            <Icon name="code" />
            <p className="label">Toolkit</p>
            <div className="chips">
              {p.skills.map((s) => (
                <span key={s}>{s}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <SiteFooter name={p.name} />
    </div>
  );
}
