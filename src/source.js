/**
 * @file Unminified / Unescaped raw JS behind bookmarklet for adding non-Amazon product page to Amazon Wishlist
 * @author Joshua Tzucker
 */

// ==Bookmarklet==
// @name a2w-bookmarklet
// @author Joshua Tzucker
// ==/Bookmarklet==

function addToAmazonWishlist(opt_DomElementOrSelector,opt_WishlistId,debug){
    // Set scope of future queries
    this.domScope = document.querySelector('html');
    if (typeof(opt_DomElementOrSelector)==='object' && opt_DomElementOrSelector!==null){
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
        productUrl : document.location.href,
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
            if (typeof(window['Draggabilly'])==='function'){
                var draggie  = new window.Draggabilly(this.popupDom,{

                });
                var browserWidth = parseFloat(getComputedStyle(document.body).width.replace('px',''));
                // Set position is not working reliably for some reason. Easier to just set with css
                //draggie.setPosition((browserWidth-20),20);
                injectionWrapper.style.top = '20px';
                injectionWrapper.style.right = '20px';
            }
            // Add event listeners for UI
            attachEventListeners.bind(this)();
            // Store injection status so UI is not reinjected if bookmarklet is run again
            setSetting('popupCodeInjected',true);   
        }
        // Autofill popup with scraped product details
        this.productDetectorInstance = typeof(this.productDetectorInstance)==='object' ? this.productDetectorInstance : new ProductDetector(this.domScope);
        console.log(this.productDetectorInstance.getNormalizedProductDetails());
        mapProductJsonToInputs(this.productDetectorInstance.getNormalizedProductDetails());
        // If registryId is not set, disable the ajax option
        if(typeof(selectedProductDetails.registryID)!=='string' || selectedProductDetails.registryID===''){
            getPopupDom().querySelector('[data-method="ajax"]').classList.add('a2wHidden');
        }
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
                                '<select name="requestedQty" data-forceint>' +
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
                            '<div class="a2wButton a2wSubmitButton" data-method="ajax">Add (Same Tab)</div>' +
                            '<div class="a2wButton a2wSubmitButton" data-method="newtab">Add (New Tab)</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="iframeModalWrapper">' +
                    '</div>' +
                    '<div class="loadingIndicatorWrapper a2wHidden">' +
                        '<div class="loadingIndicatorAnimationWrapper">' +
                            '<div class="loadingIndicatorAnimation">' +
                                '<div class="a2wSvgWrapper rotating a2wLoadingSvg">' +
                                    '<?xml version="1.0" ?><svg id="Layer_1" style="enable-background:new 0 0 100.4 100.4;" version="1.1" viewBox="0 0 100.4 100.4" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M76.9,23.1l1.1-4.2h4.8c0.9,0,1.6-0.7,1.6-1.6v-7c0-0.9-0.7-1.6-1.6-1.6H17.5c-0.9,0-1.6,0.7-1.6,1.6v7  c0,0.9,0.7,1.6,1.6,1.6h4.8l1.1,4.2C26.2,34.7,34.5,43.9,45.7,48v3.8c-11.1,4.1-19.4,13.3-22.3,24.9L22,81.9h-4.5  c-0.9,0-1.6,0.7-1.6,1.6v7c0,0.9,0.7,1.6,1.6,1.6h65.3c0.9,0,1.6-0.7,1.6-1.6v-7c0-0.9-0.7-1.6-1.6-1.6h-4.5l-1.3-5.3  C74,65.1,65.7,55.9,54.6,51.8V48C65.7,43.9,74,34.7,76.9,23.1z M19.1,11.9h62v3.7h-62V11.9z M81.2,88.9h-62v-3.7h62V88.9z   M52.6,54.3C63.3,57.8,71.3,66.5,74,77.4l1.1,4.5h-50l1.1-4.5C29,66.5,37,57.8,47.6,54.3c0.6-0.2,1-0.8,1-1.4v-5.9  c0-0.6-0.4-1.2-1-1.4C37,41.9,29,33.3,26.3,22.4l-0.9-3.5h49.5L74,22.4c-2.7,10.9-10.7,19.5-21.4,23.1c-0.6,0.2-1,0.8-1,1.4v5.9  C51.6,53.5,52,54.1,52.6,54.3z"/></svg>' +
                                '</div>' +
                                '<div class="a2wSvgWrapper a2wHidden a2wSuccessSvg">' +
                                    '<?xml version="1.0" ?><svg version="1.1" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns" xmlns:xlink="http://www.w3.org/1999/xlink"><title/><desc/><defs/><g fill="none" fill-rule="evenodd" id="Page-1" stroke="none" stroke-width="1"><g fill="#222E50" id="Core" transform="translate(-465.000000, -45.000000)"><g id="check-box" transform="translate(465.000000, 45.000000)"><path d="M16,0 L2,0 C0.9,0 0,0.9 0,2 L0,16 C0,17.1 0.9,18 2,18 L16,18 C17.1,18 18,17.1 18,16 L18,2 C18,0.9 17.1,0 16,0 L16,0 Z M7,14 L2,9 L3.4,7.6 L7,11.2 L14.6,3.6 L16,5 L7,14 L7,14 Z" id="Shape"/></g></g></g></svg>' +
                                '</div>' +
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
                'background-color : white !important;' +
                'color : black !important;' +
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
                'text-align: center;' +
            '}' +
            '.a2wPopupUi .a2wSubmitButton {' +
                'width : 45%;' +
                'display : inline;' +
                'margin-left : auto;' +
                'margin-right : 5%;' +
            '}' +
            '.a2wPopupUi .bottomAreaWrapper {' +
                'background-color : #98c1d9;' +
            '}' +
            '.a2wPopupUi .changeSelectedImageButtonWrapper {' +
                'margin-left:2.5% !important;' +
                'width:35%;' +
                'display : inline-block;' +
                'vertical-align: top;' +
                'margin-top: 19%;' +
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
            '.a2wPopupUi .loadingIndicatorWrapper {' +
                'display : block;' +
                'position : absolute;' +
                'top : 0px;' +
                'left : 0px;' +
                'width : 100%;' +
                'height : calc(100% - 40px);' +
                'margin-top : 40px;' +
                'z-index : 999;' +
                'cursor : not-allowed;' +
                'background-color : rgba(152, 193, 217, 0.86);' +
            '}' +
            '.a2wPopupUi .loadingIndicatorAnimationWrapper {' +
                'position : relative;' +
                'width : 100%;' +
                'height : 100%;' +
            '}' +
            '.a2wPopupUi .loadingIndicatorAnimation {' +
                'position: absolute;' +
                'top: 50%;' +
                'left: 50%;' +
                'transform: translate(-50%, -50%);' +
            '}' +
            '.a2wPopupUi .loadingIndicatorAnimation .a2wSvgWrapper {' +
                'width : 100%;' +
                'height : auto;' +
                'min-width : 150px;' +
            '}' +
            '.rotating {' +
                'animation: rotating 2s infinite linear;' +
                '-webkit-animation: rotating 2s infinite linear;' +
            '}' +
            '@keyframes rotating {' +
                '0% {' +
                    'transform: rotate(0deg);' +
                    '-webkit-transform: rotate(0deg);' +
                '}' +
                '20% {' +
                    'transform: rotate(5deg);' +
                    '-webkit-transform: rotate(5deg);' +
                '}' +
                '40% {' +
                    'transform: rotate(10deg);' +
                    '-webkit-transform: rotate(10deg);' +
                '}' +
                '60% {' +
                    'transform: rotate(40deg);' +
                    '-webkit-transform: rotate(40deg);' +
                '}' +
                '80% {' +
                    'transform: rotate(100deg);' +
                    '-webkit-transform: rotate(100deg);' +
                '}' +
                '100% {' +
                    'transform: rotate(359deg);' +
                    '-webkit-transform: rotate(359deg);' +
                '}' +
            '}' +
        '</style>';

    function toggleVisiblity(selector){
        this.popupDom.querySelectorAll(selector).forEach(function(elem){
            elem.classList.toggle('a2wHidden');
        });
    }

    function minimizePopup(){
        toggleVisiblity('.minimizeButton,.maximizeButton');
        this.popupDom.querySelector('.popupBody').style.maxHeight = '0px';
    }
    function maximinizePopup(){
        toggleVisiblity('.minimizeButton,.maximizeButton');
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
                        var desiredVal = selectedProductDetails[inputName];
                        var matchingIndex = false;
                        // Search through options for val
                        var options = input.options;
                        for (var o=0; o<options.length; o++){
                            var index = o;
                            var option = options[index];
                            if (option.value == desiredVal.toString()){
                                matchingIndex = index;
                            }
                        }
                        // If match...
                        if (matchingIndex!==false){
                            input.selectedIndex = matchingIndex;
                        }
                    }
                    else if (direction==='fromPopup'){
                        var selectedOption = input.selectedOptions[0];
                        var val = input.selectedOptions[0].value;
                        if (input.hasAttribute('data-forceint')){
                            val = parseInt(val,10);
                        }
                        selectedProductDetails[inputName] = val;
                    }
                }
            }
        }

        if (direction==='toPopup'){
            // Fill in picture section
            if (selectedProductDetails.imageUrl && selectedProductDetails.imageUrl !==''){
                setSelectedImage(selectedProductDetails.imageUrl);
            }
            else {
                // the ProductDetector was unable to identify a product specific image, so set the selected image to the first image on the page
                var imageSrcs = generateImgSrcArrFromPage();
                if (imageSrcs.length > 0){
                    setSelectedImage(imageSrcs[0]);
                }
            }
            
        }
        else if (direction==='fromPopup'){
            return selectedProductDetails;
        }
    }

    function gatherFromPopup(){
        return autofillPopup('fromPopup');
    }

    /**
     * Grouped methods together that are related to the final step of actually pushing the product data to an Amazon wishlist (or opening in new tab)
     */
    var submitter = {
        getLoaderElem : function(){
            return getPopupDom().querySelector('.loadingIndicatorWrapper');
        },
        showLoader : function(){
            this.getLoaderElem().classList.remove('a2wHidden');
            this.getLoaderElem().querySelector('.a2wLoadingSvg').classList.remove('a2wHidden');
            this.getLoaderElem().querySelector('.a2wSuccessSvg').classList.add('a2wHidden');
        },
        showLoaderComplete : function(){
            this.getLoaderElem().querySelector('.a2wLoadingSvg').classList.add('a2wHidden');
            this.getLoaderElem().querySelector('.a2wSuccessSvg').classList.remove('a2wHidden');
        },
        hideLoader : function(){
            this.getLoaderElem().classList.add('a2wHidden');
        },
        dataFormToUrl : function(baseUrl,formDataObj){
            finalUrl = baseUrl;
            for (var prop in formDataObj){
                var val = formDataObj[prop];
                var pair = encodeURIComponent(prop) + '=' + encodeURIComponent(val);
                finalUrl = finalUrl + (finalUrl.indexOf('?')!==-1 ? '&' : '?') + pair;
            }
            return finalUrl;
        },
        ajaxPostSubmit : function(){
            this.showLoader();
            var endpoint = 'https://www.amazon.com/gp/ubp/json/atwl/add';
            gatherFromPopup();
            // Mapping
            var formData = {
                name : selectedProductDetails.productName,
                price : selectedProductDetails.productPrice,
                requestedQty : selectedProductDetails.requestedQty,
                asin : selectedProductDetails.asin,
                productUrl : selectedProductDetails.productUrl,
                comment : selectedProductDetails.comment,
                imageUrl : selectedProductDetails.imageUrl,
                registryID : selectedProductDetails.registryID,
                type : selectedProductDetails.type
            };
            endpoint = this.dataFormToUrl(endpoint,formData);
            this.jsonP(endpoint,function(res){
                // CORB will block response of JSONP, so there is no way to know if success or fail. THIS CODE WILL NOT BE REACHED UNLESS OUTSIDE CHROME OR CORB / CORS POLICY CHANGES
                console.log(res);
                setTimeout(function(){
                    ajaxDoneAction();
                },500);
            });
            // Since CORB will stop callback on above, just use timeout
            setTimeout(function(){
                this.ajaxDoneAction();
            }.bind(this),600);
        },
        ajaxDoneAction : function(){
            this.showLoaderComplete();
            setTimeout(function(){
                removePopup();
            },600);
        },
        getNativeWishlistPageUrl : function(){
            var endpoint = 'https://www.amazon.com/wishlist/add/';
            gatherFromPopup();
            // Mapping
            var formData = {
                'name.0' : selectedProductDetails.productName,
                'priceInput' : selectedProductDetails.productPrice,
                'requestedQty.0' : selectedProductDetails.requestedQty,
                'productUrl.0' : selectedProductDetails.productUrl,
                'itemComment.0' : selectedProductDetails.comment,
                'imageUrl.0' : selectedProductDetails.imageUrl
            };
            endpoint = this.dataFormToUrl(endpoint,formData);
            return endpoint;
        },
        // Unfortunately, this method does not work at all, since Amazon has set a policy that does not allow their site (or the wishlist page) to be iframed into a different domain
        iframeModalLoad : function(){
            var endpoint = this.getNativeWishlistPageUrl();
            // Load up iframe modal
            var iframeModal = document.createElement('div');
            iframeModal.className = 'iframeModal';
            var iframeElem = document.createElement('iframe');
            iframeElem.setAttribute('src',endpoint);
            iframeModal.appendChild(iframeElem);
            var iframeModalWrapper = getPopupDom().querySelector('.iframeModalWrapper');
            iframeModalWrapper.innerHTML = '';
            iframeModalWrapper.appendChild(iframeModal);
        },
        // This is basically the same URL as the iframe method, but opens in a new tab, to get around the cross-domain iframe issue
        openInNewTab : function(){
            var endpoint = this.getNativeWishlistPageUrl();
            window.open(endpoint,'_blank');
        },
        // Reusable method to get around cross-domain ajax with JSONP. Note that this can't get around CORB for blocking of the response, just gets around for the request.
        jsonP : function(url,callback){
            callback = (callback || function(res){
                console.log(res);
            });
            var callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
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

    /**
     * Removes the ENTIRE popup element
     */
    function removePopup(){
        // Remove popup
        getPopupDom().remove();
        // Clear injection status
        setSetting('popupCodeInjected',false); 
    }

    /**
     * Attaches event listeners, scoped to the popup element. Make sure to only attach once.
     */
    function attachEventListeners(){
        // Toolbar buttons (minimize, maximize, close)
        this.popupDom.querySelector('.minimizeButton').addEventListener('click',minimizePopup.bind(this));
        this.popupDom.querySelector('.maximizeButton').addEventListener('click',maximinizePopup.bind(this));
        this.popupDom.querySelector('.closeButton').addEventListener('click',function(evt){
              removePopup();
        }.bind(this));
        // Change selected image button
        this.popupDom.querySelector('.changeSelectedImageButton').addEventListener('click',toggleImageSelector.bind(this));
        // Select text in input field on field click
        this.popupDom.querySelectorAll('.a2wInputWrapper input, .a2wInputWrapper textarea').forEach(function(input){
            input.addEventListener('click',function(evt){
                evt.target.select();
            });
        });
        // Submit Buttons
        this.popupDom.querySelectorAll('.a2wSubmitButton').forEach(function(button){
            var method = button.getAttribute('data-method');
            button.addEventListener('click',function(method){
                if (method==='iframe'){
                    submitter.iframeModalLoad();
                }
                else if (method==='ajax'){
                    submitter.ajaxPostSubmit();
                }
                else {
                    submitter.openInNewTab();
                }
            }.bind(this,method));
        });
    }

    /**
     * Maps the productJson produced by ProductDetector to the internal selectedProductDetails obj
     * @param {object} productJson - flat product info generated by ProductDetector
     */
    function mapProductJsonToInputs(productJson){
        var mappings = {
            'productName' : 'productName',
            'productPrice' : 'productPriceUSD',
            'requestedQty' : 'productQuantity',
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
        // Check for wishlist id
        if (typeof(opt_WishlistId)==='string'){
            selectedProductDetails.registryID = opt_WishlistId;
        }
        else if (getSetting('registryId')){
            selectedProductDetails.registryID = getSetting('registryId');
        }
        else if (getSetting('registryID')){
            selectedProductDetails.registryID = getSetting('registryID');
        }
        return selectedProductDetails;
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

    /**
     * Generates an array of image URLs, based on images in the current page. Skips images that are too small, those that use base64 instead of a hosted URL, etc.
     * @param {string} [opt_SrcForFirstElement] - if there is a specific image you want in the #1 slot (such as a hero image)
     * @returns {array} Array of image url strings
     */
    var generateImgSrcArrFromPage = function(opt_SrcForFirstElement){
        var primaryImageUrl = (opt_SrcForFirstElement || (selectedProductDetails.imageUrl!=='' ? selectedProductDetails.imageUrl : false));
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
        return imageSrcArr;
    }.bind(this);

    /**
     * Loads the image selector panel and makes it visible, based on what images are on the page, and/or passed parameter
     * @param {string} [primaryImageUrl] - The URL you want to display as the primary selected image
     */
    var showImageSelector = function(primaryImageUrl){
        var imageSrcArr = generateImgSrcArrFromPage(primaryImageUrl);
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
    }.bind(this);
    
    /**
     * Sets the selected image, both in the GUI to the user, and in the selectedProductDetails obj
     * @param {string} imageUrl - the URL of the image to set as the selected image
     */
    var setSelectedImage = function(imageUrl){
        getPopupDom().querySelector('img.productSelectedImage').src = imageUrl;
        this.selectedImage = imageUrl;
        selectedProductDetails.imageUrl = imageUrl;
    }.bind(this);

    /**
     * Return methods
     */
    return {
        run : run.bind(this),
        mapProductJsonToInputs : mapProductJsonToInputs.bind(this),
        minimizePopup : minimizePopup.bind(this),
        maximinizePopup : maximinizePopup.bind(this)
    };
}

function ProductDetector(opt_DomElementOrSelector){
    // Set scope of future queries
    this.hasScraped = false;
    this.domScope = document.querySelector('html');
    if (typeof(opt_DomElementOrSelector)==='object' && opt_DomElementOrSelector!==null){
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
        productPageUrl : document.location.href,
        productDescription : '',
        productAvailability : 'instock',
        productSku : '',
        productQuantity : 0
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
            ],
            productQuantity : [
                {
                    selector : '[class*="QuantityPicker"] .select--customLabel [class^="SelectBox__ReactiveText"] span'
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

    /**
     * Gets price info, based on querySelector first, falling back to regex as last resort
     * Updates the global productDetails object
     * @returns price as float
     */
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
    /**
     * Gets all product details except for those that require special processing beyond querySelectors (price for now)
     */
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

    /**
     * Helper functions
     */
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

    /**
     * Attempts to find product LD-JSON schema in the page or product area
     * @returns false if can't find, otherwise the the schema parsed as JSON
     */
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

    /**
     * Essentially a "mapper" that grabs attributes from standard product ld-json schema and places into my productDetails obj
     * @param {object} json - product ld-json, parsed into an object (via JSON.parse()) 
     */
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
            this.parseProductLdJson(productLdJson);
        }
    }
    this.specificSiteProductDetector = function(site){
        if (site === 'shopify'){
            //@TODO
        }
    };
    /**
     * This should run the scraper and should work for getting product details on most sites. Uses combination of standardized schema, markup, and regex
     */
    this.genericSiteProductDetector = function(){
        this.getPriceInfo();
        this.getRegularDetails();
        this.tryLdJson();
        this.hasScraped = true;
        return productDetails;
    };

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

var test = new ProductDetector();
test.genericSiteProductDetector();
console.log(test.getNormalizedProductDetails());
document.querySelectorAll('.a2wPopupUiWrapper').forEach(function(thing){
    thing.parentElement.remove();
})
window.a2wBookmarklet12212018 = (window.a2wBookmarklet12212018 || {});
window.a2wBookmarklet12212018.popupCodeInjected = false;
//window.a2wBookmarklet12212018.registryID = '';

//var a2w = new addToAmazonWishlist();
var a2w = new addToAmazonWishlist(null,null,true);
a2w.mapProductJsonToInputs(test.getNormalizedProductDetails());
a2w.run();