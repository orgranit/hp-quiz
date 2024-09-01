import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="flex items-center justify-center space-x-2">
      <div className="w-4 h-4 border-2 border-t-2 border-gray-200 rounded-full animate-spin"></div>
      <div className="text-gray-500">Generating quiz...</div>
    </div>
  );
};

export default Loader;