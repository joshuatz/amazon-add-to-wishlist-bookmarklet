/**
 * @file Unminified / Unescaped raw JS behind bookmarklet for adding non-Amazon product page to Amazon Wishlist
 * @author Joshua Tzucker
 */

function addToAmazonWishlist(opt_DomElementOrSelector,debug){
    // Set scope of future queries
    this.domScope = document.querySelector('html');
    if (typeof(opt_DomElementOrSelector)==='object'){
        this.domScope = opt_DomElementOrSelector;
    }
    else if (typeof(opt_DomElementOrSelector)==='string' && document.querySelector(opt_DomElementOrSelector)){
        this.domScope = document.querySelector(opt_DomElementOrSelector);
    }
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
    var imageSelectorOpen = false;

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
            injectionWrapper.style.zIndex = 99999;
            injectionWrapper.innerHTML = popupUiHtml + '\r\n' + popupUiCss;
            document.querySelector('body').appendChild(injectionWrapper);
            this.popupDom = injectionWrapper;
            // If draggability is available, make draggable, else set position to top right
            injectionWrapper.style.position = 'fixed';
            injectionWrapper.style.top = '20px';
            injectionWrapper.style.right = '20px';
            if (typeof(Draggabilly)==='function'){
                var draggie  = new Draggabilly(this.popupDom,{

                });
                var browserWidth = parseFloat(getComputedStyle(document.body).width.replace('px',''));
                // Set position is not working reliably for some reason. Easier to just set with css
                //draggie.setPosition((browserWidth-20),20);
                injectionWrapper.style.top = '20px';
                injectionWrapper.style.right = '20px';
            }
            // Add event listeners for UI
            attachEventListeners();
            // Store injection status so UI is not reinjected if bookmarklet is run again
            setSetting('popupCodeInjected',true);   
        }
        // Autofill popup with scraped product details
        this.productDetectorInstance = typeof(this.productDetectorInstance)==='object' ? this.productDetectorInstance : new ProductDector(this.domScope);
        console.log(this.productDetectorInstance.getNormalizedProductDetails());
        mapProductJsonToInputs(this.productDetectorInstance.getNormalizedProductDetails());
        autofillPopup('toPopup');
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
                    '<!-- Selected Image -->' +
                    '<div class="selectedImageTopperWrapper">' +
                        '<div class="selectedImageTopper">' +
                            '<div class="productSelectedImageWrapper">' + 
                                '<img src="" class="productSelectedImage dropshadow" />' +
                            '</div>' +
                            '<div class="changeSelectedImageButtonWrapper" style="max-width:140px;">' +
                                '<div class="changeSelectedImageButton a2wButton dropshadow">Change Picture</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                    '<!-- Change Selected Image Picker -->' +
                    '<div class="changeSelectedImagePickerWrapper">' +
                        '<div class="changeSelectedImagePicker">' +
                        '</div>' +
                    '</div>' +
                    '<!-- Product Form -->' +
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
                            '<div class="a2wInputWrapper">' +
                                '<div class="a2wLabel">Product Description / Comments:</div>' +
                                '<textarea name="comment" placeholder="Comments about the product for your wishlist..."></textarea>' +
                            '</div>' +
                            '<div class="a2wInputWrapper">' +
                                '<div class="a2wLabel">Desired Quantity:</div>' +
                                '<select name="requestedQty">' +
                                    '<option value="1">1</option>' +
                                    '<option value="2">2</option>' +
                                    '<option value="3">3</option>' +
                                    '<option value="4">4</option>' +
                                    '<option value="5">5</option>' +
                                    '<option value="6">6</option>' +
                                    '<option value="7">7</option>' +
                                    '<option value="8">8</option>' +
                                    '<option value="9">9</option>' +
                                '</select>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="bottomAreaWrapper">' +
                        '<div class="bottomSubmitButtonWrapper">' +
                            '<div class="a2wButton a2wSubmitButton">Add to Wishlist!</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="iframeModalWrapper">' +
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
                'border : 2px solid black;' +
                'padding : 4px;' +
                'background-color : #98c1d9;' +
            '}' +
            '.a2wPopupUi .topMenuBar {' +
                'min-height : 14px;' +
                'background-color: #98c1d9;' +
                'color : black;' +
                'width : 100%;' +
                'height : auto;' +
                'display : inline-block;' +
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
                'background-color : #007991;' +
                'color : #98c1d9;' +
            '}' +
            '.a2wPopupUi .popupBody {' +
                'transition : all 1s;' +
                '-webkit-transition : all 1s;' +
                'background-color : #222e50;' +
                // 'min-height : 300px;' +
                'max-height : 1000px;' + 
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
            '.a2wPopupUi .selectedImageTopperWrapper {' + 
                'background-color : #98c1d9;' +
            '}' +
            '.a2wPopupUi .selectedImageTopper {' +
                'margin-bottom : 10px;' +
                'width: 100%;' +
                'min-height : 180px;' +
                'background-color : #ffffff;' +
                'border-top-left-radius : 16px;' +
                'border-top-right-radius : 16px;' +
            '}' +
            '.a2wPopupUi .bottomSubmitButtonWrapper {' +
                'background-color : #ffffff;' +
                'border-bottom-left-radius : 16px;' +
                'border-bottom-right-radius : 16px;' +
                'padding : 8px 0px;' +
            '}' +
            '.a2wPopupUi .a2wSubmitButton {' +
                'width : 60%;' +
            '}' +
            '.a2wPopupUi .bottomAreaWrapper {' +
                'background-color : #98c1d9;' +
            '}' +
            '.a2wPopupUi .changeSelectedImageButtonWrapper {' +
                'margin-left:2.5% !important;' +
                'width:35%;' +
                'display : inline-block;' +
                'margin-top : 48px;' +
            '}' +
            '.a2wPopupUi .productSelectedImageWrapper {' +
                'width:60%;' +
                'display : inline-block;' +
            '}' +
            '.a2wPopupUi .productSelectedImageWrapper img {' +
                'width:84%;' +
                'height:auto;' +
                'margin:8%;' +
            '}' +
            '.a2wPopupUi .productFormWrapper {' +
                'margin-bottom:10px;' +
            '}' +
            '.a2wPopupUi .a2wInputWrapper {' +
                'width:95%;' +
                'margin:auto;' +
                'height:auto;' +
            '}' +
            '.a2wPopupUi .a2wInputWrapper input,.a2wPopupUi .a2wInputWrapper textarea,.a2wPopupUi .a2wInputWrapper select {' +
                'width:100%;' +
                'height:auto;' +
                'background-color: #98c1d9 !important;' +
                'color: black !important;' +
            '}' +
            '.a2wPopupUi .a2wInputWrapper .a2wLabel {' +
                'width:100%;' +
                'height:auto;' +
                'display: inline;' +
                'color: white;' +
                'vertical-align: baseline;' +
                'font-size: 0.8rem;' +
            '}' +
            '.a2wPopupUi .dropshadow {' + 
                'box-shadow: 0 8px 17px 2px rgba(0,0,0,0.14), 0 3px 14px 2px rgba(0,0,0,0.12), 0 5px 5px -3px rgba(0,0,0,0.2);' +
            '}' +
            '.a2wPopupUi .changeSelectedImagePickerWrapper {' +
                'transition : all 0.5s;' +
                '-webkit-transition : all 0.5s;' +
                'overflow : hidden;' +
            '}' +
            '.a2wPopupUi .imagePickerOptionWrapperWrapper {' +
                'position : relative;' +
                'width : 45%;' +
                'margin-left : 2.5%;' +
                'display : inline-block;' +
                'text-align : center;' +
            '}' +
            '.a2wPopupUi .imagePickerOptionWrapper.selected, .imagePickerOptionWrapperWrapper.selected {' +
                'border : 3px solid red;' +
            '}' +
            '.a2wPopupUi .imagePickerOptionWrapper {' +
                'position : absolute;' +
                'top : 50%;' +
                '-ms-transform : translateY(-50%);' +
                'transform : translateY(-50%);' +
            '}' +
            '.a2wPopupUi .imagePickerOption {' +
                'width : 100%;' +
                'height : auto;' +
            '}' +
        '</style>';

    function toggleVisiblity(selector){
        this.popupDom.querySelectorAll(selector).forEach(function(elem){
            elem.classList.toggle('a2wHidden');
        });
    }

    function minimizePopup(){
        toggleVisiblity('.minimizeButton,.maximizeButton');
        //this.popupDom.querySelector('.popupBody').style.height = '0px';
        //this.popupDom.querySelector('.popupBody').classList.remove('expanded');
        //this.popupDom.querySelector('.popupBody').classList.add('collapsed');
        this.popupDom.querySelector('.popupBody').style.maxHeight = '0px';
    }
    function maximinizePopup(){
        toggleVisiblity('.minimizeButton,.maximizeButton');
        //this.popupDom.querySelector('.popupBody').classList.remove('collapsed');
        //this.popupDom.querySelector('.popupBody').classList.add('expanded');
        this.popupDom.querySelector('.popupBody').style.maxHeight = '2000px';
    }

    var getPopupDom = function(){
        return this.popupDom;
    }.bind(this);

    function autofillPopup(direction){
        // Try to autofill by looking up name to productDetails - just for text inputs
        var inputs = getPopupDom().querySelectorAll('.productForm input,.productForm textarea, .productForm select');
        for (var x=0; x<inputs.length; x++){
            var input = inputs[x];
            var inputName = input.getAttribute('name');
            if (inputName in selectedProductDetails){
                // Text inputs
                if (input.nodeName==='INPUT' || input.nodeName==='TEXTAREA'){
                    if (direction==='toPopup'){
                        input.value = selectedProductDetails[inputName];
                    }
                    else if (direction==='fromPopup'){
                        selectedProductDetails[inputName] = input.value;
                    }
                }
                // Select dropdown
                else if (input.nodeName==='SELECT'){
                    if (direction==='toPopup'){

                    }
                    else if (direction==='fromPopup'){
                        
                    }
                }
            }
        }

        if (direction==='toPopup'){
            // Fill in picture section
            getPopupDom().querySelector('.productSelectedImage').setAttribute('src',selectedProductDetails.imageUrl);
        }
        else if (direction==='fromPopup'){
            return selectedProductDetails;
        }
    }

    function gatherFromPopup(){
        return autofillPopup('fromPopup');
    }

    var submitter = {
        dataFormToUrl : function(baseUrl,formDataObj){
            finalUrl = baseUrl;
            for (var prop in formDataObj){
                var val = formDataObj[prop];
                var pair = encodeURI(prop) + '=' + encodeURI(val);
                finalUrl = finalUrl + (finalUrl.indexOf('?')!==-1 ? '&' : '?') + pair;
            }
            return finalUrl;
        },
        ajaxPostSubmit : function(){
            var endpoint = 'https://www.amazon.com/gp/ubp/json/atwl/add';
            gatherFromPopup();
            var formData = selectedProductDetails;
            endpoint = dataFormToUrl(endpoint,formData);
            this.jsonP(endpoint,function(res){
                console.log(res);
            });

        },
        iframeModalLoad : function(){
            var endpoint = 'https://www.amazon.com/wishlist/add/';
            gatherFromPopup();
            var formData = {
                
            }
            endpoint = dataFormToUrl(endpoint,formData);
        },
        jsonP : function(url,callback){
            callback = (callback || function(){});
            window[callbackName] = function(data) {
                delete window[callbackName];
                document.body.removeChild(script);
                callback(data);
            };
        
            var script = document.createElement('script');
            script.src = url + (url.indexOf('?') >= 0 ? '&' : '?') + 'callback=' + callbackName;
            document.body.appendChild(script);
        }
    }

    function submit(){
        // Check to see if user has customized the inputs
        gatherFromPopup();

        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function(){

        }

    }

    function attachEventListeners(){
        // Toolbar buttons (minimize, maximize, close)
        this.popupDom.querySelector('.minimizeButton').addEventListener('click',minimizePopup.bind(this));
        this.popupDom.querySelector('.maximizeButton').addEventListener('click',maximinizePopup.bind(this));
        this.popupDom.querySelector('.closeButton').addEventListener('click',function(evt){
            // Remove popup
            this.popupDom.remove();
            // Clear injection status
            setSetting('popupCodeInjected',false);   
        }.bind(this));
        // Change selected image button
        this.popupDom.querySelector('.changeSelectedImageButton').addEventListener('click',toggleImageSelector.bind(this));
        // Select text in input field on field click
        this.popupDom.querySelectorAll('.a2wInputWrapper input, .a2wInputWrapper textarea').forEach(function(input){
            input.addEventListener('click',function(evt){
                evt.target.select();
            });
        });
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

    function specificSiteProductDetector(site){
        
    }

    function toggleImageSelector(){
        if (imageSelectorOpen){
            //closeImageSelector();
            getPopupDom().querySelector('.changeSelectedImagePickerWrapper').style.maxHeight = '0px';
            imageSelectorOpen = false;
            getPopupDom().querySelector('.changeSelectedImageButton').innerText = 'Change Picture';
        }
        else {
            showImageSelector();
            getPopupDom().querySelector('.changeSelectedImagePickerWrapper').style.maxHeight = '2000px';
            getPopupDom().querySelector('.changeSelectedImageButton').innerText = 'Use Selected Image';
        }
    }

    function showImageSelector(primaryImageUrl){
        primaryImageUrl = (primaryImageUrl || (selectedProductDetails.imageUrl!=='' ? selectedProductDetails.imageUrl : false));
        var imageSrcArr = [];
        if (primaryImageUrl){
            imageSrcArr.push(primaryImageUrl);
        }
        // Get all image elements on page.
        var allImgElements = this.domScope.querySelectorAll('img[src]');
        for (var x=0; x<allImgElements.length; x++){
            var currImage = allImgElements[x];
            var skipImage = false;
            // Skip all images that are smaller than 50x50
            if (currImage.height < 50 && currImage.width < 50){
                skipImage = true;
            }
            // Skip all images that are using a base64 src
            if (/base64/gim.test(currImage.src)){
                skipImage = true;
            }
            // Skip image that is already in array!
            if (imageSrcArr.indexOf(currImage.src)!==-1){
                skipImage = true;
            }
            if (!skipImage){
                imageSrcArr.push(currImage.src);
            }
        }
        // First, clear out existing HTML
        var imagePickerArea = getPopupDom().querySelector('.changeSelectedImagePicker');
        imagePickerArea.innerHTML = '';
        // Now, iterate through images, wrap each, and add to picker area. Keep track of image size as adding, for use with equal height columns at end
        var maxImageHeight = 0;
        if (imageSrcArr.length > 0){
            for (var x=0; x<imageSrcArr.length; x++){
                var wrapperWrapper = document.createElement('div');
                wrapperWrapper.className = 'imagePickerOptionWrapperWrapper' + (x===0 ? ' selected' : '');
                var wrapper = document.createElement('div');
                wrapper.className = 'imagePickerOptionWrapper';
                // Add event listener to wrapper
                wrapper.addEventListener('click',function(evt){
                    // Clicked image should become "selected" and all others should become "un-selected"
                    var imagePickerArea = getPopupDom().querySelector('.changeSelectedImagePicker');
                    var clickedImage = evt.target.nodeName==='IMG' ? evt.target : evt.target.querySelector('img');
                    imagePickerArea.querySelectorAll('.selected').forEach(function(elem){
                        elem.classList.remove('selected');
                    });
                    clickedImage.parentElement.parentElement.classList.add('selected');
                    setSelectedImage(clickedImage.src);
                    console.log(evt);

                }.bind(this));
                var imageElem = document.createElement('img');
                imageElem.className = 'imagePickerOption';
                imageElem.src = imageSrcArr[x];
                wrapper.appendChild(imageElem);
                wrapperWrapper.appendChild(wrapper);
                imagePickerArea.appendChild(wrapperWrapper);

                // Check image height
                if (imageElem.height > maxImageHeight){
                    maxImageHeight = imageElem.height;
                }
            }
            // Force equal height columns
            getPopupDom().querySelectorAll('.imagePickerOptionWrapperWrapper').forEach(function(elem){
                elem.style.minHeight = maxImageHeight + 'px';
            });
        }
        else {
            imagePickerArea.innerHTML = '<div style="text-align:center; background-color:white; color:red; font-size:1.5rem;">No suitable images found on page.</div>';
        }
        // Set flag
        imageSelectorOpen = true;
    }
    

    function setSelectedImage(imageUrl){
        getPopupDom().querySelector('img.productSelectedImage').src = imageUrl;
        this.selectedImage = imageUrl;
        selectedProductDetails.imageUrl = imageUrl;
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
            if (priceText && typeof(priceText[0])){
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
