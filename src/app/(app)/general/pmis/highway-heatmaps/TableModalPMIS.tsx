"use client"

import React, { useEffect, useState, useRef, useMemo, useCallback } from "react"
import { route } from "@/config"
import { FaSearch, FaSpinner, FaChartLine, FaMapMarkerAlt, FaSort, FaSortUp, FaSortDown } from "react-icons/fa"
import Papa from "papaparse"
import MiniSegmentChart, { type PMISFeature } from "@/components/chart/MiniSegmentChart"
import { API_GET_PROXY } from "@/lib/api";
export const getScoreCategory = (scoreType: string, score: number): string => {
  if (scoreType === "condition") {
    if (score < 1) return "Invalid"
    if (score < 35) return "Very Poor"
    if (score < 50) return "Poor"
    if (score < 70) return "Fair"
    if (score < 90) return "Good"
    return "Very Good"
  } else if (scoreType === "distress") {
    if (score < 1) return "Invalid"
    if (score < 60) return "Very Poor"
    if (score < 70) return "Poor"
    if (score < 80) return "Fair"
    if (score < 90) return "Good"
    if (score <= 100) return "Very Good"
    return "Invalid"
  } else if (scoreType === "aadt") {
    if (score < 1) return "Invalid"
    const max = 371120
    const thresholds = [max * 0.125, max * 0.25, max * 0.375, max * 0.5, max * 0.625, max * 0.75, max * 0.875, max]
    for (let i = 0; i < thresholds.length; i++) {
      if (score <= thresholds[i]) return `Category ${i + 1}`
    }
    return "Invalid"
  } else if (scoreType === "cost") {
    if (score < 0.1) return "Invalid"
    const max = 543313
    const thresholds = [max * 0.125, max * 0.25, max * 0.375, max * 0.5, max * 0.625, max * 0.75, max * 0.875, max]
    for (let i = 0; i < thresholds.length; i++) {
      if (score <= thresholds[i]) return `Category ${i + 1}`
    }
    return "Invalid"
  } else {
    // ride score
    if (score < 0.1) return "Invalid"
    if (score < 1) return "Very Poor"
    if (score < 2) return "Poor"
    if (score < 3) return "Fair"
    if (score < 4) return "Good"
    return "Very Good"
  }
}

export const getCategoryColor = (category: string, scoreType: string): string => {
  if (category === "Invalid" || category === "No Data") {
    return "rgb(240, 240, 240)" // Light gray for invalid or missing data
  }

  if (scoreType === "aadt") {
    const aadtColors = [
      "rgb(140, 190, 220)", // More saturated but still lighter than category 2
      "rgb(107, 174, 214)",
      "rgb(66, 146, 198)",
      "rgb(33, 113, 181)",
      "rgb(8, 81, 156)",
      "rgb(8, 69, 148)",
      "rgb(8, 48, 107)",
      "rgb(5, 24, 82)",
    ]
    const index = parseInt(category.split(" ")[1]) - 1
    return aadtColors[index] || "#ccc"
  } else if (scoreType === "cost") {
    // const costColors = [
    //   "rgb(254, 229, 217)",
    //   "rgb(253, 204, 138)",
    //   "rgb(252, 169, 118)",
    //   "rgb(252, 141, 89)",
    //   "rgb(239, 101, 72)",
    //   "rgb(227, 74, 51)",
    //   "rgb(179, 0, 0)",
    //   "rgb(127, 0, 0)",
    // ]
    const costColors = [
    "rgb(230, 220, 240)", // More saturated but still lighter than category 2
    "rgb(218, 218, 235)",
    "rgb(188, 189, 220)",
    "rgb(158, 154, 200)",
    "rgb(128, 125, 186)",
    "rgb(106, 81, 163)",
    "rgb(74, 20, 134)",
    "rgb(45, 0, 75)",     // darkest purple
  ];

    const index = parseInt(category.split(" ")[1]) - 1
    return costColors[index] || "#ccc"
  } else {
    switch (category) {
      case "Very Poor":
        return "rgb(239, 68, 68)" // Red
      case "Poor":
        return "rgb(249, 115, 22)" // Orange
      case "Fair":
        return "rgb(234, 179, 8)" // Yellow
      case "Good":
        return "rgb(34, 197, 94)" // Green
      case "Very Good":
        return "rgb(21, 128, 61)" // Dark Green
      case "Invalid":
        return "rgb(200, 200, 200)" // Light Gray
      default:
        return "rgb(75, 85, 99)" // Default gray
    }
  }
}

