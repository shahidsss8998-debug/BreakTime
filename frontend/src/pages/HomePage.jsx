import Hero from '../components/Hero';
import Menu from '../components/Menu';
import Gallery from '../components/Gallery';
import About from '../components/About';
import Instagram from '../components/Instagram';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Menu isHome={true} limit={3} />
      <Gallery />
      <About />
      <Instagram />
    </>
  );
}
