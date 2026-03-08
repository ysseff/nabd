app.controller('LoginController', function($scope, $location, AuthService) {
    $scope.email = ''
    $scope.password = ''
    $scope.loading = false
    $scope.errorMessage = ''
    $scope.successMessage = ''

    $scope.validateLogin = function() {
        if (!$scope.email) {
            $scope.errorMessage = 'email is required'
        } else if (!$scope.password) {
            $scope.errorMessage = 'password is required'
        } else {
            $scope.errorMessage = ''
        }
    }

    $scope.clearAuthSession = function() {
        localStorage.removeItem('nabd_access_token')
        localStorage.removeItem('nabd_refresh_token')
        localStorage.removeItem('nabd_token_type')
        localStorage.removeItem('nabd_expires_at')
        localStorage.removeItem('nabd_user')
        localStorage.removeItem('nabd_auth_session')
        localStorage.removeItem('nabd_profile')
        localStorage.removeItem('nabd_user_role')
        localStorage.removeItem('nabd_user_status')
    }

    $scope.login = function() {
        $scope.validateLogin()
        if ($scope.errorMessage)
            return

        $scope.loading = true
        $scope.successMessage = ''

        var credentials = {
            email: $scope.email,
            password: $scope.password
        }

        AuthService.login(credentials).then(function(response) {
            var accessToken = response.data.access_token || ''
            var userId = response.data.user && response.data.user.id ? response.data.user.id : ''

            localStorage.setItem('nabd_access_token', accessToken)
            localStorage.setItem('nabd_refresh_token', response.data.refresh_token || '')
            localStorage.setItem('nabd_token_type', response.data.token_type || '')
            localStorage.setItem('nabd_expires_at', response.data.expires_at || '')
            localStorage.setItem('nabd_user', JSON.stringify(response.data.user || {}))
            localStorage.setItem('nabd_auth_session', JSON.stringify(response.data || {}))

            if (!userId) {
                $scope.clearAuthSession()
                $scope.errorMessage = 'you do not have access to this pharmacy'
                $scope.successMessage = ''
                $location.path('/login')
                return
            }

            AuthService.getProfileById(userId, accessToken).then(function(profileResponse) {
                var profile = profileResponse.data && profileResponse.data.length ? profileResponse.data[0] : null

                if (!profile) {
                    $scope.clearAuthSession()
                    $scope.errorMessage = 'you do not have access to this pharmacy'
                    $scope.successMessage = ''
                    $location.path('/login')
                    return
                }

                if ((profile.status || '').toLowerCase() != 'active') {
                    $scope.clearAuthSession()
                    $scope.errorMessage = 'your account is inactive'
                    $scope.successMessage = ''
                    $location.path('/login')
                    return
                }

                localStorage.setItem('nabd_profile', JSON.stringify(profile))
                localStorage.setItem('nabd_user_role', profile.role || '')
                localStorage.setItem('nabd_user_status', profile.status || '')

                $scope.successMessage = 'login successful'
                $scope.errorMessage = ''
                $location.path('/checkout')
            })
            .catch(function() {
                $scope.clearAuthSession()
                $scope.errorMessage = 'you do not have access to this pharmacy'
                $scope.successMessage = ''
                $location.path('/login')
            })
        })
        .catch(function() {
            $scope.errorMessage = 'invalid email or password'
        })
        .finally(function() {
            $scope.loading = false
        })
    }

})
