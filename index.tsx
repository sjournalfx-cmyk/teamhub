
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { polyfill } from "mobile-drag-drop";
import { scrollBehaviourDragImageTranslateOverride } from "mobile-drag-drop/scroll-behavior";

// Initialize drag and drop polyfill for mobile support
polyfill({
    dragImageTranslateOverride: scrollBehaviourDragImageTranslateOverride,
    holdToDrag: 200 // User needs to hold for 200ms to start drag on mobile
});

// Workaround for some iOS issues with touch move
window.addEventListener('touchmove', function() {}, {passive: false});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
