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
    };
    function run(){

    }
    function showProductInputPanel(){

    }
    function specificSiteProductDetector(site){
        
    }

    return {
        run : run
    };
}

function productDector(opt_DomElementOrSelector){
    // Set scope of future queries
    this.domScope = document.querySelector('html');
    if (typeof(opt_DomElementOrSelector)==='object'){
        this.domScope = opt_DomElementOrSelector;
    }
    else if (typeof(opt_DomElementOrSelector)==='string' && document.querySelector(opt_DomElementOrSelector)){
        this.domScope = document.querySelector(opt_DomElementOrSelector);
    }
    // Placeholder product details
    var productDetails = {
        productName : '',
        productPriceAmount : 0,
        productPriceUSD : '$0.00',
        productImageUrl : '',
        productDescription : '',
        productAvailability : 'instock'
    };
    // Generic querySelectors for product info - search is using order of array, so best selectors should come first
    var infoQuerySelectors = {
        priceAmount : [
            {
                selector : 'meta[property^="product:price"]',
                key : 'content'
            }
        ],
        productName : [],
        productAvailability : [
            {
                selector : 'meta[property^="og:availability"]',
                key : 'content'
            }
        ],
        productDescription : [
            {
                selector : 'meta[name="description"]',
                key : 'content'
            }
    
        ],
        productImageUrl : [
            {
                selector : 'meta[property^="og:image"]',
                key : 'content'
            }
        ]
    };

    this.getValueSelectorArr = function(selectorArr){
        var selectors = selectorArr;
        for (var x=0; x<selectors.length; x++){
            var currSelectorConfig = selectors[x];
            var match = this.domScope.querySelector(currSelectorConfig.selector);
            console.log(match);
            if (match && match.getAttribute(currSelectorConfig.key) !==null && match.getAttribute(currSelectorConfig.key)!==''){
                var foundValue = match.getAttribute(currSelectorConfig.key);
                if ('processor' in currSelectorConfig){
                    return currSelectorConfig.processor(foundValue);
                }
                else {
                    return foundValue;
                }
            }
        }
        return false;
    }

    this.getPriceInfo = function(){
        var price = this.getValueSelectorArr(infoQuerySelectors.priceAmount);
        if (price){
            if (typeof(price)==='string'){
                // Remove non digits
                price = price.replace(/[^\d]*/gim,'');
                price = parseFloat(price);
            }
            // Force to two decimals
            price = parseFloat(price.toFixed(2));

            // Save
            productDetails.priceAmount = price;
            productDetails.productPriceUSD = '$' + price.toString();
            return price;
        }
        return false;
    }

    this.specificSiteProductDetector = function(site){

    };
    this.genericSiteProductDetector = function(){
        this.getPriceInfo();
        return productDetails;
    };



    

}

(new productDector()).genericSiteProductDetector();