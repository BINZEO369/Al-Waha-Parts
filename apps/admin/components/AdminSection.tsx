import Link from 'next/link';

export function SectionHeader({ eyebrow, title, description, action, actionHref }: { eyebrow: string; title: string; description: string; action?: string; actionHref?: string }) {
  return (
    <header className="page-heading">
      <div>
        <span className="eyebrow"><b>01</b>{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action && actionHref ? <Link className="primary-button" href={actionHref}>{action}<span>↗</span></Link> : action ? <button className="primary-button" type="button">{action}<span>+</span></button> : null}
    </header>
  );
}

export function WorkspaceCard({ number, label, title, description, action }: { number: string; label: string; title: string; description: string; action?: string }) {
  return (
    <article className="workspace-card">
      <div className="workspace-number">{number}</div>
      <div className="workspace-copy"><span className="eyebrow">{label}</span><h2>{title}</h2><p>{description}</p></div>
      {action && <button className="text-button" type="button">{action}<span>↗</span></button>}
    </article>
  );
}

export function InfoStrip({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="info-strip"><span className="eyebrow">{label}</span><strong>{children}</strong></div>;
}
