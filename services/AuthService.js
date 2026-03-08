app.service('AuthService', function($http) {
    const authApiLink = "https://jtvnficjmqneiaziltpi.supabase.co/auth/v1/token"
    const restApiLink = "https://jtvnficjmqneiaziltpi.supabase.co/rest/v1/"
    const apiKey = "sb_publishable_zod3o1cakyfUECA7fJj8HA_ZCsF_KOz"
    const authHeaders = {
            "apikey": apiKey,
            "Authorization": "Bearer " + apiKey,
            "Content-Type": "application/json"
        }

    this.login = function(credentials) {
        return $http.post(authApiLink + "?grant_type=password", credentials, { headers: authHeaders })
    }

    this.refreshSession = function(refreshToken) {
        return $http.post(authApiLink + "?grant_type=refresh_token", {
            refresh_token: refreshToken
        }, { headers: authHeaders })
    }

    this.getProfileById = function(userId, accessToken) {
        const profileHeaders = {
                "apikey": apiKey,
                "Authorization": "Bearer " + accessToken,
                "Content-Type": "application/json"
            }

        return $http.get(restApiLink + "profiles?id=eq." + userId + "&select=*", {
            headers: profileHeaders
        })
    }
})
