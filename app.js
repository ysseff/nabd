var app = angular.module('app', ['ngRoute']);

app.config(function($routeProvider) {
    $routeProvider
        .when('/login', {
            templateUrl: 'views/login.html',
            controller: 'LoginController',
            title: 'Login'
        })
        .when('/home', {
            templateUrl: 'views/home.html',
            title: 'Home'
        })
        .when('/products', {
            templateUrl: 'views/products.html',
            controller: 'ProductsController',
            title: 'Products'
        })
        .when('/productdetail/:id', {
            templateUrl: 'views/productDetails.html',
            controller: 'ProductsDetailController',
            title: 'Product Details'
        })
        .when('/addproduct', {
            templateUrl: 'views/addProduct.html',
            controller: 'AddProductController',
            title: 'Add Product'
        })
        .when('/updateproductdetail/:id', {
            templateUrl: 'views/updateProductDetails.html',
            controller: 'updateProductDetailsController',
            title: 'Update Product'
        })
        .when('/preferences', {
            templateUrl: 'views/preferences.html',
            controller: 'PreferencesController',
            title: 'Preferences'
        })
        .when('/checkout', {
            templateUrl: 'views/checkout.html',
            controller: 'CheckoutController',
            title: 'Checkout'
        })
        .when('/sales', {
            templateUrl: 'views/sales.html',
            controller: 'SalesController',
            title: 'Sales'
        })
        .when('/suppliers', {
            templateUrl: 'views/suppliers.html',
            controller: 'SuppliersController',
            title: 'Suppliers'
        })
        .when('/employees', {
            templateUrl: 'views/employees.html',
            controller: 'EmployeesController',
            title: 'Employees'
        })
        .otherwise({
            redirectTo: '/login'
        });
    });

app.run(function($rootScope, $location, $interval, AuthService) {
    $rootScope.$location = $location
    $rootScope.userMenuOpen = false
    $rootScope.currentUserRole = (localStorage.getItem('nabd_user_role') || '').toLowerCase()

    $rootScope.clearAuthSession = function() {
        localStorage.removeItem('nabd_access_token')
        localStorage.removeItem('nabd_refresh_token')
        localStorage.removeItem('nabd_token_type')
        localStorage.removeItem('nabd_expires_at')
        localStorage.removeItem('nabd_user')
        localStorage.removeItem('nabd_auth_session')
        localStorage.removeItem('nabd_profile')
        localStorage.removeItem('nabd_user_role')
        localStorage.removeItem('nabd_user_status')
        $rootScope.currentUserRole = ''
    }

    $rootScope.toggleUserMenu = function($event) {
        if ($event)
            $event.stopPropagation()
        $rootScope.userMenuOpen = !$rootScope.userMenuOpen
    }

    $rootScope.logout = function() {
        $rootScope.clearAuthSession()
        $rootScope.userMenuOpen = false
        $location.path('/login')
    }

    $rootScope.refreshAuthToken = function() {
        var refreshToken = localStorage.getItem('nabd_refresh_token')
        if (!refreshToken)
            return

        AuthService.refreshSession(refreshToken).then(function(response) {
            localStorage.setItem('nabd_access_token', response.data.access_token || '')
            localStorage.setItem('nabd_refresh_token', response.data.refresh_token || refreshToken)
            localStorage.setItem('nabd_token_type', response.data.token_type || '')
            localStorage.setItem('nabd_expires_at', response.data.expires_at || '')
            localStorage.setItem('nabd_user', JSON.stringify(response.data.user || {}))
            localStorage.setItem('nabd_auth_session', JSON.stringify(response.data || {}))
        })
        .catch(function() {
            console.log('failed to refresh token')
        })
    }

    $interval(function() {
        $rootScope.refreshAuthToken()
    }, 50*60*1000)

    $rootScope.$on('$routeChangeStart', function() {
        $rootScope.currentUserRole = (localStorage.getItem('nabd_user_role') || '').toLowerCase()
        $rootScope.userMenuOpen = false
        if (($location.path() == '/employees' || $location.path() == '/preferences') && $rootScope.currentUserRole != 'admin')
            $location.path('/sales')
    })

    $rootScope.$on('$routeChangeSuccess', function(event, current) {
        $rootScope.pageTitle = current && current.$$route && current.$$route.title ? current.$$route.title : ''
    })
})
