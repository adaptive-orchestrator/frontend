// src/pages/ProductDetail/index.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// TODO: Uncomment khi dùng API thật
// import { getProductById } from '@/lib/api/products';
import { Product } from '@/types/product';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ShoppingCart, ArrowLeft, Loader2, AlertTriangle, Zap, Check } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();
  
  const baseURL = import.meta.env.BASE_URL;

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        setLoading(true);
        
        // Dùng ?? để VITE_API_BASE='' không bị fallback
        const API_URL = import.meta.env.VITE_API_BASE ?? import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
        
        try {
          console.log(`[ProductDetail] Fetching product ${id}...`);
          const response = await fetch(`${API_URL}/products/${id}`);
          
          if (response.ok) {
            const data = await response.json();
            const prod = data.product || data;
            console.log('[ProductDetail] Product loaded:', prod);
            setProduct(prod);
            return;
          }
        } catch (apiError) {
          console.warn('[ProductDetail] API failed, using mock data:', apiError);
        }
        
        // Fallback to mock data
        const mockProducts: Product[] = [
          {
            id: 1,
            name: 'Laptop Dell XPS 15',
            description: 'High-performance laptop perfect for professionals and creators. Features Intel Core i7 processor, 16GB RAM, 512GB SSD, and stunning 15.6-inch 4K display. Ideal for video editing, 3D rendering, and demanding applications.',
            price: 1499.99,
            sku: 'DELL-XPS-001',
            category: 'Electronics',
            stock: 15,
            imageUrl: 'https://via.placeholder.com/600x600?text=Dell+XPS+15',
          },
          {
            id: 2,
            name: 'iPhone 15 Pro',
            description: 'Latest iPhone with A17 Pro chip, 256GB storage, Pro camera system with advanced photography features. Titanium design, Action button, and USB-C connectivity.',
            price: 999.99,
            sku: 'APPLE-IP15-001',
            category: 'Electronics',
            stock: 30,
            imageUrl: 'https://via.placeholder.com/600x600?text=iPhone+15',
          },
          {
            id: 3,
            name: 'Sony WH-1000XM5',
            description: 'Industry-leading noise cancellation with Premium wireless headphones. 30-hour battery life, crystal-clear call quality, and multipoint connection.',
            price: 399.99,
            sku: 'SONY-WH-001',
            category: 'Audio',
            stock: 25,
            imageUrl: 'https://via.placeholder.com/600x600?text=Sony+Headphones',
          },
          {
            id: 4,
            name: 'Samsung 4K Monitor',
            description: '32-inch 4K UHD monitor with HDR support. Perfect for content creators and gamers. Features 99% sRGB color gamut and AMD FreeSync.',
            price: 549.99,
            sku: 'SAMSUNG-MON-001',
            category: 'Electronics',
            stock: 12,
            imageUrl: 'https://via.placeholder.com/600x600?text=Samsung+Monitor',
          },
          {
            id: 5,
            name: 'Logitech MX Master 3',
            description: 'Advanced wireless mouse designed for professionals. Ergonomic design, customizable buttons, and MagSpeed scroll wheel.',
            price: 99.99,
            sku: 'LOGI-MX3-001',
            category: 'Accessories',
            stock: 50,
            imageUrl: 'https://via.placeholder.com/600x600?text=Logitech+Mouse',
          },
          {
            id: 6,
            name: 'iPad Pro 12.9"',
            description: 'Powerful tablet with M2 chip and Liquid Retina XDR display. Perfect for creative professionals with Apple Pencil support.',
            price: 1099.99,
            sku: 'APPLE-IPAD-001',
            category: 'Electronics',
            stock: 8,
            imageUrl: 'https://via.placeholder.com/600x600?text=iPad+Pro',
          },
        ];
        
        const foundProduct = mockProducts.find(p => p.id === Number(id));
        if (foundProduct) {
          setProduct(foundProduct);
        } else {
          setError('Product not found');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      navigate(`${baseURL}cart`);
    }
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

  if (error || !product) {
    return (
      <PageLayout>
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-red-500">{error || 'Product not found'}</p>
        <Button onClick={() => navigate('/products')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Button>
      </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
    <div className="container mx-auto px-4 py-8">
      <Button 
        variant="ghost" 
        onClick={() => navigate(`${baseURL}products`)} 
        className="mb-6 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Products
      </Button>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="bg-slate-100 dark:bg-slate-800 rounded-lg aspect-square flex items-center justify-center overflow-hidden hover:shadow-2xl transition-shadow duration-300">
          {product.imageUrl ? (
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className="max-h-full max-w-full object-contain hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                // Fallback về logo khi ảnh lỗi
                const logo = `${baseURL}logo.png`;
                e.currentTarget.src = logo;
                e.currentTarget.className = "w-32 h-32 object-contain";
              }}
            />
          ) : (
            <img
              src={`${baseURL}logo.png`}
              alt="Nexora Logo"
              className="w-32 h-32 object-contain"
            />
          )}
        </div>

        <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="text-3xl text-slate-800 dark:text-slate-100">{product.name}</CardTitle>
            <CardDescription>
              {product.category && (
                <span className="text-sm px-3 py-1 rounded-full font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                  {product.category}
                </span>
              )}
              {product.sku && (
                <span className="text-sm text-slate-500 dark:text-slate-400 ml-2">SKU: {product.sku}</span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-4xl font-bold text-purple-600 dark:text-purple-400">${product.price.toFixed(2)}</div>
            
            {product.stock !== undefined && (
              <div className="text-sm">
                <span className={`flex items-center gap-1 ${
                  product.stock === 0 
                    ? 'text-red-600 dark:text-red-400 font-semibold' 
                    : product.stock < 10 
                    ? 'text-orange-600 dark:text-orange-400 font-medium' 
                    : 'text-green-600 dark:text-green-400'
                }`}>
                  {product.stock === 0 ? <><AlertTriangle className="h-4 w-4" /> Out of Stock</> : product.stock < 10 ? <><Zap className="h-4 w-4" /> Only {product.stock} left</> : <><Check className="h-4 w-4" /> {product.stock} in stock</>}
                </span>
              </div>
            )}

            <div>
              <h3 className="font-semibold mb-2 text-slate-800 dark:text-slate-100">Description</h3>
              <p className="text-slate-600 dark:text-slate-400">
                {product.description || 'No description available'}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <label htmlFor="quantity" className="font-semibold text-slate-800 dark:text-slate-100">
                Quantity:
              </label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max={product.stock || 999}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-24"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="w-full bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all"
              size="lg"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Add to Cart
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
    </div>
    </PageLayout>
  );
}
