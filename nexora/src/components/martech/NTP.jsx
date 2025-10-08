import React, { useState, useEffect } from 'react';
import '../../styles.css';

const NTP = () => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    companyName: '',
    technology: '',
    purchasePrediction: '',
    category: ''
  });
  const [modalContent, setModalContent] = useState(null);

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/ntp');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setTableData(data);
      } catch (e) {
        setError(e.message);
        console.error("Failed to fetch NTP data:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getUniqueOptions = (key) => {
    if (!tableData) return [];
    const allValues = tableData.map(item => item[key]);
    return [...new Set(allValues)].sort();
  };

  const filteredData = tableData.filter(row => {
    return Object.keys(filters).every(key => {
      if (!filters[key]) return true;
      // The data from MongoDB might have different casing or field names
      const rowKey = key === 'companyName' ? 'companyName' : key;
      return String(row[rowKey]) === filters[key];
    });
  });

  const handleAnalysisClick = (analysis) => {
    setModalContent(analysis);
  };

  if (loading) {
    return <div>Loading NTP data...</div>;
  }

  if (error) {
    return <div>Error fetching data: {error}</div>;
  }

  return (
    <div className="ntp-container">
      <h2>NTP</h2>
      <div className="section-subtle-divider" />
      
      <div className="filters">
        <div className="filter-group">
          <label>Company Name</label>
          <select 
            value={filters.companyName}
            onChange={(e) => handleFilterChange('companyName', e.target.value)}
          >
            <option value="">All</option>
            {getUniqueOptions('companyName').map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>
        
        
        <div className="filter-group">
          <label>Purchase Prediction</label>
          <select 
            value={filters.purchasePrediction}
            onChange={(e) => handleFilterChange('purchasePrediction', e.target.value)}
          >
            <option value="">All</option>
            {getUniqueOptions('purchasePrediction').map(prediction => (
              <option key={prediction} value={prediction}>{prediction}</option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <label>Category</label>
          <select 
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            <option value="">All</option>
            {getUniqueOptions('category').map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Technology</label>
          <select 
            value={filters.technology}
            onChange={(e) => handleFilterChange('technology', e.target.value)}
          >
            <option value="">All</option>
            {getUniqueOptions('technology').map(tech => (
              <option key={tech} value={tech}>{tech}</option>
            ))}
          </select>
        </div>

      </div>
      
      <div className="table-container">
        <table>
          <thead className="sticky-header">
            <tr>
              <th>Company Name</th>
              <th>Domain</th> {/* Domain column remains */}
              <th>Category</th>
              <th>Technology</th>
              <th>Latest Detected Date</th>
              <th>Previous Detected Date</th>
              <th>Purchase Probability (%)</th>
              <th>Purchase Prediction</th>
              <th>NTP Analysis</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, index) => (
              <tr key={index}>
                <td>{row.companyName}</td>
                <td>{row.domain}</td> {/* Domain column */}
                <td>{row.category}</td>
                <td>{row.technology}</td>
                <td>{row.latestDetectedDate}</td>
                <td>{row.previousDetectedDate}</td>
                <td>{row.purchaseProbability}</td>
                <td>{row.purchasePrediction}</td>
                <td 
                  onClick={() => handleAnalysisClick(row.ntpAnalysis)} 
                  style={{ cursor: 'pointer', color: '#010810ff', textDecoration: 'underline' }}
                >{row.ntpAnalysis.substring(0, 30)}...</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalContent && (
        <div className="modal-overlay" onClick={() => setModalContent(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>NTP Analysis</h3>
            <p>{modalContent}</p>
            <button onClick={() => setModalContent(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NTP;
