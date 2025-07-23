// src/app/specifications/SpecList.tsx
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useGlobalLoading } from '@/context/GlobalLoadingContext';

interface Spec {
  No: number | string;
  Name: string;
  Link: string;
}

interface SpecListProps {
  data: Spec[];
}

export default function SpecList({ data }: SpecListProps) {
  const { setLoading } = useGlobalLoading();
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // EXACT SAME loading pattern as other pages
  useEffect(() => {
    // Show loading indicator when component mounts
    setLoading(true);

    // Simulate resource loading completion
    const timer = setTimeout(() => {
      setIsLoaded(true);
      setLoading(false);
    }, 1000);

    // Clean up on unmount
    return () => {
      clearTimeout(timer);
      setLoading(false);
    };
  }, [setLoading]);

  // Filter specifications by Name, case-insensitive
  const filteredData = useMemo(() => {
    return data.filter(spec =>
      spec.Name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data, searchQuery]);

  // If not loaded, return empty div (global loader will show)
  if (!isLoaded) {
    return <div></div>;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '1rem' }}>
        Specifications
      </h1>

      {/* Search Bar with Reset Button */}
      <div style={{ textAlign: 'center', marginBottom: '2rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
        <input
          type="text"
          placeholder="Search specifications..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            padding: '0.5rem 1rem',
            width: '100%',
            maxWidth: '400px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            fontSize: '1rem',
          }}
        />
        <button
          onClick={() => setSearchQuery('')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            border: '1px solid #ccc',
            backgroundColor: '#f2f2f2',
            fontSize: '1rem',
            cursor: 'pointer'
          }}
        >
          Reset
        </button>
      </div>

      {/* List of Filtered Specifications */}
      <div style={{
        maxHeight: "80vh",
        overflowY: "auto",
        paddingRight: "0.5rem"
      }}>
        {filteredData.length === 0 ? (
          <p style={{ color: 'red', textAlign: 'center' }}>No matching specifications found.</p>
        ) : (
          filteredData.map((row, index) => (
            <div
              key={index}
              style={{
                border: '1px solid #ccc',
                borderRadius: '4px',
                padding: '1rem',
                marginBottom: '1rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
                  {row.Name}
                </h2>
                <span style={{ fontStyle: 'italic', color: '#555' }}></span>
              </div>
              <a
                href={row.Link}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#0070f3',
                  textDecoration: 'none',
                  overflowWrap: 'anywhere',
                }}
              >
                {row.Link}
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
