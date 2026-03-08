app.controller('SalesController', function($scope, $q, SalesService) {
    $scope.tableHeaders = [
        { label: 'INVOICE', key: 'invoice', type: 'primary' },
        { label: 'DATE', key: 'date', type: 'muted' },
        { label: 'EMPLOYEE', key: 'employee', type: 'primary' },
        { label: 'PAYMENT', key: 'payment', type: 'pill' },
        { label: 'TOTAL', key: 'total', type: 'primary' },
        { label: 'ACTIONS', key: 'action', type: 'link' }
    ]

    $scope.tableRows = []
    $scope.tableSearchText = ''
    $scope.tableErrorMessage = ''
    $scope.drawerErrorMessage = ''
    $scope.isDetailsDrawerOpen = false
    $scope.isDetailsDrawerLoading = false
    $scope.isVoidingSale = false
    $scope.selectedRecord = null
    $scope.selectedItems = []
    $scope.currentUserRole = (localStorage.getItem('nabd_user_role') || '').toLowerCase()
    $scope.isAdmin = $scope.currentUserRole == 'admin'

    $scope.formatPaymentMethod = function(paymentMethod) {
        if (!paymentMethod)
            return ''
        return paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)
    }

    $scope.formatStatus = function(status) {
        if (!status)
            return ''
        return status.charAt(0).toUpperCase() + status.slice(1)
    }

    $scope.formatCurrency = function(value) {
        return '$' + Number(value || 0).toFixed(2)
    }

    $scope.formatPercent = function(value) {
        return Number(value || 0).toFixed(2) + '%'
    }

    $scope.formatDiscountDisplay = function(discountPercent, subtotal, total) {
        var percentText = $scope.formatPercent(discountPercent)
        var discountAmount = Number(subtotal || 0) - Number(total || 0)
        if (discountAmount < 0)
            discountAmount = 0
        return $scope.formatCurrency(discountAmount) + ' (' + percentText + ')'
    }

    $scope.escapeHtml = function(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
    }

    $scope.printReceipt = function() {
        if (!$scope.selectedRecord)
            return

        var receiptWindow = window.open('', '_blank', 'width=420,height=760')
        if (!receiptWindow)
            return

        var printedAt = new Date().toLocaleString()
        var itemsHtml = $scope.selectedItems.map(function(item) {
            return '<div class="receipt-item">' +
                '<span class="item-name">' + $scope.escapeHtml(item.title) + '</span>' +
                '<span class="item-total">' + $scope.escapeHtml(item.total) + '</span>' +
            '</div>'
        }).join('')

        receiptWindow.document.write('<!DOCTYPE html>' +
        '<html>' +
            '<head>' +
                '<meta charset="UTF-8">' +
                '<title>Receipt - ' + $scope.escapeHtml($scope.selectedRecord.invoice) + '</title>' +
                '<style>' +
                    'body { margin: 0; padding: 20px; background: #fff; font-family: "Courier New", monospace; color: #2A2B33; }' +
                    '.receipt { width: 320px; margin: 0 auto; border: 1px dashed #2A2B33; padding: 18px; }' +
                    '.center { text-align: center; }' +
                    '.title { font-size: 20px; font-weight: 700; margin-bottom: 8px; }' +
                    '.line { border-top: 1px dashed #2A2B33; margin: 12px 0; }' +
                    '.row { display: flex; justify-content: space-between; gap: 12px; font-size: 14px; margin-bottom: 6px; }' +
                    '.muted { font-size: 12px; color: #666; }' +
                    '.receipt-item { display: flex; justify-content: space-between; gap: 12px; font-size: 14px; margin-bottom: 8px; }' +
                    '.item-name { max-width: 210px; }' +
                    '.total-row { display: flex; justify-content: space-between; font-size: 16px; font-weight: 700; margin-top: 10px; }' +
                '</style>' +
            '</head>' +
            '<body>' +
                '<div class="receipt">' +
                    '<div class="center title">nabd pharmacy</div>' +
                    '<div class="center muted">Invoice Receipt</div>' +
                    '<div class="line"></div>' +
                    '<div class="row"><span>Invoice</span><span>' + $scope.escapeHtml($scope.selectedRecord.invoice) + '</span></div>' +
                    '<div class="row"><span>Date</span><span>' + $scope.escapeHtml($scope.selectedRecord.date) + '</span></div>' +
                    '<div class="row"><span>Employee</span><span>' + $scope.escapeHtml($scope.selectedRecord.employee) + '</span></div>' +
                    '<div class="row"><span>Payment</span><span>' + $scope.escapeHtml($scope.selectedRecord.payment) + '</span></div>' +
                    '<div class="line"></div>' +
                    itemsHtml +
                    '<div class="line"></div>' +
                    '<div class="row"><span>Subtotal</span><span>' + $scope.escapeHtml($scope.selectedRecord.subtotal) + '</span></div>' +
                    '<div class="row"><span>Discount</span><span>' + $scope.escapeHtml($scope.selectedRecord.discountPercent) + '</span></div>' +
                    '<div class="total-row"><span>Total</span><span>' + $scope.escapeHtml($scope.selectedRecord.total) + '</span></div>' +
                    '<div class="line"></div>' +
                    '<div class="center muted">Printed at ' + $scope.escapeHtml(printedAt) + '</div>' +
                '</div>' +
            '</body>' +
        '</html>')

        receiptWindow.document.close()
        receiptWindow.focus()
        setTimeout(function() {
            receiptWindow.print()
        }, 200)
    }

    $scope.closeSaleDetails = function() {
        $scope.isDetailsDrawerOpen = false
        $scope.drawerErrorMessage = ''
    }

    $scope.voidSale = function() {
        if (!$scope.selectedRecord || !$scope.selectedRecord.id || $scope.isVoidingSale)
            return

        $scope.isVoidingSale = true
        SalesService.voidSale($scope.selectedRecord.id, 'customer cancellation').then(function() {
            $scope.getSales()
            $scope.openSaleDetails({ id: $scope.selectedRecord.id })
        })
        .catch(function() {
            $scope.drawerErrorMessage = 'failed to void receipt'
        })
        .finally(function() {
            $scope.isVoidingSale = false
        })
    }

    $scope.openSaleDetails = function(row, $event) {
        if ($event)
            $event.preventDefault()

        if (!row || !row.id)
            return

        $scope.isDetailsDrawerOpen = true
        $scope.isDetailsDrawerLoading = true
        $scope.drawerErrorMessage = ''
        $scope.selectedRecord = null
        $scope.selectedItems = []

        $q.all([
            SalesService.getSaleById(row.id),
            SalesService.getSaleItemsBySaleId(row.id)
        ]).then(function(responses) {
            var saleResponse = responses[0].data && responses[0].data.length ? responses[0].data[0] : null
            var itemsResponse = responses[1].data || []

            if (!saleResponse) {
                $scope.drawerErrorMessage = 'failed to load invoice details'
                return
            }

            $scope.selectedRecord = {
                id: saleResponse.id,
                invoice: saleResponse.invoice_code || '',
                date: (saleResponse.created_at || '').slice(0, 10),
                employee: saleResponse.employee_name || '',
                payment: $scope.formatPaymentMethod(saleResponse.payment_method),
                status: $scope.formatStatus(saleResponse.status),
                discountPercent: $scope.formatDiscountDisplay(saleResponse.discount_percent, saleResponse.subtotal, saleResponse.total),
                subtotal: $scope.formatCurrency(saleResponse.subtotal),
                total: $scope.formatCurrency(saleResponse.total)
            }

            $scope.selectedItems = itemsResponse.map(function(item) {
                return {
                    title: (item.product_name_snapshot || '') + ' x ' + (item.quantity || 0),
                    total: $scope.formatCurrency(item.line_total)
                }
            })
        })
        .catch(function() {
            $scope.drawerErrorMessage = 'failed to load invoice details'
        })
        .finally(function() {
            $scope.isDetailsDrawerLoading = false
        })
    }

    $scope.getSales = function() {
        SalesService.getSales().then(function(response) {
            $scope.tableRows = response.data.map(function(item) {
                return {
                    id: item.id,
                    invoice: item.invoice_code || ('INV-2026-' + item.invoice_no),
                    date: (item.created_at || '').slice(0, 10),
                    employee: item.employee_name || '',
                    payment: $scope.formatPaymentMethod(item.payment_method),
                    total: $scope.formatCurrency(item.total),
                    action: 'View'
                }
            })
            $scope.tableErrorMessage = ''
        })
        .catch(function() {
            $scope.tableErrorMessage = 'failed to load sales'
        })
    }

    $scope.getSales()
})
