app.directive('nabdTable', function() {
    return {
        restrict: 'E',
        scope: {
            headers: '=',
            rows: '=',
            searchText: '=',
            searchKey: '@',
            onActionClick: '&'
        },
        controller: function($scope) {
            $scope.filterRows = function(row) {
                var searchValue = String($scope.searchText || '').toLowerCase().trim()
                if (!searchValue)
                    return true

                if ($scope.searchKey && row && row[$scope.searchKey] != null)
                    return String(row[$scope.searchKey]).toLowerCase().indexOf(searchValue) > -1

                if (row && row.invoice != null)
                    return String(row.invoice).toLowerCase().indexOf(searchValue) > -1

                return true
            }
        },
        templateUrl: 'views/shared/nabd-table.html'
    }
})
