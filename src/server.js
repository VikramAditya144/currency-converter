const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Mock exchange rates (in production, you'd fetch from an API like exchangerate-api.com)
const exchangeRates = {
  USD: { EUR: 0.85, GBP: 0.73, JPY: 110.0, INR: 74.5, CAD: 1.25 },
  EUR: { USD: 1.18, GBP: 0.86, JPY: 129.5, INR: 87.8, CAD: 1.47 },
  GBP: { USD: 1.37, EUR: 1.16, JPY: 150.8, INR: 102.1, CAD: 1.71 },
  JPY: { USD: 0.0091, EUR: 0.0077, GBP: 0.0066, INR: 0.68, CAD: 0.011 },
  INR: { USD: 0.013, EUR: 0.011, GBP: 0.0098, JPY: 1.47, CAD: 0.017 },
  CAD: { USD: 0.80, EUR: 0.68, GBP: 0.58, JPY: 88.0, INR: 59.6 }
};

app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'currency-converter'
  });
});

app.get('/rates', (req, res) => {
  res.status(200).json({
    rates: exchangeRates,
    timestamp: new Date().toISOString(),
    base_currencies: Object.keys(exchangeRates)
  });
});

app.get('/convert/:from/:to/:amount', (req, res) => {
  const { from, to, amount } = req.params;
  const numAmount = parseFloat(amount);

  if (isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({
      error: 'Invalid amount. Please provide a positive number.',
      timestamp: new Date().toISOString()
    });
  }

  const fromCurrency = from.toUpperCase();
  const toCurrency = to.toUpperCase();

  if (!exchangeRates[fromCurrency]) {
    return res.status(400).json({
      error: `Unsupported currency: ${fromCurrency}`,
      supported_currencies: Object.keys(exchangeRates),
      timestamp: new Date().toISOString()
    });
  }

  if (!exchangeRates[fromCurrency][toCurrency]) {
    return res.status(400).json({
      error: `Conversion from ${fromCurrency} to ${toCurrency} not available`,
      available_conversions: Object.keys(exchangeRates[fromCurrency]),
      timestamp: new Date().toISOString()
    });
  }

  const rate = exchangeRates[fromCurrency][toCurrency];
  const convertedAmount = numAmount * rate;

  res.status(200).json({
    from: fromCurrency,
    to: toCurrency,
    original_amount: numAmount,
    converted_amount: parseFloat(convertedAmount.toFixed(4)),
    exchange_rate: rate,
    timestamp: new Date().toISOString()
  });
});

app.post('/convert', (req, res) => {
  const { from, to, amount } = req.body;

  if (!from || !to || amount === undefined) {
    return res.status(400).json({
      error: 'Missing required fields: from, to, amount',
      timestamp: new Date().toISOString()
    });
  }

  const numAmount = parseFloat(amount);

  if (isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({
      error: 'Invalid amount. Please provide a positive number.',
      timestamp: new Date().toISOString()
    });
  }

  const fromCurrency = from.toUpperCase();
  const toCurrency = to.toUpperCase();

  if (!exchangeRates[fromCurrency]) {
    return res.status(400).json({
      error: `Unsupported currency: ${fromCurrency}`,
      supported_currencies: Object.keys(exchangeRates),
      timestamp: new Date().toISOString()
    });
  }

  if (!exchangeRates[fromCurrency][toCurrency]) {
    return res.status(400).json({
      error: `Conversion from ${fromCurrency} to ${toCurrency} not available`,
      available_conversions: Object.keys(exchangeRates[fromCurrency]),
      timestamp: new Date().toISOString()
    });
  }

  const rate = exchangeRates[fromCurrency][toCurrency];
  const convertedAmount = numAmount * rate;

  res.status(200).json({
    from: fromCurrency,
    to: toCurrency,
    original_amount: numAmount,
    converted_amount: parseFloat(convertedAmount.toFixed(4)),
    exchange_rate: rate,
    timestamp: new Date().toISOString()
  });
});

const server = app.listen(PORT, () => {
  console.log(`Currency converter server running on port ${PORT}`);
});

module.exports = { app, server };