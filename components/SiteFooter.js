import LoadingLink from "@/components/LoadingLink";

export default function SiteFooter({ name, home = false }) {
  return (
    <footer>
      <span>
        © {new Date().getFullYear()} {name}
      </span>
      {home ? <a href="#top">Back to top</a> : <LoadingLink href="/">Back to home</LoadingLink>}
    </footer>
  );
}
