app.controller("PreferencesController", function($scope, PreferencesService){
    $scope.prefs = {};

    PreferencesService.getPreferences()
    .then(function(response){
        if (response.data.length > 0) {
            var data = response.data[0];
            $scope.prefs = {
                id: data.id,
                name: data.pharmacy_name,
                email: data.email,
                phone: data.phone,
                license: data.license_number,
                address: data.address
            };
        }
    })
    .catch(function(error){
        console.error("Error loading preferences:", error);
    });

    $scope.savePreferences = function(){
        PreferencesService.updatePreferences($scope.prefs)
        .then(function() {
            alert("Preferences updated successfully");
        })
        .catch(function(error){
            console.error("Update error:", error);
            alert("Failed to update preferences");
        });
    };
});
