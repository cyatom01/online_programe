import React from 'react';

interface CodeViewerProps {
  code: string;
  onChange: (newCode: string) => void;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ code, onChange }) => {
  return (
    <div className="h-full w-full relative bg-[#0d1117] flex flex-col">
       <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-gray-800 text-xs text-gray-400 select-none">
          <span>index.html</span>
          <span>HTML</span>
       </div>
      <textarea
        value={code}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 w-full h-full bg-[#0d1117] text-gray-300 font-mono text-sm p-4 resize-none focus:outline-none focus:ring-0 leading-6 border-none"
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
      />
    </div>
  );
};