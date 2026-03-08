app.service('CheckoutService', function($http) {
    const apiLink = "https://jtvnficjmqneiaziltpi.supabase.co/rest/v1/"
    const apiKey = "sb_publishable_zod3o1cakyfUECA7fJj8HA_ZCsF_KOz"

    this.getProducts = function() {
        var accessToken = localStorage.getItem('nabd_access_token') || ''
        return $http.get(apiLink + "products_view?select=id,name,brand,category,batch_no,expiry_date,quantity,unit_price,supplier_name,low_stock,expiry_status,is_active,barcode&order=created_at.desc", {
            headers: {
                "apikey": apiKey,
                "Authorization": "Bearer " + accessToken,
                "Content-Type": "application/json"
            }
        })
    }

    this.completeSale = function(payload) {
        var accessToken = localStorage.getItem('nabd_access_token') || ''
        return $http.post(apiLink + "rpc/complete_sale", payload, {
            headers: {
                "apikey": apiKey,
                "Authorization": "Bearer " + accessToken,
                "Content-Type": "application/json"
            }
        })
    }
})
