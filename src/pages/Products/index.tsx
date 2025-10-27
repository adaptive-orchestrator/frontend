// src/pages/Products/index.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
// TODO: Uncomment khi dùng API thật
// import { getAllProducts } from '@/lib/api/products';
import { Product } from '@/types/product';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Loader2 } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';

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
        
        // TODO: Uncomment để gọi API thật
        // const data = await getAllProducts();
        // setProducts(data.products || data);
        
        // Mock data cho demo
        const mockProducts: Product[] = [
          {
            id: 1,
            name: 'Laptop Dell XPS 15',
            description: 'High-performance laptop with Intel i7 processor, 16GB RAM, 512GB SSD',
            price: 1499.99,
            sku: 'DELL-XPS-001',
            category: 'Electronics',
            stock: 15,
            imageUrl: 'https://via.placeholder.com/300x300?text=Dell+XPS+15',
          },
          {
            id: 2,
            name: 'iPhone 15 Pro',
            description: 'Latest iPhone with A17 Pro chip, 256GB storage, Pro camera system',
            price: 999.99,
            sku: 'APPLE-IP15-001',
            category: 'Electronics',
            stock: 30,
            imageUrl: 'https://via.placeholder.com/300x300?text=iPhone+15',
          },
          {
            id: 3,
            name: 'Sony WH-1000XM5',
            description: 'Premium wireless noise-canceling headphones',
            price: 399.99,
            sku: 'SONY-WH-001',
            category: 'Audio',
            stock: 25,
            imageUrl: 'https://via.placeholder.com/300x300?text=Sony+Headphones',
          },
          {
            id: 4,
            name: 'Samsung 4K Monitor',
            description: '32-inch 4K UHD monitor with HDR support',
            price: 549.99,
            sku: 'SAMSUNG-MON-001',
            category: 'Electronics',
            stock: 12,
          },
          {
            id: 5,
            name: 'Logitech MX Master 3',
            description: 'Advanced wireless mouse for professionals',
            price: 99.99,
            sku: 'LOGI-MX3-001',
            category: 'Accessories',
            stock: 50,
          },
          {
            id: 6,
            name: 'iPad Pro 12.9"',
            description: 'Powerful tablet with M2 chip and Liquid Retina display',
            price: 1099.99,
            sku: 'APPLE-IPAD-001',
            category: 'Electronics',
            stock: 8,
          },
        ];
        
        setProducts(mockProducts);
      } catch (err: any) {
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

  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-blue-950/20 dark:via-cyan-950/20 dark:to-teal-950/20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Retail Products
              </h1>
              <p className="text-muted-foreground mt-2">
                🛒 Mua sắm sản phẩm - Thanh toán một lần
              </p>
            </div>
            <Link to={`${baseURL}cart`}>
              <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
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
                <Card key={product.id} className="flex flex-col hover:shadow-xl transition-shadow border-blue-200 dark:border-blue-800">
                  <CardHeader>
                    <CardTitle className="text-blue-600 dark:text-blue-400">{product.name}</CardTitle>
                    <CardDescription>
                      {product.category && (
                        <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded">
                          {product.category}
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {product.description || 'No description available'}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        ${product.price.toFixed(2)}
                      </span>
                      {product.stock !== undefined && (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Stock: {product.stock}
                        </span>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Link to={`${baseURL}products/${product.id}`} className="flex-1">
                      <Button variant="outline" className="w-full border-blue-300 text-blue-600 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-950/20">
                        View Details
                      </Button>
                    </Link>
                    <Button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
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
