import express from 'express';
import { dbService } from '../config/dbService.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// --- CATEGORIES ENDPOINTS ---

// GET /api/products/categories - Fetch all categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await dbService.getCategories();
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to retrieve categories' });
  }
});

// POST /api/products/categories - Create new category (Admin/Manager only)
router.post('/categories', requireAuth, requireRole(['manager', 'admin']), async (req, res) => {
  try {
    const { name, slug, description } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ error: 'Category name and slug are required' });
    }
    const category = await dbService.createCategory(name, slug, description);
    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});


// --- PRODUCTS ENDPOINTS ---

// GET /api/products - Get all active products (optionally filtered by category slug)
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const products = await dbService.getProducts(category);
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to retrieve products' });
  }
});

// GET /api/products/:slug - Get single product details by slug
router.get('/:slug', async (req, res) => {
  try {
    const product = await dbService.getProductBySlug(req.params.slug);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching product detail:', error);
    res.status(500).json({ error: 'Failed to retrieve product details' });
  }
});

// POST /api/products - Create new product (Admin/Manager only)
router.post('/', requireAuth, requireRole(['manager', 'admin']), async (req, res) => {
  try {
    const { category_id, name, slug, description, price, sku, inventory_qty, is_active, images } = req.body;

    if (!name || !slug || price === undefined || !sku) {
      return res.status(400).json({ error: 'Missing required product parameters: name, slug, price, and sku are mandatory' });
    }

    const newProduct = await dbService.createProduct({
      category_id: category_id ? parseInt(category_id, 10) : null,
      name,
      slug,
      description,
      price: parseFloat(price),
      sku,
      inventory_qty: inventory_qty ? parseInt(inventory_qty, 10) : 0,
      is_active: is_active ?? true,
      images: images || []
    });

    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// PUT /api/products/:id - Update product details (Admin/Manager only)
router.put('/:id', requireAuth, requireRole(['manager', 'admin']), async (req, res) => {
  try {
    const { category_id, name, slug, description, price, sku, inventory_qty, is_active, images } = req.body;
    
    const updateData = {};
    if (category_id !== undefined) updateData.category_id = category_id ? parseInt(category_id, 10) : null;
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (sku !== undefined) updateData.sku = sku;
    if (inventory_qty !== undefined) updateData.inventory_qty = parseInt(inventory_qty, 10);
    if (is_active !== undefined) updateData.is_active = is_active;
    if (images !== undefined) updateData.images = images;

    const updated = await dbService.updateProduct(req.params.id, updateData);
    res.json(updated);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// DELETE /api/products/:id - Delete product (Admin/Manager only)
router.delete('/:id', requireAuth, requireRole(['manager', 'admin']), async (req, res) => {
  try {
    await dbService.deleteProduct(req.params.id);
    res.json({ message: 'Product successfully deleted' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;
