import { useEffect, useState } from 'react';

export default function Loader() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHidden(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (hidden) return null;

  return (
    <div id="loader" className={hidden ? 'hidden' : ''}>
      <img src="/logo.png" alt="Break Time" style={{ width: '80px', height: 'auto', marginTop: '16px' }} />
      <div className="tagline">Good Food • Great Taste • Good Time</div>
      <div className="bar">
        <div className="bar-fill"></div>
      </div>
    </div>
  );
}