// Pre-calculate score data to avoid recalculating during render
interface ScoreData {
  value: number
  category: string
  color: string
}

interface ProcessedFeature {
  highway: string
  county: string
  formattedCounty: string
  scores: {
    [key: string]: ScoreData
  }
  interestingness?: number
}

interface TableModalPMISProps {
  title?: string
  containerDimensions?: { width: number; height: number }
  setSelectedHighway?: (hwy: string) => void
  showMapModal?: (rte_nm: string, cnty_nm: string) => void
  addChart?: (chart: { highway: string; county: string; field: string }, scoreValue: number) => void
  activeHeatMapData?: {
    highway: string
    county: string
    scores: { value: string; label: string }[]
    id: string
  }[]
  search?: string
  setSearch?: (search: string) => void
  features?: PMISFeature[]
}

type SortDirection = "asc" | "desc" | null
type SortColumn = "highway" | "county" | "condition" | "distress" | "ride" | "aadt" | "cost" | "interestingness" | null

interface ChartRowProps {
  item: ProcessedFeature
  fields: string[]
  isHighwayAvailable: (highway: string) => boolean
  handleMapClick: (highway: string, county: string) => void
  handleChartClick: (highway: string, county: string, field: string) => void
  activeHeatMapData: {
    highway: string
    county: string
    scores: { value: string; label: string }[]
    id: string
  }[]
  scrollContainerRef: React.RefObject<HTMLDivElement>
  getScoreCategory: (scoreType: string, score: number) => string
  getCategoryColor: (category: string, scoreType: string) => string
  segmentData: PMISFeature[]
}

const ChartRow: React.FC<ChartRowProps> = React.memo(
  ({
    item,
    fields,
    isHighwayAvailable,
    handleMapClick,
    handleChartClick,
    activeHeatMapData,
    scrollContainerRef,
    getScoreCategory,
    getCategoryColor,
    segmentData,
  }) => {
    const [isInView, setIsInView] = useState(false)
    const rowRef = useRef<HTMLTableRowElement>(null)

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            if (rowRef.current) {
              observer.unobserve(rowRef.current)
            }
          }
        },
        {
          root: scrollContainerRef.current,
          rootMargin: "200px", // Load nearby rows
        },
      )

      if (rowRef.current) {
        observer.observe(rowRef.current)
      }

      return () => {
        if (rowRef.current) {
          observer.unobserve(rowRef.current)
        }
      }
    }, [scrollContainerRef])

    return (
      <tr ref={rowRef} className="hover:bg-blue-50">
        <td className="border-2 border-gray-300 p-4">{item.highway}</td>
        <td className="border-2 border-gray-300 p-4">{item.formattedCounty}</td>
        <td className="border-2 border-gray-300 p-4 text-center">
          <button
            onClick={() => handleMapClick(item.highway, item.county)}
            className={`p-2 rounded-full transition ${
              isHighwayAvailable(item.highway)
                ? "bg-blue-100 hover:bg-blue-200"
                : "bg-gray-100 cursor-not-allowed opacity-50"
            }`}
            disabled={!isHighwayAvailable(item.highway)}
            title={isHighwayAvailable(item.highway) ? "View on map" : "Highway not available on map"}
          >
            <FaMapMarkerAlt className={isHighwayAvailable(item.highway) ? "text-blue-600" : "text-gray-400"} />
          </button>
        </td>
        {fields.map((field) => {
          const scoreData = item.scores[field]
          const isActive = activeHeatMapData.some(
            (d) => d.highway === item.highway && d.county === item.county && d.scores.some((s) => s.value === field),
          )
          const hasData = scoreData && scoreData.category !== "No Data"

          return (
            <td
              key={field}
              className="border-2 border-gray-300 p-1 text-center"
            >
              {isInView ? (
                <button
                  onClick={() => (hasData ? handleChartClick(item.highway, item.county, field) : undefined)}
                  className="w-full h-full relative"
                  title={
                    hasData ? `${scoreData?.category || "N/A"}: ${scoreData?.value || "N/A"}` : "No data available"
                  }
                  disabled={!hasData}
                >
                  <div
                    className="absolute inset-0"
                    style={{
                      outline: isActive ? "3px solid #000000" : "none",
                      outlineOffset: isActive ? "2px" : "0",
                      zIndex: 10,
                    }}
                  />
                  {hasData ? (
                    <MiniSegmentChart
                      data={segmentData}
                      metric={field}
                      getCategory={getScoreCategory}
                      getCategoryColor={getCategoryColor}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                      No Data
                    </div>
                  )}
                </button>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FaSpinner 
                    className="animate-spin" 
                    style={{ 
                      color: hasData ? scoreData?.color : "rgb(156, 163, 175)" // Use data color or gray for no data
                    }}
                  />
                </div>
              )}
            </td>
          )
        })}
      </tr>
    )
  },
)
ChartRow.displayName = "ChartRow"

