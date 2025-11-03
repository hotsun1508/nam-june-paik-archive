import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { ResultsTable } from './components/ResultsTable';
import { Footer } from './components/Footer';
import { analyzeImageForText } from './services/geminiService';
import type { AnalysisResult } from './types';

const App: React.FC = () => {
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result.split(',')[1]);
        }
      };
      reader.readAsDataURL(file);
    });
    return {
      inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
  };

  const handleAnalyze = useCallback(async (files: File[]) => {
    if (files.length === 0) {
      setError("Please select at least one image file.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults([]);

    const analysisPromises = files.map(async (file) => {
      try {
        const imagePart = await fileToGenerativePart(file);
        const { title, text } = await analyzeImageForText(imagePart);
        return {
          folderName: 'Uploaded Articles',
          fileName: file.name,
          title,
          text,
        };
      } catch (e) {
        console.error(`Error analyzing ${file.name}:`, e);
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        return {
          folderName: 'Uploaded Articles',
          fileName: file.name,
          title: 'Error',
          text: `Error: ${errorMessage}`,
        };
      }
    });

    try {
      const newResults = await Promise.all(analysisPromises);
      setResults(newResults);
    } catch (e) {
      console.error("Failed to process files:", e);
      setError("An unexpected error occurred during analysis. Please check the console.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col font-sans">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12 flex flex-col items-center">
        <div className="w-full max-w-4xl">
          <FileUpload onAnalyze={handleAnalyze} isLoading={isLoading} />
          {error && <div className="mt-4 text-center text-red-400 bg-red-900/50 p-3 rounded-lg">{error}</div>}
          <ResultsTable results={results} isLoading={isLoading} />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;