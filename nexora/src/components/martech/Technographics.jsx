import React, { useState, useEffect } from 'react';
import '../../styles.css';

const Technographics = () => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    companyName: '',
    region: '',
    technology: '',
    category: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const handleDownloadCSV = () => {
    const headers = Object.keys(tableData[0]).join(',');
    const rows = tableData.map(row => Object.values(row).join(',')).join('\n');
    const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "technographics_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/technographics');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setTableData(data);
      } catch (e) {
        setError(e.message);
        console.error("Failed to fetch Technographics data:", e);
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
    const filterMatches = Object.keys(filters).every(key => {
      if (!filters[key]) return true;
      return String(row[key]) === filters[key];
    });

    const searchMatches = Object.values(row).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filterMatches && searchMatches;
  });

  if (loading) {
    return <div>Loading Technographics data...</div>;
  }

  if (error) {
    return <div>Error fetching data: {error}</div>;
  }

  return (
    <div className="technographics-container">
      <div className="header-actions">
        <h2>Technographics</h2>
        <div className="actions-right">
          <div className="search-bar">
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>
          <button className="download-csv-button" onClick={handleDownloadCSV}>
            Download CSV
          </button>
        </div>
      </div>

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
          <label>Region</label>
          <select
            value={filters.region}
            onChange={(e) => handleFilterChange('region', e.target.value)}
          >
            <option value="">All</option>
            {getUniqueOptions('region').map(region => (
              <option key={region} value={region}>{region}</option>
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
          <select value={filters.technology} onChange={(e) => handleFilterChange('technology', e.target.value)}>
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
              <th>Domain</th>
              <th>Industry</th>
              <th>Region</th>
              <th>Category</th>
              <th>Technology</th>
              <th>Previous Detected Date</th>
              <th>Latest Detected Date</th>
              <th>Renewal Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, index) => (
              <tr key={index}>
                <td>{row.companyName}</td>
                <td>{row.domain}</td>
                <td>{row.industry}</td>
                <td>{row.region}</td>
                <td>{row.category}</td>
                <td>{row.technology}</td>
                <td>{row.previousDetectedDate}</td>
                <td>{row.latestDetectedDate}</td>
                <td>{row.renewalDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Technographics;