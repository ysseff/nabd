app.service('EmployeesService', function($http) {
    const restApiLink = "https://jtvnficjmqneiaziltpi.supabase.co/rest/v1/"
    const authApiLink = "https://jtvnficjmqneiaziltpi.supabase.co/auth/v1/"
    const apiKey = "sb_publishable_zod3o1cakyfUECA7fJj8HA_ZCsF_KOz"

    this.getHeaders = function() {
        const accessToken = localStorage.getItem('nabd_access_token') || ''
        return {
            "apikey": apiKey,
            "Authorization": "Bearer " + accessToken,
            "Prefer": "return=representation",
            "Content-Type": "application/json"
        }
    }

    this.getEmployees = function() {
        return $http.get(restApiLink + "profiles?select=id,full_name,email,role,status,created_at,updated_at", {
            headers: this.getHeaders()
        })
    }

    this.getEmployeeById = function(employeeId) {
        return $http.get(restApiLink + "profiles?id=eq." + employeeId + "&select=id,full_name,email,role,status,created_at,updated_at", {
            headers: this.getHeaders()
        })
    }

    this.createEmployee = function(payload) {
        return $http.post(authApiLink + "signup", payload, {
            headers: {
                "apikey": apiKey,
                "Authorization": "Bearer " + apiKey,
                "Content-Type": "application/json"
            }
        })
    }

    this.updateEmployeeById = function(employeeId, payload) {
        return $http.patch(restApiLink + "profiles?id=eq." + employeeId, payload, {
            headers: this.getHeaders()
        })
    }

    this.deleteEmployeeById = function(employeeId) {
        return $http.delete(restApiLink + "profiles?id=eq." + employeeId, {
            headers: this.getHeaders()
        })
    }
})
