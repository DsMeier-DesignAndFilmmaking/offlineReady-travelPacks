import type { PackSection } from '../types/travelPack';

interface SectionBlockProps {
  section: PackSection;
}

export const SectionBlock = ({ section }: SectionBlockProps): JSX.Element => (
  <section className="section-block" aria-labelledby={`section-${section.id}`}>
    <h2 id={`section-${section.id}`}>{section.title}</h2>
    <p>{section.summary}</p>
    <ul>
      {section.actions.map((action) => (
        <li key={action}>{action}</li>
      ))}
    </ul>
  </section>
);
