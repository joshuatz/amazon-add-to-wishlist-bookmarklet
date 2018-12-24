# Amazon Add to Wishlist Bookmarklet
## Quick Intro:
The code in this repo is my raw, unprocessed code. If you want the actual bookmarklet, you can either checkout this repo and run "npm run build" to generate the installer page, or just go get the bookmarklet at [INSERT  LINK HERE](INSERTLINKHERE).

---

## The What:
This is the code behind a bookmarklet (a bookmark that executes a bit of JavaScript when you click it) that will let you add products to your Amazon wishlist from (almost) any website, even competitors of Amazon like eBay or Aliexpress. It is meant to replace the original bookmarklet that Amazon stopped offering, but I have also added some extra functionality and product detection features.

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
 - The AJAX option to add an item (i.e. you don't have to leave the page your are on to submit) is only possible if you have configured the bookmarklet with your amazon wishlist ID (aka registryID)
 