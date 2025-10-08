import React, { useState } from 'react';

const NTP = () => {
  const [filters, setFilters] = useState({
    companyName: '',
    technology: '',
    purchasePrediction: '',
    category: ''
  });

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const tableData = [
    {
      companyName: 'FinanceCorp',
      category: 'Banking',
      technology: 'Payment Systems',
      latestDetectedDate: '2023-05-12',
      previousDetectedDate: '2023-04-05',
      purchaseProbability: 85,
      purchasePrediction: 'High',
      ntpAnalysis: 'Seeking upgrade solutions'
    },
    {
      companyName: 'InvestPro',
      category: 'Investment',
      technology: 'Portfolio Manager',
      latestDetectedDate: '2023-05-08',
      previousDetectedDate: '2023-03-18',
      purchaseProbability: 60,
      purchasePrediction: 'Medium',
      ntpAnalysis: 'Comparing vendors'
    },
    {
      companyName: 'WealthBuilder',
      category: 'Financial Planning',
      technology: 'Advisory Platform',
      latestDetectedDate: '2023-05-02',
      previousDetectedDate: '2023-02-28',
      purchaseProbability: 95,
      purchasePrediction: 'Very High',
      ntpAnalysis: 'Ready to sign contract'
    }
  ];

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
            <option value="FinanceCorp">FinanceCorp</option>
            <option value="InvestPro">InvestPro</option>
            <option value="WealthBuilder">WealthBuilder</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Technology</label>
          <select 
            value={filters.technology}
            onChange={(e) => handleFilterChange('technology', e.target.value)}
          >
            <option value="">All</option>
            <option value="Payment Systems">Payment Systems</option>
            <option value="Portfolio Manager">Portfolio Manager</option>
            <option value="Advisory Platform">Advisory Platform</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Purchase Prediction</label>
          <select 
            value={filters.purchasePrediction}
            onChange={(e) => handleFilterChange('purchasePrediction', e.target.value)}
          >
            <option value="">All</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Very High">Very High</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Category</label>
          <select 
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            <option value="">All</option>
            <option value="Banking">Banking</option>
            <option value="Investment">Investment</option>
            <option value="Financial Planning">Financial Planning</option>
          </select>
        </div>
      </div>
      
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Company Name</th>
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
            {tableData.map((row, index) => (
              <tr key={index}>
                <td>{row.companyName}</td>
                <td>{row.category}</td>
                <td>{row.technology}</td>
                <td>{row.latestDetectedDate}</td>
                <td>{row.previousDetectedDate}</td>
                <td>{row.purchaseProbability}</td>
                <td>{row.purchasePrediction}</td>
                <td>{row.ntpAnalysis}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NTP;