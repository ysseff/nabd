app.controller('SuppliersController', function($scope, SuppliersService) {
    $scope.tableHeaders = [
        { label: 'SUPPLIER', key: 'supplier', type: 'primary' },
        { label: 'PHONE', key: 'phone', type: 'muted' },
        { label: 'EMAIL', key: 'email', type: 'muted' },
        { label: 'ACTIONS', key: 'action', type: 'link' }
    ]

    $scope.tableRows = []
    $scope.tableSearchText = ''
    $scope.tableErrorMessage = ''
    $scope.drawerErrorMessage = ''
    $scope.isDetailsDrawerOpen = false
    $scope.isDetailsDrawerLoading = false
    $scope.isUpdatingSupplier = false
    $scope.isEditingSupplier = false
    $scope.isCreatingSupplier = false
    $scope.selectedRecord = null
    $scope.currentUserRole = (localStorage.getItem('nabd_user_role') || '').toLowerCase()
    $scope.isAdmin = $scope.currentUserRole == 'admin'
    $scope.supplierForm = {
        name: '',
        phone: '',
        email: '',
        location: ''
    }

    $scope.closeSaleDetails = function() {
        $scope.isDetailsDrawerOpen = false
        $scope.drawerErrorMessage = ''
        $scope.isEditingSupplier = false
        $scope.isUpdatingSupplier = false
        $scope.isCreatingSupplier = false
    }

    $scope.openCreateSupplier = function() {
        if (!$scope.isAdmin)
            return

        $scope.isDetailsDrawerOpen = true
        $scope.isDetailsDrawerLoading = false
        $scope.drawerErrorMessage = ''
        $scope.isEditingSupplier = true
        $scope.isCreatingSupplier = true
        $scope.selectedRecord = {
            id: '',
            name: '',
            phone: '',
            email: '',
            location: ''
        }
        $scope.supplierForm = {
            name: '',
            phone: '',
            email: '',
            location: ''
        }
    }

    $scope.openSupplierDetails = function(row, $event) {
        if ($event)
            $event.preventDefault()

        if (!row || !row.id)
            return

        $scope.isDetailsDrawerOpen = true
        $scope.isDetailsDrawerLoading = true
        $scope.drawerErrorMessage = ''
        $scope.isEditingSupplier = false
        $scope.isCreatingSupplier = false
        $scope.selectedRecord = null

        SuppliersService.getSupplierById(row.id).then(function(response) {
            var supplierResponse = response.data && response.data.length ? response.data[0] : null
            if (!supplierResponse) {
                $scope.drawerErrorMessage = 'failed to load supplier details'
                return
            }

            $scope.selectedRecord = {
                id: supplierResponse.id,
                name: supplierResponse.name || '-',
                phone: supplierResponse.phone || '-',
                email: supplierResponse.email || '-',
                location: supplierResponse.location || '-'
            }

            $scope.supplierForm = {
                name: supplierResponse.name || '',
                phone: supplierResponse.phone || '',
                email: supplierResponse.email || '',
                location: supplierResponse.location || ''
            }
        })
        .catch(function() {
            $scope.drawerErrorMessage = 'failed to load supplier details'
        })
        .finally(function() {
            $scope.isDetailsDrawerLoading = false
        })
    }

    $scope.updateSupplier = function() {
        if (!$scope.isAdmin)
            return

        if (!$scope.selectedRecord || $scope.isUpdatingSupplier)
            return

        if (!$scope.isEditingSupplier) {
            $scope.isEditingSupplier = true
            return
        }

        $scope.isUpdatingSupplier = true
        $scope.drawerErrorMessage = ''

        var payload = {
            name: $scope.supplierForm.name,
            phone: $scope.supplierForm.phone,
            email: $scope.supplierForm.email,
            location: $scope.supplierForm.location
        }

        if ($scope.isCreatingSupplier) {
            SuppliersService.createSupplier({
                name: $scope.supplierForm.name,
                phone: $scope.supplierForm.phone,
                email: $scope.supplierForm.email,
                location: $scope.supplierForm.location
            }).then(function(response) {
                var createdSupplier = response.data && response.data.length ? response.data[0] : null
                if (!createdSupplier)
                    return

                $scope.selectedRecord = {
                    id: createdSupplier.id,
                    name: createdSupplier.name || '-',
                    phone: createdSupplier.phone || '-',
                    email: createdSupplier.email || '-',
                    location: createdSupplier.location || '-'
                }

                $scope.supplierForm = {
                    name: createdSupplier.name || '',
                    phone: createdSupplier.phone || '',
                    email: createdSupplier.email || '',
                    location: createdSupplier.location || ''
                }

                $scope.tableRows.unshift({
                    id: createdSupplier.id,
                    supplier: createdSupplier.name || '-',
                    phone: createdSupplier.phone || '-',
                    email: createdSupplier.email || '-',
                    location: createdSupplier.location || '-',
                    action: 'View'
                })

                $scope.isEditingSupplier = false
                $scope.isCreatingSupplier = false
            })
            .catch(function() {
                $scope.drawerErrorMessage = 'failed to add supplier'
            })
            .finally(function() {
                $scope.isUpdatingSupplier = false
            })
            return
        }

        if (!$scope.selectedRecord.id) {
            $scope.isUpdatingSupplier = false
            return
        }

        SuppliersService.updateSupplierById($scope.selectedRecord.id, payload).then(function(response) {
            var updatedSupplier = response.data && response.data.length ? response.data[0] : null
            if (!updatedSupplier)
                return

            $scope.selectedRecord.name = updatedSupplier.name || '-'
            $scope.selectedRecord.phone = updatedSupplier.phone || '-'
            $scope.selectedRecord.email = updatedSupplier.email || '-'
            $scope.selectedRecord.location = updatedSupplier.location || '-'

            $scope.supplierForm = {
                name: updatedSupplier.name || $scope.selectedRecord.name || '',
                phone: updatedSupplier.phone || '',
                email: updatedSupplier.email || '',
                location: updatedSupplier.location || ''
            }

            $scope.tableRows = $scope.tableRows.map(function(item) {
                if (item.id != $scope.selectedRecord.id)
                    return item
                return {
                    id: item.id,
                    supplier: updatedSupplier.name || '-',
                    phone: updatedSupplier.phone || '-',
                    email: updatedSupplier.email || '-',
                    location: updatedSupplier.location || '-',
                    action: 'View'
                }
            })

            $scope.isEditingSupplier = false
        })
        .catch(function() {
            $scope.drawerErrorMessage = 'failed to update supplier'
        })
        .finally(function() {
            $scope.isUpdatingSupplier = false
        })
    }

    $scope.deleteSupplier = function() {
        if (!$scope.isAdmin || !$scope.selectedRecord || !$scope.selectedRecord.id || $scope.isUpdatingSupplier)
            return

        $scope.isUpdatingSupplier = true
        $scope.drawerErrorMessage = ''

        SuppliersService.deleteSupplierById($scope.selectedRecord.id).then(function() {
            var deletedId = $scope.selectedRecord.id
            $scope.tableRows = $scope.tableRows.filter(function(item) {
                return item.id != deletedId
            })
            $scope.closeSaleDetails()
        })
        .catch(function() {
            $scope.drawerErrorMessage = 'failed to delete supplier'
        })
        .finally(function() {
            $scope.isUpdatingSupplier = false
        })
    }

    $scope.getSuppliers = function() {
        SuppliersService.getSuppliers().then(function(response) {
            $scope.tableRows = response.data.map(function(item) {
                return {
                    id: item.id,
                    supplier: item.name || item.supplier_name || '-',
                    phone: item.phone || item.phone_number || '-',
                    email: item.email || '-',
                    location: item.location || '-',
                    action: 'View'
                }
            })
            $scope.tableErrorMessage = ''
        })
        .catch(function() {
            $scope.tableErrorMessage = 'failed to load suppliers'
        })
    }

    $scope.getSuppliers()
})
