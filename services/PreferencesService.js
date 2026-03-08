app.service("PreferencesService", function($http){
    const BASE_URL = "https://jtvnficjmqneiaziltpi.supabase.co/rest/v1";
    const SETTINGS_TABLE = BASE_URL + "/pharmacy_settings";
    const apiKey = "sb_publishable_zod3o1cakyfUECA7fJj8HA_ZCsF_KOz";

    this.getHeaders = function() {
        const accessToken = localStorage.getItem('nabd_access_token') || '';
        return {
            "apikey": apiKey,
            "Authorization": "Bearer " + (accessToken || apiKey),
            "Prefer": "return=representation",
            "Content-Type": "application/json"
        };
    };

    this.getPreferences = function(){
        return $http.get(SETTINGS_TABLE + "?select=*", {
            headers: this.getHeaders()
        });
    };

    this.updatePreferences = function(prefs){
        const body = {
            pharmacy_name: prefs.name,
            email: prefs.email,
            phone: prefs.phone,
            license_number: prefs.license,
            address: prefs.address
        };

        return $http.patch(
            SETTINGS_TABLE + "?id=eq." + prefs.id,
            body,
            {
                headers: this.getHeaders()
            }
        );
    };
});
