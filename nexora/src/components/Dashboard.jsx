import React, { useState } from 'react';
import Header from './Header';
import Menu from './Menu';
import MartechSummary from './martech/Summary';
import MartechNTP from './martech/NTP';
import MartechTechnographics from './martech/Technographics';
import MarketSummary from './market/Summary';
// import MarketNTP from './market/NTP'; // Commented out as requested
import MarketFinancial from './market/Financial';
import StockPerformance from './market/StockPerformance';
import BuyerGroup from './market/BuyerGroup';
import Growth from './market/Growth';
import MutualFund from './market/MutualFund'; // Added import for MutualFund

const Dashboard = () => {
  const [activeView, setActiveView] = useState('Martech');
  const [activeSection, setActiveSection] = useState('Summary');

  const handleDropdownChange = (value) => {
    setActiveView(value);
    setActiveSection('Summary');
  };

  const handleMenuClick = (section) => {
    setActiveSection(section);
  };

  const getMenuItems = () => {
    return activeView === 'Martech' 
      ? ['Summary', 'Technographics', 'NTP']
      : ['Summary', /* 'NTP', */ 'Financial', 'Stock Performance', 'Buyer Group', 'Growth', 'Mutual Fund']; // Added 'Mutual Fund' to the menu
  };

  const renderActiveSection = () => {
    if (activeView === 'Martech') {
      switch (activeSection) {
        case 'Summary':
          return <MartechSummary />;
        case 'Technographics':
          return <MartechNTP />;
        case 'NTP':
          return <MartechTechnographics />;
        default:
          return <MartechSummary />;
      }
    } else {
      switch (activeSection) {
        case 'Summary':
          return <MarketSummary />;
        // case 'NTP':
        //   return <MarketNTP />; // Commented out
        case 'Financial':
          return <MarketFinancial />;
        case 'Stock Performance':
          return <StockPerformance />;
        case 'Buyer Group':
          return <BuyerGroup />;
        case 'Growth':
          return <Growth />;
        case 'Mutual Fund':
          return <MutualFund />;
        default:
          return <MarketSummary />;
      }
    }
  };

  return (
    <div className="dashboard">
      <Header onDropdownChange={handleDropdownChange} />
      <div className="dashboard-content">
        <Menu 
          activeSection={activeSection}
          onMenuClick={handleMenuClick}
          menuItems={getMenuItems()}
        />
        <main className="main-content">
          {renderActiveSection()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;