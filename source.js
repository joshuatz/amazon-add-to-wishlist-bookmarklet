/**
 * @file Unminified / Unescaped raw JS behind bookmarklet for adding non-Amazon product page to Amazon Wishlist
 * @author Joshua Tzucker
 */

function addToAmazonWishlist(debug){
    var selectedProductDetails = {
        productName : '',
        productPrice : '$0.00',
        requestedQty : 1,
        asin : '',
        productUrl : '',
        comment : '',
        imageUrl : '',
        registryID : '',
        type : 'wishlist'
    }
    function run(){

    }
    function showProductInputPanel(){

    }
    function productDetector($opt_DomElement){

    }

    return {
        run : run
    }
}

new addToAmazonWishlist(true).run();