const TableModalPMIS: React.FC<TableModalPMISProps> = ({
  title = "Highway Data",
  containerDimensions,
  setSelectedHighway = () => {},
  showMapModal = () => {},
  addChart = () => {},
  activeHeatMapData = [],
  search = "",
  setSearch = () => {},
  features = [],
}) => {
  const [loading, setLoading] = useState(true)
  const [availableHighways, setAvailableHighways] = useState<Set<string>>(new Set())
  const [processedData, setProcessedData] = useState<ProcessedFeature[]>([])
  const [sortColumn, setSortColumn] = useState<SortColumn>("interestingness")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const isMounted = useRef(true)
  const tableContainerRef = useRef<HTMLDivElement>(null)
  const fields = useMemo(
    () => ["TX_CONDITION_SCORE", "TX_DISTRESS_SCORE", "TX_RIDE_SCORE", "TX_AADT_CURRENT", "TX_MAINTENANCE_COST_AMT"],
    [],
  )

  // Format county name: remove number prefix and convert from ALL CAPS to Capitalized
  const formatCountyName = useCallback((county: string | undefined): string => {
    if (!county) return ""
    const withoutPrefix = county.replace(/^\d+\s*-\s*/, "")
    return withoutPrefix.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
  }, [])

  const segmentDataByHighwayCounty = useMemo(() => {
    const map = new Map<string, PMISFeature[]>()
    if (!features || features.length === 0) return map

    features.forEach((feature) => {
      const highway = feature.properties.TX_SIGNED_HIGHWAY_RDBD_ID
      const county = feature.properties.COUNTY
      if (highway && county) {
        const formattedCounty = formatCountyName(county)
        const key = `${highway}|${formattedCounty}`
        if (!map.has(key)) {
          map.set(key, [])
        }
        map.get(key)?.push(feature)
      }
    })

    return map
  }, [features, formatCountyName])

  const processedDataWithInterestingness = useMemo(() => {
    if (processedData.length === 0) {
      return []
    }

    return processedData.map((item) => {
      const key = `${item.highway}|${item.formattedCounty}`
      const segments = segmentDataByHighwayCounty.get(key) || []

      if (segments.length === 0) {
        return { ...item, interestingness: 0 }
      }

      const scores: number[] = []
      fields.forEach((field) => {
        segments.forEach((s) => {
          const score = Number(s.properties[field])
          if (!isNaN(score) && score > 0) {
            scores.push(score)
          }
        })
      })

      let interestingness = 0
      if (scores.length > 1) {
        const mean = scores.reduce((a, b) => a + b, 0) / scores.length
        const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / (scores.length -1)
        const stdDev = Math.sqrt(variance)
        interestingness = stdDev * Math.log10(scores.length + 1)
      } else {
        interestingness = scores.length
      }

      return { ...item, interestingness }
    })
  }, [processedData, segmentDataByHighwayCounty, fields, formatCountyName])

  // Process features once and store the result
  const processFeatures = useCallback(
    (data: any[]): ProcessedFeature[] => {
      const processed: { [key: string]: ProcessedFeature } = {}

      data.forEach((row) => {
        const highway = row.TX_SIGNED_HIGHWAY_RDBD_ID || ""
        const county = row.COUNTY || ""
        const key = `${highway}|${county}`

        if (!processed[key]) {
          processed[key] = {
            highway,
            county,
            formattedCounty: formatCountyName(county),
            scores: {},
          }
        }

        // Pre-calculate all scores
        fields.forEach((field) => {
          const rawValue = row[field]
          if (rawValue !== undefined && rawValue !== null && rawValue !== "") {
            const value = Number(rawValue)

            // Check if the parsed number is valid
            if (isNaN(value)) {
              processed[key].scores[field] = {
                value: 0,
                category: "No Data",
                color: "rgb(240, 240, 240)", // Light gray for missing data
              }
              return
            }

            let scoreType = ""

            switch (field) {
              case "TX_CONDITION_SCORE":
                scoreType = "condition"
                break
              case "TX_DISTRESS_SCORE":
                scoreType = "distress"
                break
              case "TX_RIDE_SCORE":
                scoreType = "ride"
                break
              case "TX_AADT_CURRENT":
                scoreType = "aadt"
                break
              case "TX_MAINTENANCE_COST_AMT":
                scoreType = "cost"
                break
            }

            const category = getScoreCategory(scoreType, value)
            const color = getCategoryColor(category, scoreType)

            processed[key].scores[field] = {
              value,
              category,
              color,
            }
          } else {
            // Handle missing/null/empty values
            processed[key].scores[field] = {
              value: 0,
              category: "No Data",
              color: "rgb(240, 240, 240)", // Light gray for missing data
            }
          }
        })
      })

      return Object.values(processed)
    },
    [fields, formatCountyName],
  )

  // Fetch CSV data
  useEffect(() => {
    const fetchCSVData = async () => {
      try {
        const response = await fetch("/files/hw_cnty_avg.csv")
        const csvText = await response.text()

        Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (results) => {
            const validData = results.data.filter((row: any) => row.COUNTY && row.TX_SIGNED_HIGHWAY_RDBD_ID);
            const processed = processFeatures(validData);

            if (isMounted.current) {
              setProcessedData(processed);
              setLoading(false);
            }
          },
          error: (error: any) => {
            console.error("Error parsing CSV:", error);
            if (isMounted.current) {
              setLoading(false);
            }
          },
        });
      } catch (error: any) {
        console.error("Error fetching CSV data:", error)
        if (isMounted.current) {
          setLoading(false)
        }
      }
    }

    fetchCSVData()
  }, [processFeatures])

  // Fetch highway availability data
  useEffect(() => {
    const fetchGeoJSONData = async () => {
      try {
        const response = await fetch(`${API_GET_PROXY}/general/pmis_lines_latest.geojson`)
        const data = await response.json()

        const highways = new Set<string>()
        data.features.forEach((feature: any) => {
          if (feature.properties && feature.properties.TX_SIGNED_HIGHWAY_RDBD_ID) {
            highways.add(feature.properties.TX_SIGNED_HIGHWAY_RDBD_ID)
          }
        })

        if (isMounted.current) {
          setAvailableHighways(highways)
        }
      } catch (error) {
        console.error("Error fetching GeoJSON data:", error)
      }
    }

    fetchGeoJSONData()
  }, [])

  const reformatHighwayName = useCallback((highway: string): string => {
    const lastSpaceIndex = highway.lastIndexOf(" ")
    if (lastSpaceIndex !== -1) {
      return highway.substring(0, lastSpaceIndex) + "-" + highway.substring(lastSpaceIndex + 1) + "G"
    }
    return highway + "G"
  }, [])

  const isHighwayAvailable = useCallback(
    (highway: string): boolean => {
      const reformattedHighway = reformatHighwayName(highway)
      return availableHighways.has(reformattedHighway)
    },
    [availableHighways, reformatHighwayName],
  )

  const handleMapClick = useCallback(
    (highway: string, county: string) => {
      setSelectedHighway(highway)
      showMapModal(highway, county)
    },
    [setSelectedHighway, showMapModal],
  )

  const handleChartClick = useCallback(
    (highway: string, county: string, field: string) => {
      // Find the feature in our processed data
      const feature = processedDataWithInterestingness.find((f) => f.highway === highway && f.county === county)
      const scoreValue = feature?.scores[field]?.value || 0
      addChart({ highway, county, field }, scoreValue)
    },
    [processedDataWithInterestingness, addChart],
  )

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (search === "") return processedDataWithInterestingness

    const t = search.toLowerCase()
    return processedDataWithInterestingness.filter(
      (item) =>
        item.highway.toLowerCase().includes(t) ||
        item.formattedCounty.toLowerCase().includes(t) ||
        item.county.toLowerCase().includes(t),
    )
  }, [processedDataWithInterestingness, search])

  // Add sort handler
  const handleSort = useCallback((column: SortColumn) => {
    if (sortColumn === column) {
      // Cycle through: asc -> desc -> null
      if (sortDirection === "asc") {
        setSortDirection("desc")
      } else if (sortDirection === "desc") {
        setSortDirection(null)
        setSortColumn(null)
      }
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }, [sortColumn, sortDirection])

  // Get sort icon
  const getSortIcon = useCallback((column: SortColumn) => {
    if (sortColumn !== column) return <FaSort className="text-gray-400" />
    if (sortDirection === "asc") return <FaSortUp className="text-blue-600" />
    if (sortDirection === "desc") return <FaSortDown className="text-blue-600" />
    return <FaSort className="text-gray-400" />
  }, [sortColumn, sortDirection])

  // Sort data based on current sort configuration
  const sortedData = useMemo(() => {
    if (!sortColumn || !sortDirection) return filteredData

    return [...filteredData].sort((a, b) => {
      let comparison = 0

      if (sortColumn === "highway") {
        comparison = a.highway.localeCompare(b.highway)
      } else if (sortColumn === "county") {
        comparison = a.formattedCounty.localeCompare(b.formattedCounty)
      } else if (sortColumn === "interestingness") {
        const aValue = a.interestingness || 0
        const bValue = b.interestingness || 0
        comparison = aValue - bValue
      } else {
        // For score columns, compare the values
        let fieldName = ""
        switch (sortColumn) {
          case "condition":
            fieldName = "TX_CONDITION_SCORE"
            break
          case "distress":
            fieldName = "TX_DISTRESS_SCORE"
            break
          case "ride":
            fieldName = "TX_RIDE_SCORE"
            break
          case "aadt":
            fieldName = "TX_AADT_CURRENT"
            break
          case "cost":
            fieldName = "TX_MAINTENANCE_COST_AMT"
            break
        }

        // Assign special values for 'No Data' or invalid
        const aCategory = a.scores[fieldName]?.category
        const bCategory = b.scores[fieldName]?.category
        const aValue = (aCategory === "No Data" || aCategory === "Invalid" || a.scores[fieldName]?.value == null)
          ? (sortDirection === "asc" ? Infinity : -Infinity)
          : a.scores[fieldName]?.value
        const bValue = (bCategory === "No Data" || bCategory === "Invalid" || b.scores[fieldName]?.value == null)
          ? (sortDirection === "asc" ? Infinity : -Infinity)
          : b.scores[fieldName]?.value

        comparison = aValue - bValue
        if (comparison === 0) {
          // Tie-breaker: sort by county
          comparison = a.formattedCounty.localeCompare(b.formattedCounty)
        }
      }

      return sortDirection === "asc" ? comparison : -comparison
    })
  }, [filteredData, sortColumn, sortDirection])

  // Update visibleRows to use sortedData
  const visibleRows = useMemo(() => {
    return sortedData
  }, [sortedData])

  return (
    <div className="h-screen flex flex-col overflow-hidden rounded-lg shadow border bg-white">
      <div className="px-5 py-3 bg-gradient-to-r from-[rgb(20,55,90)] to-[rgb(30,65,100)] text-white font-bold flex-shrink-0">
        {title} ({filteredData.length})
      </div>
      <div className="p-4 border-b flex-shrink-0">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="pl-9 pr-3 py-2 w-full border rounded focus:outline-none"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>
      <div ref={tableContainerRef} className="flex-grow overflow-auto bg-white min-h-0 pb-4">
        <table className="w-full text-sm border-collapse">
          <thead className="sticky top-0 bg-gray-100 z-20 shadow-sm">
              <tr className="text-gray-700">
              <th 
                className="p-4 text-left font-semibold cursor-pointer hover:bg-gray-200 border-2 border-gray-300"
                onClick={() => handleSort("highway")}
              >
                <div className="flex items-center gap-1">
                  Highway
                  {getSortIcon("highway")}
                </div>
              </th>
              <th 
                className="p-4 text-left font-semibold cursor-pointer hover:bg-gray-200 border-2 border-gray-300"
                onClick={() => handleSort("county")}
              >
                <div className="flex items-center gap-1">
                  County
                  {getSortIcon("county")}
                </div>
              </th>
              <th className="p-4 text-center font-semibold border-2 border-gray-300">Map</th>
              <th 
                className="p-4 text-center font-semibold cursor-pointer hover:bg-gray-200 border-2 border-gray-300"
                onClick={() => handleSort("condition")}
              >
                <div className="flex items-center justify-center gap-1">
                  Condition
                  {getSortIcon("condition")}
                </div>
              </th>
              <th 
                className="p-4 text-center font-semibold cursor-pointer hover:bg-gray-200 border-2 border-gray-300"
                onClick={() => handleSort("distress")}
              >
                <div className="flex items-center justify-center gap-1">
                  Distress
                  {getSortIcon("distress")}
                </div>
              </th>
              <th 
                className="p-4 text-center font-semibold cursor-pointer hover:bg-gray-200 border-2 border-gray-300"
                onClick={() => handleSort("ride")}
              >
                <div className="flex items-center justify-center gap-1">
                  Ride
                  {getSortIcon("ride")}
                </div>
              </th>
              <th 
                className="p-4 text-center font-semibold cursor-pointer hover:bg-gray-200 border-2 border-gray-300"
                onClick={() => handleSort("aadt")}
              >
                <div className="flex items-center justify-center gap-1">
                  AADT
                  {getSortIcon("aadt")}
                </div>
              </th>
              <th 
                className="p-4 text-center font-semibold cursor-pointer hover:bg-gray-200 border-2 border-gray-300"
                onClick={() => handleSort("cost")}
              >
                <div className="flex items-center justify-center gap-1">
                  Maint. Cost
                  {getSortIcon("cost")}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.length === 0 ? (
              loading ? (
                <tr>
                  <td colSpan={8} className="p-4 text-center">
                    <FaSpinner className="animate-spin mx-auto" />
                  </td>
                </tr>
              ) : (
                <tr>
                  <td colSpan={8} className="p-4 text-center text-gray-500">
                    No records found
                  </td>
                </tr>
              )
            ) : (
              visibleRows.map((item, i) => (
                <ChartRow
                  key={`${item.highway}-${item.county}-${i}`}
                  item={item}
                  fields={fields}
                  isHighwayAvailable={isHighwayAvailable}
                  handleMapClick={handleMapClick}
                  handleChartClick={handleChartClick}
                  activeHeatMapData={activeHeatMapData}
                  scrollContainerRef={tableContainerRef}
                  getScoreCategory={getScoreCategory}
                  getCategoryColor={getCategoryColor}
                  segmentData={segmentDataByHighwayCounty.get(`${item.highway}|${item.formattedCounty}`) || []}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default TableModalPMIS