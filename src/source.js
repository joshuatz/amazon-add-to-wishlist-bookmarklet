/**
 * @file Unminified / Unescaped raw JS behind bookmarklet for adding non-Amazon product page to Amazon Wishlist
 * @author Joshua Tzucker
 */

function addToAmazonWishlist(debug){
    var globSettingKey = 'a2wBookmarklet12212018';
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

    function getSetting(key){
        window[globSettingKey] = (window[globSettingKey] || {});
        return window[globSettingKey][key];
    }

    function setSetting(key,val){
        window[globSettingKey] = (window[globSettingKey] || {});
        window[globSettingKey][key] = val;
        return window[globSettingKey];
    }

    function run(){
        window[globSettingKey] = (window[globSettingKey] || {});
        // Inject code
        if (getSetting('popupCodeInjected')!==true){
            // Put html and css together and inject into page
            var injectionWrapper = document.createElement('div');
            injectionWrapper.innerHTML = popupUiHtml + '\r\n' + popupUiCss;
            document.querySelector('body').appendChild(injectionWrapper);
            this.popupDom = injectionWrapper;
            // Add event listeners for UI
            attachEventListeners();
            // Store injection status so UI is not reinjected if bookmarklet is run again
            setSetting('popupCodeInjected',true);   
        }
        // Autofill popup with scraped product details
        this.productDetectorInstance = typeof(this.productDetectorInstance)==='object' ? this.productDetectorInstance : new ProductDector();
        console.log(this.productDetectorInstance.getNormalizedProductDetails());
        mapProductJsonToInputs(this.productDetectorInstance.getNormalizedProductDetails());
        autofillPopup();
    }

    var popupUiHtml = '' +
        '<div class="a2wPopupUiWrapper">' +
            '<div class="a2wPopupUi">' +
                '<div class="topMenuBar">' + 
                    '<div class="closeButton tbButton">X</div>' +
                    '<div class="minimizeButton tbButton">-</div>' +
                    '<div class="maximizeButton tbButton a2wHidden">+</div>' +
                '</div>' +
                '<div class="popupBody">' +
                    '<div class="productSelectedImageWrapper">' + 
                        '<img src="" class="productSelectedImage" />' +
                    '</div>' +
                    '<div class="changeSelectedImageButtonWrapper" style="max-width:140px; margin:auto;">' +
                        '<div class="changeSelectedImageButton a2wButton">Change Picture</div>' +
                    '</div>' +
                    '<div class="productFormWrapper">' +
                        '<div class="productForm">' +
                            '<div class="a2wInputWrapper">' +
                                '<div class="a2wLabel">Product Name:</div>' +
                                '<input type="text" name="productName" placeholder="Product Name" />' +
                            '</div>' +
                            '<div class="a2wInputWrapper">' +
                                '<div class="a2wLabel">Product Price:</div>' +
                                '<input type="text" name="productPrice" placeholder="$0.00" />' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>';

    var popupUiCss = '' +
        '<style>' +
            '.a2wPopupUi .a2wHidden {' +
                'display : none !important;' +
            '}' +
            '.a2wPopupUi {' +
                'width: 300px;' +
                'height: auto;' +
                'position : relative;' +
            '}' +
            '.a2wPopupUi .topMenuBar {' +
                'min-height : 14px;' +
                'background-color: white;' +
                'color : black;' +
                'width : 100%;' +
                'height : auto;' +
            '}' +
            '.a2wPopupUi .topMenuBar > .tbButton {' +
                'display : inline-block;' +
                'float : right;' +
                'min-width : 30px;' +
                'text-align : center;' +
                'padding : 4px;' +
                'border : 1px solid black;' +
                'margin : 2px;' +
                'cursor : pointer;' +
            '}' +
            '.a2wPopupUi .popupBody {' +
                'transition : all 1s;' +
                '-webkit-transition : all 1s;' +
                'background-color : red;' +
                'min-height : 300px;' +
                'width : 100%;' +
                'overflow : hidden;' +
            '}' +
            '.a2wPopupUi .a2wButton {' +
                'padding : 4px;' +
                'border-radius : 4px;' +
                'background-color : white;' +
                'border : 2px ridge black;' +
                'width : auto;' +
                'margin : auto;' +
                'text-align : center;' +
                'cursor : pointer;' +
            '}' +
            '.a2wPopupUi .changeSelectedImageButtonWrapper {' +
                'margin-left:5% !important;' +
                'width:30%;' +
                'display : inline-block;' +
            '}' +
            '.a2wPopupUi .productSelectedImageWrapper {' +
                'width:60%;' +
                'display : inline-block;' +
            '}' +
            '.a2wPopupUi .productSelectedImageWrapper img {' +
                'width:100%;' +
                'height:auto;' +
            '}' +
            '.a2wPopupUi .a2wInputWrapper {' +
                'width:95%;' +
                'margin:auto;' +
                'height:auto;' +
            '}' +
            '.a2wPopupUi .a2wInputWrapper input {' +
                'width:100%;' +
                'height:auto;' +
            '}' +
            '.a2wPopupUi .a2wInputWrapper .a2wLabel {' +
                'width:100%;' +
                'height:auto;' +
                'display: inline;' +
                'color: white;' +
                'vertical-align: baseline;' +
                'font-size: 0.8rem;' +
            '}' +
        '</style>';

    function toggleVisiblity(selector){
        this.popupDom.querySelectorAll(selector).forEach(function(elem){
            elem.classList.toggle('a2wHidden');
        });
    }

    function minimizePopup(){
        toggleVisiblity('.minimizeButton,.maximizeButton');
        this.popupDom.querySelector('.popupBody').style.height = '0px';
    }
    function maximinizePopup(){
        toggleVisiblity('.minimizeButton,.maximizeButton');
        this.popupDom.querySelector('.popupBody').style.height = '';
    }

    var getPopupDom = function(){
        return this.popupDom;
    }.bind(this);

    function autofillPopup(){
        // Try to autofill by looking up name to productDetails
        var inputs = getPopupDom().querySelectorAll('.productForm input');
        for (var x=0; x<inputs.length; x++){
            var input = inputs[x];
            var inputName = input.getAttribute('name');
            if (inputName in selectedProductDetails){
                input.value = selectedProductDetails[inputName];
            }
        }
        // Fill in picture section
        getPopupDom().querySelector('.productSelectedImage').setAttribute('src',selectedProductDetails.imageUrl);
    }

    function attachEventListeners(){
        this.popupDom.querySelector('.minimizeButton').addEventListener('click',minimizePopup.bind(this));
        this.popupDom.querySelector('.maximizeButton').addEventListener('click',maximinizePopup.bind(this));
        this.popupDom.querySelector('.closeButton').addEventListener('click',function(evt){
            // Remove popup
            this.popupDom.remove();
            // Clear injection status
            setSetting('popupCodeInjected',false);   
        }.bind(this));
    }

    function mapProductJsonToInputs(productJson){
        var mappings = {
            'productName' : 'productName',
            'productPrice' : 'productPriceUSD',
            'requestedQty' : null,
            'asin' : null,
            'productUrl' : 'productUrl',
            'comment' : 'productDescription',
            'imageUrl' : 'productImageUrl',
            'registryID' : null,
            'type' : null
        }
        for (var key in mappings) {
            if (mappings.hasOwnProperty(key)) {
                var mapping = mappings[key];
                if (productJson.hasOwnProperty(mapping) && productJson[mapping]!==''){
                    selectedProductDetails[key] = productJson[mapping];
                }
            }
        }
        return selectedProductDetails;
    }

    function showProductInputPanel(){

    }
    function specificSiteProductDetector(site){
        
    }

    function showImageSelector(primaryImageUrl){
        var imageSrcArr = [];
        if (primaryImageUrl){
            imageSrcArr.push(primaryImageUrl);
        }
    }

    function setSelectedImage(imageUrl){
        this.selectedImage = imageUrl;
        selectedProductDetails.imageUrl = imageUrl;
    }

    function setPageImage(imageUrl){
        this.pageImage = imageUrl;
    }

    return {
        run : run.bind(this),
        mapProductJsonToInputs : mapProductJsonToInputs.bind(this),
        minimizePopup : minimizePopup.bind(this),
        maximinizePopup : maximinizePopup.bind(this)
    };
}

