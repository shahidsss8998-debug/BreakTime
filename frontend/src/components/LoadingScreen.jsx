/**
 * LoadingScreen
 * Fullscreen loading screen displayed during Firebase Auth session initialization
 * to prevent page flashing and unauthenticated redirects.
 */
export default function LoadingScreen({ message = "Checking session..." }) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100dvh',
        backgroundColor: '#1C1C1C',
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '20px',
      }}
    >
      <style>{`
        @keyframes btSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      
      {/* Logo & Branding */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
        <img
          src="/logo.png"
          alt="Break Time Logo"
          style={{ height: '64px', width: 'auto', marginBottom: '12px' }}
        />
        <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, letterSpacing: '0.5px' }}>
          BREAK <span style={{ color: 'var(--primary, #FC8019)' }}>TIME</span>
        </h1>
      </div>

      {/* Spinner */}
      <div
        style={{
          width: '40px',
          height: '40px',
          border: '3px solid rgba(255, 255, 255, 0.1)',
          borderTop: '3px solid var(--primary, #FC8019)',
          borderRadius: '50%',
          animation: 'btSpin 0.8s linear infinite',
          marginBottom: '16px',
        }}
      />

      {/* Loading Message */}
      <p style={{ margin: 0, fontSize: '0.95rem', color: 'rgba(255, 255, 255, 0.7)', fontWeight: 500 }}>
        {message}
      </p>
    </div>
  );
}
