const request = require('supertest');
const { app, server } = require('../src/server');

describe('Currency Converter API', () => {
  afterAll((done) => {
    server.close(done);
  });

  describe('GET /health', () => {
    it('should return 200 and healthy status', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('service', 'currency-converter');
    });

    it('should return valid ISO timestamp', async () => {
      const response = await request(app).get('/health');
      
      const timestamp = new Date(response.body.timestamp);
      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.toString()).not.toBe('Invalid Date');
    });
  });

  describe('GET /rates', () => {
    it('should return 200 and exchange rates', async () => {
      const response = await request(app).get('/rates');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('rates');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('base_currencies');
    });

    it('should return valid exchange rates structure', async () => {
      const response = await request(app).get('/rates');
      
      expect(typeof response.body.rates).toBe('object');
      expect(Array.isArray(response.body.base_currencies)).toBe(true);
      expect(response.body.base_currencies.length).toBeGreaterThan(0);
    });
  });

  describe('GET /convert/:from/:to/:amount', () => {
    it('should convert USD to EUR successfully', async () => {
      const response = await request(app).get('/convert/USD/EUR/100');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('from', 'USD');
      expect(response.body).toHaveProperty('to', 'EUR');
      expect(response.body).toHaveProperty('original_amount', 100);
      expect(response.body).toHaveProperty('converted_amount');
      expect(response.body).toHaveProperty('exchange_rate');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should handle invalid amount', async () => {
      const response = await request(app).get('/convert/USD/EUR/invalid');
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle unsupported currency', async () => {
      const response = await request(app).get('/convert/XYZ/EUR/100');
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('supported_currencies');
    });

    it('should handle unavailable conversion pair', async () => {
      const response = await request(app).get('/convert/USD/XYZ/100');
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /convert', () => {
    it('should convert currency via POST request', async () => {
      const response = await request(app)
        .post('/convert')
        .send({
          from: 'USD',
          to: 'EUR',
          amount: 100
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('from', 'USD');
      expect(response.body).toHaveProperty('to', 'EUR');
      expect(response.body).toHaveProperty('original_amount', 100);
      expect(response.body).toHaveProperty('converted_amount');
    });

    it('should handle missing fields in POST request', async () => {
      const response = await request(app)
        .post('/convert')
        .send({
          from: 'USD'
          // missing 'to' and 'amount'
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle invalid amount in POST request', async () => {
      const response = await request(app)
        .post('/convert')
        .send({
          from: 'USD',
          to: 'EUR',
          amount: -100
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });
});