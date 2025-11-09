// src/pages/Admin/Products/index.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2, Package, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import PageLayout from '@/components/layout/PageLayout';
import { getAllProducts, createProduct, createInventory, getAllInventory, adjustStock } from '@/lib/api/products';

const DEMO_MODE = import.meta.env.VITE_ENABLE_DEMO_MODE === 'true';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  status: string;
  supplier?: string;
  sku?: string;
}

interface CatalogueProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  category?: string;
  sku?: string;
  isActive: boolean;
}

interface InventoryItem {
  id: number;
  productId: number;
  quantity: number;
  warehouseLocation?: string;
  reorderLevel?: number;
  maxCapacity?: number;
}

export default function AdminProducts() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isStockDialogOpen, setIsStockDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  // Form states for new product
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    supplier: '',
    sku: ''
  });

  // Stock update state
  const [stockUpdate, setStockUpdate] = useState({
    quantity: '',
    note: ''
  });

  // Mock products data for DEMO mode
  const DEMO_PRODUCTS: Product[] = [
    { id: 1, name: 'Laptop Dell XPS 15', description: 'High-performance laptop', price: 1499.99, stock: 15, category: 'Electronics', status: 'Active', supplier: 'Dell Inc', sku: 'DELL-XPS15-001' },
    { id: 2, name: 'iPhone 15 Pro', description: 'Latest iPhone model', price: 999.99, stock: 30, category: 'Electronics', status: 'Active', supplier: 'Apple', sku: 'APPL-IP15P-001' },
    { id: 3, name: 'Sony WH-1000XM5', description: 'Noise-cancelling headphones', price: 399.99, stock: 25, category: 'Audio', status: 'Active', supplier: 'Sony', sku: 'SONY-WH1000-001' },
    { id: 4, name: 'Samsung 4K Monitor', description: '27-inch 4K display', price: 549.99, stock: 12, category: 'Electronics', status: 'Active', supplier: 'Samsung', sku: 'SAMS-MON4K-001' },
    { id: 5, name: 'Logitech MX Master 3', description: 'Wireless mouse', price: 99.99, stock: 50, category: 'Accessories', status: 'Active', supplier: 'Logitech', sku: 'LOGI-MXM3-001' },
    { id: 6, name: 'iPad Pro 12.9"', description: 'Professional tablet', price: 1099.99, stock: 8, category: 'Electronics', status: 'Low Stock', supplier: 'Apple', sku: 'APPL-IPADP-001' },
  ];

  // Fetch products from API on mount (only in production mode)
  useEffect(() => {
    if (DEMO_MODE) {
      // Use demo data
      setProducts(DEMO_PRODUCTS);
    } else {
      // Fetch from API
      fetchProducts();
    }
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      
      // Fetch catalogue products and inventory in parallel
      const [catalogueData, inventoryData] = await Promise.all([
        getAllProducts(),
        getAllInventory()
      ]);

      // Merge catalogue and inventory data
      const mergedProducts: Product[] = catalogueData.products.map((product: CatalogueProduct) => {
        const inventory = inventoryData.items.find((inv: InventoryItem) => inv.productId === product.id);
        const stock = inventory?.quantity || 0;
        
        return {
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          stock: stock,
          category: product.category || 'Uncategorized',
          status: stock < 10 ? 'Low Stock' : 'Active',
          sku: product.sku || `SKU-${product.id}`,
          supplier: '-'
        };
      });

      setProducts(mergedProducts);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      alert('Không thể tải danh sách sản phẩm: ' + (error.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate stats
  const totalProducts = products.length;
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
  const lowStockCount = products.filter(p => p.stock < 10).length;
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.stock) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    // DEMO mode: Add locally
    if (DEMO_MODE) {
      const product: Product = {
        id: products.length + 1,
        name: newProduct.name,
        description: newProduct.description,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock),
        category: newProduct.category,
        status: 'Active',
        supplier: newProduct.supplier,
        sku: newProduct.sku || `SKU-${Date.now()}`
      };

      setProducts([...products, product]);
      setNewProduct({ name: '', description: '', price: '', stock: '', category: '', supplier: '', sku: '' });
      setIsAddDialogOpen(false);
      alert('Thêm sản phẩm mới thành công! (Demo Mode)');
      return;
    }

    // PRODUCTION mode: Call API
    try {
      setIsLoading(true);

      // Step 1: Create product in catalogue
      const catalogueProduct = await createProduct({
        name: newProduct.name,
        description: newProduct.description,
        price: parseFloat(newProduct.price),
        category: newProduct.category || undefined,
        sku: newProduct.sku || undefined,
        isActive: true
      });

      console.log('Product created in catalogue:', catalogueProduct);

      // Step 2: Create inventory for the product
      const inventoryItem = await createInventory({
        productId: catalogueProduct.product.id,
        quantity: parseInt(newProduct.stock),
        warehouseLocation: 'Main Warehouse',
        reorderLevel: 10,
        maxCapacity: 1000
      });

      console.log('Inventory created:', inventoryItem);

      // Step 3: Refresh product list
      await fetchProducts();

      // Reset form and close dialog
      setNewProduct({ name: '', description: '', price: '', stock: '', category: '', supplier: '', sku: '' });
      setIsAddDialogOpen(false);
      alert('Thêm sản phẩm mới thành công!');
    } catch (error: any) {
      console.error('Error creating product:', error);
      alert('Lỗi khi thêm sản phẩm: ' + (error.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStock = async () => {
    if (!selectedProduct || !stockUpdate.quantity) {
      alert('Vui lòng nhập số lượng!');
      return;
    }

    const quantity = parseInt(stockUpdate.quantity);

    // DEMO mode: Update locally
    if (DEMO_MODE) {
      const updatedProducts = products.map(p => {
        if (p.id === selectedProduct.id) {
          const newStock = p.stock + quantity;
          return {
            ...p,
            stock: newStock,
            status: newStock < 10 ? 'Low Stock' : 'Active'
          };
        }
        return p;
      });

      setProducts(updatedProducts);
      setStockUpdate({ quantity: '', note: '' });
      setIsStockDialogOpen(false);
      alert(`Cập nhật kho thành công! ${quantity > 0 ? 'Nhập' : 'Xuất'} ${Math.abs(quantity)} sản phẩm (Demo Mode)`);
      return;
    }

    // PRODUCTION mode: Call API
    try {
      setIsLoading(true);

      await adjustStock(selectedProduct.id, {
        quantity: quantity,
        reason: stockUpdate.note || 'Manual adjustment',
        adjustmentType: quantity > 0 ? 'restock' : 'sale'
      });

      // Refresh product list
      await fetchProducts();

      setStockUpdate({ quantity: '', note: '' });
      setIsStockDialogOpen(false);
      alert(`Cập nhật kho thành công! ${quantity > 0 ? 'Nhập' : 'Xuất'} ${Math.abs(quantity)} sản phẩm`);
    } catch (error: any) {
      console.error('Error updating stock:', error);
      alert('Lỗi khi cập nhật kho: ' + (error.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const openStockDialog = (product: Product) => {
    setSelectedProduct(product);
    setIsStockDialogOpen(true);
  };

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">Quản Lý Sản Phẩm (Retail)</h1>
            <p className="text-muted-foreground">
              {DEMO_MODE ? 'Demo Mode - Dữ liệu giả' : 'Production Mode - Dữ liệu thực từ API'}
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600" disabled={isLoading}>
                <Plus className="h-4 w-4" />
                Thêm Sản Phẩm Mới
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Thêm Sản Phẩm Mới Vào Kho</DialogTitle>
                <DialogDescription>
                  Nhập thông tin sản phẩm mới và số lượng nhập kho
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tên sản phẩm *</label>
                  <Input
                    placeholder="VD: Laptop Dell XPS 15"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">SKU</label>
                  <Input
                    placeholder="Mã SKU tự động"
                    value={newProduct.sku}
                    onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-medium">Mô tả</label>
                  <Input
                    placeholder="Mô tả chi tiết sản phẩm"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Danh mục</label>
                  <Input
                    placeholder="VD: Electronics"
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nhà cung cấp</label>
                  <Input
                    placeholder="Tên nhà cung cấp"
                    value={newProduct.supplier}
                    onChange={(e) => setNewProduct({...newProduct, supplier: e.target.value})}
                    disabled={!DEMO_MODE}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Giá bán *</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Số lượng nhập *</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Hủy</Button>
                <Button onClick={handleAddProduct} disabled={isLoading}>
                  {isLoading ? 'Đang xử lý...' : 'Thêm Sản Phẩm'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tổng sản phẩm</p>
                  <p className="text-2xl font-bold">{totalProducts}</p>
                </div>
                <Package className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tổng tồn kho</p>
                  <p className="text-2xl font-bold">{totalStock}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Giá trị kho</p>
                  <p className="text-2xl font-bold">${totalValue.toFixed(0)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Sắp hết hàng</p>
                  <p className="text-2xl font-bold text-orange-500">{lowStockCount}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm sản phẩm theo tên hoặc danh mục..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle>Danh Sách Sản Phẩm ({filteredProducts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && products.length === 0 ? (
              <div className="text-center py-8">
                <p>Đang tải dữ liệu...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">SKU</th>
                      <th className="text-left py-3 px-4">Tên sản phẩm</th>
                      <th className="text-left py-3 px-4">Danh mục</th>
                      <th className="text-left py-3 px-4">Giá</th>
                      <th className="text-left py-3 px-4">Tồn kho</th>
                      <th className="text-left py-3 px-4">Nhà cung cấp</th>
                      <th className="text-left py-3 px-4">Trạng thái</th>
                      <th className="text-left py-3 px-4">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 text-xs text-muted-foreground">{product.sku}</td>
                        <td className="py-3 px-4 font-medium">{product.name}</td>
                        <td className="py-3 px-4">{product.category}</td>
                        <td className="py-3 px-4">${product.price.toFixed(2)}</td>
                        <td className="py-3 px-4">
                          <span className={product.stock < 10 ? 'text-orange-600 font-bold' : ''}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm">{product.supplier || '-'}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            product.status === 'Active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {product.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => openStockDialog(product)}
                              title="Cập nhật kho"
                            >
                              <Package className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stock Update Dialog */}
        <Dialog open={isStockDialogOpen} onOpenChange={setIsStockDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cập Nhật Kho Hàng</DialogTitle>
              <DialogDescription>
                {selectedProduct && `Sản phẩm: ${selectedProduct.name} (Tồn kho hiện tại: ${selectedProduct.stock})`}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Số lượng (nhập số dương để thêm, số âm để xuất)</label>
                <Input
                  type="number"
                  placeholder="+10 hoặc -5"
                  value={stockUpdate.quantity}
                  onChange={(e) => setStockUpdate({...stockUpdate, quantity: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Ghi chú</label>
                <Input
                  placeholder="VD: Nhập từ nhà cung cấp ABC"
                  value={stockUpdate.note}
                  onChange={(e) => setStockUpdate({...stockUpdate, note: e.target.value})}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsStockDialogOpen(false)}>Hủy</Button>
              <Button onClick={handleUpdateStock} disabled={isLoading}>
                {isLoading ? 'Đang xử lý...' : 'Cập Nhật'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  );
}
