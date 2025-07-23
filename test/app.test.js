const request = require('supertest');
const app = require('../src/app/index');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Helper to create a product for tests
const createTestProduct = async (overrides = {}) => {
  return await prisma.product.create({
    data: {
      sku: overrides.sku || `SKU${Date.now()}`,
      name: overrides.name || 'Test Product',
      description: overrides.description || 'Test Description',
      price: overrides.price || 9.99,
      status: overrides.status || 'DRAFT',
    },
  });
};

describe('API v1 Products', () => {
  let product;

  beforeAll(async () => {
    // Clean up and create a product for testing
    await prisma.product.deleteMany();
    product = await createTestProduct();
  });

  afterAll(async () => {
    await prisma.product.deleteMany();
    await prisma.$disconnect();
  });

  describe('POST /api/v1/products', () => {
    it('should create a product (success)', async () => {
      const res = await request(app)
        .post('/api/v1/products')
        .send({
          name: 'New Product',
          description: 'A new product',
          price: 19.99,
          sku: `SKU${Date.now()}`,
        });
      expect(res.statusCode).toBe(201);
      expect(res.body.message).toMatch(/Created Successfully/);
      expect(res.body.data).toHaveProperty('id');
    });

    it('should fail with missing fields (error)', async () => {
      const res = await request(app)
        .post('/api/v1/products')
        .send({ name: 'Incomplete' });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/Validation Error/);
    });
  });

  describe('GET /api/v1/products', () => {
    it('should get all products (success)', async () => {
      const res = await request(app).get('/api/v1/products');
      expect(res.statusCode).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
    });
    it('should fail with invalid fields (error)', async () => {
      const res = await request(app).get('/api/v1/products?fields=invalid');
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/Invalid fields/);
    });
  });

  describe('GET /api/v1/products/:id', () => {
    it('should get a product by id (success)', async () => {
      const res = await request(app).get(`/api/v1/products/${product.id}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveProperty('id', product.id);
    });
    it('should fail for non-existent id (error)', async () => {
      const res = await request(app).get('/api/v1/products/nonexistentid');
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toMatch(/not found/i);
    });
    it('should fail for invalid fields (error)', async () => {
      const res = await request(app).get(`/api/v1/products/${product.id}?fields=invalid`);
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/Invalid fields/);
    });
  });

  describe('PUT /api/v1/products/:id', () => {
    it('should update a product (success)', async () => {
      const res = await request(app)
        .put(`/api/v1/products/${product.id}`)
        .send({ name: 'Updated Name' });
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toMatch(/Updated Successfully/);
    });
    it('should fail with invalid id (error)', async () => {
      const res = await request(app)
        .put('/api/v1/products/nonexistentid')
        .send({ name: 'Name' });
      expect(res.statusCode).toBe(500); // Service throws 500 on update fail
      expect(res.body.message).toMatch(/update failed|error/i);
    });
    it('should fail with invalid body (error)', async () => {
      const res = await request(app)
        .put(`/api/v1/products/${product.id}`)
        .send({ price: 'not-a-number' });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/Validation Error/);
    });
  });

  describe('DELETE /api/v1/products/:id', () => {
    it('should delete a product (success)', async () => {
      const tempProduct = await createTestProduct({ sku: `SKU${Date.now()}-del` });
      const res = await request(app).delete(`/api/v1/products/${tempProduct.id}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toMatch(/Deleted Successfully/);
    });
    it('should fail with invalid id (error)', async () => {
      const res = await request(app).delete('/api/v1/products/nonexistentid');
      expect(res.statusCode).toBe(500); // Service throws 500 on delete fail
      expect(res.body.message).toMatch(/not deleted|delete failed|error/i);
    });
  });
});