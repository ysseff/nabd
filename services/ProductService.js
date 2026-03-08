app.service("ProductService", function($http){
    const BASE_URL = "https://jtvnficjmqneiaziltpi.supabase.co/rest/v1";
    const PRODUCTS_VIEW = BASE_URL + "/products_view";
    const PRODUCTS_TABLE = BASE_URL + "/products";
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

    this.getProducts = function(){
        return $http.get(PRODUCTS_VIEW + "?select=id,name,brand,category,batch_no,expiry_date,quantity,unit_price,supplier_name,low_stock,expiry_status,is_active,barcode&order=created_at.desc", {
            headers: this.getHeaders()
        });
    };

    this.getProductById = function(id){
        return $http.get(PRODUCTS_VIEW + "?id=eq." + id + "&select=*", {
            headers: this.getHeaders()
        });
    };

    this.createProduct = function(product){
        const body = {
            "name": product.name,
            "brand": product.brand,
            "category": product.category,
            "supplier_id": product.supplier_id || null,
            "barcode": product.barcode,
            "batch_no": product.batch_no,
            expiry_date: product.expiry_date ? new Date(product.expiry_date).toISOString().split("T")[0] : null,
            "quantity": product.quantity,
            "unit_price": product.unit_price
        };

        return $http.post(PRODUCTS_TABLE, body, {
            headers: this.getHeaders()
        });
    };

    this.updateProduct = function(product){
        const body = {
            "name": product.name,
            "brand": product.brand,
            "category": product.category,
            "supplier_id": product.supplier_id || null,
            "batch_no": product.batch_no,
            expiry_date: product.expiry_date ? new Date(product.expiry_date).toISOString().split("T")[0] : null,
            "quantity": product.quantity,
            "unit_price": product.unit_price
        };

        return $http.patch(PRODUCTS_TABLE + "?id=eq." + product.id, body, {
            headers: this.getHeaders()
        });
    };

    this.deleteProduct = function(id){
        return $http.delete(PRODUCTS_TABLE + "?id=eq." + id, {
            headers: this.getHeaders()
        });
    };
});
