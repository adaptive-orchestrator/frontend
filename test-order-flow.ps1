# Test Order Flow Script
# This script tests the complete order creation flow from frontend to backend

Write-Host "🧪 Testing Order Flow - Retail Model" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$API_BASE = "http://localhost:3000"
$CUSTOMER_ID = 1

# Colors
function Write-Success { Write-Host "✅ $args" -ForegroundColor Green }
function Write-Error { Write-Host "❌ $args" -ForegroundColor Red }
function Write-Info { Write-Host "ℹ️  $args" -ForegroundColor Yellow }
function Write-Step { Write-Host "📍 $args" -ForegroundColor Cyan }

# Check prerequisites
Write-Step "Step 0: Checking prerequisites..."

# Check if services are running
$services = @(
    @{Name="API Gateway"; Port=3000},
    @{Name="Order Service"; Port=50057},
    @{Name="Inventory Service"; Port=50059},
    @{Name="Billing Service"; Port=50060}
)

$allRunning = $true
foreach ($svc in $services) {
    $result = Test-NetConnection -ComputerName localhost -Port $svc.Port -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
    if ($result.TcpTestSucceeded) {
        Write-Success "$($svc.Name) is running on port $($svc.Port)"
    } else {
        Write-Error "$($svc.Name) is NOT running on port $($svc.Port)"
        $allRunning = $false
    }
}

if (-not $allRunning) {
    Write-Error "Some services are not running. Please start them first."
    Write-Info "Run: npm run start:dev order-svc api-gateway inventory-svc billing-svc"
    exit 1
}

Write-Host ""

# Step 1: Get authentication token (if needed)
Write-Step "Step 1: Authentication (optional - using customer ID: $CUSTOMER_ID)"
Write-Info "In production, you would login first to get a JWT token"
Write-Info "For testing, we'll use customer ID directly"
Write-Host ""

# Step 2: Create order
Write-Step "Step 2: Creating order..."

$orderPayload = @{
    customerId = $CUSTOMER_ID
    items = @(
        @{
            productId = 1
            quantity = 2
            price = 99.99
        },
        @{
            productId = 2
            quantity = 1
            price = 149.99
        }
    )
    shippingAddress = "123 Test Street, Test City, TC 12345"
    billingAddress = "123 Test Street, Test City, TC 12345"
    notes = "Test order from PowerShell script"
} | ConvertTo-Json -Depth 10

Write-Info "Order payload:"
Write-Host $orderPayload
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "$API_BASE/orders" -Method POST -Body $orderPayload -ContentType "application/json"
    
    if ($response.order) {
        $order = $response.order
        Write-Success "Order created successfully!"
        Write-Host "  Order ID: $($order.id)" -ForegroundColor White
        Write-Host "  Order Number: $($order.orderNumber)" -ForegroundColor White
        Write-Host "  Status: $($order.status)" -ForegroundColor White
        Write-Host "  Total Amount: `$$($order.totalAmount)" -ForegroundColor White
        Write-Host "  Items Count: $($order.items.Count)" -ForegroundColor White
        Write-Host ""
        
        $orderId = $order.id
        
        # Step 3: Verify order in database
        Write-Step "Step 3: Verifying order in backend..."
        Write-Info "Waiting 2 seconds for event processing..."
        Start-Sleep -Seconds 2
        
        try {
            $verifyResponse = Invoke-RestMethod -Uri "$API_BASE/orders/$orderId" -Method GET
            if ($verifyResponse.order) {
                Write-Success "Order verified in database"
                Write-Host "  Status: $($verifyResponse.order.status)" -ForegroundColor White
            }
        } catch {
            Write-Error "Failed to verify order: $_"
        }
        
        Write-Host ""
        
        # Step 4: Check expected backend processing
        Write-Step "Step 4: Expected backend processing (check logs)..."
        Write-Info "1. Order-svc should emit ORDER_CREATED event"
        Write-Info "2. Inventory-svc should listen and reserve stock"
        Write-Info "3. Inventory-svc should emit INVENTORY_RESERVED event"
        Write-Info "4. Billing-svc should listen and create invoice automatically"
        Write-Info "5. Billing-svc should emit INVOICE_CREATED event"
        Write-Info "6. Payment-svc should listen (TODO: not implemented yet)"
        Write-Host ""
        
        # Step 5: Manual verification steps
        Write-Step "Step 5: Manual verification (check these)..."
        Write-Host ""
        Write-Host "Check Order Service logs:" -ForegroundColor Yellow
        Write-Host "  Look for: '🚀 Emitting order.created event'" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Check Inventory Service logs:" -ForegroundColor Yellow
        Write-Host "  Look for: '📦 Received ORDER_CREATED event'" -ForegroundColor Gray
        Write-Host "  Look for: '✅ Stock reserved for product'" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Check Billing Service logs:" -ForegroundColor Yellow
        Write-Host "  Look for: '💰 Received INVENTORY_RESERVED event'" -ForegroundColor Gray
        Write-Host "  Look for: '✅ Invoice created automatically'" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Database queries to run:" -ForegroundColor Yellow
        Write-Host "  -- Check order" -ForegroundColor Gray
        Write-Host "  SELECT * FROM orders WHERE id = $orderId;" -ForegroundColor Gray
        Write-Host ""
        Write-Host "  -- Check order items" -ForegroundColor Gray
        Write-Host "  SELECT * FROM order_items WHERE order_id = $orderId;" -ForegroundColor Gray
        Write-Host ""
        Write-Host "  -- Check invoice (should be auto-created)" -ForegroundColor Gray
        Write-Host "  SELECT * FROM invoices WHERE order_id = $orderId;" -ForegroundColor Gray
        Write-Host ""
        Write-Host "  -- Check inventory reservations" -ForegroundColor Gray
        Write-Host "  SELECT id, product_id, quantity_available, quantity_reserved FROM inventory WHERE product_id IN (1, 2);" -ForegroundColor Gray
        Write-Host ""
        
        Write-Success "Test completed! Check the logs and database as described above."
        
    } else {
        Write-Error "Unexpected response format"
        Write-Host $response
    }
    
} catch {
    Write-Error "Failed to create order"
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Possible issues:" -ForegroundColor Yellow
    Write-Host "  1. Customer ID $CUSTOMER_ID doesn't exist in database" -ForegroundColor Gray
    Write-Host "  2. Product IDs 1 or 2 don't exist in catalogue" -ForegroundColor Gray
    Write-Host "  3. API Gateway is not running" -ForegroundColor Gray
    Write-Host "  4. Order service is not running or not connected" -ForegroundColor Gray
    Write-Host ""
    Write-Host "To create test customer:" -ForegroundColor Yellow
    Write-Host "  INSERT INTO customers (id, name, email) VALUES (1, 'Test Customer', 'test@example.com');" -ForegroundColor Gray
    Write-Host ""
    Write-Host "To create test products:" -ForegroundColor Yellow
    Write-Host "  INSERT INTO products (id, name, price, stock) VALUES (1, 'Product A', 99.99, 100);" -ForegroundColor Gray
    Write-Host "  INSERT INTO products (id, name, price, stock) VALUES (2, 'Product B', 149.99, 50);" -ForegroundColor Gray
    exit 1
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "✅ Order Flow Test Complete" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
