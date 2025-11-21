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
import { ShoppingCart, ArrowLeft, Loader2 } from 'lucide-react';
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
        
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        
        try {
          console.log(`📥 Fetching product ${id}...`);
          const response = await fetch(`${API_URL}/products/${id}`);
          
          if (response.ok) {
            const data = await response.json();
            const prod = data.product || data;
            console.log('✅ Product loaded:', prod);
            setProduct(prod);
            return;
          }
        } catch (apiError) {
          console.warn('⚠️ API failed, using mock data:', apiError);
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
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => navigate(`${baseURL}products`)} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Products
      </Button>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-gray-100 rounded-lg aspect-square flex items-center justify-center">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="max-h-full max-w-full object-contain" />
          ) : (
            <p className="text-gray-400">No image available</p>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">{product.name}</CardTitle>
            <CardDescription>
              {product.category && (
                <span className="text-sm bg-gray-100 px-3 py-1 rounded">
                  {product.category}
                </span>
              )}
              {product.sku && (
                <span className="text-sm text-gray-500 ml-2">SKU: {product.sku}</span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-4xl font-bold">${product.price.toFixed(2)}</div>
            
            {product.stock !== undefined && (
              <div className="text-sm">
                <span className={product.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
              </div>
            )}

            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-gray-600">
                {product.description || 'No description available'}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <label htmlFor="quantity" className="font-semibold">
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
              className="w-full"
              size="lg"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Add to Cart
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
    </PageLayout>
  );
}
