app.controller('ProductsController', function($scope, ProductService, SuppliersService) {
    $scope.products = [];
    $scope.searchQuery = '';
    $scope.selectedCategory = 'All';
    $scope.tableErrorMessage = '';
    $scope.drawerErrorMessage = '';
    $scope.isDetailsDrawerOpen = false;
    $scope.isDetailsDrawerLoading = false;
    $scope.isUpdatingProduct = false;
    $scope.isEditingProduct = false;
    $scope.isCreatingProduct = false;
    $scope.selectedProduct = null;
    $scope.productForm = {};
    $scope.suppliers = [];
    $scope.currentUserRole = (localStorage.getItem('nabd_user_role') || '').toLowerCase();
    $scope.isAdmin = $scope.currentUserRole == 'admin';
    $scope.toDateInputValue = function(date) {
        var year = date.getFullYear();
        var month = String(date.getMonth() + 1).padStart(2, '0');
        var day = String(date.getDate()).padStart(2, '0');
        return year + '-' + month + '-' + day;
    };
    $scope.getTodayDateOnly = function() {
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        return today;
    };
    $scope.parseDateOnly = function(value) {
        if (!value)
            return null;
        if (typeof value == 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
            var dateParts = value.split('-');
            return new Date(Number(dateParts[0]), Number(dateParts[1]) - 1, Number(dateParts[2]));
        }
        var parsedDate = new Date(value);
        if (isNaN(parsedDate.getTime()))
            return null;
        return new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate());
    };
    (function setMinExpiryDate() {
        var minDate = $scope.getTodayDateOnly();
        minDate.setDate(minDate.getDate() + 1);
        $scope.minExpiryDate = $scope.toDateInputValue(minDate);
    })();

    $scope.setCategory = function(category) {
        $scope.selectedCategory = category;
    };

    $scope.validateProductForm = function(product) {
        var quantity = Number(product && product.quantity);
        if (isNaN(quantity) || quantity < 1) {
            $scope.drawerErrorMessage = 'quantity must be 1 or above';
            return false;
        }

        var expiryDate = $scope.parseDateOnly(product && product.expiry_date);
        if (!expiryDate) {
            $scope.drawerErrorMessage = 'expiry date is required';
            return false;
        }

        if (expiryDate <= $scope.getTodayDateOnly()) {
            $scope.drawerErrorMessage = 'expiry date must be greater than today';
            return false;
        }

        return true;
    };

    $scope.getSupplierNameById = function(supplierId) {
        var supplier = $scope.suppliers.find(function(item) {
            return String(item.id) == String(supplierId);
        });
        return supplier ? (supplier.name || '-') : '';
    };

    $scope.getSupplierIdByName = function(supplierName) {
        if (!supplierName)
            return '';
        var supplier = $scope.suppliers.find(function(item) {
            return String(item.name || '').toLowerCase() == String(supplierName).toLowerCase();
        });
        return supplier ? supplier.id : '';
    };

    $scope.searchFilter = function(product) {
        if ($scope.searchQuery) {
            var q = $scope.searchQuery.toLowerCase();
            if (!String(product.name || '').toLowerCase().includes(q) &&
                !String(product.category || '').toLowerCase().includes(q))
                return false;
        }

        if ($scope.selectedCategory === 'All')
            return true;
        if ($scope.selectedCategory === 'Other')
            return ['Cosmetics', 'Antibiotics'].indexOf(product.category) === -1;
        if ($scope.selectedCategory === 'Low Stock')
            return Number(product.quantity || 0) < 50;
        return product.category === $scope.selectedCategory;
    };

    $scope.closeProductDetails = function() {
        $scope.isDetailsDrawerOpen = false;
        $scope.drawerErrorMessage = '';
        $scope.isEditingProduct = false;
        $scope.isUpdatingProduct = false;
        $scope.isCreatingProduct = false;
    };

    $scope.openCreateProduct = function() {
        if (!$scope.isAdmin)
            return;

        $scope.isDetailsDrawerOpen = true;
        $scope.isDetailsDrawerLoading = false;
        $scope.drawerErrorMessage = '';
        $scope.isEditingProduct = true;
        $scope.isCreatingProduct = true;
        $scope.selectedProduct = {
            id: '',
            name: '',
            brand: '',
            category: '',
            batch_no: '',
            expiry_date: '',
            quantity: 1,
            unit_price: 0,
            supplier_id: '',
            supplier_name: ''
        };
        $scope.productForm = angular.copy($scope.selectedProduct);
    };

    $scope.openProductDetails = function(product, $event) {
        if ($event)
            $event.preventDefault();

        if (!product || !product.id)
            return;

        $scope.isDetailsDrawerOpen = true;
        $scope.isDetailsDrawerLoading = true;
        $scope.drawerErrorMessage = '';
        $scope.isEditingProduct = false;
        $scope.isCreatingProduct = false;
        $scope.selectedProduct = null;

        ProductService.getProductById(product.id).then(function(response) {
            var item = response.data && response.data.length ? response.data[0] : null;
            if (!item) {
                $scope.drawerErrorMessage = 'failed to load product details';
                return;
            }

            $scope.selectedProduct = item;
            $scope.productForm = {
                id: item.id,
                name: item.name || '',
                brand: item.brand || '',
                category: item.category || '',
                batch_no: item.batch_no || '',
                expiry_date: item.expiry_date ? new Date(item.expiry_date) : null,
                quantity: item.quantity || 0,
                unit_price: item.unit_price || 0,
                supplier_id: String(item.supplier_id || $scope.getSupplierIdByName(item.supplier_name) || ''),
                supplier_name: item.supplier_name || ''
            };
        })
        .catch(function() {
            $scope.drawerErrorMessage = 'failed to load product details';
        })
        .finally(function() {
            $scope.isDetailsDrawerLoading = false;
        });
    };

    $scope.saveProduct = function() {
        if (!$scope.isAdmin || !$scope.selectedProduct || $scope.isUpdatingProduct)
            return;

        if (!$scope.isEditingProduct) {
            $scope.isEditingProduct = true;
            return;
        }

        $scope.drawerErrorMessage = '';
        if (!$scope.validateProductForm($scope.productForm))
            return;

        $scope.isUpdatingProduct = true;
        if (!$scope.productForm.supplier_id)
            $scope.productForm.supplier_id = null;

        if ($scope.isCreatingProduct) {
            ProductService.createProduct($scope.productForm).then(function(response) {
                var created = response.data && response.data.length ? response.data[0] : null;
                if (!created)
                    return;

                created.supplier_name = $scope.getSupplierNameById(created.supplier_id) || created.supplier_name || '-';

                $scope.products.unshift(created);
                $scope.selectedProduct = created;
                $scope.productForm = {
                    id: created.id,
                    name: created.name || '',
                    brand: created.brand || '',
                    category: created.category || '',
                    batch_no: created.batch_no || '',
                    expiry_date: created.expiry_date ? new Date(created.expiry_date) : null,
                    quantity: created.quantity || 0,
                    unit_price: created.unit_price || 0,
                    supplier_id: String(created.supplier_id || ''),
                    supplier_name: created.supplier_name || ''
                };
                $scope.isEditingProduct = false;
                $scope.isCreatingProduct = false;
            })
            .catch(function() {
                $scope.drawerErrorMessage = 'failed to add product';
            })
            .finally(function() {
                $scope.isUpdatingProduct = false;
            });
            return;
        }

        ProductService.updateProduct($scope.productForm).then(function(response) {
            var updated = response.data && response.data.length ? response.data[0] : null;
            if (!updated)
                return;

                updated.supplier_name = $scope.getSupplierNameById(updated.supplier_id) || updated.supplier_name || $scope.selectedProduct.supplier_name || '-';

            $scope.selectedProduct = updated;
            $scope.productForm = {
                id: updated.id,
                name: updated.name || '',
                brand: updated.brand || '',
                category: updated.category || '',
                batch_no: updated.batch_no || '',
                expiry_date: updated.expiry_date ? new Date(updated.expiry_date) : null,
                quantity: updated.quantity || 0,
                unit_price: updated.unit_price || 0,
                supplier_id: String(updated.supplier_id || ''),
                supplier_name: updated.supplier_name || ''
            };

            $scope.products = $scope.products.map(function(item) {
                if (item.id != updated.id)
                    return item;
                return angular.extend({}, item, updated);
            });

            $scope.isEditingProduct = false;
        })
        .catch(function() {
            $scope.drawerErrorMessage = 'failed to update product';
        })
        .finally(function() {
            $scope.isUpdatingProduct = false;
        });
    };

    $scope.deleteProduct = function() {
        if (!$scope.isAdmin || !$scope.selectedProduct || !$scope.selectedProduct.id || $scope.isUpdatingProduct)
            return;

        $scope.isUpdatingProduct = true;
        $scope.drawerErrorMessage = '';

        ProductService.deleteProduct($scope.selectedProduct.id).then(function() {
            var deletedId = $scope.selectedProduct.id;
            $scope.products = $scope.products.filter(function(item) {
                return item.id != deletedId;
            });
            $scope.closeProductDetails();
        })
        .catch(function() {
            $scope.drawerErrorMessage = 'failed to delete product';
        })
        .finally(function() {
            $scope.isUpdatingProduct = false;
        });
    };

    $scope.getProducts = function() {
        ProductService.getProducts().then(function(response){
            $scope.products = response.data || [];
            $scope.tableErrorMessage = '';
        }).catch(function() {
            $scope.tableErrorMessage = 'failed to load products';
        });
    };

    $scope.getSuppliers = function() {
        SuppliersService.getSuppliers().then(function(response) {
            $scope.suppliers = (response.data || []).map(function(item) {
                return {
                    id: String(item.id || ''),
                    name: item.name || ''
                };
            }).filter(function(item) {
                return item.id && item.name;
            });
        }).catch(function() {
            $scope.suppliers = [];
        });
    };

    $scope.getSuppliers();
    $scope.getProducts();
});
