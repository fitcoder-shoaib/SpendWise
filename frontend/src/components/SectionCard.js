export default function SectionCard({ title, action, children }) {
  return (
    <section className="card section-card">
      <div className="section-header">
        <div>
          <p className="eyebrow">SpendWise</p>
          <h2>{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
