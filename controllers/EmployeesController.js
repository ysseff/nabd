app.controller('EmployeesController', function($scope, EmployeesService) {
    $scope.tableHeaders = [
        { label: 'NAME', key: 'name', type: 'primary' },
        { label: 'EMAIL', key: 'email', type: 'muted' },
        { label: 'ROLE', key: 'role', type: 'pill' },
        { label: 'STATUS', key: 'status', type: 'pill' },
        { label: 'ACTIONS', key: 'action', type: 'link' }
    ]

    $scope.tableRows = []
    $scope.tableSearchText = ''
    $scope.tableErrorMessage = ''
    $scope.drawerErrorMessage = ''
    $scope.isDetailsDrawerOpen = false
    $scope.isDetailsDrawerLoading = false
    $scope.isUpdatingEmployee = false
    $scope.isEditingEmployee = false
    $scope.isCreatingEmployee = false
    $scope.selectedRecord = null
    $scope.currentUserRole = (localStorage.getItem('nabd_user_role') || '').toLowerCase()
    $scope.isAdmin = $scope.currentUserRole == 'admin'
    $scope.currentUserId = ''
    $scope.employeeForm = {
        name: '',
        email: '',
        password: '',
        role: 'employee',
        status: 'inactive'
    }

    try {
        var currentUser = JSON.parse(localStorage.getItem('nabd_user') || '{}')
        $scope.currentUserId = currentUser.id || ''
    } catch (e) {
        $scope.currentUserId = ''
    }

    $scope.formatText = function(value) {
        if (!value)
            return ''
        return String(value)
            .split(/[\\s_]+/)
            .map(function(word) {
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            })
            .join(' ')
    }

    $scope.isCurrentSelectedEmployee = function() {
        if (!$scope.selectedRecord || !$scope.selectedRecord.id || !$scope.currentUserId)
            return false
        return $scope.selectedRecord.id == $scope.currentUserId
    }

    $scope.closeEmployeeDetails = function() {
        $scope.isDetailsDrawerOpen = false
        $scope.drawerErrorMessage = ''
        $scope.isEditingEmployee = false
        $scope.isUpdatingEmployee = false
        $scope.isCreatingEmployee = false
    }

    $scope.openCreateEmployee = function() {
        if (!$scope.isAdmin)
            return

        $scope.isDetailsDrawerOpen = true
        $scope.isDetailsDrawerLoading = false
        $scope.drawerErrorMessage = ''
        $scope.isEditingEmployee = true
        $scope.isCreatingEmployee = true
        $scope.selectedRecord = {
            id: '',
            name: '',
            email: '',
            role: 'Employee',
            status: 'Inactive'
        }
        $scope.employeeForm = {
            name: '',
            email: '',
            password: '',
            role: 'employee',
            status: 'inactive'
        }
    }

    $scope.openEmployeeDetails = function(row, $event) {
        if ($event)
            $event.preventDefault()

        if (!row || !row.id)
            return

        $scope.isDetailsDrawerOpen = true
        $scope.isDetailsDrawerLoading = true
        $scope.drawerErrorMessage = ''
        $scope.isEditingEmployee = false
        $scope.isCreatingEmployee = false
        $scope.selectedRecord = null

        EmployeesService.getEmployeeById(row.id).then(function(response) {
            var employeeResponse = response.data && response.data.length ? response.data[0] : null
            if (!employeeResponse) {
                $scope.drawerErrorMessage = 'failed to load employee details'
                return
            }

            $scope.selectedRecord = {
                id: employeeResponse.id,
                name: employeeResponse.full_name || '-',
                email: employeeResponse.email || '-',
                role: $scope.formatText(employeeResponse.role || 'employee'),
                status: $scope.formatText(employeeResponse.status || 'active')
            }

            $scope.employeeForm = {
                name: employeeResponse.full_name || '',
                email: employeeResponse.email || '',
                password: '',
                role: (employeeResponse.role || 'employee').toLowerCase(),
                status: (employeeResponse.status || 'active').toLowerCase()
            }
        })
        .catch(function() {
            $scope.drawerErrorMessage = 'failed to load employee details'
        })
        .finally(function() {
            $scope.isDetailsDrawerLoading = false
        })
    }

    $scope.updateEmployee = function() {
        if (!$scope.isAdmin)
            return

        if (!$scope.isCreatingEmployee && $scope.isCurrentSelectedEmployee()) {
            $scope.drawerErrorMessage = 'you cannot update your own account'
            return
        }

        if (!$scope.selectedRecord || $scope.isUpdatingEmployee)
            return

        if (!$scope.isEditingEmployee) {
            $scope.isEditingEmployee = true
            return
        }

        $scope.isUpdatingEmployee = true
        $scope.drawerErrorMessage = ''

        if ($scope.isCreatingEmployee) {
            EmployeesService.createEmployee({
                email: $scope.employeeForm.email,
                password: $scope.employeeForm.password,
                data: {
                    full_name: $scope.employeeForm.name
                }
            }).then(function(response) {
                var createdUser = response.data && response.data.user ? response.data.user : null
                if (!createdUser || !createdUser.id)
                    throw new Error('failed to create user')

                return EmployeesService.updateEmployeeById(createdUser.id, {
                    full_name: $scope.employeeForm.name,
                    email: $scope.employeeForm.email,
                    role: $scope.employeeForm.role || 'employee',
                    status: $scope.employeeForm.status || 'inactive'
                }).then(function(updateResponse) {
                    var createdProfile = updateResponse.data && updateResponse.data.length ? updateResponse.data[0] : null
                    if (!createdProfile) {
                        $scope.selectedRecord = {
                            id: createdUser.id || '',
                            name: ($scope.employeeForm.name || createdUser.user_metadata && createdUser.user_metadata.full_name || '-'),
                            email: createdUser.email || $scope.employeeForm.email || '-',
                            role: $scope.formatText($scope.employeeForm.role || 'employee'),
                            status: $scope.formatText($scope.employeeForm.status || 'inactive')
                        }
                        return
                    }

                    $scope.selectedRecord = {
                        id: createdProfile.id || createdUser.id || '',
                        name: createdProfile.full_name || $scope.employeeForm.name || '-',
                        email: createdProfile.email || createdUser.email || $scope.employeeForm.email || '-',
                        role: $scope.formatText(createdProfile.role || $scope.employeeForm.role || 'employee'),
                        status: $scope.formatText(createdProfile.status || $scope.employeeForm.status || 'inactive')
                    }
                })
            }).then(function() {
                $scope.isEditingEmployee = false
                $scope.isCreatingEmployee = false
                $scope.getEmployees()

            })
            .catch(function() {
                $scope.drawerErrorMessage = 'failed to add employee'
            })
            .finally(function() {
                $scope.isUpdatingEmployee = false
            })
            return
        }

        if (!$scope.selectedRecord.id) {
            $scope.isUpdatingEmployee = false
            return
        }

        var payload = {
            full_name: $scope.employeeForm.name,
            email: $scope.employeeForm.email,
            role: $scope.employeeForm.role,
            status: $scope.employeeForm.status
        }

        EmployeesService.updateEmployeeById($scope.selectedRecord.id, payload).then(function(response) {
            var updatedEmployee = response.data && response.data.length ? response.data[0] : null
            if (!updatedEmployee)
                return

            $scope.selectedRecord.name = updatedEmployee.full_name || '-'
            $scope.selectedRecord.email = updatedEmployee.email || '-'
            $scope.selectedRecord.role = $scope.formatText(updatedEmployee.role || 'employee')
            $scope.selectedRecord.status = $scope.formatText(updatedEmployee.status || 'active')

            $scope.employeeForm = {
                name: updatedEmployee.full_name || '',
                email: updatedEmployee.email || '',
                password: '',
                role: (updatedEmployee.role || 'employee').toLowerCase(),
                status: (updatedEmployee.status || 'active').toLowerCase()
            }

            $scope.tableRows = $scope.tableRows.map(function(item) {
                if (item.id != $scope.selectedRecord.id)
                    return item
                return {
                    id: item.id,
                    name: updatedEmployee.full_name || '-',
                    email: updatedEmployee.email || '-',
                    role: $scope.formatText(updatedEmployee.role || 'employee'),
                    status: $scope.formatText(updatedEmployee.status || 'active'),
                    action: 'View'
                }
            })

            $scope.isEditingEmployee = false
        })
        .catch(function() {
            $scope.drawerErrorMessage = 'failed to update employee'
        })
        .finally(function() {
            $scope.isUpdatingEmployee = false
        })
    }

    $scope.deleteEmployee = function() {
        if (!$scope.isAdmin || !$scope.selectedRecord || !$scope.selectedRecord.id || $scope.isUpdatingEmployee)
            return

        if ($scope.isCurrentSelectedEmployee()) {
            $scope.drawerErrorMessage = 'you cannot delete your own account'
            return
        }

        $scope.isUpdatingEmployee = true
        $scope.drawerErrorMessage = ''

        EmployeesService.deleteEmployeeById($scope.selectedRecord.id).then(function() {
            var deletedId = $scope.selectedRecord.id
            $scope.tableRows = $scope.tableRows.filter(function(item) {
                return item.id != deletedId
            })
            $scope.closeEmployeeDetails()
        })
        .catch(function() {
            $scope.drawerErrorMessage = 'failed to delete employee'
        })
        .finally(function() {
            $scope.isUpdatingEmployee = false
        })
    }

    $scope.getEmployees = function() {
        EmployeesService.getEmployees().then(function(response) {
            $scope.tableRows = response.data.map(function(item) {
                return {
                    id: item.id,
                    name: item.full_name || '-',
                    email: item.email || '-',
                    role: $scope.formatText(item.role || 'employee'),
                    status: $scope.formatText(item.status || 'active'),
                    action: 'View'
                }
            })
            $scope.tableErrorMessage = ''
        })
        .catch(function() {
            $scope.tableErrorMessage = 'failed to load employees'
        })
    }

    $scope.getEmployees()
})
