import React, { useEffect, useRef } from 'react';

interface WebPreviewProps {
  code: string;
}

export const WebPreview: React.FC<WebPreviewProps> = ({ code }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Only update if iframe exists
    if (iframeRef.current) {
        // We use srcDoc for immediate rendering of the string content
        iframeRef.current.srcdoc = code;
    }
  }, [code]);

  return (
    <div className="w-full h-full bg-white rounded-md overflow-hidden relative">
      <iframe
        ref={iframeRef}
        title="Live Preview"
        className="w-full h-full border-none"
        sandbox="allow-scripts allow-modals allow-same-origin allow-forms"
      />
      
      {/* Overlay to intercept clicks when resizing panels (optional optimization) 
          or just a label */}
    </div>
  );
};