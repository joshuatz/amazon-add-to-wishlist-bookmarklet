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
        special : {
            priceAmount : [
                {
                    selector : 'meta[property^="product:price"]',
                    key : 'content'
                },
                {
                    selector : 'meta[itemprop="price"]',
                    key : 'content'
                },
                {
                    selector : '[itemprop="price"]',
                    key : 'content'
                }
            ]
        },
        regular : {
            productName : [
                {
                    selector : '[itemtype*="schema.org/Product"] meta[itemprop="name"]',
                    key : 'content'
                },
                {
                    selector : 'meta[itemprop="name"]',
                    key : 'content'
                },
                {
                    selector : '.product-title',
                },
                {
                    selector : 'h1',
                },
                {
                    selector : 'meta[property^="og:title"]',
                    key : 'content'
                },
                {
                    selector : 'title'
                }
            ],
            productAvailability : [
                {
                    selector : 'meta[itemprop="availability"]',
                    key : 'content'
                },
                {
                    selector : 'meta[property^="og:availability"]',
                    key : 'content'
                }
            ],
            productDescription : [
                {
                    selector : '[itemtype] meta[itemprop="description"]',
                    key : 'content'
                },
                {
                    selector : 'meta[itemprop="description"]',
                    key : 'content'
                },
                {
                    selector : 'meta[property="og:description"]',
                    key : 'content'
                },
                {
                    selector : 'meta[name="description"]',
                    key : 'content'
                },
                {
                    selector : 'meta[name="Description"]',
                    key : 'content'
                }

            ],
            productImageUrl : [
                {
                    selector : 'meta[property^="og:image"]',
                    key : 'content'
                }
            ]
        }
    };

    this.getValueSelectorArr = function(selectorArr){
        var selectors = selectorArr;
        for (var x=0; x<selectors.length; x++){
            var currSelectorConfig = selectors[x];
            var match = this.domScope.querySelector(currSelectorConfig.selector);
            if (match){
                if(('key' in currSelectorConfig) && match.getAttribute(currSelectorConfig.key) !==null && match.getAttribute(currSelectorConfig.key)!==''){
                    var foundValue = match.getAttribute(currSelectorConfig.key);
                    if ('processor' in currSelectorConfig){
                        return currSelectorConfig.processor(foundValue);
                    }
                    else {
                        return foundValue;
                    }
                }
                else {
                    return match.innerText.trim();
                }
            }
        }
    };

    this.getPriceInfo = function(){
        var price = this.getValueSelectorArr(infoQuerySelectors.special.priceAmount);
        if (price){
            if (typeof(price)==='string'){
                // Remove non digits
                price = price.replace(/[^\d\.]*/gim,'');
                price = parseFloat(price);
            }
            // Force to two decimals
            price = parseFloat(price.toFixed(2));

            // Save
            productDetails.productPriceAmount = price;
            productDetails.productPriceUSD = '$' + price.toString();
            return price;
        }
        return false;
    };
    this.getRegularDetails = function(){
        Object.keys(productDetails).forEach(function(detailName){
            if (detailName in infoQuerySelectors.regular){
                var detailVal = this.getValueSelectorArr(infoQuerySelectors.regular[detailName]);
                if (typeof(detailVal)!=='undefined'){
                    productDetails[detailName] = detailVal;
                }
            }
        }.bind(this));
    };

    this.findProductLdJson = function(){
        var productLdJson = false;
        function matchesProductJson(obj){
            if (typeof(obj)==='object' && !Array.isArray(obj)){
                if ('@type' in obj && (obj['@type']==='product' || obj['@type']==='Product')){
                    return true;
                }
            }
            return false;
        }
        function iterateOver(thing,callback,callbackArgs){
            callbackArgs = (callbackArgs || {})
            callback = (callback || function(){});
            iterationArr = [];
            if (Array.isArray(thing)){
                thing.forEach(function(subThing){
                    iterationArr.push(subThing);
                    callback(subThing,callbackArgs);
                });
            }
            else if (typeof(thing)==='object'){
                Object.keys(thing).forEach(function(keyString){
                    iterationArr.push(thing[keyString]);
                    callback(thing[keyString],callbackArgs);
                });
            }
            return iterationArr;
        }
        
        function recurseUntilProductJson(json,maxDepth,currDepth){
            maxDepth = ((typeof(maxDepth)==='number' ? maxDepth : false) || this.maxDepth || 6);
            currDepth = typeof(currDepth)==='undefined' ? this.currDepth : currDepth;
            if (currDepth <= maxDepth && !matchesProductJson(json)){
                currDepth++;
                var t = iterateOver(json);
                for (var y=0; y<t.length; y++){
                    if (matchesProductJson(t[y])){
                        return t[y];
                    }
                    else return recurseUntilProductJson(t[y],maxDepth,currDepth);
                }
            }
            else {
                return json;
            }
        }
        
        var allJsonLdScripts = this.domScope.querySelectorAll('script[type="application/ld+json"]');
        for (var x=0; x<allJsonLdScripts.length; x++){
            elem = allJsonLdScripts[x];
            try {
                var topLdJson = JSON.parse(elem.innerText);
                if ('@type' in topLdJson){
                    if (matchesProductJson(topLdJson)){
                        productLdJson = topLdJson;
                    }
                }
                else {
                    // Try recursing
                    var lowerJson = recurseUntilProductJson(topLdJson,6,0);
                    if (matchesProductJson(lowerJson)){
                        productLdJson = lowerJson;
                    }
                }
            }
            finally {
                // Likely invalid JSON stored in <script></script>
            }
            if (productLdJson){
                break;
            }
        }

        return productLdJson;
    };

    this.parseLdJson = function(json){

    }

    this.specificSiteProductDetector = function(site){
        if (site === 'shopify'){

        }
    };
    this.genericSiteProductDetector = function(){
        this.getPriceInfo();
        this.getRegularDetails();
        return productDetails;
    };



    

}

var test = new productDector();
test.genericSiteProductDetector();
test.ldJsonParser();