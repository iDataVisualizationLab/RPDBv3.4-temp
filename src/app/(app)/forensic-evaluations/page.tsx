"use client"

import { useState, useEffect, useMemo } from "react"
import { route } from "@/config"
import { useGlobalLoading } from '@/context/GlobalLoadingContext';

// Sample evaluation data. You can replace these paths with your actual file paths.
const evaluations = [
  {
    title: "BW8_IH45 Pavement Evaluation",
    summary:
      "This memo evaluates pavement conditions at the BW8 and IH45 interchange. Observed issues include lane separation, faulting, and cracking. Testing and analysis inform recommendations for both immediate repairs and long-term rehabilitation.",
    pdfs: [
      {
        title: "BW8_IH45 Pavement Evaluation",
        thumbnail: `${route}/forensic_evaluations/BW8_IH45 Pavement Evaluation/BW8_IH45 Pavement Evaluation.png`,
        pdfUrl: `${route}/forensic_evaluations/BW8_IH45 Pavement Evaluation/BW8_IH45 Pavement Evaluation.pdf`,
      },
    ],
  },
  {
    title: "FM 2094 Pavement Evaluation",
    summary:
      "This memo presents pavement distress findings on FM 2094 in Houston. Field and lab tests identified expansive subgrade soils as the root cause of cracking and faulting. The report recommends addressing soil-related movement to improve long-term performance.",
    pdfs: [
      {
        title: "FM 2094 Pavement Evaluation",
        thumbnail: `${route}/forensic_evaluations/FM 2094 Pavement Evaluation/FM 2094 Pavement Evaluation.png`,
        pdfUrl: `${route}/forensic_evaluations/FM 2094 Pavement Evaluation/FM 2094 Pavement Evaluation.pdf`,
      },
    ],
  },
  {
    title: "RCC Pavement Evaluation",
    summary:
      "This memo summarizes the evaluation of RCC pavement on US 83 and RM 337 in Leakey, TX. Key findings include widespread faulting, poor load transfer at joints, and density-related weaknesses in the slabs. Recommendations advise against using RCC in main highway lanes without improved design and construction methods.",
    pdfs: [
      {
        title: "RCC Pavement Evaluation",
        thumbnail: `${route}/forensic_evaluations/RCC Pavement Evaluation/RCC Pavement Evaluation.png`,
        pdfUrl: `${route}/forensic_evaluations/RCC Pavement Evaluation/RCC Pavement Evaluation.pdf`,
      },
    ],
  },
  {
    title: "SS5 Pavement Evaluation",
    summary:
      "This memo presents findings from the evaluation of the SS5 frontage road in Houston. Surface undulations and longitudinal cracking were linked to volume changes in expansive subgrade soils. Testing confirmed high shrink-swell potential and moisture-driven soil movement as the primary cause of distress.",
    pdfs: [
      {
        title: "SS5 Pavement Evaluation",
        thumbnail: `${route}/forensic_evaluations/SS5 Pavement Evaluation/SS5 Pavement Evaluation.png`,
        pdfUrl: `${route}/forensic_evaluations/SS5 Pavement Evaluation/SS5 Pavement Evaluation.pdf`,
      },
    ],
  },
]

const ForensicEvaluationsPage = () => {
  const { setLoading } = useGlobalLoading();
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setLoading(true);

    const timer = setTimeout(() => {
      setIsLoaded(true);
      setLoading(false);
    }, 1000);

    return () => {
      clearTimeout(timer);
      setLoading(false);
    };
  }, [setLoading]);

  const filteredEvaluations = useMemo(() => {
    return evaluations.filter((e) => e.title.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [searchQuery])

  const handleOpenReport = (pdfUrl: string) => {
    window.open(pdfUrl, "_blank")
  }

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center h-[700px]">
        {/* Empty container while loading */}
      </div>
    )
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold", textAlign: "center", marginBottom: "1rem" }}>
        Forensic Evaluations
      </h1>

      {/* Search Bar */}
      <div
        style={{ textAlign: "center", marginBottom: "2rem", display: "flex", justifyContent: "center", gap: "0.5rem" }}
      >
        <input
          type="text"
          placeholder="Search evaluations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            padding: "0.5rem 1rem",
            width: "100%",
            maxWidth: "400px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            fontSize: "1rem",
          }}
        />
        <button
          onClick={() => setSearchQuery("")}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "4px",
            border: "1px solid #ccc",
            backgroundColor: "#f2f2f2",
            fontSize: "1rem",
            cursor: "pointer",
          }}
        >
          Reset
        </button>
      </div>

      {/* Evaluation List */}
      <div style={{
        maxHeight: "80vh",
        overflowY: "auto",
        paddingRight: "0.5rem"
      }}>

        {filteredEvaluations.length === 0 ? (
          <p style={{ color: "red", textAlign: "center" }}>No matching evaluations found.</p>
        ) : (
          filteredEvaluations.map((evaluation, index) => (
            <div
              key={index}
              style={{
                border: "1px solid #ccc",
                borderRadius: "4px",
                padding: "1rem",
                marginBottom: "1rem",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              <div style={{ flex: 1 }}>
                <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                  {evaluation.title}
                </h2>
                <p style={{ fontSize: "0.875rem", color: "#333", margin: 0 }}>{evaluation.summary}</p>
              </div>
              {evaluation.pdfs.map((pdf, i) => (
                <button
                  key={i}
                  onClick={() => handleOpenReport(pdf.pdfUrl)}
                  style={{
                    backgroundColor: "#0070f3",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    padding: "0.5rem 1rem",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    transition: "background-color 0.2s",
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#0051b3")}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#0070f3")}
                >
                  Open Report
                </button>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default ForensicEvaluationsPage
