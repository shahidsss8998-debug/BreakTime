import { useState, useEffect } from 'react';
import { usePWA } from '../context/PWAContext';
import './InstallPromptModal.css';

export default function InstallPromptModal() {
  const { isInstallable, isInstalled, installApp } = usePWA();
  const [showModal, setShowModal] = useState(false);
  const [neverAskAgain, setNeverAskAgain] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    // Do not show if app is already running in installed standalone mode
    if (isInstalled) return;

    // Check if the user previously dismissed it permanently
    const dismissed = localStorage.getItem('pwa_prompt_dismissed') === 'true';
    if (dismissed) return;

    // Show the modal after a short delay on login
    const timer = setTimeout(() => {
      setShowModal(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, [isInstalled]);

  const handleClose = () => {
    if (neverAskAgain) {
      localStorage.setItem('pwa_prompt_dismissed', 'true');
    }
    setShowModal(false);
  };

  const handleInstall = async () => {
    if (neverAskAgain) {
      localStorage.setItem('pwa_prompt_dismissed', 'true');
    }

    if (isInstallable) {
      await installApp();
      setShowModal(false);
    } else {
      // Show step-by-step instructions for 3 dots / browser menu
      setShowInstructions(true);
    }
  };

  if (!showModal) return null;

  return (
    <div className="pwa-modal-overlay">
      <div className="pwa-modal-content">
        <div className="pwa-modal-header">
          <img src="/logo.png" alt="Break Time Cafe" className="pwa-logo" />
          <h3>Install Break Time Cafe</h3>
        </div>
        <div className="pwa-modal-body">
          {!showInstructions ? (
            <>
              <p>Install our web app on your mobile phone or desktop for a faster, full-screen experience and easy 1-click access!</p>
              
              <label className="pwa-never-ask">
                <input 
                  type="checkbox" 
                  checked={neverAskAgain} 
                  onChange={(e) => setNeverAskAgain(e.target.checked)} 
                />
                Never ask this Question Again
              </label>
            </>
          ) : (
            <div style={{ textAlign: 'left', fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--text-primary)' }}>
              <p style={{ fontWeight: '600', marginBottom: '8px' }}>How to install manually:</p>
              <ol style={{ paddingLeft: '20px', margin: '0 0 16px 0' }}>
                <li style={{ marginBottom: '6px' }}>Click the <strong>3 dots (⋮)</strong> or <strong>Share icon (⎋)</strong> at the top right of your browser.</li>
                <li style={{ marginBottom: '6px' }}>Select <strong>"Add to Home Screen"</strong> or <strong>"Install Break Time..."</strong>.</li>
                <li>Follow the on-screen prompt to finish installing.</li>
              </ol>
            </div>
          )}
        </div>
        <div className="pwa-modal-actions">
          {!showInstructions ? (
            <>
              <button className="btn-outline" onClick={handleClose}>Maybe Later</button>
              <button className="btn-primary" onClick={handleInstall}>Install Now</button>
            </>
          ) : (
            <button className="btn-primary" onClick={handleClose}>Got It!</button>
          )}
        </div>
      </div>
    </div>
  );
}
