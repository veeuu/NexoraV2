import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { subDays, subMonths, subYears, format } from 'date-fns';

// Helper function to simulate a random number
const rand = (min, max) => Math.random() * (max - min) + min;


// --- Data Simulation Function ---
const fetchSimulatedData = (company, range) => {
  if (!company) return [];

  const basePerformance = company.dailyPerformance;
  const baseClose = basePerformance.close;

  if (range === '1D') {
    const { open, high, low, close } = basePerformance;
    const dataPoints = [];
    const times = [
      '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM',
      '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM',
      '03:30 PM', '04:00 PM'
    ];

    let currentPrice = open;

    times.forEach((time, index) => {
      const progressFactor = index / (times.length - 1);
      
      const targetPrice = open * (1 - progressFactor) + close * progressFactor;
      currentPrice += rand(-0.2, 0.2);
      currentPrice = currentPrice * 0.9 + targetPrice * 0.1;

      dataPoints.push({
        Time: time,
        Price: parseFloat(currentPrice.toFixed(2)),
        Open: open, 
        High: high, 
        Low: low, 
        Close: parseFloat(currentPrice.toFixed(2)) 
      });
    });
    if (dataPoints.length > 0) {
        dataPoints[dataPoints.length - 1].Price = close;
        dataPoints[dataPoints.length - 1].Close = close;
    }

    return dataPoints;

  } else {
    // Historical Simulation (5D, 1M, 6M, YTD, 1Y, 5Y)
    let numPoints;
    let timeUnit;
    let dateFormat;

    switch (range) {
      case '5D': numPoints = 5; timeUnit = subDays; dateFormat = 'EEE, d'; break;
      case '1M': numPoints = 21; timeUnit = subDays; dateFormat = 'MMM d'; break;
      case '6M': numPoints = 6; timeUnit = subMonths; dateFormat = 'MMM yy'; break;
      case 'YTD': numPoints = 12; timeUnit = subMonths; dateFormat = 'MMM yy'; break;
      case '1Y': numPoints = 12; timeUnit = subMonths; dateFormat = 'MMM yy'; break;
      case '5Y': numPoints = 60; timeUnit = subMonths; dateFormat = 'MMM yy'; break;
      default: return [];
    }

    const data = [];
    let price = baseClose;
    const today = new Date();

    for (let i = numPoints; i >= 0; i--) {
      const date = timeUnit(today, i);
      
      price += rand(-baseClose * 0.01, baseClose * 0.01); 
      price = Math.max(price, baseClose * 0.7);

      const close = price;
      const open = close + rand(-1, 1);
      const high = Math.max(open, close) + rand(0, 1);
      const low = Math.min(open, close) - rand(0, 1);
      
      data.push({
        Time: format(date, dateFormat),
        Open: parseFloat(open.toFixed(2)),
        High: parseFloat(high.toFixed(2)),
        Low: parseFloat(low.toFixed(2)),
        Close: parseFloat(close.toFixed(2)),
        Volume: Math.round(rand(100000, 500000)),
      });
    }
    return data;
  }
};


