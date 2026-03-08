app.controller('ProductsDetailController', function($scope, $routeParams, $location, ProductService) {
    $scope.productId = $routeParams.id;

    ProductService.getProductById($scope.productId).then(function(response){
        if (response.data && response.data.length > 0) {
            $scope.product = response.data[0];

            var drawer = document.getElementById('productDetailsDrawer');
            if (drawer) {
                var bsOffcanvas = new bootstrap.Offcanvas(drawer);
                bsOffcanvas.show();
            }
        }
    }).catch(function(error){
        console.log(error);
    });

    $scope.updateProduct = function() {
        alert("Update product: " + $scope.product.name);
    };

    $scope.deleteProduct = function() {
        if (confirm("Are you sure you want to delete " + $scope.product.name + "?")) {
            ProductService.deleteProduct($scope.product.id)
            .then(function() {
                alert("Product deleted successfully!");
                $location.path("/products");
            })
            .catch(function(error) {
                console.error("Error deleting product:", error);
                alert("Error deleting product: " + $scope.product.name);
            });
        }
    };
});
