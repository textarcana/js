/**
 * @version 1.3.1
 * @fileOverview College Board UIL (User Interface Library) object literal declaration.
 * The College Board User Interface Library object.   Experimental javascript library for the College Board's Innovation Laboratory.
 * @author The iLab
* @created This is Serious Cat, created September 6, 2007.  Based upon previous libraries by Zand, Stevens, Porochnia &amp; Liu 2004-2006 and by Sussman 2005-2006.  Also includes open-source patterns by Matt Kruse &amp; Robert Nyman.
* @license MIT License
*/

/**
 * Core Library methods
 * @namespace CB
 * @todo If this file is included more than once, it will wipe out the effects of the init calls in IPE_UI_sandbox.js and configuration.js.  There should be a sanity check here that prevents the CB object declaration from overwriting itself if it already exists.
 */

var CB = {

/**
 *    * Instead of the less-than-useful default of printing "object", print a unique identifier.
   * In the future different versions of this library might have different toString signatures.
   * @returns {String} Unique ID for this library.
 */
 toString : function () {
    return 'iLabWeb2';
  },

    /**
   * Get and Set a Cookie
   * @namespace cookie
   * @author Rob Zand
   */
 cookie : {
   /**
    * Set a cookie with expiration.  The path of the cookie will be "/" and the domain will be automatically determined.  Subdomains are supported: if the site is <code>foo.bar.com</code> then the cookie domain will be "<code>.bar.com</code>"<br/>Does <strong>not</strong> support domains without dots (ie "localhost").  In that case, use the IP address of the host instead.
    * @return undefined
    * @param {String} id The ID of the cookie to be created.
    * @param {String} value The value that will be assigned to the new cookie.
    * @param {Number} expiry An integer indicating the number of days until the expiration date for the new cookie.  Set to -1 to set a session cookie.
    */
  set : function ( id, value, expiry) {
      /** Determine the cookie's domain. */
      var rootDomain = (function() {
	  var ipAddress = location.hostname.match(/\d*\.\d*\.\d*\.\d*$/);
	  var hostName = location.hostname.match(/([^\.]*\.)?[^\.]*$/);
	  if ( ipAddress != null ) {
	    return ipAddress[0];
	  } else {
	    return hostName[0];
	  }
	})();
      document.cookie = id+'='+value+';path=/;domain=.'+ rootDomain + this.getExpirationString(expiry);
    },
  /**
  * Get the value of a previously set cookie, if it exists.
  * @param {String} id The ID of the cookie whose value will be returned.
  * @param {String} defaultValue An optional default value that will be returned if the cookie doesn't exist.
   * @returns The cookie's value if it exists, otherwise returns the value of the defaultValue parameter.  If no defaultValue was given, returns null.
  */
  get : function( id, defaultValue ) {
      var re          = new RegExp(id+'=(.*)');
      var value       = re.exec(document.cookie);
      return (value) ? value[1].split(';')[0] : defaultValue;
    },
  /**
   * Expire named cookie.  We do this by setting the expiration date to NOW, so the cookie will be discarded at the end of the current browser session.
   * @param id The name of the cookie we would like to expire.
   * @param domain The domain or host to which the cookie belongs.
   * Domain-specific cookie is now set (to the root domain) without using a hard-coded value.  This is important because with a hard-coded value it isn't possible to use this method on any site that isn't hosted at "collegeboard.com."
   * NOTE: although the hostName regex will pick up domains without any dots,  such as "localhost", it appears that browsers don't allow you to set cookies with such domains.  In that case, use the IP address of the host instead.
   */
  expire : function( id, domain ) {
      var rootDomain = (function() {
	  var ipAddress = location.hostname.match(/\d*\.\d*\.\d*\.\d*$/);
	  var hostName = location.hostname.match(/([^\.]*\.)?[^\.]*$/);
	  if ( ipAddress != null ) {
	    return ipAddress[0];
	  } else {
	    return hostName[0];
	  }
	})();
      domain = rootDomain;
      //      debugger;
       if(!domain) domain = '.collegeboard.com';
       document.cookie = id+'=;domain=' + domain + ';path=/;expires='+this.cookieTime(-1);
      //      document.cookie = id+'=;path=/;expires='+this.cookieTime(-1);
      CB.cookie.set(id, CB.cookie.get(id, false), -1);
    },
  /**
   * Utility to set the duration of the cookie
   * @param days Number of days until the cookie expires.
   *            If omitted, cookie lasts for 1 year.
   *            If set to 0 or negative, cookie is session only.
   *            If set to any other positive number, cookie lasts for that number of days.
   * @author NS for job H11631 on 11.06.2007
   * @return Either a date in UTC format or an empty string (for session cookies).
  */
  cookieTime : function (days){
      //debugger;
      var now = new Date();
      var exp = new Date();
      var x   = Date.parse(now) + days*24*60*60*1000;
      exp.setTime(x);
      var str = exp.toUTCString();
      var re = '/(\d\d)\s(\w\w\w)\s\d\d(\d\d))/';
      //      console.debug('cookie to expire : '+ str.replace(re,"$1-$2-$3") );
      return str.replace(re,"$1-$2-$3");
    },
  /**
   * Parse an integer into a string that specifies an expiration date for a cookie.
   * @param days Number of days until the cookie expires.
   *            If omitted, default to 365 days.
   *            If set to 0 or a negative number of days, then a session cookie is meant to be set.
   * @return {String} A formatted string that can be appended to a cookie declaration and indicates how long until the cookie expires.
   * For session cookies, and no expiration need be specified in the cookie declaration, so an empty string is returned.
   */
  getExpirationString : function (days) {
      if (typeof days != 'number') {
	days = 365;
      } else if (days <= 0) {
	return '';
      }
      return ';expires='+this.cookieTime(days);
  },
  /**
   * @namespace Multitool
   * An experiment with storing multiple data points in a serialized hash stored as the value of a single cookie.
   * As a proposed solution to the problem of endlessly propagating cookies to preserve application state in the UI; we would like to be able to get, set and clear many values, all on a single cookie.
   * @author Jess Evans and Noah Sussman, Created 01:49:01 on TUE, JUL 31 2007
   * @constructor
   * @param cookieName The name of the cookie where we will store our serialized hash.
   * @param recordSeparator The character that will be used to separate serialized key/value pairs.
   * @param expiry Number of days until the cookie should expire.
   */
  Multitool : function (cookieName, recordSeparator, expiry) {
     /**
       * Set a value in the multi-cookie
      * @function
      * @param key Key to add/change in the hash
      * @param value Value to push to the hash
      */
      this.set = function(key, value) {
	var KVString = CB.cookie.get(cookieName, false);
	if (! KVString) {
	  CB.cookie.set(cookieName, key + '=' + value, expiry);
	} else {
	  var lookupTable = this.getWholeCookie(KVString);
	  lookupTable[key] = value;
	  //parse the lookup table as a string, then make that string the new value of the cookie
	  this.setWholeCookie( lookupTable );
	}
      }

      /**
      * Get one value from the serialized hash.
      * @param key The key whose value we want to retrieve from the serialized hash.
      */
      this.get = function (key) {
	var cookie = CB.cookie.get(cookieName, false);
	if(cookie)
	  return this.getWholeCookie( cookie )[ key ];
	else
	  return null;
      }

      /**
      * Delete one key/value pair from the serialized hash.
      * @param key The key of the key/value pair we want to delete.
      */
      this.remove = function (key) {
	var cookie = CB.cookie.get(cookieName, false);
	if(cookie)
	  {
	    var lookupTable = this.getWholeCookie( CB.cookie.get( cookieName, false ) );
	    var newTable = {};  //new object
	    for (var x in lookupTable) {
	      if (x == key) continue;
	      newTable[ x ] = lookupTable[ x ];
	    }
	    this.setWholeCookie( newTable );
	  }
	//else no cookie, ignore
      }

      /**
      * Load the serialized hash into memory.
      * @return A JavaScript object that represents the hash.
      * @param {String} KeyValuePairsAsString The serialized hash.
      */
      this.getWholeCookie = function (KeyValuePairsAsString) {
	var hashObject = {};    //new object
	var KVList = KeyValuePairsAsString.split( recordSeparator );
	//put the key=value pairs into the lookup table
	//Edge Case: if there are multiple key=value pairs for the same key, the last key will be kept, the others are destroyed
	CB.map(function(KVPair){
	    var pair = KVPair.split('=');
	    hashObject[pair[0]] = pair[1];
	  },
	  KVList);
	return hashObject;
      }

      /**
      * Dump the serialized hash as a string.
      * @return {String} The serialized hash.
      */
      this.toString = function() {
	return CB.cookie.get(cookieName, false);
      }

      /**
       * Serialize a JavaScript hash object and store it as the value of our cookie.
       * @param {Object} lookupTable A JavaScript object that will be stored in our cookie as the new serialized hash value.
      * @modified For QB jobs H11631 on 2007.11.05 by NS
      */
      this.setWholeCookie = function ( lookupTable ) {
	var newKVList = [];
	for (var key in lookupTable) {
	  if (typeof lookupTable[key] != 'string') continue;
	  newKVList.push( key + '=' + lookupTable[ key ] );
	}
	CB.cookie.set(cookieName, newKVList.join( recordSeparator ), expiry);
      }

      /**
      * Delete our cookie entirely.
      * Set the multi-cookie to expire at the end of the session.
      */
      this.expire = function()
      {
	CB.cookie.expire(cookieName);
      }
    }
 },

  /**
   * Assign an arbitrary event handler function to all elements of a given CSS class name.  Also allow for filtering by tag type and parent container (via Robert Nyman's getElementsByClassname).
   * @param eventHandler {Function} The event handler function.
   * @param onMouseAction The name of the mouse action, minus "on": "mouseover," "click," "hover," etc.
   * @param container ID of the container within which to assign the event by CSS class name.
   * @param tagName Tag to which to apply the event by CSS class name.
   * @param className CSS class name of elements that should get assigned the event handler.
   * @see #getElementsByClassName
   */
 assignEventByClassName : function (eventHandler, onMouseAction, container, tagName, className) {
    var triggers = CB.getElementsByClassName(container, tagName, className);
    CB.map(assignEvent, triggers);
    function assignEvent(el) {
      el['on' + onMouseAction ] = eventHandler;
    }
  },

  /**
   * Get the event object, and make sure that its 'target' property contains a reference to the element that triggered the event.
   * @param e The event object, on browsers that provide one.  If omitted, uses window.event instead.
   */
 getEvent : function (e) {
    var event = e || window.event;
    if( ! event.target ) {
      event.target = event.srcElement
	}
    return event;
  },

/**
  * Iterate over a list and apply a function to each item.
  * This was a clumsy first attempt at {@link CB.map} and should be factored out.
  * @deprecated use CB.map instead.
  * @param {array} list
  * @param {function} func A function that will be applied to each element in <code>list</code>
  */
 iterate : function (list, func) {
    for (var i=0; i< list.length; i++) {
      func(list, i);
      //func(list[i]) ...?
    }
 },

/**
  * Iterate over a list, applying a function to each item.
  * While JavaScript 1.6 implements Array.map(), this map method works on HTMLElementCollections as well as Arrays.
 * @author Noah Sussman, Sunday, September 30 2007
 * @param func {Function} The function to apply to each element in the list.
 * Since we pass the function first, we leave open the option of passing many parameters, which will be interpolated as the list.
 * func is passed the current item in the iteration, the list, and the iterator index.  In most cases we just need the current item.
 * The problem with the way I've set this up is that func pretty much as to be a private method, because there's no way to pass it extra prams.  Therefore it has to have access to all the prams passed in to the parent.
 * @param list A list of elements.
*/
 map : function (func, list) {
    for (var i=0; i< list.length; i++) {
      func(list[i], list, i);  //
    }
  },

/**
  * Keys does the same thing as Perls <code>keys()</code> subroutine.
  * @param {object} o An object.
  * @return {array} A list of all the property names in an object.
  */
 keys : function (o) {
    var accumulator = [];
    for (var propertyName in o) {
      accumulator.push(propertyName);
    }
    return accumulator;
  },


  /**
  * Wrapper for document.getElementById()  Intended to provide a sanity check against missing DOM elements.
  * @param  id_or_element_ref Pass this an ID or an object reference.
  * @param {Function} zero_or_more_functions Optionally also pass any number of functions that take the referenced object as a parameter.
  * @return Returns the object referenced in the first argument, if it exists.  Otherwise returns null.
  */
 get : function () {
   var el;
   var idOrEl = arguments[0];
   if (typeof idOrEl == 'string') {
     el = document.getElementById(idOrEl);
   } else {
     el = idOrEl;
   }
   if (el == null) return;  //sanity check
   for (var i=1; i< arguments.length; i++) {
     //if functions were passed as additional arguments, apply them now
     if (typeof arguments[i] == 'function') {
       arguments[i](el);
     }
   }
   return el;
 },

 /**
   * Toggle between two possible values of a variable.
   * @param currentvalue The current value of the variable.
   * @param value Toggle between this value and a default value.
   * @param defaultValue The default value.
   * @return A new value for the variable.
   * @example el.style.display = CB.toggle(el.style.display, 'none', 'block');
   */
 toggle: function (currentvalue, value, defaultvalue) {
    return (currentvalue == value ? defaultvalue : value);
  },

  /**
   * Toggle between two CSS class names.  Works on els with multiple classnames; that is, we can toggle one specific class name on an element without destroying other class associations that element might have.
   * @param el ID or reference to a DOM element.
   * @param newClassName New CSS class name for that element.
   * @param defaultClassName Class name to replace with the new name.
   * @example
   * CB.toggleClassname(el, 'selected', 'notSelected');
   */
 toggleClassname: function (el, newClassname, defaultClassname) {
    //    debugger;
    if (this.hasClass( el, defaultClassname)){
      var re = new RegExp("(^|\\s)" + defaultClassname + "(\\s|$)");
      el.className = el.className.replace(re, ' '+ newClassname +' ');
    } else if ( CB.iCanHasClass( el, newClassname)){
      var re = new RegExp("(^|\\s)" + newClassname + "(\\s|$)");
      el.className = el.className.replace(re, ' '+ defaultClassname +' ');
    } else {
      el.className += ' ' + newClassname;
    }
  },

/**
 * Paternity Test: Is 'child' descended from 'father'?
 * @param {Object} parent A DOM element.
 * @param {Object} child Another DOM element, which might be a descendant of the first DOM element.
 * @return {Boolean} True or false depending on whether or not the second element is really descended from the first.
 */
 hasChild : function (parent, child) {
    return this.findAncestor( child, function(el) { return parent == el });
  },

/**
 * Find Ancestor for which a function returns true.
 * @param el the el specified in the pram will be the FIRST el to which comparisonFunc is applied and found to return true.
 * That is, this function considers YOU to be YOUR OWN first ancestor.  Whether or not this really makes sense, it does make this function very convenient in that it applies comparisonfunction to each parentNode that it examines.
 * So not only can it be used for determining hiearchy, it is also a focused form of list.map()
 * @param comparisonFunc {Function} Find the first ancestor on which comparisonFunc evaluates to true.  Works the same way as a custom sort.
 * @return The first element for which comparisonFunc returns true.  Returns false if no such element is found.
 */
findAncestor : function (el, comparisonFunc) {
    if (comparisonFunc(el) == true) return el;
    else if (el.parentNode) {
      return arguments.callee(el.parentNode, comparisonFunc);
    }
    else return false;
  },

 /**
  * Crockford's object producer exposes true prototypal inheritance.
  * @see http://javascript.crockford.com/prototypal.html
  * @author Douglas Crockford
  * @param {Object} o An object.
  * @returns {Object} A new object whose prototype is the object passed as argument.
  */
 createObject : function (o) {
   function F() {}
   F.prototype = o;
   return new F();
 },

/*  createMethod : function (fun) { */
/*     this.prototype = CB;  */
/*     return fun; */
/*   } */


 /**
 *  Create a new popup window.
 *  @author Rob Zand
 *  @param url URI to load in the new popup window.
 *  @param  title Title of the new window.
 *  @param  w Width
 *  @param  h Height
 *  @param  r Resizeable
 *  @param  s Scroll bars?
 *  @param  m Menu bar?
 *  @param  t Tool bar?
 *  @param  l Location bar?
 *  @return {Boolean} false
 */
 popup : function (url, title, w, h, r, s, m, t, l) {
    if (title==null) {
		title = 'popup';
    }
    if (w==null) {
      w=600;
    }
    if (h==null) {
      h=400;
    }
    if (r==null) {
      r='yes';
    }
    if (s==null) {
      s='yes';
    }
    if (m==null) {
      m='no';
    }
    if (t==null) {
      t='no';
    }
    if (l==null) {
      l='no';
    }
    vars = 'width='+w+',height='+h+',resizable='+r+',scrollbars='+s+',menubar='+m+',toolbar='+t+',location='+l;
    var newWin = window.open(url,title,vars);
    newWin.focus();
    return false;
  },

/**
 * Writing current year formatted for inside footer
 * @author R. Zand
 */
 writeCurrentYr : function () {
	var now = new Date();
	document.write(now.getFullYear());
 },

 /**
  * Removes one CSS class name from a DOM element.  Can be used safely with elements having multiple class names.
  * @param obj Element from which to remove a CSS class name
  * @param className CSS class name to remove
  */
 removeClass : function (obj, className) {
	var re = new RegExp("(^|\\s)" + className + "(\\s|$)");
	obj.className = obj.className.replace(re, '');
  },

  /**
  * Add a CSS class to an element.  Supports objects with multiple class names, but only can add one class at a time.
  * @param obj The element to which the class will be added.
  * @param className  The name of the class to add.
  */
 addClass : function (obj, className) {
	if(!CB.iCanHasClass(obj,className)){
	if(obj.className){
		obj.className += " ";
	}
	obj.className += className;
	}
  },

/**
 * Determine if an object or class string contains a given class.
 * Matt Kruse's hasClass(), with slight modification.  Use to determine if a DOM object has a particular CSS class, or to find out if a className string contains a given CSS class.
  * @author Matt Kruse
  * @see http://groups.google.com/group/comp.lang.javascript/browse_thread/thread/b68cac304ee6de78/e445c1df18698a3f?lnk=gst&q=hasclass&rnum=3
  * @param obj A String or a DOM element to examine
  * @param className The CSS class name for which to search
  * @return {Boolean} True if the class name was found, otherwise false.
 */
 hasClass : function(obj, className) {
    if (typeof obj == 'undefined' || obj==null || !RegExp) { return false; }     var re = new RegExp("(^|\\s)" + className + "(\\s|$)");
    if (typeof(obj)=="string") {
      return re.test(obj);
    }
    else if (typeof(obj)=="object" && obj.className) {
      return re.test(obj.className);
    }
    return false;
  },

 /**
  * Get DOM elements having a particular CSS class name or names.  Allows for filtering by tag name, and for only searching within a specific container.
  * @author Robert Nyman
  * @see http://www.robertnyman.com/2005/11/07/the-ultimate-getelementsbyclassname
  * @param {Object} oElm An optional container within which to search (recommended).
  * @param strTagName Optionally search only elements that are instances of this type of HTML tag.
  * @param oClassNames Class name(s) for which to search.
  */
 getElementsByClassName : function (oElm, strTagName, oClassNames) {
    oElm = CB.get(oElm);  //accept either an element or the ID of an element
    var arrElements = (strTagName == "*" && oElm.all)? oElm.all : oElm.getElementsByTagName(strTagName);
    var arrReturnElements = new Array();
    var arrRegExpClassNames = new Array();
    if(typeof oClassNames == "object"){
      for(var i=0; i<oClassNames.length; i++){
	arrRegExpClassNames.push(new RegExp("(^|\\s)" + oClassNames[i].replace(/\-/g, "\\-") + "(\\s|$)"));
      }
    }
    else{
      arrRegExpClassNames.push(new RegExp("(^|\\s)" + oClassNames.replace(/\-/g, "\\-") + "(\\s|$)"));
    }
    var oElement;
    var bMatchesAll;
    for(var j=0; j<arrElements.length; j++){
      oElement = arrElements[j];
      bMatchesAll = true;
      for(var k=0; k<arrRegExpClassNames.length; k++){
	if(!arrRegExpClassNames[k].test(oElement.className)){
	  bMatchesAll = false;
	  break;
	}
      }
      if(bMatchesAll){
	arrReturnElements.push(oElement);
      }
    }
    return (arrReturnElements)
  }
}

/**
 * lolcode goofiness, just a wrapper for {@link CB.hasClass}
 * @function
 * @type lolcode
 */
  CB.iCanHasClass = CB.hasClass;  //roflchoptar!
