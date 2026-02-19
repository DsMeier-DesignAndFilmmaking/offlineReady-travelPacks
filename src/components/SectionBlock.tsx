import type { PackSection } from '../types/travelPack';

interface SectionBlockProps {
  section: PackSection;
}

export const SectionBlock = ({ section }: SectionBlockProps): JSX.Element => (
  <section className="section-block" aria-labelledby={`section-${section.id}`}>
    <h2 className="section-block__title" id={`section-${section.id}`}>
      {section.title}
    </h2>
    <p className="section-block__summary">{section.summary}</p>
    <ul className="section-block__list">
      {section.actions.map((action) => (
        <li key={action}>{action}</li>
      ))}
    </ul>
  </section>
);
