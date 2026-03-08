app.controller('AddProductController', function($scope, ProductService) {
    $scope.toDateInputValue = function(date) {
        var year = date.getFullYear()
        var month = String(date.getMonth() + 1).padStart(2, '0')
        var day = String(date.getDate()).padStart(2, '0')
        return year + '-' + month + '-' + day
    }
    $scope.getTodayDateOnly = function() {
        var today = new Date()
        today.setHours(0, 0, 0, 0)
        return today
    }
    $scope.parseDateOnly = function(value) {
        if (!value)
            return null
        if (typeof value == 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
            var dateParts = value.split('-')
            return new Date(Number(dateParts[0]), Number(dateParts[1]) - 1, Number(dateParts[2]))
        }
        var parsedDate = new Date(value)
        if (isNaN(parsedDate.getTime()))
            return null
        return new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate())
    }
    ;(function setMinExpiryDate() {
        var minDate = $scope.getTodayDateOnly()
        minDate.setDate(minDate.getDate() + 1)
        $scope.minExpiryDate = $scope.toDateInputValue(minDate)
    })()

    $scope.isValidUuid = function(value) {
        if (!value)
            return true
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value))
    }

    $scope.validateProduct = function(product) {
        var quantity = Number(product && product.quantity)
        if (isNaN(quantity) || quantity < 1) {
            alert("Quantity must be 1 or above")
            return false
        }

        var expiryDate = $scope.parseDateOnly(product && product.expiry_date)
        if (!expiryDate) {
            alert("Expiry date is required")
            return false
        }

        if (expiryDate <= $scope.getTodayDateOnly()) {
            alert("Expiry date must be greater than today")
            return false
        }

        return true
    }

    $scope.myNewProduct = {
        name: "",
        brand: "",
        category: "",
        batch_no: "",
        expiry_date: "",
        quantity: 1,
        unit_price: 0
    };

    $scope.products = [];
    ProductService.getProducts().then(function(response){
        $scope.products = response.data;
    }).catch(function(error){
        console.log(error);
    });

    $scope.saveNewProduct = function() {
        if (!$scope.isValidUuid($scope.myNewProduct.supplier_id)) {
            alert("Supplier ID must be a valid UUID")
            return
        }
        if (!$scope.validateProduct($scope.myNewProduct))
            return

        var myNewProductData = {
            "name": $scope.myNewProduct.name,
            "brand": $scope.myNewProduct.brand,
            "category": $scope.myNewProduct.category,
            "batch_no": $scope.myNewProduct.batch_no,
            "expiry_date": $scope.myNewProduct.expiry_date,
            "supplier_id": $scope.myNewProduct.supplier_id || null,
            "quantity": $scope.myNewProduct.quantity,
            "unit_price": $scope.myNewProduct.unit_price,
            "supplier_name": $scope.myNewProduct.supplier_name
        };

        ProductService.createProduct(myNewProductData)
        .then(function(response) {
            var newProduct = Array.isArray(response.data) ? response.data[0] : response.data;
            if ($scope.products)
                $scope.products.push(newProduct);

            $scope.myNewProduct = {
                name: "",
                brand: "",
                category: "",
                batch_no: "",
                expiry_date: "",
                quantity: 1,
                unit_price: 0
            };
            alert("Product added successfully!");
        })
        .catch(function(error) {
            console.error("Error adding product:", error);
            alert("Error adding product");
        });
    };
});
