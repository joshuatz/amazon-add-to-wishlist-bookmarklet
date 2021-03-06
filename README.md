# WARNING: This project is now "dead"
Amazon finally locked down and/or removed all the services and endpoints this bookmarklet relies on. After an exhaustive search, I could not find any suitable workarounds, so I have to abandon this tool unless someone can find a new endpoint to use. See [this issue](https://github.com/joshuatz/amazon-add-to-wishlist-bookmarklet/issues/1) for details. Sorry everyone! :(

# Amazon Add to Wishlist Bookmarklet
![Demo GIF](https://github.com/joshuatz/amazon-add-to-wishlist-bookmarklet/raw/master/images/Adding%20from%20the%20Same%20Tab%20(AJAX)(Compressed).gif "Adding an item from Target to my Amazon Wishlist")
## Quick Intro:
The code in this repo is my raw, unprocessed code. If you want the actual bookmarklet, you can either checkout this repo and run "npm run build" to generate the installer page, or just go get the bookmarklet [here](https://joshuatz.com/projects/web-stuff/amazon-add-to-wishlist-bookmarklet).



---

## The What:
This is the code behind a bookmarklet (a bookmark that executes a bit of JavaScript when you click it) that will let you add products to your Amazon wishlist from (almost) any website, even competitors of Amazon like eBay or Aliexpress. It is meant to replace the original bookmarklet that Amazon stopped offering, but I have also added some extra functionality and product detection features.

Please note that there are two ways that the bookmarklet can add an item to your list - same tab (AJAX) vs new tab, and the new tab method is unreliable at the moment due to a glitch on Amazon's side. I would recommend the same tab method, but for that to work, you need to configure the bookmarklet with your wishlist id (registryID). You can do this a few different ways:
 *  A) Use my hosted installer page [here](https://joshuatz.com/projects/web-stuff/amazon-add-to-wishlist-bookmarklet).
 *  B) Clone this repo, build with npm run build, and then plug in your registry ID into the local installer page
 *  C) Clone this repo, then copy /config/config.example.js to /config/config.js and plug in your registryID into the file. Then run npm run build-wconfig instead of just "build".

---

## The Why
Amazon used to offer something very close to what I created, a "Universal Add to Wishlist Bookmarklet", but they recently ([seems like around March 2018](https://lifehacker.com/what-to-use-instead-of-amazons-invasive-new-assistant-1823522711)) got rid of it entirely, and if you have  it saved, clicking on it just brings up [a link to install their new Chrome extension](https://www.amazon.com/gp/BIT/) - "The Amazon Assistant". The Chrome extension is nice, but by default it is rather invasive and can read and write data on pretty much every site you visit. It is also way overkill if all I need to do is add a non-Amazon item to my wishlist from time to time. As such, and my obsession with bookmarklets in general, I set out to see if it was possible for me to create my own "add to wishlist" bookmarklet.

---

## Things to note:
 -  This was primarily made as an exercise - a quick project to see if it was 'possible' to make this.
     -  The "endpoints" that my bookmarklet use could be deprecated by Amazon at any time. When that happens, this bookmarklet will stop working.
 -  When building a bookmarklet, there are really two options for keeping it up-to-date. I could have the bookmarklet talk to my server and always fetch the latest code, but this will break functionality on sites that block third party scripts, plus it prevents you as a user from full transparency of what code is injected into the page. Thus I went with option #2, which is to have 100% of the code that runs contained in the bookmarklet itself - no remote code is loaded. However, **this means that if something breaks and I have to release a new version of the bookmarklet, in order for you to update your version, you would have to manually overwrite your bookmark with the new version. _This bookmarklet will not auto-update_.**.
     -  This is an area where browser extensions (like Chrome Extensions) are clearly the winner. I'm sure the distribution of updates was part of Amazon's decision to move from the bookmarklet to an extension.
 -  I tested it with a bunch of random top shopping sites, but it is not guaranteed to work on all of them.
 - The AJAX option to add an item (i.e. you don't have to leave the page your are on to submit) is only possible if you have configured the bookmarklet with your amazon wishlist ID (aka registryID). However, this method is generally much more reliable than the "new tab" method.
 