// --- Custom Tooltip Component (Light Theme) ---
const CustomTooltip = ({ active, payload, label, timeRange }) => {
  if (active && payload && payload.length) {
    const isIntraday = timeRange === '1D';
    const closeData = payload.find(p => p.dataKey === (isIntraday ? 'Close' : 'Close'));
    const openData = payload.find(p => p.dataKey === 'Open');
    const highData = payload.find(p => p.dataKey === 'High');
    const lowData = payload.find(p => p.dataKey === 'Low');
    const volumeData = payload.find(p => p.dataKey === 'Volume');

    return (
      <div style={{ backgroundColor: '#fff', color: '#333', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', fontSize: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
        <p className="label" style={{ fontWeight: 'bold' }}>{isIntraday ? `Time: ${label}` : `Date: ${label}`}</p>
        {openData && <p style={{ color: '#8884d8' }}>{`Open: ${openData.value.toFixed(2)}`}</p>}
        {closeData && <p style={{ color: closeData.stroke }}>{`Close: ${closeData.value.toFixed(2)}`}</p>}
        {highData && <p style={{ color: '#FF7300' }}>{`High: ${highData.value.toFixed(2)}`}</p>}
        {lowData && <p style={{ color: '#0088FE' }}>{`Low: ${lowData.value.toFixed(2)}`}</p>}
        {volumeData && <p style={{ color: '#555' }}>{`Volume: ${volumeData.value.toLocaleString()}`}</p>}
      </div>
    );
  }
  return null;
};


const Summary = () => {
  // State for company selection and time range
  const [financialData, setFinancialData] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [timeRange, setTimeRange] = useState('1D'); // Default to 1D
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper to parse string numbers like "$20.63" or "1.2M"
  const parseNumericValue = (value) => {
    if (typeof value === 'number') return value;
    if (typeof value !== 'string') return 0;
    const cleanedValue = value.replace(/[^0-9.-]/g, '');
    return parseFloat(cleanedValue) || 0;
  };

  // Fetch data whenever company or timeRange changes
  // 1. Fetch initial data for the dropdown
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/financial/wide');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const sanitizedData = data.map(company => ({
          ...company,
          dailyPerformance: {
            ...company.dailyPerformance,
            open: parseNumericValue(company.dailyPerformance.open),
            high: parseNumericValue(company.dailyPerformance.high),
            low: parseNumericValue(company.dailyPerformance.low),
            close: parseNumericValue(company.dailyPerformance.close),
          }
        }));
        setFinancialData(sanitizedData);
        if (sanitizedData.length > 0) {
          setSelectedCompany(sanitizedData[0]);
        }
      } catch (e) {
        setError(e.message);
        console.error("Failed to fetch Financial data:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []); // Empty dependency array ensures this runs only once on mount

  // 2. Generate chart data when the selected company or time range changes
  useEffect(() => {
    if (selectedCompany) {
      setChartData(fetchSimulatedData(selectedCompany, timeRange));
    }
  }, [selectedCompany, timeRange]);

  // Handle dropdown change
  const handleCompanyChange = (event) => {
    const selectedCompanyName = event.target.value;
    const company = financialData.find(c => c.companyName === selectedCompanyName);
    setSelectedCompany(company);
  };

  // Determine chart price extremes
  const prices = chartData.map(d => d.Close || d.Price).filter(p => p);
  const minPrice = prices.length > 0 ? Math.min(...prices) * 0.99 : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) * 1.01 : 100;
  
  // Determine the primary color (Green for gain, Red for loss)
  const isGain = chartData.length > 1 && (chartData[chartData.length - 1].Close || chartData[chartData.length - 1].Price) >= (chartData[0].Open || chartData[0].Close);
  const primaryColor = isGain ? '#4CAF50' : '#F44336'; // Standard Green/Red

  const isIntraday = timeRange === '1D';

  // --- Render Charting Component based on Time Range ---
  const renderChart = () => {
    if (!selectedCompany) return null;

    const ChartComponent = isIntraday ? LineChart : AreaChart;
    const ChartItem = isIntraday ? Line : Area;
    const dataKey = 'Close';

    return (
      <ChartComponent
        data={chartData}
        margin={{ top: 15, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
        <XAxis dataKey="Time" tick={{ fill: '#555' }} axisLine={{ stroke: '#555' }} />
        <YAxis
          domain={[minPrice, maxPrice]}
          orientation="right"
          tickFormatter={(value) => selectedCompany.currency + ' ' + value.toFixed(2)}
          tick={{ fill: '#555' }}
          axisLine={{ stroke: '#555' }}
        />
        <Tooltip content={<CustomTooltip timeRange={timeRange} />} />
        <Legend wrapperStyle={{ paddingTop: '10px' }} />
        
        <ChartItem
          type="monotone"
          dataKey={dataKey}
          stroke={primaryColor}
          strokeWidth={2}
          dot={false}
          name="Closing Price"
          fillOpacity={isIntraday ? 0 : 0.2} // Light fill for historical area
          fill={isIntraday ? '' : primaryColor}
        />
        
        {/* Additional OHLC lines only for 1D for visual comparison */}
        {isIntraday && (
            <>
                <Line type="monotone" dataKey="Open" stroke="#8884d8" strokeDasharray="5 5" strokeWidth={1} dot={false} name="Opening Price" />
                <Line type="monotone" dataKey="High" stroke="#FF7300" strokeDasharray="3 3" strokeWidth={1} dot={false} name="Daily High" />
                <Line type="monotone" dataKey="Low" stroke="#0088FE" strokeDasharray="3 3" strokeWidth={1} dot={false} name="Daily Low" />
            </>
        )}

      </ChartComponent>
    );
  };

  const lastDataPoint = chartData[chartData.length - 1] || {};

  return (
    // Component container with White Background
    <div className="summary-container" style={{ padding: '20px', backgroundColor: '#ffffff', color: '#333', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <h2 style={{ borderBottom: '1px solid #ccc', paddingBottom: '10px', marginBottom: '20px' }}>Stock Performance Summary (Interactive)</h2>

      {/* Company Selector and Time Range Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        
        {/* Company Selection Dropdown */}
        <div className="company-selector">
            <label htmlFor="company-select" style={{ marginRight: '10px', fontSize: '16px', fontWeight: 'bold' }}>Select Company:</label>
            <select
            id="company-select"
            onChange={handleCompanyChange}
            value={selectedCompany ? selectedCompany.companyName : ''}
            // Light Theme Styles
            style={{ padding: '8px 12px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '16px', minWidth: '200px', backgroundColor: '#f5f5f5', color: '#333' }}
            disabled={loading || error}
            >
            <option value="">-- Please choose a company --</option>
            {financialData.map((company) => (
                <option key={company.companyName} value={company.companyName}>
                {company.companyName}
                </option>
            ))}
            </select>
        </div>
        
        {/* Time Range Selector Buttons */}
        <div style={{ display: 'flex', gap: '5px' }}>
          {['1D', '5D', '1M', '6M', 'YTD', '1Y', '5Y'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              style={{
                padding: '6px 12px',
                borderRadius: '5px',
                // Active/Inactive Button Colors
                border: timeRange === range ? '1px solid #4CAF50' : '1px solid #ccc',
                backgroundColor: timeRange === range ? '#4CAF50' : '#f5f5f5',
                color: timeRange === range ? '#ffffff' : '#333',
                cursor: 'pointer',
                fontWeight: 'bold',
                // FAST Transition: 0s for instant change
                transition: 'all 0s', 
                fontSize: '14px'
              }}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {loading && <div style={{ textAlign: 'center', padding: '50px' }}>Loading summary...</div>}
      {error && <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>Error: {error}</div>}
      {!loading && !error && (!selectedCompany || chartData.length === 0) ? (
        <div className="empty-component" style={{ textAlign: 'center', padding: '50px', border: '1px dashed #ccc', borderRadius: '5px', color: '#666' }}>
          <p>Please select a company to view its stock performance trend.</p>
        </div>
      ) : (
        <>
          <h3 style={{ marginBottom: '15px', color: '#555' }}>
            {selectedCompany ? selectedCompany.companyName : '...'} | Showing {timeRange} Trend
          </h3>
          <div style={{ width: '100%', height: 400, backgroundColor: '#ffffff', padding: '5px', borderRadius: '8px', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)' }}>
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          </div>
          
          {/* Stock Info Bar */}
          <div className="stock-info" style={{ display: 'flex', justifyContent: 'space-around', padding: '15px 0', borderTop: '1px solid #eee', marginTop: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
              <div style={{ textAlign: 'center', flex: 1, borderRight: '1px solid #eee' }}>
                  <strong>Open:</strong> <br /> {selectedCompany ? selectedCompany.currency : ''} {lastDataPoint.Open ? lastDataPoint.Open.toFixed(2) : 'N/A'}
              </div>
              <div style={{ textAlign: 'center', flex: 1, borderRight: '1px solid #eee' }}>
                  <strong>High:</strong> <br /> {selectedCompany ? selectedCompany.currency : ''} {lastDataPoint.High ? lastDataPoint.High.toFixed(2) : 'N/A'}
              </div>
              <div style={{ textAlign: 'center', flex: 1, borderRight: '1px solid #eee' }}>
                  <strong>Low:</strong> <br /> {selectedCompany ? selectedCompany.currency : ''} {lastDataPoint.Low ? lastDataPoint.Low.toFixed(2) : 'N/A'}
              </div>
              <div style={{ textAlign: 'center', flex: 1, borderRight: '1px solid #eee' }}>
                  <strong>Close:</strong> <br /> {selectedCompany ? selectedCompany.currency : ''} {lastDataPoint.Close ? lastDataPoint.Close.toFixed(2) : 'N/A'}
              </div>
              <div style={{ textAlign: 'center', flex: 1 }}>
                  <strong>Volume:</strong> <br /> {lastDataPoint.Volume ? lastDataPoint.Volume.toLocaleString() : (selectedCompany ? selectedCompany.dailyPerformance.volume : 'N/A')}
              </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Summary;