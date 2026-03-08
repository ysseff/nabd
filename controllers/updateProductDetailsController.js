app.controller('updateProductDetailsController', function($scope, $routeParams, ProductService) {
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

    $scope.productId = $routeParams.id;

    ProductService.getProductById($scope.productId).then(function(response){
        if (response.data && response.data.length > 0) {
            $scope.product = angular.copy(response.data[0]);
            $scope.product.expiry_date = $scope.product.expiry_date ? new Date($scope.product.expiry_date) : null;
        }
    }).catch(function(error){
        console.log(error);
    });

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

    $scope.saveProduct = function() {
        if (!$scope.validateProduct($scope.product))
            return
        if (!$scope.product.supplier_id)
            $scope.product.supplier_id = null
        ProductService.updateProduct($scope.product).then(function(){
            alert("Product updated successfully!");
        }).catch(function(error){
            console.log(error);
        });
    };
});
