import React, { useState, useEffect } from 'react';
import '../../styles.css';

const MutualFund = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDownloadCSV = () => {
    const headers = [
      'ID', 'Company Name', 'Domain', 'Industry', 'Country',
      'Date', 'Name', 'Holding', 'Shares'
    ];

    const csvContent = [
      headers.join(','),
      ...filteredData.map(row => [
        row.id, row.companyName, row.domain, row.industry, row.country,
        row.date, row.fundName, row.holding, row.shares
      ].map(value => `"${value}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'mutual_fund_data.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/mutualfunds');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setTableData(data);
      } catch (e) {
        setError(e.message);
        console.error("Failed to fetch Mutual Fund data:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredData = tableData.filter(row => {
    return Object.values(row).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (loading) {
    return <div>Loading Mutual Fund Holders data...</div>;
  }

  if (error) {
    return <div>Error fetching data: {error}</div>;
  }

  return (
    <div className="mutual-fund-section-container">
      <div className="header-controls">
        <h2>Mutual Fund Holders</h2>
        <div className="action-items">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <span className="search-icon">🔍</span>
          </div>
          <button className="download-csv-btn" onClick={handleDownloadCSV}>
            Download CSV
          </button>
        </div>
      </div>
      
      <div className="section-subtle-divider" />
      
      <div className="table-container max-viewport">
        <table>
          <thead className="sticky-header">
            <tr>
              <th colSpan="6">About</th>
              <th colSpan="4">Mutual Fund Holders</th>
            </tr>
            <tr>
              <th>ID</th>
              <th>Company Name</th>
              <th>Domain</th>
              <th>Industry</th>
              <th>Country</th>
              <th>Date</th>
              <th>Name</th>
              <th>Holding</th>
              <th>Shares</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, index) => (
              <tr key={index}>
                {/* About */}
                <td>{row.id}</td>
                <td>{row.companyName}</td>
                <td>{row.domain}</td>
                <td>{row.industry}</td>
                <td>{row.country}</td>
                
                {/* Mutual Fund Holders */}
                <td>{row.date}</td>
                <td>{row.fundName}</td>
                <td>{row.holding}</td>
                <td>{row.shares}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MutualFund;