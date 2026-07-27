import Location from '../components/Location';
import Contact from '../components/Contact';

export default function ContactPage() {
  return (
    <div style={{ paddingTop: 'var(--navbar-h)' }}>
      <Contact />
      <Location />
    </div>
  );
}