function ProductDector(opt_DomElementOrSelector){
    // Set scope of future queries
    this.hasScraped = false;
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
        productAvailability : 'instock',
        productSku : ''
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
                    selector : 'meta[property="twitter:description"]',
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
            ],
            productSku : [
                {
                    selector : 'meta[itemprop="sku"]',
                    key : 'content'
                },
                {
                    selector : '[itemprop="gtin13"]'
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
                    // Default to checking for .content first
                    if (match.hasAttribute('content') && match.getAttribute('content')!==''){
                        return match.getAttribute('content');
                    }
                    else {
                        return match.innerText.trim();
                    }
                }
            }
        }
        return undefined;
    };

    this.getPriceInfo = function(){
        var price = this.getValueSelectorArr(infoQuerySelectors.special.priceAmount);
        if (!price){
            // As last resort, try to use regex to grab price from page
            var priceText = /\$\d+\.{0,1}\d*/.exec(this.domScope.innerText);
            if (typeof(priceText[0])){
                price = priceText[0];
            }
        }
        return helpers.parsePrice(price);
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

    var helpers = {
        iterateOver : function(thing,callback,callbackArgs){
            callbackArgs = (callbackArgs || {})
            callback = (callback || function(){});
            iterationArr = [];
            if (thing){
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
            }
            else {
                callback({},callbackArgs);
            }
            return iterationArr;
        },
        isTrueObj : function(obj){
            if(obj && typeof(obj)==='object' && !Array.isArray(obj)){
                return true;
            }
            return false;
        },
        recurseObjUntilMatch : function(json,maxDepth,currDepth,checker){
            var boundFunc = helpers.recurseObjUntilMatch.bind(this);
            maxDepth = ((typeof(maxDepth)==='number' ? maxDepth : false) || this.maxDepth || 6);
            currDepth = typeof(currDepth)==='undefined' ? this.currDepth : currDepth;
            if (currDepth <= maxDepth && !checker(json)){
                currDepth++;
                var t = helpers.iterateOver(json);
                for (var y=0; y<t.length; y++){
                    if (checker(t[y])){
                        return t[y];
                    }
                    else {
                        var attempt = boundFunc(t[y],maxDepth,currDepth,checker);
                        if (checker(attempt)){
                            return attempt;
                        }
                    }
                }
            }
            else {
                return json;
            }
        }.bind(this),
        parsePrice : function(price){
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
                productDetails.productPriceUSD = '$' + price.toFixed(2);
                return price;
            }
            return false;
        }
    }

    this.findProductLdJson = function(){
        var productLdJson = false;
        function matchesProductJson(obj){
            if (helpers.isTrueObj(obj)){
                if ('@type' in obj && (obj['@type']==='product' || obj['@type']==='Product') && ('offers' in obj || 'Offers' in obj)){
                    return true;
                }
            }
            return false;
        }
        function matchesOfferJson(obj){
            if(helpers.isTrueObj(obj) && (obj['@type']==='Offer' || obj['@type']==='offer')){
                return true;
            }
            return false;
        }
        
        var allJsonLdScripts = this.domScope.querySelectorAll('script[type="application/ld+json"]');
        for (var x=0; x<allJsonLdScripts.length; x++){
            elem = allJsonLdScripts[x];
            try {
                var topLdJson = JSON.parse(elem.innerText);
                var attempt = helpers.recurseObjUntilMatch(topLdJson,6,0,matchesProductJson);
                if (matchesProductJson(attempt)){
                    productLdJson = attempt;
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

    this.parseProductLdJson = function(json){
        if ('offers' in json || 'Offers' in json){
            var offers = 'offers' in json ? json.offers : json.Offers;
            if (typeof(offers)==='object'){
                productDetails.productAvailability = ('availability' in offers) ? offers.availability : productDetails.productAvailability;
                if ('price' in offers){
                    helpers.parsePrice(offers.price);
                }
                else if ('lowPrice' in offers){
                    helpers.parsePrice(offers.lowPrice);
                }
                else if ('highPrice' in offers){
                    helpers.parsePrice(offers.highPrice);
                }
            }
        }
        productDetails.productImageUrl = ('image' in json) ? json.image : productDetails.productImageUrl;
        productDetails.productSku = ('sku' in json) ? json.sku : productDetails.productSku;
    };

    this.tryLdJson = function(){
        var productLdJson = this.findProductLdJson();
        if (productLdJson){
            console.log(productLdJson);
            this.parseProductLdJson(productLdJson);
        }
    }
    this.specificSiteProductDetector = function(site){
        if (site === 'shopify'){

        }
    };
    this.genericSiteProductDetector = function(){
        this.getPriceInfo();
        this.getRegularDetails();
        this.tryLdJson();
        this.hasScraped = true;
        return productDetails;
    };

    this.getProductDetails = function(){
        return productDetails;
    }
    // @TODO
    this.getNormalizedProductDetails = function(){
        if (!this.hasScraped){
            this.genericSiteProductDetector();
        }
        var normalizedProductDetails = productDetails;
        // @TODO
        return normalizedProductDetails;
    }
}

var test = new ProductDector();
test.genericSiteProductDetector();
console.log(test.getNormalizedProductDetails());
document.querySelectorAll('.a2wPopupUiWrapper').forEach(function(thing){
    thing.parentElement.remove();
})
window.a2wBookmarklet12212018 = (window.a2wBookmarklet12212018 || {});
window.a2wBookmarklet12212018.popupCodeInjected = false
addToAmazonWishlist().mapProductJsonToInputs(test.getNormalizedProductDetails());
addToAmazonWishlist().run();
