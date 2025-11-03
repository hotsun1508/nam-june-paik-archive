import React, { useState } from 'react';
import type { AnalysisResult } from '../types';
import { Spinner } from './Spinner';

interface ResultsTableProps {
  results: AnalysisResult[];
  isLoading: boolean;
}

const CopyButton: React.FC<{ textToCopy: string }> = ({ textToCopy }) => {
    const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

    const handleCopy = () => {
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopyStatus('copied');
            setTimeout(() => setCopyStatus('idle'), 2000);
        }, (err) => {
            console.error('Failed to copy: ', err);
            alert('Failed to copy text.');
        });
    };
    
    const isCopyable = !(textToCopy.startsWith('Error:') || textToCopy === 'No relevant article found.');

    if (!isCopyable) {
        return null;
    }

    return (
        <button 
            onClick={handleCopy}
            className={`text-xs font-semibold py-1 px-2.5 rounded transition-all duration-200 ${copyStatus === 'copied' ? 'bg-green-600 text-white' : 'bg-gray-600 hover:bg-gray-500 text-gray-200'}`}
        >
            {copyStatus === 'idle' ? 'Copy' : 'Copied!'}
        </button>
    );
};

// Helper function to convert array of objects to CSV
const convertToCSV = (data: AnalysisResult[]): string => {
  const header = ['Folder Name', 'File Name', 'Text'];
  // Escape quotes within the text by doubling them up and wrap everything in quotes
  const escapeCSV = (str: string) => `"${str.replace(/"/g, '""')}"`;

  const rows = data.map(row => 
    [
      escapeCSV(row.folderName),
      escapeCSV(row.fileName),
      escapeCSV(row.text)
    ].join(',')
  );

  return [header.join(','), ...rows].join('\n');
};


export const ResultsTable: React.FC<ResultsTableProps> = ({ results, isLoading }) => {
  if (isLoading && results.length === 0) {
    return (
      <div className="mt-8 text-center p-8 bg-gray-800/50 rounded-xl border border-gray-700">
        <Spinner />
        <p className="text-gray-400 mt-4">AI is analyzing the images... this may take a moment.</p>
      </div>
    );
  }

  if (!isLoading && results.length === 0) {
    return (
        <div className="mt-8 text-center p-8 bg-gray-800/50 rounded-xl border border-gray-700">
            <p className="text-gray-500">Analysis results will be displayed here.</p>
        </div>
    );
  }
  
  const handleExport = () => {
    const csvData = convertToCSV(results);
    const blob = new Blob([`\uFEFF${csvData}`], { type: 'text/csv;charset=utf-8;' }); // \uFEFF for BOM
    const link = document.createElement('a');
    
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'nam_june_paik_articles.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-8">
       <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-200">Analysis Results</h2>
        {results.length > 0 && (
           <button
            onClick={handleExport}
            className="bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-700 transition-colors duration-300 flex items-center justify-center text-sm gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export as CSV
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-lg">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Folder Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  File Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Extracted Text
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {results.map((result, index) => (
                <tr key={index} className="hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-400 align-top">{result.folderName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 align-top">{result.fileName}</td>
                  <td className="px-6 py-4 text-sm text-gray-300 align-top">
                     <div className="flex justify-between items-start gap-4">
                        <pre className="whitespace-pre-wrap font-sans break-words flex-grow">{result.text}</pre>
                        <div className="flex-shrink-0 pt-1">
                            <CopyButton textToCopy={result.text} />
                        </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};