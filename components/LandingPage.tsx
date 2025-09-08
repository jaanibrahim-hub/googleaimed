import React, { useState } from 'react';

interface LandingPageProps {
  onApiKeySubmit: (apiKey: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onApiKeySubmit }) => {
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim().length < 10) { // Basic validation
      setError('Please enter a valid Google Gemini API key.');
      return;
    }
    setError('');
    onApiKeySubmit(apiKey);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 bg-gradient-to-br from-[#F8FBFF] to-[#E8F4F8]">
      <div className="w-full max-w-4xl text-center">
        <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-r from-[#2E7D95] to-[#4A90A4] shadow-lg">
          <i className="fas fa-stethoscope text-4xl text-white"></i>
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-[#1A2B42]">
          Welcome to MediTeach AI
        </h1>
        <p className="mt-4 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
          Transforming complex medical information into compassionate, easy-to-understand visual explanations.
        </p>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <i className="fas fa-file-medical text-3xl text-[#7FB069] mb-4"></i>
            <h3 className="text-lg font-bold text-[#1A2B42]">Analyze Documents</h3>
            <p className="text-sm text-gray-500 mt-2">Upload medical reports, lab results, or scans for a personalized breakdown.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <i className="fas fa-eye text-3xl text-[#7FB069] mb-4"></i>
            <h3 className="text-lg font-bold text-[#1A2B42]">Visualize Concepts</h3>
            <p className="text-sm text-gray-500 mt-2">Receive custom illustrations that clarify complex procedures and conditions.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <i className="fas fa-comments text-3xl text-[#7FB069] mb-4"></i>
            <h3 className="text-lg font-bold text-[#1A2B42]">Ask Anything</h3>
            <p className="text-sm text-gray-500 mt-2">Engage in a natural conversation to deepen your understanding of your health.</p>
          </div>
        </div>

        <div className="mt-12 max-w-xl mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-lg border-2 border-[#E1F0F5]">
          <h2 className="text-xl font-bold text-[#1A2B42]">Get Started</h2>
          <p className="text-gray-500 mt-2 mb-6">Enter your Google Gemini API key to begin. Your key is stored in your browser and is never sent to our servers.</p>
          
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-grow w-full">
              <i className="fas fa-key absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Enter your Gemini API Key..."
                className="w-full pl-12 pr-4 py-3 bg-[#F8FBFF] border-2 border-[#E1F0F5] rounded-full focus:border-[#2E7D95] focus:ring-2 focus:ring-[#2E7D95]/50 transition-all duration-300 outline-none"
                aria-label="Gemini API Key"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-[#2E7D95] to-[#4A90A4] text-white font-bold rounded-full hover:scale-105 transition-transform duration-300 shadow-md"
            >
              Start Session
            </button>
          </form>
          {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
           <p className="text-xs text-gray-400 mt-4">
            Don't have a key? Get one from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#2E7D95]">Google AI Studio</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
