app.service('SuppliersService', function($http) {
    const apiLink = "https://jtvnficjmqneiaziltpi.supabase.co/rest/v1/"
    const apiKey = "sb_publishable_zod3o1cakyfUECA7fJj8HA_ZCsF_KOz"

    this.getSuppliers = function() {
        const accessToken = localStorage.getItem('nabd_access_token') || ''
        return $http.get(apiLink + "suppliers?select=*", {
            headers: {
                "apikey": apiKey,
                "Authorization": "Bearer " + accessToken,
                "Content-Type": "application/json"
            }
        })
    }

    this.getSupplierById = function(supplierId) {
        const accessToken = localStorage.getItem('nabd_access_token') || ''
        return $http.get(apiLink + "suppliers?id=eq." + supplierId + "&select=*", {
            headers: {
                "apikey": apiKey,
                "Authorization": "Bearer " + accessToken,
                "Content-Type": "application/json"
            }
        })
    }

    this.updateSupplierById = function(supplierId, payload) {
        const accessToken = localStorage.getItem('nabd_access_token') || ''
        return $http.patch(apiLink + "suppliers?id=eq." + supplierId, payload, {
            headers: {
                "apikey": apiKey,
                "Authorization": "Bearer " + accessToken,
                "Prefer": "return=representation",
                "Content-Type": "application/json"
            }
        })
    }

    this.createSupplier = function(payload) {
        const accessToken = localStorage.getItem('nabd_access_token') || ''
        return $http.post(apiLink + "suppliers", payload, {
            headers: {
                "apikey": apiKey,
                "Authorization": "Bearer " + accessToken,
                "Prefer": "return=representation",
                "Content-Type": "application/json"
            }
        })
    }

    this.deleteSupplierById = function(supplierId) {
        const accessToken = localStorage.getItem('nabd_access_token') || ''
        return $http.delete(apiLink + "suppliers?id=eq." + supplierId, {
            headers: {
                "apikey": apiKey,
                "Authorization": "Bearer " + accessToken,
                "Prefer": "return=representation",
                "Content-Type": "application/json"
            }
        })
    }
})
