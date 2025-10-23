
import React from 'react';
import { AlertTriangleIcon } from './icons/AlertTriangleIcon';

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg relative my-4 flex items-center space-x-3 animate-fade-in">
      <AlertTriangleIcon className="w-6 h-6" />
      <div>
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline ml-2">{message}</span>
      </div>
    </div>
  );
};

export default ErrorMessage;