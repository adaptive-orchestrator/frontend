// src/pages/Products/index.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllProducts, getAllInventory } from '@/lib/api/products';
import { Product } from '@/types/product';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Loader2 } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import Cookies from 'js-cookie';

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();
  
  const baseURL = import.meta.env.BASE_URL;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const token = Cookies.get('token');
        
        // Check if authenticated - call real API
        if (token) {
          console.log('[Products] Authenticated - Fetching products from API...');
          
          // Fetch products and inventory in parallel
          const [productsData, inventoryData] = await Promise.all([
            getAllProducts(),
            getAllInventory()
          ]);
          
          console.log('[Products] Products:', productsData);
          console.log('[Products] Inventory:', inventoryData);
          
          // Map products with inventory stock
          const productsArray = productsData.products || [];
          const inventoryMap = new Map(
            (inventoryData.items || []).map((inv: any) => [inv.productId, inv.quantity - inv.reserved])
          );
          
          const productsWithStock = productsArray.map((product: any) => ({
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            sku: product.sku,
            category: product.category,
            stock: inventoryMap.get(product.id) || 0,
            imageUrl: product.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&size=300&background=random`,
          }));
          
          setProducts(productsWithStock);
          console.log('[Products] Products with stock:', productsWithStock);
        } else {
          console.log('[Products] Demo mode - Using mock data');
          // Demo mode - Mock data
          const mockProducts: Product[] = [
            {
              id: 1,
              name: 'Laptop Dell XPS 15',
              description: 'High-performance laptop with Intel i7 processor, 16GB RAM, 512GB SSD',
              price: 1499.99,
              sku: 'DELL-XPS-001',
              category: 'Electronics',
              stock: 15,
              imageUrl: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=300&h=300&fit=crop',
            },
            {
              id: 2,
              name: 'iPhone 15 Pro',
              description: 'Latest iPhone with A17 Pro chip, 256GB storage, Pro camera system',
              price: 999.99,
              sku: 'APPLE-IP15-001',
              category: 'Electronics',
              stock: 30,
              imageUrl: 'https://images.unsplash.com/photo-1592286927505-24cdf4a46b5c?w=300&h=300&fit=crop',
            },
            {
              id: 3,
              name: 'Sony WH-1000XM5',
              description: 'Premium wireless noise-canceling headphones',
              price: 399.99,
              sku: 'SONY-WH-001',
              category: 'Audio',
              stock: 25,
              imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=300&h=300&fit=crop',
            },
            {
              id: 4,
              name: 'Samsung 4K Monitor',
              description: '32-inch 4K UHD monitor with HDR support',
              price: 549.99,
              sku: 'SAMSUNG-MON-001',
              category: 'Electronics',
              stock: 12,
              imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=300&h=300&fit=crop',
            },
            {
              id: 5,
              name: 'Logitech MX Master 3',
              description: 'Advanced wireless mouse for professionals',
              price: 99.99,
              sku: 'LOGI-MX3-001',
              category: 'Accessories',
              stock: 50,
              imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&h=300&fit=crop',
            },
            {
              id: 6,
              name: 'iPad Pro 12.9"',
              description: 'Powerful tablet with M2 chip and Liquid Retina display',
              price: 1099.99,
              sku: 'APPLE-IPAD-001',
              category: 'Electronics',
              stock: 8,
              imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300&h=300&fit=crop',
            },
          ];
          
          setProducts(mockProducts);
        }
      } catch (err: any) {
        console.error('[Products] Error fetching products:', err);
        setError(err.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-red-500">{error}</p>
        </div>
      </PageLayout>
    );
  }

  // Helper function để lấy màu theo category
  const getCategoryColor = (category?: string) => {
    const colors: Record<string, string> = {
      'Electronics': 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
      'Audio': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
      'Accessories': 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
      'default': 'bg-slate-100 dark:bg-slate-800/30 text-slate-700 dark:text-slate-300'
    };
    return colors[category || 'default'] || colors['default'];
  };

  // Helper function để lấy màu stock status
  const getStockColor = (stock: number) => {
    if (stock === 0) return 'text-red-600 dark:text-red-400 font-semibold';
    if (stock < 10) return 'text-orange-600 dark:text-orange-400 font-medium';
    return 'text-green-600 dark:text-green-400';
  };

  return (
    <PageLayout>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-indigo-700 dark:text-indigo-400">
                Retail Products
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Mua sắm sản phẩm - Thanh toán một lần
              </p>
            </div>
            <Link to={`${baseURL}cart`}>
              <Button className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 shadow-lg">
                <ShoppingCart className="h-5 w-5 mr-2" />
                View Cart
              </Button>
            </Link>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No products available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="flex flex-col hover:shadow-2xl hover:scale-105 transition-all duration-300 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                  {/* Product Image */}
                  <div className="relative w-full h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden rounded-t-lg">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          // Fallback về logo khi ảnh lỗi
                          const logo = `${baseURL}logo.png`;
                          e.currentTarget.src = logo;
                          e.currentTarget.className = "w-20 h-20 object-contain mx-auto my-14";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <img
                          src={`${baseURL}logo.png`}
                          alt="Nexora Logo"
                          className="w-20 h-20 object-contain"
                        />
                      </div>
                    )}
                  </div>
                  
                  <CardHeader>
                    <CardTitle className="text-slate-800 dark:text-slate-100">{product.name}</CardTitle>
                    <CardDescription>
                      {product.category && (
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getCategoryColor(product.category)}`}>
                          {product.category}
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {product.description || 'No description available'}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        ${product.price.toFixed(2)}
                      </span>
                      {product.stock !== undefined && (
                        <span className={`text-sm ${getStockColor(product.stock)}`}>
                          {product.stock === 0 ? 'Out of Stock' : product.stock < 10 ? `Only ${product.stock}` : `${product.stock} in stock`}
                        </span>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Link to={`${baseURL}products/${product.id}`} className="flex-1">
                      <Button variant="outline" className="w-full border-indigo-300 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-700 dark:text-indigo-400 dark:hover:bg-indigo-950/20 transition-colors">
                        View
                      </Button>
                    </Link>
                    <Button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all"
                    >
                      <ShoppingCart className="h-4 w-4 mr-1.5" />
                      Add
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
