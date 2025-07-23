"use client"

import React, { useState, useMemo, useEffect } from 'react'
import { FaTimes, FaPlus, FaTrash, FaEdit, FaSave, FaTimes as FaCancel, FaChartLine } from 'react-icons/fa'
import CSVUploadModal from './CSVUploadModal'
interface ChartData {
  [key: string]: number | string
}

interface ChartEditModalProps {
  isOpen: boolean
  onClose: () => void
  sectionId: string
  chartType: 'deflection' | 'lte_season' | 'lte_crack'
  currentData: ChartData[]
  onSave: (updatedData: ChartData[]) => void
}

const ChartEditModal: React.FC<ChartEditModalProps> = ({
  isOpen,
  onClose,
  sectionId,
  chartType,
  currentData,
  onSave
}) => {
  const transformedInitialData = useMemo(() => {
    console.log('RAW currentData:', currentData);

    if (chartType === 'deflection') {
      const expanded: ChartData[] = [];

      currentData.forEach(row => {
        const baseDMI = row.DMI;
        const yearMap: Record<string, ChartData> = {};

        Object.entries(row).forEach(([key, value]) => {
          // [_\s]* means: allow any number of underscores or spaces (0, 1, or many)
          // [_\s]? means: allow an optional underscore or space (0 or 1)
          const match = key.match(/^(Winter|Summer)[_\s]?(\d{2,4})$/);
          if (match) {
            const [_, season, yearPart] = match;
            const fullYear = yearPart.length === 2 ? '20' + yearPart : yearPart;
            if (!yearMap[fullYear]) {
              yearMap[fullYear] = { DMI: baseDMI, Year: fullYear };
            }
            yearMap[fullYear][season] = value as string | number;
          }
        });

        const yearEntries = Object.values(yearMap);
        if (yearEntries.length > 0) {
          expanded.push(...yearEntries);
        } else {
          expanded.push({ DMI: baseDMI, Year: '', Winter: '', Summer: '' });
        }
      });

      console.log('Transformed Deflection Data:', expanded);
      return expanded;
    }

    // lte_season: Normalize Year and fill empty seasons
    if (chartType === 'lte_season') {
      const normalized = currentData.map(row => ({
        Year: row.Year,
        Winter: row.Winter ?? '',
        Summer: row.Summer ?? '',
        Small: row.S ?? row.Small ?? '',
        Medium: row.M ?? row.Medium ?? '',
        Large: row.L ?? row.Large ?? ''
      }));
      console.log('Transformed LTE Season Data:', normalized);
      return normalized;
    }

    // lte_crack: Normalize Year and fill empty cracks
    if (chartType === 'lte_crack') {
      const normalized = currentData.map(row => ({
        Year: row.Year,
        Winter: row.Winter ?? '',
        Summer: row.Summer ?? '',
        Small: row.S ?? row.Small ?? '',
        Medium: row.M ?? row.Medium ?? '',
        Large: row.L ?? row.Large ?? ''
      }));
      console.log('Transformed LTE Crack Data:', normalized);
      return normalized;
    }

    return [...currentData];
  }, [chartType, currentData]);


  const [data, setData] = useState<ChartData[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false)
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [yearFilter, setYearFilter] = useState<string>('All');
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());


  useEffect(() => {
    if (isOpen) {
      setData(transformedInitialData);
    }
  }, [isOpen, transformedInitialData]);

  const columns = useMemo(() => {
    if (chartType === 'deflection') {
      return ['DMI', 'Year', 'Winter', 'Summer'];
    }
    else {
      switch (chartType) {
        case 'lte_season':
          return ['Year', 'Winter', 'Summer'];
        case 'lte_crack':
          return ['Year', 'Small', 'Medium', 'Large'];
        default:
          return ['Year', 'Value'];
      }
    }
    return Object.keys(data[0]);
  }, [chartType, data]);

  const handleCellEdit = (rowIndex: number, column: string, value: string) => {
    const updatedData = [...data];
    const isNumericColumn = column !== 'Year' && column !== 'DMI';
    updatedData[rowIndex] = {
      ...updatedData[rowIndex],
      [column]: isNumericColumn
        ? (value === '' ? '' : parseFloat(value))
        : value
    };
    setData(updatedData);
  };

  const handleAddRow = () => {
    const defaultRow: ChartData = {};
    columns.forEach((col) => {
      if (col === 'Year') {
        defaultRow[col] = new Date().getFullYear();
      } else {
        defaultRow[col] = '';
      }
    });
    const updatedData = [...data, defaultRow];
    setData(updatedData);
    setEditingIndex(updatedData.length - 1); // auto-enable editing
  };

  const handleDeleteRow = (index: number) => {
    if (!confirm('Delete this row?')) return;

    const updatedData = [...data];
    const row = updatedData[index];

    if (chartType === 'lte_season') {
      // Clear Winter and Summer
      const cleared = {
        ...row,
        Winter: '',
        Summer: '',
        Small: row.Small ?? row.S ?? '',
        Medium: row.Medium ?? row.M ?? '',
        Large: row.Large ?? row.L ?? '',
        S: row.S ?? row.Small ?? '',
        M: row.M ?? row.Medium ?? '',
        L: row.L ?? row.Large ?? ''
      };
      const isEmpty = [
        cleared.Small || cleared.S,
        cleared.Medium || cleared.M,
        cleared.Large || cleared.L
      ].every(v => v === '' || v === undefined);
      if (isEmpty) {
        updatedData.splice(index, 1); // Delete row
      } else {
        updatedData[index] = cleared; // Just clear values
      }

    } else if (chartType === 'lte_crack') {
      // Clear Small, Medium, Large (and S/M/L)
      const cleared = {
        ...row,
        Small: '',
        Medium: '',
        Large: '',
        S: '',
        M: '',
        L: '',
        Winter: row.Winter ?? '',
        Summer: row.Summer ?? ''
      };

      const isEmpty = [cleared.Winter, cleared.Summer].every(v => v === '' || v === undefined);

      if (isEmpty) {
        updatedData.splice(index, 1);
      } else {
        updatedData[index] = cleared;
      }

    } else {
      // Deflection or other types — full delete
      updatedData.splice(index, 1);
    }

    setData(updatedData);
  };


  const handleSave = async () => {
    setLoading(true);

    try {
      let transformedData: ChartData[] = data;

      if (chartType === 'deflection') {
        const groupedMap = new Map<string, ChartData>();

        data.sort((a, b) => {
          const aDMI = typeof a?.DMI === 'number' ? a.DMI as number : parseFloat(a?.DMI as string) || 0;
          const bDMI = typeof b?.DMI === 'number' ? b.DMI as number : parseFloat(b?.DMI as string) || 0;
          return aDMI - bDMI;
        }).forEach(row => {
          const { DMI, Year, Winter, Summer } = row;
          const shortYear = Year?.toString().slice(-2);
          const id = `${DMI}`;

          if (!groupedMap.has(id)) {
            groupedMap.set(id, {});
          }

          const existing = groupedMap.get(id)!;

          existing['DMI'] = +DMI;
          if (Winter !== undefined) existing[`Winter_${shortYear}`] = +Winter;
          if (Summer !== undefined) existing[`Summer_${shortYear}`] = +Summer;
        });

        transformedData = Array.from(groupedMap.values());
      } else {
        const groupedMap = new Map<string, ChartData>();

        data.sort((a, b) => +a.Year - +b.Year).forEach(row => {
          const year = row.Year?.toString();
          if (!year) return;

          if (!groupedMap.has(year)) {
            groupedMap.set(year, { Year: year });
          }

          const existing = groupedMap.get(year)!;
          if (row.Winter !== undefined) existing['Winter'] = row.Winter;
          if (row.Summer !== undefined) existing['Summer'] = row.Summer;
          if (row.Small !== undefined) existing['S'] = row.Small;
          if (row.Medium !== undefined) existing['M'] = row.Medium;
          if (row.Large !== undefined) existing['L'] = row.Large;
        });

        transformedData = Array.from(groupedMap.values());
      }
      console.log('[Save] Final Transformed:', transformedData);
      onSave(transformedData);
      onClose();
    } catch (error) {
      console.error('Save chart data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getChartTitle = () => {
    switch (chartType) {
      case 'deflection':
        return 'Deflection Data';
      case 'lte_season':
        return 'LTE by Season';
      case 'lte_crack':
        return 'LTE by Crack Spacing';
      default:
        return 'Chart Data';
    }
  };

  useEffect(() => {
    setSelectedRows(new Set());
  }, [yearFilter]);

  const visibleData = useMemo(() => {
    let filtered = [...data];

    // Filter by year
    if (yearFilter !== 'All') {
      filtered = filtered.filter(row => row.Year?.toString() === yearFilter);
    }

    // Sort
    if (sortConfig) {
      const { key, direction } = sortConfig;
      filtered.sort((a, b) => {
        const aVal = a[key] ?? '';
        const bVal = b[key] ?? '';
        return direction === 'asc'
          ? (aVal > bVal ? 1 : -1)
          : (aVal < bVal ? 1 : -1);
      });
    }

    return filtered;
  }, [data, sortConfig, yearFilter]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FaChartLine />
            Edit {getChartTitle()} - {sectionId}
          </h2>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <FaTimes size={20} />
          </button>
        </div>

        {/* Content */}

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="mb-4 flex flex-wrap justify-between items-center gap-4">
            <h3 className="text-lg font-semibold text-gray-800">
              {getChartTitle()} Table
            </h3>

            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-600">Filter by Year:</label>
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Years</option>
                {[...new Set(data.map(row => row.Year).filter(Boolean))]
                  .sort()
                  .map(year => (
                    <option key={year} value={year?.toString()}>{year}</option>
                  ))}
              </select>
              <button
                onClick={() => {
                  if (confirm(`Delete ${selectedRows.size} selected row(s)?`)) {
                    const newData = data.filter((_, i) => !selectedRows.has(i));
                    setData(newData);
                    setSelectedRows(new Set());
                  }
                }}
                disabled={selectedRows.size === 0}
                className={`px-4 py-2 text-white rounded-md text-sm flex items-center gap-2 ${selectedRows.size === 0
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700'
                  }`}
              >
                <FaTrash size={14} />
                Delete Selected
              </button>
              <button
                onClick={handleAddRow}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 text-sm"
              >
                <FaPlus size={14} />
                Add Row
              </button>
              <button
                onClick={() => setUploadModalOpen(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2 text-sm"
              >
                <FaPlus size={14} />
                Upload CSV
              </button>
            </div>
          </div>
          {isUploadModalOpen && (
            <CSVUploadModal
              chartType={chartType}
              onClose={() => setUploadModalOpen(false)}
              onUploadSuccess={(parsed) => {
                let transformed: ChartData[] = [];
                const parseFloatSafe = (val: unknown): number | '' => {
                  const num = parseFloat(String(val));
                  return isNaN(num) ? '' : num;
                };
                const mergeLTEDataByYear = (
                  chartType: 'lte_season' | 'lte_crack',
                  parsed: ChartData[],
                  existing: ChartData[]
                ): ChartData[] => {
                  const yearMap = new Map<string, ChartData>();

                  // Add existing data
                  for (const row of existing) {
                    yearMap.set(String(row.Year), { ...row });
                  }

                  for (const row of parsed) {
                    const year = String(row.Year);
                    const existingRow = yearMap.get(year) ?? { Year: year };

                    if (chartType === 'lte_season') {
                      yearMap.set(year, {
                        ...existingRow,
                        Winter: parseFloatSafe(row.Winter ?? ''),
                        Summer: parseFloatSafe(row.Summer ?? '')
                      });
                    } else if (chartType === 'lte_crack') {
                      yearMap.set(year, {
                        ...existingRow,
                        Small: parseFloatSafe(row.S ?? row.Small ?? ''),
                        Medium: parseFloatSafe(row.M ?? row.Medium ?? ''),
                        Large: parseFloatSafe(row.L ?? row.Large ?? '')
                      });
                    }
                  }

                  return Array.from(yearMap.values());
                };

                if (chartType === 'deflection') {
                  const existingKeyMap = new Map<string, ChartData>();
                  data.forEach(row => {
                    const key = `${row.DMI}-${row.Year}`;
                    existingKeyMap.set(key, { ...row });
                  });

                  parsed.forEach(row => {
                    const baseDMI = parseFloatSafe(row.DMI);
                    const yearMap: Record<string, ChartData> = {};

                    Object.entries(row).forEach(([key, value]) => {
                      const match = key.match(/^(Winter|Summer)[_\s]?(\d{2,4})$/);
                      if (match) {
                        const [_, season, yearPart] = match;
                        const fullYear = yearPart.length === 2 ? '20' + yearPart : yearPart;
                        const compositeKey = `${baseDMI}-${fullYear}`;
                        const existingRow = existingKeyMap.get(compositeKey) ?? { DMI: baseDMI, Year: fullYear };

                        existingRow[season] = parseFloatSafe(value);
                        existingKeyMap.set(compositeKey, existingRow);
                      }
                    });
                  });

                  transformed = Array.from(existingKeyMap.values());
                }
                else if (chartType === 'lte_season' || chartType === 'lte_crack') {
                  transformed = mergeLTEDataByYear(chartType, parsed, data);
                } else {
                  transformed = parsed;
                }

                setData(transformed);
              }}

            />
          )}


          {/* Table */}
          <div className="overflow-x-auto border rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedRows.size === visibleData.length && visibleData.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRows(new Set(visibleData.map((_, i) => i)));
                        } else {
                          setSelectedRows(new Set());
                        }
                      }}
                    />
                  </th>

                  <th className="px-0 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                  {columns.map((column) => (
                    <th
                      key={column}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {visibleData.map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(rowIndex)}
                        onChange={(e) => {
                          const newSet = new Set(selectedRows);
                          if (e.target.checked) {
                            newSet.add(rowIndex);
                          } else {
                            newSet.delete(rowIndex);
                          }
                          setSelectedRows(newSet);
                        }}
                      />
                    </td>
                    <td className="px-0 py-3 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingIndex(editingIndex === rowIndex ? null : rowIndex)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {editingIndex === rowIndex ? <FaCancel size={14} /> : <FaEdit size={14} />}
                        </button>
                        {/* <button
                          onClick={() => handleDeleteRow(rowIndex)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FaTrash size={14} />
                        </button> */}
                      </div>
                    </td>
                    {columns.map((column) => (
                      <td key={column} className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {editingIndex === rowIndex ? (
                          <input
                            type={column === columns[0] ? "text" : "number"}
                            value={row[column] ?? ''}
                            onChange={(e) => handleCellEdit(rowIndex, column, e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            step={column === columns[0] ? undefined : "0.01"}
                          />
                        ) : (
                          <span>{row[column]}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}

              </tbody>
            </table>
          </div>

          {data.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No data available. Click &quot;Add Row&quot; to start adding data.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChartEditModal