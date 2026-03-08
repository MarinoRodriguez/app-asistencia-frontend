export default function PageHeader({ title, subtitle, actions }) {
  return (
    <header className="page-header">
      <div>
        <h2>{title}</h2>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      <div className="header-actions">{actions}</div>
    </header>
  );
}
