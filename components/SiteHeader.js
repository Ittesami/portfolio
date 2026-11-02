import LoadingLink from "@/components/LoadingLink";

const LINKS = [
  ["/projects", "Projects"],
  ["/experience", "Experience"],
  ["/travel", "Travel"],
  ["/photos", "Photos"],
  ["/#contact", "Contact"],
];

// Top navigation shared by every public page. The links always go to the
// full pages; on the home page the name scrolls back to the top.
export default function SiteHeader({ profile, home = false }) {
  const firstName = profile.name.split(" ")[0];

  return (
    <nav className="nav" aria-label="Main">
      {home ? (
        <a className="mark" href="#top">
          {firstName}
          <i />
        </a>
      ) : (
        <LoadingLink className="mark" href="/">
          {firstName}
          <i />
        </LoadingLink>
      )}
      <ul>
        {LINKS.map(([href, label]) => (
          <li key={href}>
            {home && href === "/#contact" ? <a href="#contact">{label}</a> : <LoadingLink href={href}>{label}</LoadingLink>}
          </li>
        ))}
      </ul>
    </nav>
  );
}
