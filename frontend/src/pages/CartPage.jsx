import React, { useEffect } from 'react';
import Cart from '../components/Cart';

export default function CartPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main>
      <Cart />
    </main>
  );
}
