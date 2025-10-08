const express = require('express');
const router = express.Router();
// Assuming this file is in your 'routes' folder
const Company = require('../models/Company');

// @route   GET /api/ntp
// @desc    Get NTP data for all companies
// @access  Public
router.get('/ntp', async (req, res) => {
  try {
    const companies = await Company.find({}, { 'Company Name': 1, NTP: 1, Firmographics: 1, Technographics: 1, _id: 0 });

    const ntpData = companies.flatMap(company =>
      company.NTP?.map(ntpItem => ({
        companyName: company['Company Name'],
        domain: company.Firmographics?.[0]?.About?.Domain || 'N/A',
        category: ntpItem.Category,
        technology: ntpItem.Technology,
        purchaseProbability: ntpItem['Purchase Probability (%)'],
        purchasePrediction: ntpItem['Purchase Prediction'],
        ntpAnalysis: ntpItem['NTP Analysis'],
        latestDetectedDate: company.Technographics?.find(t => t.Keyword === ntpItem.Technology)?.['Latest Date'] || 'N/A',
        previousDetectedDate: company.Technographics?.find(t => t.Keyword === ntpItem.Technology)?.['Previous Date'] || 'N/A'
      })) || []
    );

    res.json(ntpData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/technographics
// @desc    Get Technographics data for all companies
// @access  Public
router.get('/technographics', async (req, res) => {
  try {
    const companies = await Company.find({}, { 'Company Name': 1, Firmographics: 1, Technographics: 1, _id: 0 });

    const technographicsData = companies.flatMap(company => {
      const firmographics = company.Firmographics?.[0] || {};
      const about = firmographics.About || {};
      const location = firmographics.Location || {};

      return company.Technographics?.map(techItem => ({
        companyName: company['Company Name'],
        region: location.Country || 'N/A',
        industry: about.Industry || 'N/A',
        employeeSize: about['Full Time employees'] || 'N/A',
        category: techItem.Category,
        technology: techItem.Keyword,
        domain: about.Domain || 'N/A',
        previousDetectedDate: techItem['Previous Date'] || 'N/A',
        latestDetectedDate: techItem['Latest Date'] || 'N/A',
        renewalDate: techItem['Renewal Date'] || 'N/A'
      })) || [];
    });

    res.json(technographicsData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/financial/wide
// @desc    Get Financial data (one record per company)
// @access  Public
router.get('/financial/wide', async (req, res) => {
  try {
    const companies = await Company.find({}, { 'Company Name': 1, Firmographics: 1, Financial_Data: 1, Stock_Performance: 1, _id: 0 });

    const financialData = companies.map(company => {
      const firmographics = company.Firmographics?.[0] || {};
      const about = firmographics.About || {};
      const location = firmographics.Location || {};
      const finance = company.Financial_Data?.Finance || {};
      const dividend = company.Financial_Data?.Dividend || {};
      const stock = company.Stock_Performance || {};
      const daily = stock.Daily_Performance?.[0] || {};
      const weekly = stock.Weekly_Performance?.[0] || {};
      const monthly = stock.Monthly_Performance?.[0] || {};
      const quarterly = stock.Quarterly_Performance?.[0] || {};

      return ({
        companyName: company['Company Name'],
        domain: about.Domain || 'N/A',
        industry: about.Industry || 'N/A',
        fullTimeEmployees: about['Full Time employees'] || 'N/A',
        investorWebsite: finance['Investor Website'] || 'N/A',
        exchange: finance.Exchange || 'N/A',
        address: location.Address || 'N/A',
        city: location.City || 'N/A',
        state: location.State || 'N/A',
        country: location.Country || 'N/A',
        contact: location.Contact || 'N/A',
        dateTime: finance['Date & Time'] || 'N/A',
        currentPrice: finance['Current Price'] || 'N/A',
        marketCap: finance['Market Cap'] || 'N/A',
        totalRevenue: finance['Total Revenue'] || 'N/A',
        revenueGrowth: finance['Revenue Growth'] || 'N/A',
        profitGrowth: finance['Profit Growth'] || 'N/A',
        dividendRate: dividend['Dividend Rate'] || 'N/A',
        dividendYield: dividend['Dividend Yield'] || 'N/A',
        lastDividendDate: dividend['Date of Last Dividend'] || 'N/A',
        fiveYearAvgDividendYield: dividend['Five Years Average Dividend Yield'] || 'N/A',
        currency: dividend.Currency || 'N/A',
        dailyPerformance: { date: daily.Date || 'N/A', open: daily.Open || 'N/A', high: daily.High || 'N/A', low: daily.Low || 'N/A', close: daily.Close || 'N/A', volume: daily.Volume || 'N/A', adjClose: daily.Adjclose || 'N/A', dividends: daily.Dividends || 'N/A' },
        weeklyPerformance: { date: weekly.Date || 'N/A', open: weekly.Open || 'N/A', high: weekly.High || 'N/A', low: weekly.Low || 'N/A', close: weekly.Close || 'N/A', volume: weekly.Volume || 'N/A', adjClose: weekly.Adjclose || 'N/A', dividends: weekly.Dividends || 'N/A' },
        monthlyPerformance: { date: monthly.Date || 'N/A', open: monthly.Open || 'N/A', high: monthly.High || 'N/A', low: monthly.Low || 'N/A', close: monthly.Close || 'N/A', volume: monthly.Volume || 'N/A', adjClose: monthly.Adjclose || 'N/A', dividends: monthly.Dividends || 'N/A' },
        quarterlyPerformance: { date: quarterly.Date || 'N/A', open: quarterly.Open || 'N/A', high: quarterly.High || 'N/A', low: quarterly.Low || 'N/A', close: quarterly.Close || 'N/A', volume: quarterly.Volume || 'N/A', adjClose: quarterly.Adjclose || 'N/A', dividends: quarterly.Dividends || 'N/A' }
      });
    });

    res.json(financialData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/financial/long
// @desc    Get Financial data (multiple records per company, by performance type)
// @access  Public
router.get('/financial/long', async (req, res) => {
  try {
    const companies = await Company.find({}, { 'Company Name': 1, Firmographics: 1, Financial_Data: 1, Stock_Performance: 1, _id: 0 });

    const financialData = companies.flatMap(company => {
      const firmographics = company.Firmographics?.[0] || {};
      const about = firmographics.About || {};
      const location = firmographics.Location || {};
      const finance = company.Financial_Data?.Finance || {};
      const dividend = company.Financial_Data?.Dividend || {};

      const baseData = {
        companyName: company['Company Name'],
        domain: about.Domain || 'N/A',
        industry: about.Industry || 'N/A',
        fullTimeEmployees: about['Full Time employees'] || 'N/A',
        investorWebsite: finance['Investor Website'] || 'N/A',
        exchange: finance.Exchange || 'N/A',
        address: location.Address || 'N/A',
        city: location.City || 'N/A',
        state: location.State || 'N/A',
        country: location.Country || 'N/A',
        contact: location.Contact || 'N/A',
        dateTime: finance['Date & Time'] || 'N/A',
        currentPrice: finance['Current Price'] || 'N/A',
        marketCap: finance['Market Cap'] || 'N/A',
        totalRevenue: finance['Total Revenue'] || 'N/A',
        revenueGrowth: finance['Revenue Growth'] || 'N/A',
        profitGrowth: finance['Profit Growth'] || 'N/A',
        dividendRate: dividend['Dividend Rate'] || 'N/A',
        dividendYield: dividend['Dividend Yield'] || 'N/A',
        lastDividendDate: dividend['Date of Last Dividend'] || 'N/A',
        fiveYearAvgDividendYield: dividend['Five Years Average Dividend Yield'] || 'N/A',
        currency: dividend.Currency || 'N/A',
      };

      const stockPerformance = company.Stock_Performance || {};
      const performanceTypes = ['Daily', 'Weekly', 'Monthly', 'Quarterly'];
      const allPerformanceRows = [];

      performanceTypes.forEach(type => {
        const performanceArray = stockPerformance[`${type}_Performance`] || [];
        performanceArray.forEach(performanceRecord => {
          allPerformanceRows.push({ ...baseData, performanceType: type, performance: performanceRecord });
        });
      });
      
      // If no performance data was found, return a single record with base data
      if (allPerformanceRows.length === 0) {
        return [{ ...baseData, performanceType: 'N/A', performance: {} }];
      }

      return allPerformanceRows;
    });

    res.json(financialData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/growth
// @desc    Get Growth data for all companies
// @access  Public
router.get('/growth', async (req, res) => {
  try {
    const companies = await Company.find({}, { 'Company Name': 1, Firmographics: 1, Growth: 1, Financial_Data: 1, _id: 0 });

    const growthData = companies.flatMap(company => {
      const about = company.Firmographics?.[0]?.About || {};
      const location = company.Firmographics?.[0]?.Location || {};

      return company.Growth?.map(item => ({
        id: company.Financial_Data?.Finance?.ID || 'N/A',
        companyName: company['Company Name'],
        domain: about.Domain || 'N/A',
        industry: about.Industry || 'N/A',
        country: location.Country || 'N/A',
        period: item.Period,
        endDate: item['End Date'],
        growth: item.Growth !== null ? `${(item.Growth * 100).toFixed(2)}%` : 'N/A'
      })) || [];
    });

    res.json(growthData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/buyergroups
// @desc    Get Buyer Group data for all companies
// @access  Public
router.get('/buyergroups', async (req, res) => {
  try {
    const companies = await Company.find({}, { 'Company Name': 1, Firmographics: 1, Buyers_Group: 1, Financial_Data: 1, _id: 0 });

    const buyerGroupData = companies.flatMap(company => {
      const about = company.Firmographics?.[0]?.About || {};
      const location = company.Firmographics?.[0]?.Location || {};

      return company.Buyers_Group?.map(item => ({
        id: company.Financial_Data?.Finance?.ID || 'N/A',
        uniqueId: `BG-${Math.floor(Math.random() * 100000)}`, // Placeholder
        companyName: company['Company Name'],
        domain: about.Domain || 'N/A',
        industry: about.Industry || 'N/A',
        country: location.Country || 'N/A',
        buyerGroupName: item.Name,
        relation: item.Relation,
        shares: item.Shares,
        description: item.Description,
        date: item.Date
      })) || [];
    });

    res.json(buyerGroupData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/mutualfunds
// @desc    Get Mutual Fund Holders data for all companies
// @access  Public
router.get('/mutualfunds', async (req, res) => {
  try {
    const companies = await Company.find({}, { 'Company Name': 1, Firmographics: 1, Mutual_Fund_Holders: 1, Financial_Data: 1, _id: 0 });
    const mutualFundData = companies.flatMap(company => {
      const about = company.Firmographics?.[0]?.About || {};
      const location = company.Firmographics?.[0]?.Location || {};
      return company.Mutual_Fund_Holders?.map(item => ({ id: company.Financial_Data?.Finance?.ID || 'N/A', uniqueId: `MF-${Math.floor(Math.random() * 100000)}`, companyName: company['Company Name'], domain: about.Domain || 'N/A', industry: about.Industry || 'N/A', country: location.Country || 'N/A', date: item.Date, fundName: item.Name, holding: item.Holding !== null ? `${(item.Holding * 100).toFixed(4)}%` : 'N/A', shares: item.Shares })) || [];
    });
    res.json(mutualFundData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;