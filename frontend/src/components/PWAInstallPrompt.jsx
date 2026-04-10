/**
 * PWAInstallPrompt
 *
 * Handles two separate PWA surfaces:
 *  1. Install banner  — appears when the browser fires `beforeinstallprompt`
 *                       (Chrome/Edge/Android; hidden on Safari which has its own flow)
 *  2. Update toast    — appears when a new service-worker version is waiting
 *                       (triggered via the `pwa-update` custom event fired by main.jsx)
 *  3. iOS hint        — one-time nudge for Safari users explaining how to add to Home Screen
 */

import { useState, useEffect } from "react";
import "./PWAInstallPrompt.css";

export default function PWAInstallPrompt() {
  const [installPrompt, setInstallPrompt]   = useState(null);   // deferred install event
  const [showInstall, setShowInstall]       = useState(false);
  const [showUpdate, setShowUpdate]         = useState(false);
  const [showIOSHint, setShowIOSHint]       = useState(false);
  const [dismissed, setDismissed]           = useState(false);

  // ── Detect iOS Safari ──────────────────────────────────────────────────────
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isInStandaloneMode = window.matchMedia("(display-mode: standalone)").matches
    || window.navigator.standalone === true;

  useEffect(() => {
    // Already installed — nothing to show
    if (isInStandaloneMode) return;

    // ── Chrome/Edge/Android: catch the deferred install prompt ───────────────
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      setShowInstall(true);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // ── SW update available (fired from main.jsx) ────────────────────────────
    const handleUpdate = () => setShowUpdate(true);
    window.addEventListener("pwa-update", handleUpdate);

    // ── iOS Safari: show hint once per session if not dismissed permanently ──
    if (isIOS && !localStorage.getItem("pwa-ios-hint-dismissed")) {
      // Delay so it doesn't compete with page load
      const t = setTimeout(() => setShowIOSHint(true), 4000);
      return () => clearTimeout(t);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("pwa-update", handleUpdate);
    };
  }, [isInStandaloneMode, isIOS]);

  // ── Trigger the native install dialog ─────────────────────────────────────
  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      setShowInstall(false);
    }
    setInstallPrompt(null);
  };

  const dismissInstall = () => {
    setShowInstall(false);
    setDismissed(true);
  };

  const handleUpdate = () => {
    setShowUpdate(false);
    window.location.reload();
  };

  const dismissIOSHint = () => {
    setShowIOSHint(false);
    localStorage.setItem("pwa-ios-hint-dismissed", "1");
  };

  if (dismissed && !showUpdate && !showIOSHint) return null;

  return (
    <>
      {/* ── Install banner (Chrome / Android) ────────────────────────────── */}
      {showInstall && (
        <div className="pwa-banner pwa-install" role="banner">
          <div className="pwa-banner-icon">
            <img src="/pwa-192x192.png" alt="SteadyFast" />
          </div>
          <div className="pwa-banner-text">
            <strong>Install SteadyFast</strong>
            <span>Add to your home screen for instant access — works offline too.</span>
          </div>
          <div className="pwa-banner-actions">
            <button className="pwa-btn-primary" onClick={handleInstall}>Install</button>
            <button className="pwa-btn-ghost"   onClick={dismissInstall}>Not now</button>
          </div>
        </div>
      )}

      {/* ── Update toast ──────────────────────────────────────────────────── */}
      {showUpdate && (
        <div className="pwa-banner pwa-update" role="status">
          <div className="pwa-banner-icon pwa-update-icon">🔄</div>
          <div className="pwa-banner-text">
            <strong>Update available</strong>
            <span>A new version of SteadyFast is ready.</span>
          </div>
          <div className="pwa-banner-actions">
            <button className="pwa-btn-primary" onClick={handleUpdate}>Reload</button>
            <button className="pwa-btn-ghost"   onClick={() => setShowUpdate(false)}>Later</button>
          </div>
        </div>
      )}

      {/* ── iOS Safari hint ───────────────────────────────────────────────── */}
      {showIOSHint && (
        <div className="pwa-banner pwa-ios" role="complementary">
          <div className="pwa-banner-icon pwa-ios-icon">📲</div>
          <div className="pwa-banner-text">
            <strong>Add to Home Screen</strong>
            <span>
              Tap <strong>Share</strong> <span className="pwa-share-icon">⎦↑</span> then
              &ldquo;Add to Home Screen&rdquo; to install SteadyFast.
            </span>
          </div>
          <button className="pwa-close-btn" onClick={dismissIOSHint} aria-label="Dismiss">✕</button>
        </div>
      )}
    </>
  );
}
