app.controller('CheckoutController', function($scope, $location, CheckoutService) {
    const cartStorageKey = 'nabd_checkout_cart'

    $scope.products = []
    $scope.checkoutSearchText = ''
    $scope.checkoutBarcodeText = ''
    $scope.cartItems = []
    $scope.selectedPaymentMethod = ''
    $scope.discountPercentInput = '0'
    $scope.checkoutSubtotal = '$0.00'
    $scope.checkoutDiscount = '$0.00'
    $scope.checkoutTotal = '$0.00'
    $scope.checkoutLoading = false
    $scope.checkoutErrorMessage = ''
    $scope.saleCompleted = false

    $scope.formatCurrency = function(value) {
        return '$' + Number(value || 0).toFixed(2)
    }

    $scope.formatProductSubtext = function(product) {
        return (product.brand || '-') + ' \u2013 Qty: ' + (product.quantity || 0) + ' \u2013 Exp: ' + ((product.expiry_date || '').slice(0, 10) || '-')
    }

    $scope.selectPaymentMethod = function(paymentMethod) {
        $scope.selectedPaymentMethod = paymentMethod
        $scope.checkoutErrorMessage = ''
    }

    $scope.parseDiscountPercent = function(inputValue) {
        var cleanedValue = String(inputValue || '').replace(/[^0-9.]/g, '')
        var parsedValue = Number(cleanedValue)
        if (isNaN(parsedValue))
            parsedValue = 0
        if (parsedValue < 0)
            parsedValue = 0
        if (parsedValue > 100)
            parsedValue = 100
        return parsedValue
    }

    $scope.persistCart = function() {
        localStorage.setItem(cartStorageKey, JSON.stringify($scope.cartItems))
    }

    $scope.loadStoredCart = function() {
        var storedCart = localStorage.getItem(cartStorageKey)
        if (!storedCart) {
            $scope.cartItems = []
            return
        }
        try {
            var parsedCart = JSON.parse(storedCart)
            $scope.cartItems = Array.isArray(parsedCart) ? parsedCart : []
        } catch (e) {
            $scope.cartItems = []
        }
    }

    $scope.calculateCheckoutTotals = function() {
        var subtotalValue = $scope.cartItems.reduce(function(total, item) {
            return total + Number(item.lineTotal || 0)
        }, 0)

        var discountPercent = $scope.parseDiscountPercent($scope.discountPercentInput)

        var discountValue = subtotalValue * (discountPercent / 100)
        var totalValue = subtotalValue - discountValue

        $scope.checkoutSubtotal = $scope.formatCurrency(subtotalValue)
        $scope.checkoutDiscount = $scope.formatCurrency(discountValue) + ' (' + discountPercent + '%)'
        $scope.checkoutTotal = $scope.formatCurrency(totalValue)
    }

    $scope.addToCart = function(product) {
        $scope.saleCompleted = false
        var existingItem = $scope.cartItems.find(function(item) {
            return item.id == product.id
        })

        if (existingItem) {
            existingItem.quantity += 1
            existingItem.lineTotal = Number(existingItem.unitPrice) * Number(existingItem.quantity)
        } else {
            $scope.cartItems.push({
                id: product.id,
                name: product.name,
                unitPrice: Number(product.unit_price || 0),
                quantity: 1,
                lineTotal: Number(product.unit_price || 0)
            })
        }

        $scope.persistCart()
        $scope.calculateCheckoutTotals()
    }

    $scope.decrementQuantity = function(item) {
        $scope.saleCompleted = false
        if (item.quantity <= 1)
            return
        item.quantity -= 1
        item.lineTotal = Number(item.unitPrice) * Number(item.quantity)
        $scope.persistCart()
        $scope.calculateCheckoutTotals()
    }

    $scope.incrementQuantity = function(item) {
        $scope.saleCompleted = false
        item.quantity += 1
        item.lineTotal = Number(item.unitPrice) * Number(item.quantity)
        $scope.persistCart()
        $scope.calculateCheckoutTotals()
    }

    $scope.removeFromCart = function(item) {
        $scope.saleCompleted = false
        $scope.cartItems = $scope.cartItems.filter(function(cartItem) {
            return cartItem.id != item.id
        })
        $scope.persistCart()
        $scope.calculateCheckoutTotals()
    }

    $scope.completeSale = function() {
        if ($scope.checkoutLoading || $scope.cartItems.length == 0)
            return

        if (!$scope.selectedPaymentMethod) {
            $scope.checkoutErrorMessage = 'please select payment method'
            return
        }

        $scope.checkoutLoading = true
        $scope.checkoutErrorMessage = ''

        var payload = {
            items_json: $scope.cartItems.map(function(item) {
                return {
                    product_id: item.id,
                    quantity: item.quantity
                }
            }),
            payment_method_input: $scope.selectedPaymentMethod == 'apple pay' ? 'apple_pay' : $scope.selectedPaymentMethod,
            discount_percent_input: $scope.parseDiscountPercent($scope.discountPercentInput),
            notes_input: 'checkout - ' + $scope.selectedPaymentMethod + ' - ' + $scope.cartItems.length + ' item(s)'
        }

        CheckoutService.completeSale(payload).then(function() {
            $scope.cartItems = []
            $scope.discountPercentInput = '0'
            $scope.persistCart()
            $scope.calculateCheckoutTotals()
            $scope.saleCompleted = true
        })
        .catch(function() {
            $scope.checkoutErrorMessage = 'failed to complete sale'
        })
        .finally(function() {
            $scope.checkoutLoading = false
        })
    }

    $scope.goToInvoice = function() {
        $location.path('/sales')
    }

    $scope.getProducts = function() {
        CheckoutService.getProducts().then(function(response) {
            $scope.products = (response.data || []).filter(function(product) {
                return product.is_active
            })
        })
        .catch(function() {
            $scope.products = []
            $scope.checkoutErrorMessage = 'failed to load products'
        })
    }

    $scope.$watch('discountPercentInput', function() {
        $scope.calculateCheckoutTotals()
    })

    $scope.loadStoredCart()
    $scope.calculateCheckoutTotals()
    $scope.getProducts()
})
