// A small Markdown renderer for lesson notes: headings, paragraphs, lists, tables,
// quotes, fenced code, inline code, bold, italics and links. It builds React elements
// (no raw HTML), so note text can't inject markup. A "### Answers" heading turns
// everything after it, up to the next heading, into a fold-out.

const INLINE = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\[[^\]]+\]\([^)\s]+\))|(\*[^*\s][^*]*\*)/g;

function inline(text, keyBase = "i") {
  const out = [];
  let last = 0;
  let n = 0;
  for (const m of text.matchAll(INLINE)) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const [tok] = m;
    const key = `${keyBase}-${n++}`;
    if (m[1]) out.push(<code key={key}>{tok.slice(1, -1)}</code>);
    else if (m[2]) out.push(<strong key={key}>{inline(tok.slice(2, -2), key)}</strong>);
    else if (m[3]) {
      const [, label, href] = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(tok);
      const safe = /^https?:\/\//i.test(href) ? href : null;
      out.push(
        safe ? (
          <a key={key} href={safe} target="_blank" rel="noreferrer">
            {label}
          </a>
        ) : (
          label
        ),
      );
    } else out.push(<em key={key}>{tok.slice(1, -1)}</em>);
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

const cells = (line) =>
  line
    .trim()
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((c) => c.trim());

// Markdown text -> a flat list of blocks.
function parse(md) {
  const lines = md.split("\n");
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }
    const fence = /^```(\w*)/.exec(line);
    if (fence) {
      const code = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) code.push(lines[i++]);
      i++;
      blocks.push({ type: "code", lang: fence[1], text: code.join("\n") });
      continue;
    }
    const h = /^(#{1,4})\s+(.*)$/.exec(line);
    if (h) {
      blocks.push({ type: "heading", level: h[1].length, text: h[2] });
      i++;
      continue;
    }
    if (line.trim().startsWith("|")) {
      const rows = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) rows.push(lines[i++]);
      const body = rows.filter((r, k) => !(k === 1 && /^\|?[\s:|-]+\|?$/.test(r.trim())));
      blocks.push({ type: "table", head: cells(body[0]), rows: body.slice(1).map(cells) });
      continue;
    }
    if (line.startsWith(">")) {
      const quote = [];
      while (i < lines.length && lines[i].startsWith(">")) quote.push(lines[i++].replace(/^>\s?/, ""));
      blocks.push({ type: "quote", text: quote.join(" ") });
      continue;
    }
    const listItem = /^(\s*)([-*]|\d+\.)\s+(.*)$/;
    if (listItem.test(line)) {
      const ordered = /^\s*\d+\./.test(line);
      const items = [];
      while (i < lines.length && listItem.test(lines[i])) {
        const [, indent, , text] = listItem.exec(lines[i++]);
        // Indented items belong to the item above them.
        if (indent.length >= 2 && items.length) items[items.length - 1].sub.push(text);
        else items.push({ text, sub: [] });
      }
      blocks.push({ type: ordered ? "ol" : "ul", items });
      continue;
    }
    const para = [];
    while (i < lines.length && lines[i].trim() && !/^(```|#{1,4}\s|\||>|\s*([-*]|\d+\.)\s)/.test(lines[i])) para.push(lines[i++].trim());
    if (para.length) blocks.push({ type: "p", text: para.join(" ") });
    else i++;
  }
  return blocks;
}

function Block({ b, k }) {
  switch (b.type) {
    case "heading": {
      const Tag = b.level <= 2 ? "h2" : b.level === 3 ? "h3" : "h4";
      return <Tag className={`md-h${Math.max(2, b.level)}`}>{inline(b.text, k)}</Tag>;
    }
    case "code":
      return (
        <pre className="md-code">
          <code>{b.text}</code>
        </pre>
      );
    case "table":
      return (
        <div className="md-table-wrap">
          <table className="md-table">
            <thead>
              <tr>
                {b.head.map((c, j) => (
                  <th key={j}>{inline(c, `${k}-h${j}`)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {b.rows.map((r, ri) => (
                <tr key={ri}>
                  {r.map((c, j) => (
                    <td key={j}>{inline(c, `${k}-${ri}-${j}`)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "quote":
      return <blockquote className="md-quote">{inline(b.text, k)}</blockquote>;
    case "ul":
    case "ol": {
      const Tag = b.type;
      return (
        <Tag className="md-list">
          {b.items.map((it, j) => (
            <li key={j}>
              {inline(it.text, `${k}-${j}`)}
              {it.sub.length > 0 && (
                <ul className="md-list">
                  {it.sub.map((s, si) => (
                    <li key={si}>{inline(s, `${k}-${j}-${si}`)}</li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </Tag>
      );
    }
    default:
      return <p>{inline(b.text, k)}</p>;
  }
}

export default function Markdown({ text }) {
  const blocks = parse(text);
  const out = [];
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (b.type === "heading" && /^answers?$/i.test(b.text.trim())) {
      const inside = [];
      while (i + 1 < blocks.length && !(blocks[i + 1].type === "heading" && blocks[i + 1].level <= b.level)) inside.push(blocks[++i]);
      out.push(
        <details key={i} className="md-answers">
          <summary>Show answers</summary>
          {inside.map((x, j) => (
            <Block key={j} b={x} k={`a${i}-${j}`} />
          ))}
        </details>,
      );
      continue;
    }
    out.push(<Block key={i} b={b} k={`b${i}`} />);
  }
  return <div className="md">{out}</div>;
}
