app.service('SalesService', function($http) {
    const apiLink = "https://jtvnficjmqneiaziltpi.supabase.co/rest/v1/"
    const apiKey = "sb_publishable_zod3o1cakyfUECA7fJj8HA_ZCsF_KOz"

    this.getHeaders = function() {
        const accessToken = localStorage.getItem('nabd_access_token') || ''
        return {
            "apikey": apiKey,
            "Authorization": "Bearer " + accessToken,
            "Content-Type": "application/json"
        }
    }

    this.getSales = function() {
        return $http.get(apiLink + "sales_view?select=*", {
            headers: this.getHeaders()
        })
    }

    this.getSaleById = function(saleId) {
        return $http.get(apiLink + "sales_view?select=*&id=eq." + saleId, {
            headers: this.getHeaders()
        })
    }

    this.getSaleItemsBySaleId = function(saleId) {
        return $http.get(apiLink + "sale_items_view?select=*&sale_id=eq." + saleId, {
            headers: this.getHeaders()
        })
    }

    this.voidSale = function(saleId, reason) {
        return $http.post(apiLink + "rpc/void_sale", {
            sale_id_input: saleId,
            reason_input: reason
        }, {
            headers: this.getHeaders()
        })
    }
})
