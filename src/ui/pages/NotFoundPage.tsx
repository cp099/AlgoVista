import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6">
      <div className="bg-algo-surface p-6 rounded-full mb-6 animate-bounce">
        <FileQuestion size={64} className="text-algo-accent" />
      </div>
      
      <h1 className="text-4xl font-bold text-white mb-2">Algorithm Not Found</h1>
      <p className="text-gray-400 max-w-md mb-8">
        The algorithm you are looking for doesn't exist in our registry, or it has been moved.
      </p>
      
      <Link 
        to="/"
        className="flex items-center gap-2 px-6 py-3 bg-algo-primary hover:bg-blue-600 text-white font-semibold rounded-lg transition"
      >
        <Home size={20} />
        Return Home
      </Link>
    </div>
  );
};