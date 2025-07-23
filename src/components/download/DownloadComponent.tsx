import React, { useState, useEffect } from 'react';
import { FaDownload, FaSpinner, FaDatabase, FaSearch } from 'react-icons/fa';
import { route } from '@/config';

interface DataSource {
  id: string;
  name: string;
  path: string;
  description: string;
}

const DownloadComponent: React.FC = () => {
  const [datasets, setDatasets] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [downloadStatus, setDownloadStatus] = useState<{[key: string]: 'idle' | 'downloading' | 'success' | 'error'}>({});

  useEffect(() => {
    // Fetch available datasets
    fetchDatasets();
  }, []);

  const fetchDatasets = async () => {
    try {
      // This is a placeholder - in a real application, you would fetch from an API
      // For now, we'll use a mock list of datasets
      const mockDatasets: DataSource[] = [
        {
          id: 'level_one',
          name: 'Level One Sections',
          path: '/api/data/level_one_sections.json',
          description: 'Complete data for all Level One road sections'
        },
        {
          id: 'survey_data',
          name: 'Survey Data',
          path: '/api/data/survey_data.json',
          description: 'Comprehensive survey data including deflection measurements'
        },
        {
          id: 'images_metadata',
          name: 'Images Metadata',
          path: '/api/data/images_metadata.json',
          description: 'Metadata for all section images including dates and locations'
        },
        {
          id: 'plan_sets',
          name: 'Plan Sets',
          path: '/api/data/plan_sets.json',
          description: 'Information about available plan sets and CSJs'
        }
      ];
      
      setDatasets(mockDatasets);
      // Initialize download status for all datasets
      const initialStatus: {[key: string]: 'idle' | 'downloading' | 'success' | 'error'} = {};
      mockDatasets.forEach(ds => {
        initialStatus[ds.id] = 'idle';
      });
      setDownloadStatus(initialStatus);
    } catch (error) {
      console.error('Error fetching datasets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (dataset: DataSource, format: 'json' | 'csv') => {
    setDownloadStatus(prev => ({ ...prev, [dataset.id]: 'downloading' }));
    try {
      // In a real app, you would fetch from the actual API endpoint
      // For this demo, we'll simulate the fetch with a delay
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate data received
      let data: any[] = [];
      
      // For demonstration purposes, generate some mock data
      if (dataset.id === 'level_one') {
        data = Array.from({ length: 20 }, (_, i) => ({
          index: i + 1,
          sectionId: `${i + 1}-I35-${Math.floor(Math.random() * 5) + 1}`,
          highway: `I-${35 + Math.floor(Math.random() * 10)}`,
          x: -97 - Math.random(),
          y: 30 + Math.random(),
          District: "Austin",
          County: "Travis",
          "GPS (start)": `30.${Math.floor(Math.random() * 1000)}, -97.${Math.floor(Math.random() * 1000)}`,
          "GPS (end)": `30.${Math.floor(Math.random() * 1000)}, -97.${Math.floor(Math.random() * 1000)}`,
          "Pavement Type": ["CRCP", "JCP", "JRCP"][Math.floor(Math.random() * 3)],
          "Thickness (in.)": Math.floor(Math.random() * 6) + 8,
          "Subbase Type": ["CTB", "LTS", "HMA"][Math.floor(Math.random() * 3)],
          "Subgrade Type": ["Clay", "Sand", "Silt"][Math.floor(Math.random() * 3)],
          "CCSJ": `0015-${Math.floor(Math.random() * 100)}-${Math.floor(Math.random() * 100)}`,
          "Length": `${Math.floor(Math.random() * 10) + 1} miles`,
          "Construction Year": 2000 + Math.floor(Math.random() * 20)
        }));
      } else {
        // Generic data for other datasets
        data = Array.from({ length: 10 }, (_, i) => ({
          id: i + 1,
          name: `${dataset.name} Item ${i + 1}`,
          date: new Date(Date.now() - Math.random() * 10000000000).toISOString().split('T')[0],
          value: Math.floor(Math.random() * 1000)
        }));
      }
      
      // Convert to CSV if needed
      if (format === 'csv') {
        const csvContent = jsonToCsv(data);
        downloadFile(csvContent, `${dataset.id}_data.csv`, 'text/csv');
      } else {
        // Download as JSON
        downloadFile(JSON.stringify(data, null, 2), `${dataset.id}_data.json`, 'application/json');
      }
      
      setDownloadStatus(prev => ({ ...prev, [dataset.id]: 'success' }));
      
      // Reset status after a delay
      setTimeout(() => {
        setDownloadStatus(prev => ({ ...prev, [dataset.id]: 'idle' }));
      }, 3000);
    } catch (error) {
      console.error(`Error downloading ${dataset.name}:`, error);
      setDownloadStatus(prev => ({ ...prev, [dataset.id]: 'error' }));
      
      // Reset error status after a delay
      setTimeout(() => {
        setDownloadStatus(prev => ({ ...prev, [dataset.id]: 'idle' }));
      }, 3000);
    }
  };
  
  // Convert JSON to CSV
  const jsonToCsv = (json: any[]) => {
    if (!json.length) return '';
    
    const headers = Object.keys(json[0]);
    const csvRows = [headers.join(',')];
    
    for (const row of json) {
      const values = headers.map(header => {
        const val = row[header];
        return `"${val !== undefined && val !== null ? String(val).replace(/"/g, '""') : ''}"`;
      });
      csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
  };
  
  // Download a file
  const downloadFile = (content: string, filename: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Filter datasets based on search
  const filteredDatasets = datasets.filter(ds => 
    ds.name.toLowerCase().includes(search.toLowerCase()) || 
    ds.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search box */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <FaSearch className="w-4 h-4 text-gray-500" />
        </div>
        <input
          type="text"
          className="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Search datasets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      
      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <FaSpinner className="animate-spin w-8 h-8 text-blue-600" />
          <span className="ml-3 text-lg text-gray-700">Loading available datasets...</span>
        </div>
      )}
      
      {/* Dataset list */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredDatasets.length === 0 ? (
            <div className="col-span-full text-center py-10 text-gray-500">
              No datasets match your search criteria.
            </div>
          ) : (
            filteredDatasets.map(dataset => (
              <div key={dataset.id} className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                  <div className="flex items-start">
                    <FaDatabase className="text-blue-500 mr-3 mt-1" />
                    <h3 className="font-semibold text-lg text-gray-800">{dataset.name}</h3>
                  </div>
                </div>
                
                <div className="p-4">
                  <p className="text-gray-600 mb-4">{dataset.description}</p>
                  
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => handleDownload(dataset, 'json')}
                      disabled={downloadStatus[dataset.id] === 'downloading'}
                      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {downloadStatus[dataset.id] === 'downloading' ? (
                        <><FaSpinner className="animate-spin" /> Downloading...</>
                      ) : downloadStatus[dataset.id] === 'success' ? (
                        <><FaDownload /> Downloaded JSON</>
                      ) : (
                        <><FaDownload /> Download JSON</>
                      )}
                    </button>
                    
                    <button
                      onClick={() => handleDownload(dataset, 'csv')}
                      disabled={downloadStatus[dataset.id] === 'downloading'}
                      className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {downloadStatus[dataset.id] === 'downloading' ? (
                        <><FaSpinner className="animate-spin" /> Downloading...</>
                      ) : downloadStatus[dataset.id] === 'success' ? (
                        <><FaDownload /> Downloaded CSV</>
                      ) : (
                        <><FaDownload /> Download CSV</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default DownloadComponent;
