/*!
 * jQuery JavaScript Library v1.12.4-aem
 * http://jquery.com/
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2016-05-20T17:17Z
 */

(function( global, factory ) {

	if ( typeof module === "object" && typeof module.exports === "object" ) {
		// For CommonJS and CommonJS-like environments where a proper `window`
		// is present, execute the factory and get jQuery.
		// For environments that do not have a `window` with a `document`
		// (such as Node.js), expose a factory as module.exports.
		// This accentuates the need for the creation of a real `window`.
		// e.g. var jQuery = require("jquery")(window);
		// See ticket #14549 for more info.
		module.exports = global.document ?
			factory( global, true ) :
			function( w ) {
				if ( !w.document ) {
					throw new Error( "jQuery requires a window with a document" );
				}
				return factory( w );
			};
	} else {
		factory( global );
	}

// Pass this if window is not defined yet
}(typeof window !== "undefined" ? window : this, function( window, noGlobal ) {

// Support: Firefox 18+
// Can't be in strict mode, several libs including ASP.NET trace
// the stack via arguments.caller.callee and Firefox dies if
// you try to trace through "use strict" call chains. (#13335)
//"use strict";
var deletedIds = [];

var document = window.document;

var slice = deletedIds.slice;

var concat = deletedIds.concat;

var push = deletedIds.push;

var indexOf = deletedIds.indexOf;

var class2type = {};

var toString = class2type.toString;

var hasOwn = class2type.hasOwnProperty;

var support = {};



var
	version = "1.12.4-aem",

	// Define a local copy of jQuery
	jQuery = function( selector, context ) {

		// The jQuery object is actually just the init constructor 'enhanced'
		// Need init if jQuery is called (just allow error to be thrown if not included)
		return new jQuery.fn.init( selector, context );
	},

	// Support: Android<4.1, IE<9
	// Make sure we trim BOM and NBSP
	rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,

	// Matches dashed string for camelizing
	rmsPrefix = /^-ms-/,
	rdashAlpha = /-([\da-z])/gi,

	// Used by jQuery.camelCase as callback to replace()
	fcamelCase = function( all, letter ) {
		return letter.toUpperCase();
	};

jQuery.fn = jQuery.prototype = {

	// The current version of jQuery being used
	jquery: version,

	constructor: jQuery,

	// Start with an empty selector
	selector: "",

	// The default length of a jQuery object is 0
	length: 0,

	toArray: function() {
		return slice.call( this );
	},

	// Get the Nth element in the matched element set OR
	// Get the whole matched element set as a clean array
	get: function( num ) {
		return num != null ?

			// Return just the one element from the set
			( num < 0 ? this[ num + this.length ] : this[ num ] ) :

			// Return all the elements in a clean array
			slice.call( this );
	},

	// Take an array of elements and push it onto the stack
	// (returning the new matched element set)
	pushStack: function( elems ) {

		// Build a new jQuery matched element set
		var ret = jQuery.merge( this.constructor(), elems );

		// Add the old object onto the stack (as a reference)
		ret.prevObject = this;
		ret.context = this.context;

		// Return the newly-formed element set
		return ret;
	},

	// Execute a callback for every element in the matched set.
	each: function( callback ) {
		return jQuery.each( this, callback );
	},

	map: function( callback ) {
		return this.pushStack( jQuery.map( this, function( elem, i ) {
			return callback.call( elem, i, elem );
		} ) );
	},

	slice: function() {
		return this.pushStack( slice.apply( this, arguments ) );
	},

	first: function() {
		return this.eq( 0 );
	},

	last: function() {
		return this.eq( -1 );
	},

	eq: function( i ) {
		var len = this.length,
			j = +i + ( i < 0 ? len : 0 );
		return this.pushStack( j >= 0 && j < len ? [ this[ j ] ] : [] );
	},

	end: function() {
		return this.prevObject || this.constructor();
	},

	// For internal use only.
	// Behaves like an Array's method, not like a jQuery method.
	push: push,
	sort: deletedIds.sort,
	splice: deletedIds.splice
};

jQuery.extend = jQuery.fn.extend = function() {
	var src, copyIsArray, copy, name, options, clone,
		target = arguments[ 0 ] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;

		// skip the boolean and the target
		target = arguments[ i ] || {};
		i++;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !jQuery.isFunction( target ) ) {
		target = {};
	}

	// extend jQuery itself if only one argument is passed
	if ( i === length ) {
		target = this;
		i--;
	}

	for ( ; i < length; i++ ) {

		// Only deal with non-null/undefined values
		if ( ( options = arguments[ i ] ) != null ) {

			// Extend the base object
			for ( name in options ) {
				src = target[ name ];
				copy = options[ name ];

				// Prevent never-ending loop
				// Prevent Prototype Pollution Vulnerability
				if ( name === "__proto__" || target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( jQuery.isPlainObject( copy ) ||
					( copyIsArray = jQuery.isArray( copy ) ) ) ) {

					if ( copyIsArray ) {
						copyIsArray = false;
						clone = src && jQuery.isArray( src ) ? src : [];

					} else {
						clone = src && jQuery.isPlainObject( src ) ? src : {};
					}

					// Never move original objects, clone them
					target[ name ] = jQuery.extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

jQuery.extend( {

	// Unique for each copy of jQuery on the page
	expando: "jQuery" + ( version + Math.random() ).replace( /\D/g, "" ),

	// Assume jQuery is ready without the ready module
	isReady: true,

	error: function( msg ) {
		throw new Error( msg );
	},

	noop: function() {},

	// See test/unit/core.js for details concerning isFunction.
	// Since version 1.3, DOM methods and functions like alert
	// aren't supported. They return false on IE (#2968).
	isFunction: function( obj ) {
		return jQuery.type( obj ) === "function";
	},

	isArray: Array.isArray || function( obj ) {
		return jQuery.type( obj ) === "array";
	},

	isWindow: function( obj ) {
		/* jshint eqeqeq: false */
		return obj != null && obj == obj.window;
	},

	isNumeric: function( obj ) {

		// parseFloat NaNs numeric-cast false positives (null|true|false|"")
		// ...but misinterprets leading-number strings, particularly hex literals ("0x...")
		// subtraction forces infinities to NaN
		// adding 1 corrects loss of precision from parseFloat (#15100)
		var realStringObj = obj && obj.toString();
		return !jQuery.isArray( obj ) && ( realStringObj - parseFloat( realStringObj ) + 1 ) >= 0;
	},

	isEmptyObject: function( obj ) {
		var name;
		for ( name in obj ) {
			return false;
		}
		return true;
	},

	isPlainObject: function( obj ) {
		var key;

		// Must be an Object.
		// Because of IE, we also have to check the presence of the constructor property.
		// Make sure that DOM nodes and window objects don't pass through, as well
		if ( !obj || jQuery.type( obj ) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
			return false;
		}

		try {

			// Not own constructor property must be Object
			if ( obj.constructor &&
				!hasOwn.call( obj, "constructor" ) &&
				!hasOwn.call( obj.constructor.prototype, "isPrototypeOf" ) ) {
				return false;
			}
		} catch ( e ) {

			// IE8,9 Will throw exceptions on certain host objects #9897
			return false;
		}

		// Support: IE<9
		// Handle iteration over inherited properties before own properties.
		if ( !support.ownFirst ) {
			for ( key in obj ) {
				return hasOwn.call( obj, key );
			}
		}

		// Own properties are enumerated firstly, so to speed up,
		// if last one is own, then all properties are own.
		for ( key in obj ) {}

		return key === undefined || hasOwn.call( obj, key );
	},

	type: function( obj ) {
		if ( obj == null ) {
			return obj + "";
		}
		return typeof obj === "object" || typeof obj === "function" ?
			class2type[ toString.call( obj ) ] || "object" :
			typeof obj;
	},

	// Workarounds based on findings by Jim Driscoll
	// http://weblogs.java.net/blog/driscoll/archive/2009/09/08/eval-javascript-global-context
	globalEval: function( data ) {
		if ( data && jQuery.trim( data ) ) {

			// We use execScript on Internet Explorer
			// We use an anonymous function so that context is window
			// rather than jQuery in Firefox
			( window.execScript || function( data ) {
				window[ "eval" ].call( window, data ); // jscs:ignore requireDotNotation
			} )( data );
		}
	},

	// Convert dashed to camelCase; used by the css and data modules
	// Microsoft forgot to hump their vendor prefix (#9572)
	camelCase: function( string ) {
		return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
	},

	nodeName: function( elem, name ) {
		return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
	},

	each: function( obj, callback ) {
		var length, i = 0;

		if ( isArrayLike( obj ) ) {
			length = obj.length;
			for ( ; i < length; i++ ) {
				if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
					break;
				}
			}
		} else {
			for ( i in obj ) {
				if ( callback.call( obj[ i ], i, obj[ i ] ) === false ) {
					break;
				}
			}
		}

		return obj;
	},

	// Support: Android<4.1, IE<9
	trim: function( text ) {
		return text == null ?
			"" :
			( text + "" ).replace( rtrim, "" );
	},

	// results is for internal usage only
	makeArray: function( arr, results ) {
		var ret = results || [];

		if ( arr != null ) {
			if ( isArrayLike( Object( arr ) ) ) {
				jQuery.merge( ret,
					typeof arr === "string" ?
					[ arr ] : arr
				);
			} else {
				push.call( ret, arr );
			}
		}

		return ret;
	},

	inArray: function( elem, arr, i ) {
		var len;

		if ( arr ) {
			if ( indexOf ) {
				return indexOf.call( arr, elem, i );
			}

			len = arr.length;
			i = i ? i < 0 ? Math.max( 0, len + i ) : i : 0;

			for ( ; i < len; i++ ) {

				// Skip accessing in sparse arrays
				if ( i in arr && arr[ i ] === elem ) {
					return i;
				}
			}
		}

		return -1;
	},

	merge: function( first, second ) {
		var len = +second.length,
			j = 0,
			i = first.length;

		while ( j < len ) {
			first[ i++ ] = second[ j++ ];
		}

		// Support: IE<9
		// Workaround casting of .length to NaN on otherwise arraylike objects (e.g., NodeLists)
		if ( len !== len ) {
			while ( second[ j ] !== undefined ) {
				first[ i++ ] = second[ j++ ];
			}
		}

		first.length = i;

		return first;
	},

	grep: function( elems, callback, invert ) {
		var callbackInverse,
			matches = [],
			i = 0,
			length = elems.length,
			callbackExpect = !invert;

		// Go through the array, only saving the items
		// that pass the validator function
		for ( ; i < length; i++ ) {
			callbackInverse = !callback( elems[ i ], i );
			if ( callbackInverse !== callbackExpect ) {
				matches.push( elems[ i ] );
			}
		}

		return matches;
	},

	// arg is for internal usage only
	map: function( elems, callback, arg ) {
		var length, value,
			i = 0,
			ret = [];

		// Go through the array, translating each of the items to their new values
		if ( isArrayLike( elems ) ) {
			length = elems.length;
			for ( ; i < length; i++ ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret.push( value );
				}
			}

		// Go through every key on the object,
		} else {
			for ( i in elems ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret.push( value );
				}
			}
		}

		// Flatten any nested arrays
		return concat.apply( [], ret );
	},

	// A global GUID counter for objects
	guid: 1,

	// Bind a function to a context, optionally partially applying any
	// arguments.
	proxy: function( fn, context ) {
		var args, proxy, tmp;

		if ( typeof context === "string" ) {
			tmp = fn[ context ];
			context = fn;
			fn = tmp;
		}

		// Quick check to determine if target is callable, in the spec
		// this throws a TypeError, but we will just return undefined.
		if ( !jQuery.isFunction( fn ) ) {
			return undefined;
		}

		// Simulated bind
		args = slice.call( arguments, 2 );
		proxy = function() {
			return fn.apply( context || this, args.concat( slice.call( arguments ) ) );
		};

		// Set the guid of unique handler to the same of original handler, so it can be removed
		proxy.guid = fn.guid = fn.guid || jQuery.guid++;

		return proxy;
	},

	now: function() {
		return +( new Date() );
	},

	// jQuery.support is not used in Core but other projects attach their
	// properties to it so it needs to exist.
	support: support
} );

// JSHint would error on this code due to the Symbol not being defined in ES5.
// Defining this global in .jshintrc would create a danger of using the global
// unguarded in another place, it seems safer to just disable JSHint for these
// three lines.
/* jshint ignore: start */
if ( typeof Symbol === "function" ) {
	jQuery.fn[ Symbol.iterator ] = deletedIds[ Symbol.iterator ];
}
/* jshint ignore: end */

// Populate the class2type map
jQuery.each( "Boolean Number String Function Array Date RegExp Object Error Symbol".split( " " ),
function( i, name ) {
	class2type[ "[object " + name + "]" ] = name.toLowerCase();
} );

function isArrayLike( obj ) {

	// Support: iOS 8.2 (not reproducible in simulator)
	// `in` check used to prevent JIT error (gh-2145)
	// hasOwn isn't used here due to false negatives
	// regarding Nodelist length in IE
	var length = !!obj && "length" in obj && obj.length,
		type = jQuery.type( obj );

	if ( type === "function" || jQuery.isWindow( obj ) ) {
		return false;
	}

	return type === "array" || length === 0 ||
		typeof length === "number" && length > 0 && ( length - 1 ) in obj;
}
var Sizzle =
/*!
 * Sizzle CSS Selector Engine v2.2.1
 * http://sizzlejs.com/
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2015-10-17
 */
(function( window ) {

var i,
	support,
	Expr,
	getText,
	isXML,
	tokenize,
	compile,
	select,
	outermostContext,
	sortInput,
	hasDuplicate,

	// Local document vars
	setDocument,
	document,
	docElem,
	documentIsHTML,
	rbuggyQSA,
	rbuggyMatches,
	matches,
	contains,

	// Instance-specific data
	expando = "sizzle" + 1 * new Date(),
	preferredDoc = window.document,
	dirruns = 0,
	done = 0,
	classCache = createCache(),
	tokenCache = createCache(),
	compilerCache = createCache(),
	sortOrder = function( a, b ) {
		if ( a === b ) {
			hasDuplicate = true;
		}
		return 0;
	},

	// General-purpose constants
	MAX_NEGATIVE = 1 << 31,

	// Instance methods
	hasOwn = ({}).hasOwnProperty,
	arr = [],
	pop = arr.pop,
	push_native = arr.push,
	push = arr.push,
	slice = arr.slice,
	// Use a stripped-down indexOf as it's faster than native
	// http://jsperf.com/thor-indexof-vs-for/5
	indexOf = function( list, elem ) {
		var i = 0,
			len = list.length;
		for ( ; i < len; i++ ) {
			if ( list[i] === elem ) {
				return i;
			}
		}
		return -1;
	},

	booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",

	// Regular expressions

	// http://www.w3.org/TR/css3-selectors/#whitespace
	whitespace = "[\\x20\\t\\r\\n\\f]",

	// http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
	identifier = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",

	// Attribute selectors: http://www.w3.org/TR/selectors/#attribute-selectors
	attributes = "\\[" + whitespace + "*(" + identifier + ")(?:" + whitespace +
		// Operator (capture 2)
		"*([*^$|!~]?=)" + whitespace +
		// "Attribute values must be CSS identifiers [capture 5] or strings [capture 3 or capture 4]"
		"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + identifier + "))|)" + whitespace +
		"*\\]",

	pseudos = ":(" + identifier + ")(?:\\((" +
		// To reduce the number of selectors needing tokenize in the preFilter, prefer arguments:
		// 1. quoted (capture 3; capture 4 or capture 5)
		"('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|" +
		// 2. simple (capture 6)
		"((?:\\\\.|[^\\\\()[\\]]|" + attributes + ")*)|" +
		// 3. anything else (capture 2)
		".*" +
		")\\)|)",

	// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
	rwhitespace = new RegExp( whitespace + "+", "g" ),
	rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g" ),

	rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
	rcombinators = new RegExp( "^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*" ),

	rattributeQuotes = new RegExp( "=" + whitespace + "*([^\\]'\"]*?)" + whitespace + "*\\]", "g" ),

	rpseudo = new RegExp( pseudos ),
	ridentifier = new RegExp( "^" + identifier + "$" ),

	matchExpr = {
		"ID": new RegExp( "^#(" + identifier + ")" ),
		"CLASS": new RegExp( "^\\.(" + identifier + ")" ),
		"TAG": new RegExp( "^(" + identifier + "|[*])" ),
		"ATTR": new RegExp( "^" + attributes ),
		"PSEUDO": new RegExp( "^" + pseudos ),
		"CHILD": new RegExp( "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace +
			"*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
			"*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
		"bool": new RegExp( "^(?:" + booleans + ")$", "i" ),
		// For use in libraries implementing .is()
		// We use this for POS matching in `select`
		"needsContext": new RegExp( "^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
			whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" )
	},

	rinputs = /^(?:input|select|textarea|button)$/i,
	rheader = /^h\d$/i,

	rnative = /^[^{]+\{\s*\[native \w/,

	// Easily-parseable/retrievable ID or TAG or CLASS selectors
	rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

	rsibling = /[+~]/,
	rescape = /'|\\/g,

	// CSS escapes http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
	runescape = new RegExp( "\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig" ),
	funescape = function( _, escaped, escapedWhitespace ) {
		var high = "0x" + escaped - 0x10000;
		// NaN means non-codepoint
		// Support: Firefox<24
		// Workaround erroneous numeric interpretation of +"0x"
		return high !== high || escapedWhitespace ?
			escaped :
			high < 0 ?
				// BMP codepoint
				String.fromCharCode( high + 0x10000 ) :
				// Supplemental Plane codepoint (surrogate pair)
				String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
	},

	// Used for iframes
	// See setDocument()
	// Removing the function wrapper causes a "Permission Denied"
	// error in IE
	unloadHandler = function() {
		setDocument();
	};

// Optimize for push.apply( _, NodeList )
try {
	push.apply(
		(arr = slice.call( preferredDoc.childNodes )),
		preferredDoc.childNodes
	);
	// Support: Android<4.0
	// Detect silently failing push.apply
	arr[ preferredDoc.childNodes.length ].nodeType;
} catch ( e ) {
	push = { apply: arr.length ?

		// Leverage slice if possible
		function( target, els ) {
			push_native.apply( target, slice.call(els) );
		} :

		// Support: IE<9
		// Otherwise append directly
		function( target, els ) {
			var j = target.length,
				i = 0;
			// Can't trust NodeList.length
			while ( (target[j++] = els[i++]) ) {}
			target.length = j - 1;
		}
	};
}

function Sizzle( selector, context, results, seed ) {
	var m, i, elem, nid, nidselect, match, groups, newSelector,
		newContext = context && context.ownerDocument,

		// nodeType defaults to 9, since context defaults to document
		nodeType = context ? context.nodeType : 9;

	results = results || [];

	// Return early from calls with invalid selector or context
	if ( typeof selector !== "string" || !selector ||
		nodeType !== 1 && nodeType !== 9 && nodeType !== 11 ) {

		return results;
	}

	// Try to shortcut find operations (as opposed to filters) in HTML documents
	if ( !seed ) {

		if ( ( context ? context.ownerDocument || context : preferredDoc ) !== document ) {
			setDocument( context );
		}
		context = context || document;

		if ( documentIsHTML ) {

			// If the selector is sufficiently simple, try using a "get*By*" DOM method
			// (excepting DocumentFragment context, where the methods don't exist)
			if ( nodeType !== 11 && (match = rquickExpr.exec( selector )) ) {

				// ID selector
				if ( (m = match[1]) ) {

					// Document context
					if ( nodeType === 9 ) {
						if ( (elem = context.getElementById( m )) ) {

							// Support: IE, Opera, Webkit
							// TODO: identify versions
							// getElementById can match elements by name instead of ID
							if ( elem.id === m ) {
								results.push( elem );
								return results;
							}
						} else {
							return results;
						}

					// Element context
					} else {

						// Support: IE, Opera, Webkit
						// TODO: identify versions
						// getElementById can match elements by name instead of ID
						if ( newContext && (elem = newContext.getElementById( m )) &&
							contains( context, elem ) &&
							elem.id === m ) {

							results.push( elem );
							return results;
						}
					}

				// Type selector
				} else if ( match[2] ) {
					push.apply( results, context.getElementsByTagName( selector ) );
					return results;

				// Class selector
				} else if ( (m = match[3]) && support.getElementsByClassName &&
					context.getElementsByClassName ) {

					push.apply( results, context.getElementsByClassName( m ) );
					return results;
				}
			}

			// Take advantage of querySelectorAll
			if ( support.qsa &&
				!compilerCache[ selector + " " ] &&
				(!rbuggyQSA || !rbuggyQSA.test( selector )) ) {

				if ( nodeType !== 1 ) {
					newContext = context;
					newSelector = selector;

				// qSA looks outside Element context, which is not what we want
				// Thanks to Andrew Dupont for this workaround technique
				// Support: IE <=8
				// Exclude object elements
				} else if ( context.nodeName.toLowerCase() !== "object" ) {

					// Capture the context ID, setting it first if necessary
					if ( (nid = context.getAttribute( "id" )) ) {
						nid = nid.replace( rescape, "\\$&" );
					} else {
						context.setAttribute( "id", (nid = expando) );
					}

					// Prefix every selector in the list
					groups = tokenize( selector );
					i = groups.length;
					nidselect = ridentifier.test( nid ) ? "#" + nid : "[id='" + nid + "']";
					while ( i-- ) {
						groups[i] = nidselect + " " + toSelector( groups[i] );
					}
					newSelector = groups.join( "," );

					// Expand context for sibling selectors
					newContext = rsibling.test( selector ) && testContext( context.parentNode ) ||
						context;
				}

				if ( newSelector ) {
					try {
						push.apply( results,
							newContext.querySelectorAll( newSelector )
						);
						return results;
					} catch ( qsaError ) {
					} finally {
						if ( nid === expando ) {
							context.removeAttribute( "id" );
						}
					}
				}
			}
		}
	}

	// All others
	return select( selector.replace( rtrim, "$1" ), context, results, seed );
}

/**
 * Create key-value caches of limited size
 * @returns {function(string, object)} Returns the Object data after storing it on itself with
 *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
 *	deleting the oldest entry
 */
function createCache() {
	var keys = [];

	function cache( key, value ) {
		// Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
		if ( keys.push( key + " " ) > Expr.cacheLength ) {
			// Only keep the most recent entries
			delete cache[ keys.shift() ];
		}
		return (cache[ key + " " ] = value);
	}
	return cache;
}

/**
 * Mark a function for special use by Sizzle
 * @param {Function} fn The function to mark
 */
function markFunction( fn ) {
	fn[ expando ] = true;
	return fn;
}

/**
 * Support testing using an element
 * @param {Function} fn Passed the created div and expects a boolean result
 */
function assert( fn ) {
	var div = document.createElement("div");

	try {
		return !!fn( div );
	} catch (e) {
		return false;
	} finally {
		// Remove from its parent by default
		if ( div.parentNode ) {
			div.parentNode.removeChild( div );
		}
		// release memory in IE
		div = null;
	}
}

/**
 * Adds the same handler for all of the specified attrs
 * @param {String} attrs Pipe-separated list of attributes
 * @param {Function} handler The method that will be applied
 */
function addHandle( attrs, handler ) {
	var arr = attrs.split("|"),
		i = arr.length;

	while ( i-- ) {
		Expr.attrHandle[ arr[i] ] = handler;
	}
}

/**
 * Checks document order of two siblings
 * @param {Element} a
 * @param {Element} b
 * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
 */
function siblingCheck( a, b ) {
	var cur = b && a,
		diff = cur && a.nodeType === 1 && b.nodeType === 1 &&
			( ~b.sourceIndex || MAX_NEGATIVE ) -
			( ~a.sourceIndex || MAX_NEGATIVE );

	// Use IE sourceIndex if available on both nodes
	if ( diff ) {
		return diff;
	}

	// Check if b follows a
	if ( cur ) {
		while ( (cur = cur.nextSibling) ) {
			if ( cur === b ) {
				return -1;
			}
		}
	}

	return a ? 1 : -1;
}

/**
 * Returns a function to use in pseudos for input types
 * @param {String} type
 */
function createInputPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return name === "input" && elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for buttons
 * @param {String} type
 */
function createButtonPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return (name === "input" || name === "button") && elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for positionals
 * @param {Function} fn
 */
function createPositionalPseudo( fn ) {
	return markFunction(function( argument ) {
		argument = +argument;
		return markFunction(function( seed, matches ) {
			var j,
				matchIndexes = fn( [], seed.length, argument ),
				i = matchIndexes.length;

			// Match elements found at the specified indexes
			while ( i-- ) {
				if ( seed[ (j = matchIndexes[i]) ] ) {
					seed[j] = !(matches[j] = seed[j]);
				}
			}
		});
	});
}

/**
 * Checks a node for validity as a Sizzle context
 * @param {Element|Object=} context
 * @returns {Element|Object|Boolean} The input node if acceptable, otherwise a falsy value
 */
function testContext( context ) {
	return context && typeof context.getElementsByTagName !== "undefined" && context;
}

// Expose support vars for convenience
support = Sizzle.support = {};

/**
 * Detects XML nodes
 * @param {Element|Object} elem An element or a document
 * @returns {Boolean} True iff elem is a non-HTML XML node
 */
isXML = Sizzle.isXML = function( elem ) {
	// documentElement is verified for cases where it doesn't yet exist
	// (such as loading iframes in IE - #4833)
	var documentElement = elem && (elem.ownerDocument || elem).documentElement;
	return documentElement ? documentElement.nodeName !== "HTML" : false;
};

/**
 * Sets document-related variables once based on the current document
 * @param {Element|Object} [doc] An element or document object to use to set the document
 * @returns {Object} Returns the current document
 */
setDocument = Sizzle.setDocument = function( node ) {
	var hasCompare, parent,
		doc = node ? node.ownerDocument || node : preferredDoc;

	// Return early if doc is invalid or already selected
	if ( doc === document || doc.nodeType !== 9 || !doc.documentElement ) {
		return document;
	}

	// Update global variables
	document = doc;
	docElem = document.documentElement;
	documentIsHTML = !isXML( document );

	// Support: IE 9-11, Edge
	// Accessing iframe documents after unload throws "permission denied" errors (jQuery #13936)
	if ( (parent = document.defaultView) && parent.top !== parent ) {
		// Support: IE 11
		if ( parent.addEventListener ) {
			parent.addEventListener( "unload", unloadHandler, false );

		// Support: IE 9 - 10 only
		} else if ( parent.attachEvent ) {
			parent.attachEvent( "onunload", unloadHandler );
		}
	}

	/* Attributes
	---------------------------------------------------------------------- */

	// Support: IE<8
	// Verify that getAttribute really returns attributes and not properties
	// (excepting IE8 booleans)
	support.attributes = assert(function( div ) {
		div.className = "i";
		return !div.getAttribute("className");
	});

	/* getElement(s)By*
	---------------------------------------------------------------------- */

	// Check if getElementsByTagName("*") returns only elements
	support.getElementsByTagName = assert(function( div ) {
		div.appendChild( document.createComment("") );
		return !div.getElementsByTagName("*").length;
	});

	// Support: IE<9
	support.getElementsByClassName = rnative.test( document.getElementsByClassName );

	// Support: IE<10
	// Check if getElementById returns elements by name
	// The broken getElementById methods don't pick up programatically-set names,
	// so use a roundabout getElementsByName test
	support.getById = assert(function( div ) {
		docElem.appendChild( div ).id = expando;
		return !document.getElementsByName || !document.getElementsByName( expando ).length;
	});

	// ID find and filter
	if ( support.getById ) {
		Expr.find["ID"] = function( id, context ) {
			if ( typeof context.getElementById !== "undefined" && documentIsHTML ) {
				var m = context.getElementById( id );
				return m ? [ m ] : [];
			}
		};
		Expr.filter["ID"] = function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				return elem.getAttribute("id") === attrId;
			};
		};
	} else {
		// Support: IE6/7
		// getElementById is not reliable as a find shortcut
		delete Expr.find["ID"];

		Expr.filter["ID"] =  function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				var node = typeof elem.getAttributeNode !== "undefined" &&
					elem.getAttributeNode("id");
				return node && node.value === attrId;
			};
		};
	}

	// Tag
	Expr.find["TAG"] = support.getElementsByTagName ?
		function( tag, context ) {
			if ( typeof context.getElementsByTagName !== "undefined" ) {
				return context.getElementsByTagName( tag );

			// DocumentFragment nodes don't have gEBTN
			} else if ( support.qsa ) {
				return context.querySelectorAll( tag );
			}
		} :

		function( tag, context ) {
			var elem,
				tmp = [],
				i = 0,
				// By happy coincidence, a (broken) gEBTN appears on DocumentFragment nodes too
				results = context.getElementsByTagName( tag );

			// Filter out possible comments
			if ( tag === "*" ) {
				while ( (elem = results[i++]) ) {
					if ( elem.nodeType === 1 ) {
						tmp.push( elem );
					}
				}

				return tmp;
			}
			return results;
		};

	// Class
	Expr.find["CLASS"] = support.getElementsByClassName && function( className, context ) {
		if ( typeof context.getElementsByClassName !== "undefined" && documentIsHTML ) {
			return context.getElementsByClassName( className );
		}
	};

	/* QSA/matchesSelector
	---------------------------------------------------------------------- */

	// QSA and matchesSelector support

	// matchesSelector(:active) reports false when true (IE9/Opera 11.5)
	rbuggyMatches = [];

	// qSa(:focus) reports false when true (Chrome 21)
	// We allow this because of a bug in IE8/9 that throws an error
	// whenever `document.activeElement` is accessed on an iframe
	// So, we allow :focus to pass through QSA all the time to avoid the IE error
	// See http://bugs.jquery.com/ticket/13378
	rbuggyQSA = [];

	if ( (support.qsa = rnative.test( document.querySelectorAll )) ) {
		// Build QSA regex
		// Regex strategy adopted from Diego Perini
		assert(function( div ) {
			// Select is set to empty string on purpose
			// This is to test IE's treatment of not explicitly
			// setting a boolean content attribute,
			// since its presence should be enough
			// http://bugs.jquery.com/ticket/12359
			docElem.appendChild( div ).innerHTML = "<a id='" + expando + "'></a>" +
				"<select id='" + expando + "-\r\\' msallowcapture=''>" +
				"<option selected=''></option></select>";

			// Support: IE8, Opera 11-12.16
			// Nothing should be selected when empty strings follow ^= or $= or *=
			// The test attribute must be unknown in Opera but "safe" for WinRT
			// http://msdn.microsoft.com/en-us/library/ie/hh465388.aspx#attribute_section
			if ( div.querySelectorAll("[msallowcapture^='']").length ) {
				rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:''|\"\")" );
			}

			// Support: IE8
			// Boolean attributes and "value" are not treated correctly
			if ( !div.querySelectorAll("[selected]").length ) {
				rbuggyQSA.push( "\\[" + whitespace + "*(?:value|" + booleans + ")" );
			}

			// Support: Chrome<29, Android<4.4, Safari<7.0+, iOS<7.0+, PhantomJS<1.9.8+
			if ( !div.querySelectorAll( "[id~=" + expando + "-]" ).length ) {
				rbuggyQSA.push("~=");
			}

			// Webkit/Opera - :checked should return selected option elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			// IE8 throws error here and will not see later tests
			if ( !div.querySelectorAll(":checked").length ) {
				rbuggyQSA.push(":checked");
			}

			// Support: Safari 8+, iOS 8+
			// https://bugs.webkit.org/show_bug.cgi?id=136851
			// In-page `selector#id sibing-combinator selector` fails
			if ( !div.querySelectorAll( "a#" + expando + "+*" ).length ) {
				rbuggyQSA.push(".#.+[+~]");
			}
		});

		assert(function( div ) {
			// Support: Windows 8 Native Apps
			// The type and name attributes are restricted during .innerHTML assignment
			var input = document.createElement("input");
			input.setAttribute( "type", "hidden" );
			div.appendChild( input ).setAttribute( "name", "D" );

			// Support: IE8
			// Enforce case-sensitivity of name attribute
			if ( div.querySelectorAll("[name=d]").length ) {
				rbuggyQSA.push( "name" + whitespace + "*[*^$|!~]?=" );
			}

			// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
			// IE8 throws error here and will not see later tests
			if ( !div.querySelectorAll(":enabled").length ) {
				rbuggyQSA.push( ":enabled", ":disabled" );
			}

			// Opera 10-11 does not throw on post-comma invalid pseudos
			div.querySelectorAll("*,:x");
			rbuggyQSA.push(",.*:");
		});
	}

	if ( (support.matchesSelector = rnative.test( (matches = docElem.matches ||
		docElem.webkitMatchesSelector ||
		docElem.mozMatchesSelector ||
		docElem.oMatchesSelector ||
		docElem.msMatchesSelector) )) ) {

		assert(function( div ) {
			// Check to see if it's possible to do matchesSelector
			// on a disconnected node (IE 9)
			support.disconnectedMatch = matches.call( div, "div" );

			// This should fail with an exception
			// Gecko does not error, returns false instead
			matches.call( div, "[s!='']:x" );
			rbuggyMatches.push( "!=", pseudos );
		});
	}

	rbuggyQSA = rbuggyQSA.length && new RegExp( rbuggyQSA.join("|") );
	rbuggyMatches = rbuggyMatches.length && new RegExp( rbuggyMatches.join("|") );

	/* Contains
	---------------------------------------------------------------------- */
	hasCompare = rnative.test( docElem.compareDocumentPosition );

	// Element contains another
	// Purposefully self-exclusive
	// As in, an element does not contain itself
	contains = hasCompare || rnative.test( docElem.contains ) ?
		function( a, b ) {
			var adown = a.nodeType === 9 ? a.documentElement : a,
				bup = b && b.parentNode;
			return a === bup || !!( bup && bup.nodeType === 1 && (
				adown.contains ?
					adown.contains( bup ) :
					a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
			));
		} :
		function( a, b ) {
			if ( b ) {
				while ( (b = b.parentNode) ) {
					if ( b === a ) {
						return true;
					}
				}
			}
			return false;
		};

	/* Sorting
	---------------------------------------------------------------------- */

	// Document order sorting
	sortOrder = hasCompare ?
	function( a, b ) {

		// Flag for duplicate removal
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		// Sort on method existence if only one input has compareDocumentPosition
		var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
		if ( compare ) {
			return compare;
		}

		// Calculate position if both inputs belong to the same document
		compare = ( a.ownerDocument || a ) === ( b.ownerDocument || b ) ?
			a.compareDocumentPosition( b ) :

			// Otherwise we know they are disconnected
			1;

		// Disconnected nodes
		if ( compare & 1 ||
			(!support.sortDetached && b.compareDocumentPosition( a ) === compare) ) {

			// Choose the first element that is related to our preferred document
			if ( a === document || a.ownerDocument === preferredDoc && contains(preferredDoc, a) ) {
				return -1;
			}
			if ( b === document || b.ownerDocument === preferredDoc && contains(preferredDoc, b) ) {
				return 1;
			}

			// Maintain original order
			return sortInput ?
				( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
				0;
		}

		return compare & 4 ? -1 : 1;
	} :
	function( a, b ) {
		// Exit early if the nodes are identical
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		var cur,
			i = 0,
			aup = a.parentNode,
			bup = b.parentNode,
			ap = [ a ],
			bp = [ b ];

		// Parentless nodes are either documents or disconnected
		if ( !aup || !bup ) {
			return a === document ? -1 :
				b === document ? 1 :
				aup ? -1 :
				bup ? 1 :
				sortInput ?
				( indexOf( sortInput, a ) - indexOf( sortInput, b ) ) :
				0;

		// If the nodes are siblings, we can do a quick check
		} else if ( aup === bup ) {
			return siblingCheck( a, b );
		}

		// Otherwise we need full lists of their ancestors for comparison
		cur = a;
		while ( (cur = cur.parentNode) ) {
			ap.unshift( cur );
		}
		cur = b;
		while ( (cur = cur.parentNode) ) {
			bp.unshift( cur );
		}

		// Walk down the tree looking for a discrepancy
		while ( ap[i] === bp[i] ) {
			i++;
		}

		return i ?
			// Do a sibling check if the nodes have a common ancestor
			siblingCheck( ap[i], bp[i] ) :

			// Otherwise nodes in our document sort first
			ap[i] === preferredDoc ? -1 :
			bp[i] === preferredDoc ? 1 :
			0;
	};

	return document;
};

Sizzle.matches = function( expr, elements ) {
	return Sizzle( expr, null, null, elements );
};

Sizzle.matchesSelector = function( elem, expr ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	// Make sure that attribute selectors are quoted
	expr = expr.replace( rattributeQuotes, "='$1']" );

	if ( support.matchesSelector && documentIsHTML &&
		!compilerCache[ expr + " " ] &&
		( !rbuggyMatches || !rbuggyMatches.test( expr ) ) &&
		( !rbuggyQSA     || !rbuggyQSA.test( expr ) ) ) {

		try {
			var ret = matches.call( elem, expr );

			// IE 9's matchesSelector returns false on disconnected nodes
			if ( ret || support.disconnectedMatch ||
					// As well, disconnected nodes are said to be in a document
					// fragment in IE 9
					elem.document && elem.document.nodeType !== 11 ) {
				return ret;
			}
		} catch (e) {}
	}

	return Sizzle( expr, document, null, [ elem ] ).length > 0;
};

Sizzle.contains = function( context, elem ) {
	// Set document vars if needed
	if ( ( context.ownerDocument || context ) !== document ) {
		setDocument( context );
	}
	return contains( context, elem );
};

Sizzle.attr = function( elem, name ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	var fn = Expr.attrHandle[ name.toLowerCase() ],
		// Don't get fooled by Object.prototype properties (jQuery #13807)
		val = fn && hasOwn.call( Expr.attrHandle, name.toLowerCase() ) ?
			fn( elem, name, !documentIsHTML ) :
			undefined;

	return val !== undefined ?
		val :
		support.attributes || !documentIsHTML ?
			elem.getAttribute( name ) :
			(val = elem.getAttributeNode(name)) && val.specified ?
				val.value :
				null;
};

Sizzle.error = function( msg ) {
	throw new Error( "Syntax error, unrecognized expression: " + msg );
};

/**
 * Document sorting and removing duplicates
 * @param {ArrayLike} results
 */
Sizzle.uniqueSort = function( results ) {
	var elem,
		duplicates = [],
		j = 0,
		i = 0;

	// Unless we *know* we can detect duplicates, assume their presence
	hasDuplicate = !support.detectDuplicates;
	sortInput = !support.sortStable && results.slice( 0 );
	results.sort( sortOrder );

	if ( hasDuplicate ) {
		while ( (elem = results[i++]) ) {
			if ( elem === results[ i ] ) {
				j = duplicates.push( i );
			}
		}
		while ( j-- ) {
			results.splice( duplicates[ j ], 1 );
		}
	}

	// Clear input after sorting to release objects
	// See https://github.com/jquery/sizzle/pull/225
	sortInput = null;

	return results;
};

/**
 * Utility function for retrieving the text value of an array of DOM nodes
 * @param {Array|Element} elem
 */
getText = Sizzle.getText = function( elem ) {
	var node,
		ret = "",
		i = 0,
		nodeType = elem.nodeType;

	if ( !nodeType ) {
		// If no nodeType, this is expected to be an array
		while ( (node = elem[i++]) ) {
			// Do not traverse comment nodes
			ret += getText( node );
		}
	} else if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
		// Use textContent for elements
		// innerText usage removed for consistency of new lines (jQuery #11153)
		if ( typeof elem.textContent === "string" ) {
			return elem.textContent;
		} else {
			// Traverse its children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				ret += getText( elem );
			}
		}
	} else if ( nodeType === 3 || nodeType === 4 ) {
		return elem.nodeValue;
	}
	// Do not include comment or processing instruction nodes

	return ret;
};

Expr = Sizzle.selectors = {

	// Can be adjusted by the user
	cacheLength: 50,

	createPseudo: markFunction,

	match: matchExpr,

	attrHandle: {},

	find: {},

	relative: {
		">": { dir: "parentNode", first: true },
		" ": { dir: "parentNode" },
		"+": { dir: "previousSibling", first: true },
		"~": { dir: "previousSibling" }
	},

	preFilter: {
		"ATTR": function( match ) {
			match[1] = match[1].replace( runescape, funescape );

			// Move the given value to match[3] whether quoted or unquoted
			match[3] = ( match[3] || match[4] || match[5] || "" ).replace( runescape, funescape );

			if ( match[2] === "~=" ) {
				match[3] = " " + match[3] + " ";
			}

			return match.slice( 0, 4 );
		},

		"CHILD": function( match ) {
			/* matches from matchExpr["CHILD"]
				1 type (only|nth|...)
				2 what (child|of-type)
				3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
				4 xn-component of xn+y argument ([+-]?\d*n|)
				5 sign of xn-component
				6 x of xn-component
				7 sign of y-component
				8 y of y-component
			*/
			match[1] = match[1].toLowerCase();

			if ( match[1].slice( 0, 3 ) === "nth" ) {
				// nth-* requires argument
				if ( !match[3] ) {
					Sizzle.error( match[0] );
				}

				// numeric x and y parameters for Expr.filter.CHILD
				// remember that false/true cast respectively to 0/1
				match[4] = +( match[4] ? match[5] + (match[6] || 1) : 2 * ( match[3] === "even" || match[3] === "odd" ) );
				match[5] = +( ( match[7] + match[8] ) || match[3] === "odd" );

			// other types prohibit arguments
			} else if ( match[3] ) {
				Sizzle.error( match[0] );
			}

			return match;
		},

		"PSEUDO": function( match ) {
			var excess,
				unquoted = !match[6] && match[2];

			if ( matchExpr["CHILD"].test( match[0] ) ) {
				return null;
			}

			// Accept quoted arguments as-is
			if ( match[3] ) {
				match[2] = match[4] || match[5] || "";

			// Strip excess characters from unquoted arguments
			} else if ( unquoted && rpseudo.test( unquoted ) &&
				// Get excess from tokenize (recursively)
				(excess = tokenize( unquoted, true )) &&
				// advance to the next closing parenthesis
				(excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length) ) {

				// excess is a negative index
				match[0] = match[0].slice( 0, excess );
				match[2] = unquoted.slice( 0, excess );
			}

			// Return only captures needed by the pseudo filter method (type and argument)
			return match.slice( 0, 3 );
		}
	},

	filter: {

		"TAG": function( nodeNameSelector ) {
			var nodeName = nodeNameSelector.replace( runescape, funescape ).toLowerCase();
			return nodeNameSelector === "*" ?
				function() { return true; } :
				function( elem ) {
					return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
				};
		},

		"CLASS": function( className ) {
			var pattern = classCache[ className + " " ];

			return pattern ||
				(pattern = new RegExp( "(^|" + whitespace + ")" + className + "(" + whitespace + "|$)" )) &&
				classCache( className, function( elem ) {
					return pattern.test( typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== "undefined" && elem.getAttribute("class") || "" );
				});
		},

		"ATTR": function( name, operator, check ) {
			return function( elem ) {
				var result = Sizzle.attr( elem, name );

				if ( result == null ) {
					return operator === "!=";
				}
				if ( !operator ) {
					return true;
				}

				result += "";

				return operator === "=" ? result === check :
					operator === "!=" ? result !== check :
					operator === "^=" ? check && result.indexOf( check ) === 0 :
					operator === "*=" ? check && result.indexOf( check ) > -1 :
					operator === "$=" ? check && result.slice( -check.length ) === check :
					operator === "~=" ? ( " " + result.replace( rwhitespace, " " ) + " " ).indexOf( check ) > -1 :
					operator === "|=" ? result === check || result.slice( 0, check.length + 1 ) === check + "-" :
					false;
			};
		},

		"CHILD": function( type, what, argument, first, last ) {
			var simple = type.slice( 0, 3 ) !== "nth",
				forward = type.slice( -4 ) !== "last",
				ofType = what === "of-type";

			return first === 1 && last === 0 ?

				// Shortcut for :nth-*(n)
				function( elem ) {
					return !!elem.parentNode;
				} :

				function( elem, context, xml ) {
					var cache, uniqueCache, outerCache, node, nodeIndex, start,
						dir = simple !== forward ? "nextSibling" : "previousSibling",
						parent = elem.parentNode,
						name = ofType && elem.nodeName.toLowerCase(),
						useCache = !xml && !ofType,
						diff = false;

					if ( parent ) {

						// :(first|last|only)-(child|of-type)
						if ( simple ) {
							while ( dir ) {
								node = elem;
								while ( (node = node[ dir ]) ) {
									if ( ofType ?
										node.nodeName.toLowerCase() === name :
										node.nodeType === 1 ) {

										return false;
									}
								}
								// Reverse direction for :only-* (if we haven't yet done so)
								start = dir = type === "only" && !start && "nextSibling";
							}
							return true;
						}

						start = [ forward ? parent.firstChild : parent.lastChild ];

						// non-xml :nth-child(...) stores cache data on `parent`
						if ( forward && useCache ) {

							// Seek `elem` from a previously-cached index

							// ...in a gzip-friendly way
							node = parent;
							outerCache = node[ expando ] || (node[ expando ] = {});

							// Support: IE <9 only
							// Defend against cloned attroperties (jQuery gh-1709)
							uniqueCache = outerCache[ node.uniqueID ] ||
								(outerCache[ node.uniqueID ] = {});

							cache = uniqueCache[ type ] || [];
							nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
							diff = nodeIndex && cache[ 2 ];
							node = nodeIndex && parent.childNodes[ nodeIndex ];

							while ( (node = ++nodeIndex && node && node[ dir ] ||

								// Fallback to seeking `elem` from the start
								(diff = nodeIndex = 0) || start.pop()) ) {

								// When found, cache indexes on `parent` and break
								if ( node.nodeType === 1 && ++diff && node === elem ) {
									uniqueCache[ type ] = [ dirruns, nodeIndex, diff ];
									break;
								}
							}

						} else {
							// Use previously-cached element index if available
							if ( useCache ) {
								// ...in a gzip-friendly way
								node = elem;
								outerCache = node[ expando ] || (node[ expando ] = {});

								// Support: IE <9 only
								// Defend against cloned attroperties (jQuery gh-1709)
								uniqueCache = outerCache[ node.uniqueID ] ||
									(outerCache[ node.uniqueID ] = {});

								cache = uniqueCache[ type ] || [];
								nodeIndex = cache[ 0 ] === dirruns && cache[ 1 ];
								diff = nodeIndex;
							}

							// xml :nth-child(...)
							// or :nth-last-child(...) or :nth(-last)?-of-type(...)
							if ( diff === false ) {
								// Use the same loop as above to seek `elem` from the start
								while ( (node = ++nodeIndex && node && node[ dir ] ||
									(diff = nodeIndex = 0) || start.pop()) ) {

									if ( ( ofType ?
										node.nodeName.toLowerCase() === name :
										node.nodeType === 1 ) &&
										++diff ) {

										// Cache the index of each encountered element
										if ( useCache ) {
											outerCache = node[ expando ] || (node[ expando ] = {});

											// Support: IE <9 only
											// Defend against cloned attroperties (jQuery gh-1709)
											uniqueCache = outerCache[ node.uniqueID ] ||
												(outerCache[ node.uniqueID ] = {});

											uniqueCache[ type ] = [ dirruns, diff ];
										}

										if ( node === elem ) {
											break;
										}
									}
								}
							}
						}

						// Incorporate the offset, then check against cycle size
						diff -= last;
						return diff === first || ( diff % first === 0 && diff / first >= 0 );
					}
				};
		},

		"PSEUDO": function( pseudo, argument ) {
			// pseudo-class names are case-insensitive
			// http://www.w3.org/TR/selectors/#pseudo-classes
			// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
			// Remember that setFilters inherits from pseudos
			var args,
				fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
					Sizzle.error( "unsupported pseudo: " + pseudo );

			// The user may use createPseudo to indicate that
			// arguments are needed to create the filter function
			// just as Sizzle does
			if ( fn[ expando ] ) {
				return fn( argument );
			}

			// But maintain support for old signatures
			if ( fn.length > 1 ) {
				args = [ pseudo, pseudo, "", argument ];
				return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
					markFunction(function( seed, matches ) {
						var idx,
							matched = fn( seed, argument ),
							i = matched.length;
						while ( i-- ) {
							idx = indexOf( seed, matched[i] );
							seed[ idx ] = !( matches[ idx ] = matched[i] );
						}
					}) :
					function( elem ) {
						return fn( elem, 0, args );
					};
			}

			return fn;
		}
	},

	pseudos: {
		// Potentially complex pseudos
		"not": markFunction(function( selector ) {
			// Trim the selector passed to compile
			// to avoid treating leading and trailing
			// spaces as combinators
			var input = [],
				results = [],
				matcher = compile( selector.replace( rtrim, "$1" ) );

			return matcher[ expando ] ?
				markFunction(function( seed, matches, context, xml ) {
					var elem,
						unmatched = matcher( seed, null, xml, [] ),
						i = seed.length;

					// Match elements unmatched by `matcher`
					while ( i-- ) {
						if ( (elem = unmatched[i]) ) {
							seed[i] = !(matches[i] = elem);
						}
					}
				}) :
				function( elem, context, xml ) {
					input[0] = elem;
					matcher( input, null, xml, results );
					// Don't keep the element (issue #299)
					input[0] = null;
					return !results.pop();
				};
		}),

		"has": markFunction(function( selector ) {
			return function( elem ) {
				return Sizzle( selector, elem ).length > 0;
			};
		}),

		"contains": markFunction(function( text ) {
			text = text.replace( runescape, funescape );
			return function( elem ) {
				return ( elem.textContent || elem.innerText || getText( elem ) ).indexOf( text ) > -1;
			};
		}),

		// "Whether an element is represented by a :lang() selector
		// is based solely on the element's language value
		// being equal to the identifier C,
		// or beginning with the identifier C immediately followed by "-".
		// The matching of C against the element's language value is performed case-insensitively.
		// The identifier C does not have to be a valid language name."
		// http://www.w3.org/TR/selectors/#lang-pseudo
		"lang": markFunction( function( lang ) {
			// lang value must be a valid identifier
			if ( !ridentifier.test(lang || "") ) {
				Sizzle.error( "unsupported lang: " + lang );
			}
			lang = lang.replace( runescape, funescape ).toLowerCase();
			return function( elem ) {
				var elemLang;
				do {
					if ( (elemLang = documentIsHTML ?
						elem.lang :
						elem.getAttribute("xml:lang") || elem.getAttribute("lang")) ) {

						elemLang = elemLang.toLowerCase();
						return elemLang === lang || elemLang.indexOf( lang + "-" ) === 0;
					}
				} while ( (elem = elem.parentNode) && elem.nodeType === 1 );
				return false;
			};
		}),

		// Miscellaneous
		"target": function( elem ) {
			var hash = window.location && window.location.hash;
			return hash && hash.slice( 1 ) === elem.id;
		},

		"root": function( elem ) {
			return elem === docElem;
		},

		"focus": function( elem ) {
			return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
		},

		// Boolean properties
		"enabled": function( elem ) {
			return elem.disabled === false;
		},

		"disabled": function( elem ) {
			return elem.disabled === true;
		},

		"checked": function( elem ) {
			// In CSS3, :checked should return both checked and selected elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			var nodeName = elem.nodeName.toLowerCase();
			return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
		},

		"selected": function( elem ) {
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			if ( elem.parentNode ) {
				elem.parentNode.selectedIndex;
			}

			return elem.selected === true;
		},

		// Contents
		"empty": function( elem ) {
			// http://www.w3.org/TR/selectors/#empty-pseudo
			// :empty is negated by element (1) or content nodes (text: 3; cdata: 4; entity ref: 5),
			//   but not by others (comment: 8; processing instruction: 7; etc.)
			// nodeType < 6 works because attributes (2) do not appear as children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				if ( elem.nodeType < 6 ) {
					return false;
				}
			}
			return true;
		},

		"parent": function( elem ) {
			return !Expr.pseudos["empty"]( elem );
		},

		// Element/input types
		"header": function( elem ) {
			return rheader.test( elem.nodeName );
		},

		"input": function( elem ) {
			return rinputs.test( elem.nodeName );
		},

		"button": function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && elem.type === "button" || name === "button";
		},

		"text": function( elem ) {
			var attr;
			return elem.nodeName.toLowerCase() === "input" &&
				elem.type === "text" &&

				// Support: IE<8
				// New HTML5 attribute values (e.g., "search") appear with elem.type === "text"
				( (attr = elem.getAttribute("type")) == null || attr.toLowerCase() === "text" );
		},

		// Position-in-collection
		"first": createPositionalPseudo(function() {
			return [ 0 ];
		}),

		"last": createPositionalPseudo(function( matchIndexes, length ) {
			return [ length - 1 ];
		}),

		"eq": createPositionalPseudo(function( matchIndexes, length, argument ) {
			return [ argument < 0 ? argument + length : argument ];
		}),

		"even": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 0;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"odd": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 1;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"lt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; --i >= 0; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"gt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; ++i < length; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		})
	}
};

Expr.pseudos["nth"] = Expr.pseudos["eq"];

// Add button/input type pseudos
for ( i in { radio: true, checkbox: true, file: true, password: true, image: true } ) {
	Expr.pseudos[ i ] = createInputPseudo( i );
}
for ( i in { submit: true, reset: true } ) {
	Expr.pseudos[ i ] = createButtonPseudo( i );
}

// Easy API for creating new setFilters
function setFilters() {}
setFilters.prototype = Expr.filters = Expr.pseudos;
Expr.setFilters = new setFilters();

tokenize = Sizzle.tokenize = function( selector, parseOnly ) {
	var matched, match, tokens, type,
		soFar, groups, preFilters,
		cached = tokenCache[ selector + " " ];

	if ( cached ) {
		return parseOnly ? 0 : cached.slice( 0 );
	}

	soFar = selector;
	groups = [];
	preFilters = Expr.preFilter;

	while ( soFar ) {

		// Comma and first run
		if ( !matched || (match = rcomma.exec( soFar )) ) {
			if ( match ) {
				// Don't consume trailing commas as valid
				soFar = soFar.slice( match[0].length ) || soFar;
			}
			groups.push( (tokens = []) );
		}

		matched = false;

		// Combinators
		if ( (match = rcombinators.exec( soFar )) ) {
			matched = match.shift();
			tokens.push({
				value: matched,
				// Cast descendant combinators to space
				type: match[0].replace( rtrim, " " )
			});
			soFar = soFar.slice( matched.length );
		}

		// Filters
		for ( type in Expr.filter ) {
			if ( (match = matchExpr[ type ].exec( soFar )) && (!preFilters[ type ] ||
				(match = preFilters[ type ]( match ))) ) {
				matched = match.shift();
				tokens.push({
					value: matched,
					type: type,
					matches: match
				});
				soFar = soFar.slice( matched.length );
			}
		}

		if ( !matched ) {
			break;
		}
	}

	// Return the length of the invalid excess
	// if we're just parsing
	// Otherwise, throw an error or return tokens
	return parseOnly ?
		soFar.length :
		soFar ?
			Sizzle.error( selector ) :
			// Cache the tokens
			tokenCache( selector, groups ).slice( 0 );
};

function toSelector( tokens ) {
	var i = 0,
		len = tokens.length,
		selector = "";
	for ( ; i < len; i++ ) {
		selector += tokens[i].value;
	}
	return selector;
}

function addCombinator( matcher, combinator, base ) {
	var dir = combinator.dir,
		checkNonElements = base && dir === "parentNode",
		doneName = done++;

	return combinator.first ?
		// Check against closest ancestor/preceding element
		function( elem, context, xml ) {
			while ( (elem = elem[ dir ]) ) {
				if ( elem.nodeType === 1 || checkNonElements ) {
					return matcher( elem, context, xml );
				}
			}
		} :

		// Check against all ancestor/preceding elements
		function( elem, context, xml ) {
			var oldCache, uniqueCache, outerCache,
				newCache = [ dirruns, doneName ];

			// We can't set arbitrary data on XML nodes, so they don't benefit from combinator caching
			if ( xml ) {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						if ( matcher( elem, context, xml ) ) {
							return true;
						}
					}
				}
			} else {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						outerCache = elem[ expando ] || (elem[ expando ] = {});

						// Support: IE <9 only
						// Defend against cloned attroperties (jQuery gh-1709)
						uniqueCache = outerCache[ elem.uniqueID ] || (outerCache[ elem.uniqueID ] = {});

						if ( (oldCache = uniqueCache[ dir ]) &&
							oldCache[ 0 ] === dirruns && oldCache[ 1 ] === doneName ) {

							// Assign to newCache so results back-propagate to previous elements
							return (newCache[ 2 ] = oldCache[ 2 ]);
						} else {
							// Reuse newcache so results back-propagate to previous elements
							uniqueCache[ dir ] = newCache;

							// A match means we're done; a fail means we have to keep checking
							if ( (newCache[ 2 ] = matcher( elem, context, xml )) ) {
								return true;
							}
						}
					}
				}
			}
		};
}

function elementMatcher( matchers ) {
	return matchers.length > 1 ?
		function( elem, context, xml ) {
			var i = matchers.length;
			while ( i-- ) {
				if ( !matchers[i]( elem, context, xml ) ) {
					return false;
				}
			}
			return true;
		} :
		matchers[0];
}

function multipleContexts( selector, contexts, results ) {
	var i = 0,
		len = contexts.length;
	for ( ; i < len; i++ ) {
		Sizzle( selector, contexts[i], results );
	}
	return results;
}

function condense( unmatched, map, filter, context, xml ) {
	var elem,
		newUnmatched = [],
		i = 0,
		len = unmatched.length,
		mapped = map != null;

	for ( ; i < len; i++ ) {
		if ( (elem = unmatched[i]) ) {
			if ( !filter || filter( elem, context, xml ) ) {
				newUnmatched.push( elem );
				if ( mapped ) {
					map.push( i );
				}
			}
		}
	}

	return newUnmatched;
}

function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
	if ( postFilter && !postFilter[ expando ] ) {
		postFilter = setMatcher( postFilter );
	}
	if ( postFinder && !postFinder[ expando ] ) {
		postFinder = setMatcher( postFinder, postSelector );
	}
	return markFunction(function( seed, results, context, xml ) {
		var temp, i, elem,
			preMap = [],
			postMap = [],
			preexisting = results.length,

			// Get initial elements from seed or context
			elems = seed || multipleContexts( selector || "*", context.nodeType ? [ context ] : context, [] ),

			// Prefilter to get matcher input, preserving a map for seed-results synchronization
			matcherIn = preFilter && ( seed || !selector ) ?
				condense( elems, preMap, preFilter, context, xml ) :
				elems,

			matcherOut = matcher ?
				// If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
				postFinder || ( seed ? preFilter : preexisting || postFilter ) ?

					// ...intermediate processing is necessary
					[] :

					// ...otherwise use results directly
					results :
				matcherIn;

		// Find primary matches
		if ( matcher ) {
			matcher( matcherIn, matcherOut, context, xml );
		}

		// Apply postFilter
		if ( postFilter ) {
			temp = condense( matcherOut, postMap );
			postFilter( temp, [], context, xml );

			// Un-match failing elements by moving them back to matcherIn
			i = temp.length;
			while ( i-- ) {
				if ( (elem = temp[i]) ) {
					matcherOut[ postMap[i] ] = !(matcherIn[ postMap[i] ] = elem);
				}
			}
		}

		if ( seed ) {
			if ( postFinder || preFilter ) {
				if ( postFinder ) {
					// Get the final matcherOut by condensing this intermediate into postFinder contexts
					temp = [];
					i = matcherOut.length;
					while ( i-- ) {
						if ( (elem = matcherOut[i]) ) {
							// Restore matcherIn since elem is not yet a final match
							temp.push( (matcherIn[i] = elem) );
						}
					}
					postFinder( null, (matcherOut = []), temp, xml );
				}

				// Move matched elements from seed to results to keep them synchronized
				i = matcherOut.length;
				while ( i-- ) {
					if ( (elem = matcherOut[i]) &&
						(temp = postFinder ? indexOf( seed, elem ) : preMap[i]) > -1 ) {

						seed[temp] = !(results[temp] = elem);
					}
				}
			}

		// Add elements to results, through postFinder if defined
		} else {
			matcherOut = condense(
				matcherOut === results ?
					matcherOut.splice( preexisting, matcherOut.length ) :
					matcherOut
			);
			if ( postFinder ) {
				postFinder( null, results, matcherOut, xml );
			} else {
				push.apply( results, matcherOut );
			}
		}
	});
}

function matcherFromTokens( tokens ) {
	var checkContext, matcher, j,
		len = tokens.length,
		leadingRelative = Expr.relative[ tokens[0].type ],
		implicitRelative = leadingRelative || Expr.relative[" "],
		i = leadingRelative ? 1 : 0,

		// The foundational matcher ensures that elements are reachable from top-level context(s)
		matchContext = addCombinator( function( elem ) {
			return elem === checkContext;
		}, implicitRelative, true ),
		matchAnyContext = addCombinator( function( elem ) {
			return indexOf( checkContext, elem ) > -1;
		}, implicitRelative, true ),
		matchers = [ function( elem, context, xml ) {
			var ret = ( !leadingRelative && ( xml || context !== outermostContext ) ) || (
				(checkContext = context).nodeType ?
					matchContext( elem, context, xml ) :
					matchAnyContext( elem, context, xml ) );
			// Avoid hanging onto element (issue #299)
			checkContext = null;
			return ret;
		} ];

	for ( ; i < len; i++ ) {
		if ( (matcher = Expr.relative[ tokens[i].type ]) ) {
			matchers = [ addCombinator(elementMatcher( matchers ), matcher) ];
		} else {
			matcher = Expr.filter[ tokens[i].type ].apply( null, tokens[i].matches );

			// Return special upon seeing a positional matcher
			if ( matcher[ expando ] ) {
				// Find the next relative operator (if any) for proper handling
				j = ++i;
				for ( ; j < len; j++ ) {
					if ( Expr.relative[ tokens[j].type ] ) {
						break;
					}
				}
				return setMatcher(
					i > 1 && elementMatcher( matchers ),
					i > 1 && toSelector(
						// If the preceding token was a descendant combinator, insert an implicit any-element `*`
						tokens.slice( 0, i - 1 ).concat({ value: tokens[ i - 2 ].type === " " ? "*" : "" })
					).replace( rtrim, "$1" ),
					matcher,
					i < j && matcherFromTokens( tokens.slice( i, j ) ),
					j < len && matcherFromTokens( (tokens = tokens.slice( j )) ),
					j < len && toSelector( tokens )
				);
			}
			matchers.push( matcher );
		}
	}

	return elementMatcher( matchers );
}

function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
	var bySet = setMatchers.length > 0,
		byElement = elementMatchers.length > 0,
		superMatcher = function( seed, context, xml, results, outermost ) {
			var elem, j, matcher,
				matchedCount = 0,
				i = "0",
				unmatched = seed && [],
				setMatched = [],
				contextBackup = outermostContext,
				// We must always have either seed elements or outermost context
				elems = seed || byElement && Expr.find["TAG"]( "*", outermost ),
				// Use integer dirruns iff this is the outermost matcher
				dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.random() || 0.1),
				len = elems.length;

			if ( outermost ) {
				outermostContext = context === document || context || outermost;
			}

			// Add elements passing elementMatchers directly to results
			// Support: IE<9, Safari
			// Tolerate NodeList properties (IE: "length"; Safari: <number>) matching elements by id
			for ( ; i !== len && (elem = elems[i]) != null; i++ ) {
				if ( byElement && elem ) {
					j = 0;
					if ( !context && elem.ownerDocument !== document ) {
						setDocument( elem );
						xml = !documentIsHTML;
					}
					while ( (matcher = elementMatchers[j++]) ) {
						if ( matcher( elem, context || document, xml) ) {
							results.push( elem );
							break;
						}
					}
					if ( outermost ) {
						dirruns = dirrunsUnique;
					}
				}

				// Track unmatched elements for set filters
				if ( bySet ) {
					// They will have gone through all possible matchers
					if ( (elem = !matcher && elem) ) {
						matchedCount--;
					}

					// Lengthen the array for every element, matched or not
					if ( seed ) {
						unmatched.push( elem );
					}
				}
			}

			// `i` is now the count of elements visited above, and adding it to `matchedCount`
			// makes the latter nonnegative.
			matchedCount += i;

			// Apply set filters to unmatched elements
			// NOTE: This can be skipped if there are no unmatched elements (i.e., `matchedCount`
			// equals `i`), unless we didn't visit _any_ elements in the above loop because we have
			// no element matchers and no seed.
			// Incrementing an initially-string "0" `i` allows `i` to remain a string only in that
			// case, which will result in a "00" `matchedCount` that differs from `i` but is also
			// numerically zero.
			if ( bySet && i !== matchedCount ) {
				j = 0;
				while ( (matcher = setMatchers[j++]) ) {
					matcher( unmatched, setMatched, context, xml );
				}

				if ( seed ) {
					// Reintegrate element matches to eliminate the need for sorting
					if ( matchedCount > 0 ) {
						while ( i-- ) {
							if ( !(unmatched[i] || setMatched[i]) ) {
								setMatched[i] = pop.call( results );
							}
						}
					}

					// Discard index placeholder values to get only actual matches
					setMatched = condense( setMatched );
				}

				// Add matches to results
				push.apply( results, setMatched );

				// Seedless set matches succeeding multiple successful matchers stipulate sorting
				if ( outermost && !seed && setMatched.length > 0 &&
					( matchedCount + setMatchers.length ) > 1 ) {

					Sizzle.uniqueSort( results );
				}
			}

			// Override manipulation of globals by nested matchers
			if ( outermost ) {
				dirruns = dirrunsUnique;
				outermostContext = contextBackup;
			}

			return unmatched;
		};

	return bySet ?
		markFunction( superMatcher ) :
		superMatcher;
}

compile = Sizzle.compile = function( selector, match /* Internal Use Only */ ) {
	var i,
		setMatchers = [],
		elementMatchers = [],
		cached = compilerCache[ selector + " " ];

	if ( !cached ) {
		// Generate a function of recursive functions that can be used to check each element
		if ( !match ) {
			match = tokenize( selector );
		}
		i = match.length;
		while ( i-- ) {
			cached = matcherFromTokens( match[i] );
			if ( cached[ expando ] ) {
				setMatchers.push( cached );
			} else {
				elementMatchers.push( cached );
			}
		}

		// Cache the compiled function
		cached = compilerCache( selector, matcherFromGroupMatchers( elementMatchers, setMatchers ) );

		// Save selector and tokenization
		cached.selector = selector;
	}
	return cached;
};

/**
 * A low-level selection function that works with Sizzle's compiled
 *  selector functions
 * @param {String|Function} selector A selector or a pre-compiled
 *  selector function built with Sizzle.compile
 * @param {Element} context
 * @param {Array} [results]
 * @param {Array} [seed] A set of elements to match against
 */
select = Sizzle.select = function( selector, context, results, seed ) {
	var i, tokens, token, type, find,
		compiled = typeof selector === "function" && selector,
		match = !seed && tokenize( (selector = compiled.selector || selector) );

	results = results || [];

	// Try to minimize operations if there is only one selector in the list and no seed
	// (the latter of which guarantees us context)
	if ( match.length === 1 ) {

		// Reduce context if the leading compound selector is an ID
		tokens = match[0] = match[0].slice( 0 );
		if ( tokens.length > 2 && (token = tokens[0]).type === "ID" &&
				support.getById && context.nodeType === 9 && documentIsHTML &&
				Expr.relative[ tokens[1].type ] ) {

			context = ( Expr.find["ID"]( token.matches[0].replace(runescape, funescape), context ) || [] )[0];
			if ( !context ) {
				return results;

			// Precompiled matchers will still verify ancestry, so step up a level
			} else if ( compiled ) {
				context = context.parentNode;
			}

			selector = selector.slice( tokens.shift().value.length );
		}

		// Fetch a seed set for right-to-left matching
		i = matchExpr["needsContext"].test( selector ) ? 0 : tokens.length;
		while ( i-- ) {
			token = tokens[i];

			// Abort if we hit a combinator
			if ( Expr.relative[ (type = token.type) ] ) {
				break;
			}
			if ( (find = Expr.find[ type ]) ) {
				// Search, expanding context for leading sibling combinators
				if ( (seed = find(
					token.matches[0].replace( runescape, funescape ),
					rsibling.test( tokens[0].type ) && testContext( context.parentNode ) || context
				)) ) {

					// If seed is empty or no tokens remain, we can return early
					tokens.splice( i, 1 );
					selector = seed.length && toSelector( tokens );
					if ( !selector ) {
						push.apply( results, seed );
						return results;
					}

					break;
				}
			}
		}
	}

	// Compile and execute a filtering function if one is not provided
	// Provide `match` to avoid retokenization if we modified the selector above
	( compiled || compile( selector, match ) )(
		seed,
		context,
		!documentIsHTML,
		results,
		!context || rsibling.test( selector ) && testContext( context.parentNode ) || context
	);
	return results;
};

// One-time assignments

// Sort stability
support.sortStable = expando.split("").sort( sortOrder ).join("") === expando;

// Support: Chrome 14-35+
// Always assume duplicates if they aren't passed to the comparison function
support.detectDuplicates = !!hasDuplicate;

// Initialize against the default document
setDocument();

// Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
// Detached nodes confoundingly follow *each other*
support.sortDetached = assert(function( div1 ) {
	// Should return 1, but returns 4 (following)
	return div1.compareDocumentPosition( document.createElement("div") ) & 1;
});

// Support: IE<8
// Prevent attribute/property "interpolation"
// http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
if ( !assert(function( div ) {
	div.innerHTML = "<a href='#'></a>";
	return div.firstChild.getAttribute("href") === "#" ;
}) ) {
	addHandle( "type|href|height|width", function( elem, name, isXML ) {
		if ( !isXML ) {
			return elem.getAttribute( name, name.toLowerCase() === "type" ? 1 : 2 );
		}
	});
}

// Support: IE<9
// Use defaultValue in place of getAttribute("value")
if ( !support.attributes || !assert(function( div ) {
	div.innerHTML = "<input/>";
	div.firstChild.setAttribute( "value", "" );
	return div.firstChild.getAttribute( "value" ) === "";
}) ) {
	addHandle( "value", function( elem, name, isXML ) {
		if ( !isXML && elem.nodeName.toLowerCase() === "input" ) {
			return elem.defaultValue;
		}
	});
}

// Support: IE<9
// Use getAttributeNode to fetch booleans when getAttribute lies
if ( !assert(function( div ) {
	return div.getAttribute("disabled") == null;
}) ) {
	addHandle( booleans, function( elem, name, isXML ) {
		var val;
		if ( !isXML ) {
			return elem[ name ] === true ? name.toLowerCase() :
					(val = elem.getAttributeNode( name )) && val.specified ?
					val.value :
				null;
		}
	});
}

return Sizzle;

})( window );



jQuery.find = Sizzle;
jQuery.expr = Sizzle.selectors;
jQuery.expr[ ":" ] = jQuery.expr.pseudos;
jQuery.uniqueSort = jQuery.unique = Sizzle.uniqueSort;
jQuery.text = Sizzle.getText;
jQuery.isXMLDoc = Sizzle.isXML;
jQuery.contains = Sizzle.contains;



var dir = function( elem, dir, until ) {
	var matched = [],
		truncate = until !== undefined;

	while ( ( elem = elem[ dir ] ) && elem.nodeType !== 9 ) {
		if ( elem.nodeType === 1 ) {
			if ( truncate && jQuery( elem ).is( until ) ) {
				break;
			}
			matched.push( elem );
		}
	}
	return matched;
};


var siblings = function( n, elem ) {
	var matched = [];

	for ( ; n; n = n.nextSibling ) {
		if ( n.nodeType === 1 && n !== elem ) {
			matched.push( n );
		}
	}

	return matched;
};


var rneedsContext = jQuery.expr.match.needsContext;

var rsingleTag = ( /^<([\w-]+)\s*\/?>(?:<\/\1>|)$/ );



var risSimple = /^.[^:#\[\.,]*$/;

// Implement the identical functionality for filter and not
function winnow( elements, qualifier, not ) {
	if ( jQuery.isFunction( qualifier ) ) {
		return jQuery.grep( elements, function( elem, i ) {
			/* jshint -W018 */
			return !!qualifier.call( elem, i, elem ) !== not;
		} );

	}

	if ( qualifier.nodeType ) {
		return jQuery.grep( elements, function( elem ) {
			return ( elem === qualifier ) !== not;
		} );

	}

	if ( typeof qualifier === "string" ) {
		if ( risSimple.test( qualifier ) ) {
			return jQuery.filter( qualifier, elements, not );
		}

		qualifier = jQuery.filter( qualifier, elements );
	}

	return jQuery.grep( elements, function( elem ) {
		return ( jQuery.inArray( elem, qualifier ) > -1 ) !== not;
	} );
}

jQuery.filter = function( expr, elems, not ) {
	var elem = elems[ 0 ];

	if ( not ) {
		expr = ":not(" + expr + ")";
	}

	return elems.length === 1 && elem.nodeType === 1 ?
		jQuery.find.matchesSelector( elem, expr ) ? [ elem ] : [] :
		jQuery.find.matches( expr, jQuery.grep( elems, function( elem ) {
			return elem.nodeType === 1;
		} ) );
};

jQuery.fn.extend( {
	find: function( selector ) {
		var i,
			ret = [],
			self = this,
			len = self.length;

		if ( typeof selector !== "string" ) {
			return this.pushStack( jQuery( selector ).filter( function() {
				for ( i = 0; i < len; i++ ) {
					if ( jQuery.contains( self[ i ], this ) ) {
						return true;
					}
				}
			} ) );
		}

		for ( i = 0; i < len; i++ ) {
			jQuery.find( selector, self[ i ], ret );
		}

		// Needed because $( selector, context ) becomes $( context ).find( selector )
		ret = this.pushStack( len > 1 ? jQuery.unique( ret ) : ret );
		ret.selector = this.selector ? this.selector + " " + selector : selector;
		return ret;
	},
	filter: function( selector ) {
		return this.pushStack( winnow( this, selector || [], false ) );
	},
	not: function( selector ) {
		return this.pushStack( winnow( this, selector || [], true ) );
	},
	is: function( selector ) {
		return !!winnow(
			this,

			// If this is a positional/relative selector, check membership in the returned set
			// so $("p:first").is("p:last") won't return true for a doc with two "p".
			typeof selector === "string" && rneedsContext.test( selector ) ?
				jQuery( selector ) :
				selector || [],
			false
		).length;
	}
} );


// Initialize a jQuery object


// A central reference to the root jQuery(document)
var rootjQuery,

	// A simple way to check for HTML strings
	// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
	// Strict HTML recognition (#11290: must start with <)
	rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,

	init = jQuery.fn.init = function( selector, context, root ) {
		var match, elem;

		// HANDLE: $(""), $(null), $(undefined), $(false)
		if ( !selector ) {
			return this;
		}

		// init accepts an alternate rootjQuery
		// so migrate can support jQuery.sub (gh-2101)
		root = root || rootjQuery;

		// Handle HTML strings
		if ( typeof selector === "string" ) {
			if ( selector.charAt( 0 ) === "<" &&
				selector.charAt( selector.length - 1 ) === ">" &&
				selector.length >= 3 ) {

				// Assume that strings that start and end with <> are HTML and skip the regex check
				match = [ null, selector, null ];

			} else {
				match = rquickExpr.exec( selector );
			}

			// Match html or make sure no context is specified for #id
			if ( match && ( match[ 1 ] || !context ) ) {

				// HANDLE: $(html) -> $(array)
				if ( match[ 1 ] ) {
					context = context instanceof jQuery ? context[ 0 ] : context;

					// scripts is true for back-compat
					// Intentionally let the error be thrown if parseHTML is not present
					jQuery.merge( this, jQuery.parseHTML(
						match[ 1 ],
						context && context.nodeType ? context.ownerDocument || context : document,
						true
					) );

					// HANDLE: $(html, props)
					if ( rsingleTag.test( match[ 1 ] ) && jQuery.isPlainObject( context ) ) {
						for ( match in context ) {

							// Properties of context are called as methods if possible
							if ( jQuery.isFunction( this[ match ] ) ) {
								this[ match ]( context[ match ] );

							// ...and otherwise set as attributes
							} else {
								this.attr( match, context[ match ] );
							}
						}
					}

					return this;

				// HANDLE: $(#id)
				} else {
					elem = document.getElementById( match[ 2 ] );

					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					if ( elem && elem.parentNode ) {

						// Handle the case where IE and Opera return items
						// by name instead of ID
						if ( elem.id !== match[ 2 ] ) {
							return rootjQuery.find( selector );
						}

						// Otherwise, we inject the element directly into the jQuery object
						this.length = 1;
						this[ 0 ] = elem;
					}

					this.context = document;
					this.selector = selector;
					return this;
				}

			// HANDLE: $(expr, $(...))
			} else if ( !context || context.jquery ) {
				return ( context || root ).find( selector );

			// HANDLE: $(expr, context)
			// (which is just equivalent to: $(context).find(expr)
			} else {
				return this.constructor( context ).find( selector );
			}

		// HANDLE: $(DOMElement)
		} else if ( selector.nodeType ) {
			this.context = this[ 0 ] = selector;
			this.length = 1;
			return this;

		// HANDLE: $(function)
		// Shortcut for document ready
		} else if ( jQuery.isFunction( selector ) ) {
			return typeof root.ready !== "undefined" ?
				root.ready( selector ) :

				// Execute immediately if ready is not present
				selector( jQuery );
		}

		if ( selector.selector !== undefined ) {
			this.selector = selector.selector;
			this.context = selector.context;
		}

		return jQuery.makeArray( selector, this );
	};

// Give the init function the jQuery prototype for later instantiation
init.prototype = jQuery.fn;

// Initialize central reference
rootjQuery = jQuery( document );


var rparentsprev = /^(?:parents|prev(?:Until|All))/,

	// methods guaranteed to produce a unique set when starting from a unique set
	guaranteedUnique = {
		children: true,
		contents: true,
		next: true,
		prev: true
	};

jQuery.fn.extend( {
	has: function( target ) {
		var i,
			targets = jQuery( target, this ),
			len = targets.length;

		return this.filter( function() {
			for ( i = 0; i < len; i++ ) {
				if ( jQuery.contains( this, targets[ i ] ) ) {
					return true;
				}
			}
		} );
	},

	closest: function( selectors, context ) {
		var cur,
			i = 0,
			l = this.length,
			matched = [],
			pos = rneedsContext.test( selectors ) || typeof selectors !== "string" ?
				jQuery( selectors, context || this.context ) :
				0;

		for ( ; i < l; i++ ) {
			for ( cur = this[ i ]; cur && cur !== context; cur = cur.parentNode ) {

				// Always skip document fragments
				if ( cur.nodeType < 11 && ( pos ?
					pos.index( cur ) > -1 :

					// Don't pass non-elements to Sizzle
					cur.nodeType === 1 &&
						jQuery.find.matchesSelector( cur, selectors ) ) ) {

					matched.push( cur );
					break;
				}
			}
		}

		return this.pushStack( matched.length > 1 ? jQuery.uniqueSort( matched ) : matched );
	},

	// Determine the position of an element within
	// the matched set of elements
	index: function( elem ) {

		// No argument, return index in parent
		if ( !elem ) {
			return ( this[ 0 ] && this[ 0 ].parentNode ) ? this.first().prevAll().length : -1;
		}

		// index in selector
		if ( typeof elem === "string" ) {
			return jQuery.inArray( this[ 0 ], jQuery( elem ) );
		}

		// Locate the position of the desired element
		return jQuery.inArray(

			// If it receives a jQuery object, the first element is used
			elem.jquery ? elem[ 0 ] : elem, this );
	},

	add: function( selector, context ) {
		return this.pushStack(
			jQuery.uniqueSort(
				jQuery.merge( this.get(), jQuery( selector, context ) )
			)
		);
	},

	addBack: function( selector ) {
		return this.add( selector == null ?
			this.prevObject : this.prevObject.filter( selector )
		);
	}
} );

function sibling( cur, dir ) {
	do {
		cur = cur[ dir ];
	} while ( cur && cur.nodeType !== 1 );

	return cur;
}

jQuery.each( {
	parent: function( elem ) {
		var parent = elem.parentNode;
		return parent && parent.nodeType !== 11 ? parent : null;
	},
	parents: function( elem ) {
		return dir( elem, "parentNode" );
	},
	parentsUntil: function( elem, i, until ) {
		return dir( elem, "parentNode", until );
	},
	next: function( elem ) {
		return sibling( elem, "nextSibling" );
	},
	prev: function( elem ) {
		return sibling( elem, "previousSibling" );
	},
	nextAll: function( elem ) {
		return dir( elem, "nextSibling" );
	},
	prevAll: function( elem ) {
		return dir( elem, "previousSibling" );
	},
	nextUntil: function( elem, i, until ) {
		return dir( elem, "nextSibling", until );
	},
	prevUntil: function( elem, i, until ) {
		return dir( elem, "previousSibling", until );
	},
	siblings: function( elem ) {
		return siblings( ( elem.parentNode || {} ).firstChild, elem );
	},
	children: function( elem ) {
		return siblings( elem.firstChild );
	},
	contents: function( elem ) {
		return jQuery.nodeName( elem, "iframe" ) ?
			elem.contentDocument || elem.contentWindow.document :
			jQuery.merge( [], elem.childNodes );
	}
}, function( name, fn ) {
	jQuery.fn[ name ] = function( until, selector ) {
		var ret = jQuery.map( this, fn, until );

		if ( name.slice( -5 ) !== "Until" ) {
			selector = until;
		}

		if ( selector && typeof selector === "string" ) {
			ret = jQuery.filter( selector, ret );
		}

		if ( this.length > 1 ) {

			// Remove duplicates
			if ( !guaranteedUnique[ name ] ) {
				ret = jQuery.uniqueSort( ret );
			}

			// Reverse order for parents* and prev-derivatives
			if ( rparentsprev.test( name ) ) {
				ret = ret.reverse();
			}
		}

		return this.pushStack( ret );
	};
} );
var rnotwhite = ( /\S+/g );



// Convert String-formatted options into Object-formatted ones
function createOptions( options ) {
	var object = {};
	jQuery.each( options.match( rnotwhite ) || [], function( _, flag ) {
		object[ flag ] = true;
	} );
	return object;
}

/*
 * Create a callback list using the following parameters:
 *
 *	options: an optional list of space-separated options that will change how
 *			the callback list behaves or a more traditional option object
 *
 * By default a callback list will act like an event callback list and can be
 * "fired" multiple times.
 *
 * Possible options:
 *
 *	once:			will ensure the callback list can only be fired once (like a Deferred)
 *
 *	memory:			will keep track of previous values and will call any callback added
 *					after the list has been fired right away with the latest "memorized"
 *					values (like a Deferred)
 *
 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
 *
 *	stopOnFalse:	interrupt callings when a callback returns false
 *
 */
jQuery.Callbacks = function( options ) {

	// Convert options from String-formatted to Object-formatted if needed
	// (we check in cache first)
	options = typeof options === "string" ?
		createOptions( options ) :
		jQuery.extend( {}, options );

	var // Flag to know if list is currently firing
		firing,

		// Last fire value for non-forgettable lists
		memory,

		// Flag to know if list was already fired
		fired,

		// Flag to prevent firing
		locked,

		// Actual callback list
		list = [],

		// Queue of execution data for repeatable lists
		queue = [],

		// Index of currently firing callback (modified by add/remove as needed)
		firingIndex = -1,

		// Fire callbacks
		fire = function() {

			// Enforce single-firing
			locked = options.once;

			// Execute callbacks for all pending executions,
			// respecting firingIndex overrides and runtime changes
			fired = firing = true;
			for ( ; queue.length; firingIndex = -1 ) {
				memory = queue.shift();
				while ( ++firingIndex < list.length ) {

					// Run callback and check for early termination
					if ( list[ firingIndex ].apply( memory[ 0 ], memory[ 1 ] ) === false &&
						options.stopOnFalse ) {

						// Jump to end and forget the data so .add doesn't re-fire
						firingIndex = list.length;
						memory = false;
					}
				}
			}

			// Forget the data if we're done with it
			if ( !options.memory ) {
				memory = false;
			}

			firing = false;

			// Clean up if we're done firing for good
			if ( locked ) {

				// Keep an empty list if we have data for future add calls
				if ( memory ) {
					list = [];

				// Otherwise, this object is spent
				} else {
					list = "";
				}
			}
		},

		// Actual Callbacks object
		self = {

			// Add a callback or a collection of callbacks to the list
			add: function() {
				if ( list ) {

					// If we have memory from a past run, we should fire after adding
					if ( memory && !firing ) {
						firingIndex = list.length - 1;
						queue.push( memory );
					}

					( function add( args ) {
						jQuery.each( args, function( _, arg ) {
							if ( jQuery.isFunction( arg ) ) {
								if ( !options.unique || !self.has( arg ) ) {
									list.push( arg );
								}
							} else if ( arg && arg.length && jQuery.type( arg ) !== "string" ) {

								// Inspect recursively
								add( arg );
							}
						} );
					} )( arguments );

					if ( memory && !firing ) {
						fire();
					}
				}
				return this;
			},

			// Remove a callback from the list
			remove: function() {
				jQuery.each( arguments, function( _, arg ) {
					var index;
					while ( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
						list.splice( index, 1 );

						// Handle firing indexes
						if ( index <= firingIndex ) {
							firingIndex--;
						}
					}
				} );
				return this;
			},

			// Check if a given callback is in the list.
			// If no argument is given, return whether or not list has callbacks attached.
			has: function( fn ) {
				return fn ?
					jQuery.inArray( fn, list ) > -1 :
					list.length > 0;
			},

			// Remove all callbacks from the list
			empty: function() {
				if ( list ) {
					list = [];
				}
				return this;
			},

			// Disable .fire and .add
			// Abort any current/pending executions
			// Clear all callbacks and values
			disable: function() {
				locked = queue = [];
				list = memory = "";
				return this;
			},
			disabled: function() {
				return !list;
			},

			// Disable .fire
			// Also disable .add unless we have memory (since it would have no effect)
			// Abort any pending executions
			lock: function() {
				locked = true;
				if ( !memory ) {
					self.disable();
				}
				return this;
			},
			locked: function() {
				return !!locked;
			},

			// Call all callbacks with the given context and arguments
			fireWith: function( context, args ) {
				if ( !locked ) {
					args = args || [];
					args = [ context, args.slice ? args.slice() : args ];
					queue.push( args );
					if ( !firing ) {
						fire();
					}
				}
				return this;
			},

			// Call all the callbacks with the given arguments
			fire: function() {
				self.fireWith( this, arguments );
				return this;
			},

			// To know if the callbacks have already been called at least once
			fired: function() {
				return !!fired;
			}
		};

	return self;
};


jQuery.extend( {

	Deferred: function( func ) {
		var tuples = [

				// action, add listener, listener list, final state
				[ "resolve", "done", jQuery.Callbacks( "once memory" ), "resolved" ],
				[ "reject", "fail", jQuery.Callbacks( "once memory" ), "rejected" ],
				[ "notify", "progress", jQuery.Callbacks( "memory" ) ]
			],
			state = "pending",
			promise = {
				state: function() {
					return state;
				},
				always: function() {
					deferred.done( arguments ).fail( arguments );
					return this;
				},
				then: function( /* fnDone, fnFail, fnProgress */ ) {
					var fns = arguments;
					return jQuery.Deferred( function( newDefer ) {
						jQuery.each( tuples, function( i, tuple ) {
							var fn = jQuery.isFunction( fns[ i ] ) && fns[ i ];

							// deferred[ done | fail | progress ] for forwarding actions to newDefer
							deferred[ tuple[ 1 ] ]( function() {
								var returned = fn && fn.apply( this, arguments );
								if ( returned && jQuery.isFunction( returned.promise ) ) {
									returned.promise()
										.progress( newDefer.notify )
										.done( newDefer.resolve )
										.fail( newDefer.reject );
								} else {
									newDefer[ tuple[ 0 ] + "With" ](
										this === promise ? newDefer.promise() : this,
										fn ? [ returned ] : arguments
									);
								}
							} );
						} );
						fns = null;
					} ).promise();
				},

				// Get a promise for this deferred
				// If obj is provided, the promise aspect is added to the object
				promise: function( obj ) {
					return obj != null ? jQuery.extend( obj, promise ) : promise;
				}
			},
			deferred = {};

		// Keep pipe for back-compat
		promise.pipe = promise.then;

		// Add list-specific methods
		jQuery.each( tuples, function( i, tuple ) {
			var list = tuple[ 2 ],
				stateString = tuple[ 3 ];

			// promise[ done | fail | progress ] = list.add
			promise[ tuple[ 1 ] ] = list.add;

			// Handle state
			if ( stateString ) {
				list.add( function() {

					// state = [ resolved | rejected ]
					state = stateString;

				// [ reject_list | resolve_list ].disable; progress_list.lock
				}, tuples[ i ^ 1 ][ 2 ].disable, tuples[ 2 ][ 2 ].lock );
			}

			// deferred[ resolve | reject | notify ]
			deferred[ tuple[ 0 ] ] = function() {
				deferred[ tuple[ 0 ] + "With" ]( this === deferred ? promise : this, arguments );
				return this;
			};
			deferred[ tuple[ 0 ] + "With" ] = list.fireWith;
		} );

		// Make the deferred a promise
		promise.promise( deferred );

		// Call given func if any
		if ( func ) {
			func.call( deferred, deferred );
		}

		// All done!
		return deferred;
	},

	// Deferred helper
	when: function( subordinate /* , ..., subordinateN */ ) {
		var i = 0,
			resolveValues = slice.call( arguments ),
			length = resolveValues.length,

			// the count of uncompleted subordinates
			remaining = length !== 1 ||
				( subordinate && jQuery.isFunction( subordinate.promise ) ) ? length : 0,

			// the master Deferred.
			// If resolveValues consist of only a single Deferred, just use that.
			deferred = remaining === 1 ? subordinate : jQuery.Deferred(),

			// Update function for both resolve and progress values
			updateFunc = function( i, contexts, values ) {
				return function( value ) {
					contexts[ i ] = this;
					values[ i ] = arguments.length > 1 ? slice.call( arguments ) : value;
					if ( values === progressValues ) {
						deferred.notifyWith( contexts, values );

					} else if ( !( --remaining ) ) {
						deferred.resolveWith( contexts, values );
					}
				};
			},

			progressValues, progressContexts, resolveContexts;

		// add listeners to Deferred subordinates; treat others as resolved
		if ( length > 1 ) {
			progressValues = new Array( length );
			progressContexts = new Array( length );
			resolveContexts = new Array( length );
			for ( ; i < length; i++ ) {
				if ( resolveValues[ i ] && jQuery.isFunction( resolveValues[ i ].promise ) ) {
					resolveValues[ i ].promise()
						.progress( updateFunc( i, progressContexts, progressValues ) )
						.done( updateFunc( i, resolveContexts, resolveValues ) )
						.fail( deferred.reject );
				} else {
					--remaining;
				}
			}
		}

		// if we're not waiting on anything, resolve the master
		if ( !remaining ) {
			deferred.resolveWith( resolveContexts, resolveValues );
		}

		return deferred.promise();
	}
} );


// The deferred used on DOM ready
var readyList;

jQuery.fn.ready = function( fn ) {

	// Add the callback
	jQuery.ready.promise().done( fn );

	return this;
};

jQuery.extend( {

	// Is the DOM ready to be used? Set to true once it occurs.
	isReady: false,

	// A counter to track how many items to wait for before
	// the ready event fires. See #6781
	readyWait: 1,

	// Hold (or release) the ready event
	holdReady: function( hold ) {
		if ( hold ) {
			jQuery.readyWait++;
		} else {
			jQuery.ready( true );
		}
	},

	// Handle when the DOM is ready
	ready: function( wait ) {

		// Abort if there are pending holds or we're already ready
		if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
			return;
		}

		// Remember that the DOM is ready
		jQuery.isReady = true;

		// If a normal DOM Ready event fired, decrement, and wait if need be
		if ( wait !== true && --jQuery.readyWait > 0 ) {
			return;
		}

		// If there are functions bound, to execute
		readyList.resolveWith( document, [ jQuery ] );

		// Trigger any bound ready events
		if ( jQuery.fn.triggerHandler ) {
			jQuery( document ).triggerHandler( "ready" );
			jQuery( document ).off( "ready" );
		}
	}
} );

/**
 * Clean-up method for dom ready events
 */
function detach() {
	if ( document.addEventListener ) {
		document.removeEventListener( "DOMContentLoaded", completed );
		window.removeEventListener( "load", completed );

	} else {
		document.detachEvent( "onreadystatechange", completed );
		window.detachEvent( "onload", completed );
	}
}

/**
 * The ready event handler and self cleanup method
 */
function completed() {

	// readyState === "complete" is good enough for us to call the dom ready in oldIE
	if ( document.addEventListener ||
		window.event.type === "load" ||
		document.readyState === "complete" ) {

		detach();
		jQuery.ready();
	}
}

jQuery.ready.promise = function( obj ) {
	if ( !readyList ) {

		readyList = jQuery.Deferred();

		// Catch cases where $(document).ready() is called
		// after the browser event has already occurred.
		// Support: IE6-10
		// Older IE sometimes signals "interactive" too soon
		if ( document.readyState === "complete" ||
			( document.readyState !== "loading" && !document.documentElement.doScroll ) ) {

			// Handle it asynchronously to allow scripts the opportunity to delay ready
			window.setTimeout( jQuery.ready );

		// Standards-based browsers support DOMContentLoaded
		} else if ( document.addEventListener ) {

			// Use the handy event callback
			document.addEventListener( "DOMContentLoaded", completed );

			// A fallback to window.onload, that will always work
			window.addEventListener( "load", completed );

		// If IE event model is used
		} else {

			// Ensure firing before onload, maybe late but safe also for iframes
			document.attachEvent( "onreadystatechange", completed );

			// A fallback to window.onload, that will always work
			window.attachEvent( "onload", completed );

			// If IE and not a frame
			// continually check to see if the document is ready
			var top = false;

			try {
				top = window.frameElement == null && document.documentElement;
			} catch ( e ) {}

			if ( top && top.doScroll ) {
				( function doScrollCheck() {
					if ( !jQuery.isReady ) {

						try {

							// Use the trick by Diego Perini
							// http://javascript.nwbox.com/IEContentLoaded/
							top.doScroll( "left" );
						} catch ( e ) {
							return window.setTimeout( doScrollCheck, 50 );
						}

						// detach all dom ready events
						detach();

						// and execute any waiting functions
						jQuery.ready();
					}
				} )();
			}
		}
	}
	return readyList.promise( obj );
};

// Kick off the DOM ready check even if the user does not
jQuery.ready.promise();




// Support: IE<9
// Iteration over object's inherited properties before its own
var i;
for ( i in jQuery( support ) ) {
	break;
}
support.ownFirst = i === "0";

// Note: most support tests are defined in their respective modules.
// false until the test is run
support.inlineBlockNeedsLayout = false;

// Execute ASAP in case we need to set body.style.zoom
jQuery( function() {

	// Minified: var a,b,c,d
	var val, div, body, container;

	body = document.getElementsByTagName( "body" )[ 0 ];
	if ( !body || !body.style ) {

		// Return for frameset docs that don't have a body
		return;
	}

	// Setup
	div = document.createElement( "div" );
	container = document.createElement( "div" );
	container.style.cssText = "position:absolute;border:0;width:0;height:0;top:0;left:-9999px";
	body.appendChild( container ).appendChild( div );

	if ( typeof div.style.zoom !== "undefined" ) {

		// Support: IE<8
		// Check if natively block-level elements act like inline-block
		// elements when setting their display to 'inline' and giving
		// them layout
		div.style.cssText = "display:inline;margin:0;border:0;padding:1px;width:1px;zoom:1";

		support.inlineBlockNeedsLayout = val = div.offsetWidth === 3;
		if ( val ) {

			// Prevent IE 6 from affecting layout for positioned elements #11048
			// Prevent IE from shrinking the body in IE 7 mode #12869
			// Support: IE<8
			body.style.zoom = 1;
		}
	}

	body.removeChild( container );
} );


( function() {
	var div = document.createElement( "div" );

	// Support: IE<9
	support.deleteExpando = true;
	try {
		delete div.test;
	} catch ( e ) {
		support.deleteExpando = false;
	}

	// Null elements to avoid leaks in IE.
	div = null;
} )();
var acceptData = function( elem ) {
	var noData = jQuery.noData[ ( elem.nodeName + " " ).toLowerCase() ],
		nodeType = +elem.nodeType || 1;

	// Do not set data on non-element DOM nodes because it will not be cleared (#8335).
	return nodeType !== 1 && nodeType !== 9 ?
		false :

		// Nodes accept data unless otherwise specified; rejection can be conditional
		!noData || noData !== true && elem.getAttribute( "classid" ) === noData;
};




var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
	rmultiDash = /([A-Z])/g;

function dataAttr( elem, key, data ) {

	// If nothing was found internally, try to fetch any
	// data from the HTML5 data-* attribute
	if ( data === undefined && elem.nodeType === 1 ) {

		var name = "data-" + key.replace( rmultiDash, "-$1" ).toLowerCase();

		data = elem.getAttribute( name );

		if ( typeof data === "string" ) {
			try {
				data = data === "true" ? true :
					data === "false" ? false :
					data === "null" ? null :

					// Only convert to a number if it doesn't change the string
					+data + "" === data ? +data :
					rbrace.test( data ) ? jQuery.parseJSON( data ) :
					data;
			} catch ( e ) {}

			// Make sure we set the data so it isn't changed later
			jQuery.data( elem, key, data );

		} else {
			data = undefined;
		}
	}

	return data;
}

// checks a cache object for emptiness
function isEmptyDataObject( obj ) {
	var name;
	for ( name in obj ) {

		// if the public data object is empty, the private is still empty
		if ( name === "data" && jQuery.isEmptyObject( obj[ name ] ) ) {
			continue;
		}
		if ( name !== "toJSON" ) {
			return false;
		}
	}

	return true;
}

function internalData( elem, name, data, pvt /* Internal Use Only */ ) {
	if ( !acceptData( elem ) ) {
		return;
	}

	var ret, thisCache,
		internalKey = jQuery.expando,

		// We have to handle DOM nodes and JS objects differently because IE6-7
		// can't GC object references properly across the DOM-JS boundary
		isNode = elem.nodeType,

		// Only DOM nodes need the global jQuery cache; JS object data is
		// attached directly to the object so GC can occur automatically
		cache = isNode ? jQuery.cache : elem,

		// Only defining an ID for JS objects if its cache already exists allows
		// the code to shortcut on the same path as a DOM node with no cache
		id = isNode ? elem[ internalKey ] : elem[ internalKey ] && internalKey;

	// Avoid doing any more work than we need to when trying to get data on an
	// object that has no data at all
	if ( ( !id || !cache[ id ] || ( !pvt && !cache[ id ].data ) ) &&
		data === undefined && typeof name === "string" ) {
		return;
	}

	if ( !id ) {

		// Only DOM nodes need a new unique ID for each element since their data
		// ends up in the global cache
		if ( isNode ) {
			id = elem[ internalKey ] = deletedIds.pop() || jQuery.guid++;
		} else {
			id = internalKey;
		}
	}

	if ( !cache[ id ] ) {

		// Avoid exposing jQuery metadata on plain JS objects when the object
		// is serialized using JSON.stringify
		cache[ id ] = isNode ? {} : { toJSON: jQuery.noop };
	}

	// An object can be passed to jQuery.data instead of a key/value pair; this gets
	// shallow copied over onto the existing cache
	if ( typeof name === "object" || typeof name === "function" ) {
		if ( pvt ) {
			cache[ id ] = jQuery.extend( cache[ id ], name );
		} else {
			cache[ id ].data = jQuery.extend( cache[ id ].data, name );
		}
	}

	thisCache = cache[ id ];

	// jQuery data() is stored in a separate object inside the object's internal data
	// cache in order to avoid key collisions between internal data and user-defined
	// data.
	if ( !pvt ) {
		if ( !thisCache.data ) {
			thisCache.data = {};
		}

		thisCache = thisCache.data;
	}

	if ( data !== undefined ) {
		thisCache[ jQuery.camelCase( name ) ] = data;
	}

	// Check for both converted-to-camel and non-converted data property names
	// If a data property was specified
	if ( typeof name === "string" ) {

		// First Try to find as-is property data
		ret = thisCache[ name ];

		// Test for null|undefined property data
		if ( ret == null ) {

			// Try to find the camelCased property
			ret = thisCache[ jQuery.camelCase( name ) ];
		}
	} else {
		ret = thisCache;
	}

	return ret;
}

function internalRemoveData( elem, name, pvt ) {
	if ( !acceptData( elem ) ) {
		return;
	}

	var thisCache, i,
		isNode = elem.nodeType,

		// See jQuery.data for more information
		cache = isNode ? jQuery.cache : elem,
		id = isNode ? elem[ jQuery.expando ] : jQuery.expando;

	// If there is already no cache entry for this object, there is no
	// purpose in continuing
	if ( !cache[ id ] ) {
		return;
	}

	if ( name ) {

		thisCache = pvt ? cache[ id ] : cache[ id ].data;

		if ( thisCache ) {

			// Support array or space separated string names for data keys
			if ( !jQuery.isArray( name ) ) {

				// try the string as a key before any manipulation
				if ( name in thisCache ) {
					name = [ name ];
				} else {

					// split the camel cased version by spaces unless a key with the spaces exists
					name = jQuery.camelCase( name );
					if ( name in thisCache ) {
						name = [ name ];
					} else {
						name = name.split( " " );
					}
				}
			} else {

				// If "name" is an array of keys...
				// When data is initially created, via ("key", "val") signature,
				// keys will be converted to camelCase.
				// Since there is no way to tell _how_ a key was added, remove
				// both plain key and camelCase key. #12786
				// This will only penalize the array argument path.
				name = name.concat( jQuery.map( name, jQuery.camelCase ) );
			}

			i = name.length;
			while ( i-- ) {
				delete thisCache[ name[ i ] ];
			}

			// If there is no data left in the cache, we want to continue
			// and let the cache object itself get destroyed
			if ( pvt ? !isEmptyDataObject( thisCache ) : !jQuery.isEmptyObject( thisCache ) ) {
				return;
			}
		}
	}

	// See jQuery.data for more information
	if ( !pvt ) {
		delete cache[ id ].data;

		// Don't destroy the parent cache unless the internal data object
		// had been the only thing left in it
		if ( !isEmptyDataObject( cache[ id ] ) ) {
			return;
		}
	}

	// Destroy the cache
	if ( isNode ) {
		jQuery.cleanData( [ elem ], true );

	// Use delete when supported for expandos or `cache` is not a window per isWindow (#10080)
	/* jshint eqeqeq: false */
	} else if ( support.deleteExpando || cache != cache.window ) {
		/* jshint eqeqeq: true */
		delete cache[ id ];

	// When all else fails, undefined
	} else {
		cache[ id ] = undefined;
	}
}

jQuery.extend( {
	cache: {},

	// The following elements (space-suffixed to avoid Object.prototype collisions)
	// throw uncatchable exceptions if you attempt to set expando properties
	noData: {
		"applet ": true,
		"embed ": true,

		// ...but Flash objects (which have this classid) *can* handle expandos
		"object ": "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"
	},

	hasData: function( elem ) {
		elem = elem.nodeType ? jQuery.cache[ elem[ jQuery.expando ] ] : elem[ jQuery.expando ];
		return !!elem && !isEmptyDataObject( elem );
	},

	data: function( elem, name, data ) {
		return internalData( elem, name, data );
	},

	removeData: function( elem, name ) {
		return internalRemoveData( elem, name );
	},

	// For internal use only.
	_data: function( elem, name, data ) {
		return internalData( elem, name, data, true );
	},

	_removeData: function( elem, name ) {
		return internalRemoveData( elem, name, true );
	}
} );

jQuery.fn.extend( {
	data: function( key, value ) {
		var i, name, data,
			elem = this[ 0 ],
			attrs = elem && elem.attributes;

		// Special expections of .data basically thwart jQuery.access,
		// so implement the relevant behavior ourselves

		// Gets all values
		if ( key === undefined ) {
			if ( this.length ) {
				data = jQuery.data( elem );

				if ( elem.nodeType === 1 && !jQuery._data( elem, "parsedAttrs" ) ) {
					i = attrs.length;
					while ( i-- ) {

						// Support: IE11+
						// The attrs elements can be null (#14894)
						if ( attrs[ i ] ) {
							name = attrs[ i ].name;
							if ( name.indexOf( "data-" ) === 0 ) {
								name = jQuery.camelCase( name.slice( 5 ) );
								dataAttr( elem, name, data[ name ] );
							}
						}
					}
					jQuery._data( elem, "parsedAttrs", true );
				}
			}

			return data;
		}

		// Sets multiple values
		if ( typeof key === "object" ) {
			return this.each( function() {
				jQuery.data( this, key );
			} );
		}

		return arguments.length > 1 ?

			// Sets one value
			this.each( function() {
				jQuery.data( this, key, value );
			} ) :

			// Gets one value
			// Try to fetch any internally stored data first
			elem ? dataAttr( elem, key, jQuery.data( elem, key ) ) : undefined;
	},

	removeData: function( key ) {
		return this.each( function() {
			jQuery.removeData( this, key );
		} );
	}
} );


jQuery.extend( {
	queue: function( elem, type, data ) {
		var queue;

		if ( elem ) {
			type = ( type || "fx" ) + "queue";
			queue = jQuery._data( elem, type );

			// Speed up dequeue by getting out quickly if this is just a lookup
			if ( data ) {
				if ( !queue || jQuery.isArray( data ) ) {
					queue = jQuery._data( elem, type, jQuery.makeArray( data ) );
				} else {
					queue.push( data );
				}
			}
			return queue || [];
		}
	},

	dequeue: function( elem, type ) {
		type = type || "fx";

		var queue = jQuery.queue( elem, type ),
			startLength = queue.length,
			fn = queue.shift(),
			hooks = jQuery._queueHooks( elem, type ),
			next = function() {
				jQuery.dequeue( elem, type );
			};

		// If the fx queue is dequeued, always remove the progress sentinel
		if ( fn === "inprogress" ) {
			fn = queue.shift();
			startLength--;
		}

		if ( fn ) {

			// Add a progress sentinel to prevent the fx queue from being
			// automatically dequeued
			if ( type === "fx" ) {
				queue.unshift( "inprogress" );
			}

			// clear up the last queue stop function
			delete hooks.stop;
			fn.call( elem, next, hooks );
		}

		if ( !startLength && hooks ) {
			hooks.empty.fire();
		}
	},

	// not intended for public consumption - generates a queueHooks object,
	// or returns the current one
	_queueHooks: function( elem, type ) {
		var key = type + "queueHooks";
		return jQuery._data( elem, key ) || jQuery._data( elem, key, {
			empty: jQuery.Callbacks( "once memory" ).add( function() {
				jQuery._removeData( elem, type + "queue" );
				jQuery._removeData( elem, key );
			} )
		} );
	}
} );

jQuery.fn.extend( {
	queue: function( type, data ) {
		var setter = 2;

		if ( typeof type !== "string" ) {
			data = type;
			type = "fx";
			setter--;
		}

		if ( arguments.length < setter ) {
			return jQuery.queue( this[ 0 ], type );
		}

		return data === undefined ?
			this :
			this.each( function() {
				var queue = jQuery.queue( this, type, data );

				// ensure a hooks for this queue
				jQuery._queueHooks( this, type );

				if ( type === "fx" && queue[ 0 ] !== "inprogress" ) {
					jQuery.dequeue( this, type );
				}
			} );
	},
	dequeue: function( type ) {
		return this.each( function() {
			jQuery.dequeue( this, type );
		} );
	},
	clearQueue: function( type ) {
		return this.queue( type || "fx", [] );
	},

	// Get a promise resolved when queues of a certain type
	// are emptied (fx is the type by default)
	promise: function( type, obj ) {
		var tmp,
			count = 1,
			defer = jQuery.Deferred(),
			elements = this,
			i = this.length,
			resolve = function() {
				if ( !( --count ) ) {
					defer.resolveWith( elements, [ elements ] );
				}
			};

		if ( typeof type !== "string" ) {
			obj = type;
			type = undefined;
		}
		type = type || "fx";

		while ( i-- ) {
			tmp = jQuery._data( elements[ i ], type + "queueHooks" );
			if ( tmp && tmp.empty ) {
				count++;
				tmp.empty.add( resolve );
			}
		}
		resolve();
		return defer.promise( obj );
	}
} );


( function() {
	var shrinkWrapBlocksVal;

	support.shrinkWrapBlocks = function() {
		if ( shrinkWrapBlocksVal != null ) {
			return shrinkWrapBlocksVal;
		}

		// Will be changed later if needed.
		shrinkWrapBlocksVal = false;

		// Minified: var b,c,d
		var div, body, container;

		body = document.getElementsByTagName( "body" )[ 0 ];
		if ( !body || !body.style ) {

			// Test fired too early or in an unsupported environment, exit.
			return;
		}

		// Setup
		div = document.createElement( "div" );
		container = document.createElement( "div" );
		container.style.cssText = "position:absolute;border:0;width:0;height:0;top:0;left:-9999px";
		body.appendChild( container ).appendChild( div );

		// Support: IE6
		// Check if elements with layout shrink-wrap their children
		if ( typeof div.style.zoom !== "undefined" ) {

			// Reset CSS: box-sizing; display; margin; border
			div.style.cssText =

				// Support: Firefox<29, Android 2.3
				// Vendor-prefix box-sizing
				"-webkit-box-sizing:content-box;-moz-box-sizing:content-box;" +
				"box-sizing:content-box;display:block;margin:0;border:0;" +
				"padding:1px;width:1px;zoom:1";
			div.appendChild( document.createElement( "div" ) ).style.width = "5px";
			shrinkWrapBlocksVal = div.offsetWidth !== 3;
		}

		body.removeChild( container );

		return shrinkWrapBlocksVal;
	};

} )();
var pnum = ( /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/ ).source;

var rcssNum = new RegExp( "^(?:([+-])=|)(" + pnum + ")([a-z%]*)$", "i" );


var cssExpand = [ "Top", "Right", "Bottom", "Left" ];

var isHidden = function( elem, el ) {

		// isHidden might be called from jQuery#filter function;
		// in that case, element will be second argument
		elem = el || elem;
		return jQuery.css( elem, "display" ) === "none" ||
			!jQuery.contains( elem.ownerDocument, elem );
	};



function adjustCSS( elem, prop, valueParts, tween ) {
	var adjusted,
		scale = 1,
		maxIterations = 20,
		currentValue = tween ?
			function() { return tween.cur(); } :
			function() { return jQuery.css( elem, prop, "" ); },
		initial = currentValue(),
		unit = valueParts && valueParts[ 3 ] || ( jQuery.cssNumber[ prop ] ? "" : "px" ),

		// Starting value computation is required for potential unit mismatches
		initialInUnit = ( jQuery.cssNumber[ prop ] || unit !== "px" && +initial ) &&
			rcssNum.exec( jQuery.css( elem, prop ) );

	if ( initialInUnit && initialInUnit[ 3 ] !== unit ) {

		// Trust units reported by jQuery.css
		unit = unit || initialInUnit[ 3 ];

		// Make sure we update the tween properties later on
		valueParts = valueParts || [];

		// Iteratively approximate from a nonzero starting point
		initialInUnit = +initial || 1;

		do {

			// If previous iteration zeroed out, double until we get *something*.
			// Use string for doubling so we don't accidentally see scale as unchanged below
			scale = scale || ".5";

			// Adjust and apply
			initialInUnit = initialInUnit / scale;
			jQuery.style( elem, prop, initialInUnit + unit );

		// Update scale, tolerating zero or NaN from tween.cur()
		// Break the loop if scale is unchanged or perfect, or if we've just had enough.
		} while (
			scale !== ( scale = currentValue() / initial ) && scale !== 1 && --maxIterations
		);
	}

	if ( valueParts ) {
		initialInUnit = +initialInUnit || +initial || 0;

		// Apply relative offset (+=/-=) if specified
		adjusted = valueParts[ 1 ] ?
			initialInUnit + ( valueParts[ 1 ] + 1 ) * valueParts[ 2 ] :
			+valueParts[ 2 ];
		if ( tween ) {
			tween.unit = unit;
			tween.start = initialInUnit;
			tween.end = adjusted;
		}
	}
	return adjusted;
}


// Multifunctional method to get and set values of a collection
// The value/s can optionally be executed if it's a function
var access = function( elems, fn, key, value, chainable, emptyGet, raw ) {
	var i = 0,
		length = elems.length,
		bulk = key == null;

	// Sets many values
	if ( jQuery.type( key ) === "object" ) {
		chainable = true;
		for ( i in key ) {
			access( elems, fn, i, key[ i ], true, emptyGet, raw );
		}

	// Sets one value
	} else if ( value !== undefined ) {
		chainable = true;

		if ( !jQuery.isFunction( value ) ) {
			raw = true;
		}

		if ( bulk ) {

			// Bulk operations run against the entire set
			if ( raw ) {
				fn.call( elems, value );
				fn = null;

			// ...except when executing function values
			} else {
				bulk = fn;
				fn = function( elem, key, value ) {
					return bulk.call( jQuery( elem ), value );
				};
			}
		}

		if ( fn ) {
			for ( ; i < length; i++ ) {
				fn(
					elems[ i ],
					key,
					raw ? value : value.call( elems[ i ], i, fn( elems[ i ], key ) )
				);
			}
		}
	}

	return chainable ?
		elems :

		// Gets
		bulk ?
			fn.call( elems ) :
			length ? fn( elems[ 0 ], key ) : emptyGet;
};
var rcheckableType = ( /^(?:checkbox|radio)$/i );

var rtagName = ( /<([\w:-]+)/ );

var rscriptType = ( /^$|\/(?:java|ecma)script/i );

var rleadingWhitespace = ( /^\s+/ );

var nodeNames = "abbr|article|aside|audio|bdi|canvas|data|datalist|" +
		"details|dialog|figcaption|figure|footer|header|hgroup|main|" +
		"mark|meter|nav|output|picture|progress|section|summary|template|time|video";



function createSafeFragment( document ) {
	var list = nodeNames.split( "|" ),
		safeFrag = document.createDocumentFragment();

	if ( safeFrag.createElement ) {
		while ( list.length ) {
			safeFrag.createElement(
				list.pop()
			);
		}
	}
	return safeFrag;
}


( function() {
	var div = document.createElement( "div" ),
		fragment = document.createDocumentFragment(),
		input = document.createElement( "input" );

	// Setup
	div.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>";

	// IE strips leading whitespace when .innerHTML is used
	support.leadingWhitespace = div.firstChild.nodeType === 3;

	// Make sure that tbody elements aren't automatically inserted
	// IE will insert them into empty tables
	support.tbody = !div.getElementsByTagName( "tbody" ).length;

	// Make sure that link elements get serialized correctly by innerHTML
	// This requires a wrapper element in IE
	support.htmlSerialize = !!div.getElementsByTagName( "link" ).length;

	// Makes sure cloning an html5 element does not cause problems
	// Where outerHTML is undefined, this still works
	support.html5Clone =
		document.createElement( "nav" ).cloneNode( true ).outerHTML !== "<:nav></:nav>";

	// Check if a disconnected checkbox will retain its checked
	// value of true after appended to the DOM (IE6/7)
	input.type = "checkbox";
	input.checked = true;
	fragment.appendChild( input );
	support.appendChecked = input.checked;

	// Make sure textarea (and checkbox) defaultValue is properly cloned
	// Support: IE6-IE11+
	div.innerHTML = "<textarea>x</textarea>";
	support.noCloneChecked = !!div.cloneNode( true ).lastChild.defaultValue;

	// Support: IE <=9 only
	// IE <=9 replaces <option> tags with their contents when inserted outside of
	// the select element.
	div.innerHTML = "<option></option>";
	support.option = !!div.lastChild;

	// #11217 - WebKit loses check when the name is after the checked attribute
	fragment.appendChild( div );

	// Support: Windows Web Apps (WWA)
	// `name` and `type` must use .setAttribute for WWA (#14901)
	input = document.createElement( "input" );
	input.setAttribute( "type", "radio" );
	input.setAttribute( "checked", "checked" );
	input.setAttribute( "name", "t" );

	div.appendChild( input );

	// Support: Safari 5.1, iOS 5.1, Android 4.x, Android 2.3
	// old WebKit doesn't clone checked state correctly in fragments
	support.checkClone = div.cloneNode( true ).cloneNode( true ).lastChild.checked;

	// Support: IE<9
	// Cloned elements keep attachEvent handlers, we use addEventListener on IE9+
	support.noCloneEvent = !!div.addEventListener;

	// Support: IE<9
	// Since attributes and properties are the same in IE,
	// cleanData must set properties to undefined rather than use removeAttribute
	div[ jQuery.expando ] = 1;
	support.attributes = !div.getAttribute( jQuery.expando );
} )();


// We have to close these tags to support XHTML (#13200)
var wrapMap = {
	legend: [ 1, "<fieldset>", "</fieldset>" ],
	area: [ 1, "<map>", "</map>" ],

	// Support: IE8
	param: [ 1, "<object>", "</object>" ],
	thead: [ 1, "<table>", "</table>" ],
	tr: [ 2, "<table><tbody>", "</tbody></table>" ],
	col: [ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ],
	td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],

	// IE6-8 can't serialize link, script, style, or any html5 (NoScope) tags,
	// unless wrapped in a div with non-breaking characters in front of it.
	_default: support.htmlSerialize ? [ 0, "", "" ] : [ 1, "X<div>", "</div>" ]
};

wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;
// Support: IE <=9 only
if ( !support.option ) {
    wrapMap.optgroup = wrapMap.option = [ 1, "<select multiple='multiple'>", "</select>" ];
}

function getAll( context, tag ) {
	var elems, elem,
		i = 0,
		found = typeof context.getElementsByTagName !== "undefined" ?
			context.getElementsByTagName( tag || "*" ) :
			typeof context.querySelectorAll !== "undefined" ?
				context.querySelectorAll( tag || "*" ) :
				undefined;

	if ( !found ) {
		for ( found = [], elems = context.childNodes || context;
			( elem = elems[ i ] ) != null;
			i++
		) {
			if ( !tag || jQuery.nodeName( elem, tag ) ) {
				found.push( elem );
			} else {
				jQuery.merge( found, getAll( elem, tag ) );
			}
		}
	}

	return tag === undefined || tag && jQuery.nodeName( context, tag ) ?
		jQuery.merge( [ context ], found ) :
		found;
}


// Mark scripts as having already been evaluated
function setGlobalEval( elems, refElements ) {
	var elem,
		i = 0;
	for ( ; ( elem = elems[ i ] ) != null; i++ ) {
		jQuery._data(
			elem,
			"globalEval",
			!refElements || jQuery._data( refElements[ i ], "globalEval" )
		);
	}
}


var rhtml = /<|&#?\w+;/,
	rtbody = /<tbody/i;

function fixDefaultChecked( elem ) {
	if ( rcheckableType.test( elem.type ) ) {
		elem.defaultChecked = elem.checked;
	}
}

function buildFragment( elems, context, scripts, selection, ignored ) {
	var j, elem, contains,
		tmp, tag, tbody, wrap,
		l = elems.length,

		// Ensure a safe fragment
		safe = createSafeFragment( context ),

		nodes = [],
		i = 0;

	for ( ; i < l; i++ ) {
		elem = elems[ i ];

		if ( elem || elem === 0 ) {

			// Add nodes directly
			if ( jQuery.type( elem ) === "object" ) {
				jQuery.merge( nodes, elem.nodeType ? [ elem ] : elem );

			// Convert non-html into a text node
			} else if ( !rhtml.test( elem ) ) {
				nodes.push( context.createTextNode( elem ) );

			// Convert html into DOM nodes
			} else {
				tmp = tmp || safe.appendChild( context.createElement( "div" ) );

				// Deserialize a standard representation
				tag = ( rtagName.exec( elem ) || [ "", "" ] )[ 1 ].toLowerCase();
				wrap = wrapMap[ tag ] || wrapMap._default;

				tmp.innerHTML = wrap[ 1 ] + jQuery.htmlPrefilter( elem ) + wrap[ 2 ];

				// Descend through wrappers to the right content
				j = wrap[ 0 ];
				while ( j-- ) {
					tmp = tmp.lastChild;
				}

				// Manually add leading whitespace removed by IE
				if ( !support.leadingWhitespace && rleadingWhitespace.test( elem ) ) {
					nodes.push( context.createTextNode( rleadingWhitespace.exec( elem )[ 0 ] ) );
				}

				// Remove IE's autoinserted <tbody> from table fragments
				if ( !support.tbody ) {

					// String was a <table>, *may* have spurious <tbody>
					elem = tag === "table" && !rtbody.test( elem ) ?
						tmp.firstChild :

						// String was a bare <thead> or <tfoot>
						wrap[ 1 ] === "<table>" && !rtbody.test( elem ) ?
							tmp :
							0;

					j = elem && elem.childNodes.length;
					while ( j-- ) {
						if ( jQuery.nodeName( ( tbody = elem.childNodes[ j ] ), "tbody" ) &&
							!tbody.childNodes.length ) {

							elem.removeChild( tbody );
						}
					}
				}

				jQuery.merge( nodes, tmp.childNodes );

				// Fix #12392 for WebKit and IE > 9
				tmp.textContent = "";

				// Fix #12392 for oldIE
				while ( tmp.firstChild ) {
					tmp.removeChild( tmp.firstChild );
				}

				// Remember the top-level container for proper cleanup
				tmp = safe.lastChild;
			}
		}
	}

	// Fix #11356: Clear elements from fragment
	if ( tmp ) {
		safe.removeChild( tmp );
	}

	// Reset defaultChecked for any radios and checkboxes
	// about to be appended to the DOM in IE 6/7 (#8060)
	if ( !support.appendChecked ) {
		jQuery.grep( getAll( nodes, "input" ), fixDefaultChecked );
	}

	i = 0;
	while ( ( elem = nodes[ i++ ] ) ) {

		// Skip elements already in the context collection (trac-4087)
		if ( selection && jQuery.inArray( elem, selection ) > -1 ) {
			if ( ignored ) {
				ignored.push( elem );
			}

			continue;
		}

		contains = jQuery.contains( elem.ownerDocument, elem );

		// Append to fragment
		tmp = getAll( safe.appendChild( elem ), "script" );

		// Preserve script evaluation history
		if ( contains ) {
			setGlobalEval( tmp );
		}

		// Capture executables
		if ( scripts ) {
			j = 0;
			while ( ( elem = tmp[ j++ ] ) ) {
				if ( rscriptType.test( elem.type || "" ) ) {
					scripts.push( elem );
				}
			}
		}
	}

	tmp = null;

	return safe;
}


( function() {
	var i, eventName,
		div = document.createElement( "div" );

	// Support: IE<9 (lack submit/change bubble), Firefox (lack focus(in | out) events)
	for ( i in { submit: true, change: true, focusin: true } ) {
		eventName = "on" + i;

		if ( !( support[ i ] = eventName in window ) ) {

			// Beware of CSP restrictions (https://developer.mozilla.org/en/Security/CSP)
			div.setAttribute( eventName, "t" );
			support[ i ] = div.attributes[ eventName ].expando === false;
		}
	}

	// Null elements to avoid leaks in IE.
	div = null;
} )();


var rformElems = /^(?:input|select|textarea)$/i,
	rkeyEvent = /^key/,
	rmouseEvent = /^(?:mouse|pointer|contextmenu|drag|drop)|click/,
	rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
	rtypenamespace = /^([^.]*)(?:\.(.+)|)/;

function returnTrue() {
	return true;
}

function returnFalse() {
	return false;
}

// Support: IE9
// See #13393 for more info
function safeActiveElement() {
	try {
		return document.activeElement;
	} catch ( err ) { }
}

function on( elem, types, selector, data, fn, one ) {
	var origFn, type;

	// Types can be a map of types/handlers
	if ( typeof types === "object" ) {

		// ( types-Object, selector, data )
		if ( typeof selector !== "string" ) {

			// ( types-Object, data )
			data = data || selector;
			selector = undefined;
		}
		for ( type in types ) {
			on( elem, type, selector, data, types[ type ], one );
		}
		return elem;
	}

	if ( data == null && fn == null ) {

		// ( types, fn )
		fn = selector;
		data = selector = undefined;
	} else if ( fn == null ) {
		if ( typeof selector === "string" ) {

			// ( types, selector, fn )
			fn = data;
			data = undefined;
		} else {

			// ( types, data, fn )
			fn = data;
			data = selector;
			selector = undefined;
		}
	}
	if ( fn === false ) {
		fn = returnFalse;
	} else if ( !fn ) {
		return elem;
	}

	if ( one === 1 ) {
		origFn = fn;
		fn = function( event ) {

			// Can use an empty set, since event contains the info
			jQuery().off( event );
			return origFn.apply( this, arguments );
		};

		// Use same guid so caller can remove using origFn
		fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
	}
	return elem.each( function() {
		jQuery.event.add( this, types, fn, data, selector );
	} );
}

/*
 * Helper functions for managing events -- not part of the public interface.
 * Props to Dean Edwards' addEvent library for many of the ideas.
 */
jQuery.event = {

	global: {},

	add: function( elem, types, handler, data, selector ) {
		var tmp, events, t, handleObjIn,
			special, eventHandle, handleObj,
			handlers, type, namespaces, origType,
			elemData = jQuery._data( elem );

		// Don't attach events to noData or text/comment nodes (but allow plain objects)
		if ( !elemData ) {
			return;
		}

		// Caller can pass in an object of custom data in lieu of the handler
		if ( handler.handler ) {
			handleObjIn = handler;
			handler = handleObjIn.handler;
			selector = handleObjIn.selector;
		}

		// Make sure that the handler has a unique ID, used to find/remove it later
		if ( !handler.guid ) {
			handler.guid = jQuery.guid++;
		}

		// Init the element's event structure and main handler, if this is the first
		if ( !( events = elemData.events ) ) {
			events = elemData.events = {};
		}
		if ( !( eventHandle = elemData.handle ) ) {
			eventHandle = elemData.handle = function( e ) {

				// Discard the second event of a jQuery.event.trigger() and
				// when an event is called after a page has unloaded
				return typeof jQuery !== "undefined" &&
					( !e || jQuery.event.triggered !== e.type ) ?
					jQuery.event.dispatch.apply( eventHandle.elem, arguments ) :
					undefined;
			};

			// Add elem as a property of the handle fn to prevent a memory leak
			// with IE non-native events
			eventHandle.elem = elem;
		}

		// Handle multiple events separated by a space
		types = ( types || "" ).match( rnotwhite ) || [ "" ];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[ t ] ) || [];
			type = origType = tmp[ 1 ];
			namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();

			// There *must* be a type, no attaching namespace-only handlers
			if ( !type ) {
				continue;
			}

			// If event changes its type, use the special event handlers for the changed type
			special = jQuery.event.special[ type ] || {};

			// If selector defined, determine special event api type, otherwise given type
			type = ( selector ? special.delegateType : special.bindType ) || type;

			// Update special based on newly reset type
			special = jQuery.event.special[ type ] || {};

			// handleObj is passed to all event handlers
			handleObj = jQuery.extend( {
				type: type,
				origType: origType,
				data: data,
				handler: handler,
				guid: handler.guid,
				selector: selector,
				needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
				namespace: namespaces.join( "." )
			}, handleObjIn );

			// Init the event handler queue if we're the first
			if ( !( handlers = events[ type ] ) ) {
				handlers = events[ type ] = [];
				handlers.delegateCount = 0;

				// Only use addEventListener/attachEvent if the special events handler returns false
				if ( !special.setup ||
					special.setup.call( elem, data, namespaces, eventHandle ) === false ) {

					// Bind the global event handler to the element
					if ( elem.addEventListener ) {
						elem.addEventListener( type, eventHandle, false );

					} else if ( elem.attachEvent ) {
						elem.attachEvent( "on" + type, eventHandle );
					}
				}
			}

			if ( special.add ) {
				special.add.call( elem, handleObj );

				if ( !handleObj.handler.guid ) {
					handleObj.handler.guid = handler.guid;
				}
			}

			// Add to the element's handler list, delegates in front
			if ( selector ) {
				handlers.splice( handlers.delegateCount++, 0, handleObj );
			} else {
				handlers.push( handleObj );
			}

			// Keep track of which events have ever been used, for event optimization
			jQuery.event.global[ type ] = true;
		}

		// Nullify elem to prevent memory leaks in IE
		elem = null;
	},

	// Detach an event or set of events from an element
	remove: function( elem, types, handler, selector, mappedTypes ) {
		var j, handleObj, tmp,
			origCount, t, events,
			special, handlers, type,
			namespaces, origType,
			elemData = jQuery.hasData( elem ) && jQuery._data( elem );

		if ( !elemData || !( events = elemData.events ) ) {
			return;
		}

		// Once for each type.namespace in types; type may be omitted
		types = ( types || "" ).match( rnotwhite ) || [ "" ];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[ t ] ) || [];
			type = origType = tmp[ 1 ];
			namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();

			// Unbind all events (on this namespace, if provided) for the element
			if ( !type ) {
				for ( type in events ) {
					jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
				}
				continue;
			}

			special = jQuery.event.special[ type ] || {};
			type = ( selector ? special.delegateType : special.bindType ) || type;
			handlers = events[ type ] || [];
			tmp = tmp[ 2 ] &&
				new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" );

			// Remove matching events
			origCount = j = handlers.length;
			while ( j-- ) {
				handleObj = handlers[ j ];

				if ( ( mappedTypes || origType === handleObj.origType ) &&
					( !handler || handler.guid === handleObj.guid ) &&
					( !tmp || tmp.test( handleObj.namespace ) ) &&
					( !selector || selector === handleObj.selector ||
						selector === "**" && handleObj.selector ) ) {
					handlers.splice( j, 1 );

					if ( handleObj.selector ) {
						handlers.delegateCount--;
					}
					if ( special.remove ) {
						special.remove.call( elem, handleObj );
					}
				}
			}

			// Remove generic event handler if we removed something and no more handlers exist
			// (avoids potential for endless recursion during removal of special event handlers)
			if ( origCount && !handlers.length ) {
				if ( !special.teardown ||
					special.teardown.call( elem, namespaces, elemData.handle ) === false ) {

					jQuery.removeEvent( elem, type, elemData.handle );
				}

				delete events[ type ];
			}
		}

		// Remove the expando if it's no longer used
		if ( jQuery.isEmptyObject( events ) ) {
			delete elemData.handle;

			// removeData also checks for emptiness and clears the expando if empty
			// so use it instead of delete
			jQuery._removeData( elem, "events" );
		}
	},

	trigger: function( event, data, elem, onlyHandlers ) {
		var handle, ontype, cur,
			bubbleType, special, tmp, i,
			eventPath = [ elem || document ],
			type = hasOwn.call( event, "type" ) ? event.type : event,
			namespaces = hasOwn.call( event, "namespace" ) ? event.namespace.split( "." ) : [];

		cur = tmp = elem = elem || document;

		// Don't do events on text and comment nodes
		if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
			return;
		}

		// focus/blur morphs to focusin/out; ensure we're not firing them right now
		if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
			return;
		}

		if ( type.indexOf( "." ) > -1 ) {

			// Namespaced trigger; create a regexp to match event type in handle()
			namespaces = type.split( "." );
			type = namespaces.shift();
			namespaces.sort();
		}
		ontype = type.indexOf( ":" ) < 0 && "on" + type;

		// Caller can pass in a jQuery.Event object, Object, or just an event type string
		event = event[ jQuery.expando ] ?
			event :
			new jQuery.Event( type, typeof event === "object" && event );

		// Trigger bitmask: & 1 for native handlers; & 2 for jQuery (always true)
		event.isTrigger = onlyHandlers ? 2 : 3;
		event.namespace = namespaces.join( "." );
		event.rnamespace = event.namespace ?
			new RegExp( "(^|\\.)" + namespaces.join( "\\.(?:.*\\.|)" ) + "(\\.|$)" ) :
			null;

		// Clean up the event in case it is being reused
		event.result = undefined;
		if ( !event.target ) {
			event.target = elem;
		}

		// Clone any incoming data and prepend the event, creating the handler arg list
		data = data == null ?
			[ event ] :
			jQuery.makeArray( data, [ event ] );

		// Allow special events to draw outside the lines
		special = jQuery.event.special[ type ] || {};
		if ( !onlyHandlers && special.trigger && special.trigger.apply( elem, data ) === false ) {
			return;
		}

		// Determine event propagation path in advance, per W3C events spec (#9951)
		// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
		if ( !onlyHandlers && !special.noBubble && !jQuery.isWindow( elem ) ) {

			bubbleType = special.delegateType || type;
			if ( !rfocusMorph.test( bubbleType + type ) ) {
				cur = cur.parentNode;
			}
			for ( ; cur; cur = cur.parentNode ) {
				eventPath.push( cur );
				tmp = cur;
			}

			// Only add window if we got to document (e.g., not plain obj or detached DOM)
			if ( tmp === ( elem.ownerDocument || document ) ) {
				eventPath.push( tmp.defaultView || tmp.parentWindow || window );
			}
		}

		// Fire handlers on the event path
		i = 0;
		while ( ( cur = eventPath[ i++ ] ) && !event.isPropagationStopped() ) {

			event.type = i > 1 ?
				bubbleType :
				special.bindType || type;

			// jQuery handler
			handle = ( jQuery._data( cur, "events" ) || {} )[ event.type ] &&
				jQuery._data( cur, "handle" );

			if ( handle ) {
				handle.apply( cur, data );
			}

			// Native handler
			handle = ontype && cur[ ontype ];
			if ( handle && handle.apply && acceptData( cur ) ) {
				event.result = handle.apply( cur, data );
				if ( event.result === false ) {
					event.preventDefault();
				}
			}
		}
		event.type = type;

		// If nobody prevented the default action, do it now
		if ( !onlyHandlers && !event.isDefaultPrevented() ) {

			if (
				( !special._default ||
				 special._default.apply( eventPath.pop(), data ) === false
				) && acceptData( elem )
			) {

				// Call a native DOM method on the target with the same name name as the event.
				// Can't use an .isFunction() check here because IE6/7 fails that test.
				// Don't do default actions on window, that's where global variables be (#6170)
				if ( ontype && elem[ type ] && !jQuery.isWindow( elem ) ) {

					// Don't re-trigger an onFOO event when we call its FOO() method
					tmp = elem[ ontype ];

					if ( tmp ) {
						elem[ ontype ] = null;
					}

					// Prevent re-triggering of the same event, since we already bubbled it above
					jQuery.event.triggered = type;
					try {
						elem[ type ]();
					} catch ( e ) {

						// IE<9 dies on focus/blur to hidden element (#1486,#12518)
						// only reproducible on winXP IE8 native, not IE9 in IE8 mode
					}
					jQuery.event.triggered = undefined;

					if ( tmp ) {
						elem[ ontype ] = tmp;
					}
				}
			}
		}

		return event.result;
	},

	dispatch: function( event ) {

		// Make a writable jQuery.Event from the native event object
		event = jQuery.event.fix( event );

		var i, j, ret, matched, handleObj,
			handlerQueue = [],
			args = slice.call( arguments ),
			handlers = ( jQuery._data( this, "events" ) || {} )[ event.type ] || [],
			special = jQuery.event.special[ event.type ] || {};

		// Use the fix-ed jQuery.Event rather than the (read-only) native event
		args[ 0 ] = event;
		event.delegateTarget = this;

		// Call the preDispatch hook for the mapped type, and let it bail if desired
		if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
			return;
		}

		// Determine handlers
		handlerQueue = jQuery.event.handlers.call( this, event, handlers );

		// Run delegates first; they may want to stop propagation beneath us
		i = 0;
		while ( ( matched = handlerQueue[ i++ ] ) && !event.isPropagationStopped() ) {
			event.currentTarget = matched.elem;

			j = 0;
			while ( ( handleObj = matched.handlers[ j++ ] ) &&
				!event.isImmediatePropagationStopped() ) {

				// Triggered event must either 1) have no namespace, or 2) have namespace(s)
				// a subset or equal to those in the bound event (both can have no namespace).
				if ( !event.rnamespace || event.rnamespace.test( handleObj.namespace ) ) {

					event.handleObj = handleObj;
					event.data = handleObj.data;

					ret = ( ( jQuery.event.special[ handleObj.origType ] || {} ).handle ||
						handleObj.handler ).apply( matched.elem, args );

					if ( ret !== undefined ) {
						if ( ( event.result = ret ) === false ) {
							event.preventDefault();
							event.stopPropagation();
						}
					}
				}
			}
		}

		// Call the postDispatch hook for the mapped type
		if ( special.postDispatch ) {
			special.postDispatch.call( this, event );
		}

		return event.result;
	},

	handlers: function( event, handlers ) {
		var i, matches, sel, handleObj,
			handlerQueue = [],
			delegateCount = handlers.delegateCount,
			cur = event.target;

		// Support (at least): Chrome, IE9
		// Find delegate handlers
		// Black-hole SVG <use> instance trees (#13180)
		//
		// Support: Firefox<=42+
		// Avoid non-left-click in FF but don't block IE radio events (#3861, gh-2343)
		if ( delegateCount && cur.nodeType &&
			( event.type !== "click" || isNaN( event.button ) || event.button < 1 ) ) {

			/* jshint eqeqeq: false */
			for ( ; cur != this; cur = cur.parentNode || this ) {
				/* jshint eqeqeq: true */

				// Don't check non-elements (#13208)
				// Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
				if ( cur.nodeType === 1 && ( cur.disabled !== true || event.type !== "click" ) ) {
					matches = [];
					for ( i = 0; i < delegateCount; i++ ) {
						handleObj = handlers[ i ];

						// Don't conflict with Object.prototype properties (#13203)
						sel = handleObj.selector + " ";

						if ( matches[ sel ] === undefined ) {
							matches[ sel ] = handleObj.needsContext ?
								jQuery( sel, this ).index( cur ) > -1 :
								jQuery.find( sel, this, null, [ cur ] ).length;
						}
						if ( matches[ sel ] ) {
							matches.push( handleObj );
						}
					}
					if ( matches.length ) {
						handlerQueue.push( { elem: cur, handlers: matches } );
					}
				}
			}
		}

		// Add the remaining (directly-bound) handlers
		if ( delegateCount < handlers.length ) {
			handlerQueue.push( { elem: this, handlers: handlers.slice( delegateCount ) } );
		}

		return handlerQueue;
	},

	fix: function( event ) {
		if ( event[ jQuery.expando ] ) {
			return event;
		}

		// Create a writable copy of the event object and normalize some properties
		var i, prop, copy,
			type = event.type,
			originalEvent = event,
			fixHook = this.fixHooks[ type ];

		if ( !fixHook ) {
			this.fixHooks[ type ] = fixHook =
				rmouseEvent.test( type ) ? this.mouseHooks :
				rkeyEvent.test( type ) ? this.keyHooks :
				{};
		}
		copy = fixHook.props ? this.props.concat( fixHook.props ) : this.props;

		event = new jQuery.Event( originalEvent );

		i = copy.length;
		while ( i-- ) {
			prop = copy[ i ];
			event[ prop ] = originalEvent[ prop ];
		}

		// Support: IE<9
		// Fix target property (#1925)
		if ( !event.target ) {
			event.target = originalEvent.srcElement || document;
		}

		// Support: Safari 6-8+
		// Target should not be a text node (#504, #13143)
		if ( event.target.nodeType === 3 ) {
			event.target = event.target.parentNode;
		}

		// Support: IE<9
		// For mouse/key events, metaKey==false if it's undefined (#3368, #11328)
		event.metaKey = !!event.metaKey;

		return fixHook.filter ? fixHook.filter( event, originalEvent ) : event;
	},

	// Includes some event props shared by KeyEvent and MouseEvent
	props: ( "altKey bubbles cancelable ctrlKey currentTarget detail eventPhase " +
		"metaKey relatedTarget shiftKey target timeStamp view which" ).split( " " ),

	fixHooks: {},

	keyHooks: {
		props: "char charCode key keyCode".split( " " ),
		filter: function( event, original ) {

			// Add which for key events
			if ( event.which == null ) {
				event.which = original.charCode != null ? original.charCode : original.keyCode;
			}

			return event;
		}
	},

	mouseHooks: {
		props: ( "button buttons clientX clientY fromElement offsetX offsetY " +
			"pageX pageY screenX screenY toElement" ).split( " " ),
		filter: function( event, original ) {
			var body, eventDoc, doc,
				button = original.button,
				fromElement = original.fromElement;

			// Calculate pageX/Y if missing and clientX/Y available
			if ( event.pageX == null && original.clientX != null ) {
				eventDoc = event.target.ownerDocument || document;
				doc = eventDoc.documentElement;
				body = eventDoc.body;

				event.pageX = original.clientX +
					( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) -
					( doc && doc.clientLeft || body && body.clientLeft || 0 );
				event.pageY = original.clientY +
					( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) -
					( doc && doc.clientTop  || body && body.clientTop  || 0 );
			}

			// Add relatedTarget, if necessary
			if ( !event.relatedTarget && fromElement ) {
				event.relatedTarget = fromElement === event.target ?
					original.toElement :
					fromElement;
			}

			// Add which for click: 1 === left; 2 === middle; 3 === right
			// Note: button is not normalized, so don't use it
			if ( !event.which && button !== undefined ) {
				event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
			}

			return event;
		}
	},

	special: {
		load: {

			// Prevent triggered image.load events from bubbling to window.load
			noBubble: true
		},
		focus: {

			// Fire native event if possible so blur/focus sequence is correct
			trigger: function() {
				if ( this !== safeActiveElement() && this.focus ) {
					try {
						this.focus();
						return false;
					} catch ( e ) {

						// Support: IE<9
						// If we error on focus to hidden element (#1486, #12518),
						// let .trigger() run the handlers
					}
				}
			},
			delegateType: "focusin"
		},
		blur: {
			trigger: function() {
				if ( this === safeActiveElement() && this.blur ) {
					this.blur();
					return false;
				}
			},
			delegateType: "focusout"
		},
		click: {

			// For checkbox, fire native event so checked state will be right
			trigger: function() {
				if ( jQuery.nodeName( this, "input" ) && this.type === "checkbox" && this.click ) {
					this.click();
					return false;
				}
			},

			// For cross-browser consistency, don't fire native .click() on links
			_default: function( event ) {
				return jQuery.nodeName( event.target, "a" );
			}
		},

		beforeunload: {
			postDispatch: function( event ) {

				// Support: Firefox 20+
				// Firefox doesn't alert if the returnValue field is not set.
				if ( event.result !== undefined && event.originalEvent ) {
					event.originalEvent.returnValue = event.result;
				}
			}
		}
	},

	// Piggyback on a donor event to simulate a different one
	simulate: function( type, elem, event ) {
		var e = jQuery.extend(
			new jQuery.Event(),
			event,
			{
				type: type,
				isSimulated: true

				// Previously, `originalEvent: {}` was set here, so stopPropagation call
				// would not be triggered on donor event, since in our own
				// jQuery.event.stopPropagation function we had a check for existence of
				// originalEvent.stopPropagation method, so, consequently it would be a noop.
				//
				// Guard for simulated events was moved to jQuery.event.stopPropagation function
				// since `originalEvent` should point to the original event for the
				// constancy with other events and for more focused logic
			}
		);

		jQuery.event.trigger( e, null, elem );

		if ( e.isDefaultPrevented() ) {
			event.preventDefault();
		}
	}
};

jQuery.removeEvent = document.removeEventListener ?
	function( elem, type, handle ) {

		// This "if" is needed for plain objects
		if ( elem.removeEventListener ) {
			elem.removeEventListener( type, handle );
		}
	} :
	function( elem, type, handle ) {
		var name = "on" + type;

		if ( elem.detachEvent ) {

			// #8545, #7054, preventing memory leaks for custom events in IE6-8
			// detachEvent needed property on element, by name of that event,
			// to properly expose it to GC
			if ( typeof elem[ name ] === "undefined" ) {
				elem[ name ] = null;
			}

			elem.detachEvent( name, handle );
		}
	};

jQuery.Event = function( src, props ) {

	// Allow instantiation without the 'new' keyword
	if ( !( this instanceof jQuery.Event ) ) {
		return new jQuery.Event( src, props );
	}

	// Event object
	if ( src && src.type ) {
		this.originalEvent = src;
		this.type = src.type;

		// Events bubbling up the document may have been marked as prevented
		// by a handler lower down the tree; reflect the correct value.
		this.isDefaultPrevented = src.defaultPrevented ||
				src.defaultPrevented === undefined &&

				// Support: IE < 9, Android < 4.0
				src.returnValue === false ?
			returnTrue :
			returnFalse;

	// Event type
	} else {
		this.type = src;
	}

	// Put explicitly provided properties onto the event object
	if ( props ) {
		jQuery.extend( this, props );
	}

	// Create a timestamp if incoming event doesn't have one
	this.timeStamp = src && src.timeStamp || jQuery.now();

	// Mark it as fixed
	this[ jQuery.expando ] = true;
};

// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
jQuery.Event.prototype = {
	constructor: jQuery.Event,
	isDefaultPrevented: returnFalse,
	isPropagationStopped: returnFalse,
	isImmediatePropagationStopped: returnFalse,

	preventDefault: function() {
		var e = this.originalEvent;

		this.isDefaultPrevented = returnTrue;
		if ( !e ) {
			return;
		}

		// If preventDefault exists, run it on the original event
		if ( e.preventDefault ) {
			e.preventDefault();

		// Support: IE
		// Otherwise set the returnValue property of the original event to false
		} else {
			e.returnValue = false;
		}
	},
	stopPropagation: function() {
		var e = this.originalEvent;

		this.isPropagationStopped = returnTrue;

		if ( !e || this.isSimulated ) {
			return;
		}

		// If stopPropagation exists, run it on the original event
		if ( e.stopPropagation ) {
			e.stopPropagation();
		}

		// Support: IE
		// Set the cancelBubble property of the original event to true
		e.cancelBubble = true;
	},
	stopImmediatePropagation: function() {
		var e = this.originalEvent;

		this.isImmediatePropagationStopped = returnTrue;

		if ( e && e.stopImmediatePropagation ) {
			e.stopImmediatePropagation();
		}

		this.stopPropagation();
	}
};

// Create mouseenter/leave events using mouseover/out and event-time checks
// so that event delegation works in jQuery.
// Do the same for pointerenter/pointerleave and pointerover/pointerout
//
// Support: Safari 7 only
// Safari sends mouseenter too often; see:
// https://code.google.com/p/chromium/issues/detail?id=470258
// for the description of the bug (it existed in older Chrome versions as well).
jQuery.each( {
	mouseenter: "mouseover",
	mouseleave: "mouseout",
	pointerenter: "pointerover",
	pointerleave: "pointerout"
}, function( orig, fix ) {
	jQuery.event.special[ orig ] = {
		delegateType: fix,
		bindType: fix,

		handle: function( event ) {
			var ret,
				target = this,
				related = event.relatedTarget,
				handleObj = event.handleObj;

			// For mouseenter/leave call the handler if related is outside the target.
			// NB: No relatedTarget if the mouse left/entered the browser window
			if ( !related || ( related !== target && !jQuery.contains( target, related ) ) ) {
				event.type = handleObj.origType;
				ret = handleObj.handler.apply( this, arguments );
				event.type = fix;
			}
			return ret;
		}
	};
} );

// IE submit delegation
if ( !support.submit ) {

	jQuery.event.special.submit = {
		setup: function() {

			// Only need this for delegated form submit events
			if ( jQuery.nodeName( this, "form" ) ) {
				return false;
			}

			// Lazy-add a submit handler when a descendant form may potentially be submitted
			jQuery.event.add( this, "click._submit keypress._submit", function( e ) {

				// Node name check avoids a VML-related crash in IE (#9807)
				var elem = e.target,
					form = jQuery.nodeName( elem, "input" ) || jQuery.nodeName( elem, "button" ) ?

						// Support: IE <=8
						// We use jQuery.prop instead of elem.form
						// to allow fixing the IE8 delegated submit issue (gh-2332)
						// by 3rd party polyfills/workarounds.
						jQuery.prop( elem, "form" ) :
						undefined;

				if ( form && !jQuery._data( form, "submit" ) ) {
					jQuery.event.add( form, "submit._submit", function( event ) {
						event._submitBubble = true;
					} );
					jQuery._data( form, "submit", true );
				}
			} );

			// return undefined since we don't need an event listener
		},

		postDispatch: function( event ) {

			// If form was submitted by the user, bubble the event up the tree
			if ( event._submitBubble ) {
				delete event._submitBubble;
				if ( this.parentNode && !event.isTrigger ) {
					jQuery.event.simulate( "submit", this.parentNode, event );
				}
			}
		},

		teardown: function() {

			// Only need this for delegated form submit events
			if ( jQuery.nodeName( this, "form" ) ) {
				return false;
			}

			// Remove delegated handlers; cleanData eventually reaps submit handlers attached above
			jQuery.event.remove( this, "._submit" );
		}
	};
}

// IE change delegation and checkbox/radio fix
if ( !support.change ) {

	jQuery.event.special.change = {

		setup: function() {

			if ( rformElems.test( this.nodeName ) ) {

				// IE doesn't fire change on a check/radio until blur; trigger it on click
				// after a propertychange. Eat the blur-change in special.change.handle.
				// This still fires onchange a second time for check/radio after blur.
				if ( this.type === "checkbox" || this.type === "radio" ) {
					jQuery.event.add( this, "propertychange._change", function( event ) {
						if ( event.originalEvent.propertyName === "checked" ) {
							this._justChanged = true;
						}
					} );
					jQuery.event.add( this, "click._change", function( event ) {
						if ( this._justChanged && !event.isTrigger ) {
							this._justChanged = false;
						}

						// Allow triggered, simulated change events (#11500)
						jQuery.event.simulate( "change", this, event );
					} );
				}
				return false;
			}

			// Delegated event; lazy-add a change handler on descendant inputs
			jQuery.event.add( this, "beforeactivate._change", function( e ) {
				var elem = e.target;

				if ( rformElems.test( elem.nodeName ) && !jQuery._data( elem, "change" ) ) {
					jQuery.event.add( elem, "change._change", function( event ) {
						if ( this.parentNode && !event.isSimulated && !event.isTrigger ) {
							jQuery.event.simulate( "change", this.parentNode, event );
						}
					} );
					jQuery._data( elem, "change", true );
				}
			} );
		},

		handle: function( event ) {
			var elem = event.target;

			// Swallow native change events from checkbox/radio, we already triggered them above
			if ( this !== elem || event.isSimulated || event.isTrigger ||
				( elem.type !== "radio" && elem.type !== "checkbox" ) ) {

				return event.handleObj.handler.apply( this, arguments );
			}
		},

		teardown: function() {
			jQuery.event.remove( this, "._change" );

			return !rformElems.test( this.nodeName );
		}
	};
}

// Support: Firefox
// Firefox doesn't have focus(in | out) events
// Related ticket - https://bugzilla.mozilla.org/show_bug.cgi?id=687787
//
// Support: Chrome, Safari
// focus(in | out) events fire after focus & blur events,
// which is spec violation - http://www.w3.org/TR/DOM-Level-3-Events/#events-focusevent-event-order
// Related ticket - https://code.google.com/p/chromium/issues/detail?id=449857
if ( !support.focusin ) {
	jQuery.each( { focus: "focusin", blur: "focusout" }, function( orig, fix ) {

		// Attach a single capturing handler on the document while someone wants focusin/focusout
		var handler = function( event ) {
			jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ) );
		};

		jQuery.event.special[ fix ] = {
			setup: function() {
				var doc = this.ownerDocument || this,
					attaches = jQuery._data( doc, fix );

				if ( !attaches ) {
					doc.addEventListener( orig, handler, true );
				}
				jQuery._data( doc, fix, ( attaches || 0 ) + 1 );
			},
			teardown: function() {
				var doc = this.ownerDocument || this,
					attaches = jQuery._data( doc, fix ) - 1;

				if ( !attaches ) {
					doc.removeEventListener( orig, handler, true );
					jQuery._removeData( doc, fix );
				} else {
					jQuery._data( doc, fix, attaches );
				}
			}
		};
	} );
}

jQuery.fn.extend( {

	on: function( types, selector, data, fn ) {
		return on( this, types, selector, data, fn );
	},
	one: function( types, selector, data, fn ) {
		return on( this, types, selector, data, fn, 1 );
	},
	off: function( types, selector, fn ) {
		var handleObj, type;
		if ( types && types.preventDefault && types.handleObj ) {

			// ( event )  dispatched jQuery.Event
			handleObj = types.handleObj;
			jQuery( types.delegateTarget ).off(
				handleObj.namespace ?
					handleObj.origType + "." + handleObj.namespace :
					handleObj.origType,
				handleObj.selector,
				handleObj.handler
			);
			return this;
		}
		if ( typeof types === "object" ) {

			// ( types-object [, selector] )
			for ( type in types ) {
				this.off( type, selector, types[ type ] );
			}
			return this;
		}
		if ( selector === false || typeof selector === "function" ) {

			// ( types [, fn] )
			fn = selector;
			selector = undefined;
		}
		if ( fn === false ) {
			fn = returnFalse;
		}
		return this.each( function() {
			jQuery.event.remove( this, types, fn, selector );
		} );
	},

	trigger: function( type, data ) {
		return this.each( function() {
			jQuery.event.trigger( type, data, this );
		} );
	},
	triggerHandler: function( type, data ) {
		var elem = this[ 0 ];
		if ( elem ) {
			return jQuery.event.trigger( type, data, elem, true );
		}
	}
} );


var rinlinejQuery = / jQuery\d+="(?:null|\d+)"/g,
	rnoshimcache = new RegExp( "<(?:" + nodeNames + ")[\\s/>]", "i" ),

	// Support: IE 10-11, Edge 10240+
	// In IE/Edge using regex groups here causes severe slowdowns.
	// See https://connect.microsoft.com/IE/feedback/details/1736512/
	rnoInnerhtml = /<script|<style|<link/i,

	// checked="checked" or checked
	rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
	rscriptTypeMasked = /^true\/(.*)/,
	rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,
	safeFragment = createSafeFragment( document ),
	fragmentDiv = safeFragment.appendChild( document.createElement( "div" ) );

// Support: IE<8
// Manipulating tables requires a tbody
function manipulationTarget( elem, content ) {
	return jQuery.nodeName( elem, "table" ) &&
		jQuery.nodeName( content.nodeType !== 11 ? content : content.firstChild, "tr" ) ?

		elem.getElementsByTagName( "tbody" )[ 0 ] ||
			elem.appendChild( elem.ownerDocument.createElement( "tbody" ) ) :
		elem;
}

// Replace/restore the type attribute of script elements for safe DOM manipulation
function disableScript( elem ) {
	elem.type = ( jQuery.find.attr( elem, "type" ) !== null ) + "/" + elem.type;
	return elem;
}
function restoreScript( elem ) {
	var match = rscriptTypeMasked.exec( elem.type );
	if ( match ) {
		elem.type = match[ 1 ];
	} else {
		elem.removeAttribute( "type" );
	}
	return elem;
}

function cloneCopyEvent( src, dest ) {
	if ( dest.nodeType !== 1 || !jQuery.hasData( src ) ) {
		return;
	}

	var type, i, l,
		oldData = jQuery._data( src ),
		curData = jQuery._data( dest, oldData ),
		events = oldData.events;

	if ( events ) {
		delete curData.handle;
		curData.events = {};

		for ( type in events ) {
			for ( i = 0, l = events[ type ].length; i < l; i++ ) {
				jQuery.event.add( dest, type, events[ type ][ i ] );
			}
		}
	}

	// make the cloned public data object a copy from the original
	if ( curData.data ) {
		curData.data = jQuery.extend( {}, curData.data );
	}
}

function fixCloneNodeIssues( src, dest ) {
	var nodeName, e, data;

	// We do not need to do anything for non-Elements
	if ( dest.nodeType !== 1 ) {
		return;
	}

	nodeName = dest.nodeName.toLowerCase();

	// IE6-8 copies events bound via attachEvent when using cloneNode.
	if ( !support.noCloneEvent && dest[ jQuery.expando ] ) {
		data = jQuery._data( dest );

		for ( e in data.events ) {
			jQuery.removeEvent( dest, e, data.handle );
		}

		// Event data gets referenced instead of copied if the expando gets copied too
		dest.removeAttribute( jQuery.expando );
	}

	// IE blanks contents when cloning scripts, and tries to evaluate newly-set text
	if ( nodeName === "script" && dest.text !== src.text ) {
		disableScript( dest ).text = src.text;
		restoreScript( dest );

	// IE6-10 improperly clones children of object elements using classid.
	// IE10 throws NoModificationAllowedError if parent is null, #12132.
	} else if ( nodeName === "object" ) {
		if ( dest.parentNode ) {
			dest.outerHTML = src.outerHTML;
		}

		// This path appears unavoidable for IE9. When cloning an object
		// element in IE9, the outerHTML strategy above is not sufficient.
		// If the src has innerHTML and the destination does not,
		// copy the src.innerHTML into the dest.innerHTML. #10324
		if ( support.html5Clone && ( src.innerHTML && !jQuery.trim( dest.innerHTML ) ) ) {
			dest.innerHTML = src.innerHTML;
		}

	} else if ( nodeName === "input" && rcheckableType.test( src.type ) ) {

		// IE6-8 fails to persist the checked state of a cloned checkbox
		// or radio button. Worse, IE6-7 fail to give the cloned element
		// a checked appearance if the defaultChecked value isn't also set

		dest.defaultChecked = dest.checked = src.checked;

		// IE6-7 get confused and end up setting the value of a cloned
		// checkbox/radio button to an empty string instead of "on"
		if ( dest.value !== src.value ) {
			dest.value = src.value;
		}

	// IE6-8 fails to return the selected option to the default selected
	// state when cloning options
	} else if ( nodeName === "option" ) {
		dest.defaultSelected = dest.selected = src.defaultSelected;

	// IE6-8 fails to set the defaultValue to the correct value when
	// cloning other types of input fields
	} else if ( nodeName === "input" || nodeName === "textarea" ) {
		dest.defaultValue = src.defaultValue;
	}
}

function domManip( collection, args, callback, ignored ) {

	// Flatten any nested arrays
	args = concat.apply( [], args );

	var first, node, hasScripts,
		scripts, doc, fragment,
		i = 0,
		l = collection.length,
		iNoClone = l - 1,
		value = args[ 0 ],
		isFunction = jQuery.isFunction( value );

	// We can't cloneNode fragments that contain checked, in WebKit
	if ( isFunction ||
			( l > 1 && typeof value === "string" &&
				!support.checkClone && rchecked.test( value ) ) ) {
		return collection.each( function( index ) {
			var self = collection.eq( index );
			if ( isFunction ) {
				args[ 0 ] = value.call( this, index, self.html() );
			}
			domManip( self, args, callback, ignored );
		} );
	}

	if ( l ) {
		fragment = buildFragment( args, collection[ 0 ].ownerDocument, false, collection, ignored );
		first = fragment.firstChild;

		if ( fragment.childNodes.length === 1 ) {
			fragment = first;
		}

		// Require either new content or an interest in ignored elements to invoke the callback
		if ( first || ignored ) {
			scripts = jQuery.map( getAll( fragment, "script" ), disableScript );
			hasScripts = scripts.length;

			// Use the original fragment for the last item
			// instead of the first because it can end up
			// being emptied incorrectly in certain situations (#8070).
			for ( ; i < l; i++ ) {
				node = fragment;

				if ( i !== iNoClone ) {
					node = jQuery.clone( node, true, true );

					// Keep references to cloned scripts for later restoration
					if ( hasScripts ) {

						// Support: Android<4.1, PhantomJS<2
						// push.apply(_, arraylike) throws on ancient WebKit
						jQuery.merge( scripts, getAll( node, "script" ) );
					}
				}

				callback.call( collection[ i ], node, i );
			}

			if ( hasScripts ) {
				doc = scripts[ scripts.length - 1 ].ownerDocument;

				// Reenable scripts
				jQuery.map( scripts, restoreScript );

				// Evaluate executable scripts on first document insertion
				for ( i = 0; i < hasScripts; i++ ) {
					node = scripts[ i ];
					if ( rscriptType.test( node.type || "" ) &&
						!jQuery._data( node, "globalEval" ) &&
						jQuery.contains( doc, node ) ) {

						if ( node.src ) {

							// Optional AJAX dependency, but won't run scripts if not present
							if ( jQuery._evalUrl ) {
								jQuery._evalUrl( node.src );
							}
						} else {
							jQuery.globalEval(
								( node.text || node.textContent || node.innerHTML || "" )
									.replace( rcleanScript, "" )
							);
						}
					}
				}
			}

			// Fix #11809: Avoid leaking memory
			fragment = first = null;
		}
	}

	return collection;
}

function remove( elem, selector, keepData ) {
	var node,
		elems = selector ? jQuery.filter( selector, elem ) : elem,
		i = 0;

	for ( ; ( node = elems[ i ] ) != null; i++ ) {

		if ( !keepData && node.nodeType === 1 ) {
			jQuery.cleanData( getAll( node ) );
		}

		if ( node.parentNode ) {
			if ( keepData && jQuery.contains( node.ownerDocument, node ) ) {
				setGlobalEval( getAll( node, "script" ) );
			}
			node.parentNode.removeChild( node );
		}
	}

	return elem;
}

jQuery.extend( {
	htmlPrefilter: function( html ) {
        return html;
	},

	clone: function( elem, dataAndEvents, deepDataAndEvents ) {
		var destElements, node, clone, i, srcElements,
			inPage = jQuery.contains( elem.ownerDocument, elem );

		if ( support.html5Clone || jQuery.isXMLDoc( elem ) ||
			!rnoshimcache.test( "<" + elem.nodeName + ">" ) ) {

			clone = elem.cloneNode( true );

		// IE<=8 does not properly clone detached, unknown element nodes
		} else {
			fragmentDiv.innerHTML = elem.outerHTML;
			fragmentDiv.removeChild( clone = fragmentDiv.firstChild );
		}

		if ( ( !support.noCloneEvent || !support.noCloneChecked ) &&
				( elem.nodeType === 1 || elem.nodeType === 11 ) && !jQuery.isXMLDoc( elem ) ) {

			// We eschew Sizzle here for performance reasons: http://jsperf.com/getall-vs-sizzle/2
			destElements = getAll( clone );
			srcElements = getAll( elem );

			// Fix all IE cloning issues
			for ( i = 0; ( node = srcElements[ i ] ) != null; ++i ) {

				// Ensure that the destination node is not null; Fixes #9587
				if ( destElements[ i ] ) {
					fixCloneNodeIssues( node, destElements[ i ] );
				}
			}
		}

		// Copy the events from the original to the clone
		if ( dataAndEvents ) {
			if ( deepDataAndEvents ) {
				srcElements = srcElements || getAll( elem );
				destElements = destElements || getAll( clone );

				for ( i = 0; ( node = srcElements[ i ] ) != null; i++ ) {
					cloneCopyEvent( node, destElements[ i ] );
				}
			} else {
				cloneCopyEvent( elem, clone );
			}
		}

		// Preserve script evaluation history
		destElements = getAll( clone, "script" );
		if ( destElements.length > 0 ) {
			setGlobalEval( destElements, !inPage && getAll( elem, "script" ) );
		}

		destElements = srcElements = node = null;

		// Return the cloned set
		return clone;
	},

	cleanData: function( elems, /* internal */ forceAcceptData ) {
		var elem, type, id, data,
			i = 0,
			internalKey = jQuery.expando,
			cache = jQuery.cache,
			attributes = support.attributes,
			special = jQuery.event.special;

		for ( ; ( elem = elems[ i ] ) != null; i++ ) {
			if ( forceAcceptData || acceptData( elem ) ) {

				id = elem[ internalKey ];
				data = id && cache[ id ];

				if ( data ) {
					if ( data.events ) {
						for ( type in data.events ) {
							if ( special[ type ] ) {
								jQuery.event.remove( elem, type );

							// This is a shortcut to avoid jQuery.event.remove's overhead
							} else {
								jQuery.removeEvent( elem, type, data.handle );
							}
						}
					}

					// Remove cache only if it was not already removed by jQuery.event.remove
					if ( cache[ id ] ) {

						delete cache[ id ];

						// Support: IE<9
						// IE does not allow us to delete expando properties from nodes
						// IE creates expando attributes along with the property
						// IE does not have a removeAttribute function on Document nodes
						if ( !attributes && typeof elem.removeAttribute !== "undefined" ) {
							elem.removeAttribute( internalKey );

						// Webkit & Blink performance suffers when deleting properties
						// from DOM nodes, so set to undefined instead
						// https://code.google.com/p/chromium/issues/detail?id=378607
						} else {
							elem[ internalKey ] = undefined;
						}

						deletedIds.push( id );
					}
				}
			}
		}
	}
} );

jQuery.fn.extend( {

	// Keep domManip exposed until 3.0 (gh-2225)
	domManip: domManip,

	detach: function( selector ) {
		return remove( this, selector, true );
	},

	remove: function( selector ) {
		return remove( this, selector );
	},

	text: function( value ) {
		return access( this, function( value ) {
			return value === undefined ?
				jQuery.text( this ) :
				this.empty().append(
					( this[ 0 ] && this[ 0 ].ownerDocument || document ).createTextNode( value )
				);
		}, null, value, arguments.length );
	},

	append: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.appendChild( elem );
			}
		} );
	},

	prepend: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.insertBefore( elem, target.firstChild );
			}
		} );
	},

	before: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this );
			}
		} );
	},

	after: function() {
		return domManip( this, arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this.nextSibling );
			}
		} );
	},

	empty: function() {
		var elem,
			i = 0;

		for ( ; ( elem = this[ i ] ) != null; i++ ) {

			// Remove element nodes and prevent memory leaks
			if ( elem.nodeType === 1 ) {
				jQuery.cleanData( getAll( elem, false ) );
			}

			// Remove any remaining nodes
			while ( elem.firstChild ) {
				elem.removeChild( elem.firstChild );
			}

			// If this is a select, ensure that it displays empty (#12336)
			// Support: IE<9
			if ( elem.options && jQuery.nodeName( elem, "select" ) ) {
				elem.options.length = 0;
			}
		}

		return this;
	},

	clone: function( dataAndEvents, deepDataAndEvents ) {
		dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
		deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

		return this.map( function() {
			return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
		} );
	},

	html: function( value ) {
		return access( this, function( value ) {
			var elem = this[ 0 ] || {},
				i = 0,
				l = this.length;

			if ( value === undefined ) {
				return elem.nodeType === 1 ?
					elem.innerHTML.replace( rinlinejQuery, "" ) :
					undefined;
			}

			// See if we can take a shortcut and just use innerHTML
			if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
				( support.htmlSerialize || !rnoshimcache.test( value )  ) &&
				( support.leadingWhitespace || !rleadingWhitespace.test( value ) ) &&
				!wrapMap[ ( rtagName.exec( value ) || [ "", "" ] )[ 1 ].toLowerCase() ] ) {

				value = jQuery.htmlPrefilter( value );

				try {
					for ( ; i < l; i++ ) {

						// Remove element nodes and prevent memory leaks
						elem = this[ i ] || {};
						if ( elem.nodeType === 1 ) {
							jQuery.cleanData( getAll( elem, false ) );
							elem.innerHTML = value;
						}
					}

					elem = 0;

				// If using innerHTML throws an exception, use the fallback method
				} catch ( e ) {}
			}

			if ( elem ) {
				this.empty().append( value );
			}
		}, null, value, arguments.length );
	},

	replaceWith: function() {
		var ignored = [];

		// Make the changes, replacing each non-ignored context element with the new content
		return domManip( this, arguments, function( elem ) {
			var parent = this.parentNode;

			if ( jQuery.inArray( this, ignored ) < 0 ) {
				jQuery.cleanData( getAll( this ) );
				if ( parent ) {
					parent.replaceChild( elem, this );
				}
			}

		// Force callback invocation
		}, ignored );
	}
} );

jQuery.each( {
	appendTo: "append",
	prependTo: "prepend",
	insertBefore: "before",
	insertAfter: "after",
	replaceAll: "replaceWith"
}, function( name, original ) {
	jQuery.fn[ name ] = function( selector ) {
		var elems,
			i = 0,
			ret = [],
			insert = jQuery( selector ),
			last = insert.length - 1;

		for ( ; i <= last; i++ ) {
			elems = i === last ? this : this.clone( true );
			jQuery( insert[ i ] )[ original ]( elems );

			// Modern browsers can apply jQuery collections as arrays, but oldIE needs a .get()
			push.apply( ret, elems.get() );
		}

		return this.pushStack( ret );
	};
} );


var iframe,
	elemdisplay = {

		// Support: Firefox
		// We have to pre-define these values for FF (#10227)
		HTML: "block",
		BODY: "block"
	};

/**
 * Retrieve the actual display of a element
 * @param {String} name nodeName of the element
 * @param {Object} doc Document object
 */

// Called only from within defaultDisplay
function actualDisplay( name, doc ) {
	var elem = jQuery( doc.createElement( name ) ).appendTo( doc.body ),

		display = jQuery.css( elem[ 0 ], "display" );

	// We don't have any data stored on the element,
	// so use "detach" method as fast way to get rid of the element
	elem.detach();

	return display;
}

/**
 * Try to determine the default display value of an element
 * @param {String} nodeName
 */
function defaultDisplay( nodeName ) {
	var doc = document,
		display = elemdisplay[ nodeName ];

	if ( !display ) {
		display = actualDisplay( nodeName, doc );

		// If the simple way fails, read from inside an iframe
		if ( display === "none" || !display ) {

			// Use the already-created iframe if possible
			iframe = ( iframe || jQuery( "<iframe frameborder='0' width='0' height='0'/>" ) )
				.appendTo( doc.documentElement );

			// Always write a new HTML skeleton so Webkit and Firefox don't choke on reuse
			doc = ( iframe[ 0 ].contentWindow || iframe[ 0 ].contentDocument ).document;

			// Support: IE
			doc.write();
			doc.close();

			display = actualDisplay( nodeName, doc );
			iframe.detach();
		}

		// Store the correct default display
		elemdisplay[ nodeName ] = display;
	}

	return display;
}
var rmargin = ( /^margin/ );

var rnumnonpx = new RegExp( "^(" + pnum + ")(?!px)[a-z%]+$", "i" );

var swap = function( elem, options, callback, args ) {
	var ret, name,
		old = {};

	// Remember the old values, and insert the new ones
	for ( name in options ) {
		old[ name ] = elem.style[ name ];
		elem.style[ name ] = options[ name ];
	}

	ret = callback.apply( elem, args || [] );

	// Revert the old values
	for ( name in options ) {
		elem.style[ name ] = old[ name ];
	}

	return ret;
};


var documentElement = document.documentElement;



( function() {
	var pixelPositionVal, pixelMarginRightVal, boxSizingReliableVal,
		reliableHiddenOffsetsVal, reliableMarginRightVal, reliableMarginLeftVal,
		container = document.createElement( "div" ),
		div = document.createElement( "div" );

	// Finish early in limited (non-browser) environments
	if ( !div.style ) {
		return;
	}

	div.style.cssText = "float:left;opacity:.5";

	// Support: IE<9
	// Make sure that element opacity exists (as opposed to filter)
	support.opacity = div.style.opacity === "0.5";

	// Verify style float existence
	// (IE uses styleFloat instead of cssFloat)
	support.cssFloat = !!div.style.cssFloat;

	div.style.backgroundClip = "content-box";
	div.cloneNode( true ).style.backgroundClip = "";
	support.clearCloneStyle = div.style.backgroundClip === "content-box";

	container = document.createElement( "div" );
	container.style.cssText = "border:0;width:8px;height:0;top:0;left:-9999px;" +
		"padding:0;margin-top:1px;position:absolute";
	div.innerHTML = "";
	container.appendChild( div );

	// Support: Firefox<29, Android 2.3
	// Vendor-prefix box-sizing
	support.boxSizing = div.style.boxSizing === "" || div.style.MozBoxSizing === "" ||
		div.style.WebkitBoxSizing === "";

	jQuery.extend( support, {
		reliableHiddenOffsets: function() {
			if ( pixelPositionVal == null ) {
				computeStyleTests();
			}
			return reliableHiddenOffsetsVal;
		},

		boxSizingReliable: function() {

			// We're checking for pixelPositionVal here instead of boxSizingReliableVal
			// since that compresses better and they're computed together anyway.
			if ( pixelPositionVal == null ) {
				computeStyleTests();
			}
			return boxSizingReliableVal;
		},

		pixelMarginRight: function() {

			// Support: Android 4.0-4.3
			if ( pixelPositionVal == null ) {
				computeStyleTests();
			}
			return pixelMarginRightVal;
		},

		pixelPosition: function() {
			if ( pixelPositionVal == null ) {
				computeStyleTests();
			}
			return pixelPositionVal;
		},

		reliableMarginRight: function() {

			// Support: Android 2.3
			if ( pixelPositionVal == null ) {
				computeStyleTests();
			}
			return reliableMarginRightVal;
		},

		reliableMarginLeft: function() {

			// Support: IE <=8 only, Android 4.0 - 4.3 only, Firefox <=3 - 37
			if ( pixelPositionVal == null ) {
				computeStyleTests();
			}
			return reliableMarginLeftVal;
		}
	} );

	function computeStyleTests() {
		var contents, divStyle,
			documentElement = document.documentElement;

		// Setup
		documentElement.appendChild( container );

		div.style.cssText =

			// Support: Android 2.3
			// Vendor-prefix box-sizing
			"-webkit-box-sizing:border-box;box-sizing:border-box;" +
			"position:relative;display:block;" +
			"margin:auto;border:1px;padding:1px;" +
			"top:1%;width:50%";

		// Support: IE<9
		// Assume reasonable values in the absence of getComputedStyle
		pixelPositionVal = boxSizingReliableVal = reliableMarginLeftVal = false;
		pixelMarginRightVal = reliableMarginRightVal = true;

		// Check for getComputedStyle so that this code is not run in IE<9.
		if ( window.getComputedStyle ) {
			divStyle = window.getComputedStyle( div );
			pixelPositionVal = ( divStyle || {} ).top !== "1%";
			reliableMarginLeftVal = ( divStyle || {} ).marginLeft === "2px";
			boxSizingReliableVal = ( divStyle || { width: "4px" } ).width === "4px";

			// Support: Android 4.0 - 4.3 only
			// Some styles come back with percentage values, even though they shouldn't
			div.style.marginRight = "50%";
			pixelMarginRightVal = ( divStyle || { marginRight: "4px" } ).marginRight === "4px";

			// Support: Android 2.3 only
			// Div with explicit width and no margin-right incorrectly
			// gets computed margin-right based on width of container (#3333)
			// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
			contents = div.appendChild( document.createElement( "div" ) );

			// Reset CSS: box-sizing; display; margin; border; padding
			contents.style.cssText = div.style.cssText =

				// Support: Android 2.3
				// Vendor-prefix box-sizing
				"-webkit-box-sizing:content-box;-moz-box-sizing:content-box;" +
				"box-sizing:content-box;display:block;margin:0;border:0;padding:0";
			contents.style.marginRight = contents.style.width = "0";
			div.style.width = "1px";

			reliableMarginRightVal =
				!parseFloat( ( window.getComputedStyle( contents ) || {} ).marginRight );

			div.removeChild( contents );
		}

		// Support: IE6-8
		// First check that getClientRects works as expected
		// Check if table cells still have offsetWidth/Height when they are set
		// to display:none and there are still other visible table cells in a
		// table row; if so, offsetWidth/Height are not reliable for use when
		// determining if an element has been hidden directly using
		// display:none (it is still safe to use offsets if a parent element is
		// hidden; don safety goggles and see bug #4512 for more information).
		div.style.display = "none";
		reliableHiddenOffsetsVal = div.getClientRects().length === 0;
		if ( reliableHiddenOffsetsVal ) {
			div.style.display = "";
			div.innerHTML = "<table><tr><td></td><td>t</td></tr></table>";
			div.childNodes[ 0 ].style.borderCollapse = "separate";
			contents = div.getElementsByTagName( "td" );
			contents[ 0 ].style.cssText = "margin:0;border:0;padding:0;display:none";
			reliableHiddenOffsetsVal = contents[ 0 ].offsetHeight === 0;
			if ( reliableHiddenOffsetsVal ) {
				contents[ 0 ].style.display = "";
				contents[ 1 ].style.display = "none";
				reliableHiddenOffsetsVal = contents[ 0 ].offsetHeight === 0;
			}
		}

		// Teardown
		documentElement.removeChild( container );
	}

} )();


var getStyles, curCSS,
	rposition = /^(top|right|bottom|left)$/;

if ( window.getComputedStyle ) {
	getStyles = function( elem ) {

		// Support: IE<=11+, Firefox<=30+ (#15098, #14150)
		// IE throws on elements created in popups
		// FF meanwhile throws on frame elements through "defaultView.getComputedStyle"
		var view = elem.ownerDocument.defaultView;

		if ( !view || !view.opener ) {
			view = window;
		}

		return view.getComputedStyle( elem );
	};

	curCSS = function( elem, name, computed ) {
		var width, minWidth, maxWidth, ret,
			style = elem.style;

		computed = computed || getStyles( elem );

		// getPropertyValue is only needed for .css('filter') in IE9, see #12537
		ret = computed ? computed.getPropertyValue( name ) || computed[ name ] : undefined;

		// Support: Opera 12.1x only
		// Fall back to style even without computed
		// computed is undefined for elems on document fragments
		if ( ( ret === "" || ret === undefined ) && !jQuery.contains( elem.ownerDocument, elem ) ) {
			ret = jQuery.style( elem, name );
		}

		if ( computed ) {

			// A tribute to the "awesome hack by Dean Edwards"
			// Chrome < 17 and Safari 5.0 uses "computed value"
			// instead of "used value" for margin-right
			// Safari 5.1.7 (at least) returns percentage for a larger set of values,
			// but width seems to be reliably pixels
			// this is against the CSSOM draft spec:
			// http://dev.w3.org/csswg/cssom/#resolved-values
			if ( !support.pixelMarginRight() && rnumnonpx.test( ret ) && rmargin.test( name ) ) {

				// Remember the original values
				width = style.width;
				minWidth = style.minWidth;
				maxWidth = style.maxWidth;

				// Put in the new values to get a computed value out
				style.minWidth = style.maxWidth = style.width = ret;
				ret = computed.width;

				// Revert the changed values
				style.width = width;
				style.minWidth = minWidth;
				style.maxWidth = maxWidth;
			}
		}

		// Support: IE
		// IE returns zIndex value as an integer.
		return ret === undefined ?
			ret :
			ret + "";
	};
} else if ( documentElement.currentStyle ) {
	getStyles = function( elem ) {
		return elem.currentStyle;
	};

	curCSS = function( elem, name, computed ) {
		var left, rs, rsLeft, ret,
			style = elem.style;

		computed = computed || getStyles( elem );
		ret = computed ? computed[ name ] : undefined;

		// Avoid setting ret to empty string here
		// so we don't default to auto
		if ( ret == null && style && style[ name ] ) {
			ret = style[ name ];
		}

		// From the awesome hack by Dean Edwards
		// http://erik.eae.net/archives/2007/07/27/18.54.15/#comment-102291

		// If we're not dealing with a regular pixel number
		// but a number that has a weird ending, we need to convert it to pixels
		// but not position css attributes, as those are
		// proportional to the parent element instead
		// and we can't measure the parent instead because it
		// might trigger a "stacking dolls" problem
		if ( rnumnonpx.test( ret ) && !rposition.test( name ) ) {

			// Remember the original values
			left = style.left;
			rs = elem.runtimeStyle;
			rsLeft = rs && rs.left;

			// Put in the new values to get a computed value out
			if ( rsLeft ) {
				rs.left = elem.currentStyle.left;
			}
			style.left = name === "fontSize" ? "1em" : ret;
			ret = style.pixelLeft + "px";

			// Revert the changed values
			style.left = left;
			if ( rsLeft ) {
				rs.left = rsLeft;
			}
		}

		// Support: IE
		// IE returns zIndex value as an integer.
		return ret === undefined ?
			ret :
			ret + "" || "auto";
	};
}




function addGetHookIf( conditionFn, hookFn ) {

	// Define the hook, we'll check on the first run if it's really needed.
	return {
		get: function() {
			if ( conditionFn() ) {

				// Hook not needed (or it's not possible to use it due
				// to missing dependency), remove it.
				delete this.get;
				return;
			}

			// Hook needed; redefine it so that the support test is not executed again.
			return ( this.get = hookFn ).apply( this, arguments );
		}
	};
}


var

		ralpha = /alpha\([^)]*\)/i,
	ropacity = /opacity\s*=\s*([^)]*)/i,

	// swappable if display is none or starts with table except
	// "table", "table-cell", or "table-caption"
	// see here for display values:
	// https://developer.mozilla.org/en-US/docs/CSS/display
	rdisplayswap = /^(none|table(?!-c[ea]).+)/,
	rnumsplit = new RegExp( "^(" + pnum + ")(.*)$", "i" ),

	cssShow = { position: "absolute", visibility: "hidden", display: "block" },
	cssNormalTransform = {
		letterSpacing: "0",
		fontWeight: "400"
	},

	cssPrefixes = [ "Webkit", "O", "Moz", "ms" ],
	emptyStyle = document.createElement( "div" ).style;


// return a css property mapped to a potentially vendor prefixed property
function vendorPropName( name ) {

	// shortcut for names that are not vendor prefixed
	if ( name in emptyStyle ) {
		return name;
	}

	// check for vendor prefixed names
	var capName = name.charAt( 0 ).toUpperCase() + name.slice( 1 ),
		i = cssPrefixes.length;

	while ( i-- ) {
		name = cssPrefixes[ i ] + capName;
		if ( name in emptyStyle ) {
			return name;
		}
	}
}

function showHide( elements, show ) {
	var display, elem, hidden,
		values = [],
		index = 0,
		length = elements.length;

	for ( ; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}

		values[ index ] = jQuery._data( elem, "olddisplay" );
		display = elem.style.display;
		if ( show ) {

			// Reset the inline display of this element to learn if it is
			// being hidden by cascaded rules or not
			if ( !values[ index ] && display === "none" ) {
				elem.style.display = "";
			}

			// Set elements which have been overridden with display: none
			// in a stylesheet to whatever the default browser style is
			// for such an element
			if ( elem.style.display === "" && isHidden( elem ) ) {
				values[ index ] =
					jQuery._data( elem, "olddisplay", defaultDisplay( elem.nodeName ) );
			}
		} else {
			hidden = isHidden( elem );

			if ( display && display !== "none" || !hidden ) {
				jQuery._data(
					elem,
					"olddisplay",
					hidden ? display : jQuery.css( elem, "display" )
				);
			}
		}
	}

	// Set the display of most of the elements in a second loop
	// to avoid the constant reflow
	for ( index = 0; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}
		if ( !show || elem.style.display === "none" || elem.style.display === "" ) {
			elem.style.display = show ? values[ index ] || "" : "none";
		}
	}

	return elements;
}

function setPositiveNumber( elem, value, subtract ) {
	var matches = rnumsplit.exec( value );
	return matches ?

		// Guard against undefined "subtract", e.g., when used as in cssHooks
		Math.max( 0, matches[ 1 ] - ( subtract || 0 ) ) + ( matches[ 2 ] || "px" ) :
		value;
}

function augmentWidthOrHeight( elem, name, extra, isBorderBox, styles ) {
	var i = extra === ( isBorderBox ? "border" : "content" ) ?

		// If we already have the right measurement, avoid augmentation
		4 :

		// Otherwise initialize for horizontal or vertical properties
		name === "width" ? 1 : 0,

		val = 0;

	for ( ; i < 4; i += 2 ) {

		// both box models exclude margin, so add it if we want it
		if ( extra === "margin" ) {
			val += jQuery.css( elem, extra + cssExpand[ i ], true, styles );
		}

		if ( isBorderBox ) {

			// border-box includes padding, so remove it if we want content
			if ( extra === "content" ) {
				val -= jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );
			}

			// at this point, extra isn't border nor margin, so remove border
			if ( extra !== "margin" ) {
				val -= jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		} else {

			// at this point, extra isn't content, so add padding
			val += jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );

			// at this point, extra isn't content nor padding, so add border
			if ( extra !== "padding" ) {
				val += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		}
	}

	return val;
}

function getWidthOrHeight( elem, name, extra ) {

	// Start with offset property, which is equivalent to the border-box value
	var valueIsBorderBox = true,
		val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
		styles = getStyles( elem ),
		isBorderBox = support.boxSizing &&
			jQuery.css( elem, "boxSizing", false, styles ) === "border-box";

	// some non-html elements return undefined for offsetWidth, so check for null/undefined
	// svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
	// MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
	if ( val <= 0 || val == null ) {

		// Fall back to computed then uncomputed css if necessary
		val = curCSS( elem, name, styles );
		if ( val < 0 || val == null ) {
			val = elem.style[ name ];
		}

		// Computed unit is not pixels. Stop here and return.
		if ( rnumnonpx.test( val ) ) {
			return val;
		}

		// we need the check for style in case a browser which returns unreliable values
		// for getComputedStyle silently falls back to the reliable elem.style
		valueIsBorderBox = isBorderBox &&
			( support.boxSizingReliable() || val === elem.style[ name ] );

		// Normalize "", auto, and prepare for extra
		val = parseFloat( val ) || 0;
	}

	// use the active box-sizing model to add/subtract irrelevant styles
	return ( val +
		augmentWidthOrHeight(
			elem,
			name,
			extra || ( isBorderBox ? "border" : "content" ),
			valueIsBorderBox,
			styles
		)
	) + "px";
}

jQuery.extend( {

	// Add in style property hooks for overriding the default
	// behavior of getting and setting a style property
	cssHooks: {
		opacity: {
			get: function( elem, computed ) {
				if ( computed ) {

					// We should always get a number back from opacity
					var ret = curCSS( elem, "opacity" );
					return ret === "" ? "1" : ret;
				}
			}
		}
	},

	// Don't automatically add "px" to these possibly-unitless properties
	cssNumber: {
		"animationIterationCount": true,
		"columnCount": true,
		"fillOpacity": true,
		"flexGrow": true,
		"flexShrink": true,
		"fontWeight": true,
		"lineHeight": true,
		"opacity": true,
		"order": true,
		"orphans": true,
		"widows": true,
		"zIndex": true,
		"zoom": true
	},

	// Add in properties whose names you wish to fix before
	// setting or getting the value
	cssProps: {

		// normalize float css property
		"float": support.cssFloat ? "cssFloat" : "styleFloat"
	},

	// Get and set the style property on a DOM Node
	style: function( elem, name, value, extra ) {

		// Don't set styles on text and comment nodes
		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
			return;
		}

		// Make sure that we're working with the right name
		var ret, type, hooks,
			origName = jQuery.camelCase( name ),
			style = elem.style;

		name = jQuery.cssProps[ origName ] ||
			( jQuery.cssProps[ origName ] = vendorPropName( origName ) || origName );

		// gets hook for the prefixed version
		// followed by the unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// Check if we're setting a value
		if ( value !== undefined ) {
			type = typeof value;

			// Convert "+=" or "-=" to relative numbers (#7345)
			if ( type === "string" && ( ret = rcssNum.exec( value ) ) && ret[ 1 ] ) {
				value = adjustCSS( elem, name, ret );

				// Fixes bug #9237
				type = "number";
			}

			// Make sure that null and NaN values aren't set. See: #7116
			if ( value == null || value !== value ) {
				return;
			}

			// If a number was passed in, add the unit (except for certain CSS properties)
			if ( type === "number" ) {
				value += ret && ret[ 3 ] || ( jQuery.cssNumber[ origName ] ? "" : "px" );
			}

			// Fixes #8908, it can be done more correctly by specifing setters in cssHooks,
			// but it would mean to define eight
			// (for every problematic property) identical functions
			if ( !support.clearCloneStyle && value === "" && name.indexOf( "background" ) === 0 ) {
				style[ name ] = "inherit";
			}

			// If a hook was provided, use that value, otherwise just set the specified value
			if ( !hooks || !( "set" in hooks ) ||
				( value = hooks.set( elem, value, extra ) ) !== undefined ) {

				// Support: IE
				// Swallow errors from 'invalid' CSS values (#5509)
				try {
					style[ name ] = value;
				} catch ( e ) {}
			}

		} else {

			// If a hook was provided get the non-computed value from there
			if ( hooks && "get" in hooks &&
				( ret = hooks.get( elem, false, extra ) ) !== undefined ) {

				return ret;
			}

			// Otherwise just get the value from the style object
			return style[ name ];
		}
	},

	css: function( elem, name, extra, styles ) {
		var num, val, hooks,
			origName = jQuery.camelCase( name );

		// Make sure that we're working with the right name
		name = jQuery.cssProps[ origName ] ||
			( jQuery.cssProps[ origName ] = vendorPropName( origName ) || origName );

		// gets hook for the prefixed version
		// followed by the unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// If a hook was provided get the computed value from there
		if ( hooks && "get" in hooks ) {
			val = hooks.get( elem, true, extra );
		}

		// Otherwise, if a way to get the computed value exists, use that
		if ( val === undefined ) {
			val = curCSS( elem, name, styles );
		}

		//convert "normal" to computed value
		if ( val === "normal" && name in cssNormalTransform ) {
			val = cssNormalTransform[ name ];
		}

		// Return, converting to number if forced or a qualifier was provided and val looks numeric
		if ( extra === "" || extra ) {
			num = parseFloat( val );
			return extra === true || isFinite( num ) ? num || 0 : val;
		}
		return val;
	}
} );

jQuery.each( [ "height", "width" ], function( i, name ) {
	jQuery.cssHooks[ name ] = {
		get: function( elem, computed, extra ) {
			if ( computed ) {

				// certain elements can have dimension info if we invisibly show them
				// however, it must have a current display style that would benefit from this
				return rdisplayswap.test( jQuery.css( elem, "display" ) ) &&
					elem.offsetWidth === 0 ?
						swap( elem, cssShow, function() {
							return getWidthOrHeight( elem, name, extra );
						} ) :
						getWidthOrHeight( elem, name, extra );
			}
		},

		set: function( elem, value, extra ) {
			var styles = extra && getStyles( elem );
			return setPositiveNumber( elem, value, extra ?
				augmentWidthOrHeight(
					elem,
					name,
					extra,
					support.boxSizing &&
						jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
					styles
				) : 0
			);
		}
	};
} );

if ( !support.opacity ) {
	jQuery.cssHooks.opacity = {
		get: function( elem, computed ) {

			// IE uses filters for opacity
			return ropacity.test( ( computed && elem.currentStyle ?
				elem.currentStyle.filter :
				elem.style.filter ) || "" ) ?
					( 0.01 * parseFloat( RegExp.$1 ) ) + "" :
					computed ? "1" : "";
		},

		set: function( elem, value ) {
			var style = elem.style,
				currentStyle = elem.currentStyle,
				opacity = jQuery.isNumeric( value ) ? "alpha(opacity=" + value * 100 + ")" : "",
				filter = currentStyle && currentStyle.filter || style.filter || "";

			// IE has trouble with opacity if it does not have layout
			// Force it by setting the zoom level
			style.zoom = 1;

			// if setting opacity to 1, and no other filters exist -
			// attempt to remove filter attribute #6652
			// if value === "", then remove inline opacity #12685
			if ( ( value >= 1 || value === "" ) &&
					jQuery.trim( filter.replace( ralpha, "" ) ) === "" &&
					style.removeAttribute ) {

				// Setting style.filter to null, "" & " " still leave "filter:" in the cssText
				// if "filter:" is present at all, clearType is disabled, we want to avoid this
				// style.removeAttribute is IE Only, but so apparently is this code path...
				style.removeAttribute( "filter" );

				// if there is no filter style applied in a css rule
				// or unset inline opacity, we are done
				if ( value === "" || currentStyle && !currentStyle.filter ) {
					return;
				}
			}

			// otherwise, set new filter values
			style.filter = ralpha.test( filter ) ?
				filter.replace( ralpha, opacity ) :
				filter + " " + opacity;
		}
	};
}

jQuery.cssHooks.marginRight = addGetHookIf( support.reliableMarginRight,
	function( elem, computed ) {
		if ( computed ) {
			return swap( elem, { "display": "inline-block" },
				curCSS, [ elem, "marginRight" ] );
		}
	}
);

jQuery.cssHooks.marginLeft = addGetHookIf( support.reliableMarginLeft,
	function( elem, computed ) {
		if ( computed ) {
			return (
				parseFloat( curCSS( elem, "marginLeft" ) ) ||

				// Support: IE<=11+
				// Running getBoundingClientRect on a disconnected node in IE throws an error
				// Support: IE8 only
				// getClientRects() errors on disconnected elems
				( jQuery.contains( elem.ownerDocument, elem ) ?
					elem.getBoundingClientRect().left -
						swap( elem, { marginLeft: 0 }, function() {
							return elem.getBoundingClientRect().left;
						} ) :
					0
				)
			) + "px";
		}
	}
);

// These hooks are used by animate to expand properties
jQuery.each( {
	margin: "",
	padding: "",
	border: "Width"
}, function( prefix, suffix ) {
	jQuery.cssHooks[ prefix + suffix ] = {
		expand: function( value ) {
			var i = 0,
				expanded = {},

				// assumes a single number if not a string
				parts = typeof value === "string" ? value.split( " " ) : [ value ];

			for ( ; i < 4; i++ ) {
				expanded[ prefix + cssExpand[ i ] + suffix ] =
					parts[ i ] || parts[ i - 2 ] || parts[ 0 ];
			}

			return expanded;
		}
	};

	if ( !rmargin.test( prefix ) ) {
		jQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;
	}
} );

jQuery.fn.extend( {
	css: function( name, value ) {
		return access( this, function( elem, name, value ) {
			var styles, len,
				map = {},
				i = 0;

			if ( jQuery.isArray( name ) ) {
				styles = getStyles( elem );
				len = name.length;

				for ( ; i < len; i++ ) {
					map[ name[ i ] ] = jQuery.css( elem, name[ i ], false, styles );
				}

				return map;
			}

			return value !== undefined ?
				jQuery.style( elem, name, value ) :
				jQuery.css( elem, name );
		}, name, value, arguments.length > 1 );
	},
	show: function() {
		return showHide( this, true );
	},
	hide: function() {
		return showHide( this );
	},
	toggle: function( state ) {
		if ( typeof state === "boolean" ) {
			return state ? this.show() : this.hide();
		}

		return this.each( function() {
			if ( isHidden( this ) ) {
				jQuery( this ).show();
			} else {
				jQuery( this ).hide();
			}
		} );
	}
} );


function Tween( elem, options, prop, end, easing ) {
	return new Tween.prototype.init( elem, options, prop, end, easing );
}
jQuery.Tween = Tween;

Tween.prototype = {
	constructor: Tween,
	init: function( elem, options, prop, end, easing, unit ) {
		this.elem = elem;
		this.prop = prop;
		this.easing = easing || jQuery.easing._default;
		this.options = options;
		this.start = this.now = this.cur();
		this.end = end;
		this.unit = unit || ( jQuery.cssNumber[ prop ] ? "" : "px" );
	},
	cur: function() {
		var hooks = Tween.propHooks[ this.prop ];

		return hooks && hooks.get ?
			hooks.get( this ) :
			Tween.propHooks._default.get( this );
	},
	run: function( percent ) {
		var eased,
			hooks = Tween.propHooks[ this.prop ];

		if ( this.options.duration ) {
			this.pos = eased = jQuery.easing[ this.easing ](
				percent, this.options.duration * percent, 0, 1, this.options.duration
			);
		} else {
			this.pos = eased = percent;
		}
		this.now = ( this.end - this.start ) * eased + this.start;

		if ( this.options.step ) {
			this.options.step.call( this.elem, this.now, this );
		}

		if ( hooks && hooks.set ) {
			hooks.set( this );
		} else {
			Tween.propHooks._default.set( this );
		}
		return this;
	}
};

Tween.prototype.init.prototype = Tween.prototype;

Tween.propHooks = {
	_default: {
		get: function( tween ) {
			var result;

			// Use a property on the element directly when it is not a DOM element,
			// or when there is no matching style property that exists.
			if ( tween.elem.nodeType !== 1 ||
				tween.elem[ tween.prop ] != null && tween.elem.style[ tween.prop ] == null ) {
				return tween.elem[ tween.prop ];
			}

			// passing an empty string as a 3rd parameter to .css will automatically
			// attempt a parseFloat and fallback to a string if the parse fails
			// so, simple values such as "10px" are parsed to Float.
			// complex values such as "rotate(1rad)" are returned as is.
			result = jQuery.css( tween.elem, tween.prop, "" );

			// Empty strings, null, undefined and "auto" are converted to 0.
			return !result || result === "auto" ? 0 : result;
		},
		set: function( tween ) {

			// use step hook for back compat - use cssHook if its there - use .style if its
			// available and use plain properties where available
			if ( jQuery.fx.step[ tween.prop ] ) {
				jQuery.fx.step[ tween.prop ]( tween );
			} else if ( tween.elem.nodeType === 1 &&
				( tween.elem.style[ jQuery.cssProps[ tween.prop ] ] != null ||
					jQuery.cssHooks[ tween.prop ] ) ) {
				jQuery.style( tween.elem, tween.prop, tween.now + tween.unit );
			} else {
				tween.elem[ tween.prop ] = tween.now;
			}
		}
	}
};

// Support: IE <=9
// Panic based approach to setting things on disconnected nodes

Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
	set: function( tween ) {
		if ( tween.elem.nodeType && tween.elem.parentNode ) {
			tween.elem[ tween.prop ] = tween.now;
		}
	}
};

jQuery.easing = {
	linear: function( p ) {
		return p;
	},
	swing: function( p ) {
		return 0.5 - Math.cos( p * Math.PI ) / 2;
	},
	_default: "swing"
};

jQuery.fx = Tween.prototype.init;

// Back Compat <1.8 extension point
jQuery.fx.step = {};




var
	fxNow, timerId,
	rfxtypes = /^(?:toggle|show|hide)$/,
	rrun = /queueHooks$/;

// Animations created synchronously will run synchronously
function createFxNow() {
	window.setTimeout( function() {
		fxNow = undefined;
	} );
	return ( fxNow = jQuery.now() );
}

// Generate parameters to create a standard animation
function genFx( type, includeWidth ) {
	var which,
		attrs = { height: type },
		i = 0;

	// if we include width, step value is 1 to do all cssExpand values,
	// if we don't include width, step value is 2 to skip over Left and Right
	includeWidth = includeWidth ? 1 : 0;
	for ( ; i < 4 ; i += 2 - includeWidth ) {
		which = cssExpand[ i ];
		attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
	}

	if ( includeWidth ) {
		attrs.opacity = attrs.width = type;
	}

	return attrs;
}

function createTween( value, prop, animation ) {
	var tween,
		collection = ( Animation.tweeners[ prop ] || [] ).concat( Animation.tweeners[ "*" ] ),
		index = 0,
		length = collection.length;
	for ( ; index < length; index++ ) {
		if ( ( tween = collection[ index ].call( animation, prop, value ) ) ) {

			// we're done with this property
			return tween;
		}
	}
}

function defaultPrefilter( elem, props, opts ) {
	/* jshint validthis: true */
	var prop, value, toggle, tween, hooks, oldfire, display, checkDisplay,
		anim = this,
		orig = {},
		style = elem.style,
		hidden = elem.nodeType && isHidden( elem ),
		dataShow = jQuery._data( elem, "fxshow" );

	// handle queue: false promises
	if ( !opts.queue ) {
		hooks = jQuery._queueHooks( elem, "fx" );
		if ( hooks.unqueued == null ) {
			hooks.unqueued = 0;
			oldfire = hooks.empty.fire;
			hooks.empty.fire = function() {
				if ( !hooks.unqueued ) {
					oldfire();
				}
			};
		}
		hooks.unqueued++;

		anim.always( function() {

			// doing this makes sure that the complete handler will be called
			// before this completes
			anim.always( function() {
				hooks.unqueued--;
				if ( !jQuery.queue( elem, "fx" ).length ) {
					hooks.empty.fire();
				}
			} );
		} );
	}

	// height/width overflow pass
	if ( elem.nodeType === 1 && ( "height" in props || "width" in props ) ) {

		// Make sure that nothing sneaks out
		// Record all 3 overflow attributes because IE does not
		// change the overflow attribute when overflowX and
		// overflowY are set to the same value
		opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];

		// Set display property to inline-block for height/width
		// animations on inline elements that are having width/height animated
		display = jQuery.css( elem, "display" );

		// Test default display if display is currently "none"
		checkDisplay = display === "none" ?
			jQuery._data( elem, "olddisplay" ) || defaultDisplay( elem.nodeName ) : display;

		if ( checkDisplay === "inline" && jQuery.css( elem, "float" ) === "none" ) {

			// inline-level elements accept inline-block;
			// block-level elements need to be inline with layout
			if ( !support.inlineBlockNeedsLayout || defaultDisplay( elem.nodeName ) === "inline" ) {
				style.display = "inline-block";
			} else {
				style.zoom = 1;
			}
		}
	}

	if ( opts.overflow ) {
		style.overflow = "hidden";
		if ( !support.shrinkWrapBlocks() ) {
			anim.always( function() {
				style.overflow = opts.overflow[ 0 ];
				style.overflowX = opts.overflow[ 1 ];
				style.overflowY = opts.overflow[ 2 ];
			} );
		}
	}

	// show/hide pass
	for ( prop in props ) {
		value = props[ prop ];
		if ( rfxtypes.exec( value ) ) {
			delete props[ prop ];
			toggle = toggle || value === "toggle";
			if ( value === ( hidden ? "hide" : "show" ) ) {

				// If there is dataShow left over from a stopped hide or show
				// and we are going to proceed with show, we should pretend to be hidden
				if ( value === "show" && dataShow && dataShow[ prop ] !== undefined ) {
					hidden = true;
				} else {
					continue;
				}
			}
			orig[ prop ] = dataShow && dataShow[ prop ] || jQuery.style( elem, prop );

		// Any non-fx value stops us from restoring the original display value
		} else {
			display = undefined;
		}
	}

	if ( !jQuery.isEmptyObject( orig ) ) {
		if ( dataShow ) {
			if ( "hidden" in dataShow ) {
				hidden = dataShow.hidden;
			}
		} else {
			dataShow = jQuery._data( elem, "fxshow", {} );
		}

		// store state if its toggle - enables .stop().toggle() to "reverse"
		if ( toggle ) {
			dataShow.hidden = !hidden;
		}
		if ( hidden ) {
			jQuery( elem ).show();
		} else {
			anim.done( function() {
				jQuery( elem ).hide();
			} );
		}
		anim.done( function() {
			var prop;
			jQuery._removeData( elem, "fxshow" );
			for ( prop in orig ) {
				jQuery.style( elem, prop, orig[ prop ] );
			}
		} );
		for ( prop in orig ) {
			tween = createTween( hidden ? dataShow[ prop ] : 0, prop, anim );

			if ( !( prop in dataShow ) ) {
				dataShow[ prop ] = tween.start;
				if ( hidden ) {
					tween.end = tween.start;
					tween.start = prop === "width" || prop === "height" ? 1 : 0;
				}
			}
		}

	// If this is a noop like .hide().hide(), restore an overwritten display value
	} else if ( ( display === "none" ? defaultDisplay( elem.nodeName ) : display ) === "inline" ) {
		style.display = display;
	}
}

function propFilter( props, specialEasing ) {
	var index, name, easing, value, hooks;

	// camelCase, specialEasing and expand cssHook pass
	for ( index in props ) {
		name = jQuery.camelCase( index );
		easing = specialEasing[ name ];
		value = props[ index ];
		if ( jQuery.isArray( value ) ) {
			easing = value[ 1 ];
			value = props[ index ] = value[ 0 ];
		}

		if ( index !== name ) {
			props[ name ] = value;
			delete props[ index ];
		}

		hooks = jQuery.cssHooks[ name ];
		if ( hooks && "expand" in hooks ) {
			value = hooks.expand( value );
			delete props[ name ];

			// not quite $.extend, this wont overwrite keys already present.
			// also - reusing 'index' from above because we have the correct "name"
			for ( index in value ) {
				if ( !( index in props ) ) {
					props[ index ] = value[ index ];
					specialEasing[ index ] = easing;
				}
			}
		} else {
			specialEasing[ name ] = easing;
		}
	}
}

function Animation( elem, properties, options ) {
	var result,
		stopped,
		index = 0,
		length = Animation.prefilters.length,
		deferred = jQuery.Deferred().always( function() {

			// don't match elem in the :animated selector
			delete tick.elem;
		} ),
		tick = function() {
			if ( stopped ) {
				return false;
			}
			var currentTime = fxNow || createFxNow(),
				remaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),

				// Support: Android 2.3
				// Archaic crash bug won't allow us to use `1 - ( 0.5 || 0 )` (#12497)
				temp = remaining / animation.duration || 0,
				percent = 1 - temp,
				index = 0,
				length = animation.tweens.length;

			for ( ; index < length ; index++ ) {
				animation.tweens[ index ].run( percent );
			}

			deferred.notifyWith( elem, [ animation, percent, remaining ] );

			if ( percent < 1 && length ) {
				return remaining;
			} else {
				deferred.resolveWith( elem, [ animation ] );
				return false;
			}
		},
		animation = deferred.promise( {
			elem: elem,
			props: jQuery.extend( {}, properties ),
			opts: jQuery.extend( true, {
				specialEasing: {},
				easing: jQuery.easing._default
			}, options ),
			originalProperties: properties,
			originalOptions: options,
			startTime: fxNow || createFxNow(),
			duration: options.duration,
			tweens: [],
			createTween: function( prop, end ) {
				var tween = jQuery.Tween( elem, animation.opts, prop, end,
						animation.opts.specialEasing[ prop ] || animation.opts.easing );
				animation.tweens.push( tween );
				return tween;
			},
			stop: function( gotoEnd ) {
				var index = 0,

					// if we are going to the end, we want to run all the tweens
					// otherwise we skip this part
					length = gotoEnd ? animation.tweens.length : 0;
				if ( stopped ) {
					return this;
				}
				stopped = true;
				for ( ; index < length ; index++ ) {
					animation.tweens[ index ].run( 1 );
				}

				// resolve when we played the last frame
				// otherwise, reject
				if ( gotoEnd ) {
					deferred.notifyWith( elem, [ animation, 1, 0 ] );
					deferred.resolveWith( elem, [ animation, gotoEnd ] );
				} else {
					deferred.rejectWith( elem, [ animation, gotoEnd ] );
				}
				return this;
			}
		} ),
		props = animation.props;

	propFilter( props, animation.opts.specialEasing );

	for ( ; index < length ; index++ ) {
		result = Animation.prefilters[ index ].call( animation, elem, props, animation.opts );
		if ( result ) {
			if ( jQuery.isFunction( result.stop ) ) {
				jQuery._queueHooks( animation.elem, animation.opts.queue ).stop =
					jQuery.proxy( result.stop, result );
			}
			return result;
		}
	}

	jQuery.map( props, createTween, animation );

	if ( jQuery.isFunction( animation.opts.start ) ) {
		animation.opts.start.call( elem, animation );
	}

	jQuery.fx.timer(
		jQuery.extend( tick, {
			elem: elem,
			anim: animation,
			queue: animation.opts.queue
		} )
	);

	// attach callbacks from options
	return animation.progress( animation.opts.progress )
		.done( animation.opts.done, animation.opts.complete )
		.fail( animation.opts.fail )
		.always( animation.opts.always );
}

jQuery.Animation = jQuery.extend( Animation, {

	tweeners: {
		"*": [ function( prop, value ) {
			var tween = this.createTween( prop, value );
			adjustCSS( tween.elem, prop, rcssNum.exec( value ), tween );
			return tween;
		} ]
	},

	tweener: function( props, callback ) {
		if ( jQuery.isFunction( props ) ) {
			callback = props;
			props = [ "*" ];
		} else {
			props = props.match( rnotwhite );
		}

		var prop,
			index = 0,
			length = props.length;

		for ( ; index < length ; index++ ) {
			prop = props[ index ];
			Animation.tweeners[ prop ] = Animation.tweeners[ prop ] || [];
			Animation.tweeners[ prop ].unshift( callback );
		}
	},

	prefilters: [ defaultPrefilter ],

	prefilter: function( callback, prepend ) {
		if ( prepend ) {
			Animation.prefilters.unshift( callback );
		} else {
			Animation.prefilters.push( callback );
		}
	}
} );

jQuery.speed = function( speed, easing, fn ) {
	var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
		complete: fn || !fn && easing ||
			jQuery.isFunction( speed ) && speed,
		duration: speed,
		easing: fn && easing || easing && !jQuery.isFunction( easing ) && easing
	};

	opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration :
		opt.duration in jQuery.fx.speeds ?
			jQuery.fx.speeds[ opt.duration ] : jQuery.fx.speeds._default;

	// normalize opt.queue - true/undefined/null -> "fx"
	if ( opt.queue == null || opt.queue === true ) {
		opt.queue = "fx";
	}

	// Queueing
	opt.old = opt.complete;

	opt.complete = function() {
		if ( jQuery.isFunction( opt.old ) ) {
			opt.old.call( this );
		}

		if ( opt.queue ) {
			jQuery.dequeue( this, opt.queue );
		}
	};

	return opt;
};

jQuery.fn.extend( {
	fadeTo: function( speed, to, easing, callback ) {

		// show any hidden elements after setting opacity to 0
		return this.filter( isHidden ).css( "opacity", 0 ).show()

			// animate to the value specified
			.end().animate( { opacity: to }, speed, easing, callback );
	},
	animate: function( prop, speed, easing, callback ) {
		var empty = jQuery.isEmptyObject( prop ),
			optall = jQuery.speed( speed, easing, callback ),
			doAnimation = function() {

				// Operate on a copy of prop so per-property easing won't be lost
				var anim = Animation( this, jQuery.extend( {}, prop ), optall );

				// Empty animations, or finishing resolves immediately
				if ( empty || jQuery._data( this, "finish" ) ) {
					anim.stop( true );
				}
			};
			doAnimation.finish = doAnimation;

		return empty || optall.queue === false ?
			this.each( doAnimation ) :
			this.queue( optall.queue, doAnimation );
	},
	stop: function( type, clearQueue, gotoEnd ) {
		var stopQueue = function( hooks ) {
			var stop = hooks.stop;
			delete hooks.stop;
			stop( gotoEnd );
		};

		if ( typeof type !== "string" ) {
			gotoEnd = clearQueue;
			clearQueue = type;
			type = undefined;
		}
		if ( clearQueue && type !== false ) {
			this.queue( type || "fx", [] );
		}

		return this.each( function() {
			var dequeue = true,
				index = type != null && type + "queueHooks",
				timers = jQuery.timers,
				data = jQuery._data( this );

			if ( index ) {
				if ( data[ index ] && data[ index ].stop ) {
					stopQueue( data[ index ] );
				}
			} else {
				for ( index in data ) {
					if ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {
						stopQueue( data[ index ] );
					}
				}
			}

			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this &&
					( type == null || timers[ index ].queue === type ) ) {

					timers[ index ].anim.stop( gotoEnd );
					dequeue = false;
					timers.splice( index, 1 );
				}
			}

			// start the next in the queue if the last step wasn't forced
			// timers currently will call their complete callbacks, which will dequeue
			// but only if they were gotoEnd
			if ( dequeue || !gotoEnd ) {
				jQuery.dequeue( this, type );
			}
		} );
	},
	finish: function( type ) {
		if ( type !== false ) {
			type = type || "fx";
		}
		return this.each( function() {
			var index,
				data = jQuery._data( this ),
				queue = data[ type + "queue" ],
				hooks = data[ type + "queueHooks" ],
				timers = jQuery.timers,
				length = queue ? queue.length : 0;

			// enable finishing flag on private data
			data.finish = true;

			// empty the queue first
			jQuery.queue( this, type, [] );

			if ( hooks && hooks.stop ) {
				hooks.stop.call( this, true );
			}

			// look for any active animations, and finish them
			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && timers[ index ].queue === type ) {
					timers[ index ].anim.stop( true );
					timers.splice( index, 1 );
				}
			}

			// look for any animations in the old queue and finish them
			for ( index = 0; index < length; index++ ) {
				if ( queue[ index ] && queue[ index ].finish ) {
					queue[ index ].finish.call( this );
				}
			}

			// turn off finishing flag
			delete data.finish;
		} );
	}
} );

jQuery.each( [ "toggle", "show", "hide" ], function( i, name ) {
	var cssFn = jQuery.fn[ name ];
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return speed == null || typeof speed === "boolean" ?
			cssFn.apply( this, arguments ) :
			this.animate( genFx( name, true ), speed, easing, callback );
	};
} );

// Generate shortcuts for custom animations
jQuery.each( {
	slideDown: genFx( "show" ),
	slideUp: genFx( "hide" ),
	slideToggle: genFx( "toggle" ),
	fadeIn: { opacity: "show" },
	fadeOut: { opacity: "hide" },
	fadeToggle: { opacity: "toggle" }
}, function( name, props ) {
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return this.animate( props, speed, easing, callback );
	};
} );

jQuery.timers = [];
jQuery.fx.tick = function() {
	var timer,
		timers = jQuery.timers,
		i = 0;

	fxNow = jQuery.now();

	for ( ; i < timers.length; i++ ) {
		timer = timers[ i ];

		// Checks the timer has not already been removed
		if ( !timer() && timers[ i ] === timer ) {
			timers.splice( i--, 1 );
		}
	}

	if ( !timers.length ) {
		jQuery.fx.stop();
	}
	fxNow = undefined;
};

jQuery.fx.timer = function( timer ) {
	jQuery.timers.push( timer );
	if ( timer() ) {
		jQuery.fx.start();
	} else {
		jQuery.timers.pop();
	}
};

jQuery.fx.interval = 13;

jQuery.fx.start = function() {
	if ( !timerId ) {
		timerId = window.setInterval( jQuery.fx.tick, jQuery.fx.interval );
	}
};

jQuery.fx.stop = function() {
	window.clearInterval( timerId );
	timerId = null;
};

jQuery.fx.speeds = {
	slow: 600,
	fast: 200,

	// Default speed
	_default: 400
};


// Based off of the plugin by Clint Helfers, with permission.
// http://web.archive.org/web/20100324014747/http://blindsignals.com/index.php/2009/07/jquery-delay/
jQuery.fn.delay = function( time, type ) {
	time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
	type = type || "fx";

	return this.queue( type, function( next, hooks ) {
		var timeout = window.setTimeout( next, time );
		hooks.stop = function() {
			window.clearTimeout( timeout );
		};
	} );
};


( function() {
	var a,
		input = document.createElement( "input" ),
		div = document.createElement( "div" ),
		select = document.createElement( "select" ),
		opt = select.appendChild( document.createElement( "option" ) );

	// Setup
	div = document.createElement( "div" );
	div.setAttribute( "className", "t" );
	div.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>";
	a = div.getElementsByTagName( "a" )[ 0 ];

	// Support: Windows Web Apps (WWA)
	// `type` must use .setAttribute for WWA (#14901)
	input.setAttribute( "type", "checkbox" );
	div.appendChild( input );

	a = div.getElementsByTagName( "a" )[ 0 ];

	// First batch of tests.
	a.style.cssText = "top:1px";

	// Test setAttribute on camelCase class.
	// If it works, we need attrFixes when doing get/setAttribute (ie6/7)
	support.getSetAttribute = div.className !== "t";

	// Get the style information from getAttribute
	// (IE uses .cssText instead)
	support.style = /top/.test( a.getAttribute( "style" ) );

	// Make sure that URLs aren't manipulated
	// (IE normalizes it by default)
	support.hrefNormalized = a.getAttribute( "href" ) === "/a";

	// Check the default checkbox/radio value ("" on WebKit; "on" elsewhere)
	support.checkOn = !!input.value;

	// Make sure that a selected-by-default option has a working selected property.
	// (WebKit defaults to false instead of true, IE too, if it's in an optgroup)
	support.optSelected = opt.selected;

	// Tests for enctype support on a form (#6743)
	support.enctype = !!document.createElement( "form" ).enctype;

	// Make sure that the options inside disabled selects aren't marked as disabled
	// (WebKit marks them as disabled)
	select.disabled = true;
	support.optDisabled = !opt.disabled;

	// Support: IE8 only
	// Check if we can trust getAttribute("value")
	input = document.createElement( "input" );
	input.setAttribute( "value", "" );
	support.input = input.getAttribute( "value" ) === "";

	// Check if an input maintains its value after becoming a radio
	input.value = "t";
	input.setAttribute( "type", "radio" );
	support.radioValue = input.value === "t";
} )();


var rreturn = /\r/g,
	rspaces = /[\x20\t\r\n\f]+/g;

jQuery.fn.extend( {
	val: function( value ) {
		var hooks, ret, isFunction,
			elem = this[ 0 ];

		if ( !arguments.length ) {
			if ( elem ) {
				hooks = jQuery.valHooks[ elem.type ] ||
					jQuery.valHooks[ elem.nodeName.toLowerCase() ];

				if (
					hooks &&
					"get" in hooks &&
					( ret = hooks.get( elem, "value" ) ) !== undefined
				) {
					return ret;
				}

				ret = elem.value;

				return typeof ret === "string" ?

					// handle most common string cases
					ret.replace( rreturn, "" ) :

					// handle cases where value is null/undef or number
					ret == null ? "" : ret;
			}

			return;
		}

		isFunction = jQuery.isFunction( value );

		return this.each( function( i ) {
			var val;

			if ( this.nodeType !== 1 ) {
				return;
			}

			if ( isFunction ) {
				val = value.call( this, i, jQuery( this ).val() );
			} else {
				val = value;
			}

			// Treat null/undefined as ""; convert numbers to string
			if ( val == null ) {
				val = "";
			} else if ( typeof val === "number" ) {
				val += "";
			} else if ( jQuery.isArray( val ) ) {
				val = jQuery.map( val, function( value ) {
					return value == null ? "" : value + "";
				} );
			}

			hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];

			// If set returns undefined, fall back to normal setting
			if ( !hooks || !( "set" in hooks ) || hooks.set( this, val, "value" ) === undefined ) {
				this.value = val;
			}
		} );
	}
} );

jQuery.extend( {
	valHooks: {
		option: {
			get: function( elem ) {
				var val = jQuery.find.attr( elem, "value" );
				return val != null ?
					val :

					// Support: IE10-11+
					// option.text throws exceptions (#14686, #14858)
					// Strip and collapse whitespace
					// https://html.spec.whatwg.org/#strip-and-collapse-whitespace
					jQuery.trim( jQuery.text( elem ) ).replace( rspaces, " " );
			}
		},
		select: {
			get: function( elem ) {
				var value, option,
					options = elem.options,
					index = elem.selectedIndex,
					one = elem.type === "select-one" || index < 0,
					values = one ? null : [],
					max = one ? index + 1 : options.length,
					i = index < 0 ?
						max :
						one ? index : 0;

				// Loop through all the selected options
				for ( ; i < max; i++ ) {
					option = options[ i ];

					// oldIE doesn't update selected after form reset (#2551)
					if ( ( option.selected || i === index ) &&

							// Don't return options that are disabled or in a disabled optgroup
							( support.optDisabled ?
								!option.disabled :
								option.getAttribute( "disabled" ) === null ) &&
							( !option.parentNode.disabled ||
								!jQuery.nodeName( option.parentNode, "optgroup" ) ) ) {

						// Get the specific value for the option
						value = jQuery( option ).val();

						// We don't need an array for one selects
						if ( one ) {
							return value;
						}

						// Multi-Selects return an array
						values.push( value );
					}
				}

				return values;
			},

			set: function( elem, value ) {
				var optionSet, option,
					options = elem.options,
					values = jQuery.makeArray( value ),
					i = options.length;

				while ( i-- ) {
					option = options[ i ];

					if ( jQuery.inArray( jQuery.valHooks.option.get( option ), values ) > -1 ) {

						// Support: IE6
						// When new option element is added to select box we need to
						// force reflow of newly added node in order to workaround delay
						// of initialization properties
						try {
							option.selected = optionSet = true;

						} catch ( _ ) {

							// Will be executed only in IE6
							option.scrollHeight;
						}

					} else {
						option.selected = false;
					}
				}

				// Force browsers to behave consistently when non-matching value is set
				if ( !optionSet ) {
					elem.selectedIndex = -1;
				}

				return options;
			}
		}
	}
} );

// Radios and checkboxes getter/setter
jQuery.each( [ "radio", "checkbox" ], function() {
	jQuery.valHooks[ this ] = {
		set: function( elem, value ) {
			if ( jQuery.isArray( value ) ) {
				return ( elem.checked = jQuery.inArray( jQuery( elem ).val(), value ) > -1 );
			}
		}
	};
	if ( !support.checkOn ) {
		jQuery.valHooks[ this ].get = function( elem ) {
			return elem.getAttribute( "value" ) === null ? "on" : elem.value;
		};
	}
} );




var nodeHook, boolHook,
	attrHandle = jQuery.expr.attrHandle,
	ruseDefault = /^(?:checked|selected)$/i,
	getSetAttribute = support.getSetAttribute,
	getSetInput = support.input;

jQuery.fn.extend( {
	attr: function( name, value ) {
		return access( this, jQuery.attr, name, value, arguments.length > 1 );
	},

	removeAttr: function( name ) {
		return this.each( function() {
			jQuery.removeAttr( this, name );
		} );
	}
} );

jQuery.extend( {
	attr: function( elem, name, value ) {
		var ret, hooks,
			nType = elem.nodeType;

		// Don't get/set attributes on text, comment and attribute nodes
		if ( nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		// Fallback to prop when attributes are not supported
		if ( typeof elem.getAttribute === "undefined" ) {
			return jQuery.prop( elem, name, value );
		}

		// All attributes are lowercase
		// Grab necessary hook if one is defined
		if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {
			name = name.toLowerCase();
			hooks = jQuery.attrHooks[ name ] ||
				( jQuery.expr.match.bool.test( name ) ? boolHook : nodeHook );
		}

		if ( value !== undefined ) {
			if ( value === null ) {
				jQuery.removeAttr( elem, name );
				return;
			}

			if ( hooks && "set" in hooks &&
				( ret = hooks.set( elem, value, name ) ) !== undefined ) {
				return ret;
			}

			elem.setAttribute( name, value + "" );
			return value;
		}

		if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
			return ret;
		}

		ret = jQuery.find.attr( elem, name );

		// Non-existent attributes return null, we normalize to undefined
		return ret == null ? undefined : ret;
	},

	attrHooks: {
		type: {
			set: function( elem, value ) {
				if ( !support.radioValue && value === "radio" &&
					jQuery.nodeName( elem, "input" ) ) {

					// Setting the type on a radio button after the value resets the value in IE8-9
					// Reset value to default in case type is set after value during creation
					var val = elem.value;
					elem.setAttribute( "type", value );
					if ( val ) {
						elem.value = val;
					}
					return value;
				}
			}
		}
	},

	removeAttr: function( elem, value ) {
		var name, propName,
			i = 0,
			attrNames = value && value.match( rnotwhite );

		if ( attrNames && elem.nodeType === 1 ) {
			while ( ( name = attrNames[ i++ ] ) ) {
				propName = jQuery.propFix[ name ] || name;

				// Boolean attributes get special treatment (#10870)
				if ( jQuery.expr.match.bool.test( name ) ) {

					// Set corresponding property to false
					if ( getSetInput && getSetAttribute || !ruseDefault.test( name ) ) {
						elem[ propName ] = false;

					// Support: IE<9
					// Also clear defaultChecked/defaultSelected (if appropriate)
					} else {
						elem[ jQuery.camelCase( "default-" + name ) ] =
							elem[ propName ] = false;
					}

				// See #9699 for explanation of this approach (setting first, then removal)
				} else {
					jQuery.attr( elem, name, "" );
				}

				elem.removeAttribute( getSetAttribute ? name : propName );
			}
		}
	}
} );

// Hooks for boolean attributes
boolHook = {
	set: function( elem, value, name ) {
		if ( value === false ) {

			// Remove boolean attributes when set to false
			jQuery.removeAttr( elem, name );
		} else if ( getSetInput && getSetAttribute || !ruseDefault.test( name ) ) {

			// IE<8 needs the *property* name
			elem.setAttribute( !getSetAttribute && jQuery.propFix[ name ] || name, name );

		} else {

			// Support: IE<9
			// Use defaultChecked and defaultSelected for oldIE
			elem[ jQuery.camelCase( "default-" + name ) ] = elem[ name ] = true;
		}
		return name;
	}
};

jQuery.each( jQuery.expr.match.bool.source.match( /\w+/g ), function( i, name ) {
	var getter = attrHandle[ name ] || jQuery.find.attr;

	if ( getSetInput && getSetAttribute || !ruseDefault.test( name ) ) {
		attrHandle[ name ] = function( elem, name, isXML ) {
			var ret, handle;
			if ( !isXML ) {

				// Avoid an infinite loop by temporarily removing this function from the getter
				handle = attrHandle[ name ];
				attrHandle[ name ] = ret;
				ret = getter( elem, name, isXML ) != null ?
					name.toLowerCase() :
					null;
				attrHandle[ name ] = handle;
			}
			return ret;
		};
	} else {
		attrHandle[ name ] = function( elem, name, isXML ) {
			if ( !isXML ) {
				return elem[ jQuery.camelCase( "default-" + name ) ] ?
					name.toLowerCase() :
					null;
			}
		};
	}
} );

// fix oldIE attroperties
if ( !getSetInput || !getSetAttribute ) {
	jQuery.attrHooks.value = {
		set: function( elem, value, name ) {
			if ( jQuery.nodeName( elem, "input" ) ) {

				// Does not return so that setAttribute is also used
				elem.defaultValue = value;
			} else {

				// Use nodeHook if defined (#1954); otherwise setAttribute is fine
				return nodeHook && nodeHook.set( elem, value, name );
			}
		}
	};
}

// IE6/7 do not support getting/setting some attributes with get/setAttribute
if ( !getSetAttribute ) {

	// Use this for any attribute in IE6/7
	// This fixes almost every IE6/7 issue
	nodeHook = {
		set: function( elem, value, name ) {

			// Set the existing or create a new attribute node
			var ret = elem.getAttributeNode( name );
			if ( !ret ) {
				elem.setAttributeNode(
					( ret = elem.ownerDocument.createAttribute( name ) )
				);
			}

			ret.value = value += "";

			// Break association with cloned elements by also using setAttribute (#9646)
			if ( name === "value" || value === elem.getAttribute( name ) ) {
				return value;
			}
		}
	};

	// Some attributes are constructed with empty-string values when not defined
	attrHandle.id = attrHandle.name = attrHandle.coords =
		function( elem, name, isXML ) {
			var ret;
			if ( !isXML ) {
				return ( ret = elem.getAttributeNode( name ) ) && ret.value !== "" ?
					ret.value :
					null;
			}
		};

	// Fixing value retrieval on a button requires this module
	jQuery.valHooks.button = {
		get: function( elem, name ) {
			var ret = elem.getAttributeNode( name );
			if ( ret && ret.specified ) {
				return ret.value;
			}
		},
		set: nodeHook.set
	};

	// Set contenteditable to false on removals(#10429)
	// Setting to empty string throws an error as an invalid value
	jQuery.attrHooks.contenteditable = {
		set: function( elem, value, name ) {
			nodeHook.set( elem, value === "" ? false : value, name );
		}
	};

	// Set width and height to auto instead of 0 on empty string( Bug #8150 )
	// This is for removals
	jQuery.each( [ "width", "height" ], function( i, name ) {
		jQuery.attrHooks[ name ] = {
			set: function( elem, value ) {
				if ( value === "" ) {
					elem.setAttribute( name, "auto" );
					return value;
				}
			}
		};
	} );
}

if ( !support.style ) {
	jQuery.attrHooks.style = {
		get: function( elem ) {

			// Return undefined in the case of empty string
			// Note: IE uppercases css property names, but if we were to .toLowerCase()
			// .cssText, that would destroy case sensitivity in URL's, like in "background"
			return elem.style.cssText || undefined;
		},
		set: function( elem, value ) {
			return ( elem.style.cssText = value + "" );
		}
	};
}




var rfocusable = /^(?:input|select|textarea|button|object)$/i,
	rclickable = /^(?:a|area)$/i;

jQuery.fn.extend( {
	prop: function( name, value ) {
		return access( this, jQuery.prop, name, value, arguments.length > 1 );
	},

	removeProp: function( name ) {
		name = jQuery.propFix[ name ] || name;
		return this.each( function() {

			// try/catch handles cases where IE balks (such as removing a property on window)
			try {
				this[ name ] = undefined;
				delete this[ name ];
			} catch ( e ) {}
		} );
	}
} );

jQuery.extend( {
	prop: function( elem, name, value ) {
		var ret, hooks,
			nType = elem.nodeType;

		// Don't get/set properties on text, comment and attribute nodes
		if ( nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {

			// Fix name and attach hooks
			name = jQuery.propFix[ name ] || name;
			hooks = jQuery.propHooks[ name ];
		}

		if ( value !== undefined ) {
			if ( hooks && "set" in hooks &&
				( ret = hooks.set( elem, value, name ) ) !== undefined ) {
				return ret;
			}

			return ( elem[ name ] = value );
		}

		if ( hooks && "get" in hooks && ( ret = hooks.get( elem, name ) ) !== null ) {
			return ret;
		}

		return elem[ name ];
	},

	propHooks: {
		tabIndex: {
			get: function( elem ) {

				// elem.tabIndex doesn't always return the
				// correct value when it hasn't been explicitly set
				// http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
				// Use proper attribute retrieval(#12072)
				var tabindex = jQuery.find.attr( elem, "tabindex" );

				return tabindex ?
					parseInt( tabindex, 10 ) :
					rfocusable.test( elem.nodeName ) ||
						rclickable.test( elem.nodeName ) && elem.href ?
							0 :
							-1;
			}
		}
	},

	propFix: {
		"for": "htmlFor",
		"class": "className"
	}
} );

// Some attributes require a special call on IE
// http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
if ( !support.hrefNormalized ) {

	// href/src property should get the full normalized URL (#10299/#12915)
	jQuery.each( [ "href", "src" ], function( i, name ) {
		jQuery.propHooks[ name ] = {
			get: function( elem ) {
				return elem.getAttribute( name, 4 );
			}
		};
	} );
}

// Support: Safari, IE9+
// Accessing the selectedIndex property
// forces the browser to respect setting selected
// on the option
// The getter ensures a default option is selected
// when in an optgroup
if ( !support.optSelected ) {
	jQuery.propHooks.selected = {
		get: function( elem ) {
			var parent = elem.parentNode;

			if ( parent ) {
				parent.selectedIndex;

				// Make sure that it also works with optgroups, see #5701
				if ( parent.parentNode ) {
					parent.parentNode.selectedIndex;
				}
			}
			return null;
		},
		set: function( elem ) {
			var parent = elem.parentNode;
			if ( parent ) {
				parent.selectedIndex;

				if ( parent.parentNode ) {
					parent.parentNode.selectedIndex;
				}
			}
		}
	};
}

jQuery.each( [
	"tabIndex",
	"readOnly",
	"maxLength",
	"cellSpacing",
	"cellPadding",
	"rowSpan",
	"colSpan",
	"useMap",
	"frameBorder",
	"contentEditable"
], function() {
	jQuery.propFix[ this.toLowerCase() ] = this;
} );

// IE6/7 call enctype encoding
if ( !support.enctype ) {
	jQuery.propFix.enctype = "encoding";
}




var rclass = /[\t\r\n\f]/g;

function getClass( elem ) {
	return jQuery.attr( elem, "class" ) || "";
}

jQuery.fn.extend( {
	addClass: function( value ) {
		var classes, elem, cur, curValue, clazz, j, finalValue,
			i = 0;

		if ( jQuery.isFunction( value ) ) {
			return this.each( function( j ) {
				jQuery( this ).addClass( value.call( this, j, getClass( this ) ) );
			} );
		}

		if ( typeof value === "string" && value ) {
			classes = value.match( rnotwhite ) || [];

			while ( ( elem = this[ i++ ] ) ) {
				curValue = getClass( elem );
				cur = elem.nodeType === 1 &&
					( " " + curValue + " " ).replace( rclass, " " );

				if ( cur ) {
					j = 0;
					while ( ( clazz = classes[ j++ ] ) ) {
						if ( cur.indexOf( " " + clazz + " " ) < 0 ) {
							cur += clazz + " ";
						}
					}

					// only assign if different to avoid unneeded rendering.
					finalValue = jQuery.trim( cur );
					if ( curValue !== finalValue ) {
						jQuery.attr( elem, "class", finalValue );
					}
				}
			}
		}

		return this;
	},

	removeClass: function( value ) {
		var classes, elem, cur, curValue, clazz, j, finalValue,
			i = 0;

		if ( jQuery.isFunction( value ) ) {
			return this.each( function( j ) {
				jQuery( this ).removeClass( value.call( this, j, getClass( this ) ) );
			} );
		}

		if ( !arguments.length ) {
			return this.attr( "class", "" );
		}

		if ( typeof value === "string" && value ) {
			classes = value.match( rnotwhite ) || [];

			while ( ( elem = this[ i++ ] ) ) {
				curValue = getClass( elem );

				// This expression is here for better compressibility (see addClass)
				cur = elem.nodeType === 1 &&
					( " " + curValue + " " ).replace( rclass, " " );

				if ( cur ) {
					j = 0;
					while ( ( clazz = classes[ j++ ] ) ) {

						// Remove *all* instances
						while ( cur.indexOf( " " + clazz + " " ) > -1 ) {
							cur = cur.replace( " " + clazz + " ", " " );
						}
					}

					// Only assign if different to avoid unneeded rendering.
					finalValue = jQuery.trim( cur );
					if ( curValue !== finalValue ) {
						jQuery.attr( elem, "class", finalValue );
					}
				}
			}
		}

		return this;
	},

	toggleClass: function( value, stateVal ) {
		var type = typeof value;

		if ( typeof stateVal === "boolean" && type === "string" ) {
			return stateVal ? this.addClass( value ) : this.removeClass( value );
		}

		if ( jQuery.isFunction( value ) ) {
			return this.each( function( i ) {
				jQuery( this ).toggleClass(
					value.call( this, i, getClass( this ), stateVal ),
					stateVal
				);
			} );
		}

		return this.each( function() {
			var className, i, self, classNames;

			if ( type === "string" ) {

				// Toggle individual class names
				i = 0;
				self = jQuery( this );
				classNames = value.match( rnotwhite ) || [];

				while ( ( className = classNames[ i++ ] ) ) {

					// Check each className given, space separated list
					if ( self.hasClass( className ) ) {
						self.removeClass( className );
					} else {
						self.addClass( className );
					}
				}

			// Toggle whole class name
			} else if ( value === undefined || type === "boolean" ) {
				className = getClass( this );
				if ( className ) {

					// store className if set
					jQuery._data( this, "__className__", className );
				}

				// If the element has a class name or if we're passed "false",
				// then remove the whole classname (if there was one, the above saved it).
				// Otherwise bring back whatever was previously saved (if anything),
				// falling back to the empty string if nothing was stored.
				jQuery.attr( this, "class",
					className || value === false ?
					"" :
					jQuery._data( this, "__className__" ) || ""
				);
			}
		} );
	},

	hasClass: function( selector ) {
		var className, elem,
			i = 0;

		className = " " + selector + " ";
		while ( ( elem = this[ i++ ] ) ) {
			if ( elem.nodeType === 1 &&
				( " " + getClass( elem ) + " " ).replace( rclass, " " )
					.indexOf( className ) > -1
			) {
				return true;
			}
		}

		return false;
	}
} );




// Return jQuery for attributes-only inclusion


jQuery.each( ( "blur focus focusin focusout load resize scroll unload click dblclick " +
	"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
	"change select submit keydown keypress keyup error contextmenu" ).split( " " ),
	function( i, name ) {

	// Handle event binding
	jQuery.fn[ name ] = function( data, fn ) {
		return arguments.length > 0 ?
			this.on( name, null, data, fn ) :
			this.trigger( name );
	};
} );

jQuery.fn.extend( {
	hover: function( fnOver, fnOut ) {
		return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
	}
} );


var location = window.location;

var nonce = jQuery.now();

var rquery = ( /\?/ );



var rvalidtokens = /(,)|(\[|{)|(}|])|"(?:[^"\\\r\n]|\\["\\\/bfnrt]|\\u[\da-fA-F]{4})*"\s*:?|true|false|null|-?(?!0\d)\d+(?:\.\d+|)(?:[eE][+-]?\d+|)/g;

jQuery.parseJSON = function( data ) {

	// Attempt to parse using the native JSON parser first
	if ( window.JSON && window.JSON.parse ) {

		// Support: Android 2.3
		// Workaround failure to string-cast null input
		return window.JSON.parse( data + "" );
	}

	var requireNonComma,
		depth = null,
		str = jQuery.trim( data + "" );

	// Guard against invalid (and possibly dangerous) input by ensuring that nothing remains
	// after removing valid tokens
	return str && !jQuery.trim( str.replace( rvalidtokens, function( token, comma, open, close ) {

		// Force termination if we see a misplaced comma
		if ( requireNonComma && comma ) {
			depth = 0;
		}

		// Perform no more replacements after returning to outermost depth
		if ( depth === 0 ) {
			return token;
		}

		// Commas must not follow "[", "{", or ","
		requireNonComma = open || comma;

		// Determine new depth
		// array/object open ("[" or "{"): depth += true - false (increment)
		// array/object close ("]" or "}"): depth += false - true (decrement)
		// other cases ("," or primitive): depth += true - true (numeric cast)
		depth += !close - !open;

		// Remove this token
		return "";
	} ) ) ?
		( Function( "return " + str ) )() :
		jQuery.error( "Invalid JSON: " + data );
};


// Cross-browser xml parsing
jQuery.parseXML = function( data ) {
	var xml, tmp;
	if ( !data || typeof data !== "string" ) {
		return null;
	}
	try {
		if ( window.DOMParser ) { // Standard
			tmp = new window.DOMParser();
			xml = tmp.parseFromString( data, "text/xml" );
		} else { // IE
			xml = new window.ActiveXObject( "Microsoft.XMLDOM" );
			xml.async = "false";
			xml.loadXML( data );
		}
	} catch ( e ) {
		xml = undefined;
	}
	if ( !xml || !xml.documentElement || xml.getElementsByTagName( "parsererror" ).length ) {
		jQuery.error( "Invalid XML: " + data );
	}
	return xml;
};


var
	rhash = /#.*$/,
	rts = /([?&])_=[^&]*/,

	// IE leaves an \r character at EOL
	rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg,

	// #7653, #8125, #8152: local protocol detection
	rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
	rnoContent = /^(?:GET|HEAD)$/,
	rprotocol = /^\/\//,
	rurl = /^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/,

	/* Prefilters
	 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
	 * 2) These are called:
	 *    - BEFORE asking for a transport
	 *    - AFTER param serialization (s.data is a string if s.processData is true)
	 * 3) key is the dataType
	 * 4) the catchall symbol "*" can be used
	 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
	 */
	prefilters = {},

	/* Transports bindings
	 * 1) key is the dataType
	 * 2) the catchall symbol "*" can be used
	 * 3) selection will start with transport dataType and THEN go to "*" if needed
	 */
	transports = {},

	// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
	allTypes = "*/".concat( "*" ),

	// Document location
	ajaxLocation = location.href,

	// Segment location into parts
	ajaxLocParts = rurl.exec( ajaxLocation.toLowerCase() ) || [];

// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
function addToPrefiltersOrTransports( structure ) {

	// dataTypeExpression is optional and defaults to "*"
	return function( dataTypeExpression, func ) {

		if ( typeof dataTypeExpression !== "string" ) {
			func = dataTypeExpression;
			dataTypeExpression = "*";
		}

		var dataType,
			i = 0,
			dataTypes = dataTypeExpression.toLowerCase().match( rnotwhite ) || [];

		if ( jQuery.isFunction( func ) ) {

			// For each dataType in the dataTypeExpression
			while ( ( dataType = dataTypes[ i++ ] ) ) {

				// Prepend if requested
				if ( dataType.charAt( 0 ) === "+" ) {
					dataType = dataType.slice( 1 ) || "*";
					( structure[ dataType ] = structure[ dataType ] || [] ).unshift( func );

				// Otherwise append
				} else {
					( structure[ dataType ] = structure[ dataType ] || [] ).push( func );
				}
			}
		}
	};
}

// Base inspection function for prefilters and transports
function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR ) {

	var inspected = {},
		seekingTransport = ( structure === transports );

	function inspect( dataType ) {
		var selected;
		inspected[ dataType ] = true;
		jQuery.each( structure[ dataType ] || [], function( _, prefilterOrFactory ) {
			var dataTypeOrTransport = prefilterOrFactory( options, originalOptions, jqXHR );
			if ( typeof dataTypeOrTransport === "string" &&
				!seekingTransport && !inspected[ dataTypeOrTransport ] ) {

				options.dataTypes.unshift( dataTypeOrTransport );
				inspect( dataTypeOrTransport );
				return false;
			} else if ( seekingTransport ) {
				return !( selected = dataTypeOrTransport );
			}
		} );
		return selected;
	}

	return inspect( options.dataTypes[ 0 ] ) || !inspected[ "*" ] && inspect( "*" );
}

// A special extend for ajax options
// that takes "flat" options (not to be deep extended)
// Fixes #9887
function ajaxExtend( target, src ) {
	var deep, key,
		flatOptions = jQuery.ajaxSettings.flatOptions || {};

	for ( key in src ) {
		if ( src[ key ] !== undefined ) {
			( flatOptions[ key ] ? target : ( deep || ( deep = {} ) ) )[ key ] = src[ key ];
		}
	}
	if ( deep ) {
		jQuery.extend( true, target, deep );
	}

	return target;
}

/* Handles responses to an ajax request:
 * - finds the right dataType (mediates between content-type and expected dataType)
 * - returns the corresponding response
 */
function ajaxHandleResponses( s, jqXHR, responses ) {
	var firstDataType, ct, finalDataType, type,
		contents = s.contents,
		dataTypes = s.dataTypes;

	// Remove auto dataType and get content-type in the process
	while ( dataTypes[ 0 ] === "*" ) {
		dataTypes.shift();
		if ( ct === undefined ) {
			ct = s.mimeType || jqXHR.getResponseHeader( "Content-Type" );
		}
	}

	// Check if we're dealing with a known content-type
	if ( ct ) {
		for ( type in contents ) {
			if ( contents[ type ] && contents[ type ].test( ct ) ) {
				dataTypes.unshift( type );
				break;
			}
		}
	}

	// Check to see if we have a response for the expected dataType
	if ( dataTypes[ 0 ] in responses ) {
		finalDataType = dataTypes[ 0 ];
	} else {

		// Try convertible dataTypes
		for ( type in responses ) {
			if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[ 0 ] ] ) {
				finalDataType = type;
				break;
			}
			if ( !firstDataType ) {
				firstDataType = type;
			}
		}

		// Or just use first one
		finalDataType = finalDataType || firstDataType;
	}

	// If we found a dataType
	// We add the dataType to the list if needed
	// and return the corresponding response
	if ( finalDataType ) {
		if ( finalDataType !== dataTypes[ 0 ] ) {
			dataTypes.unshift( finalDataType );
		}
		return responses[ finalDataType ];
	}
}

/* Chain conversions given the request and the original response
 * Also sets the responseXXX fields on the jqXHR instance
 */
function ajaxConvert( s, response, jqXHR, isSuccess ) {
	var conv2, current, conv, tmp, prev,
		converters = {},

		// Work with a copy of dataTypes in case we need to modify it for conversion
		dataTypes = s.dataTypes.slice();

	// Create converters map with lowercased keys
	if ( dataTypes[ 1 ] ) {
		for ( conv in s.converters ) {
			converters[ conv.toLowerCase() ] = s.converters[ conv ];
		}
	}

	current = dataTypes.shift();

	// Convert to each sequential dataType
	while ( current ) {

		if ( s.responseFields[ current ] ) {
			jqXHR[ s.responseFields[ current ] ] = response;
		}

		// Apply the dataFilter if provided
		if ( !prev && isSuccess && s.dataFilter ) {
			response = s.dataFilter( response, s.dataType );
		}

		prev = current;
		current = dataTypes.shift();

		if ( current ) {

			// There's only work to do if current dataType is non-auto
			if ( current === "*" ) {

				current = prev;

			// Convert response if prev dataType is non-auto and differs from current
			} else if ( prev !== "*" && prev !== current ) {

				// Seek a direct converter
				conv = converters[ prev + " " + current ] || converters[ "* " + current ];

				// If none found, seek a pair
				if ( !conv ) {
					for ( conv2 in converters ) {

						// If conv2 outputs current
						tmp = conv2.split( " " );
						if ( tmp[ 1 ] === current ) {

							// If prev can be converted to accepted input
							conv = converters[ prev + " " + tmp[ 0 ] ] ||
								converters[ "* " + tmp[ 0 ] ];
							if ( conv ) {

								// Condense equivalence converters
								if ( conv === true ) {
									conv = converters[ conv2 ];

								// Otherwise, insert the intermediate dataType
								} else if ( converters[ conv2 ] !== true ) {
									current = tmp[ 0 ];
									dataTypes.unshift( tmp[ 1 ] );
								}
								break;
							}
						}
					}
				}

				// Apply converter (if not an equivalence)
				if ( conv !== true ) {

					// Unless errors are allowed to bubble, catch and return them
					if ( conv && s[ "throws" ] ) { // jscs:ignore requireDotNotation
						response = conv( response );
					} else {
						try {
							response = conv( response );
						} catch ( e ) {
							return {
								state: "parsererror",
								error: conv ? e : "No conversion from " + prev + " to " + current
							};
						}
					}
				}
			}
		}
	}

	return { state: "success", data: response };
}

jQuery.extend( {

	// Counter for holding the number of active queries
	active: 0,

	// Last-Modified header cache for next request
	lastModified: {},
	etag: {},

	ajaxSettings: {
		url: ajaxLocation,
		type: "GET",
		isLocal: rlocalProtocol.test( ajaxLocParts[ 1 ] ),
		global: true,
		processData: true,
		async: true,
		contentType: "application/x-www-form-urlencoded; charset=UTF-8",
		/*
		timeout: 0,
		data: null,
		dataType: null,
		username: null,
		password: null,
		cache: null,
		throws: false,
		traditional: false,
		headers: {},
		*/

		accepts: {
			"*": allTypes,
			text: "text/plain",
			html: "text/html",
			xml: "application/xml, text/xml",
			json: "application/json, text/javascript"
		},

		contents: {
			xml: /\bxml\b/,
			html: /\bhtml/,
			json: /\bjson\b/
		},

		responseFields: {
			xml: "responseXML",
			text: "responseText",
			json: "responseJSON"
		},

		// Data converters
		// Keys separate source (or catchall "*") and destination types with a single space
		converters: {

			// Convert anything to text
			"* text": String,

			// Text to html (true = no transformation)
			"text html": true,

			// Evaluate text as a json expression
			"text json": jQuery.parseJSON,

			// Parse text as xml
			"text xml": jQuery.parseXML
		},

		// For options that shouldn't be deep extended:
		// you can add your own custom options here if
		// and when you create one that shouldn't be
		// deep extended (see ajaxExtend)
		flatOptions: {
			url: true,
			context: true
		}
	},

	// Creates a full fledged settings object into target
	// with both ajaxSettings and settings fields.
	// If target is omitted, writes into ajaxSettings.
	ajaxSetup: function( target, settings ) {
		return settings ?

			// Building a settings object
			ajaxExtend( ajaxExtend( target, jQuery.ajaxSettings ), settings ) :

			// Extending ajaxSettings
			ajaxExtend( jQuery.ajaxSettings, target );
	},

	ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
	ajaxTransport: addToPrefiltersOrTransports( transports ),

	// Main method
	ajax: function( url, options ) {

		// If url is an object, simulate pre-1.5 signature
		if ( typeof url === "object" ) {
			options = url;
			url = undefined;
		}

		// Force options to be an object
		options = options || {};

		var

			// Cross-domain detection vars
			parts,

			// Loop variable
			i,

			// URL without anti-cache param
			cacheURL,

			// Response headers as string
			responseHeadersString,

			// timeout handle
			timeoutTimer,

			// To know if global events are to be dispatched
			fireGlobals,

			transport,

			// Response headers
			responseHeaders,

			// Create the final options object
			s = jQuery.ajaxSetup( {}, options ),

			// Callbacks context
			callbackContext = s.context || s,

			// Context for global events is callbackContext if it is a DOM node or jQuery collection
			globalEventContext = s.context &&
				( callbackContext.nodeType || callbackContext.jquery ) ?
					jQuery( callbackContext ) :
					jQuery.event,

			// Deferreds
			deferred = jQuery.Deferred(),
			completeDeferred = jQuery.Callbacks( "once memory" ),

			// Status-dependent callbacks
			statusCode = s.statusCode || {},

			// Headers (they are sent all at once)
			requestHeaders = {},
			requestHeadersNames = {},

			// The jqXHR state
			state = 0,

			// Default abort message
			strAbort = "canceled",

			// Fake xhr
			jqXHR = {
				readyState: 0,

				// Builds headers hashtable if needed
				getResponseHeader: function( key ) {
					var match;
					if ( state === 2 ) {
						if ( !responseHeaders ) {
							responseHeaders = {};
							while ( ( match = rheaders.exec( responseHeadersString ) ) ) {
								responseHeaders[ match[ 1 ].toLowerCase() ] = match[ 2 ];
							}
						}
						match = responseHeaders[ key.toLowerCase() ];
					}
					return match == null ? null : match;
				},

				// Raw string
				getAllResponseHeaders: function() {
					return state === 2 ? responseHeadersString : null;
				},

				// Caches the header
				setRequestHeader: function( name, value ) {
					var lname = name.toLowerCase();
					if ( !state ) {
						name = requestHeadersNames[ lname ] = requestHeadersNames[ lname ] || name;
						requestHeaders[ name ] = value;
					}
					return this;
				},

				// Overrides response content-type header
				overrideMimeType: function( type ) {
					if ( !state ) {
						s.mimeType = type;
					}
					return this;
				},

				// Status-dependent callbacks
				statusCode: function( map ) {
					var code;
					if ( map ) {
						if ( state < 2 ) {
							for ( code in map ) {

								// Lazy-add the new callback in a way that preserves old ones
								statusCode[ code ] = [ statusCode[ code ], map[ code ] ];
							}
						} else {

							// Execute the appropriate callbacks
							jqXHR.always( map[ jqXHR.status ] );
						}
					}
					return this;
				},

				// Cancel the request
				abort: function( statusText ) {
					var finalText = statusText || strAbort;
					if ( transport ) {
						transport.abort( finalText );
					}
					done( 0, finalText );
					return this;
				}
			};

		// Attach deferreds
		deferred.promise( jqXHR ).complete = completeDeferred.add;
		jqXHR.success = jqXHR.done;
		jqXHR.error = jqXHR.fail;

		// Remove hash character (#7531: and string promotion)
		// Add protocol if not provided (#5866: IE7 issue with protocol-less urls)
		// Handle falsy url in the settings object (#10093: consistency with old signature)
		// We also use the url parameter if available
		s.url = ( ( url || s.url || ajaxLocation ) + "" )
			.replace( rhash, "" )
			.replace( rprotocol, ajaxLocParts[ 1 ] + "//" );

		// Alias method option to type as per ticket #12004
		s.type = options.method || options.type || s.method || s.type;

		// Extract dataTypes list
		s.dataTypes = jQuery.trim( s.dataType || "*" ).toLowerCase().match( rnotwhite ) || [ "" ];

		// A cross-domain request is in order when we have a protocol:host:port mismatch
		if ( s.crossDomain == null ) {
			parts = rurl.exec( s.url.toLowerCase() );
			s.crossDomain = !!( parts &&
				( parts[ 1 ] !== ajaxLocParts[ 1 ] || parts[ 2 ] !== ajaxLocParts[ 2 ] ||
					( parts[ 3 ] || ( parts[ 1 ] === "http:" ? "80" : "443" ) ) !==
						( ajaxLocParts[ 3 ] || ( ajaxLocParts[ 1 ] === "http:" ? "80" : "443" ) ) )
			);
		}

		// Convert data if not already a string
		if ( s.data && s.processData && typeof s.data !== "string" ) {
			s.data = jQuery.param( s.data, s.traditional );
		}

		// Apply prefilters
		inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

		// If request was aborted inside a prefilter, stop there
		if ( state === 2 ) {
			return jqXHR;
		}

		// We can fire global events as of now if asked to
		// Don't fire events if jQuery.event is undefined in an AMD-usage scenario (#15118)
		fireGlobals = jQuery.event && s.global;

		// Watch for a new set of requests
		if ( fireGlobals && jQuery.active++ === 0 ) {
			jQuery.event.trigger( "ajaxStart" );
		}

		// Uppercase the type
		s.type = s.type.toUpperCase();

		// Determine if request has content
		s.hasContent = !rnoContent.test( s.type );

		// Save the URL in case we're toying with the If-Modified-Since
		// and/or If-None-Match header later on
		cacheURL = s.url;

		// More options handling for requests with no content
		if ( !s.hasContent ) {

			// If data is available, append data to url
			if ( s.data ) {
				cacheURL = ( s.url += ( rquery.test( cacheURL ) ? "&" : "?" ) + s.data );

				// #9682: remove data so that it's not used in an eventual retry
				delete s.data;
			}

			// Add anti-cache in url if needed
			if ( s.cache === false ) {
				s.url = rts.test( cacheURL ) ?

					// If there is already a '_' parameter, set its value
					cacheURL.replace( rts, "$1_=" + nonce++ ) :

					// Otherwise add one to the end
					cacheURL + ( rquery.test( cacheURL ) ? "&" : "?" ) + "_=" + nonce++;
			}
		}

		// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
		if ( s.ifModified ) {
			if ( jQuery.lastModified[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ cacheURL ] );
			}
			if ( jQuery.etag[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ cacheURL ] );
			}
		}

		// Set the correct header, if data is being sent
		if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
			jqXHR.setRequestHeader( "Content-Type", s.contentType );
		}

		// Set the Accepts header for the server, depending on the dataType
		jqXHR.setRequestHeader(
			"Accept",
			s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[ 0 ] ] ?
				s.accepts[ s.dataTypes[ 0 ] ] +
					( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
				s.accepts[ "*" ]
		);

		// Check for headers option
		for ( i in s.headers ) {
			jqXHR.setRequestHeader( i, s.headers[ i ] );
		}

		// Allow custom headers/mimetypes and early abort
		if ( s.beforeSend &&
			( s.beforeSend.call( callbackContext, jqXHR, s ) === false || state === 2 ) ) {

			// Abort if not done already and return
			return jqXHR.abort();
		}

		// aborting is no longer a cancellation
		strAbort = "abort";

		// Install callbacks on deferreds
		for ( i in { success: 1, error: 1, complete: 1 } ) {
			jqXHR[ i ]( s[ i ] );
		}

		// Get transport
		transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

		// If no transport, we auto-abort
		if ( !transport ) {
			done( -1, "No Transport" );
		} else {
			jqXHR.readyState = 1;

			// Send global event
			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
			}

			// If request was aborted inside ajaxSend, stop there
			if ( state === 2 ) {
				return jqXHR;
			}

			// Timeout
			if ( s.async && s.timeout > 0 ) {
				timeoutTimer = window.setTimeout( function() {
					jqXHR.abort( "timeout" );
				}, s.timeout );
			}

			try {
				state = 1;
				transport.send( requestHeaders, done );
			} catch ( e ) {

				// Propagate exception as error if not done
				if ( state < 2 ) {
					done( -1, e );

				// Simply rethrow otherwise
				} else {
					throw e;
				}
			}
		}

		// Callback for when everything is done
		function done( status, nativeStatusText, responses, headers ) {
			var isSuccess, success, error, response, modified,
				statusText = nativeStatusText;

			// Called once
			if ( state === 2 ) {
				return;
			}

			// State is "done" now
			state = 2;

			// Clear timeout if it exists
			if ( timeoutTimer ) {
				window.clearTimeout( timeoutTimer );
			}

			// Dereference transport for early garbage collection
			// (no matter how long the jqXHR object will be used)
			transport = undefined;

			// Cache response headers
			responseHeadersString = headers || "";

			// Set readyState
			jqXHR.readyState = status > 0 ? 4 : 0;

			// Determine if successful
			isSuccess = status >= 200 && status < 300 || status === 304;

			// Get response data
			if ( responses ) {
				response = ajaxHandleResponses( s, jqXHR, responses );
			}

			// Convert no matter what (that way responseXXX fields are always set)
			response = ajaxConvert( s, response, jqXHR, isSuccess );

			// If successful, handle type chaining
			if ( isSuccess ) {

				// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
				if ( s.ifModified ) {
					modified = jqXHR.getResponseHeader( "Last-Modified" );
					if ( modified ) {
						jQuery.lastModified[ cacheURL ] = modified;
					}
					modified = jqXHR.getResponseHeader( "etag" );
					if ( modified ) {
						jQuery.etag[ cacheURL ] = modified;
					}
				}

				// if no content
				if ( status === 204 || s.type === "HEAD" ) {
					statusText = "nocontent";

				// if not modified
				} else if ( status === 304 ) {
					statusText = "notmodified";

				// If we have data, let's convert it
				} else {
					statusText = response.state;
					success = response.data;
					error = response.error;
					isSuccess = !error;
				}
			} else {

				// We extract error from statusText
				// then normalize statusText and status for non-aborts
				error = statusText;
				if ( status || !statusText ) {
					statusText = "error";
					if ( status < 0 ) {
						status = 0;
					}
				}
			}

			// Set data for the fake xhr object
			jqXHR.status = status;
			jqXHR.statusText = ( nativeStatusText || statusText ) + "";

			// Success/Error
			if ( isSuccess ) {
				deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
			} else {
				deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
			}

			// Status-dependent callbacks
			jqXHR.statusCode( statusCode );
			statusCode = undefined;

			if ( fireGlobals ) {
				globalEventContext.trigger( isSuccess ? "ajaxSuccess" : "ajaxError",
					[ jqXHR, s, isSuccess ? success : error ] );
			}

			// Complete
			completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );

				// Handle the global AJAX counter
				if ( !( --jQuery.active ) ) {
					jQuery.event.trigger( "ajaxStop" );
				}
			}
		}

		return jqXHR;
	},

	getJSON: function( url, data, callback ) {
		return jQuery.get( url, data, callback, "json" );
	},

	getScript: function( url, callback ) {
		return jQuery.get( url, undefined, callback, "script" );
	}
} );

jQuery.each( [ "get", "post" ], function( i, method ) {
	jQuery[ method ] = function( url, data, callback, type ) {

		// shift arguments if data argument was omitted
		if ( jQuery.isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = undefined;
		}

		// The url can be an options object (which then must have .url)
		return jQuery.ajax( jQuery.extend( {
			url: url,
			type: method,
			dataType: type,
			data: data,
			success: callback
		}, jQuery.isPlainObject( url ) && url ) );
	};
} );


jQuery._evalUrl = function( url ) {
	return jQuery.ajax( {
		url: url,

		// Make this explicit, since user can override this through ajaxSetup (#11264)
		type: "GET",
		dataType: "script",
		cache: true,
		async: false,
		global: false,
		"throws": true
	} );
};


jQuery.fn.extend( {
	wrapAll: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each( function( i ) {
				jQuery( this ).wrapAll( html.call( this, i ) );
			} );
		}

		if ( this[ 0 ] ) {

			// The elements to wrap the target around
			var wrap = jQuery( html, this[ 0 ].ownerDocument ).eq( 0 ).clone( true );

			if ( this[ 0 ].parentNode ) {
				wrap.insertBefore( this[ 0 ] );
			}

			wrap.map( function() {
				var elem = this;

				while ( elem.firstChild && elem.firstChild.nodeType === 1 ) {
					elem = elem.firstChild;
				}

				return elem;
			} ).append( this );
		}

		return this;
	},

	wrapInner: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each( function( i ) {
				jQuery( this ).wrapInner( html.call( this, i ) );
			} );
		}

		return this.each( function() {
			var self = jQuery( this ),
				contents = self.contents();

			if ( contents.length ) {
				contents.wrapAll( html );

			} else {
				self.append( html );
			}
		} );
	},

	wrap: function( html ) {
		var isFunction = jQuery.isFunction( html );

		return this.each( function( i ) {
			jQuery( this ).wrapAll( isFunction ? html.call( this, i ) : html );
		} );
	},

	unwrap: function() {
		return this.parent().each( function() {
			if ( !jQuery.nodeName( this, "body" ) ) {
				jQuery( this ).replaceWith( this.childNodes );
			}
		} ).end();
	}
} );


function getDisplay( elem ) {
	return elem.style && elem.style.display || jQuery.css( elem, "display" );
}

function filterHidden( elem ) {

	// Disconnected elements are considered hidden
	if ( !jQuery.contains( elem.ownerDocument || document, elem ) ) {
		return true;
	}
	while ( elem && elem.nodeType === 1 ) {
		if ( getDisplay( elem ) === "none" || elem.type === "hidden" ) {
			return true;
		}
		elem = elem.parentNode;
	}
	return false;
}

jQuery.expr.filters.hidden = function( elem ) {

	// Support: Opera <= 12.12
	// Opera reports offsetWidths and offsetHeights less than zero on some elements
	return support.reliableHiddenOffsets() ?
		( elem.offsetWidth <= 0 && elem.offsetHeight <= 0 &&
			!elem.getClientRects().length ) :
			filterHidden( elem );
};

jQuery.expr.filters.visible = function( elem ) {
	return !jQuery.expr.filters.hidden( elem );
};




var r20 = /%20/g,
	rbracket = /\[\]$/,
	rCRLF = /\r?\n/g,
	rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
	rsubmittable = /^(?:input|select|textarea|keygen)/i;

function buildParams( prefix, obj, traditional, add ) {
	var name;

	if ( jQuery.isArray( obj ) ) {

		// Serialize array item.
		jQuery.each( obj, function( i, v ) {
			if ( traditional || rbracket.test( prefix ) ) {

				// Treat each array item as a scalar.
				add( prefix, v );

			} else {

				// Item is non-scalar (array or object), encode its numeric index.
				buildParams(
					prefix + "[" + ( typeof v === "object" && v != null ? i : "" ) + "]",
					v,
					traditional,
					add
				);
			}
		} );

	} else if ( !traditional && jQuery.type( obj ) === "object" ) {

		// Serialize object item.
		for ( name in obj ) {
			buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
		}

	} else {

		// Serialize scalar item.
		add( prefix, obj );
	}
}

// Serialize an array of form elements or a set of
// key/values into a query string
jQuery.param = function( a, traditional ) {
	var prefix,
		s = [],
		add = function( key, value ) {

			// If value is a function, invoke it and return its value
			value = jQuery.isFunction( value ) ? value() : ( value == null ? "" : value );
			s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
		};

	// Set traditional to true for jQuery <= 1.3.2 behavior.
	if ( traditional === undefined ) {
		traditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;
	}

	// If an array was passed in, assume that it is an array of form elements.
	if ( jQuery.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {

		// Serialize the form elements
		jQuery.each( a, function() {
			add( this.name, this.value );
		} );

	} else {

		// If traditional, encode the "old" way (the way 1.3.2 or older
		// did it), otherwise encode params recursively.
		for ( prefix in a ) {
			buildParams( prefix, a[ prefix ], traditional, add );
		}
	}

	// Return the resulting serialization
	return s.join( "&" ).replace( r20, "+" );
};

jQuery.fn.extend( {
	serialize: function() {
		return jQuery.param( this.serializeArray() );
	},
	serializeArray: function() {
		return this.map( function() {

			// Can add propHook for "elements" to filter or add form elements
			var elements = jQuery.prop( this, "elements" );
			return elements ? jQuery.makeArray( elements ) : this;
		} )
		.filter( function() {
			var type = this.type;

			// Use .is(":disabled") so that fieldset[disabled] works
			return this.name && !jQuery( this ).is( ":disabled" ) &&
				rsubmittable.test( this.nodeName ) && !rsubmitterTypes.test( type ) &&
				( this.checked || !rcheckableType.test( type ) );
		} )
		.map( function( i, elem ) {
			var val = jQuery( this ).val();

			return val == null ?
				null :
				jQuery.isArray( val ) ?
					jQuery.map( val, function( val ) {
						return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
					} ) :
					{ name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
		} ).get();
	}
} );


// Create the request object
// (This is still attached to ajaxSettings for backward compatibility)
jQuery.ajaxSettings.xhr = window.ActiveXObject !== undefined ?

	// Support: IE6-IE8
	function() {

		// XHR cannot access local files, always use ActiveX for that case
		if ( this.isLocal ) {
			return createActiveXHR();
		}

		// Support: IE 9-11
		// IE seems to error on cross-domain PATCH requests when ActiveX XHR
		// is used. In IE 9+ always use the native XHR.
		// Note: this condition won't catch Edge as it doesn't define
		// document.documentMode but it also doesn't support ActiveX so it won't
		// reach this code.
		if ( document.documentMode > 8 ) {
			return createStandardXHR();
		}

		// Support: IE<9
		// oldIE XHR does not support non-RFC2616 methods (#13240)
		// See http://msdn.microsoft.com/en-us/library/ie/ms536648(v=vs.85).aspx
		// and http://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html#sec9
		// Although this check for six methods instead of eight
		// since IE also does not support "trace" and "connect"
		return /^(get|post|head|put|delete|options)$/i.test( this.type ) &&
			createStandardXHR() || createActiveXHR();
	} :

	// For all other browsers, use the standard XMLHttpRequest object
	createStandardXHR;

var xhrId = 0,
	xhrCallbacks = {},
	xhrSupported = jQuery.ajaxSettings.xhr();

// Support: IE<10
// Open requests must be manually aborted on unload (#5280)
// See https://support.microsoft.com/kb/2856746 for more info
if ( window.attachEvent ) {
	window.attachEvent( "onunload", function() {
		for ( var key in xhrCallbacks ) {
			xhrCallbacks[ key ]( undefined, true );
		}
	} );
}

// Determine support properties
support.cors = !!xhrSupported && ( "withCredentials" in xhrSupported );
xhrSupported = support.ajax = !!xhrSupported;

// Create transport if the browser can provide an xhr
if ( xhrSupported ) {

	jQuery.ajaxTransport( function( options ) {

		// Cross domain only allowed if supported through XMLHttpRequest
		if ( !options.crossDomain || support.cors ) {

			var callback;

			return {
				send: function( headers, complete ) {
					var i,
						xhr = options.xhr(),
						id = ++xhrId;

					// Open the socket
					xhr.open(
						options.type,
						options.url,
						options.async,
						options.username,
						options.password
					);

					// Apply custom fields if provided
					if ( options.xhrFields ) {
						for ( i in options.xhrFields ) {
							xhr[ i ] = options.xhrFields[ i ];
						}
					}

					// Override mime type if needed
					if ( options.mimeType && xhr.overrideMimeType ) {
						xhr.overrideMimeType( options.mimeType );
					}

					// X-Requested-With header
					// For cross-domain requests, seeing as conditions for a preflight are
					// akin to a jigsaw puzzle, we simply never set it to be sure.
					// (it can always be set on a per-request basis or even using ajaxSetup)
					// For same-domain requests, won't change header if already provided.
					if ( !options.crossDomain && !headers[ "X-Requested-With" ] ) {
						headers[ "X-Requested-With" ] = "XMLHttpRequest";
					}

					// Set headers
					for ( i in headers ) {

						// Support: IE<9
						// IE's ActiveXObject throws a 'Type Mismatch' exception when setting
						// request header to a null-value.
						//
						// To keep consistent with other XHR implementations, cast the value
						// to string and ignore `undefined`.
						if ( headers[ i ] !== undefined ) {
							xhr.setRequestHeader( i, headers[ i ] + "" );
						}
					}

					// Do send the request
					// This may raise an exception which is actually
					// handled in jQuery.ajax (so no try/catch here)
					xhr.send( ( options.hasContent && options.data ) || null );

					// Listener
					callback = function( _, isAbort ) {
						var status, statusText, responses;

						// Was never called and is aborted or complete
						if ( callback && ( isAbort || xhr.readyState === 4 ) ) {

							// Clean up
							delete xhrCallbacks[ id ];
							callback = undefined;
							xhr.onreadystatechange = jQuery.noop;

							// Abort manually if needed
							if ( isAbort ) {
								if ( xhr.readyState !== 4 ) {
									xhr.abort();
								}
							} else {
								responses = {};
								status = xhr.status;

								// Support: IE<10
								// Accessing binary-data responseText throws an exception
								// (#11426)
								if ( typeof xhr.responseText === "string" ) {
									responses.text = xhr.responseText;
								}

								// Firefox throws an exception when accessing
								// statusText for faulty cross-domain requests
								try {
									statusText = xhr.statusText;
								} catch ( e ) {

									// We normalize with Webkit giving an empty statusText
									statusText = "";
								}

								// Filter status for non standard behaviors

								// If the request is local and we have data: assume a success
								// (success with no data won't get notified, that's the best we
								// can do given current implementations)
								if ( !status && options.isLocal && !options.crossDomain ) {
									status = responses.text ? 200 : 404;

								// IE - #1450: sometimes returns 1223 when it should be 204
								} else if ( status === 1223 ) {
									status = 204;
								}
							}
						}

						// Call complete if needed
						if ( responses ) {
							complete( status, statusText, responses, xhr.getAllResponseHeaders() );
						}
					};

					// Do send the request
					// `xhr.send` may raise an exception, but it will be
					// handled in jQuery.ajax (so no try/catch here)
					if ( !options.async ) {

						// If we're in sync mode we fire the callback
						callback();
					} else if ( xhr.readyState === 4 ) {

						// (IE6 & IE7) if it's in cache and has been
						// retrieved directly we need to fire the callback
						window.setTimeout( callback );
					} else {

						// Register the callback, but delay it in case `xhr.send` throws
						// Add to the list of active xhr callbacks
						xhr.onreadystatechange = xhrCallbacks[ id ] = callback;
					}
				},

				abort: function() {
					if ( callback ) {
						callback( undefined, true );
					}
				}
			};
		}
	} );
}

// Functions to create xhrs
function createStandardXHR() {
	try {
		return new window.XMLHttpRequest();
	} catch ( e ) {}
}

function createActiveXHR() {
	try {
		return new window.ActiveXObject( "Microsoft.XMLHTTP" );
	} catch ( e ) {}
}

// AEM Patch - Start
// Prevent auto-execution of scripts when no explicit dataType was provided (See gh-2432)
// (See GRANITE-20058)
jQuery.ajaxPrefilter( function( s ) {
    if ( s.crossDomain ) {
        s.contents.script = false;
    }
} );
// AEM Patch - End


// Install script dataType
jQuery.ajaxSetup( {
	accepts: {
		script: "text/javascript, application/javascript, " +
			"application/ecmascript, application/x-ecmascript"
	},
	contents: {
		script: /\b(?:java|ecma)script\b/
	},
	converters: {
		"text script": function( text ) {
			jQuery.globalEval( text );
			return text;
		}
	}
} );

// Handle cache's special case and global
jQuery.ajaxPrefilter( "script", function( s ) {
	if ( s.cache === undefined ) {
		s.cache = false;
	}
	if ( s.crossDomain ) {
		s.type = "GET";
		s.global = false;
	}
} );

// Bind script tag hack transport
jQuery.ajaxTransport( "script", function( s ) {

	// This transport only deals with cross domain requests
	if ( s.crossDomain ) {

		var script,
			head = document.head || jQuery( "head" )[ 0 ] || document.documentElement;

		return {

			send: function( _, callback ) {

				script = document.createElement( "script" );

				script.async = true;

				if ( s.scriptCharset ) {
					script.charset = s.scriptCharset;
				}

				script.src = s.url;

				// Attach handlers for all browsers
				script.onload = script.onreadystatechange = function( _, isAbort ) {

					if ( isAbort || !script.readyState || /loaded|complete/.test( script.readyState ) ) {

						// Handle memory leak in IE
						script.onload = script.onreadystatechange = null;

						// Remove the script
						if ( script.parentNode ) {
							script.parentNode.removeChild( script );
						}

						// Dereference the script
						script = null;

						// Callback if not abort
						if ( !isAbort ) {
							callback( 200, "success" );
						}
					}
				};

				// Circumvent IE6 bugs with base elements (#2709 and #4378) by prepending
				// Use native DOM manipulation to avoid our domManip AJAX trickery
				head.insertBefore( script, head.firstChild );
			},

			abort: function() {
				if ( script ) {
					script.onload( undefined, true );
				}
			}
		};
	}
} );




var oldCallbacks = [],
	rjsonp = /(=)\?(?=&|$)|\?\?/;

// Default jsonp settings
jQuery.ajaxSetup( {
	jsonp: "callback",
	jsonpCallback: function() {
		var callback = oldCallbacks.pop() || ( jQuery.expando + "_" + ( nonce++ ) );
		this[ callback ] = true;
		return callback;
	}
} );

// Detect, normalize options and install callbacks for jsonp requests
jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

	var callbackName, overwritten, responseContainer,
		jsonProp = s.jsonp !== false && ( rjsonp.test( s.url ) ?
			"url" :
			typeof s.data === "string" &&
				( s.contentType || "" )
					.indexOf( "application/x-www-form-urlencoded" ) === 0 &&
				rjsonp.test( s.data ) && "data"
		);

	// Handle iff the expected data type is "jsonp" or we have a parameter to set
	if ( jsonProp || s.dataTypes[ 0 ] === "jsonp" ) {

		// Get callback name, remembering preexisting value associated with it
		callbackName = s.jsonpCallback = jQuery.isFunction( s.jsonpCallback ) ?
			s.jsonpCallback() :
			s.jsonpCallback;

		// Insert callback into url or form data
		if ( jsonProp ) {
			s[ jsonProp ] = s[ jsonProp ].replace( rjsonp, "$1" + callbackName );
		} else if ( s.jsonp !== false ) {
			s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.jsonp + "=" + callbackName;
		}

		// Use data converter to retrieve json after script execution
		s.converters[ "script json" ] = function() {
			if ( !responseContainer ) {
				jQuery.error( callbackName + " was not called" );
			}
			return responseContainer[ 0 ];
		};

		// force json dataType
		s.dataTypes[ 0 ] = "json";

		// Install callback
		overwritten = window[ callbackName ];
		window[ callbackName ] = function() {
			responseContainer = arguments;
		};

		// Clean-up function (fires after converters)
		jqXHR.always( function() {

			// If previous value didn't exist - remove it
			if ( overwritten === undefined ) {
				jQuery( window ).removeProp( callbackName );

			// Otherwise restore preexisting value
			} else {
				window[ callbackName ] = overwritten;
			}

			// Save back as free
			if ( s[ callbackName ] ) {

				// make sure that re-using the options doesn't screw things around
				s.jsonpCallback = originalSettings.jsonpCallback;

				// save the callback name for future use
				oldCallbacks.push( callbackName );
			}

			// Call if it was a function and we have a response
			if ( responseContainer && jQuery.isFunction( overwritten ) ) {
				overwritten( responseContainer[ 0 ] );
			}

			responseContainer = overwritten = undefined;
		} );

		// Delegate to script
		return "script";
	}
} );




// data: string of html
// context (optional): If specified, the fragment will be created in this context,
// defaults to document
// keepScripts (optional): If true, will include scripts passed in the html string
jQuery.parseHTML = function( data, context, keepScripts ) {
	if ( !data || typeof data !== "string" ) {
		return null;
	}
	if ( typeof context === "boolean" ) {
		keepScripts = context;
		context = false;
	}
	context = context || document;

	var parsed = rsingleTag.exec( data ),
		scripts = !keepScripts && [];

	// Single tag
	if ( parsed ) {
		return [ context.createElement( parsed[ 1 ] ) ];
	}

	parsed = buildFragment( [ data ], context, scripts );

	if ( scripts && scripts.length ) {
		jQuery( scripts ).remove();
	}

	return jQuery.merge( [], parsed.childNodes );
};


// Keep a copy of the old load method
var _load = jQuery.fn.load;

/**
 * Load a url into a page
 */
jQuery.fn.load = function( url, params, callback ) {
	if ( typeof url !== "string" && _load ) {
		return _load.apply( this, arguments );
	}

	var selector, type, response,
		self = this,
		off = url.indexOf( " " );

	if ( off > -1 ) {
		selector = jQuery.trim( url.slice( off, url.length ) );
		url = url.slice( 0, off );
	}

	// If it's a function
	if ( jQuery.isFunction( params ) ) {

		// We assume that it's the callback
		callback = params;
		params = undefined;

	// Otherwise, build a param string
	} else if ( params && typeof params === "object" ) {
		type = "POST";
	}

	// If we have elements to modify, make the request
	if ( self.length > 0 ) {
		jQuery.ajax( {
			url: url,

			// If "type" variable is undefined, then "GET" method will be used.
			// Make value of this field explicit since
			// user can override it through ajaxSetup method
			type: type || "GET",
			dataType: "html",
			data: params
		} ).done( function( responseText ) {

			// Save response for use in complete callback
			response = arguments;

			self.html( selector ?

				// If a selector was specified, locate the right elements in a dummy div
				// Exclude scripts to avoid IE 'Permission Denied' errors
				jQuery( "<div>" ).append( jQuery.parseHTML( responseText ) ).find( selector ) :

				// Otherwise use the full result
				responseText );

		// If the request succeeds, this function gets "data", "status", "jqXHR"
		// but they are ignored because response was set above.
		// If it fails, this function gets "jqXHR", "status", "error"
		} ).always( callback && function( jqXHR, status ) {
			self.each( function() {
				callback.apply( this, response || [ jqXHR.responseText, status, jqXHR ] );
			} );
		} );
	}

	return this;
};




// Attach a bunch of functions for handling common AJAX events
jQuery.each( [
	"ajaxStart",
	"ajaxStop",
	"ajaxComplete",
	"ajaxError",
	"ajaxSuccess",
	"ajaxSend"
], function( i, type ) {
	jQuery.fn[ type ] = function( fn ) {
		return this.on( type, fn );
	};
} );




jQuery.expr.filters.animated = function( elem ) {
	return jQuery.grep( jQuery.timers, function( fn ) {
		return elem === fn.elem;
	} ).length;
};





/**
 * Gets a window from an element
 */
function getWindow( elem ) {
	return jQuery.isWindow( elem ) ?
		elem :
		elem.nodeType === 9 ?
			elem.defaultView || elem.parentWindow :
			false;
}

jQuery.offset = {
	setOffset: function( elem, options, i ) {
		var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,
			position = jQuery.css( elem, "position" ),
			curElem = jQuery( elem ),
			props = {};

		// set position first, in-case top/left are set even on static elem
		if ( position === "static" ) {
			elem.style.position = "relative";
		}

		curOffset = curElem.offset();
		curCSSTop = jQuery.css( elem, "top" );
		curCSSLeft = jQuery.css( elem, "left" );
		calculatePosition = ( position === "absolute" || position === "fixed" ) &&
			jQuery.inArray( "auto", [ curCSSTop, curCSSLeft ] ) > -1;

		// need to be able to calculate position if either top or left
		// is auto and position is either absolute or fixed
		if ( calculatePosition ) {
			curPosition = curElem.position();
			curTop = curPosition.top;
			curLeft = curPosition.left;
		} else {
			curTop = parseFloat( curCSSTop ) || 0;
			curLeft = parseFloat( curCSSLeft ) || 0;
		}

		if ( jQuery.isFunction( options ) ) {

			// Use jQuery.extend here to allow modification of coordinates argument (gh-1848)
			options = options.call( elem, i, jQuery.extend( {}, curOffset ) );
		}

		if ( options.top != null ) {
			props.top = ( options.top - curOffset.top ) + curTop;
		}
		if ( options.left != null ) {
			props.left = ( options.left - curOffset.left ) + curLeft;
		}

		if ( "using" in options ) {
			options.using.call( elem, props );
		} else {
			curElem.css( props );
		}
	}
};

jQuery.fn.extend( {
	offset: function( options ) {
		if ( arguments.length ) {
			return options === undefined ?
				this :
				this.each( function( i ) {
					jQuery.offset.setOffset( this, options, i );
				} );
		}

		var docElem, win,
			box = { top: 0, left: 0 },
			elem = this[ 0 ],
			doc = elem && elem.ownerDocument;

		if ( !doc ) {
			return;
		}

		docElem = doc.documentElement;

		// Make sure it's not a disconnected DOM node
		if ( !jQuery.contains( docElem, elem ) ) {
			return box;
		}

		// If we don't have gBCR, just use 0,0 rather than error
		// BlackBerry 5, iOS 3 (original iPhone)
		if ( typeof elem.getBoundingClientRect !== "undefined" ) {
			box = elem.getBoundingClientRect();
		}
		win = getWindow( doc );
		return {
			top: box.top  + ( win.pageYOffset || docElem.scrollTop )  - ( docElem.clientTop  || 0 ),
			left: box.left + ( win.pageXOffset || docElem.scrollLeft ) - ( docElem.clientLeft || 0 )
		};
	},

	position: function() {
		if ( !this[ 0 ] ) {
			return;
		}

		var offsetParent, offset,
			parentOffset = { top: 0, left: 0 },
			elem = this[ 0 ];

		// Fixed elements are offset from window (parentOffset = {top:0, left: 0},
		// because it is its only offset parent
		if ( jQuery.css( elem, "position" ) === "fixed" ) {

			// we assume that getBoundingClientRect is available when computed position is fixed
			offset = elem.getBoundingClientRect();
		} else {

			// Get *real* offsetParent
			offsetParent = this.offsetParent();

			// Get correct offsets
			offset = this.offset();
			if ( !jQuery.nodeName( offsetParent[ 0 ], "html" ) ) {
				parentOffset = offsetParent.offset();
			}

			// Add offsetParent borders
			parentOffset.top  += jQuery.css( offsetParent[ 0 ], "borderTopWidth", true );
			parentOffset.left += jQuery.css( offsetParent[ 0 ], "borderLeftWidth", true );
		}

		// Subtract parent offsets and element margins
		// note: when an element has margin: auto the offsetLeft and marginLeft
		// are the same in Safari causing offset.left to incorrectly be 0
		return {
			top:  offset.top  - parentOffset.top - jQuery.css( elem, "marginTop", true ),
			left: offset.left - parentOffset.left - jQuery.css( elem, "marginLeft", true )
		};
	},

	offsetParent: function() {
		return this.map( function() {
			var offsetParent = this.offsetParent;

			while ( offsetParent && ( !jQuery.nodeName( offsetParent, "html" ) &&
				jQuery.css( offsetParent, "position" ) === "static" ) ) {
				offsetParent = offsetParent.offsetParent;
			}
			return offsetParent || documentElement;
		} );
	}
} );

// Create scrollLeft and scrollTop methods
jQuery.each( { scrollLeft: "pageXOffset", scrollTop: "pageYOffset" }, function( method, prop ) {
	var top = /Y/.test( prop );

	jQuery.fn[ method ] = function( val ) {
		return access( this, function( elem, method, val ) {
			var win = getWindow( elem );

			if ( val === undefined ) {
				return win ? ( prop in win ) ? win[ prop ] :
					win.document.documentElement[ method ] :
					elem[ method ];
			}

			if ( win ) {
				win.scrollTo(
					!top ? val : jQuery( win ).scrollLeft(),
					top ? val : jQuery( win ).scrollTop()
				);

			} else {
				elem[ method ] = val;
			}
		}, method, val, arguments.length, null );
	};
} );

// Support: Safari<7-8+, Chrome<37-44+
// Add the top/left cssHooks using jQuery.fn.position
// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
// getComputedStyle returns percent when specified for top/left/bottom/right
// rather than make the css module depend on the offset module, we just check for it here
jQuery.each( [ "top", "left" ], function( i, prop ) {
	jQuery.cssHooks[ prop ] = addGetHookIf( support.pixelPosition,
		function( elem, computed ) {
			if ( computed ) {
				computed = curCSS( elem, prop );

				// if curCSS returns percentage, fallback to offset
				return rnumnonpx.test( computed ) ?
					jQuery( elem ).position()[ prop ] + "px" :
					computed;
			}
		}
	);
} );


// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
jQuery.each( { Height: "height", Width: "width" }, function( name, type ) {
	jQuery.each( { padding: "inner" + name, content: type, "": "outer" + name },
	function( defaultExtra, funcName ) {

		// margin is only for outerHeight, outerWidth
		jQuery.fn[ funcName ] = function( margin, value ) {
			var chainable = arguments.length && ( defaultExtra || typeof margin !== "boolean" ),
				extra = defaultExtra || ( margin === true || value === true ? "margin" : "border" );

			return access( this, function( elem, type, value ) {
				var doc;

				if ( jQuery.isWindow( elem ) ) {

					// As of 5/8/2012 this will yield incorrect results for Mobile Safari, but there
					// isn't a whole lot we can do. See pull request at this URL for discussion:
					// https://github.com/jquery/jquery/pull/764
					return elem.document.documentElement[ "client" + name ];
				}

				// Get document width or height
				if ( elem.nodeType === 9 ) {
					doc = elem.documentElement;

					// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
					// whichever is greatest
					// unfortunately, this causes bug #3838 in IE6/8 only,
					// but there is currently no good, small way to fix it.
					return Math.max(
						elem.body[ "scroll" + name ], doc[ "scroll" + name ],
						elem.body[ "offset" + name ], doc[ "offset" + name ],
						doc[ "client" + name ]
					);
				}

				return value === undefined ?

					// Get width or height on the element, requesting but not forcing parseFloat
					jQuery.css( elem, type, extra ) :

					// Set width or height on the element
					jQuery.style( elem, type, value, extra );
			}, type, chainable ? margin : undefined, chainable, null );
		};
	} );
} );


jQuery.fn.extend( {

	bind: function( types, data, fn ) {
		return this.on( types, null, data, fn );
	},
	unbind: function( types, fn ) {
		return this.off( types, null, fn );
	},

	delegate: function( selector, types, data, fn ) {
		return this.on( types, selector, data, fn );
	},
	undelegate: function( selector, types, fn ) {

		// ( namespace ) or ( selector, types [, fn] )
		return arguments.length === 1 ?
			this.off( selector, "**" ) :
			this.off( types, selector || "**", fn );
	}
} );

// The number of elements contained in the matched element set
jQuery.fn.size = function() {
	return this.length;
};

jQuery.fn.andSelf = jQuery.fn.addBack;




// Register as a named AMD module, since jQuery can be concatenated with other
// files that may use define, but not via a proper concatenation script that
// understands anonymous AMD modules. A named AMD is safest and most robust
// way to register. Lowercase jquery is used because AMD module names are
// derived from file names, and jQuery is normally delivered in a lowercase
// file name. Do this after creating the global so that if an AMD module wants
// to call noConflict to hide this version of jQuery, it will work.

// Note that for maximum portability, libraries that are not jQuery should
// declare themselves as anonymous modules, and avoid setting a global if an
// AMD loader is present. jQuery is a special case. For more information, see
// https://github.com/jrburke/requirejs/wiki/Updating-existing-libraries#wiki-anon

if ( typeof define === "function" && define.amd ) {
	define( "jquery", [], function() {
		return jQuery;
	} );
}



var

	// Map over jQuery in case of overwrite
	_jQuery = window.jQuery,

	// Map over the $ in case of overwrite
	_$ = window.$;

jQuery.noConflict = function( deep ) {
	if ( window.$ === jQuery ) {
		window.$ = _$;
	}

	if ( deep && window.jQuery === jQuery ) {
		window.jQuery = _jQuery;
	}

	return jQuery;
};

// Expose jQuery and $ identifiers, even in
// AMD (#7102#comment:10, https://github.com/jquery/jquery/pull/557)
// and CommonJS for browser emulators (#13566)
if ( !noGlobal ) {
	window.jQuery = window.$ = jQuery;
}

return jQuery;
}));

jQuery.uaMatch = function( ua ) {
    ua = ua.toLowerCase();

    var match = /(chrome)[ \/]([\w.]+)/.exec( ua ) ||
        /(webkit)[ \/]([\w.]+)/.exec( ua ) ||
        /(opera)(?:.*version|)[ \/]([\w.]+)/.exec( ua ) ||
        /(msie) ([\w.]+)/.exec( ua ) ||
        ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec( ua ) ||
        [];

    return {
        browser: match[ 1 ] || "",
        version: match[ 2 ] || "0"
    };
};

// Don't clobber any existing jQuery.browser in case it's different
if ( !jQuery.browser ) {
    matched = jQuery.uaMatch( navigator.userAgent );
    browser = {};

    if ( matched.browser ) {
        browser[ matched.browser ] = true;
        browser.version = matched.version;
    }

    // Chrome is Webkit, but Webkit is also Safari.
    if ( browser.chrome ) {
        browser.webkit = true;
    } else if ( browser.webkit ) {
        browser.safari = true;
    }

    jQuery.browser = browser;
}

/*
 * The security fix of CVE-2020-11023 and CVE-2020-11022 in jquery changed the behaviour of
 * htmlPrefilter function. Now this function does not use a regex in 3.5.0 and passes the
 * string through unchanged. To adapt this change we might need to modify our own code.
 *
 * For more info check : https://blog.jquery.com/2020/04/10/jquery-3-5-0-released/
 *
 * The below code belongs to https://github.com/jquery/jquery-migrate
 */

(function(jQuery) {
    var rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([a-z][^\/\0>\x20\t\r\n\f]*)[^>]*)\/>/gi;
    var origHtmlPrefilter = jQuery.htmlPrefilter;

    function makeMarkup( html ) {
        var doc = window.document.implementation.createHTMLDocument( "" );
        doc.body.innerHTML = html;
        return doc.body && doc.body.innerHTML;
    }

    function warnIfChanged( html ) {
        var changed = html.replace( rxhtmlTag, "<$1></$2>" );
        if ( changed !== html && makeMarkup( html ) !== makeMarkup( changed ) ) {
            console.error( "HTML tags must be properly nested and closed: " + html );
        }
    }

    jQuery.htmlPrefilter = function( html ) {
        warnIfChanged( html );
        return origHtmlPrefilter( html );
    };
})(window.jQuery);

/* ========================================================================
 * Bootstrap: transition.js v3.3.7
 * http://getbootstrap.com/javascript/#transitions
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // CSS TRANSITION SUPPORT (Shoutout: http://www.modernizr.com/)
  // ============================================================

  function transitionEnd() {
    var el = document.createElement('bootstrap')

    var transEndEventNames = {
      WebkitTransition : 'webkitTransitionEnd',
      MozTransition    : 'transitionend',
      OTransition      : 'oTransitionEnd otransitionend',
      transition       : 'transitionend'
    }

    for (var name in transEndEventNames) {
      if (el.style[name] !== undefined) {
        return { end: transEndEventNames[name] }
      }
    }

    return false // explicit for ie8 (  ._.)
  }

  // http://blog.alexmaccaw.com/css-transitions
  $.fn.emulateTransitionEnd = function (duration) {
    var called = false
    var $el = this
    $(this).one('bsTransitionEnd', function () { called = true })
    var callback = function () { if (!called) $($el).trigger($.support.transition.end) }
    setTimeout(callback, duration)
    return this
  }

  $(function () {
    $.support.transition = transitionEnd()

    if (!$.support.transition) return

    $.event.special.bsTransitionEnd = {
      bindType: $.support.transition.end,
      delegateType: $.support.transition.end,
      handle: function (e) {
        if ($(e.target).is(this)) return e.handleObj.handler.apply(this, arguments)
      }
    }
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: alert.js v3.3.7
 * http://getbootstrap.com/javascript/#alerts
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // ALERT CLASS DEFINITION
  // ======================

  var dismiss = '[data-dismiss="alert"]'
  var Alert   = function (el) {
    $(el).on('click', dismiss, this.close)
  }

  Alert.VERSION = '3.3.7'

  Alert.TRANSITION_DURATION = 150

  Alert.prototype.close = function (e) {
    var $this    = $(this)
    var selector = $this.attr('data-target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
    }

    var $parent = $(selector === '#' ? [] : selector)

    if (e) e.preventDefault()

    if (!$parent.length) {
      $parent = $this.closest('.alert')
    }

    $parent.trigger(e = $.Event('close.bs.alert'))

    if (e.isDefaultPrevented()) return

    $parent.removeClass('in')

    function removeElement() {
      // detach from parent, fire event then clean up data
      $parent.detach().trigger('closed.bs.alert').remove()
    }

    $.support.transition && $parent.hasClass('fade') ?
      $parent
        .one('bsTransitionEnd', removeElement)
        .emulateTransitionEnd(Alert.TRANSITION_DURATION) :
      removeElement()
  }


  // ALERT PLUGIN DEFINITION
  // =======================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.alert')

      if (!data) $this.data('bs.alert', (data = new Alert(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }

  var old = $.fn.alert

  $.fn.alert             = Plugin
  $.fn.alert.Constructor = Alert


  // ALERT NO CONFLICT
  // =================

  $.fn.alert.noConflict = function () {
    $.fn.alert = old
    return this
  }


  // ALERT DATA-API
  // ==============

  $(document).on('click.bs.alert.data-api', dismiss, Alert.prototype.close)

}(jQuery);

/* ========================================================================
 * Bootstrap: button.js v3.3.7
 * http://getbootstrap.com/javascript/#buttons
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // BUTTON PUBLIC CLASS DEFINITION
  // ==============================

  var Button = function (element, options) {
    this.$element  = $(element)
    this.options   = $.extend({}, Button.DEFAULTS, options)
    this.isLoading = false
  }

  Button.VERSION  = '3.3.7'

  Button.DEFAULTS = {
    loadingText: 'loading...'
  }

  Button.prototype.setState = function (state) {
    var d    = 'disabled'
    var $el  = this.$element
    var val  = $el.is('input') ? 'val' : 'html'
    var data = $el.data()

    state += 'Text'

    if (data.resetText == null) $el.data('resetText', $el[val]())

    // push to event loop to allow forms to submit
    setTimeout($.proxy(function () {
      $el[val](data[state] == null ? this.options[state] : data[state])

      if (state == 'loadingText') {
        this.isLoading = true
        $el.addClass(d).attr(d, d).prop(d, true)
      } else if (this.isLoading) {
        this.isLoading = false
        $el.removeClass(d).removeAttr(d).prop(d, false)
      }
    }, this), 0)
  }

  Button.prototype.toggle = function () {
    var changed = true
    var $parent = this.$element.closest('[data-toggle="buttons"]')

    if ($parent.length) {
      var $input = this.$element.find('input')
      if ($input.prop('type') == 'radio') {
        if ($input.prop('checked')) changed = false
        $parent.find('.active').removeClass('active')
        this.$element.addClass('active')
      } else if ($input.prop('type') == 'checkbox') {
        if (($input.prop('checked')) !== this.$element.hasClass('active')) changed = false
        this.$element.toggleClass('active')
      }
      $input.prop('checked', this.$element.hasClass('active'))
      if (changed) $input.trigger('change')
    } else {
      this.$element.attr('aria-pressed', !this.$element.hasClass('active'))
      this.$element.toggleClass('active')
    }
  }


  // BUTTON PLUGIN DEFINITION
  // ========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.button')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.button', (data = new Button(this, options)))

      if (option == 'toggle') data.toggle()
      else if (option) data.setState(option)
    })
  }

  var old = $.fn.button

  $.fn.button             = Plugin
  $.fn.button.Constructor = Button


  // BUTTON NO CONFLICT
  // ==================

  $.fn.button.noConflict = function () {
    $.fn.button = old
    return this
  }


  // BUTTON DATA-API
  // ===============

  $(document)
    .on('click.bs.button.data-api', '[data-toggle^="button"]', function (e) {
      var $btn = $(e.target).closest('.btn')
      Plugin.call($btn, 'toggle')
      if (!($(e.target).is('input[type="radio"], input[type="checkbox"]'))) {
        // Prevent double click on radios, and the double selections (so cancellation) on checkboxes
        e.preventDefault()
        // The target component still receive the focus
        if ($btn.is('input,button')) $btn.trigger('focus')
        else $btn.find('input:visible,button:visible').first().trigger('focus')
      }
    })
    .on('focus.bs.button.data-api blur.bs.button.data-api', '[data-toggle^="button"]', function (e) {
      $(e.target).closest('.btn').toggleClass('focus', /^focus(in)?$/.test(e.type))
    })

}(jQuery);

/* ========================================================================
 * Bootstrap: carousel.js v3.3.7
 * http://getbootstrap.com/javascript/#carousel
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // CAROUSEL CLASS DEFINITION
  // =========================

  var Carousel = function (element, options) {
    this.$element    = $(element)
    this.$indicators = this.$element.find('.carousel-indicators')
    this.options     = options
    this.paused      = null
    this.sliding     = null
    this.interval    = null
    this.$active     = null
    this.$items      = null

    this.options.keyboard && this.$element.on('keydown.bs.carousel', $.proxy(this.keydown, this))

    this.options.pause == 'hover' && !('ontouchstart' in document.documentElement) && this.$element
      .on('mouseenter.bs.carousel', $.proxy(this.pause, this))
      .on('mouseleave.bs.carousel', $.proxy(this.cycle, this))
  }

  Carousel.VERSION  = '3.3.7'

  Carousel.TRANSITION_DURATION = 600

  Carousel.DEFAULTS = {
    interval: 5000,
    pause: 'hover',
    wrap: true,
    keyboard: true
  }

  Carousel.prototype.keydown = function (e) {
    if (/input|textarea/i.test(e.target.tagName)) return
    switch (e.which) {
      case 37: this.prev(); break
      case 39: this.next(); break
      default: return
    }

    e.preventDefault()
  }

  Carousel.prototype.cycle = function (e) {
    e || (this.paused = false)

    this.interval && clearInterval(this.interval)

    this.options.interval
      && !this.paused
      && (this.interval = setInterval($.proxy(this.next, this), this.options.interval))

    return this
  }

  Carousel.prototype.getItemIndex = function (item) {
    this.$items = item.parent().children('.item')
    return this.$items.index(item || this.$active)
  }

  Carousel.prototype.getItemForDirection = function (direction, active) {
    var activeIndex = this.getItemIndex(active)
    var willWrap = (direction == 'prev' && activeIndex === 0)
                || (direction == 'next' && activeIndex == (this.$items.length - 1))
    if (willWrap && !this.options.wrap) return active
    var delta = direction == 'prev' ? -1 : 1
    var itemIndex = (activeIndex + delta) % this.$items.length
    return this.$items.eq(itemIndex)
  }

  Carousel.prototype.to = function (pos) {
    var that        = this
    var activeIndex = this.getItemIndex(this.$active = this.$element.find('.item.active'))

    if (pos > (this.$items.length - 1) || pos < 0) return

    if (this.sliding)       return this.$element.one('slid.bs.carousel', function () { that.to(pos) }) // yes, "slid"
    if (activeIndex == pos) return this.pause().cycle()

    return this.slide(pos > activeIndex ? 'next' : 'prev', this.$items.eq(pos))
  }

  Carousel.prototype.pause = function (e) {
    e || (this.paused = true)

    if (this.$element.find('.next, .prev').length && $.support.transition) {
      this.$element.trigger($.support.transition.end)
      this.cycle(true)
    }

    this.interval = clearInterval(this.interval)

    return this
  }

  Carousel.prototype.next = function () {
    if (this.sliding) return
    return this.slide('next')
  }

  Carousel.prototype.prev = function () {
    if (this.sliding) return
    return this.slide('prev')
  }

  Carousel.prototype.slide = function (type, next) {
    var $active   = this.$element.find('.item.active')
    var $next     = next || this.getItemForDirection(type, $active)
    var isCycling = this.interval
    var direction = type == 'next' ? 'left' : 'right'
    var that      = this

    if ($next.hasClass('active')) return (this.sliding = false)

    var relatedTarget = $next[0]
    var slideEvent = $.Event('slide.bs.carousel', {
      relatedTarget: relatedTarget,
      direction: direction
    })
    this.$element.trigger(slideEvent)
    if (slideEvent.isDefaultPrevented()) return

    this.sliding = true

    isCycling && this.pause()

    if (this.$indicators.length) {
      this.$indicators.find('.active').removeClass('active')
      var $nextIndicator = $(this.$indicators.children()[this.getItemIndex($next)])
      $nextIndicator && $nextIndicator.addClass('active')
    }

    var slidEvent = $.Event('slid.bs.carousel', { relatedTarget: relatedTarget, direction: direction }) // yes, "slid"
    if ($.support.transition && this.$element.hasClass('slide')) {
      $next.addClass(type)
      $next[0].offsetWidth // force reflow
      $active.addClass(direction)
      $next.addClass(direction)
      $active
        .one('bsTransitionEnd', function () {
          $next.removeClass([type, direction].join(' ')).addClass('active')
          $active.removeClass(['active', direction].join(' '))
          that.sliding = false
          setTimeout(function () {
            that.$element.trigger(slidEvent)
          }, 0)
        })
        .emulateTransitionEnd(Carousel.TRANSITION_DURATION)
    } else {
      $active.removeClass('active')
      $next.addClass('active')
      this.sliding = false
      this.$element.trigger(slidEvent)
    }

    isCycling && this.cycle()

    return this
  }


  // CAROUSEL PLUGIN DEFINITION
  // ==========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.carousel')
      var options = $.extend({}, Carousel.DEFAULTS, $this.data(), typeof option == 'object' && option)
      var action  = typeof option == 'string' ? option : options.slide

      if (!data) $this.data('bs.carousel', (data = new Carousel(this, options)))
      if (typeof option == 'number') data.to(option)
      else if (action) data[action]()
      else if (options.interval) data.pause().cycle()
    })
  }

  var old = $.fn.carousel

  $.fn.carousel             = Plugin
  $.fn.carousel.Constructor = Carousel


  // CAROUSEL NO CONFLICT
  // ====================

  $.fn.carousel.noConflict = function () {
    $.fn.carousel = old
    return this
  }


  // CAROUSEL DATA-API
  // =================

  var clickHandler = function (e) {
    var href
    var $this   = $(this)
    var $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')) // strip for ie7
    if (!$target.hasClass('carousel')) return
    var options = $.extend({}, $target.data(), $this.data())
    var slideIndex = $this.attr('data-slide-to')
    if (slideIndex) options.interval = false

    Plugin.call($target, options)

    if (slideIndex) {
      $target.data('bs.carousel').to(slideIndex)
    }

    e.preventDefault()
  }

  $(document)
    .on('click.bs.carousel.data-api', '[data-slide]', clickHandler)
    .on('click.bs.carousel.data-api', '[data-slide-to]', clickHandler)

  $(window).on('load', function () {
    $('[data-ride="carousel"]').each(function () {
      var $carousel = $(this)
      Plugin.call($carousel, $carousel.data())
    })
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: collapse.js v3.3.7
 * http://getbootstrap.com/javascript/#collapse
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */

/* jshint latedef: false */

+function ($) {
  'use strict';

  // COLLAPSE PUBLIC CLASS DEFINITION
  // ================================

  var Collapse = function (element, options) {
    this.$element      = $(element)
    this.options       = $.extend({}, Collapse.DEFAULTS, options)
    this.$trigger      = $('[data-toggle="collapse"][href="#' + element.id + '"],' +
                           '[data-toggle="collapse"][data-target="#' + element.id + '"]')
    this.transitioning = null

    if (this.options.parent) {
      this.$parent = this.getParent()
    } else {
      this.addAriaAndCollapsedClass(this.$element, this.$trigger)
    }

    if (this.options.toggle) this.toggle()
  }

  Collapse.VERSION  = '3.3.7'

  Collapse.TRANSITION_DURATION = 350

  Collapse.DEFAULTS = {
    toggle: true
  }

  Collapse.prototype.dimension = function () {
    var hasWidth = this.$element.hasClass('width')
    return hasWidth ? 'width' : 'height'
  }

  Collapse.prototype.show = function () {
    if (this.transitioning || this.$element.hasClass('in')) return

    var activesData
    var actives = this.$parent && this.$parent.children('.panel').children('.in, .collapsing')

    if (actives && actives.length) {
      activesData = actives.data('bs.collapse')
      if (activesData && activesData.transitioning) return
    }

    var startEvent = $.Event('show.bs.collapse')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    if (actives && actives.length) {
      Plugin.call(actives, 'hide')
      activesData || actives.data('bs.collapse', null)
    }

    var dimension = this.dimension()

    this.$element
      .removeClass('collapse')
      .addClass('collapsing')[dimension](0)
      .attr('aria-expanded', true)

    this.$trigger
      .removeClass('collapsed')
      .attr('aria-expanded', true)

    this.transitioning = 1

    var complete = function () {
      this.$element
        .removeClass('collapsing')
        .addClass('collapse in')[dimension]('')
      this.transitioning = 0
      this.$element
        .trigger('shown.bs.collapse')
    }

    if (!$.support.transition) return complete.call(this)

    var scrollSize = $.camelCase(['scroll', dimension].join('-'))

    this.$element
      .one('bsTransitionEnd', $.proxy(complete, this))
      .emulateTransitionEnd(Collapse.TRANSITION_DURATION)[dimension](this.$element[0][scrollSize])
  }

  Collapse.prototype.hide = function () {
    if (this.transitioning || !this.$element.hasClass('in')) return

    var startEvent = $.Event('hide.bs.collapse')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return

    var dimension = this.dimension()

    this.$element[dimension](this.$element[dimension]())[0].offsetHeight

    this.$element
      .addClass('collapsing')
      .removeClass('collapse in')
      .attr('aria-expanded', false)

    this.$trigger
      .addClass('collapsed')
      .attr('aria-expanded', false)

    this.transitioning = 1

    var complete = function () {
      this.transitioning = 0
      this.$element
        .removeClass('collapsing')
        .addClass('collapse')
        .trigger('hidden.bs.collapse')
    }

    if (!$.support.transition) return complete.call(this)

    this.$element
      [dimension](0)
      .one('bsTransitionEnd', $.proxy(complete, this))
      .emulateTransitionEnd(Collapse.TRANSITION_DURATION)
  }

  Collapse.prototype.toggle = function () {
    this[this.$element.hasClass('in') ? 'hide' : 'show']()
  }

  Collapse.prototype.getParent = function () {
    return $(this.options.parent)
      .find('[data-toggle="collapse"][data-parent="' + this.options.parent + '"]')
      .each($.proxy(function (i, element) {
        var $element = $(element)
        this.addAriaAndCollapsedClass(getTargetFromTrigger($element), $element)
      }, this))
      .end()
  }

  Collapse.prototype.addAriaAndCollapsedClass = function ($element, $trigger) {
    var isOpen = $element.hasClass('in')

    $element.attr('aria-expanded', isOpen)
    $trigger
      .toggleClass('collapsed', !isOpen)
      .attr('aria-expanded', isOpen)
  }

  function getTargetFromTrigger($trigger) {
    var href
    var target = $trigger.attr('data-target')
      || (href = $trigger.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '') // strip for ie7

    return $(target)
  }


  // COLLAPSE PLUGIN DEFINITION
  // ==========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.collapse')
      var options = $.extend({}, Collapse.DEFAULTS, $this.data(), typeof option == 'object' && option)

      if (!data && options.toggle && /show|hide/.test(option)) options.toggle = false
      if (!data) $this.data('bs.collapse', (data = new Collapse(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.collapse

  $.fn.collapse             = Plugin
  $.fn.collapse.Constructor = Collapse


  // COLLAPSE NO CONFLICT
  // ====================

  $.fn.collapse.noConflict = function () {
    $.fn.collapse = old
    return this
  }


  // COLLAPSE DATA-API
  // =================

  $(document).on('click.bs.collapse.data-api', '[data-toggle="collapse"]', function (e) {
    var $this   = $(this)

    if (!$this.attr('data-target')) e.preventDefault()

    var $target = getTargetFromTrigger($this)
    var data    = $target.data('bs.collapse')
    var option  = data ? 'toggle' : $this.data()

    Plugin.call($target, option)
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: dropdown.js v3.3.7
 * http://getbootstrap.com/javascript/#dropdowns
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // DROPDOWN CLASS DEFINITION
  // =========================

  var backdrop = '.dropdown-backdrop'
  var toggle   = '[data-toggle="dropdown"]'
  var Dropdown = function (element) {
    $(element).on('click.bs.dropdown', this.toggle)
  }

  Dropdown.VERSION = '3.3.7'

  function getParent($this) {
    var selector = $this.attr('data-target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
    }

    var $parent = selector && $(selector)

    return $parent && $parent.length ? $parent : $this.parent()
  }

  function clearMenus(e) {
    if (e && e.which === 3) return
    $(backdrop).remove()
    $(toggle).each(function () {
      var $this         = $(this)
      var $parent       = getParent($this)
      var relatedTarget = { relatedTarget: this }

      if (!$parent.hasClass('open')) return

      if (e && e.type == 'click' && /input|textarea/i.test(e.target.tagName) && $.contains($parent[0], e.target)) return

      $parent.trigger(e = $.Event('hide.bs.dropdown', relatedTarget))

      if (e.isDefaultPrevented()) return

      $this.attr('aria-expanded', 'false')
      $parent.removeClass('open').trigger($.Event('hidden.bs.dropdown', relatedTarget))
    })
  }

  Dropdown.prototype.toggle = function (e) {
    var $this = $(this)

    if ($this.is('.disabled, :disabled')) return

    var $parent  = getParent($this)
    var isActive = $parent.hasClass('open')

    clearMenus()

    if (!isActive) {
      if ('ontouchstart' in document.documentElement && !$parent.closest('.navbar-nav').length) {
        // if mobile we use a backdrop because click events don't delegate
        $(document.createElement('div'))
          .addClass('dropdown-backdrop')
          .insertAfter($(this))
          .on('click', clearMenus)
      }

      var relatedTarget = { relatedTarget: this }
      $parent.trigger(e = $.Event('show.bs.dropdown', relatedTarget))

      if (e.isDefaultPrevented()) return

      $this
        .trigger('focus')
        .attr('aria-expanded', 'true')

      $parent
        .toggleClass('open')
        .trigger($.Event('shown.bs.dropdown', relatedTarget))
    }

    return false
  }

  Dropdown.prototype.keydown = function (e) {
    if (!/(38|40|27|32)/.test(e.which) || /input|textarea/i.test(e.target.tagName)) return

    var $this = $(this)

    e.preventDefault()
    e.stopPropagation()

    if ($this.is('.disabled, :disabled')) return

    var $parent  = getParent($this)
    var isActive = $parent.hasClass('open')

    if (!isActive && e.which != 27 || isActive && e.which == 27) {
      if (e.which == 27) $parent.find(toggle).trigger('focus')
      return $this.trigger('click')
    }

    var desc = ' li:not(.disabled):visible a'
    var $items = $parent.find('.dropdown-menu' + desc)

    if (!$items.length) return

    var index = $items.index(e.target)

    if (e.which == 38 && index > 0)                 index--         // up
    if (e.which == 40 && index < $items.length - 1) index++         // down
    if (!~index)                                    index = 0

    $items.eq(index).trigger('focus')
  }


  // DROPDOWN PLUGIN DEFINITION
  // ==========================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.dropdown')

      if (!data) $this.data('bs.dropdown', (data = new Dropdown(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }

  var old = $.fn.dropdown

  $.fn.dropdown             = Plugin
  $.fn.dropdown.Constructor = Dropdown


  // DROPDOWN NO CONFLICT
  // ====================

  $.fn.dropdown.noConflict = function () {
    $.fn.dropdown = old
    return this
  }


  // APPLY TO STANDARD DROPDOWN ELEMENTS
  // ===================================

  $(document)
    .on('click.bs.dropdown.data-api', clearMenus)
    .on('click.bs.dropdown.data-api', '.dropdown form', function (e) { e.stopPropagation() })
    .on('click.bs.dropdown.data-api', toggle, Dropdown.prototype.toggle)
    .on('keydown.bs.dropdown.data-api', toggle, Dropdown.prototype.keydown)
    .on('keydown.bs.dropdown.data-api', '.dropdown-menu', Dropdown.prototype.keydown)

}(jQuery);

/* ========================================================================
 * Bootstrap: modal.js v3.3.7
 * http://getbootstrap.com/javascript/#modals
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // MODAL CLASS DEFINITION
  // ======================

  var Modal = function (element, options) {
    this.options             = options
    this.$body               = $(document.body)
    this.$element            = $(element)
    this.$dialog             = this.$element.find('.modal-dialog')
    this.$backdrop           = null
    this.isShown             = null
    this.originalBodyPad     = null
    this.scrollbarWidth      = 0
    this.ignoreBackdropClick = false

    if (this.options.remote) {
      this.$element
        .find('.modal-content')
        .load(this.options.remote, $.proxy(function () {
          this.$element.trigger('loaded.bs.modal')
        }, this))
    }
  }

  Modal.VERSION  = '3.3.7'

  Modal.TRANSITION_DURATION = 300
  Modal.BACKDROP_TRANSITION_DURATION = 150

  Modal.DEFAULTS = {
    backdrop: true,
    keyboard: true,
    show: true
  }

  Modal.prototype.toggle = function (_relatedTarget) {
    return this.isShown ? this.hide() : this.show(_relatedTarget)
  }

  Modal.prototype.show = function (_relatedTarget) {
    var that = this
    var e    = $.Event('show.bs.modal', { relatedTarget: _relatedTarget })

    this.$element.trigger(e)

    if (this.isShown || e.isDefaultPrevented()) return

    this.isShown = true

    this.checkScrollbar()
    this.setScrollbar()
    this.$body.addClass('modal-open')

    this.escape()
    this.resize()

    this.$element.on('click.dismiss.bs.modal', '[data-dismiss="modal"]', $.proxy(this.hide, this))

    this.$dialog.on('mousedown.dismiss.bs.modal', function () {
      that.$element.one('mouseup.dismiss.bs.modal', function (e) {
        if ($(e.target).is(that.$element)) that.ignoreBackdropClick = true
      })
    })

    this.backdrop(function () {
      var transition = $.support.transition && that.$element.hasClass('fade')

      if (!that.$element.parent().length) {
        that.$element.appendTo(that.$body) // don't move modals dom position
      }

      that.$element
        .show()
        .scrollTop(0)

      that.adjustDialog()

      if (transition) {
        that.$element[0].offsetWidth // force reflow
      }

      that.$element.addClass('in')

      that.enforceFocus()

      var e = $.Event('shown.bs.modal', { relatedTarget: _relatedTarget })

      transition ?
        that.$dialog // wait for modal to slide in
          .one('bsTransitionEnd', function () {
            that.$element.trigger('focus').trigger(e)
          })
          .emulateTransitionEnd(Modal.TRANSITION_DURATION) :
        that.$element.trigger('focus').trigger(e)
    })
  }

  Modal.prototype.hide = function (e) {
    if (e) e.preventDefault()

    e = $.Event('hide.bs.modal')

    this.$element.trigger(e)

    if (!this.isShown || e.isDefaultPrevented()) return

    this.isShown = false

    this.escape()
    this.resize()

    $(document).off('focusin.bs.modal')

    this.$element
      .removeClass('in')
      .off('click.dismiss.bs.modal')
      .off('mouseup.dismiss.bs.modal')

    this.$dialog.off('mousedown.dismiss.bs.modal')

    $.support.transition && this.$element.hasClass('fade') ?
      this.$element
        .one('bsTransitionEnd', $.proxy(this.hideModal, this))
        .emulateTransitionEnd(Modal.TRANSITION_DURATION) :
      this.hideModal()
  }

  Modal.prototype.enforceFocus = function () {
    $(document)
      .off('focusin.bs.modal') // guard against infinite focus loop
      .on('focusin.bs.modal', $.proxy(function (e) {
        if (document !== e.target &&
            this.$element[0] !== e.target &&
            !this.$element.has(e.target).length) {
          this.$element.trigger('focus')
        }
      }, this))
  }

  Modal.prototype.escape = function () {
    if (this.isShown && this.options.keyboard) {
      this.$element.on('keydown.dismiss.bs.modal', $.proxy(function (e) {
        e.which == 27 && this.hide()
      }, this))
    } else if (!this.isShown) {
      this.$element.off('keydown.dismiss.bs.modal')
    }
  }

  Modal.prototype.resize = function () {
    if (this.isShown) {
      $(window).on('resize.bs.modal', $.proxy(this.handleUpdate, this))
    } else {
      $(window).off('resize.bs.modal')
    }
  }

  Modal.prototype.hideModal = function () {
    var that = this
    this.$element.hide()
    this.backdrop(function () {
      that.$body.removeClass('modal-open')
      that.resetAdjustments()
      that.resetScrollbar()
      that.$element.trigger('hidden.bs.modal')
    })
  }

  Modal.prototype.removeBackdrop = function () {
    this.$backdrop && this.$backdrop.remove()
    this.$backdrop = null
  }

  Modal.prototype.backdrop = function (callback) {
    var that = this
    var animate = this.$element.hasClass('fade') ? 'fade' : ''

    if (this.isShown && this.options.backdrop) {
      var doAnimate = $.support.transition && animate

      this.$backdrop = $(document.createElement('div'))
        .addClass('modal-backdrop ' + animate)
        .appendTo(this.$body)

      this.$element.on('click.dismiss.bs.modal', $.proxy(function (e) {
        if (this.ignoreBackdropClick) {
          this.ignoreBackdropClick = false
          return
        }
        if (e.target !== e.currentTarget) return
        this.options.backdrop == 'static'
          ? this.$element[0].focus()
          : this.hide()
      }, this))

      if (doAnimate) this.$backdrop[0].offsetWidth // force reflow

      this.$backdrop.addClass('in')

      if (!callback) return

      doAnimate ?
        this.$backdrop
          .one('bsTransitionEnd', callback)
          .emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) :
        callback()

    } else if (!this.isShown && this.$backdrop) {
      this.$backdrop.removeClass('in')

      var callbackRemove = function () {
        that.removeBackdrop()
        callback && callback()
      }
      $.support.transition && this.$element.hasClass('fade') ?
        this.$backdrop
          .one('bsTransitionEnd', callbackRemove)
          .emulateTransitionEnd(Modal.BACKDROP_TRANSITION_DURATION) :
        callbackRemove()

    } else if (callback) {
      callback()
    }
  }

  // these following methods are used to handle overflowing modals

  Modal.prototype.handleUpdate = function () {
    this.adjustDialog()
  }

  Modal.prototype.adjustDialog = function () {
    var modalIsOverflowing = this.$element[0].scrollHeight > document.documentElement.clientHeight

    this.$element.css({
      paddingLeft:  !this.bodyIsOverflowing && modalIsOverflowing ? this.scrollbarWidth : '',
      paddingRight: this.bodyIsOverflowing && !modalIsOverflowing ? this.scrollbarWidth : ''
    })
  }

  Modal.prototype.resetAdjustments = function () {
    this.$element.css({
      paddingLeft: '',
      paddingRight: ''
    })
  }

  Modal.prototype.checkScrollbar = function () {
    var fullWindowWidth = window.innerWidth
    if (!fullWindowWidth) { // workaround for missing window.innerWidth in IE8
      var documentElementRect = document.documentElement.getBoundingClientRect()
      fullWindowWidth = documentElementRect.right - Math.abs(documentElementRect.left)
    }
    this.bodyIsOverflowing = document.body.clientWidth < fullWindowWidth
    this.scrollbarWidth = this.measureScrollbar()
  }

  Modal.prototype.setScrollbar = function () {
    var bodyPad = parseInt((this.$body.css('padding-right') || 0), 10)
    this.originalBodyPad = document.body.style.paddingRight || ''
    if (this.bodyIsOverflowing) this.$body.css('padding-right', bodyPad + this.scrollbarWidth)
  }

  Modal.prototype.resetScrollbar = function () {
    this.$body.css('padding-right', this.originalBodyPad)
  }

  Modal.prototype.measureScrollbar = function () { // thx walsh
    var scrollDiv = document.createElement('div')
    scrollDiv.className = 'modal-scrollbar-measure'
    this.$body.append(scrollDiv)
    var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth
    this.$body[0].removeChild(scrollDiv)
    return scrollbarWidth
  }


  // MODAL PLUGIN DEFINITION
  // =======================

  function Plugin(option, _relatedTarget) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.modal')
      var options = $.extend({}, Modal.DEFAULTS, $this.data(), typeof option == 'object' && option)

      if (!data) $this.data('bs.modal', (data = new Modal(this, options)))
      if (typeof option == 'string') data[option](_relatedTarget)
      else if (options.show) data.show(_relatedTarget)
    })
  }

  var old = $.fn.modal

  $.fn.modal             = Plugin
  $.fn.modal.Constructor = Modal


  // MODAL NO CONFLICT
  // =================

  $.fn.modal.noConflict = function () {
    $.fn.modal = old
    return this
  }


  // MODAL DATA-API
  // ==============

  $(document).on('click.bs.modal.data-api', '[data-toggle="modal"]', function (e) {
    var $this   = $(this)
    var href    = $this.attr('href')
    var $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))) // strip for ie7
    var option  = $target.data('bs.modal') ? 'toggle' : $.extend({ remote: !/#/.test(href) && href }, $target.data(), $this.data())

    if ($this.is('a')) e.preventDefault()

    $target.one('show.bs.modal', function (showEvent) {
      if (showEvent.isDefaultPrevented()) return // only register focus restorer if modal will actually get shown
      $target.one('hidden.bs.modal', function () {
        $this.is(':visible') && $this.trigger('focus')
      })
    })
    Plugin.call($target, option, this)
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: tooltip.js v3.3.7
 * http://getbootstrap.com/javascript/#tooltip
 * Inspired by the original jQuery.tipsy by Jason Frame
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // TOOLTIP PUBLIC CLASS DEFINITION
  // ===============================

  var Tooltip = function (element, options) {
    this.type       = null
    this.options    = null
    this.enabled    = null
    this.timeout    = null
    this.hoverState = null
    this.$element   = null
    this.inState    = null

    this.init('tooltip', element, options)
  }

  Tooltip.VERSION  = '3.3.7'

  Tooltip.TRANSITION_DURATION = 150

  Tooltip.DEFAULTS = {
    animation: true,
    placement: 'top',
    selector: false,
    template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
    trigger: 'hover focus',
    title: '',
    delay: 0,
    html: false,
    container: false,
    viewport: {
      selector: 'body',
      padding: 0
    }
  }

  Tooltip.prototype.init = function (type, element, options) {
    this.enabled   = true
    this.type      = type
    this.$element  = $(element)
    this.options   = this.getOptions(options)
    this.$viewport = this.options.viewport && $($.isFunction(this.options.viewport) ? this.options.viewport.call(this, this.$element) : (this.options.viewport.selector || this.options.viewport))
    this.inState   = { click: false, hover: false, focus: false }

    if (this.$element[0] instanceof document.constructor && !this.options.selector) {
      throw new Error('`selector` option must be specified when initializing ' + this.type + ' on the window.document object!')
    }

    var triggers = this.options.trigger.split(' ')

    for (var i = triggers.length; i--;) {
      var trigger = triggers[i]

      if (trigger == 'click') {
        this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this))
      } else if (trigger != 'manual') {
        var eventIn  = trigger == 'hover' ? 'mouseenter' : 'focusin'
        var eventOut = trigger == 'hover' ? 'mouseleave' : 'focusout'

        this.$element.on(eventIn  + '.' + this.type, this.options.selector, $.proxy(this.enter, this))
        this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this))
      }
    }

    this.options.selector ?
      (this._options = $.extend({}, this.options, { trigger: 'manual', selector: '' })) :
      this.fixTitle()
  }

  Tooltip.prototype.getDefaults = function () {
    return Tooltip.DEFAULTS
  }

  Tooltip.prototype.getOptions = function (options) {
    options = $.extend({}, this.getDefaults(), this.$element.data(), options)

    if (options.delay && typeof options.delay == 'number') {
      options.delay = {
        show: options.delay,
        hide: options.delay
      }
    }

    return options
  }

  Tooltip.prototype.getDelegateOptions = function () {
    var options  = {}
    var defaults = this.getDefaults()

    this._options && $.each(this._options, function (key, value) {
      if (defaults[key] != value) options[key] = value
    })

    return options
  }

  Tooltip.prototype.enter = function (obj) {
    var self = obj instanceof this.constructor ?
      obj : $(obj.currentTarget).data('bs.' + this.type)

    if (!self) {
      self = new this.constructor(obj.currentTarget, this.getDelegateOptions())
      $(obj.currentTarget).data('bs.' + this.type, self)
    }

    if (obj instanceof $.Event) {
      self.inState[obj.type == 'focusin' ? 'focus' : 'hover'] = true
    }

    if (self.tip().hasClass('in') || self.hoverState == 'in') {
      self.hoverState = 'in'
      return
    }

    clearTimeout(self.timeout)

    self.hoverState = 'in'

    if (!self.options.delay || !self.options.delay.show) return self.show()

    self.timeout = setTimeout(function () {
      if (self.hoverState == 'in') self.show()
    }, self.options.delay.show)
  }

  Tooltip.prototype.isInStateTrue = function () {
    for (var key in this.inState) {
      if (this.inState[key]) return true
    }

    return false
  }

  Tooltip.prototype.leave = function (obj) {
    var self = obj instanceof this.constructor ?
      obj : $(obj.currentTarget).data('bs.' + this.type)

    if (!self) {
      self = new this.constructor(obj.currentTarget, this.getDelegateOptions())
      $(obj.currentTarget).data('bs.' + this.type, self)
    }

    if (obj instanceof $.Event) {
      self.inState[obj.type == 'focusout' ? 'focus' : 'hover'] = false
    }

    if (self.isInStateTrue()) return

    clearTimeout(self.timeout)

    self.hoverState = 'out'

    if (!self.options.delay || !self.options.delay.hide) return self.hide()

    self.timeout = setTimeout(function () {
      if (self.hoverState == 'out') self.hide()
    }, self.options.delay.hide)
  }

  Tooltip.prototype.show = function () {
    var e = $.Event('show.bs.' + this.type)

    if (this.hasContent() && this.enabled) {
      this.$element.trigger(e)

      var inDom = $.contains(this.$element[0].ownerDocument.documentElement, this.$element[0])
      if (e.isDefaultPrevented() || !inDom) return
      var that = this

      var $tip = this.tip()

      var tipId = this.getUID(this.type)

      this.setContent()
      $tip.attr('id', tipId)
      this.$element.attr('aria-describedby', tipId)

      if (this.options.animation) $tip.addClass('fade')

      var placement = typeof this.options.placement == 'function' ?
        this.options.placement.call(this, $tip[0], this.$element[0]) :
        this.options.placement

      var autoToken = /\s?auto?\s?/i
      var autoPlace = autoToken.test(placement)
      if (autoPlace) placement = placement.replace(autoToken, '') || 'top'

      $tip
        .detach()
        .css({ top: 0, left: 0, display: 'block' })
        .addClass(placement)
        .data('bs.' + this.type, this)

      this.options.container ? $tip.appendTo(this.options.container) : $tip.insertAfter(this.$element)
      this.$element.trigger('inserted.bs.' + this.type)

      var pos          = this.getPosition()
      var actualWidth  = $tip[0].offsetWidth
      var actualHeight = $tip[0].offsetHeight

      if (autoPlace) {
        var orgPlacement = placement
        var viewportDim = this.getPosition(this.$viewport)

        placement = placement == 'bottom' && pos.bottom + actualHeight > viewportDim.bottom ? 'top'    :
                    placement == 'top'    && pos.top    - actualHeight < viewportDim.top    ? 'bottom' :
                    placement == 'right'  && pos.right  + actualWidth  > viewportDim.width  ? 'left'   :
                    placement == 'left'   && pos.left   - actualWidth  < viewportDim.left   ? 'right'  :
                    placement

        $tip
          .removeClass(orgPlacement)
          .addClass(placement)
      }

      var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight)

      this.applyPlacement(calculatedOffset, placement)

      var complete = function () {
        var prevHoverState = that.hoverState
        that.$element.trigger('shown.bs.' + that.type)
        that.hoverState = null

        if (prevHoverState == 'out') that.leave(that)
      }

      $.support.transition && this.$tip.hasClass('fade') ?
        $tip
          .one('bsTransitionEnd', complete)
          .emulateTransitionEnd(Tooltip.TRANSITION_DURATION) :
        complete()
    }
  }

  Tooltip.prototype.applyPlacement = function (offset, placement) {
    var $tip   = this.tip()
    var width  = $tip[0].offsetWidth
    var height = $tip[0].offsetHeight

    // manually read margins because getBoundingClientRect includes difference
    var marginTop = parseInt($tip.css('margin-top'), 10)
    var marginLeft = parseInt($tip.css('margin-left'), 10)

    // we must check for NaN for ie 8/9
    if (isNaN(marginTop))  marginTop  = 0
    if (isNaN(marginLeft)) marginLeft = 0

    offset.top  += marginTop
    offset.left += marginLeft

    // $.fn.offset doesn't round pixel values
    // so we use setOffset directly with our own function B-0
    $.offset.setOffset($tip[0], $.extend({
      using: function (props) {
        $tip.css({
          top: Math.round(props.top),
          left: Math.round(props.left)
        })
      }
    }, offset), 0)

    $tip.addClass('in')

    // check to see if placing tip in new offset caused the tip to resize itself
    var actualWidth  = $tip[0].offsetWidth
    var actualHeight = $tip[0].offsetHeight

    if (placement == 'top' && actualHeight != height) {
      offset.top = offset.top + height - actualHeight
    }

    var delta = this.getViewportAdjustedDelta(placement, offset, actualWidth, actualHeight)

    if (delta.left) offset.left += delta.left
    else offset.top += delta.top

    var isVertical          = /top|bottom/.test(placement)
    var arrowDelta          = isVertical ? delta.left * 2 - width + actualWidth : delta.top * 2 - height + actualHeight
    var arrowOffsetPosition = isVertical ? 'offsetWidth' : 'offsetHeight'

    $tip.offset(offset)
    this.replaceArrow(arrowDelta, $tip[0][arrowOffsetPosition], isVertical)
  }

  Tooltip.prototype.replaceArrow = function (delta, dimension, isVertical) {
    this.arrow()
      .css(isVertical ? 'left' : 'top', 50 * (1 - delta / dimension) + '%')
      .css(isVertical ? 'top' : 'left', '')
  }

  Tooltip.prototype.setContent = function () {
    var $tip  = this.tip()
    var title = this.getTitle()

    $tip.find('.tooltip-inner')[this.options.html ? 'html' : 'text'](title)
    $tip.removeClass('fade in top bottom left right')
  }

  Tooltip.prototype.hide = function (callback) {
    var that = this
    var $tip = $(this.$tip)
    var e    = $.Event('hide.bs.' + this.type)

    function complete() {
      if (that.hoverState != 'in') $tip.detach()
      if (that.$element) { // TODO: Check whether guarding this code with this `if` is really necessary.
        that.$element
          .removeAttr('aria-describedby')
          .trigger('hidden.bs.' + that.type)
      }
      callback && callback()
    }

    this.$element.trigger(e)

    if (e.isDefaultPrevented()) return

    $tip.removeClass('in')

    $.support.transition && $tip.hasClass('fade') ?
      $tip
        .one('bsTransitionEnd', complete)
        .emulateTransitionEnd(Tooltip.TRANSITION_DURATION) :
      complete()

    this.hoverState = null

    return this
  }

  Tooltip.prototype.fixTitle = function () {
    var $e = this.$element
    if ($e.attr('title') || typeof $e.attr('data-original-title') != 'string') {
      $e.attr('data-original-title', $e.attr('title') || '').attr('title', '')
    }
  }

  Tooltip.prototype.hasContent = function () {
    return this.getTitle()
  }

  Tooltip.prototype.getPosition = function ($element) {
    $element   = $element || this.$element

    var el     = $element[0]
    var isBody = el.tagName == 'BODY'

    var elRect    = el.getBoundingClientRect()
    if (elRect.width == null) {
      // width and height are missing in IE8, so compute them manually; see https://github.com/twbs/bootstrap/issues/14093
      elRect = $.extend({}, elRect, { width: elRect.right - elRect.left, height: elRect.bottom - elRect.top })
    }
    var isSvg = window.SVGElement && el instanceof window.SVGElement
    // Avoid using $.offset() on SVGs since it gives incorrect results in jQuery 3.
    // See https://github.com/twbs/bootstrap/issues/20280
    var elOffset  = isBody ? { top: 0, left: 0 } : (isSvg ? null : $element.offset())
    var scroll    = { scroll: isBody ? document.documentElement.scrollTop || document.body.scrollTop : $element.scrollTop() }
    var outerDims = isBody ? { width: $(window).width(), height: $(window).height() } : null

    return $.extend({}, elRect, scroll, outerDims, elOffset)
  }

  Tooltip.prototype.getCalculatedOffset = function (placement, pos, actualWidth, actualHeight) {
    return placement == 'bottom' ? { top: pos.top + pos.height,   left: pos.left + pos.width / 2 - actualWidth / 2 } :
           placement == 'top'    ? { top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2 } :
           placement == 'left'   ? { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth } :
        /* placement == 'right' */ { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width }

  }

  Tooltip.prototype.getViewportAdjustedDelta = function (placement, pos, actualWidth, actualHeight) {
    var delta = { top: 0, left: 0 }
    if (!this.$viewport) return delta

    var viewportPadding = this.options.viewport && this.options.viewport.padding || 0
    var viewportDimensions = this.getPosition(this.$viewport)

    if (/right|left/.test(placement)) {
      var topEdgeOffset    = pos.top - viewportPadding - viewportDimensions.scroll
      var bottomEdgeOffset = pos.top + viewportPadding - viewportDimensions.scroll + actualHeight
      if (topEdgeOffset < viewportDimensions.top) { // top overflow
        delta.top = viewportDimensions.top - topEdgeOffset
      } else if (bottomEdgeOffset > viewportDimensions.top + viewportDimensions.height) { // bottom overflow
        delta.top = viewportDimensions.top + viewportDimensions.height - bottomEdgeOffset
      }
    } else {
      var leftEdgeOffset  = pos.left - viewportPadding
      var rightEdgeOffset = pos.left + viewportPadding + actualWidth
      if (leftEdgeOffset < viewportDimensions.left) { // left overflow
        delta.left = viewportDimensions.left - leftEdgeOffset
      } else if (rightEdgeOffset > viewportDimensions.right) { // right overflow
        delta.left = viewportDimensions.left + viewportDimensions.width - rightEdgeOffset
      }
    }

    return delta
  }

  Tooltip.prototype.getTitle = function () {
    var title
    var $e = this.$element
    var o  = this.options

    title = $e.attr('data-original-title')
      || (typeof o.title == 'function' ? o.title.call($e[0]) :  o.title)

    return title
  }

  Tooltip.prototype.getUID = function (prefix) {
    do prefix += ~~(Math.random() * 1000000)
    while (document.getElementById(prefix))
    return prefix
  }

  Tooltip.prototype.tip = function () {
    if (!this.$tip) {
      this.$tip = $(this.options.template)
      if (this.$tip.length != 1) {
        throw new Error(this.type + ' `template` option must consist of exactly 1 top-level element!')
      }
    }
    return this.$tip
  }

  Tooltip.prototype.arrow = function () {
    return (this.$arrow = this.$arrow || this.tip().find('.tooltip-arrow'))
  }

  Tooltip.prototype.enable = function () {
    this.enabled = true
  }

  Tooltip.prototype.disable = function () {
    this.enabled = false
  }

  Tooltip.prototype.toggleEnabled = function () {
    this.enabled = !this.enabled
  }

  Tooltip.prototype.toggle = function (e) {
    var self = this
    if (e) {
      self = $(e.currentTarget).data('bs.' + this.type)
      if (!self) {
        self = new this.constructor(e.currentTarget, this.getDelegateOptions())
        $(e.currentTarget).data('bs.' + this.type, self)
      }
    }

    if (e) {
      self.inState.click = !self.inState.click
      if (self.isInStateTrue()) self.enter(self)
      else self.leave(self)
    } else {
      self.tip().hasClass('in') ? self.leave(self) : self.enter(self)
    }
  }

  Tooltip.prototype.destroy = function () {
    var that = this
    clearTimeout(this.timeout)
    this.hide(function () {
      that.$element.off('.' + that.type).removeData('bs.' + that.type)
      if (that.$tip) {
        that.$tip.detach()
      }
      that.$tip = null
      that.$arrow = null
      that.$viewport = null
      that.$element = null
    })
  }


  // TOOLTIP PLUGIN DEFINITION
  // =========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.tooltip')
      var options = typeof option == 'object' && option

      if (!data && /destroy|hide/.test(option)) return
      if (!data) $this.data('bs.tooltip', (data = new Tooltip(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.tooltip

  $.fn.tooltip             = Plugin
  $.fn.tooltip.Constructor = Tooltip


  // TOOLTIP NO CONFLICT
  // ===================

  $.fn.tooltip.noConflict = function () {
    $.fn.tooltip = old
    return this
  }

}(jQuery);

/* ========================================================================
 * Bootstrap: popover.js v3.3.7
 * http://getbootstrap.com/javascript/#popovers
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // POPOVER PUBLIC CLASS DEFINITION
  // ===============================

  var Popover = function (element, options) {
    this.init('popover', element, options)
  }

  if (!$.fn.tooltip) throw new Error('Popover requires tooltip.js')

  Popover.VERSION  = '3.3.7'

  Popover.DEFAULTS = $.extend({}, $.fn.tooltip.Constructor.DEFAULTS, {
    placement: 'right',
    trigger: 'click',
    content: '',
    template: '<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
  })


  // NOTE: POPOVER EXTENDS tooltip.js
  // ================================

  Popover.prototype = $.extend({}, $.fn.tooltip.Constructor.prototype)

  Popover.prototype.constructor = Popover

  Popover.prototype.getDefaults = function () {
    return Popover.DEFAULTS
  }

  Popover.prototype.setContent = function () {
    var $tip    = this.tip()
    var title   = this.getTitle()
    var content = this.getContent()

    $tip.find('.popover-title')[this.options.html ? 'html' : 'text'](title)
    $tip.find('.popover-content').children().detach().end()[ // we use append for html objects to maintain js events
      this.options.html ? (typeof content == 'string' ? 'html' : 'append') : 'text'
    ](content)

    $tip.removeClass('fade top bottom left right in')

    // IE8 doesn't accept hiding via the `:empty` pseudo selector, we have to do
    // this manually by checking the contents.
    if (!$tip.find('.popover-title').html()) $tip.find('.popover-title').hide()
  }

  Popover.prototype.hasContent = function () {
    return this.getTitle() || this.getContent()
  }

  Popover.prototype.getContent = function () {
    var $e = this.$element
    var o  = this.options

    return $e.attr('data-content')
      || (typeof o.content == 'function' ?
            o.content.call($e[0]) :
            o.content)
  }

  Popover.prototype.arrow = function () {
    return (this.$arrow = this.$arrow || this.tip().find('.arrow'))
  }


  // POPOVER PLUGIN DEFINITION
  // =========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.popover')
      var options = typeof option == 'object' && option

      if (!data && /destroy|hide/.test(option)) return
      if (!data) $this.data('bs.popover', (data = new Popover(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.popover

  $.fn.popover             = Plugin
  $.fn.popover.Constructor = Popover


  // POPOVER NO CONFLICT
  // ===================

  $.fn.popover.noConflict = function () {
    $.fn.popover = old
    return this
  }

}(jQuery);

/* ========================================================================
 * Bootstrap: scrollspy.js v3.3.7
 * http://getbootstrap.com/javascript/#scrollspy
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // SCROLLSPY CLASS DEFINITION
  // ==========================

  function ScrollSpy(element, options) {
    this.$body          = $(document.body)
    this.$scrollElement = $(element).is(document.body) ? $(window) : $(element)
    this.options        = $.extend({}, ScrollSpy.DEFAULTS, options)
    this.selector       = (this.options.target || '') + ' .nav li > a'
    this.offsets        = []
    this.targets        = []
    this.activeTarget   = null
    this.scrollHeight   = 0

    this.$scrollElement.on('scroll.bs.scrollspy', $.proxy(this.process, this))
    this.refresh()
    this.process()
  }

  ScrollSpy.VERSION  = '3.3.7'

  ScrollSpy.DEFAULTS = {
    offset: 10
  }

  ScrollSpy.prototype.getScrollHeight = function () {
    return this.$scrollElement[0].scrollHeight || Math.max(this.$body[0].scrollHeight, document.documentElement.scrollHeight)
  }

  ScrollSpy.prototype.refresh = function () {
    var that          = this
    var offsetMethod  = 'offset'
    var offsetBase    = 0

    this.offsets      = []
    this.targets      = []
    this.scrollHeight = this.getScrollHeight()

    if (!$.isWindow(this.$scrollElement[0])) {
      offsetMethod = 'position'
      offsetBase   = this.$scrollElement.scrollTop()
    }

    this.$body
      .find(this.selector)
      .map(function () {
        var $el   = $(this)
        var href  = $el.data('target') || $el.attr('href')
        var $href = /^#./.test(href) && $(href)

        return ($href
          && $href.length
          && $href.is(':visible')
          && [[$href[offsetMethod]().top + offsetBase, href]]) || null
      })
      .sort(function (a, b) { return a[0] - b[0] })
      .each(function () {
        that.offsets.push(this[0])
        that.targets.push(this[1])
      })
  }

  ScrollSpy.prototype.process = function () {
    var scrollTop    = this.$scrollElement.scrollTop() + this.options.offset
    var scrollHeight = this.getScrollHeight()
    var maxScroll    = this.options.offset + scrollHeight - this.$scrollElement.height()
    var offsets      = this.offsets
    var targets      = this.targets
    var activeTarget = this.activeTarget
    var i

    if (this.scrollHeight != scrollHeight) {
      this.refresh()
    }

    if (scrollTop >= maxScroll) {
      return activeTarget != (i = targets[targets.length - 1]) && this.activate(i)
    }

    if (activeTarget && scrollTop < offsets[0]) {
      this.activeTarget = null
      return this.clear()
    }

    for (i = offsets.length; i--;) {
      activeTarget != targets[i]
        && scrollTop >= offsets[i]
        && (offsets[i + 1] === undefined || scrollTop < offsets[i + 1])
        && this.activate(targets[i])
    }
  }

  ScrollSpy.prototype.activate = function (target) {
    this.activeTarget = target

    this.clear()

    var selector = this.selector +
      '[data-target="' + target + '"],' +
      this.selector + '[href="' + target + '"]'

    var active = $(selector)
      .parents('li')
      .addClass('active')

    if (active.parent('.dropdown-menu').length) {
      active = active
        .closest('li.dropdown')
        .addClass('active')
    }

    active.trigger('activate.bs.scrollspy')
  }

  ScrollSpy.prototype.clear = function () {
    $(this.selector)
      .parentsUntil(this.options.target, '.active')
      .removeClass('active')
  }


  // SCROLLSPY PLUGIN DEFINITION
  // ===========================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.scrollspy')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.scrollspy', (data = new ScrollSpy(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.scrollspy

  $.fn.scrollspy             = Plugin
  $.fn.scrollspy.Constructor = ScrollSpy


  // SCROLLSPY NO CONFLICT
  // =====================

  $.fn.scrollspy.noConflict = function () {
    $.fn.scrollspy = old
    return this
  }


  // SCROLLSPY DATA-API
  // ==================

  $(window).on('load.bs.scrollspy.data-api', function () {
    $('[data-spy="scroll"]').each(function () {
      var $spy = $(this)
      Plugin.call($spy, $spy.data())
    })
  })

}(jQuery);

/* ========================================================================
 * Bootstrap: tab.js v3.3.7
 * http://getbootstrap.com/javascript/#tabs
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // TAB CLASS DEFINITION
  // ====================

  var Tab = function (element) {
    // jscs:disable requireDollarBeforejQueryAssignment
    this.element = $(element)
    // jscs:enable requireDollarBeforejQueryAssignment
  }

  Tab.VERSION = '3.3.7'

  Tab.TRANSITION_DURATION = 150

  Tab.prototype.show = function () {
    var $this    = this.element
    var $ul      = $this.closest('ul:not(.dropdown-menu)')
    var selector = $this.data('target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
    }

    if ($this.parent('li').hasClass('active')) return

    var $previous = $ul.find('.active:last a')
    var hideEvent = $.Event('hide.bs.tab', {
      relatedTarget: $this[0]
    })
    var showEvent = $.Event('show.bs.tab', {
      relatedTarget: $previous[0]
    })

    $previous.trigger(hideEvent)
    $this.trigger(showEvent)

    if (showEvent.isDefaultPrevented() || hideEvent.isDefaultPrevented()) return

    var $target = $(selector)

    this.activate($this.closest('li'), $ul)
    this.activate($target, $target.parent(), function () {
      $previous.trigger({
        type: 'hidden.bs.tab',
        relatedTarget: $this[0]
      })
      $this.trigger({
        type: 'shown.bs.tab',
        relatedTarget: $previous[0]
      })
    })
  }

  Tab.prototype.activate = function (element, container, callback) {
    var $active    = container.find('> .active')
    var transition = callback
      && $.support.transition
      && ($active.length && $active.hasClass('fade') || !!container.find('> .fade').length)

    function next() {
      $active
        .removeClass('active')
        .find('> .dropdown-menu > .active')
          .removeClass('active')
        .end()
        .find('[data-toggle="tab"]')
          .attr('aria-expanded', false)

      element
        .addClass('active')
        .find('[data-toggle="tab"]')
          .attr('aria-expanded', true)

      if (transition) {
        element[0].offsetWidth // reflow for transition
        element.addClass('in')
      } else {
        element.removeClass('fade')
      }

      if (element.parent('.dropdown-menu').length) {
        element
          .closest('li.dropdown')
            .addClass('active')
          .end()
          .find('[data-toggle="tab"]')
            .attr('aria-expanded', true)
      }

      callback && callback()
    }

    $active.length && transition ?
      $active
        .one('bsTransitionEnd', next)
        .emulateTransitionEnd(Tab.TRANSITION_DURATION) :
      next()

    $active.removeClass('in')
  }


  // TAB PLUGIN DEFINITION
  // =====================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.tab')

      if (!data) $this.data('bs.tab', (data = new Tab(this)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.tab

  $.fn.tab             = Plugin
  $.fn.tab.Constructor = Tab


  // TAB NO CONFLICT
  // ===============

  $.fn.tab.noConflict = function () {
    $.fn.tab = old
    return this
  }


  // TAB DATA-API
  // ============

  var clickHandler = function (e) {
    e.preventDefault()
    Plugin.call($(this), 'show')
  }

  $(document)
    .on('click.bs.tab.data-api', '[data-toggle="tab"]', clickHandler)
    .on('click.bs.tab.data-api', '[data-toggle="pill"]', clickHandler)

}(jQuery);

/* ========================================================================
 * Bootstrap: affix.js v3.3.7
 * http://getbootstrap.com/javascript/#affix
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+function ($) {
  'use strict';

  // AFFIX CLASS DEFINITION
  // ======================

  var Affix = function (element, options) {
    this.options = $.extend({}, Affix.DEFAULTS, options)

    this.$target = $(this.options.target)
      .on('scroll.bs.affix.data-api', $.proxy(this.checkPosition, this))
      .on('click.bs.affix.data-api',  $.proxy(this.checkPositionWithEventLoop, this))

    this.$element     = $(element)
    this.affixed      = null
    this.unpin        = null
    this.pinnedOffset = null

    this.checkPosition()
  }

  Affix.VERSION  = '3.3.7'

  Affix.RESET    = 'affix affix-top affix-bottom'

  Affix.DEFAULTS = {
    offset: 0,
    target: window
  }

  Affix.prototype.getState = function (scrollHeight, height, offsetTop, offsetBottom) {
    var scrollTop    = this.$target.scrollTop()
    var position     = this.$element.offset()
    var targetHeight = this.$target.height()

    if (offsetTop != null && this.affixed == 'top') return scrollTop < offsetTop ? 'top' : false

    if (this.affixed == 'bottom') {
      if (offsetTop != null) return (scrollTop + this.unpin <= position.top) ? false : 'bottom'
      return (scrollTop + targetHeight <= scrollHeight - offsetBottom) ? false : 'bottom'
    }

    var initializing   = this.affixed == null
    var colliderTop    = initializing ? scrollTop : position.top
    var colliderHeight = initializing ? targetHeight : height

    if (offsetTop != null && scrollTop <= offsetTop) return 'top'
    if (offsetBottom != null && (colliderTop + colliderHeight >= scrollHeight - offsetBottom)) return 'bottom'

    return false
  }

  Affix.prototype.getPinnedOffset = function () {
    if (this.pinnedOffset) return this.pinnedOffset
    this.$element.removeClass(Affix.RESET).addClass('affix')
    var scrollTop = this.$target.scrollTop()
    var position  = this.$element.offset()
    return (this.pinnedOffset = position.top - scrollTop)
  }

  Affix.prototype.checkPositionWithEventLoop = function () {
    setTimeout($.proxy(this.checkPosition, this), 1)
  }

  Affix.prototype.checkPosition = function () {
    if (!this.$element.is(':visible')) return

    var height       = this.$element.height()
    var offset       = this.options.offset
    var offsetTop    = offset.top
    var offsetBottom = offset.bottom
    var scrollHeight = Math.max($(document).height(), $(document.body).height())

    if (typeof offset != 'object')         offsetBottom = offsetTop = offset
    if (typeof offsetTop == 'function')    offsetTop    = offset.top(this.$element)
    if (typeof offsetBottom == 'function') offsetBottom = offset.bottom(this.$element)

    var affix = this.getState(scrollHeight, height, offsetTop, offsetBottom)

    if (this.affixed != affix) {
      if (this.unpin != null) this.$element.css('top', '')

      var affixType = 'affix' + (affix ? '-' + affix : '')
      var e         = $.Event(affixType + '.bs.affix')

      this.$element.trigger(e)

      if (e.isDefaultPrevented()) return

      this.affixed = affix
      this.unpin = affix == 'bottom' ? this.getPinnedOffset() : null

      this.$element
        .removeClass(Affix.RESET)
        .addClass(affixType)
        .trigger(affixType.replace('affix', 'affixed') + '.bs.affix')
    }

    if (affix == 'bottom') {
      this.$element.offset({
        top: scrollHeight - height - offsetBottom
      })
    }
  }


  // AFFIX PLUGIN DEFINITION
  // =======================

  function Plugin(option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.affix')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.affix', (data = new Affix(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }

  var old = $.fn.affix

  $.fn.affix             = Plugin
  $.fn.affix.Constructor = Affix


  // AFFIX NO CONFLICT
  // =================

  $.fn.affix.noConflict = function () {
    $.fn.affix = old
    return this
  }


  // AFFIX DATA-API
  // ==============

  $(window).on('load', function () {
    $('[data-spy="affix"]').each(function () {
      var $spy = $(this)
      var data = $spy.data()

      data.offset = data.offset || {}

      if (data.offsetBottom != null) data.offset.bottom = data.offsetBottom
      if (data.offsetTop    != null) data.offset.top    = data.offsetTop

      Plugin.call($spy, data)
    })
  })

}(jQuery);

/**
 * RMIT Cookie Utility
 *
 * Vanilla JavaScript cookie management functions.
 * Originally based on jQuery Cookie Plugin v1.4.1.
 * Rewritten to remove jQuery dependency while maintaining backward compatibility.
 */
(function (window) {
    'use strict';

    // ========================================================================
    // Constants
    // ========================================================================

    const MILLISECONDS_PER_DAY = 86400000; // 24 * 60 * 60 * 1000
    const PLUSES_REGEX = /\+/g;

    const config = {
        raw: false,
        json: false,
        defaults: {}
    };

    // ========================================================================
    // Internal Helper Functions
    // ========================================================================

    function encode(s) {
        return config.raw ? s : encodeURIComponent(s);
    }

    function decode(s) {
        return config.raw ? s : decodeURIComponent(s);
    }

    function stringifyCookieValue(value) {
        return encode(config.json ? JSON.stringify(value) : String(value));
    }

    function parseCookieValue(s) {
        let str = s;
        if (str.indexOf('"') === 0) {
            // This is a quoted cookie as according to RFC2068, unescape...
            str = str.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
        }

        try {
            // Replace server-side written pluses with spaces.
            // If we can't decode the cookie, ignore it, it's unusable.
            // If we can't parse the cookie, ignore it, it's unusable.
            str = decodeURIComponent(str.replace(PLUSES_REGEX, ' '));
            return config.json ? JSON.parse(str) : str;
        } catch (e) {
            return undefined;
        }
    }

    function read(s, converter) {
        const value = config.raw ? s : parseCookieValue(s);
        return typeof converter === 'function' ? converter(value) : value;
    }

    // ========================================================================
    // Cookie Functions
    // ========================================================================
    
    /**
     * Cookie function - gets or sets cookies.
     *
     * @param {string} key - Cookie name
     * @param {*} [value] - Cookie value (if setting)
     * @param {Object} [options] - Cookie options
     * @returns {*} Cookie value when reading, cookie string when writing
     */
    function cookie(key, value, options) {
        // Write
        if (arguments.length > 1 && typeof value !== 'function') {
            const opts = Object.assign({}, config.defaults, options);

            if (typeof opts.expires === 'number') {
                const days = opts.expires;
                const expiryDate = new Date();
                expiryDate.setMilliseconds(expiryDate.getMilliseconds() + days * MILLISECONDS_PER_DAY);
                opts.expires = expiryDate;
            }

            return (document.cookie = [
                encode(key), '=', stringifyCookieValue(value),
                opts.expires ? '; expires=' + opts.expires.toUTCString() : '',
                opts.path ? '; path=' + opts.path : '',
                opts.domain ? '; domain=' + opts.domain : '',
                opts.secure ? '; secure' : ''
            ].join(''));
        }

        // Read
        let result = key ? undefined : {};
        const cookies = document.cookie ? document.cookie.split('; ') : [];
        const cookieCount = cookies.length;

        for (let i = 0; i < cookieCount; i++) {
            const parts = cookies[i].split('=');
            const name = decode(parts.shift());
            let cookieValue = parts.join('=');

            if (key === name) {
                result = read(cookieValue, value);
                break;
            }

            if (!key && (cookieValue = read(cookieValue)) !== undefined) {
                result[name] = cookieValue;
            }
        }

        return result;
    }

    cookie.defaults = config.defaults;

    /**
     * Removes a cookie.
     *
     * @param {string} key - Cookie name
     * @param {Object} [options] - Cookie options
     * @returns {boolean} True if cookie was removed
     */
    function removeCookie(key, options) {
        cookie(key, '', Object.assign({}, options, {
            expires: -1
        }));
        return !cookie(key);
    }

    // ========================================================================
    // Utility Functions
    // ========================================================================

    let domOrIntCookie = cookie('domesticOrInternational');

    function getDomesticOrInternationalCookie() {
        return domOrIntCookie;
    }

    function isCookieEnabled() {
        const cookieEnabled = navigator.cookieEnabled;

        if (cookieEnabled === false) {
            return false;
        }

        if (document.cookie === '') {
            document.cookie = 'testcookie=1';

            if (document.cookie === '') {
                removeCookie('testcookie');
                return false;
            }
        }

        removeCookie('testcookie');
        return true;
    }

    function setDomesticOrInternationalCookie(value) {
        if (isCookieEnabled()) {
            cookie('domesticOrInternational', value, {
                path: '/',
                expires: 90
            });
        }
        domOrIntCookie = value;
        window.dispatchEvent(new CustomEvent('domesticOrInternationalChanged', {
            detail: { value: value }
        }));
    }

    function removeRedundantDomIntClasses() {
        const elements = document.querySelectorAll('.b-domestic.b-international');
        elements.forEach(function (el) {
            el.classList.remove('b-domestic', 'b-international');
        });
    }

    function displayDomesticOrInternational() {
        const audience = domOrIntCookie;

        if (audience === 'international') {
            document.body.classList.remove('b-domestic');
            document.body.classList.add('b-international');
        } else {
            document.body.classList.remove('b-international');
            document.body.classList.add('b-domestic');
        }
    }

    // ========================================================================
    // Export to Global Scope
    // ========================================================================

    // Expose cookie functions globally
    window.cookie = cookie;
    window.removeCookie = removeCookie;

    // Expose utility functions globally (backward compatibility)
    // Use defineProperty for domOrIntCookie so it always returns the current value
    Object.defineProperty(window, 'domOrIntCookie', {
        get: function() {
            return domOrIntCookie;
        },
        set: function(value) {
            domOrIntCookie = value;
        },
        configurable: true
    });
    window.getDomesticOrInternationalCookie = getDomesticOrInternationalCookie;
    window.isCookieEnabled = isCookieEnabled;
    window.setDomesticOrInternationalCookie = setDomesticOrInternationalCookie;
    window.removeRedundantDomIntClasses = removeRedundantDomIntClasses;
    window.displayDomesticOrInternational = displayDomesticOrInternational;

})(window);

/*

     _ _      _       _

___| (_) ___| | __  (_)___

/ __| | |/ __| |/ /  | / __|

\__ \ | | (__|   < _ | \__ \

|___/_|_|\___|_|\_(_)/ |___/

                   |__/

 

Version: 1.8.0

  Author: Ken Wheeler

Website: http://kenwheeler.github.io

    Docs: http://kenwheeler.github.io/slick

    Repo: http://github.com/kenwheeler/slick

  Issues: http://github.com/kenwheeler/slick/issues

 

*/

/* global window, document, define, jQuery, setInterval, clearInterval */

;
(function (factory) {

	'use strict';

	if (typeof define === 'function' && define.amd) {

		define(['jquery'], factory);

	} else if (typeof exports !== 'undefined') {

		module.exports = factory(require('jquery'));

	} else {

		factory(jQuery);

	}


}(function ($) {

	'use strict';

	var Slick = window.Slick || {};


	Slick = (function () {


		var instanceUid = 0;


		function Slick(element, settings) {


			var _ = this,
				dataSettings;


			_.defaults = {

				accessibility: true,

				adaptiveHeight: false,

				appendArrows: $(element),

				appendDots: $(element),

				arrows: true,

				asNavFor: null,

				prevArrow: '<button class="slick-prev" aria-label="Previous" type="button">Previous</button>',

				nextArrow: '<button class="slick-next" aria-label="Next" type="button">Next</button>',

				autoplay: false,

				autoplaySpeed: 3000,

				centerMode: false,

				centerPadding: '50px',

				cssEase: 'ease',

				customPaging: function (slider, i) {

					return $('<button type="button" />').text(i + 1);

				},

				dots: false,

				dotsClass: 'slick-dots',

				draggable: true,

				easing: 'linear',

				edgeFriction: 0.35,

				fade: false,

				focusOnSelect: false,

				focusOnChange: false,

				infinite: true,

				initialSlide: 0,

				lazyLoad: 'ondemand',

				mobileFirst: false,

				pauseOnHover: true,

				pauseOnFocus: true,

				pauseOnDotsHover: false,

				respondTo: 'window',

				responsive: null,

				rows: 1,

				rtl: false,

				slide: '',

				slidesPerRow: 1,

				slidesToShow: 1,

				slidesToScroll: 1,

				speed: 500,

				swipe: true,

				swipeToSlide: false,

				touchMove: true,

				touchThreshold: 5,

				useCSS: true,

				useTransform: true,

				variableWidth: false,

				vertical: false,

				verticalSwiping: false,

				waitForAnimate: true,

				zIndex: 1000

			};


			_.initials = {

				animating: false,

				dragging: false,

				autoPlayTimer: null,

				currentDirection: 0,

				currentLeft: null,

				currentSlide: 0,

				direction: 1,

				$dots: null,

				listWidth: null,

				listHeight: null,

				loadIndex: 0,

				$nextArrow: null,

				$prevArrow: null,

				scrolling: false,

				slideCount: null,

				slideWidth: null,

				$slideTrack: null,

				$slides: null,

				sliding: false,

				slideOffset: 0,

				swipeLeft: null,

				swiping: false,

				$list: null,

				touchObject: {},

				transformsEnabled: false,

				unslicked: false

			};


			$.extend(_, _.initials);


			_.activeBreakpoint = null;

			_.animType = null;

			_.animProp = null;

			_.breakpoints = [];

			_.breakpointSettings = [];

			_.cssTransitions = false;

			_.focussed = false;

			_.interrupted = false;

			_.hidden = 'hidden';

			_.paused = true;

			_.positionProp = null;

			_.respondTo = null;

			_.rowCount = 1;

			_.shouldClick = true;

			_.$slider = $(element);

			_.$slidesCache = null;

			_.transformType = null;

			_.transitionType = null;

			_.visibilityChange = 'visibilitychange';

			_.windowWidth = 0;

			_.windowTimer = null;


			dataSettings = $(element).data('slick') || {};


			_.options = $.extend({}, _.defaults, settings, dataSettings);


			_.currentSlide = _.options.initialSlide;


			_.originalSettings = _.options;


			if (typeof document.mozHidden !== 'undefined') {

				_.hidden = 'mozHidden';

				_.visibilityChange = 'mozvisibilitychange';

			} else if (typeof document.webkitHidden !== 'undefined') {

				_.hidden = 'webkitHidden';

				_.visibilityChange = 'webkitvisibilitychange';

			}


			_.autoPlay = $.proxy(_.autoPlay, _);

			_.autoPlayClear = $.proxy(_.autoPlayClear, _);

			_.autoPlayIterator = $.proxy(_.autoPlayIterator, _);

			_.changeSlide = $.proxy(_.changeSlide, _);

			_.clickHandler = $.proxy(_.clickHandler, _);

			_.selectHandler = $.proxy(_.selectHandler, _);

			_.setPosition = $.proxy(_.setPosition, _);

			_.swipeHandler = $.proxy(_.swipeHandler, _);

			_.dragHandler = $.proxy(_.dragHandler, _);

			_.keyHandler = $.proxy(_.keyHandler, _);


			_.instanceUid = instanceUid++;


			// A simple way to check for HTML strings

			// Strict HTML recognition (must start with <)

			// Extracted from jQuery v1.11 source

			_.htmlExpr = /^(?:\s*(<[\w\W]+>)[^>]*)$/;


			_.registerBreakpoints();

			_.init(true);


		}


		return Slick;


	}());


	Slick.prototype.activateADA = function () {

		var _ = this;


		_.$slideTrack.find('.slick-active').attr({

			'aria-hidden': 'false'

		}).find('a, input, button, select').attr({

			'tabindex': '0'

		});


	};


	Slick.prototype.addSlide = Slick.prototype.slickAdd = function (markup, index, addBefore) {


		var _ = this;


		if (typeof (index) === 'boolean') {

			addBefore = index;

			index = null;

		} else if (index < 0 || (index >= _.slideCount)) {

			return false;

		}


		_.unload();


		if (typeof (index) === 'number') {

			if (index === 0 && _.$slides.length === 0) {

				$(markup).appendTo(_.$slideTrack);

			} else if (addBefore) {

				$(markup).insertBefore(_.$slides.eq(index));

			} else {

				$(markup).insertAfter(_.$slides.eq(index));

			}

		} else {

			if (addBefore === true) {

				$(markup).prependTo(_.$slideTrack);

			} else {

				$(markup).appendTo(_.$slideTrack);

			}

		}


		_.$slides = _.$slideTrack.children(this.options.slide);


		_.$slideTrack.children(this.options.slide).detach();


		_.$slideTrack.append(_.$slides);


		_.$slides.each(function (index, element) {

			$(element).attr('data-slick-index', index);

		});


		_.$slidesCache = _.$slides;


		_.reinit();


	};


	Slick.prototype.animateHeight = function () {

		var _ = this;

		if (_.options.slidesToShow === 1 && _.options.adaptiveHeight === true && _.options.vertical === false) {

			var targetHeight = _.$slides.eq(_.currentSlide).outerHeight(true);

			_.$list.animate({

				height: targetHeight

			}, _.options.speed);

		}

	};


	Slick.prototype.animateSlide = function (targetLeft, callback) {


		var animProps = {},

			_ = this;


		_.animateHeight();


		if (_.options.rtl === true && _.options.vertical === false) {

			targetLeft = -targetLeft;

		}

		if (_.transformsEnabled === false) {

			if (_.options.vertical === false) {

				_.$slideTrack.animate({

					left: targetLeft

				}, _.options.speed, _.options.easing, callback);

			} else {

				_.$slideTrack.animate({

					top: targetLeft

				}, _.options.speed, _.options.easing, callback);

			}


		} else {


			if (_.cssTransitions === false) {

				if (_.options.rtl === true) {

					_.currentLeft = -(_.currentLeft);

				}

				$({

					animStart: _.currentLeft

				}).animate({

					animStart: targetLeft

				}, {

					duration: _.options.speed,

					easing: _.options.easing,

					step: function (now) {

						now = Math.ceil(now);

						if (_.options.vertical === false) {

							animProps[_.animType] = 'translate(' +

								now + 'px, 0px)';

							_.$slideTrack.css(animProps);

						} else {

							animProps[_.animType] = 'translate(0px,' +

								now + 'px)';

							_.$slideTrack.css(animProps);

						}

					},

					complete: function () {

						if (callback) {

							callback.call();

						}

					}

				});


			} else {


				_.applyTransition();

				targetLeft = Math.ceil(targetLeft);


				if (_.options.vertical === false) {

					animProps[_.animType] = 'translate3d(' + targetLeft + 'px, 0px, 0px)';

				} else {

					animProps[_.animType] = 'translate3d(0px,' + targetLeft + 'px, 0px)';

				}

				_.$slideTrack.css(animProps);


				if (callback) {

					setTimeout(function () {


						_.disableTransition();


						callback.call();

					}, _.options.speed);

				}


			}


		}


	};


	Slick.prototype.getNavTarget = function () {


		var _ = this,

			asNavFor = _.options.asNavFor;


		if (asNavFor && asNavFor != null) {

			asNavFor = $(asNavFor).not(_.$slider);

		}


		return asNavFor;


	};


	Slick.prototype.asNavFor = function (index) {


		var _ = this,

			asNavFor = _.getNavTarget();


		if (asNavFor !== null && typeof asNavFor === 'object') {

			asNavFor.each(function () {

				var target = $(this).slick('getSlick');

				if (!target.unslicked) {

					target.slideHandler(index, true);

				}

			});

		}


	};


	Slick.prototype.applyTransition = function (slide) {


		var _ = this,

			transition = {};


		if (_.options.fade === false) {

			transition[_.transitionType] = _.transformType + ' ' + _.options.speed + 'ms ' + _.options.cssEase;

		} else {

			transition[_.transitionType] = 'opacity ' + _.options.speed + 'ms ' + _.options.cssEase;

		}


		if (_.options.fade === false) {

			_.$slideTrack.css(transition);

		} else {

			_.$slides.eq(slide).css(transition);

		}


	};


	Slick.prototype.autoPlay = function () {


		var _ = this;


		_.autoPlayClear();


		if (_.slideCount > _.options.slidesToShow) {

			_.autoPlayTimer = setInterval(_.autoPlayIterator, _.options.autoplaySpeed);

		}


	};


	Slick.prototype.autoPlayClear = function () {


		var _ = this;


		if (_.autoPlayTimer) {

			clearInterval(_.autoPlayTimer);

		}


	};


	Slick.prototype.autoPlayIterator = function () {


		var _ = this,

			slideTo = _.currentSlide + _.options.slidesToScroll;


		if (!_.paused && !_.interrupted && !_.focussed) {


			if (_.options.infinite === false) {


				if (_.direction === 1 && (_.currentSlide + 1) === (_.slideCount - 1)) {

					_.direction = 0;

				} else if (_.direction === 0) {


					slideTo = _.currentSlide - _.options.slidesToScroll;


					if (_.currentSlide - 1 === 0) {

						_.direction = 1;

					}


				}


			}


			_.slideHandler(slideTo);


		}


	};


	Slick.prototype.buildArrows = function () {


		var _ = this;


		if (_.options.arrows === true) {


			_.$prevArrow = $(_.options.prevArrow).addClass('slick-arrow');

			_.$nextArrow = $(_.options.nextArrow).addClass('slick-arrow');


			if (_.slideCount > _.options.slidesToShow) {


				_.$prevArrow.removeClass('slick-hidden').removeAttr('aria-hidden tabindex');

				_.$nextArrow.removeClass('slick-hidden').removeAttr('aria-hidden tabindex');


				if (_.htmlExpr.test(_.options.prevArrow)) {

					_.$prevArrow.prependTo(_.options.appendArrows);

				}


				if (_.htmlExpr.test(_.options.nextArrow)) {

					_.$nextArrow.appendTo(_.options.appendArrows);

				}


				if (_.options.infinite !== true) {

					_.$prevArrow

						.addClass('slick-disabled')

						.attr('aria-disabled', 'true');

				}


			} else {


				_.$prevArrow.add(_.$nextArrow)


					.addClass('slick-hidden')

					.attr({

						'aria-disabled': 'true',

						'tabindex': '-1'

					});


			}


		}


	};


	Slick.prototype.buildDots = function () {


		var _ = this,

			i, dot;


		if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {


			_.$slider.addClass('slick-dotted');


			dot = $('<ul />').addClass(_.options.dotsClass);


			for (i = 0; i <= _.getDotCount(); i += 1) {

				dot.append($('<li />').append(_.options.customPaging.call(this, _, i)));

			}


			_.$dots = dot.appendTo(_.options.appendDots);


			_.$dots.find('li').first().addClass('slick-active');


		}


	};


	Slick.prototype.buildOut = function () {


		var _ = this;


		_.$slides =

			_.$slider

			.children(_.options.slide + ':not(.slick-cloned)')

			.addClass('slick-slide');


		_.slideCount = _.$slides.length;


		_.$slides.each(function (index, element) {

			$(element)

				.attr('data-slick-index', index)

				.data('originalStyling', $(element).attr('style') || '');

		});


		_.$slider.addClass('slick-slider');


		_.$slideTrack = (_.slideCount === 0) ?

			$('<div class="slick-track"/>').appendTo(_.$slider) :

			_.$slides.wrapAll('<div class="slick-track"/>').parent();


		_.$list = _.$slideTrack.wrap(

			'<div class="slick-list"/>').parent();

		_.$slideTrack.css('opacity', 0);


		if (_.options.centerMode === true || _.options.swipeToSlide === true) {

			_.options.slidesToScroll = 1;

		}


		$('img[data-lazy]', _.$slider).not('[src]').addClass('slick-loading');


		_.setupInfinite();


		_.buildArrows();


		_.buildDots();


		_.updateDots();


		_.setSlideClasses(typeof _.currentSlide === 'number' ? _.currentSlide : 0);


		if (_.options.draggable === true) {

			_.$list.addClass('draggable');

		}


	};


	Slick.prototype.buildRows = function () {


		var _ = this,
			a, b, c, newSlides, numOfSlides, originalSlides, slidesPerSection;


		newSlides = document.createDocumentFragment();

		originalSlides = _.$slider.children();


		if (_.options.rows > 0) {


			slidesPerSection = _.options.slidesPerRow * _.options.rows;

			numOfSlides = Math.ceil(

				originalSlides.length / slidesPerSection

			);


			for (a = 0; a < numOfSlides; a++) {

				var slide = document.createElement('div');

				for (b = 0; b < _.options.rows; b++) {

					var row = document.createElement('div');

					for (c = 0; c < _.options.slidesPerRow; c++) {

						var target = (a * slidesPerSection + ((b * _.options.slidesPerRow) + c));

						if (originalSlides.get(target)) {

							row.appendChild(originalSlides.get(target));

						}

					}

					slide.appendChild(row);

				}

				newSlides.appendChild(slide);

			}


			_.$slider.empty().append(newSlides);

			_.$slider.children().children().children()

				.css({

					'width': (100 / _.options.slidesPerRow) + '%',

					'display': 'inline-block'

				});


		}


	};


	Slick.prototype.checkResponsive = function (initial, forceUpdate) {


		var _ = this,

			breakpoint, targetBreakpoint, respondToWidth, triggerBreakpoint = false;

		var sliderWidth = _.$slider.width();

		var windowWidth = window.innerWidth || $(window).width();


		if (_.respondTo === 'window') {

			respondToWidth = windowWidth;

		} else if (_.respondTo === 'slider') {

			respondToWidth = sliderWidth;

		} else if (_.respondTo === 'min') {

			respondToWidth = Math.min(windowWidth, sliderWidth);

		}


		if (_.options.responsive &&

			_.options.responsive.length &&

			_.options.responsive !== null) {


			targetBreakpoint = null;


			for (breakpoint in _.breakpoints) {

				if (_.breakpoints.hasOwnProperty(breakpoint)) {

					if (_.originalSettings.mobileFirst === false) {

						if (respondToWidth < _.breakpoints[breakpoint]) {

							targetBreakpoint = _.breakpoints[breakpoint];

						}

					} else {

						if (respondToWidth > _.breakpoints[breakpoint]) {

							targetBreakpoint = _.breakpoints[breakpoint];

						}

					}

				}

			}


			if (targetBreakpoint !== null) {

				if (_.activeBreakpoint !== null) {

					if (targetBreakpoint !== _.activeBreakpoint || forceUpdate) {

						_.activeBreakpoint =

							targetBreakpoint;

						if (_.breakpointSettings[targetBreakpoint] === 'unslick') {

							_.unslick(targetBreakpoint);

						} else {

							_.options = $.extend({}, _.originalSettings,

								_.breakpointSettings[

									targetBreakpoint]);

							if (initial === true) {

								_.currentSlide = _.options.initialSlide;

							}

							_.refresh(initial);

						}

						triggerBreakpoint = targetBreakpoint;

					}

				} else {

					_.activeBreakpoint = targetBreakpoint;

					if (_.breakpointSettings[targetBreakpoint] === 'unslick') {

						_.unslick(targetBreakpoint);

					} else {

						_.options = $.extend({}, _.originalSettings,

							_.breakpointSettings[

								targetBreakpoint]);

						if (initial === true) {

							_.currentSlide = _.options.initialSlide;

						}

						_.refresh(initial);

					}

					triggerBreakpoint = targetBreakpoint;

				}

			} else {

				if (_.activeBreakpoint !== null) {

					_.activeBreakpoint = null;

					_.options = _.originalSettings;

					if (initial === true) {

						_.currentSlide = _.options.initialSlide;

					}

					_.refresh(initial);

					triggerBreakpoint = targetBreakpoint;

				}

			}


			// only trigger breakpoints during an actual break. not on initialize.

			if (!initial && triggerBreakpoint !== false) {

				_.$slider.trigger('breakpoint', [_, triggerBreakpoint]);

			}

		}


	};


	Slick.prototype.changeSlide = function (event, dontAnimate) {


		var _ = this,

			$target = $(event.currentTarget),

			indexOffset, slideOffset, unevenOffset;


		// If target is a link, prevent default action.

		if ($target.is('a')) {

			event.preventDefault();

		}


		// If target is not the <li> element (ie: a child), find the <li>.

		if (!$target.is('li')) {

			$target = $target.closest('li');

		}


		unevenOffset = (_.slideCount % _.options.slidesToScroll !== 0);

		indexOffset = unevenOffset ? 0 : (_.slideCount - _.currentSlide) % _.options.slidesToScroll;


		switch (event.data.message) {


			case 'previous':

				slideOffset = indexOffset === 0 ? _.options.slidesToScroll : _.options.slidesToShow - indexOffset;

				if (_.slideCount > _.options.slidesToShow) {

					_.slideHandler(_.currentSlide - slideOffset, false, dontAnimate);

				}

				break;


			case 'next':

				slideOffset = indexOffset === 0 ? _.options.slidesToScroll : indexOffset;

				if (_.slideCount > _.options.slidesToShow) {

					_.slideHandler(_.currentSlide + slideOffset, false, dontAnimate);

				}

				break;


			case 'index':

				var index = event.data.index === 0 ? 0 :

					event.data.index || $target.index() * _.options.slidesToScroll;


				_.slideHandler(_.checkNavigable(index), false, dontAnimate);

				$target.children().trigger('focus');

				break;


			default:

				return;

		}


	};


	Slick.prototype.checkNavigable = function (index) {


		var _ = this,

			navigables, prevNavigable;


		navigables = _.getNavigableIndexes();

		prevNavigable = 0;

		if (index > navigables[navigables.length - 1]) {

			index = navigables[navigables.length - 1];

		} else {

			for (var n in navigables) {

				if (index < navigables[n]) {

					index = prevNavigable;

					break;

				}

				prevNavigable = navigables[n];

			}

		}


		return index;

	};


	Slick.prototype.cleanUpEvents = function () {


		var _ = this;


		if (_.options.dots && _.$dots !== null) {


			$('li', _.$dots)

				.off('click.slick', _.changeSlide)

				.off('mouseenter.slick', $.proxy(_.interrupt, _, true))

				.off('mouseleave.slick', $.proxy(_.interrupt, _, false));


			if (_.options.accessibility === true) {

				_.$dots.off('keydown.slick', _.keyHandler);

			}

		}


		_.$slider.off('focus.slick blur.slick');


		if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {

			_.$prevArrow && _.$prevArrow.off('click.slick', _.changeSlide);

			_.$nextArrow && _.$nextArrow.off('click.slick', _.changeSlide);


			if (_.options.accessibility === true) {

				_.$prevArrow && _.$prevArrow.off('keydown.slick', _.keyHandler);

				_.$nextArrow && _.$nextArrow.off('keydown.slick', _.keyHandler);

			}

		}


		_.$list.off('touchstart.slick mousedown.slick', _.swipeHandler);

		_.$list.off('touchmove.slick mousemove.slick', _.swipeHandler);

		_.$list.off('touchend.slick mouseup.slick', _.swipeHandler);

		_.$list.off('touchcancel.slick mouseleave.slick', _.swipeHandler);


		_.$list.off('click.slick', _.clickHandler);


		$(document).off(_.visibilityChange, _.visibility);


		_.cleanUpSlideEvents();


		if (_.options.accessibility === true) {

			_.$list.off('keydown.slick', _.keyHandler);

		}


		if (_.options.focusOnSelect === true) {

			$(_.$slideTrack).children().off('click.slick', _.selectHandler);

		}


		$(window).off('orientationchange.slick.slick-' + _.instanceUid, _.orientationChange);


		$(window).off('resize.slick.slick-' + _.instanceUid, _.resize);


		$('[draggable!=true]', _.$slideTrack).off('dragstart', _.preventDefault);


		$(window).off('load.slick.slick-' + _.instanceUid, _.setPosition);


	};


	Slick.prototype.cleanUpSlideEvents = function () {


		var _ = this;


		_.$list.off('mouseenter.slick', $.proxy(_.interrupt, _, true));

		_.$list.off('mouseleave.slick', $.proxy(_.interrupt, _, false));


	};


	Slick.prototype.cleanUpRows = function () {


		var _ = this,
			originalSlides;


		if (_.options.rows > 0) {

			originalSlides = _.$slides.children().children();

			originalSlides.removeAttr('style');

			_.$slider.empty().append(originalSlides);

		}


	};


	Slick.prototype.clickHandler = function (event) {


		var _ = this;


		if (_.shouldClick === false) {

			event.stopImmediatePropagation();

			event.stopPropagation();

			event.preventDefault();

		}


	};


	Slick.prototype.destroy = function (refresh) {


		var _ = this;


		_.autoPlayClear();


		_.touchObject = {};


		_.cleanUpEvents();


		$('.slick-cloned', _.$slider).detach();


		if (_.$dots) {

			_.$dots.remove();

		}


		if (_.$prevArrow && _.$prevArrow.length) {


			_.$prevArrow

				.removeClass('slick-disabled slick-arrow slick-hidden')

				.removeAttr('aria-hidden aria-disabled tabindex')

				.css('display', '');


			if (_.htmlExpr.test(_.options.prevArrow)) {

				_.$prevArrow.remove();

			}

		}


		if (_.$nextArrow && _.$nextArrow.length) {


			_.$nextArrow

				.removeClass('slick-disabled slick-arrow slick-hidden')

				.removeAttr('aria-hidden aria-disabled tabindex')

				.css('display', '');


			if (_.htmlExpr.test(_.options.nextArrow)) {

				_.$nextArrow.remove();

			}

		}


		if (_.$slides) {


			_.$slides

				.removeClass('slick-slide slick-active slick-center slick-visible slick-current')

				.removeAttr('aria-hidden')

				.removeAttr('data-slick-index')

				.each(function () {

					$(this).attr('style', $(this).data('originalStyling'));

				});


			_.$slideTrack.children(this.options.slide).detach();


			_.$slideTrack.detach();


			_.$list.detach();


			_.$slider.append(_.$slides);

		}


		_.cleanUpRows();


		_.$slider.removeClass('slick-slider');

		_.$slider.removeClass('slick-initialized');

		_.$slider.removeClass('slick-dotted');


		_.unslicked = true;


		if (!refresh) {

			_.$slider.trigger('destroy', [_]);

		}


	};


	Slick.prototype.disableTransition = function (slide) {


		var _ = this,

			transition = {};


		transition[_.transitionType] = '';


		if (_.options.fade === false) {

			_.$slideTrack.css(transition);

		} else {

			_.$slides.eq(slide).css(transition);

		}


	};


	Slick.prototype.fadeSlide = function (slideIndex, callback) {


		var _ = this;


		if (_.cssTransitions === false) {


			_.$slides.eq(slideIndex).css({

				zIndex: _.options.zIndex

			});


			_.$slides.eq(slideIndex).animate({

				opacity: 1

			}, _.options.speed, _.options.easing, callback);


		} else {


			_.applyTransition(slideIndex);


			_.$slides.eq(slideIndex).css({

				opacity: 1,

				zIndex: _.options.zIndex

			});


			if (callback) {

				setTimeout(function () {


					_.disableTransition(slideIndex);


					callback.call();

				}, _.options.speed);

			}


		}


	};


	Slick.prototype.fadeSlideOut = function (slideIndex) {


		var _ = this;


		if (_.cssTransitions === false) {


			_.$slides.eq(slideIndex).animate({

				opacity: 0,

				zIndex: _.options.zIndex - 2

			}, _.options.speed, _.options.easing);


		} else {


			_.applyTransition(slideIndex);


			_.$slides.eq(slideIndex).css({

				opacity: 0,

				zIndex: _.options.zIndex - 2

			});


		}


	};


	Slick.prototype.filterSlides = Slick.prototype.slickFilter = function (filter) {


		var _ = this;


		if (filter !== null) {


			_.$slidesCache = _.$slides;


			_.unload();


			_.$slideTrack.children(this.options.slide).detach();


			_.$slidesCache.filter(filter).appendTo(_.$slideTrack);


			_.reinit();


		}


	};


	Slick.prototype.focusHandler = function () {


		var _ = this;


		_.$slider

			.off('focus.slick blur.slick')

			.on('focus.slick blur.slick', '*', function (event) {


				event.stopImmediatePropagation();

				var $sf = $(this);


				setTimeout(function () {


					if (_.options.pauseOnFocus) {

						_.focussed = $sf.is(':focus');

						_.autoPlay();

					}


				}, 0);


			});

	};


	Slick.prototype.getCurrent = Slick.prototype.slickCurrentSlide = function () {


		var _ = this;

		return _.currentSlide;


	};


	Slick.prototype.getDotCount = function () {


		var _ = this;


		var breakPoint = 0;

		var counter = 0;

		var pagerQty = 0;


		if (_.options.infinite === true) {

			if (_.slideCount <= _.options.slidesToShow) {

				++pagerQty;

			} else {

				while (breakPoint < _.slideCount) {

					++pagerQty;

					breakPoint = counter + _.options.slidesToScroll;

					counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;

				}

			}

		} else if (_.options.centerMode === true) {

			pagerQty = _.slideCount;

		} else if (!_.options.asNavFor) {

			pagerQty = 1 + Math.ceil((_.slideCount - _.options.slidesToShow) / _.options.slidesToScroll);

		} else {

			while (breakPoint < _.slideCount) {

				++pagerQty;

				breakPoint = counter + _.options.slidesToScroll;

				counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;

			}

		}


		return pagerQty - 1;


	};


	Slick.prototype.getLeft = function (slideIndex) {


		var _ = this,

			targetLeft,

			verticalHeight,

			verticalOffset = 0,

			targetSlide,

			coef;


		_.slideOffset = 0;

		verticalHeight = _.$slides.first().outerHeight(true);


		if (_.options.infinite === true) {

			if (_.slideCount > _.options.slidesToShow) {

				_.slideOffset = (_.slideWidth * _.options.slidesToShow) * -1;

				coef = -1


				if (_.options.vertical === true && _.options.centerMode === true) {

					if (_.options.slidesToShow === 2) {

						coef = -1.5;

					} else if (_.options.slidesToShow === 1) {

						coef = -2

					}

				}

				verticalOffset = (verticalHeight * _.options.slidesToShow) * coef;

			}

			if (_.slideCount % _.options.slidesToScroll !== 0) {

				if (slideIndex + _.options.slidesToScroll > _.slideCount && _.slideCount > _.options.slidesToShow) {

					if (slideIndex > _.slideCount) {

						_.slideOffset = ((_.options.slidesToShow - (slideIndex - _.slideCount)) * _.slideWidth) * -1;

						verticalOffset = ((_.options.slidesToShow - (slideIndex - _.slideCount)) * verticalHeight) * -1;

					} else {

						_.slideOffset = ((_.slideCount % _.options.slidesToScroll) * _.slideWidth) * -1;

						verticalOffset = ((_.slideCount % _.options.slidesToScroll) * verticalHeight) * -1;

					}

				}

			}

		} else {

			if (slideIndex + _.options.slidesToShow > _.slideCount) {

				_.slideOffset = ((slideIndex + _.options.slidesToShow) - _.slideCount) * _.slideWidth;

				verticalOffset = ((slideIndex + _.options.slidesToShow) - _.slideCount) * verticalHeight;

			}

		}


		if (_.slideCount <= _.options.slidesToShow) {

			_.slideOffset = 0;

			verticalOffset = 0;

		}


		if (_.options.centerMode === true && _.slideCount <= _.options.slidesToShow) {

			_.slideOffset = ((_.slideWidth * Math.floor(_.options.slidesToShow)) / 2) - ((_.slideWidth * _.slideCount) / 2);

		} else if (_.options.centerMode === true && _.options.infinite === true) {

			_.slideOffset += _.slideWidth * Math.floor(_.options.slidesToShow / 2) - _.slideWidth;

		} else if (_.options.centerMode === true) {

			_.slideOffset = 0;

			_.slideOffset += _.slideWidth * Math.floor(_.options.slidesToShow / 2);

		}


		if (_.options.vertical === false) {

			targetLeft = ((slideIndex * _.slideWidth) * -1) + _.slideOffset;

		} else {

			targetLeft = ((slideIndex * verticalHeight) * -1) + verticalOffset;

		}


		if (_.options.variableWidth === true) {


			if (_.slideCount <= _.options.slidesToShow || _.options.infinite === false) {

				targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex);

			} else {

				targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex + _.options.slidesToShow);

			}


			if (_.options.rtl === true) {

				if (targetSlide[0]) {

					targetLeft = (_.$slideTrack.width() - targetSlide[0].offsetLeft - targetSlide.width()) * -1;

				} else {

					targetLeft = 0;

				}

			} else {

				targetLeft = targetSlide[0] ? targetSlide[0].offsetLeft * -1 : 0;

			}


			if (_.options.centerMode === true) {

				if (_.slideCount <= _.options.slidesToShow || _.options.infinite === false) {

					targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex);

				} else {

					targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex + _.options.slidesToShow + 1);

				}


				if (_.options.rtl === true) {

					if (targetSlide[0]) {

						targetLeft = (_.$slideTrack.width() - targetSlide[0].offsetLeft - targetSlide.width()) * -1;

					} else {

						targetLeft = 0;

					}

				} else {

					targetLeft = targetSlide[0] ? targetSlide[0].offsetLeft * -1 : 0;

				}


				targetLeft += (_.$list.width() - targetSlide.outerWidth()) / 2;

			}

		}


		return targetLeft;


	};


	Slick.prototype.getOption = Slick.prototype.slickGetOption = function (option) {


		var _ = this;


		return _.options[option];


	};


	Slick.prototype.getNavigableIndexes = function () {


		var _ = this,

			breakPoint = 0,

			counter = 0,

			indexes = [],

			max;


		if (_.options.infinite === false) {

			max = _.slideCount;

		} else {

			breakPoint = _.options.slidesToScroll * -1;

			counter = _.options.slidesToScroll * -1;

			max = _.slideCount * 2;

		}


		while (breakPoint < max) {

			indexes.push(breakPoint);

			breakPoint = counter + _.options.slidesToScroll;

			counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;

		}


		return indexes;


	};


	Slick.prototype.getSlick = function () {


		return this;


	};


	Slick.prototype.getSlideCount = function () {


		var _ = this,

			slidesTraversed, swipedSlide, centerOffset;


		centerOffset = _.options.centerMode === true ? _.slideWidth * Math.floor(_.options.slidesToShow / 2) : 0;


		if (_.options.swipeToSlide === true) {

			_.$slideTrack.find('.slick-slide').each(function (index, slide) {

				if (slide.offsetLeft - centerOffset + ($(slide).outerWidth() / 2) > (_.swipeLeft * -1)) {

					swipedSlide = slide;

					return false;

				}

			});


			slidesTraversed = Math.abs($(swipedSlide).attr('data-slick-index') - _.currentSlide) || 1;


			return slidesTraversed;


		} else {

			return _.options.slidesToScroll;

		}


	};


	Slick.prototype.goTo = Slick.prototype.slickGoTo = function (slide, dontAnimate) {


		var _ = this;


		_.changeSlide({

			data: {

				message: 'index',

				index: parseInt(slide)

			}

		}, dontAnimate);


	};


	Slick.prototype.init = function (creation) {


		var _ = this;


		if (!$(_.$slider).hasClass('slick-initialized')) {


			$(_.$slider).addClass('slick-initialized');


			_.buildRows();

			_.buildOut();

			_.setProps();

			_.startLoad();

			_.loadSlider();

			_.initializeEvents();

			_.updateArrows();

			_.updateDots();

			_.checkResponsive(true);

			_.focusHandler();


		}


		if (creation) {

			_.$slider.trigger('init', [_]);

		}


		if (_.options.accessibility === true) {

			_.initADA();

		}


		if (_.options.autoplay) {


			_.paused = false;

			_.autoPlay();


		}


	};


	Slick.prototype.initADA = function () {

		var _ = this,

			numDotGroups = Math.ceil(_.slideCount / _.options.slidesToShow),

			tabControlIndexes = _.getNavigableIndexes().filter(function (val) {

				return (val >= 0) && (val < _.slideCount);

			});


		_.$slides.add(_.$slideTrack.find('.slick-cloned')).attr({

			'aria-hidden': 'true',

			'tabindex': '-1'

		}).find('a, input, button, select').attr({

			'tabindex': '-1'

		});


		if (_.$dots !== null) {

			_.$slides.not(_.$slideTrack.find('.slick-cloned')).each(function (i) {

				var slideControlIndex = tabControlIndexes.indexOf(i);


				$(this).attr({

					'role': 'tabpanel',

					'id': 'slick-slide' + _.instanceUid + i,

					'tabindex': -1

				});


				if (slideControlIndex !== -1) {

					var ariaButtonControl = 'slick-slide-control' + _.instanceUid + slideControlIndex

					if ($('#' + ariaButtonControl).length) {

						$(this).attr({

							'aria-describedby': ariaButtonControl

						});

					}

				}

			});


			_.$dots.attr('role', 'tablist').find('li').each(function (i) {

				var mappedSlideIndex = tabControlIndexes[i];


				$(this).attr({

					'role': 'presentation'

				});


				$(this).find('button').first().attr({

					'role': 'tab',

					'id': 'slick-slide-control' + _.instanceUid + i,

					'aria-controls': 'slick-slide' + _.instanceUid + mappedSlideIndex,

					'aria-label': (i + 1) + ' of ' + numDotGroups,

					'aria-selected': null,

					'tabindex': '-1'

				});


			}).eq(_.currentSlide).find('button').attr({

				'aria-selected': 'true',

				'tabindex': '0'

			}).end();

		}


		for (var i = _.currentSlide, max = i + _.options.slidesToShow; i < max; i++) {

			if (_.options.focusOnChange) {

				_.$slides.eq(i).attr({
					'tabindex': '0'
				});

			} else {

				_.$slides.eq(i).removeAttr('tabindex');

			}

		}


		_.activateADA();


	};


	Slick.prototype.initArrowEvents = function () {


		var _ = this;


		if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {

			_.$prevArrow

				.off('click.slick')

				.on('click.slick', {

					message: 'previous'

				}, _.changeSlide);

			_.$nextArrow

				.off('click.slick')

				.on('click.slick', {

					message: 'next'

				}, _.changeSlide);


			if (_.options.accessibility === true) {

				_.$prevArrow.on('keydown.slick', _.keyHandler);

				_.$nextArrow.on('keydown.slick', _.keyHandler);

			}

		}


	};


	Slick.prototype.initDotEvents = function () {


		var _ = this;


		if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {

			$('li', _.$dots).on('click.slick', {

				message: 'index'

			}, _.changeSlide);


			if (_.options.accessibility === true) {

				_.$dots.on('keydown.slick', _.keyHandler);

			}

		}


		if (_.options.dots === true && _.options.pauseOnDotsHover === true && _.slideCount > _.options.slidesToShow) {


			$('li', _.$dots)

				.on('mouseenter.slick', $.proxy(_.interrupt, _, true))

				.on('mouseleave.slick', $.proxy(_.interrupt, _, false));


		}


	};


	Slick.prototype.initSlideEvents = function () {


		var _ = this;


		if (_.options.pauseOnHover) {


			_.$list.on('mouseenter.slick', $.proxy(_.interrupt, _, true));

			_.$list.on('mouseleave.slick', $.proxy(_.interrupt, _, false));


		}


	};


	Slick.prototype.initializeEvents = function () {


		var _ = this;


		_.initArrowEvents();


		_.initDotEvents();

		_.initSlideEvents();


		_.$list.on('touchstart.slick mousedown.slick', {

			action: 'start'

		}, _.swipeHandler);

		_.$list.on('touchmove.slick mousemove.slick', {

			action: 'move'

		}, _.swipeHandler);

		_.$list.on('touchend.slick mouseup.slick', {

			action: 'end'

		}, _.swipeHandler);

		_.$list.on('touchcancel.slick mouseleave.slick', {

			action: 'end'

		}, _.swipeHandler);


		_.$list.on('click.slick', _.clickHandler);


		$(document).on(_.visibilityChange, $.proxy(_.visibility, _));


		if (_.options.accessibility === true) {

			_.$list.on('keydown.slick', _.keyHandler);

		}


		if (_.options.focusOnSelect === true) {

			$(_.$slideTrack).children().on('click.slick', _.selectHandler);

		}


		$(window).on('orientationchange.slick.slick-' + _.instanceUid, $.proxy(_.orientationChange, _));


		$(window).on('resize.slick.slick-' + _.instanceUid, $.proxy(_.resize, _));


		$('[draggable!=true]', _.$slideTrack).on('dragstart', _.preventDefault);


		$(window).on('load.slick.slick-' + _.instanceUid, _.setPosition);

		$(_.setPosition);


	};


	Slick.prototype.initUI = function () {


		var _ = this;


		if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {


			_.$prevArrow.show();

			_.$nextArrow.show();


		}


		if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {


			_.$dots.show();


		}


	};


	Slick.prototype.keyHandler = function (event) {


		var _ = this;

		//Dont slide if the cursor is inside the form fields and arrow keys are pressed

		if (!event.target.tagName.match('TEXTAREA|INPUT|SELECT')) {

			if (event.keyCode === 37 && _.options.accessibility === true) {

				_.changeSlide({

					data: {

						message: _.options.rtl === true ? 'next' : 'previous'

					}

				});

			} else if (event.keyCode === 39 && _.options.accessibility === true) {

				_.changeSlide({

					data: {

						message: _.options.rtl === true ? 'previous' : 'next'

					}

				});

			}

		}


	};


	Slick.prototype.lazyLoad = function () {


		var _ = this,

			loadRange, cloneRange, rangeStart, rangeEnd;


		function loadImages(imagesScope) {


			$('img[data-lazy]', imagesScope).each(function () {


				var image = $(this),

					imageSource = $(this).attr('data-lazy'),

					imageSrcSet = $(this).attr('data-srcset'),

					imageSizes = $(this).attr('data-sizes') || _.$slider.attr('data-sizes'),

					imageToLoad = document.createElement('img');


				imageToLoad.onload = function () {


					image

						.animate({
							opacity: 0
						}, 100, function () {


							if (imageSrcSet) {

								image

									.attr('srcset', imageSrcSet);


								if (imageSizes) {

									image

										.attr('sizes', imageSizes);

								}

							}


							image

								.attr('src', imageSource)

								.animate({
									opacity: 1
								}, 200, function () {

									image

										.removeAttr('data-lazy data-srcset data-sizes')

										.removeClass('slick-loading');

								});

							_.$slider.trigger('lazyLoaded', [_, image, imageSource]);

						});


				};


				imageToLoad.onerror = function () {


					image

						.removeAttr('data-lazy')

						.removeClass('slick-loading')

						.addClass('slick-lazyload-error');


					_.$slider.trigger('lazyLoadError', [_, image, imageSource]);


				};


				imageToLoad.src = imageSource;


			});


		}


		if (_.options.centerMode === true) {

			if (_.options.infinite === true) {

				rangeStart = _.currentSlide + (_.options.slidesToShow / 2 + 1);

				rangeEnd = rangeStart + _.options.slidesToShow + 2;

			} else {

				rangeStart = Math.max(0, _.currentSlide - (_.options.slidesToShow / 2 + 1));

				rangeEnd = 2 + (_.options.slidesToShow / 2 + 1) + _.currentSlide;

			}

		} else {

			rangeStart = _.options.infinite ? _.options.slidesToShow + _.currentSlide : _.currentSlide;

			rangeEnd = Math.ceil(rangeStart + _.options.slidesToShow);

			if (_.options.fade === true) {

				if (rangeStart > 0) rangeStart--;

				if (rangeEnd <= _.slideCount) rangeEnd++;

			}

		}


		loadRange = _.$slider.find('.slick-slide').slice(rangeStart, rangeEnd);


		if (_.options.lazyLoad === 'anticipated') {

			var prevSlide = rangeStart - 1,

				nextSlide = rangeEnd,

				$slides = _.$slider.find('.slick-slide');


			for (var i = 0; i < _.options.slidesToScroll; i++) {

				if (prevSlide < 0) prevSlide = _.slideCount - 1;

				loadRange = loadRange.add($slides.eq(prevSlide));

				loadRange = loadRange.add($slides.eq(nextSlide));

				prevSlide--;

				nextSlide++;

			}

		}


		loadImages(loadRange);


		if (_.slideCount <= _.options.slidesToShow) {

			cloneRange = _.$slider.find('.slick-slide');

			loadImages(cloneRange);

		} else

		if (_.currentSlide >= _.slideCount - _.options.slidesToShow) {

			cloneRange = _.$slider.find('.slick-cloned').slice(0, _.options.slidesToShow);

			loadImages(cloneRange);

		} else if (_.currentSlide === 0) {

			cloneRange = _.$slider.find('.slick-cloned').slice(_.options.slidesToShow * -1);

			loadImages(cloneRange);

		}


	};


	Slick.prototype.loadSlider = function () {


		var _ = this;


		_.setPosition();


		_.$slideTrack.css({

			opacity: 1

		});


		_.$slider.removeClass('slick-loading');


		_.initUI();


		if (_.options.lazyLoad === 'progressive') {

			_.progressiveLazyLoad();

		}


	};


	Slick.prototype.next = Slick.prototype.slickNext = function () {


		var _ = this;


		_.changeSlide({

			data: {

				message: 'next'

			}

		});


	};


	Slick.prototype.orientationChange = function () {


		var _ = this;


		_.checkResponsive();

		_.setPosition();


	};


	Slick.prototype.pause = Slick.prototype.slickPause = function () {


		var _ = this;


		_.autoPlayClear();

		_.paused = true;


	};


	Slick.prototype.play = Slick.prototype.slickPlay = function () {


		var _ = this;


		_.autoPlay();

		_.options.autoplay = true;

		_.paused = false;

		_.focussed = false;

		_.interrupted = false;


	};


	Slick.prototype.postSlide = function (index) {


		var _ = this;


		if (!_.unslicked) {


			_.$slider.trigger('afterChange', [_, index]);


			_.animating = false;


			if (_.slideCount > _.options.slidesToShow) {

				_.setPosition();

			}


			_.swipeLeft = null;


			if (_.options.autoplay) {

				_.autoPlay();

			}


			if (_.options.accessibility === true) {

				_.initADA();


				if (_.options.focusOnChange) {

					var $currentSlide = $(_.$slides.get(_.currentSlide));

					$currentSlide.attr('tabindex', 0).focus();

				}

			}


		}


	};


	Slick.prototype.prev = Slick.prototype.slickPrev = function () {


		var _ = this;


		_.changeSlide({

			data: {

				message: 'previous'

			}

		});


	};


	Slick.prototype.preventDefault = function (event) {


		event.preventDefault();


	};


	Slick.prototype.progressiveLazyLoad = function (tryCount) {


		tryCount = tryCount || 1;


		var _ = this,

			$imgsToLoad = $('img[data-lazy]', _.$slider),

			image,

			imageSource,

			imageSrcSet,

			imageSizes,

			imageToLoad;


		if ($imgsToLoad.length) {


			image = $imgsToLoad.first();

			imageSource = image.attr('data-lazy');

			imageSrcSet = image.attr('data-srcset');

			imageSizes = image.attr('data-sizes') || _.$slider.attr('data-sizes');

			imageToLoad = document.createElement('img');


			imageToLoad.onload = function () {


				if (imageSrcSet) {

					image

						.attr('srcset', imageSrcSet);


					if (imageSizes) {

						image

							.attr('sizes', imageSizes);

					}

				}


				image

					.attr('src', imageSource)

					.removeAttr('data-lazy data-srcset data-sizes')

					.removeClass('slick-loading');


				if (_.options.adaptiveHeight === true) {

					_.setPosition();

				}


				_.$slider.trigger('lazyLoaded', [_, image, imageSource]);

				_.progressiveLazyLoad();


			};


			imageToLoad.onerror = function () {


				if (tryCount < 3) {


					/**

					 * try to load the image 3 times,

					 * leave a slight delay so we don't get

					 * servers blocking the request.

					 */

					setTimeout(function () {

						_.progressiveLazyLoad(tryCount + 1);

					}, 500);


				} else {


					image

						.removeAttr('data-lazy')

						.removeClass('slick-loading')

						.addClass('slick-lazyload-error');


					_.$slider.trigger('lazyLoadError', [_, image, imageSource]);


					_.progressiveLazyLoad();


				}


			};


			imageToLoad.src = imageSource;


		} else {


			_.$slider.trigger('allImagesLoaded', [_]);


		}


	};


	Slick.prototype.refresh = function (initializing) {


		var _ = this,
			currentSlide, lastVisibleIndex;


		lastVisibleIndex = _.slideCount - _.options.slidesToShow;


		// in non-infinite sliders, we don't want to go past the

		// last visible index.

		if (!_.options.infinite && (_.currentSlide > lastVisibleIndex)) {

			_.currentSlide = lastVisibleIndex;

		}


		// if less slides than to show, go to start.

		if (_.slideCount <= _.options.slidesToShow) {

			_.currentSlide = 0;


		}


		currentSlide = _.currentSlide;


		_.destroy(true);


		$.extend(_, _.initials, {
			currentSlide: currentSlide
		});


		_.init();


		if (!initializing) {


			_.changeSlide({

				data: {

					message: 'index',

					index: currentSlide

				}

			}, false);


		}


	};


	Slick.prototype.registerBreakpoints = function () {


		var _ = this,
			breakpoint, currentBreakpoint, l,

			responsiveSettings = _.options.responsive || [];


		if ($.type(responsiveSettings) === 'array' && responsiveSettings.length) {


			_.respondTo = _.options.respondTo || 'window';


			for (breakpoint in responsiveSettings) {


				l = _.breakpoints.length - 1;


				if (responsiveSettings.hasOwnProperty(breakpoint)) {

					currentBreakpoint = responsiveSettings[breakpoint].breakpoint;


					// loop through the breakpoints and cut out any existing

					// ones with the same breakpoint number, we don't want dupes.

					while (l >= 0) {

						if (_.breakpoints[l] && _.breakpoints[l] === currentBreakpoint) {

							_.breakpoints.splice(l, 1);

						}

						l--;

					}


					_.breakpoints.push(currentBreakpoint);

					_.breakpointSettings[currentBreakpoint] = responsiveSettings[breakpoint].settings;


				}


			}


			_.breakpoints.sort(function (a, b) {

				return (_.options.mobileFirst) ? a - b : b - a;

			});


		}


	};


	Slick.prototype.reinit = function () {


		var _ = this;


		_.$slides =

			_.$slideTrack

			.children(_.options.slide)

			.addClass('slick-slide');


		_.slideCount = _.$slides.length;


		if (_.currentSlide >= _.slideCount && _.currentSlide !== 0) {

			_.currentSlide = _.currentSlide - _.options.slidesToScroll;

		}


		if (_.slideCount <= _.options.slidesToShow) {

			_.currentSlide = 0;

		}


		_.registerBreakpoints();


		_.setProps();

		_.setupInfinite();

		_.buildArrows();

		_.updateArrows();

		_.initArrowEvents();

		_.buildDots();

		_.updateDots();

		_.initDotEvents();

		_.cleanUpSlideEvents();

		_.initSlideEvents();


		_.checkResponsive(false, true);


		if (_.options.focusOnSelect === true) {

			$(_.$slideTrack).children().on('click.slick', _.selectHandler);

		}


		_.setSlideClasses(typeof _.currentSlide === 'number' ? _.currentSlide : 0);


		_.setPosition();

		_.focusHandler();


		_.paused = !_.options.autoplay;

		_.autoPlay();


		_.$slider.trigger('reInit', [_]);


	};


	Slick.prototype.resize = function () {


		var _ = this;


		if ($(window).width() !== _.windowWidth) {

			clearTimeout(_.windowDelay);

			_.windowDelay = window.setTimeout(function () {

				_.windowWidth = $(window).width();

				_.checkResponsive();

				if (!_.unslicked) {
					_.setPosition();
				}

			}, 50);

		}

	};


	Slick.prototype.removeSlide = Slick.prototype.slickRemove = function (index, removeBefore, removeAll) {


		var _ = this;


		if (typeof (index) === 'boolean') {

			removeBefore = index;

			index = removeBefore === true ? 0 : _.slideCount - 1;

		} else {

			index = removeBefore === true ? --index : index;

		}


		if (_.slideCount < 1 || index < 0 || index > _.slideCount - 1) {

			return false;

		}


		_.unload();


		if (removeAll === true) {

			_.$slideTrack.children().remove();

		} else {

			_.$slideTrack.children(this.options.slide).eq(index).remove();

		}


		_.$slides = _.$slideTrack.children(this.options.slide);


		_.$slideTrack.children(this.options.slide).detach();


		_.$slideTrack.append(_.$slides);


		_.$slidesCache = _.$slides;


		_.reinit();


	};


	Slick.prototype.setCSS = function (position) {


		var _ = this,

			positionProps = {},

			x, y;


		if (_.options.rtl === true) {

			position = -position;

		}

		x = _.positionProp == 'left' ? Math.ceil(position) + 'px' : '0px';

		y = _.positionProp == 'top' ? Math.ceil(position) + 'px' : '0px';


		positionProps[_.positionProp] = position;


		if (_.transformsEnabled === false) {

			_.$slideTrack.css(positionProps);

		} else {

			positionProps = {};

			if (_.cssTransitions === false) {

				positionProps[_.animType] = 'translate(' + x + ', ' + y + ')';

				_.$slideTrack.css(positionProps);

			} else {

				positionProps[_.animType] = 'translate3d(' + x + ', ' + y + ', 0px)';

				_.$slideTrack.css(positionProps);

			}

		}


	};


	Slick.prototype.setDimensions = function () {


		var _ = this;


		if (_.options.vertical === false) {

			if (_.options.centerMode === true) {

				_.$list.css({

					padding: ('0px ' + _.options.centerPadding)

				});

			}

		} else {

			_.$list.height(_.$slides.first().outerHeight(true) * _.options.slidesToShow);

			if (_.options.centerMode === true) {

				_.$list.css({

					padding: (_.options.centerPadding + ' 0px')

				});

			}

		}


		_.listWidth = _.$list.width();

		_.listHeight = _.$list.height();


		if (_.options.vertical === false && _.options.variableWidth === false) {

			_.slideWidth = Math.ceil(_.listWidth / _.options.slidesToShow);

			_.$slideTrack.width(Math.ceil((_.slideWidth * _.$slideTrack.children('.slick-slide').length)));


		} else if (_.options.variableWidth === true) {

			_.$slideTrack.width(5000 * _.slideCount);

		} else {

			_.slideWidth = Math.ceil(_.listWidth);

			_.$slideTrack.height(Math.ceil((_.$slides.first().outerHeight(true) * _.$slideTrack.children('.slick-slide').length)));

		}


		var offset = _.$slides.first().outerWidth(true) - _.$slides.first().width();

		if (_.options.variableWidth === false) _.$slideTrack.children('.slick-slide').width(_.slideWidth - offset);


	};


	Slick.prototype.setFade = function () {


		var _ = this,

			targetLeft;


		_.$slides.each(function (index, element) {

			targetLeft = (_.slideWidth * index) * -1;

			if (_.options.rtl === true) {

				$(element).css({

					position: 'relative',

					right: targetLeft,

					top: 0,

					zIndex: _.options.zIndex - 2,

					opacity: 0

				});

			} else {

				$(element).css({

					position: 'relative',

					left: targetLeft,

					top: 0,

					zIndex: _.options.zIndex - 2,

					opacity: 0

				});

			}

		});


		_.$slides.eq(_.currentSlide).css({

			zIndex: _.options.zIndex - 1,

			opacity: 1

		});


	};


	Slick.prototype.setHeight = function () {


		var _ = this;


		if (_.options.slidesToShow === 1 && _.options.adaptiveHeight === true && _.options.vertical === false) {

			var targetHeight = _.$slides.eq(_.currentSlide).outerHeight(true);

			_.$list.css('height', targetHeight);

		}


	};


	Slick.prototype.setOption =

		Slick.prototype.slickSetOption = function () {


			/**

			 * accepts arguments in format of:

			 *

			 *  - for changing a single option's value:

			 *     .slick("setOption", option, value, refresh )

			 *

			 *  - for changing a set of responsive options:

			 *     .slick("setOption", 'responsive', [{}, ...], refresh )

			 *

			 *  - for updating multiple values at once (not responsive)

			 *     .slick("setOption", { 'option': value, ... }, refresh )

			 */


			var _ = this,
				l, item, option, value, refresh = false,
				type;


			if ($.type(arguments[0]) === 'object') {


				option = arguments[0];

				refresh = arguments[1];

				type = 'multiple';


			} else if ($.type(arguments[0]) === 'string') {


				option = arguments[0];

				value = arguments[1];

				refresh = arguments[2];


				if (arguments[0] === 'responsive' && $.type(arguments[1]) === 'array') {


					type = 'responsive';


				} else if (typeof arguments[1] !== 'undefined') {


					type = 'single';


				}


			}


			if (type === 'single') {


				_.options[option] = value;


			} else if (type === 'multiple') {


				$.each(option, function (opt, val) {


					_.options[opt] = val;


				});


			} else if (type === 'responsive') {


				for (item in value) {


					if ($.type(_.options.responsive) !== 'array') {


						_.options.responsive = [value[item]];


					} else {


						l = _.options.responsive.length - 1;


						// loop through the responsive object and splice out duplicates.

						while (l >= 0) {


							if (_.options.responsive[l].breakpoint === value[item].breakpoint) {


								_.options.responsive.splice(l, 1);


							}


							l--;


						}


						_.options.responsive.push(value[item]);


					}


				}


			}


			if (refresh) {


				_.unload();

				_.reinit();


			}


		};


	Slick.prototype.setPosition = function () {


		var _ = this;


		_.setDimensions();


		_.setHeight();


		if (_.options.fade === false) {

			_.setCSS(_.getLeft(_.currentSlide));

		} else {

			_.setFade();

		}


		_.$slider.trigger('setPosition', [_]);


	};


	Slick.prototype.setProps = function () {


		var _ = this,

			bodyStyle = document.body.style;


		_.positionProp = _.options.vertical === true ? 'top' : 'left';


		if (_.positionProp === 'top') {

			_.$slider.addClass('slick-vertical');

		} else {

			_.$slider.removeClass('slick-vertical');

		}


		if (bodyStyle.WebkitTransition !== undefined ||

			bodyStyle.MozTransition !== undefined ||

			bodyStyle.msTransition !== undefined) {

			if (_.options.useCSS === true) {

				_.cssTransitions = true;

			}

		}


		if (_.options.fade) {

			if (typeof _.options.zIndex === 'number') {

				if (_.options.zIndex < 3) {

					_.options.zIndex = 3;

				}

			} else {

				_.options.zIndex = _.defaults.zIndex;

			}

		}


		if (bodyStyle.OTransform !== undefined) {

			_.animType = 'OTransform';

			_.transformType = '-o-transform';

			_.transitionType = 'OTransition';

			if (bodyStyle.perspectiveProperty === undefined && bodyStyle.webkitPerspective === undefined) _.animType = false;

		}

		if (bodyStyle.MozTransform !== undefined) {

			_.animType = 'MozTransform';

			_.transformType = '-moz-transform';

			_.transitionType = 'MozTransition';

			if (bodyStyle.perspectiveProperty === undefined && bodyStyle.MozPerspective === undefined) _.animType = false;

		}

		if (bodyStyle.webkitTransform !== undefined) {

			_.animType = 'webkitTransform';

			_.transformType = '-webkit-transform';

			_.transitionType = 'webkitTransition';

			if (bodyStyle.perspectiveProperty === undefined && bodyStyle.webkitPerspective === undefined) _.animType = false;

		}

		if (bodyStyle.msTransform !== undefined) {

			_.animType = 'msTransform';

			_.transformType = '-ms-transform';

			_.transitionType = 'msTransition';

			if (bodyStyle.msTransform === undefined) _.animType = false;

		}

		if (bodyStyle.transform !== undefined && _.animType !== false) {

			_.animType = 'transform';

			_.transformType = 'transform';

			_.transitionType = 'transition';

		}

		_.transformsEnabled = _.options.useTransform && (_.animType !== null && _.animType !== false);

	};


	Slick.prototype.setSlideClasses = function (index) {


		var _ = this,

			centerOffset, allSlides, indexOffset, remainder;


		allSlides = _.$slider

			.find('.slick-slide')

			.removeClass('slick-active slick-center slick-current')

			.attr('aria-hidden', 'true');


		_.$slides

			.eq(index)

			.addClass('slick-current');


		if (_.options.centerMode === true) {


			var evenCoef = _.options.slidesToShow % 2 === 0 ? 1 : 0;


			centerOffset = Math.floor(_.options.slidesToShow / 2);


			if (_.options.infinite === true) {


				if (index >= centerOffset && index <= (_.slideCount - 1) - centerOffset) {

					_.$slides

						.slice(index - centerOffset + evenCoef, index + centerOffset + 1)

						.addClass('slick-active')

						.attr('aria-hidden', 'false');


				} else {


					indexOffset = _.options.slidesToShow + index;

					allSlides

						.slice(indexOffset - centerOffset + 1 + evenCoef, indexOffset + centerOffset + 2)

						.addClass('slick-active')

						.attr('aria-hidden', 'false');


				}


				if (index === 0) {


					allSlides

						.eq(allSlides.length - 1 - _.options.slidesToShow)

						.addClass('slick-center');


				} else if (index === _.slideCount - 1) {


					allSlides

						.eq(_.options.slidesToShow)

						.addClass('slick-center');


				}


			}


			_.$slides

				.eq(index)

				.addClass('slick-center');


		} else {


			if (index >= 0 && index <= (_.slideCount - _.options.slidesToShow)) {


				_.$slides

					.slice(index, index + _.options.slidesToShow)

					.addClass('slick-active')

					.attr('aria-hidden', 'false');


			} else if (allSlides.length <= _.options.slidesToShow) {


				allSlides

					.addClass('slick-active')

					.attr('aria-hidden', 'false');


			} else {


				remainder = _.slideCount % _.options.slidesToShow;

				indexOffset = _.options.infinite === true ? _.options.slidesToShow + index : index;


				if (_.options.slidesToShow == _.options.slidesToScroll && (_.slideCount - index) < _.options.slidesToShow) {


					allSlides

						.slice(indexOffset - (_.options.slidesToShow - remainder), indexOffset + remainder)

						.addClass('slick-active')

						.attr('aria-hidden', 'false');


				} else {


					allSlides

						.slice(indexOffset, indexOffset + _.options.slidesToShow)

						.addClass('slick-active')

						.attr('aria-hidden', 'false');


				}


			}


		}


		if (_.options.lazyLoad === 'ondemand' || _.options.lazyLoad === 'anticipated') {

			_.lazyLoad();

		}

	};


	Slick.prototype.setupInfinite = function () {


		var _ = this,

			i, slideIndex, infiniteCount;


		if (_.options.fade === true) {

			_.options.centerMode = false;

		}


		if (_.options.infinite === true && _.options.fade === false) {


			slideIndex = null;


			if (_.slideCount > _.options.slidesToShow) {


				if (_.options.centerMode === true) {

					infiniteCount = _.options.slidesToShow + 1;

				} else {

					infiniteCount = _.options.slidesToShow;

				}


				for (i = _.slideCount; i > (_.slideCount -

						infiniteCount); i -= 1) {

					slideIndex = i - 1;

					$(_.$slides[slideIndex]).clone(true).attr('id', '')

						.attr('data-slick-index', slideIndex - _.slideCount)

						.prependTo(_.$slideTrack).addClass('slick-cloned');

				}

				for (i = 0; i < infiniteCount + _.slideCount; i += 1) {

					slideIndex = i;

					$(_.$slides[slideIndex]).clone(true).attr('id', '')

						.attr('data-slick-index', slideIndex + _.slideCount)

						.appendTo(_.$slideTrack).addClass('slick-cloned');

				}

				_.$slideTrack.find('.slick-cloned').find('[id]').each(function () {

					$(this).attr('id', '');

				});


			}


		}


	};


	Slick.prototype.interrupt = function (toggle) {


		var _ = this;


		if (!toggle) {

			_.autoPlay();

		}

		_.interrupted = toggle;


	};


	Slick.prototype.selectHandler = function (event) {


		var _ = this;


		var targetElement =

			$(event.target).is('.slick-slide') ?

			$(event.target) :

			$(event.target).parents('.slick-slide');


		var index = parseInt(targetElement.attr('data-slick-index'));


		if (!index) index = 0;


		if (_.slideCount <= _.options.slidesToShow) {


			_.slideHandler(index, false, true);

			return;


		}


		_.slideHandler(index);


	};


	Slick.prototype.slideHandler = function (index, sync, dontAnimate) {


		var targetSlide, animSlide, oldSlide, slideLeft, targetLeft = null,

			_ = this,
			navTarget;


		sync = sync || false;


		if (_.animating === true && _.options.waitForAnimate === true) {

			return;

		}


		if (_.options.fade === true && _.currentSlide === index) {

			return;

		}


		if (sync === false) {

			_.asNavFor(index);

		}


		targetSlide = index;

		targetLeft = _.getLeft(targetSlide);

		slideLeft = _.getLeft(_.currentSlide);


		_.currentLeft = _.swipeLeft === null ? slideLeft : _.swipeLeft;


		if (_.options.infinite === false && _.options.centerMode === false && (index < 0 || index > _.getDotCount() * _.options.slidesToScroll)) {

			if (_.options.fade === false) {

				targetSlide = _.currentSlide;

				if (dontAnimate !== true && _.slideCount > _.options.slidesToShow) {

					_.animateSlide(slideLeft, function () {

						_.postSlide(targetSlide);

					});

				} else {

					_.postSlide(targetSlide);

				}

			}

			return;

		} else if (_.options.infinite === false && _.options.centerMode === true && (index < 0 || index > (_.slideCount - _.options.slidesToScroll))) {

			if (_.options.fade === false) {

				targetSlide = _.currentSlide;

				if (dontAnimate !== true && _.slideCount > _.options.slidesToShow) {

					_.animateSlide(slideLeft, function () {

						_.postSlide(targetSlide);

					});

				} else {

					_.postSlide(targetSlide);

				}

			}

			return;

		}


		if (_.options.autoplay) {

			clearInterval(_.autoPlayTimer);

		}


		if (targetSlide < 0) {

			if (_.slideCount % _.options.slidesToScroll !== 0) {

				animSlide = _.slideCount - (_.slideCount % _.options.slidesToScroll);

			} else {

				animSlide = _.slideCount + targetSlide;

			}

		} else if (targetSlide >= _.slideCount) {

			if (_.slideCount % _.options.slidesToScroll !== 0) {

				animSlide = 0;

			} else {

				animSlide = targetSlide - _.slideCount;

			}

		} else {

			animSlide = targetSlide;

		}


		_.animating = true;


		_.$slider.trigger('beforeChange', [_, _.currentSlide, animSlide]);


		oldSlide = _.currentSlide;

		_.currentSlide = animSlide;


		_.setSlideClasses(_.currentSlide);


		if (_.options.asNavFor) {


			navTarget = _.getNavTarget();

			navTarget = navTarget.slick('getSlick');


			if (navTarget.slideCount <= navTarget.options.slidesToShow) {

				navTarget.setSlideClasses(_.currentSlide);

			}


		}


		_.updateDots();

		_.updateArrows();


		if (_.options.fade === true) {

			if (dontAnimate !== true) {


				_.fadeSlideOut(oldSlide);


				_.fadeSlide(animSlide, function () {

					_.postSlide(animSlide);

				});


			} else {

				_.postSlide(animSlide);

			}

			_.animateHeight();

			return;

		}


		if (dontAnimate !== true && _.slideCount > _.options.slidesToShow) {

			_.animateSlide(targetLeft, function () {

				_.postSlide(animSlide);

			});

		} else {

			_.postSlide(animSlide);

		}


	};


	Slick.prototype.startLoad = function () {


		var _ = this;


		if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {


			_.$prevArrow.hide();

			_.$nextArrow.hide();


		}


		if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {


			_.$dots.hide();


		}


		_.$slider.addClass('slick-loading');


	};


	Slick.prototype.swipeDirection = function () {


		var xDist, yDist, r, swipeAngle, _ = this;


		xDist = _.touchObject.startX - _.touchObject.curX;

		yDist = _.touchObject.startY - _.touchObject.curY;

		r = Math.atan2(yDist, xDist);


		swipeAngle = Math.round(r * 180 / Math.PI);

		if (swipeAngle < 0) {

			swipeAngle = 360 - Math.abs(swipeAngle);

		}


		if ((swipeAngle <= 45) && (swipeAngle >= 0)) {

			return (_.options.rtl === false ? 'left' : 'right');

		}

		if ((swipeAngle <= 360) && (swipeAngle >= 315)) {

			return (_.options.rtl === false ? 'left' : 'right');

		}

		if ((swipeAngle >= 135) && (swipeAngle <= 225)) {

			return (_.options.rtl === false ? 'right' : 'left');

		}

		if (_.options.verticalSwiping === true) {

			if ((swipeAngle >= 35) && (swipeAngle <= 135)) {

				return 'down';

			} else {

				return 'up';

			}

		}


		return 'vertical';


	};


	Slick.prototype.swipeEnd = function (event) {


		var _ = this,

			slideCount,

			direction;


		_.dragging = false;

		_.swiping = false;


		if (_.scrolling) {

			_.scrolling = false;

			return false;

		}


		_.interrupted = false;

		_.shouldClick = (_.touchObject.swipeLength > 10) ? false : true;


		if (_.touchObject.curX === undefined) {

			return false;

		}


		if (_.touchObject.edgeHit === true) {

			_.$slider.trigger('edge', [_, _.swipeDirection()]);

		}


		if (_.touchObject.swipeLength >= _.touchObject.minSwipe) {


			direction = _.swipeDirection();


			switch (direction) {


				case 'left':

				case 'down':


					slideCount =

						_.options.swipeToSlide ?

						_.checkNavigable(_.currentSlide + _.getSlideCount()) :

						_.currentSlide + _.getSlideCount();


					_.currentDirection = 0;


					break;


				case 'right':

				case 'up':


					slideCount =

						_.options.swipeToSlide ?

						_.checkNavigable(_.currentSlide - _.getSlideCount()) :

						_.currentSlide - _.getSlideCount();


					_.currentDirection = 1;


					break;


				default:


			}


			if (direction != 'vertical') {


				_.slideHandler(slideCount);

				_.touchObject = {};

				_.$slider.trigger('swipe', [_, direction]);


			}


		} else {


			if (_.touchObject.startX !== _.touchObject.curX) {


				_.slideHandler(_.currentSlide);

				_.touchObject = {};


			}


		}


	};


	Slick.prototype.swipeHandler = function (event) {


		var _ = this;


		if ((_.options.swipe === false) || ('ontouchend' in document && _.options.swipe === false)) {

			return;

		} else if (_.options.draggable === false && event.type.indexOf('mouse') !== -1) {

			return;

		}


		_.touchObject.fingerCount = event.originalEvent && event.originalEvent.touches !== undefined ?

			event.originalEvent.touches.length : 1;


		_.touchObject.minSwipe = _.listWidth / _.options

			.touchThreshold;


		if (_.options.verticalSwiping === true) {

			_.touchObject.minSwipe = _.listHeight / _.options

				.touchThreshold;

		}


		switch (event.data.action) {


			case 'start':

				_.swipeStart(event);

				break;


			case 'move':

				_.swipeMove(event);

				break;


			case 'end':

				_.swipeEnd(event);

				break;


		}


	};


	Slick.prototype.swipeMove = function (event) {


		var _ = this,

			edgeWasHit = false,

			curLeft, swipeDirection, swipeLength, positionOffset, touches, verticalSwipeLength;


		touches = event.originalEvent !== undefined ? event.originalEvent.touches : null;


		if (!_.dragging || _.scrolling || touches && touches.length !== 1) {

			return false;

		}


		curLeft = _.getLeft(_.currentSlide);


		_.touchObject.curX = (touches !== undefined && touches !== null) ? touches[0].pageX : event.clientX;

		_.touchObject.curY = (touches !== undefined && touches !== null) ? touches[0].pageY : event.clientY;


		_.touchObject.swipeLength = Math.round(Math.sqrt(

			Math.pow(_.touchObject.curX - _.touchObject.startX, 2)));


		verticalSwipeLength = Math.round(Math.sqrt(

			Math.pow(_.touchObject.curY - _.touchObject.startY, 2)));


		if (!_.options.verticalSwiping && !_.swiping && verticalSwipeLength > 4) {

			_.scrolling = true;

			return false;

		}


		if (_.options.verticalSwiping === true) {

			_.touchObject.swipeLength = verticalSwipeLength;

		}


		swipeDirection = _.swipeDirection();


		if (event.originalEvent !== undefined && _.touchObject.swipeLength > 4) {

			_.swiping = true;

			event.preventDefault();

		}


		positionOffset = (_.options.rtl === false ? 1 : -1) * (_.touchObject.curX > _.touchObject.startX ? 1 : -1);

		if (_.options.verticalSwiping === true) {

			positionOffset = _.touchObject.curY > _.touchObject.startY ? 1 : -1;

		}


		swipeLength = _.touchObject.swipeLength;


		_.touchObject.edgeHit = false;


		if (_.options.infinite === false) {

			if ((_.currentSlide === 0 && swipeDirection === 'right') || (_.currentSlide >= _.getDotCount() && swipeDirection === 'left')) {

				swipeLength = _.touchObject.swipeLength * _.options.edgeFriction;

				_.touchObject.edgeHit = true;

			}

		}


		if (_.options.vertical === false) {

			_.swipeLeft = curLeft + swipeLength * positionOffset;

		} else {

			_.swipeLeft = curLeft + (swipeLength * (_.$list.height() / _.listWidth)) * positionOffset;

		}

		if (_.options.verticalSwiping === true) {

			_.swipeLeft = curLeft + swipeLength * positionOffset;

		}


		if (_.options.fade === true || _.options.touchMove === false) {

			return false;

		}


		if (_.animating === true) {

			_.swipeLeft = null;

			return false;

		}


		_.setCSS(_.swipeLeft);


	};


	Slick.prototype.swipeStart = function (event) {


		var _ = this,

			touches;


		_.interrupted = true;


		if (_.touchObject.fingerCount !== 1 || _.slideCount <= _.options.slidesToShow) {

			_.touchObject = {};

			return false;

		}


		if (event.originalEvent !== undefined && event.originalEvent.touches !== undefined) {

			touches = event.originalEvent.touches[0];

		}


		_.touchObject.startX = _.touchObject.curX = touches !== undefined ? touches.pageX : event.clientX;

		_.touchObject.startY = _.touchObject.curY = touches !== undefined ? touches.pageY : event.clientY;


		_.dragging = true;


	};


	Slick.prototype.unfilterSlides = Slick.prototype.slickUnfilter = function () {


		var _ = this;


		if (_.$slidesCache !== null) {


			_.unload();


			_.$slideTrack.children(this.options.slide).detach();


			_.$slidesCache.appendTo(_.$slideTrack);


			_.reinit();


		}


	};


	Slick.prototype.unload = function () {


		var _ = this;


		$('.slick-cloned', _.$slider).remove();


		if (_.$dots) {

			_.$dots.remove();

		}


		if (_.$prevArrow && _.htmlExpr.test(_.options.prevArrow)) {

			_.$prevArrow.remove();

		}


		if (_.$nextArrow && _.htmlExpr.test(_.options.nextArrow)) {

			_.$nextArrow.remove();

		}


		_.$slides

			.removeClass('slick-slide slick-active slick-visible slick-current')

			.attr('aria-hidden', 'true')

			.css('width', '');


	};


	Slick.prototype.unslick = function (fromBreakpoint) {


		var _ = this;

		_.$slider.trigger('unslick', [_, fromBreakpoint]);

		_.destroy();


	};


	Slick.prototype.updateArrows = function () {


		var _ = this,

			centerOffset;


		centerOffset = Math.floor(_.options.slidesToShow / 2);


		if (_.options.arrows === true &&

			_.slideCount > _.options.slidesToShow &&

			!_.options.infinite) {


			_.$prevArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');

			_.$nextArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');


			if (_.currentSlide === 0) {


				_.$prevArrow.addClass('slick-disabled').attr('aria-disabled', 'true');

				_.$nextArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');


			} else if (_.currentSlide >= _.slideCount - _.options.slidesToShow && _.options.centerMode === false) {


				_.$nextArrow.addClass('slick-disabled').attr('aria-disabled', 'true');

				_.$prevArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');


			} else if (_.currentSlide >= _.slideCount - 1 && _.options.centerMode === true) {


				_.$nextArrow.addClass('slick-disabled').attr('aria-disabled', 'true');

				_.$prevArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');


			}


		}


	};


	Slick.prototype.updateDots = function () {


		var _ = this;


		if (_.$dots !== null) {


			_.$dots

				.find('li')

				.removeClass('slick-active')

				.end();


			_.$dots

				.find('li')

				.eq(Math.floor(_.currentSlide / _.options.slidesToScroll))

				.addClass('slick-active');


		}


	};


	Slick.prototype.visibility = function () {


		var _ = this;


		if (_.options.autoplay) {


			if (document[_.hidden]) {


				_.interrupted = true;


			} else {


				_.interrupted = false;


			}


		}


	};


	$.fn.slick = function () {

		var _ = this,

			opt = arguments[0],

			args = Array.prototype.slice.call(arguments, 1),

			l = _.length,

			i,

			ret;

		for (i = 0; i < l; i++) {

			if (typeof opt == 'object' || typeof opt == 'undefined')

				_[i].slick = new Slick(_[i], opt);

			else

				ret = _[i].slick[opt].apply(_[i].slick, args);

			if (typeof ret != 'undefined') return ret;

		}

		return _;

	};


}));
;
(function ($) {
	var settings = {
		speed: 300,
		offset: 0,
		currentClass: 'active',
		updateHash: false,
		classToParent: false
	}

	var RMITanchorNavPoints = {
		init: function (options, navbar) {
			settings = $.extend(settings, options);
			this.$navbar = $(navbar);
			this.$items = this.$navbar.find('a:not(.externals)');
			this.$window = $(window);
			this.hashNow = undefined;

			this.$items.on('click', this.clicked);
			this.$window.on('scroll', $.proxy(this.scrollPage, this));
			this.$window.on('resize', $.proxy(this.scrollPage, this));
		},
		clicked: function (e) {
			e.preventDefault();
			var hash = $(this).attr('href');
			var position = $(hash).offset().top - settings.offset;

			$('html, body').animate({
				scrollTop: position
			}, settings.speed);
		},
		scrollPage: function () {
			var self = this,
				sections = [],
				result = undefined;

			self.$items.each(function () {
				var hash = $(this).attr('href');
				var section = $(hash);

				if (section) sections.push(section);
			});

			for (var i = 0; i < sections.length; i++) {
				var section = sections[i],
					sectionHeight = section.height(),
					sectionTop = section.offset().top,
					windowTop = self.$window.scrollTop(),
					windoHeight = self.$window.height();

				if (windowTop <= sectionTop && (sectionHeight + sectionTop) < (windowTop + windoHeight)) {
					result = sections[i].attr('id');
					break;
				}
			}

			if (result) {
				if (settings.updateHash) {
					var hash = '#' + result;
					if (self.hashNow != hash) {
						self.hashNow = hash;
						history.pushState({}, '', hash);
					}
				}

				if (settings.classToParent) {
					self.$items.parent().removeClass(settings.currentClass);
					$('a[href="#' + result + '"]').parent().addClass(settings.currentClass);
				} else {
					self.$items.removeClass(settings.currentClass);
					$('a[href="#' + result + '"]').addClass(settings.currentClass);
				}
			}
		}
	}

	$.fn.anchorNavPoints = function (options) {
		this.each(function () {
			var anchorNavPoints = Object.create(RMITanchorNavPoints);
			anchorNavPoints.init(options, this);
		});
	}
})(jQuery);
/*!
 * typeahead.js 0.11.1
 * https://github.com/twitter/typeahead.js
 * Copyright 2013-2015 Twitter, Inc. and other contributors; Licensed MIT
 */

(function(root, factory) {
    if (typeof define === "function" && define.amd) {
        define("bloodhound", [ "jquery" ], function(a0) {
            return root["Bloodhound"] = factory(a0);
        });
    } else if (typeof exports === "object") {
        module.exports = factory(require("jquery"));
    } else {
        root["Bloodhound"] = factory(jQuery);
    }
})(this, function($) {
    var _ = function() {
        "use strict";
        return {
            isMsie: function() {
                return /(msie|trident)/i.test(navigator.userAgent) ? navigator.userAgent.match(/(msie |rv:)(\d+(.\d+)?)/i)[2] : false;
            },
            isBlankString: function(str) {
                return !str || /^\s*$/.test(str);
            },
            escapeRegExChars: function(str) {
                return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
            },
            isString: function(obj) {
                return typeof obj === "string";
            },
            isNumber: function(obj) {
                return typeof obj === "number";
            },
            isArray: $.isArray,
            isFunction: $.isFunction,
            isObject: $.isPlainObject,
            isUndefined: function(obj) {
                return typeof obj === "undefined";
            },
            isElement: function(obj) {
                return !!(obj && obj.nodeType === 1);
            },
            isJQuery: function(obj) {
                return obj instanceof $;
            },
            toStr: function toStr(s) {
                return _.isUndefined(s) || s === null ? "" : s + "";
            },
            bind: $.proxy,
            each: function(collection, cb) {
                $.each(collection, reverseArgs);
                function reverseArgs(index, value) {
                    return cb(value, index);
                }
            },
            map: $.map,
            filter: $.grep,
            every: function(obj, test) {
                var result = true;
                if (!obj) {
                    return result;
                }
                $.each(obj, function(key, val) {
                    if (!(result = test.call(null, val, key, obj))) {
                        return false;
                    }
                });
                return !!result;
            },
            some: function(obj, test) {
                var result = false;
                if (!obj) {
                    return result;
                }
                $.each(obj, function(key, val) {
                    if (result = test.call(null, val, key, obj)) {
                        return false;
                    }
                });
                return !!result;
            },
            mixin: $.extend,
            identity: function(x) {
                return x;
            },
            clone: function(obj) {
                return $.extend(true, {}, obj);
            },
            getIdGenerator: function() {
                var counter = 0;
                return function() {
                    return counter++;
                };
            },
            templatify: function templatify(obj) {
                return $.isFunction(obj) ? obj : template;
                function template() {
                    return String(obj);
                }
            },
            defer: function(fn) {
                setTimeout(fn, 0);
            },
            debounce: function(func, wait, immediate) {
                var timeout, result;
                return function() {
                    var context = this, args = arguments, later, callNow;
                    later = function() {
                        timeout = null;
                        if (!immediate) {
                            result = func.apply(context, args);
                        }
                    };
                    callNow = immediate && !timeout;
                    clearTimeout(timeout);
                    timeout = setTimeout(later, wait);
                    if (callNow) {
                        result = func.apply(context, args);
                    }
                    return result;
                };
            },
            throttle: function(func, wait) {
                var context, args, timeout, result, previous, later;
                previous = 0;
                later = function() {
                    previous = new Date();
                    timeout = null;
                    result = func.apply(context, args);
                };
                return function() {
                    var now = new Date(), remaining = wait - (now - previous);
                    context = this;
                    args = arguments;
                    if (remaining <= 0) {
                        clearTimeout(timeout);
                        timeout = null;
                        previous = now;
                        result = func.apply(context, args);
                    } else if (!timeout) {
                        timeout = setTimeout(later, remaining);
                    }
                    return result;
                };
            },
            stringify: function(val) {
                return _.isString(val) ? val : JSON.stringify(val);
            },
            noop: function() {}
        };
    }();
    var VERSION = "0.11.1";
    var tokenizers = function() {
        "use strict";
        return {
            nonword: nonword,
            whitespace: whitespace,
            obj: {
                nonword: getObjTokenizer(nonword),
                whitespace: getObjTokenizer(whitespace)
            }
        };
        function whitespace(str) {
            str = _.toStr(str);
            return str ? str.split(/\s+/) : [];
        }
        function nonword(str) {
            str = _.toStr(str);
            return str ? str.split(/\W+/) : [];
        }
        function getObjTokenizer(tokenizer) {
            return function setKey(keys) {
                keys = _.isArray(keys) ? keys : [].slice.call(arguments, 0);
                return function tokenize(o) {
                    var tokens = [];
                    _.each(keys, function(k) {
                        tokens = tokens.concat(tokenizer(_.toStr(o[k])));
                    });
                    return tokens;
                };
            };
        }
    }();
    var LruCache = function() {
        "use strict";
        function LruCache(maxSize) {
            this.maxSize = _.isNumber(maxSize) ? maxSize : 100;
            this.reset();
            if (this.maxSize <= 0) {
                this.set = this.get = $.noop;
            }
        }
        _.mixin(LruCache.prototype, {
            set: function set(key, val) {
                var tailItem = this.list.tail, node;
                if (this.size >= this.maxSize) {
                    this.list.remove(tailItem);
                    delete this.hash[tailItem.key];
                    this.size--;
                }
                if (node = this.hash[key]) {
                    node.val = val;
                    this.list.moveToFront(node);
                } else {
                    node = new Node(key, val);
                    this.list.add(node);
                    this.hash[key] = node;
                    this.size++;
                }
            },
            get: function get(key) {
                var node = this.hash[key];
                if (node) {
                    this.list.moveToFront(node);
                    return node.val;
                }
            },
            reset: function reset() {
                this.size = 0;
                this.hash = {};
                this.list = new List();
            }
        });
        function List() {
            this.head = this.tail = null;
        }
        _.mixin(List.prototype, {
            add: function add(node) {
                if (this.head) {
                    node.next = this.head;
                    this.head.prev = node;
                }
                this.head = node;
                this.tail = this.tail || node;
            },
            remove: function remove(node) {
                node.prev ? node.prev.next = node.next : this.head = node.next;
                node.next ? node.next.prev = node.prev : this.tail = node.prev;
            },
            moveToFront: function(node) {
                this.remove(node);
                this.add(node);
            }
        });
        function Node(key, val) {
            this.key = key;
            this.val = val;
            this.prev = this.next = null;
        }
        return LruCache;
    }();
    var PersistentStorage = function() {
        "use strict";
        var LOCAL_STORAGE;
        try {
            LOCAL_STORAGE = window.localStorage;
            LOCAL_STORAGE.setItem("~~~", "!");
            LOCAL_STORAGE.removeItem("~~~");
        } catch (err) {
            LOCAL_STORAGE = null;
        }
        function PersistentStorage(namespace, override) {
            this.prefix = [ "__", namespace, "__" ].join("");
            this.ttlKey = "__ttl__";
            this.keyMatcher = new RegExp("^" + _.escapeRegExChars(this.prefix));
            this.ls = override || LOCAL_STORAGE;
            !this.ls && this._noop();
        }
        _.mixin(PersistentStorage.prototype, {
            _prefix: function(key) {
                return this.prefix + key;
            },
            _ttlKey: function(key) {
                return this._prefix(key) + this.ttlKey;
            },
            _noop: function() {
                this.get = this.set = this.remove = this.clear = this.isExpired = _.noop;
            },
            _safeSet: function(key, val) {
                try {
                    this.ls.setItem(key, val);
                } catch (err) {
                    if (err.name === "QuotaExceededError") {
                        this.clear();
                        this._noop();
                    }
                }
            },
            get: function(key) {
                if (this.isExpired(key)) {
                    this.remove(key);
                }
                return decode(this.ls.getItem(this._prefix(key)));
            },
            set: function(key, val, ttl) {
                if (_.isNumber(ttl)) {
                    this._safeSet(this._ttlKey(key), encode(now() + ttl));
                } else {
                    this.ls.removeItem(this._ttlKey(key));
                }
                return this._safeSet(this._prefix(key), encode(val));
            },
            remove: function(key) {
                this.ls.removeItem(this._ttlKey(key));
                this.ls.removeItem(this._prefix(key));
                return this;
            },
            clear: function() {
                var i, keys = gatherMatchingKeys(this.keyMatcher);
                for (i = keys.length; i--; ) {
                    this.remove(keys[i]);
                }
                return this;
            },
            isExpired: function(key) {
                var ttl = decode(this.ls.getItem(this._ttlKey(key)));
                return _.isNumber(ttl) && now() > ttl ? true : false;
            }
        });
        return PersistentStorage;
        function now() {
            return new Date().getTime();
        }
        function encode(val) {
            return JSON.stringify(_.isUndefined(val) ? null : val);
        }
        function decode(val) {
            return $.parseJSON(val);
        }
        function gatherMatchingKeys(keyMatcher) {
            var i, key, keys = [], len = LOCAL_STORAGE.length;
            for (i = 0; i < len; i++) {
                if ((key = LOCAL_STORAGE.key(i)).match(keyMatcher)) {
                    keys.push(key.replace(keyMatcher, ""));
                }
            }
            return keys;
        }
    }();
    var Transport = function() {
        "use strict";
        var pendingRequestsCount = 0, pendingRequests = {}, maxPendingRequests = 6, sharedCache = new LruCache(10);
        function Transport(o) {
            o = o || {};
            this.cancelled = false;
            this.lastReq = null;
            this._send = o.transport;
            this._get = o.limiter ? o.limiter(this._get) : this._get;
            this._cache = o.cache === false ? new LruCache(0) : sharedCache;
        }
        Transport.setMaxPendingRequests = function setMaxPendingRequests(num) {
            maxPendingRequests = num;
        };
        Transport.resetCache = function resetCache() {
            sharedCache.reset();
        };
        _.mixin(Transport.prototype, {
            _fingerprint: function fingerprint(o) {
                o = o || {};
                return o.url + o.type + $.param(o.data || {});
            },
            _get: function(o, cb) {
                var that = this, fingerprint, jqXhr;
                fingerprint = this._fingerprint(o);
                if (this.cancelled || fingerprint !== this.lastReq) {
                    return;
                }
                if (jqXhr = pendingRequests[fingerprint]) {
                    jqXhr.done(done).fail(fail);
                } else if (pendingRequestsCount < maxPendingRequests) {
                    pendingRequestsCount++;
                    pendingRequests[fingerprint] = this._send(o).done(done).fail(fail).always(always);
                } else {
                    this.onDeckRequestArgs = [].slice.call(arguments, 0);
                }
                function done(resp) {
                    cb(null, resp);
                    that._cache.set(fingerprint, resp);
                }
                function fail() {
                    cb(true);
                }
                function always() {
                    pendingRequestsCount--;
                    delete pendingRequests[fingerprint];
                    if (that.onDeckRequestArgs) {
                        that._get.apply(that, that.onDeckRequestArgs);
                        that.onDeckRequestArgs = null;
                    }
                }
            },
            get: function(o, cb) {
                var resp, fingerprint;
                cb = cb || $.noop;
                o = _.isString(o) ? {
                    url: o
                } : o || {};
                fingerprint = this._fingerprint(o);
                this.cancelled = false;
                this.lastReq = fingerprint;
                if (resp = this._cache.get(fingerprint)) {
                    cb(null, resp);
                } else {
                    this._get(o, cb);
                }
            },
            cancel: function() {
                this.cancelled = true;
            }
        });
        return Transport;
    }();
    var SearchIndex = window.SearchIndex = function() {
        "use strict";
        var CHILDREN = "c", IDS = "i";
        function SearchIndex(o) {
            o = o || {};
            if (!o.datumTokenizer || !o.queryTokenizer) {
                $.error("datumTokenizer and queryTokenizer are both required");
            }
            this.identify = o.identify || _.stringify;
            this.datumTokenizer = o.datumTokenizer;
            this.queryTokenizer = o.queryTokenizer;
            this.reset();
        }
        _.mixin(SearchIndex.prototype, {
            bootstrap: function bootstrap(o) {
                this.datums = o.datums;
                this.trie = o.trie;
            },
            add: function(data) {
                var that = this;
                data = _.isArray(data) ? data : [ data ];
                _.each(data, function(datum) {
                    var id, tokens;
                    that.datums[id = that.identify(datum)] = datum;
                    tokens = normalizeTokens(that.datumTokenizer(datum));
                    _.each(tokens, function(token) {
                        var node, chars, ch;
                        node = that.trie;
                        chars = token.split("");
                        while (ch = chars.shift()) {
                            node = node[CHILDREN][ch] || (node[CHILDREN][ch] = newNode());
                            node[IDS].push(id);
                        }
                    });
                });
            },
            get: function get(ids) {
                var that = this;
                return _.map(ids, function(id) {
                    return that.datums[id];
                });
            },
            search: function search(query) {
                var that = this, tokens, matches;
                tokens = normalizeTokens(this.queryTokenizer(query));
                _.each(tokens, function(token) {
                    var node, chars, ch, ids;
                    if (matches && matches.length === 0) {
                        return false;
                    }
                    node = that.trie;
                    chars = token.split("");
                    while (node && (ch = chars.shift())) {
                        node = node[CHILDREN][ch];
                    }
                    if (node && chars.length === 0) {
                        ids = node[IDS].slice(0);
                        matches = matches ? getIntersection(matches, ids) : ids;
                    } else {
                        matches = [];
                        return false;
                    }
                });
                return matches ? _.map(unique(matches), function(id) {
                    return that.datums[id];
                }) : [];
            },
            all: function all() {
                var values = [];
                for (var key in this.datums) {
                    values.push(this.datums[key]);
                }
                return values;
            },
            reset: function reset() {
                this.datums = {};
                this.trie = newNode();
            },
            serialize: function serialize() {
                return {
                    datums: this.datums,
                    trie: this.trie
                };
            }
        });
        return SearchIndex;
        function normalizeTokens(tokens) {
            tokens = _.filter(tokens, function(token) {
                return !!token;
            });
            tokens = _.map(tokens, function(token) {
                return token.toLowerCase();
            });
            return tokens;
        }
        function newNode() {
            var node = {};
            node[IDS] = [];
            node[CHILDREN] = {};
            return node;
        }
        function unique(array) {
            var seen = {}, uniques = [];
            for (var i = 0, len = array.length; i < len; i++) {
                if (!seen[array[i]]) {
                    seen[array[i]] = true;
                    uniques.push(array[i]);
                }
            }
            return uniques;
        }
        function getIntersection(arrayA, arrayB) {
            var ai = 0, bi = 0, intersection = [];
            arrayA = arrayA.sort();
            arrayB = arrayB.sort();
            var lenArrayA = arrayA.length, lenArrayB = arrayB.length;
            while (ai < lenArrayA && bi < lenArrayB) {
                if (arrayA[ai] < arrayB[bi]) {
                    ai++;
                } else if (arrayA[ai] > arrayB[bi]) {
                    bi++;
                } else {
                    intersection.push(arrayA[ai]);
                    ai++;
                    bi++;
                }
            }
            return intersection;
        }
    }();
    var Prefetch = function() {
        "use strict";
        var keys;
        keys = {
            data: "data",
            protocol: "protocol",
            thumbprint: "thumbprint"
        };
        function Prefetch(o) {
            this.url = o.url;
            this.ttl = o.ttl;
            this.cache = o.cache;
            this.prepare = o.prepare;
            this.transform = o.transform;
            this.transport = o.transport;
            this.thumbprint = o.thumbprint;
            this.storage = new PersistentStorage(o.cacheKey);
        }
        _.mixin(Prefetch.prototype, {
            _settings: function settings() {
                return {
                    url: this.url,
                    type: "GET",
                    dataType: "json"
                };
            },
            store: function store(data) {
                if (!this.cache) {
                    return;
                }
                this.storage.set(keys.data, data, this.ttl);
                this.storage.set(keys.protocol, location.protocol, this.ttl);
                this.storage.set(keys.thumbprint, this.thumbprint, this.ttl);
            },
            fromCache: function fromCache() {
                var stored = {}, isExpired;
                if (!this.cache) {
                    return null;
                }
                stored.data = this.storage.get(keys.data);
                stored.protocol = this.storage.get(keys.protocol);
                stored.thumbprint = this.storage.get(keys.thumbprint);
                isExpired = stored.thumbprint !== this.thumbprint || stored.protocol !== location.protocol;
                return stored.data && !isExpired ? stored.data : null;
            },
            fromNetwork: function(cb) {
                var that = this, settings;
                if (!cb) {
                    return;
                }
                settings = this.prepare(this._settings());
                this.transport(settings).fail(onError).done(onResponse);
                function onError() {
                    cb(true);
                }
                function onResponse(resp) {
                    cb(null, that.transform(resp));
                }
            },
            clear: function clear() {
                this.storage.clear();
                return this;
            }
        });
        return Prefetch;
    }();
    var Remote = function() {
        "use strict";
        function Remote(o) {
            this.url = o.url;
            this.prepare = o.prepare;
            this.transform = o.transform;
            this.transport = new Transport({
                cache: o.cache,
                limiter: o.limiter,
                transport: o.transport
            });
        }
        _.mixin(Remote.prototype, {
            _settings: function settings() {
                return {
                    url: this.url,
                    type: "GET",
                    dataType: "json"
                };
            },
            get: function get(query, cb) {
                var that = this, settings;
                if (!cb) {
                    return;
                }
                query = query || "";
                settings = this.prepare(query, this._settings());
                return this.transport.get(settings, onResponse);
                function onResponse(err, resp) {
                    err ? cb([]) : cb(that.transform(resp));
                }
            },
            cancelLastRequest: function cancelLastRequest() {
                this.transport.cancel();
            }
        });
        return Remote;
    }();
    var oParser = function() {
        "use strict";
        return function parse(o) {
            var defaults, sorter;
            defaults = {
                initialize: true,
                identify: _.stringify,
                datumTokenizer: null,
                queryTokenizer: null,
                sufficient: 5,
                sorter: null,
                local: [],
                prefetch: null,
                remote: null
            };
            o = _.mixin(defaults, o || {});
            !o.datumTokenizer && $.error("datumTokenizer is required");
            !o.queryTokenizer && $.error("queryTokenizer is required");
            sorter = o.sorter;
            o.sorter = sorter ? function(x) {
                return x.sort(sorter);
            } : _.identity;
            o.local = _.isFunction(o.local) ? o.local() : o.local;
            o.prefetch = parsePrefetch(o.prefetch);
            o.remote = parseRemote(o.remote);
            return o;
        };
        function parsePrefetch(o) {
            var defaults;
            if (!o) {
                return null;
            }
            defaults = {
                url: null,
                ttl: 24 * 60 * 60 * 1e3,
                cache: true,
                cacheKey: null,
                thumbprint: "",
                prepare: _.identity,
                transform: _.identity,
                transport: null
            };
            o = _.isString(o) ? {
                url: o
            } : o;
            o = _.mixin(defaults, o);
            !o.url && $.error("prefetch requires url to be set");
            o.transform = o.filter || o.transform;
            o.cacheKey = o.cacheKey || o.url;
            o.thumbprint = VERSION + o.thumbprint;
            o.transport = o.transport ? callbackToDeferred(o.transport) : $.ajax;
            return o;
        }
        function parseRemote(o) {
            var defaults;
            if (!o) {
                return;
            }
            defaults = {
                url: null,
                cache: true,
                prepare: null,
                replace: null,
                wildcard: null,
                limiter: null,
                rateLimitBy: "debounce",
                rateLimitWait: 300,
                transform: _.identity,
                transport: null
            };
            o = _.isString(o) ? {
                url: o
            } : o;
            o = _.mixin(defaults, o);
            !o.url && $.error("remote requires url to be set");
            o.transform = o.filter || o.transform;
            o.prepare = toRemotePrepare(o);
            o.limiter = toLimiter(o);
            o.transport = o.transport ? callbackToDeferred(o.transport) : $.ajax;
            delete o.replace;
            delete o.wildcard;
            delete o.rateLimitBy;
            delete o.rateLimitWait;
            return o;
        }
        function toRemotePrepare(o) {
            var prepare, replace, wildcard;
            prepare = o.prepare;
            replace = o.replace;
            wildcard = o.wildcard;
            if (prepare) {
                return prepare;
            }
            if (replace) {
                prepare = prepareByReplace;
            } else if (o.wildcard) {
                prepare = prepareByWildcard;
            } else {
                prepare = idenityPrepare;
            }
            return prepare;
            function prepareByReplace(query, settings) {
                settings.url = replace(settings.url, query);
                return settings;
            }
            function prepareByWildcard(query, settings) {
                settings.url = settings.url.replace(wildcard, encodeURIComponent(query));
                return settings;
            }
            function idenityPrepare(query, settings) {
                return settings;
            }
        }
        function toLimiter(o) {
            var limiter, method, wait;
            limiter = o.limiter;
            method = o.rateLimitBy;
            wait = o.rateLimitWait;
            if (!limiter) {
                limiter = /^throttle$/i.test(method) ? throttle(wait) : debounce(wait);
            }
            return limiter;
            function debounce(wait) {
                return function debounce(fn) {
                    return _.debounce(fn, wait);
                };
            }
            function throttle(wait) {
                return function throttle(fn) {
                    return _.throttle(fn, wait);
                };
            }
        }
        function callbackToDeferred(fn) {
            return function wrapper(o) {
                var deferred = $.Deferred();
                fn(o, onSuccess, onError);
                return deferred;
                function onSuccess(resp) {
                    _.defer(function() {
                        deferred.resolve(resp);
                    });
                }
                function onError(err) {
                    _.defer(function() {
                        deferred.reject(err);
                    });
                }
            };
        }
    }();
    var Bloodhound = function() {
        "use strict";
        var old;
        old = window && window.Bloodhound;
        function Bloodhound(o) {
            o = oParser(o);
            this.sorter = o.sorter;
            this.identify = o.identify;
            this.sufficient = o.sufficient;
            this.local = o.local;
            this.remote = o.remote ? new Remote(o.remote) : null;
            this.prefetch = o.prefetch ? new Prefetch(o.prefetch) : null;
            this.index = new SearchIndex({
                identify: this.identify,
                datumTokenizer: o.datumTokenizer,
                queryTokenizer: o.queryTokenizer
            });
            o.initialize !== false && this.initialize();
        }
        Bloodhound.noConflict = function noConflict() {
            window && (window.Bloodhound = old);
            return Bloodhound;
        };
        Bloodhound.tokenizers = tokenizers;
        _.mixin(Bloodhound.prototype, {
            __ttAdapter: function ttAdapter() {
                var that = this;
                return this.remote ? withAsync : withoutAsync;
                function withAsync(query, sync, async) {
                    return that.search(query, sync, async);
                }
                function withoutAsync(query, sync) {
                    return that.search(query, sync);
                }
            },
            _loadPrefetch: function loadPrefetch() {
                var that = this, deferred, serialized;
                deferred = $.Deferred();
                if (!this.prefetch) {
                    deferred.resolve();
                } else if (serialized = this.prefetch.fromCache()) {
                    this.index.bootstrap(serialized);
                    deferred.resolve();
                } else {
                    this.prefetch.fromNetwork(done);
                }
                return deferred.promise();
                function done(err, data) {
                    if (err) {
                        return deferred.reject();
                    }
                    that.add(data);
                    that.prefetch.store(that.index.serialize());
                    deferred.resolve();
                }
            },
            _initialize: function initialize() {
                var that = this, deferred;
                this.clear();
                (this.initPromise = this._loadPrefetch()).done(addLocalToIndex);
                return this.initPromise;
                function addLocalToIndex() {
                    that.add(that.local);
                }
            },
            initialize: function initialize(force) {
                return !this.initPromise || force ? this._initialize() : this.initPromise;
            },
            add: function add(data) {
                this.index.add(data);
                return this;
            },
            get: function get(ids) {
                ids = _.isArray(ids) ? ids : [].slice.call(arguments);
                return this.index.get(ids);
            },
            search: function search(query, sync, async) {
                var that = this, local;
                local = this.sorter(this.index.search(query));
                sync(this.remote ? local.slice() : local);
                if (this.remote && local.length < this.sufficient) {
                    this.remote.get(query, processRemote);
                } else if (this.remote) {
                    this.remote.cancelLastRequest();
                }
                return this;
                function processRemote(remote) {
                    var nonDuplicates = [];
                    _.each(remote, function(r) {
                        !_.some(local, function(l) {
                            return that.identify(r) === that.identify(l);
                        }) && nonDuplicates.push(r);
                    });
                    async && async(nonDuplicates);
                }
            },
            all: function all() {
                return this.index.all();
            },
            clear: function clear() {
                this.index.reset();
                return this;
            },
            clearPrefetchCache: function clearPrefetchCache() {
                this.prefetch && this.prefetch.clear();
                return this;
            },
            clearRemoteCache: function clearRemoteCache() {
                Transport.resetCache();
                return this;
            },
            ttAdapter: function ttAdapter() {
                return this.__ttAdapter();
            }
        });
        return Bloodhound;
    }();
    return Bloodhound;
});

(function(root, factory) {
    if (typeof define === "function" && define.amd) {
        define("typeahead.js", [ "jquery" ], function(a0) {
            return factory(a0);
        });
    } else if (typeof exports === "object") {
        module.exports = factory(require("jquery"));
    } else {
        factory(jQuery);
    }
})(this, function($) {
    var _ = function() {
        "use strict";
        return {
            isMsie: function() {
                return /(msie|trident)/i.test(navigator.userAgent) ? navigator.userAgent.match(/(msie |rv:)(\d+(.\d+)?)/i)[2] : false;
            },
            isBlankString: function(str) {
                return !str || /^\s*$/.test(str);
            },
            escapeRegExChars: function(str) {
                return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
            },
            isString: function(obj) {
                return typeof obj === "string";
            },
            isNumber: function(obj) {
                return typeof obj === "number";
            },
            isArray: $.isArray,
            isFunction: $.isFunction,
            isObject: $.isPlainObject,
            isUndefined: function(obj) {
                return typeof obj === "undefined";
            },
            isElement: function(obj) {
                return !!(obj && obj.nodeType === 1);
            },
            isJQuery: function(obj) {
                return obj instanceof $;
            },
            toStr: function toStr(s) {
                return _.isUndefined(s) || s === null ? "" : s + "";
            },
            bind: $.proxy,
            each: function(collection, cb) {
                $.each(collection, reverseArgs);
                function reverseArgs(index, value) {
                    return cb(value, index);
                }
            },
            map: $.map,
            filter: $.grep,
            every: function(obj, test) {
                var result = true;
                if (!obj) {
                    return result;
                }
                $.each(obj, function(key, val) {
                    if (!(result = test.call(null, val, key, obj))) {
                        return false;
                    }
                });
                return !!result;
            },
            some: function(obj, test) {
                var result = false;
                if (!obj) {
                    return result;
                }
                $.each(obj, function(key, val) {
                    if (result = test.call(null, val, key, obj)) {
                        return false;
                    }
                });
                return !!result;
            },
            mixin: $.extend,
            identity: function(x) {
                return x;
            },
            clone: function(obj) {
                return $.extend(true, {}, obj);
            },
            getIdGenerator: function() {
                var counter = 0;
                return function() {
                    return counter++;
                };
            },
            templatify: function templatify(obj) {
                return $.isFunction(obj) ? obj : template;
                function template() {
                    return String(obj);
                }
            },
            defer: function(fn) {
                setTimeout(fn, 0);
            },
            debounce: function(func, wait, immediate) {
                var timeout, result;
                return function() {
                    var context = this, args = arguments, later, callNow;
                    later = function() {
                        timeout = null;
                        if (!immediate) {
                            result = func.apply(context, args);
                        }
                    };
                    callNow = immediate && !timeout;
                    clearTimeout(timeout);
                    timeout = setTimeout(later, wait);
                    if (callNow) {
                        result = func.apply(context, args);
                    }
                    return result;
                };
            },
            throttle: function(func, wait) {
                var context, args, timeout, result, previous, later;
                previous = 0;
                later = function() {
                    previous = new Date();
                    timeout = null;
                    result = func.apply(context, args);
                };
                return function() {
                    var now = new Date(), remaining = wait - (now - previous);
                    context = this;
                    args = arguments;
                    if (remaining <= 0) {
                        clearTimeout(timeout);
                        timeout = null;
                        previous = now;
                        result = func.apply(context, args);
                    } else if (!timeout) {
                        timeout = setTimeout(later, remaining);
                    }
                    return result;
                };
            },
            stringify: function(val) {
                return _.isString(val) ? val : JSON.stringify(val);
            },
            noop: function() {}
        };
    }();
    var WWW = function() {
        "use strict";
        var defaultClassNames = {
            wrapper: "twitter-typeahead",
            input: "tt-input",
            hint: "tt-hint",
            menu: "tt-menu",
            dataset: "tt-dataset",
            suggestion: "tt-suggestion",
            selectable: "tt-selectable",
            empty: "tt-empty",
            open: "tt-open",
            cursor: "tt-cursor",
            highlight: "tt-highlight"
        };
        return build;
        function build(o) {
            var www, classes;
            classes = _.mixin({}, defaultClassNames, o);
            www = {
                css: buildCss(),
                classes: classes,
                html: buildHtml(classes),
                selectors: buildSelectors(classes)
            };
            return {
                css: www.css,
                html: www.html,
                classes: www.classes,
                selectors: www.selectors,
                mixin: function(o) {
                    _.mixin(o, www);
                }
            };
        }
        function buildHtml(c) {
            return {
                wrapper: '<span class="' + c.wrapper + '"></span>',
                menu: '<div class="' + c.menu + '"></div>'
            };
        }
        function buildSelectors(classes) {
            var selectors = {};
            _.each(classes, function(v, k) {
                selectors[k] = "." + v;
            });
            return selectors;
        }
        function buildCss() {
            var css = {
                wrapper: {
                    position: "relative",
                    display: "inline-block"
                },
                hint: {
                    position: "absolute",
                    top: "0",
                    left: "0",
                    borderColor: "transparent",
                    boxShadow: "none",
                    opacity: "1"
                },
                input: {
                    position: "relative",
                    verticalAlign: "top",
                    backgroundColor: "transparent"
                },
                inputWithNoHint: {
                    position: "relative",
                    verticalAlign: "top"
                },
                menu: {
                    position: "absolute",
                    top: "100%",
                    left: "0",
                    zIndex: "100",
                    display: "none"
                },
                ltr: {
                    left: "0",
                    right: "auto"
                },
                rtl: {
                    left: "auto",
                    right: " 0"
                }
            };
            if (_.isMsie()) {
                _.mixin(css.input, {
                    backgroundImage: "url(data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7)"
                });
            }
            return css;
        }
    }();
    var EventBus = function() {
        "use strict";
        var namespace, deprecationMap;
        namespace = "typeahead:";
        deprecationMap = {
            render: "rendered",
            cursorchange: "cursorchanged",
            select: "selected",
            autocomplete: "autocompleted"
        };
        function EventBus(o) {
            if (!o || !o.el) {
                $.error("EventBus initialized without el");
            }
            this.$el = $(o.el);
        }
        _.mixin(EventBus.prototype, {
            _trigger: function(type, args) {
                var $e;
                $e = $.Event(namespace + type);
                (args = args || []).unshift($e);
                this.$el.trigger.apply(this.$el, args);
                return $e;
            },
            before: function(type) {
                var args, $e;
                args = [].slice.call(arguments, 1);
                $e = this._trigger("before" + type, args);
                return $e.isDefaultPrevented();
            },
            trigger: function(type) {
                var deprecatedType;
                this._trigger(type, [].slice.call(arguments, 1));
                if (deprecatedType = deprecationMap[type]) {
                    this._trigger(deprecatedType, [].slice.call(arguments, 1));
                }
            }
        });
        return EventBus;
    }();
    var EventEmitter = function() {
        "use strict";
        var splitter = /\s+/, nextTick = getNextTick();
        return {
            onSync: onSync,
            onAsync: onAsync,
            off: off,
            trigger: trigger
        };
        function on(method, types, cb, context) {
            var type;
            if (!cb) {
                return this;
            }
            types = types.split(splitter);
            cb = context ? bindContext(cb, context) : cb;
            this._callbacks = this._callbacks || {};
            while (type = types.shift()) {
                this._callbacks[type] = this._callbacks[type] || {
                    sync: [],
                    async: []
                };
                this._callbacks[type][method].push(cb);
            }
            return this;
        }
        function onAsync(types, cb, context) {
            return on.call(this, "async", types, cb, context);
        }
        function onSync(types, cb, context) {
            return on.call(this, "sync", types, cb, context);
        }
        function off(types) {
            var type;
            if (!this._callbacks) {
                return this;
            }
            types = types.split(splitter);
            while (type = types.shift()) {
                delete this._callbacks[type];
            }
            return this;
        }
        function trigger(types) {
            var type, callbacks, args, syncFlush, asyncFlush;
            if (!this._callbacks) {
                return this;
            }
            types = types.split(splitter);
            args = [].slice.call(arguments, 1);
            while ((type = types.shift()) && (callbacks = this._callbacks[type])) {
                syncFlush = getFlush(callbacks.sync, this, [ type ].concat(args));
                asyncFlush = getFlush(callbacks.async, this, [ type ].concat(args));
                syncFlush() && nextTick(asyncFlush);
            }
            return this;
        }
        function getFlush(callbacks, context, args) {
            return flush;
            function flush() {
                var cancelled;
                for (var i = 0, len = callbacks.length; !cancelled && i < len; i += 1) {
                    cancelled = callbacks[i].apply(context, args) === false;
                }
                return !cancelled;
            }
        }
        function getNextTick() {
            var nextTickFn;
            if (window.setImmediate) {
                nextTickFn = function nextTickSetImmediate(fn) {
                    setImmediate(function() {
                        fn();
                    });
                };
            } else {
                nextTickFn = function nextTickSetTimeout(fn) {
                    setTimeout(function() {
                        fn();
                    }, 0);
                };
            }
            return nextTickFn;
        }
        function bindContext(fn, context) {
            return fn.bind ? fn.bind(context) : function() {
                fn.apply(context, [].slice.call(arguments, 0));
            };
        }
    }();
    var highlight = function(doc) {
        "use strict";
        var defaults = {
            node: null,
            pattern: null,
            tagName: "strong",
            className: null,
            wordsOnly: false,
            caseSensitive: false
        };
        return function hightlight(o) {
            var regex;
            o = _.mixin({}, defaults, o);
            if (!o.node || !o.pattern) {
                return;
            }
            o.pattern = _.isArray(o.pattern) ? o.pattern : [ o.pattern ];
            regex = getRegex(o.pattern, o.caseSensitive, o.wordsOnly);
            traverse(o.node, hightlightTextNode);
            function hightlightTextNode(textNode) {
                var match, patternNode, wrapperNode;
                if (match = regex.exec(textNode.data)) {
                    wrapperNode = doc.createElement(o.tagName);
                    o.className && (wrapperNode.className = o.className);
                    patternNode = textNode.splitText(match.index);
                    patternNode.splitText(match[0].length);
                    wrapperNode.appendChild(patternNode.cloneNode(true));
                    textNode.parentNode.replaceChild(wrapperNode, patternNode);
                }
                return !!match;
            }
            function traverse(el, hightlightTextNode) {
                var childNode, TEXT_NODE_TYPE = 3;
                for (var i = 0; i < el.childNodes.length; i++) {
                    childNode = el.childNodes[i];
                    if (childNode.nodeType === TEXT_NODE_TYPE) {
                        i += hightlightTextNode(childNode) ? 1 : 0;
                    } else {
                        traverse(childNode, hightlightTextNode);
                    }
                }
            }
        };
        function getRegex(patterns, caseSensitive, wordsOnly) {
            var escapedPatterns = [], regexStr;
            for (var i = 0, len = patterns.length; i < len; i++) {
                escapedPatterns.push(_.escapeRegExChars(patterns[i]));
            }
            regexStr = wordsOnly ? "\\b(" + escapedPatterns.join("|") + ")\\b" : "(" + escapedPatterns.join("|") + ")";
            return caseSensitive ? new RegExp(regexStr) : new RegExp(regexStr, "i");
        }
    }(window.document);
    var Input = function() {
        "use strict";
        var specialKeyCodeMap;
        specialKeyCodeMap = {
            9: "tab",
            27: "esc",
            37: "left",
            39: "right",
            13: "enter",
            38: "up",
            40: "down"
        };
        function Input(o, www) {
            o = o || {};
            if (!o.input) {
                $.error("input is missing");
            }
            www.mixin(this);
            this.$hint = $(o.hint);
            this.$input = $(o.input);
            this.query = this.$input.val();
            this.queryWhenFocused = this.hasFocus() ? this.query : null;
            this.$overflowHelper = buildOverflowHelper(this.$input);
            this._checkLanguageDirection();
            if (this.$hint.length === 0) {
                this.setHint = this.getHint = this.clearHint = this.clearHintIfInvalid = _.noop;
            }
        }
        Input.normalizeQuery = function(str) {
            return _.toStr(str).replace(/^\s*/g, "").replace(/\s{2,}/g, " ");
        };
        _.mixin(Input.prototype, EventEmitter, {
            _onBlur: function onBlur() {
                this.resetInputValue();
                this.trigger("blurred");
            },
            _onFocus: function onFocus() {
                this.queryWhenFocused = this.query;
                this.trigger("focused");
            },
            _onKeydown: function onKeydown($e) {
                var keyName = specialKeyCodeMap[$e.which || $e.keyCode];
                this._managePreventDefault(keyName, $e);
                if (keyName && this._shouldTrigger(keyName, $e)) {
                    this.trigger(keyName + "Keyed", $e);
                }
            },
            _onInput: function onInput() {
                this._setQuery(this.getInputValue());
                this.clearHintIfInvalid();
                this._checkLanguageDirection();
            },
            _managePreventDefault: function managePreventDefault(keyName, $e) {
                var preventDefault;
                switch (keyName) {
                  case "up":
                  case "down":
                    preventDefault = !withModifier($e);
                    break;

                  default:
                    preventDefault = false;
                }
                preventDefault && $e.preventDefault();
            },
            _shouldTrigger: function shouldTrigger(keyName, $e) {
                var trigger;
                switch (keyName) {
                  case "tab":
                    trigger = !withModifier($e);
                    break;

                  default:
                    trigger = true;
                }
                return trigger;
            },
            _checkLanguageDirection: function checkLanguageDirection() {
                var dir = (this.$input.css("direction") || "ltr").toLowerCase();
                if (this.dir !== dir) {
                    this.dir = dir;
                    this.$hint.attr("dir", dir);
                    this.trigger("langDirChanged", dir);
                }
            },
            _setQuery: function setQuery(val, silent) {
                var areEquivalent, hasDifferentWhitespace;
                areEquivalent = areQueriesEquivalent(val, this.query);
                hasDifferentWhitespace = areEquivalent ? this.query.length !== val.length : false;
                this.query = val;
                if (!silent && !areEquivalent) {
                    this.trigger("queryChanged", this.query);
                } else if (!silent && hasDifferentWhitespace) {
                    this.trigger("whitespaceChanged", this.query);
                }
            },
            bind: function() {
                var that = this, onBlur, onFocus, onKeydown, onInput;
                onBlur = _.bind(this._onBlur, this);
                onFocus = _.bind(this._onFocus, this);
                onKeydown = _.bind(this._onKeydown, this);
                onInput = _.bind(this._onInput, this);
                this.$input.on("blur.tt", onBlur).on("focus.tt", onFocus).on("keydown.tt", onKeydown);
                if (!_.isMsie() || _.isMsie() > 9) {
                    this.$input.on("input.tt", onInput);
                } else {
                    this.$input.on("keydown.tt keypress.tt cut.tt paste.tt", function($e) {
                        if (specialKeyCodeMap[$e.which || $e.keyCode]) {
                            return;
                        }
                        _.defer(_.bind(that._onInput, that, $e));
                    });
                }
                return this;
            },
            focus: function focus() {
                this.$input.focus();
            },
            blur: function blur() {
                this.$input.blur();
            },
            getLangDir: function getLangDir() {
                return this.dir;
            },
            getQuery: function getQuery() {
                return this.query || "";
            },
            setQuery: function setQuery(val, silent) {
                this.setInputValue(val);
                this._setQuery(val, silent);
            },
            hasQueryChangedSinceLastFocus: function hasQueryChangedSinceLastFocus() {
                return this.query !== this.queryWhenFocused;
            },
            getInputValue: function getInputValue() {
                return this.$input.val();
            },
            setInputValue: function setInputValue(value) {
                this.$input.val(value);
                this.clearHintIfInvalid();
                this._checkLanguageDirection();
            },
            resetInputValue: function resetInputValue() {
                this.setInputValue(this.query);
            },
            getHint: function getHint() {
                return this.$hint.val();
            },
            setHint: function setHint(value) {
                this.$hint.val(value);
            },
            clearHint: function clearHint() {
                this.setHint("");
            },
            clearHintIfInvalid: function clearHintIfInvalid() {
                var val, hint, valIsPrefixOfHint, isValid;
                val = this.getInputValue();
                hint = this.getHint();
                valIsPrefixOfHint = val !== hint && hint.indexOf(val) === 0;
                isValid = val !== "" && valIsPrefixOfHint && !this.hasOverflow();
                !isValid && this.clearHint();
            },
            hasFocus: function hasFocus() {
                return this.$input.is(":focus");
            },
            hasOverflow: function hasOverflow() {
                var constraint = this.$input.width() - 2;
                this.$overflowHelper.text(this.getInputValue());
                return this.$overflowHelper.width() >= constraint;
            },
            isCursorAtEnd: function() {
                var valueLength, selectionStart, range;
                valueLength = this.$input.val().length;
                selectionStart = this.$input[0].selectionStart;
                if (_.isNumber(selectionStart)) {
                    return selectionStart === valueLength;
                } else if (document.selection) {
                    range = document.selection.createRange();
                    range.moveStart("character", -valueLength);
                    return valueLength === range.text.length;
                }
                return true;
            },
            destroy: function destroy() {
                this.$hint.off(".tt");
                this.$input.off(".tt");
                this.$overflowHelper.remove();
                this.$hint = this.$input = this.$overflowHelper = $("<div>");
            }
        });
        return Input;
        function buildOverflowHelper($input) {
            return $('<pre aria-hidden="true"></pre>').css({
                position: "absolute",
                visibility: "hidden",
                whiteSpace: "pre",
                fontFamily: $input.css("font-family"),
                fontSize: $input.css("font-size"),
                fontStyle: $input.css("font-style"),
                fontVariant: $input.css("font-variant"),
                fontWeight: $input.css("font-weight"),
                wordSpacing: $input.css("word-spacing"),
                letterSpacing: $input.css("letter-spacing"),
                textIndent: $input.css("text-indent"),
                textRendering: $input.css("text-rendering"),
                textTransform: $input.css("text-transform")
            }).insertAfter($input);
        }
        function areQueriesEquivalent(a, b) {
            return Input.normalizeQuery(a) === Input.normalizeQuery(b);
        }
        function withModifier($e) {
            return $e.altKey || $e.ctrlKey || $e.metaKey || $e.shiftKey;
        }
    }();
    var Dataset = function() {
        "use strict";
        var keys, nameGenerator;
        keys = {
            val: "tt-selectable-display",
            obj: "tt-selectable-object"
        };
        nameGenerator = _.getIdGenerator();
        function Dataset(o, www) {
            o = o || {};
            o.templates = o.templates || {};
            o.templates.notFound = o.templates.notFound || o.templates.empty;
            if (!o.source) {
                $.error("missing source");
            }
            if (!o.node) {
                $.error("missing node");
            }
            if (o.name && !isValidName(o.name)) {
                $.error("invalid dataset name: " + o.name);
            }
            www.mixin(this);
            this.highlight = !!o.highlight;
            this.name = o.name || nameGenerator();
            this.limit = o.limit || 5;
            this.displayFn = getDisplayFn(o.display || o.displayKey);
            this.templates = getTemplates(o.templates, this.displayFn);
            this.source = o.source.__ttAdapter ? o.source.__ttAdapter() : o.source;
            this.async = _.isUndefined(o.async) ? this.source.length > 2 : !!o.async;
            this._resetLastSuggestion();
            this.$el = $(o.node).addClass(this.classes.dataset).addClass(this.classes.dataset + "-" + this.name);
        }
        Dataset.extractData = function extractData(el) {
            var $el = $(el);
            if ($el.data(keys.obj)) {
                return {
                    val: $el.data(keys.val) || "",
                    obj: $el.data(keys.obj) || null
                };
            }
            return null;
        };
        _.mixin(Dataset.prototype, EventEmitter, {
            _overwrite: function overwrite(query, suggestions) {
                suggestions = suggestions || [];
                if (suggestions.length) {
                    this._renderSuggestions(query, suggestions);
                } else if (this.async && this.templates.pending) {
                    this._renderPending(query);
                } else if (!this.async && this.templates.notFound) {
                    this._renderNotFound(query);
                } else {
                    this._empty();
                }
                this.trigger("rendered", this.name, suggestions, false);
            },
            _append: function append(query, suggestions) {
                suggestions = suggestions || [];
                if (suggestions.length && this.$lastSuggestion.length) {
                    this._appendSuggestions(query, suggestions);
                } else if (suggestions.length) {
                    this._renderSuggestions(query, suggestions);
                } else if (!this.$lastSuggestion.length && this.templates.notFound) {
                    this._renderNotFound(query);
                }
                this.trigger("rendered", this.name, suggestions, true);
            },
            _renderSuggestions: function renderSuggestions(query, suggestions) {
                var $fragment;
                $fragment = this._getSuggestionsFragment(query, suggestions);
                this.$lastSuggestion = $fragment.children().last();
                this.$el.html($fragment).prepend(this._getHeader(query, suggestions)).append(this._getFooter(query, suggestions));
            },
            _appendSuggestions: function appendSuggestions(query, suggestions) {
                var $fragment, $lastSuggestion;
                $fragment = this._getSuggestionsFragment(query, suggestions);
                $lastSuggestion = $fragment.children().last();
                this.$lastSuggestion.after($fragment);
                this.$lastSuggestion = $lastSuggestion;
            },
            _renderPending: function renderPending(query) {
                var template = this.templates.pending;
                this._resetLastSuggestion();
                template && this.$el.html(template({
                    query: query,
                    dataset: this.name
                }));
            },
            _renderNotFound: function renderNotFound(query) {
                var template = this.templates.notFound;
                this._resetLastSuggestion();
                template && this.$el.html(template({
                    query: query,
                    dataset: this.name
                }));
            },
            _empty: function empty() {
                this.$el.empty();
                this._resetLastSuggestion();
            },
            _getSuggestionsFragment: function getSuggestionsFragment(query, suggestions) {
                var that = this, fragment;
                fragment = document.createDocumentFragment();
                _.each(suggestions, function getSuggestionNode(suggestion) {
                    var $el, context;
                    context = that._injectQuery(query, suggestion);
                    $el = $(that.templates.suggestion(context)).data(keys.obj, suggestion).data(keys.val, that.displayFn(suggestion)).addClass(that.classes.suggestion + " " + that.classes.selectable);
                    fragment.appendChild($el[0]);
                });
                this.highlight && highlight({
                    className: this.classes.highlight,
                    node: fragment,
                    pattern: query
                });
                return $(fragment);
            },
            _getFooter: function getFooter(query, suggestions) {
                return this.templates.footer ? this.templates.footer({
                    query: query,
                    suggestions: suggestions,
                    dataset: this.name
                }) : null;
            },
            _getHeader: function getHeader(query, suggestions) {
                return this.templates.header ? this.templates.header({
                    query: query,
                    suggestions: suggestions,
                    dataset: this.name
                }) : null;
            },
            _resetLastSuggestion: function resetLastSuggestion() {
                this.$lastSuggestion = $();
            },
            _injectQuery: function injectQuery(query, obj) {
                return _.isObject(obj) ? _.mixin({
                    _query: query
                }, obj) : obj;
            },
            update: function update(query) {
                var that = this, canceled = false, syncCalled = false, rendered = 0;
                this.cancel();
                this.cancel = function cancel() {
                    canceled = true;
                    that.cancel = $.noop;
                    that.async && that.trigger("asyncCanceled", query);
                };
                this.source(query, sync, async);
                !syncCalled && sync([]);
                function sync(suggestions) {
                    if (syncCalled) {
                        return;
                    }
                    syncCalled = true;
                    suggestions = (suggestions || []).slice(0, that.limit);
                    rendered = suggestions.length;
                    that._overwrite(query, suggestions);
                    if (rendered < that.limit && that.async) {
                        that.trigger("asyncRequested", query);
                    }
                }
                function async(suggestions) {
                    suggestions = suggestions || [];
                    if (!canceled && rendered < that.limit) {
                        that.cancel = $.noop;
                        rendered += suggestions.length;
                        that._append(query, suggestions.slice(0, that.limit - rendered));
                        that.async && that.trigger("asyncReceived", query);
                    }
                }
            },
            cancel: $.noop,
            clear: function clear() {
                this._empty();
                this.cancel();
                this.trigger("cleared");
            },
            isEmpty: function isEmpty() {
                return this.$el.is(":empty");
            },
            destroy: function destroy() {
                this.$el = $("<div>");
            }
        });
        return Dataset;
        function getDisplayFn(display) {
            display = display || _.stringify;
            return _.isFunction(display) ? display : displayFn;
            function displayFn(obj) {
                return obj[display];
            }
        }
        function getTemplates(templates, displayFn) {
            return {
                notFound: templates.notFound && _.templatify(templates.notFound),
                pending: templates.pending && _.templatify(templates.pending),
                header: templates.header && _.templatify(templates.header),
                footer: templates.footer && _.templatify(templates.footer),
                suggestion: templates.suggestion || suggestionTemplate
            };
            function suggestionTemplate(context) {
                return $("<div>").text(displayFn(context));
            }
        }
        function isValidName(str) {
            return /^[_a-zA-Z0-9-]+$/.test(str);
        }
    }();
    var Menu = function() {
        "use strict";
        function Menu(o, www) {
            var that = this;
            o = o || {};
            if (!o.node) {
                $.error("node is required");
            }
            www.mixin(this);
            this.$node = $(o.node);
            this.query = null;
            this.datasets = _.map(o.datasets, initializeDataset);
            function initializeDataset(oDataset) {
                var node = that.$node.find(oDataset.node).first();
                oDataset.node = node.length ? node : $("<div>").appendTo(that.$node);
                return new Dataset(oDataset, www);
            }
        }
        _.mixin(Menu.prototype, EventEmitter, {
            _onSelectableClick: function onSelectableClick($e) {
                this.trigger("selectableClicked", $($e.currentTarget));
            },
            _onRendered: function onRendered(type, dataset, suggestions, async) {
                this.$node.toggleClass(this.classes.empty, this._allDatasetsEmpty());
                this.trigger("datasetRendered", dataset, suggestions, async);
            },
            _onCleared: function onCleared() {
                this.$node.toggleClass(this.classes.empty, this._allDatasetsEmpty());
                this.trigger("datasetCleared");
            },
            _propagate: function propagate() {
                this.trigger.apply(this, arguments);
            },
            _allDatasetsEmpty: function allDatasetsEmpty() {
                return _.every(this.datasets, isDatasetEmpty);
                function isDatasetEmpty(dataset) {
                    return dataset.isEmpty();
                }
            },
            _getSelectables: function getSelectables() {
                return this.$node.find(this.selectors.selectable);
            },
            _removeCursor: function _removeCursor() {
                var $selectable = this.getActiveSelectable();
                $selectable && $selectable.removeClass(this.classes.cursor);
            },
            _ensureVisible: function ensureVisible($el) {
                var elTop, elBottom, nodeScrollTop, nodeHeight;
                elTop = $el.position().top;
                elBottom = elTop + $el.outerHeight(true);
                nodeScrollTop = this.$node.scrollTop();
                nodeHeight = this.$node.height() + parseInt(this.$node.css("paddingTop"), 10) + parseInt(this.$node.css("paddingBottom"), 10);
                if (elTop < 0) {
                    this.$node.scrollTop(nodeScrollTop + elTop);
                } else if (nodeHeight < elBottom) {
                    this.$node.scrollTop(nodeScrollTop + (elBottom - nodeHeight));
                }
            },
            bind: function() {
                var that = this, onSelectableClick;
                onSelectableClick = _.bind(this._onSelectableClick, this);
                this.$node.on("click.tt", this.selectors.selectable, onSelectableClick);
                _.each(this.datasets, function(dataset) {
                    dataset.onSync("asyncRequested", that._propagate, that).onSync("asyncCanceled", that._propagate, that).onSync("asyncReceived", that._propagate, that).onSync("rendered", that._onRendered, that).onSync("cleared", that._onCleared, that);
                });
                return this;
            },
            isOpen: function isOpen() {
                return this.$node.hasClass(this.classes.open);
            },
            open: function open() {
                this.$node.addClass(this.classes.open);
            },
            close: function close() {
                this.$node.removeClass(this.classes.open);
                this._removeCursor();
            },
            setLanguageDirection: function setLanguageDirection(dir) {
                this.$node.attr("dir", dir);
            },
            selectableRelativeToCursor: function selectableRelativeToCursor(delta) {
                var $selectables, $oldCursor, oldIndex, newIndex;
                $oldCursor = this.getActiveSelectable();
                $selectables = this._getSelectables();
                oldIndex = $oldCursor ? $selectables.index($oldCursor) : -1;
                newIndex = oldIndex + delta;
                newIndex = (newIndex + 1) % ($selectables.length + 1) - 1;
                newIndex = newIndex < -1 ? $selectables.length - 1 : newIndex;
                return newIndex === -1 ? null : $selectables.eq(newIndex);
            },
            setCursor: function setCursor($selectable) {
                this._removeCursor();
                if ($selectable = $selectable && $selectable.first()) {
                    $selectable.addClass(this.classes.cursor);
                    this._ensureVisible($selectable);
                }
            },
            getSelectableData: function getSelectableData($el) {
                return $el && $el.length ? Dataset.extractData($el) : null;
            },
            getActiveSelectable: function getActiveSelectable() {
                var $selectable = this._getSelectables().filter(this.selectors.cursor).first();
                return $selectable.length ? $selectable : null;
            },
            getTopSelectable: function getTopSelectable() {
                var $selectable = this._getSelectables().first();
                return $selectable.length ? $selectable : null;
            },
            update: function update(query) {
                var isValidUpdate = query !== this.query;
                if (isValidUpdate) {
                    this.query = query;
                    _.each(this.datasets, updateDataset);
                }
                return isValidUpdate;
                function updateDataset(dataset) {
                    dataset.update(query);
                }
            },
            empty: function empty() {
                _.each(this.datasets, clearDataset);
                this.query = null;
                this.$node.addClass(this.classes.empty);
                function clearDataset(dataset) {
                    dataset.clear();
                }
            },
            destroy: function destroy() {
                this.$node.off(".tt");
                this.$node = $("<div>");
                _.each(this.datasets, destroyDataset);
                function destroyDataset(dataset) {
                    dataset.destroy();
                }
            }
        });
        return Menu;
    }();
    var DefaultMenu = function() {
        "use strict";
        var s = Menu.prototype;
        function DefaultMenu() {
            Menu.apply(this, [].slice.call(arguments, 0));
        }
        _.mixin(DefaultMenu.prototype, Menu.prototype, {
            open: function open() {
                !this._allDatasetsEmpty() && this._show();
                return s.open.apply(this, [].slice.call(arguments, 0));
            },
            close: function close() {
                this._hide();
                return s.close.apply(this, [].slice.call(arguments, 0));
            },
            _onRendered: function onRendered() {
                if (this._allDatasetsEmpty()) {
                    this._hide();
                } else {
                    this.isOpen() && this._show();
                }
                return s._onRendered.apply(this, [].slice.call(arguments, 0));
            },
            _onCleared: function onCleared() {
                if (this._allDatasetsEmpty()) {
                    this._hide();
                } else {
                    this.isOpen() && this._show();
                }
                return s._onCleared.apply(this, [].slice.call(arguments, 0));
            },
            setLanguageDirection: function setLanguageDirection(dir) {
                this.$node.css(dir === "ltr" ? this.css.ltr : this.css.rtl);
                return s.setLanguageDirection.apply(this, [].slice.call(arguments, 0));
            },
            _hide: function hide() {
                this.$node.hide();
            },
            _show: function show() {
                this.$node.css("display", "block");
            }
        });
        return DefaultMenu;
    }();
    var Typeahead = function() {
        "use strict";
        function Typeahead(o, www) {
            var onFocused, onBlurred, onEnterKeyed, onTabKeyed, onEscKeyed, onUpKeyed, onDownKeyed, onLeftKeyed, onRightKeyed, onQueryChanged, onWhitespaceChanged;
            o = o || {};
            if (!o.input) {
                $.error("missing input");
            }
            if (!o.menu) {
                $.error("missing menu");
            }
            if (!o.eventBus) {
                $.error("missing event bus");
            }
            www.mixin(this);
            this.eventBus = o.eventBus;
            this.minLength = _.isNumber(o.minLength) ? o.minLength : 1;
            this.input = o.input;
            this.menu = o.menu;
            this.enabled = true;
            this.active = false;
            this.input.hasFocus() && this.activate();
            this.dir = this.input.getLangDir();
            this._hacks();
            this.menu.bind().onSync("selectableClicked", this._onSelectableClicked, this).onSync("asyncRequested", this._onAsyncRequested, this).onSync("asyncCanceled", this._onAsyncCanceled, this).onSync("asyncReceived", this._onAsyncReceived, this).onSync("datasetRendered", this._onDatasetRendered, this).onSync("datasetCleared", this._onDatasetCleared, this);
            onFocused = c(this, "activate", "open", "_onFocused");
            onBlurred = c(this, "deactivate", "_onBlurred");
            onEnterKeyed = c(this, "isActive", "isOpen", "_onEnterKeyed");
            onTabKeyed = c(this, "isActive", "isOpen", "_onTabKeyed");
            onEscKeyed = c(this, "isActive", "_onEscKeyed");
            onUpKeyed = c(this, "isActive", "open", "_onUpKeyed");
            onDownKeyed = c(this, "isActive", "open", "_onDownKeyed");
            onLeftKeyed = c(this, "isActive", "isOpen", "_onLeftKeyed");
            onRightKeyed = c(this, "isActive", "isOpen", "_onRightKeyed");
            onQueryChanged = c(this, "_openIfActive", "_onQueryChanged");
            onWhitespaceChanged = c(this, "_openIfActive", "_onWhitespaceChanged");
            this.input.bind().onSync("focused", onFocused, this).onSync("blurred", onBlurred, this).onSync("enterKeyed", onEnterKeyed, this).onSync("tabKeyed", onTabKeyed, this).onSync("escKeyed", onEscKeyed, this).onSync("upKeyed", onUpKeyed, this).onSync("downKeyed", onDownKeyed, this).onSync("leftKeyed", onLeftKeyed, this).onSync("rightKeyed", onRightKeyed, this).onSync("queryChanged", onQueryChanged, this).onSync("whitespaceChanged", onWhitespaceChanged, this).onSync("langDirChanged", this._onLangDirChanged, this);
        }
        _.mixin(Typeahead.prototype, {
            _hacks: function hacks() {
                var $input, $menu;
                $input = this.input.$input || $("<div>");
                $menu = this.menu.$node || $("<div>");
                $input.on("blur.tt", function($e) {
                    var active, isActive, hasActive;
                    active = document.activeElement;
                    isActive = $menu.is(active);
                    hasActive = $menu.has(active).length > 0;
                    if (_.isMsie() && (isActive || hasActive)) {
                        $e.preventDefault();
                        $e.stopImmediatePropagation();
                        _.defer(function() {
                            $input.focus();
                        });
                    }
                });
                $menu.on("mousedown.tt", function($e) {
                    $e.preventDefault();
                });
            },
            _onSelectableClicked: function onSelectableClicked(type, $el) {
                this.select($el);
            },
            _onDatasetCleared: function onDatasetCleared() {
                this._updateHint();
            },
            _onDatasetRendered: function onDatasetRendered(type, dataset, suggestions, async) {
                this._updateHint();
                this.eventBus.trigger("render", suggestions, async, dataset);
            },
            _onAsyncRequested: function onAsyncRequested(type, dataset, query) {
                this.eventBus.trigger("asyncrequest", query, dataset);
            },
            _onAsyncCanceled: function onAsyncCanceled(type, dataset, query) {
                this.eventBus.trigger("asynccancel", query, dataset);
            },
            _onAsyncReceived: function onAsyncReceived(type, dataset, query) {
                this.eventBus.trigger("asyncreceive", query, dataset);
            },
            _onFocused: function onFocused() {
                this._minLengthMet() && this.menu.update(this.input.getQuery());
            },
            _onBlurred: function onBlurred() {
                if (this.input.hasQueryChangedSinceLastFocus()) {
                    this.eventBus.trigger("change", this.input.getQuery());
                }
            },
            _onEnterKeyed: function onEnterKeyed(type, $e) {
                var $selectable;
                if ($selectable = this.menu.getActiveSelectable()) {
                    this.select($selectable) && $e.preventDefault();
                }
            },
            _onTabKeyed: function onTabKeyed(type, $e) {
                var $selectable;
                if ($selectable = this.menu.getActiveSelectable()) {
                    this.select($selectable) && $e.preventDefault();
                } else if ($selectable = this.menu.getTopSelectable()) {
                    this.autocomplete($selectable) && $e.preventDefault();
                }
            },
            _onEscKeyed: function onEscKeyed() {
                this.close();
            },
            _onUpKeyed: function onUpKeyed() {
                this.moveCursor(-1);
            },
            _onDownKeyed: function onDownKeyed() {
                this.moveCursor(+1);
            },
            _onLeftKeyed: function onLeftKeyed() {
                if (this.dir === "rtl" && this.input.isCursorAtEnd()) {
                    this.autocomplete(this.menu.getTopSelectable());
                }
            },
            _onRightKeyed: function onRightKeyed() {
                if (this.dir === "ltr" && this.input.isCursorAtEnd()) {
                    this.autocomplete(this.menu.getTopSelectable());
                }
            },
            _onQueryChanged: function onQueryChanged(e, query) {
                this._minLengthMet(query) ? this.menu.update(query) : this.menu.empty();
            },
            _onWhitespaceChanged: function onWhitespaceChanged() {
                this._updateHint();
            },
            _onLangDirChanged: function onLangDirChanged(e, dir) {
                if (this.dir !== dir) {
                    this.dir = dir;
                    this.menu.setLanguageDirection(dir);
                }
            },
            _openIfActive: function openIfActive() {
                this.isActive() && this.open();
            },
            _minLengthMet: function minLengthMet(query) {
                query = _.isString(query) ? query : this.input.getQuery() || "";
                return query.length >= this.minLength;
            },
            _updateHint: function updateHint() {
                var $selectable, data, val, query, escapedQuery, frontMatchRegEx, match;
                $selectable = this.menu.getTopSelectable();
                data = this.menu.getSelectableData($selectable);
                val = this.input.getInputValue();
                if (data && !_.isBlankString(val) && !this.input.hasOverflow()) {
                    query = Input.normalizeQuery(val);
                    escapedQuery = _.escapeRegExChars(query);
                    frontMatchRegEx = new RegExp("^(?:" + escapedQuery + ")(.+$)", "i");
                    match = frontMatchRegEx.exec(data.val);
                    match && this.input.setHint(val + match[1]);
                } else {
                    this.input.clearHint();
                }
            },
            isEnabled: function isEnabled() {
                return this.enabled;
            },
            enable: function enable() {
                this.enabled = true;
            },
            disable: function disable() {
                this.enabled = false;
            },
            isActive: function isActive() {
                return this.active;
            },
            activate: function activate() {
                if (this.isActive()) {
                    return true;
                } else if (!this.isEnabled() || this.eventBus.before("active")) {
                    return false;
                } else {
                    this.active = true;
                    this.eventBus.trigger("active");
                    return true;
                }
            },
            deactivate: function deactivate() {
                if (!this.isActive()) {
                    return true;
                } else if (this.eventBus.before("idle")) {
                    return false;
                } else {
                    this.active = false;
                    this.close();
                    this.eventBus.trigger("idle");
                    return true;
                }
            },
            isOpen: function isOpen() {
                return this.menu.isOpen();
            },
            open: function open() {
                if (!this.isOpen() && !this.eventBus.before("open")) {
                    this.menu.open();
                    this._updateHint();
                    this.eventBus.trigger("open");
                }
                return this.isOpen();
            },
            close: function close() {
                if (this.isOpen() && !this.eventBus.before("close")) {
                    this.menu.close();
                    this.input.clearHint();
                    this.input.resetInputValue();
                    this.eventBus.trigger("close");
                }
                return !this.isOpen();
            },
            setVal: function setVal(val) {
                this.input.setQuery(_.toStr(val));
            },
            getVal: function getVal() {
                return this.input.getQuery();
            },
            select: function select($selectable) {
                var data = this.menu.getSelectableData($selectable);
                if (data && !this.eventBus.before("select", data.obj)) {
                    this.input.setQuery(data.val, true);
                    this.eventBus.trigger("select", data.obj);
                    this.close();
                    return true;
                }
                return false;
            },
            autocomplete: function autocomplete($selectable) {
                var query, data, isValid;
                query = this.input.getQuery();
                data = this.menu.getSelectableData($selectable);
                isValid = data && query !== data.val;
                if (isValid && !this.eventBus.before("autocomplete", data.obj)) {
                    this.input.setQuery(data.val);
                    this.eventBus.trigger("autocomplete", data.obj);
                    return true;
                }
                return false;
            },
            moveCursor: function moveCursor(delta) {
                var query, $candidate, data, payload, cancelMove;
                query = this.input.getQuery();
                $candidate = this.menu.selectableRelativeToCursor(delta);
                data = this.menu.getSelectableData($candidate);
                payload = data ? data.obj : null;
                cancelMove = this._minLengthMet() && this.menu.update(query);
                if (!cancelMove && !this.eventBus.before("cursorchange", payload)) {
                    this.menu.setCursor($candidate);
                    if (data) {
                        this.input.setInputValue(data.val);
                    } else {
                        this.input.resetInputValue();
                        this._updateHint();
                    }
                    this.eventBus.trigger("cursorchange", payload);
                    return true;
                }
                return false;
            },
            destroy: function destroy() {
                this.input.destroy();
                this.menu.destroy();
            }
        });
        return Typeahead;
        function c(ctx) {
            var methods = [].slice.call(arguments, 1);
            return function() {
                var args = [].slice.call(arguments);
                _.each(methods, function(method) {
                    return ctx[method].apply(ctx, args);
                });
            };
        }
    }();
    (function() {
        "use strict";
        var old, keys, methods;
        old = $.fn.typeahead;
        keys = {
            www: "tt-www",
            attrs: "tt-attrs",
            typeahead: "tt-typeahead"
        };
        methods = {
            initialize: function initialize(o, datasets) {
                var www;
                datasets = _.isArray(datasets) ? datasets : [].slice.call(arguments, 1);
                o = o || {};
                www = WWW(o.classNames);
                return this.each(attach);
                function attach() {
                    var $input, $wrapper, $hint, $menu, defaultHint, defaultMenu, eventBus, input, menu, typeahead, MenuConstructor;
                    _.each(datasets, function(d) {
                        d.highlight = !!o.highlight;
                    });
                    $input = $(this);
                    $wrapper = $(www.html.wrapper);
                    $hint = $elOrNull(o.hint);
                    $menu = $elOrNull(o.menu);
                    defaultHint = o.hint !== false && !$hint;
                    defaultMenu = o.menu !== false && !$menu;
                    defaultHint && ($hint = buildHintFromInput($input, www));
                    defaultMenu && ($menu = $(www.html.menu).css(www.css.menu));
                    $hint && $hint.val("");
                    $input = prepInput($input, www);
                    if (defaultHint || defaultMenu) {
                        $wrapper.css(www.css.wrapper);
                        $input.css(defaultHint ? www.css.input : www.css.inputWithNoHint);
                        $input.wrap($wrapper).parent().prepend(defaultHint ? $hint : null).append(defaultMenu ? $menu : null);
                    }
                    MenuConstructor = defaultMenu ? DefaultMenu : Menu;
                    eventBus = new EventBus({
                        el: $input
                    });
                    input = new Input({
                        hint: $hint,
                        input: $input
                    }, www);
                    menu = new MenuConstructor({
                        node: $menu,
                        datasets: datasets
                    }, www);
                    typeahead = new Typeahead({
                        input: input,
                        menu: menu,
                        eventBus: eventBus,
                        minLength: o.minLength
                    }, www);
                    $input.data(keys.www, www);
                    $input.data(keys.typeahead, typeahead);
                }
            },
            isEnabled: function isEnabled() {
                var enabled;
                ttEach(this.first(), function(t) {
                    enabled = t.isEnabled();
                });
                return enabled;
            },
            enable: function enable() {
                ttEach(this, function(t) {
                    t.enable();
                });
                return this;
            },
            disable: function disable() {
                ttEach(this, function(t) {
                    t.disable();
                });
                return this;
            },
            isActive: function isActive() {
                var active;
                ttEach(this.first(), function(t) {
                    active = t.isActive();
                });
                return active;
            },
            activate: function activate() {
                ttEach(this, function(t) {
                    t.activate();
                });
                return this;
            },
            deactivate: function deactivate() {
                ttEach(this, function(t) {
                    t.deactivate();
                });
                return this;
            },
            isOpen: function isOpen() {
                var open;
                ttEach(this.first(), function(t) {
                    open = t.isOpen();
                });
                return open;
            },
            open: function open() {
                ttEach(this, function(t) {
                    t.open();
                });
                return this;
            },
            close: function close() {
                ttEach(this, function(t) {
                    t.close();
                });
                return this;
            },
            select: function select(el) {
                var success = false, $el = $(el);
                ttEach(this.first(), function(t) {
                    success = t.select($el);
                });
                return success;
            },
            autocomplete: function autocomplete(el) {
                var success = false, $el = $(el);
                ttEach(this.first(), function(t) {
                    success = t.autocomplete($el);
                });
                return success;
            },
            moveCursor: function moveCursoe(delta) {
                var success = false;
                ttEach(this.first(), function(t) {
                    success = t.moveCursor(delta);
                });
                return success;
            },
            val: function val(newVal) {
                var query;
                if (!arguments.length) {
                    ttEach(this.first(), function(t) {
                        query = t.getVal();
                    });
                    return query;
                } else {
                    ttEach(this, function(t) {
                        t.setVal(newVal);
                    });
                    return this;
                }
            },
            destroy: function destroy() {
                ttEach(this, function(typeahead, $input) {
                    revert($input);
                    typeahead.destroy();
                });
                return this;
            }
        };
        $.fn.typeahead = function(method) {
            if (methods[method]) {
                return methods[method].apply(this, [].slice.call(arguments, 1));
            } else {
                return methods.initialize.apply(this, arguments);
            }
        };
        $.fn.typeahead.noConflict = function noConflict() {
            $.fn.typeahead = old;
            return this;
        };
        function ttEach($els, fn) {
            $els.each(function() {
                var $input = $(this), typeahead;
                (typeahead = $input.data(keys.typeahead)) && fn(typeahead, $input);
            });
        }
        function buildHintFromInput($input, www) {
            return $input.clone().addClass(www.classes.hint).removeData().css(www.css.hint).css(getBackgroundStyles($input)).prop("readonly", true).removeAttr("id name placeholder required").attr({
                autocomplete: "off",
                spellcheck: "false",
                tabindex: -1
            });
        }
        function prepInput($input, www) {
            $input.data(keys.attrs, {
                dir: $input.attr("dir"),
                autocomplete: $input.attr("autocomplete"),
                spellcheck: $input.attr("spellcheck"),
                style: $input.attr("style")
            });
            $input.addClass(www.classes.input).attr({
                autocomplete: "off",
                spellcheck: false
            });
            try {
                !$input.attr("dir") && $input.attr("dir", "auto");
            } catch (e) {}
            return $input;
        }
        function getBackgroundStyles($el) {
            return {
                backgroundAttachment: $el.css("background-attachment"),
                backgroundClip: $el.css("background-clip"),
                backgroundColor: $el.css("background-color"),
                backgroundImage: $el.css("background-image"),
                backgroundOrigin: $el.css("background-origin"),
                backgroundPosition: $el.css("background-position"),
                backgroundRepeat: $el.css("background-repeat"),
                backgroundSize: $el.css("background-size")
            };
        }
        function revert($input) {
            var www, $wrapper;
            www = $input.data(keys.www);
            $wrapper = $input.parent().filter(www.selectors.wrapper);
            _.each($input.data(keys.attrs), function(val, key) {
                _.isUndefined(val) ? $input.removeAttr(key) : $input.attr(key, val);
            });
            $input.removeData(keys.typeahead).removeData(keys.www).removeData(keys.attr).removeClass(www.classes.input);
            if ($wrapper.length) {
                $input.detach().insertAfter($wrapper);
                $wrapper.remove();
            }
        }
        function $elOrNull(obj) {
            var isValid, $el;
            isValid = _.isJQuery(obj) || _.isElement(obj);
            $el = isValid ? $(obj).first() : [];
            return $el.length ? $el : null;
        }
    })();
});
function s7jsonResponse(data, id) {

    var compID = id.split("|");
    var width = compID[1];
    var height = compID[2];

    if (!width) width = "1440";
    if (!height) height = "450";

    var s7DomainSelector = compID[0].replace("smartCropScript_", "#");
    var selector = compID[0].replace("smartCropScript_", "#") + " img";

    var $s7DomainSelector = $(s7DomainSelector);
    var $imgSelector = $(selector);

    var resultsData = data;
    var scene7Domain = $s7DomainSelector.data("scene7Domain");
    //  var scene7Url = "https://s7ap1.scene7.com";
    var isImage = "is/image/";
    var s7AssetPath = scene7Domain + isImage + data.set.n; //https://s7ap1.scene7.com/is/image/rmitstage/news_JeddaCosta_awards
    var smartCrops = resultsData.set.relation;
    var imgClass = $imgSelector.attr('class');

    if (smartCrops != null) {

        for (var i = 0; i < smartCrops.length; i++) {



            if (smartCrops[i].userdata.SmartCropType == "Banner" && smartCrops[i].userdata.SmartCropDef == "Large") {

                var largeCroppedImage = s7AssetPath + ':Large';

                var newLargeImageHtml = '<source class="largeImage" media="(min-width: 769px)" srcset="' + largeCroppedImage + '">';


                $imgSelector.before(newLargeImageHtml);

            }

            if (smartCrops[i].userdata.SmartCropType == "Banner" && smartCrops[i].userdata.SmartCropDef == "Small") {

                var smallCroppedImage = s7AssetPath + ':Small';

                var newSmallImageHtml = '<source class="smallImage" media="(min-width: 320px)" srcset="' + smallCroppedImage + '">';


                $imgSelector.before(newSmallImageHtml);


            }

        }
    }

    else {
        s7AssetPath = s7AssetPath + '?wid=' + width + '&hei=' + height + '&scl=1';
        imgClass = imgClass + " scene7Image";
        $imgSelector.attr({ src: s7AssetPath, class: imgClass });
    }

}


function getSmartCropData(url, ele) {


    var element = ele;

    var id = "smartCropScript_" + element;


    var imageDataUrl = url + '?req=set,json&id=' + id + '&callback=?';
    $.ajax({
        type: 'GET',
        url: imageDataUrl,

        dataType: "jsonp"


    });


}

// to recognizing the keyboard click event
function isKeyPress(e) {
    return e.screenX == 0 && e.screenY == 0
}


//Use this function to persist the input value for all search input components
function getUrlParameterValue(sParam) {
    var sPageURL = window.location.search.substring(1);
    var specialCharacters = /[.*&?^${}()+|[\]\\]/g;
    var sURLVariables;
    if (sPageURL.indexOf(';', 0) > 0 || sPageURL.indexOf('&', 0) > 0) {

        if (sPageURL.indexOf(';', 0) > 0) {
            sURLVariables = sPageURL.split(';');
        } else {
            sURLVariables = sPageURL.split('&');
        }

        var sParameterName;

        for (var i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');
            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? '' : decodeURIComponent(sParameterName[1].replace(specialCharacters, " ").replace(/\s\s+/g, " "));
            }
        }

    } else if (sPageURL.indexOf('=', 0) > 0 && sPageURL.indexOf('q=', 0) == 0) {
        sURLVariables = sPageURL.split('=');
        return decodeURIComponent(sURLVariables[1].replace(specialCharacters, " ").replace(/\s\s+/g, " "));
    } else {
        sURLVariables = '';
        return sURLVariables;
    }
}

function updateSaveAndCompareDigitalData() {
    var savedCourse = localStorage.getItem("savedcourses");
    if (savedCourse) {
        var courseLen = JSON.parse(savedCourse);
        let digiData = window.digitalData;
        if (courseLen.length > 0 && (digiData && digiData.page && digiData.page.pageInfo)) {
            var courseArray = [];
            var onlineCourseArray = [];
            for (var i = 0; i < courseLen.length; i++) {
                if (courseLen[i].coursePath && courseLen[i].coursePath.includes('/online')) {
                    onlineCourseArray.push(courseLen[i].courseName);
                    digiData.page.pageInfo.attributes.savedonlinecoursetitle = onlineCourseArray.join("|");
                }
                else {
                    courseArray.push(courseLen[i].courseId);
                    digiData.page.pageInfo.attributes.savedcoursecode = courseArray.join("|");
                }
            }
            digiData.page.pageInfo.attributes.savedcoursecount = courseLen.length;
        } else if (digiData && digiData.page && digiData.page.pageInfo) {
            digiData.page.pageInfo.attributes.savedcoursecode = "";
            digiData.page.pageInfo.attributes.savedcoursecount = "";
        }
    }
}

updateSaveAndCompareDigitalData();


// Accessibility keyboard tabbing foucs fix
function trackFocus(wraper, firstEl){
	var TABBING_CLASS = 'keyboard-tab';
	var MOUSE_CLASS = 'mouse-click';
	var WraperEl = typeof wraper == 'string' ? document.querySelector(wraper) : wraper;
	var BODY = document.body;
	if(firstEl){
		$(firstEl).keyup(function(e) {
			setTabbingClass(e);
		});
	}

    if (WraperEl) {
        WraperEl.addEventListener('keydown', function (e) {
            setTabbingClass(e);
        });

        WraperEl.addEventListener('mousedown', function () {
            BODY.classList.remove(TABBING_CLASS);
            BODY.classList.add(MOUSE_CLASS);
        });
    }
}

function setTabbingClass(e) {
    var BODY = document.body;
    var TABBING_CLASS = 'keyboard-tab';
    var MOUSE_CLASS = 'mouse-click';
    var TAB_KEY = 9;
    if (e.which === TAB_KEY) {
        BODY.classList.add(TABBING_CLASS);
        BODY.classList.remove(MOUSE_CLASS);
    }
}

// tweaking the focus on mouse click for the icon feature component
if ($('.icon-feature-wrapper').length > 0) {
    Array.prototype.forEach.call($('.icon-feature-wrapper'), child => {
        trackFocus(child, child.querySelector('a'))
    });
}

if ($('.columnfeaturecontent').length > 0) {
    Array.prototype.forEach.call($('.columnfeaturecontent'), child => {
        trackFocus(child, child.querySelector('a'))
    });
}
/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 ~ Copyright 2017 Adobe
 ~
 ~ Licensed under the Apache License, Version 2.0 (the "License");
 ~ you may not use this file except in compliance with the License.
 ~ You may obtain a copy of the License at
 ~
 ~     http://www.apache.org/licenses/LICENSE-2.0
 ~
 ~ Unless required by applicable law or agreed to in writing, software
 ~ distributed under the License is distributed on an "AS IS" BASIS,
 ~ WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 ~ See the License for the specific language governing permissions and
 ~ limitations under the License.
 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
(function($) {
    "use strict";

    window.CQ = window.CQ || {};
    window.CQ.CoreComponents = window.CQ.CoreComponents || {};
    window.CQ.CoreComponents.CheckboxTextfieldTuple = window.CQ.CoreComponents.CheckboxTextfieldTuple || {};

    /**
     * Creates a tuple consisting of a checkbox and a text field located in the same dialog.
     *
     * @param {HTMLElement} dialog The dialog where the two elements are found.
     * @param {String} checkboxSelector The selector for the checkbox.
     * @param {String} textfieldSelector The selector for the text field.
     * @param {Boolean} isRichText Defines whether the text field is a rich text editor.
     * @constructor
     */
    var CheckboxTextfieldTuple = window.CQ.CoreComponents.CheckboxTextfieldTuple.v1 = function(dialog, checkboxSelector, textfieldSelector, isRichText) {
        var self                  = this;
        self.ATTR_PREVIOUS_VALUE  = "data-previous-value";
        self.ATTR_SEEDED_VALUE    = "data-seeded-value";
        self._dialog              = dialog;
        self._checkbox            = dialog.querySelector(checkboxSelector);
        self._checkboxSelector    = checkboxSelector;
        self._checkboxFoundation  = $(self._checkbox).adaptTo("foundation-field");
        self._textfield           = dialog.querySelector(textfieldSelector);
        self._textfieldSelector   = textfieldSelector;
        self._textfieldFoundation = $(self._textfield).adaptTo("foundation-field");
        self._isRichText          = isRichText;
        if (self._isRichText) {
            self._richTextInstance = $(self._textfield).data("rteinstance");
        }
        if (self._checkbox && self._checkboxFoundation) {
            self._checkbox.setAttribute(self.ATTR_PREVIOUS_VALUE, self._checkboxFoundation.getValue());
            self._checkbox.addEventListener("change", function() {
                self.update();
            });
            $(window).adaptTo("foundation-registry").register("foundation.adapters", {
                type: "foundation-toggleable",
                selector: self._checkboxSelector,
                adapter: function() {
                    return {
                        isOpen: function() {
                            return !self._checkboxFoundation.isDisabled();
                        },
                        show: function() {
                            self._checkboxFoundation.setDisabled(false);
                            $(self._checkbox).parent().show();
                            self.update();
                        },
                        hide: function() {
                            self._checkboxFoundation.setDisabled(true);
                            $(self._checkbox).parent().hide();
                            if (self._textfield) {
                                var previousValue = self._textfield.getAttribute(self.ATTR_PREVIOUS_VALUE);
                                if (previousValue !== undefined && previousValue !== null) {
                                    self._setTextfieldValue(previousValue);
                                }
                            }
                        }
                    };
                }
            });
        }
        if (self._textfield) {
            if (self._isRichText) {
                self._richTextInstance.$element.on("editing-start", function() {
                    self._textfield.setAttribute(self.ATTR_PREVIOUS_VALUE, self._getTextfieldValue());
                });
                self._richTextInstance.$element.on("change", function() {
                    self._textfield.setAttribute(self.ATTR_PREVIOUS_VALUE, self._getTextfieldValue());
                });
            } else {
                self._textfield.setAttribute(self.ATTR_PREVIOUS_VALUE, self._getTextfieldValue());
                self._textfield.addEventListener("change", function() {
                    self._textfield.setAttribute(self.ATTR_PREVIOUS_VALUE, self._getTextfieldValue());
                });
            }
            $(window).adaptTo("foundation-registry").register("foundation.adapters", {
                type: "foundation-toggleable",
                selector: self._textfieldSelector,
                adapter: function() {
                    return {
                        isOpen: function() {
                            return !self._textfieldFoundation.isDisabled();
                        },
                        show: function() {
                            self._disableTextfield(false);
                            $(self._textfield).parent().show();
                        },
                        hide: function() {
                            self._disableTextfield(true);
                            $(self._textfield).parent().hide();
                        }
                    };
                }
            });
        }
    };

    /**
     * Updates the tuple using the following logic:
     *
     * 1. if the checkbox is checked, the value of the text field will be replaced with the value of the
     *     {@link #ATTR_SEEDED_VALUE} data attribute from the text field;
     * 2. if the checkbox is unchecked, the value of the text field will be changed to the value of the {@link #ATTR_PREVIOUS_VALUE} data
     *     attribute on the text field, if this exists
     *
     * The text field will be disabled when the checkbox is checked, or enabled if the checkbox is not checked.
     */
    CheckboxTextfieldTuple.prototype.update = function() {
        if (this._checkboxFoundation && (this._textfieldFoundation || this._isRichText) && this._textfield) {
            if (this._checkboxFoundation.getValue() === "true") {
                var seededValue = this._textfield.getAttribute(this.ATTR_SEEDED_VALUE);
                if (seededValue !== undefined && seededValue !== null && seededValue.trim() !== "") {
                    this._setTextfieldValue(seededValue);
                } else {
                    this._setTextfieldValue("");
                }
                this._disableTextfield(true);
            } else {
                var previousValue = this._textfield.getAttribute(this.ATTR_PREVIOUS_VALUE);
                if (previousValue !== undefined && previousValue !== null && previousValue.trim() !== "") {
                    this._setTextfieldValue(previousValue);
                }
                this._disableTextfield(false);
            }
        }
    };

    /**
     * Seeds a value in the {@link #ATTR_SEEDED_VALUE} data attribute of the textfield. If the value is empty then the data attribute is
     * removed.
     *
     * @param {String} [value] The value to seed.
     */
    CheckboxTextfieldTuple.prototype.seedTextValue = function(value) {
        if (this._textfield) {
            if (value !== undefined && value !== null) {
                this._textfield.setAttribute(this.ATTR_SEEDED_VALUE, value);
            } else {
                this._textfield.removeAttribute(this.ATTR_SEEDED_VALUE);
            }
        }
    };

    /**
     * Resets the tuple: it un-checks the checkbox, removes the seeded value and sets the text field value to the previously known value.
     *
     * @see {@link CheckboxTextfieldTuple#update}
     * @see {@link CheckboxTextfieldTuple#seedTextValue}
     */
    CheckboxTextfieldTuple.prototype.reset = function() {
        if (this._checkboxFoundation && this._textfield && this._textfieldFoundation) {
            this._checkboxFoundation.setValue(false);
            this._textfield.removeAttribute(this.ATTR_SEEDED_VALUE);
            var previousValue = this._textfield.getAttribute(this.ATTR_PREVIOUS_VALUE);
            if (previousValue !== undefined && previousValue !== null) {
                this._setTextfieldValue(previousValue);
            }
            this._disableTextfield(false);
        }
    };

    /**
     * Sets the checkbox to its initial checked state.
     */
    CheckboxTextfieldTuple.prototype.reinitCheckbox = function() {
        if (this._checkbox && this._checkboxFoundation) {
            var previousValue = this._checkbox.getAttribute(this.ATTR_PREVIOUS_VALUE);
            if (previousValue !== undefined && previousValue !== null) {
                this._checkboxFoundation.setValue(previousValue);
                this.update();
            }
        }
    };

    /**
     * Hides the checkbox field, depending on the <code>hide</code> value.
     *
     * @param {Boolean} [hide] When set to <code>true</code> the checkbox will be hidden.
     */
    CheckboxTextfieldTuple.prototype.hideCheckbox = function(hide) {
        var checkbox = $(this._checkboxSelector).adaptTo("foundation-toggleable");
        if (checkbox) {
            if (hide) {
                checkbox.hide();
            } else {
                checkbox.show();
            }
        }
    };

    /**
     * Hides the text field, depending on the <code>hide</code> value.
     *
     * @param {Boolean} [hide] When set to <code>true</code> the text will be hidden.
     */
    CheckboxTextfieldTuple.prototype.hideTextfield = function(hide) {
        var textfield = $(this._textfieldSelector).adaptTo("foundation-toggleable");
        if (textfield) {
            if (hide) {
                textfield.hide();
            } else {
                textfield.show();
            }
        }
    };

    /**
     * Gets the value of the text field, accounting for it being a rich-text
     *
     * @returns {String} The text field value
     * @private
     */
    CheckboxTextfieldTuple.prototype._getTextfieldValue = function() {
        if (this._isRichText) {
            return this._richTextInstance.getContent();
        } else {
            return this._textfield.value;
        }
    };

    /**
     * Sets the value of the text field, accounting for it being a rich-text
     *
     * @param {String} value The value to set
     * @private
     */
    CheckboxTextfieldTuple.prototype._setTextfieldValue = function(value) {
        if (this._isRichText) {
            this._richTextInstance.setContent(value);
        } else {
            this._textfieldFoundation.setValue(value);
        }
    };

    /**
     * Disables the text field, accounting for it being a rich-text
     *
     * @param {Boolean} disabled {@code true} to disable, {@code false} to enable the field
     * @private
     */
    CheckboxTextfieldTuple.prototype._disableTextfield = function(disabled) {
        if (this._isRichText) {
            $(this._textfield).attr("contenteditable", !disabled);
        } else {
            this._textfieldFoundation.setDisabled(disabled);
        }
    };

})(jQuery);

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 ~ Copyright 2017 Adobe Systems Incorporated
 ~
 ~ Licensed under the Apache License, Version 2.0 (the "License");
 ~ you may not use this file except in compliance with the License.
 ~ You may obtain a copy of the License at
 ~
 ~     http://www.apache.org/licenses/LICENSE-2.0
 ~
 ~ Unless required by applicable law or agreed to in writing, software
 ~ distributed under the License is distributed on an "AS IS" BASIS,
 ~ WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 ~ See the License for the specific language governing permissions and
 ~ limitations under the License.
 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
/* global jQuery, Coral */
(function($) {
    "use strict";

    var dialogContentSelector = ".cmp-image__editor";
    var CheckboxTextfieldTuple = window.CQ.CoreComponents.CheckboxTextfieldTuple.v1;
    var isDecorative;
    var altTuple;
    var captionTuple;
    var $altGroup;
    var $linkURLGroup;
    var $linkURLField;
    var $cqFileUpload;
    var $cqFileUploadEdit;
    var fileReference;

    $(document).on("dialog-loaded", function(e) {
        var $dialog        = e.dialog;
        var $dialogContent = $dialog.find(dialogContentSelector);
        var dialogContent  = $dialogContent.length > 0 ? $dialogContent[0] : undefined;
        if (dialogContent) {
            isDecorative      = dialogContent.querySelector('coral-checkbox[name="./isDecorative"]');
            altTuple          =
                new CheckboxTextfieldTuple(dialogContent, 'coral-checkbox[name="./altValueFromDAM"]', 'input[name="./alt"]');
            $altGroup         = $dialogContent.find(".cmp-image__editor-alt");
            $linkURLGroup     = $dialogContent.find(".cmp-image__editor-link");
            $linkURLField     = $linkURLGroup.find('foundation-autocomplete[name="./linkURL"]');
            captionTuple      =
                new CheckboxTextfieldTuple(dialogContent, 'coral-checkbox[name="./titleValueFromDAM"]', 'input[name="./jcr:title"]');
            $cqFileUpload     = $dialog.find(".cq-FileUpload");
            $cqFileUploadEdit = $dialog.find(".cq-FileUpload-edit");
            if ($cqFileUpload) {
                $cqFileUpload.on("assetselected", function(f) {
                    fileReference = f.path;
                    retrieveDAMInfo(fileReference).then(
                        function() {
                            if (isDecorative) {
                                altTuple.hideCheckbox(isDecorative.checked);
                            }
                            captionTuple.hideCheckbox(false);
                            altTuple.reinitCheckbox();
                            captionTuple.reinitCheckbox();
                            toggleAlternativeFieldsAndLink(isDecorative);
                        }
                    );
                });
                $cqFileUpload.on("click", "[coral-fileupload-clear]", function() {
                    altTuple.reset();
                    captionTuple.reset();
                });
                $cqFileUpload.on("coral-fileupload:fileadded", function() {
                    if (isDecorative) {
                        altTuple.hideTextfield(isDecorative.checked);
                    }
                    altTuple.hideCheckbox(true);
                    captionTuple.hideTextfield(false);
                    captionTuple.hideCheckbox(true);
                    fileReference = undefined;
                });
            }
            if ($cqFileUploadEdit) {
                fileReference = $cqFileUploadEdit.data("cqFileuploadFilereference");
                if (fileReference === "") {
                    fileReference = undefined;
                }
                if (fileReference) {
                    retrieveDAMInfo(fileReference);
                } else {
                    altTuple.hideCheckbox(true);
                    captionTuple.hideCheckbox(true);
                }
            }
            toggleAlternativeFieldsAndLink(isDecorative);
        }
    });

    $(window).on("focus", function() {
        if (fileReference) {
            retrieveDAMInfo(fileReference);
        }
    });

    $(document).on("dialog-beforeclose", function() {
        $(window).off("focus");
    });

    $(document).on("change", dialogContentSelector + ' coral-checkbox[name="./isDecorative"]', function(e) {
        toggleAlternativeFieldsAndLink(e.target);
    });

    function toggleAlternativeFieldsAndLink(checkbox) {
        if (checkbox) {
            if (checkbox.checked) {
                $linkURLGroup.hide();
                $altGroup.hide();
            } else {
                $altGroup.show();
                $linkURLGroup.show();
            }
            $linkURLField.adaptTo("foundation-field").setDisabled(checkbox.checked);
            altTuple.hideTextfield(checkbox.checked);
            if (fileReference) {
                altTuple.hideCheckbox(checkbox.checked);
            }
        }
    }

    function retrieveDAMInfo(assetPath) {
        return $.ajax({
            url: assetPath + "/_jcr_content/metadata.json"
        }).done(function(data) {
            if (data) {
                if (altTuple) {
                    var altText = data["dc:alttag"];
                    if (altText === undefined || altText.trim() === "") {
                        altText = "Alt Text is not present for this image, Taking dc:title '" + data["dc:title"] + "'";
                    }
                    altTuple.seedTextValue(altText);
                    altTuple.update();
                    toggleAlternativeFieldsAndLink(isDecorative);
                }
                if (captionTuple) {
                    var caption = data["dc:description"];
                    if (caption === undefined || caption.trim() === "") {
                        caption = "Description is not present for this image, Taking dc:title '" + data["dc:title"] + "'";
                    }
                    captionTuple.seedTextValue(caption);
                    captionTuple.update();
                }
            }
        });
    }

})(jQuery);


var url = $('#article-header').data("assetUrl");
var ele = $('#article-header').attr("id");

if( url ) {
	getSmartCropData(url,ele);

}
    $(window).load(function() {

       $('#article-header').css('height', 'auto');

    });
const helpFunctions = (function () {

  function getCookie(name) {
    const value = "; " + document.cookie;
    const parts = value.split("; " + name + "=");
    if (parts.length === 2) {
      return parts.pop().split(";").shift()
    } else {
      return "undefined";
    }
  }

  const share = {
    facebook: function (info) {
      let url = 'https://www.facebook.com/sharer/sharer.php?';
      url += info.ptitle ? '&title=' + encodeURIComponent(info.ptitle) : '';
      url += info.psummary ? '&description=' + encodeURIComponent(info.psummary) : '';
      url += info.purl ? '&u=' + encodeURIComponent(info.purl) : '&u=' + location.href;
      url += info.pimg ? '&picture=' + encodeURIComponent(info.pimg) : '';
      share.popup(url);
    },
    twitter: function (info) {
      let url = 'https://twitter.com/share?';
      url += info.ptitle ? 'text=' + encodeURIComponent(info.ptitle) : '';
      url += info.purl ? '&url=' + encodeURIComponent(info.purl) : '&url=' + location.href;
      url += info.purl ? '&counturl=' + encodeURIComponent(info.purl) : '&counturl=' + location.href;
      share.popup(url);
    },
    linkedin: function (info) {
      let url = 'https://www.linkedin.com/shareArticle?mini=true';
      url += info.purl ? '&url=' + encodeURIComponent(info.purl) : '&url=' + location.href;
      url += info.ptitle ? '&title=' + encodeURIComponent(info.ptitle) : '';
      url += info.psummary ? '&summary=' + encodeURIComponent(info.psummary) : '';
      url += info.psource ? '&source=' + encodeURIComponent(info.psource) : '';
      share.popup(url);
    },
    popup: function (url) {
      const encodedUrl = encodeURI(url);
      window.open(encodedUrl, 'Hello', 'toolbar=0,status=0,width=626,height=436');
    }
  };

  return {
    getCookie: getCookie,
    share: share
  }

})();

function share_init () {
  $('[data-share-network]').on('click', function (e) {
    e.preventDefault();

    const shareNetwork = this.dataset.shareNetwork,
        shareObject = {
          ptitle: this.dataset.shareTitle,
          psummary: this.dataset.shareSummary,
          purl: this.dataset.shareUrl,
          pimg: this.dataset.shareImage,
          psource: this.dataset.shareSource
        };

    helpFunctions.share[shareNetwork](shareObject);

  });
}


document.addEventListener("DOMContentLoaded", share_init);

$(document).ready(function() {

    let url = "";

    function loadMore(id) {
        const limitFrom = parseInt($("#" + id).attr('data-limit'));
        if($("#"+id+" .grid-list-wrapper").attr("data-path")!=""){
          url= $("#"+id+" .grid-list-wrapper").attr("data-path")+".model.json?limit="+limitFrom;
      }

	 $.ajax({
         type: "GET",
         dataType: 'json',
         async: true,
         url: url,
         success: function(data) {
             if (data !== undefined) {
                 let findnoimg = '';
                 if($('#'+id).closest('.generic-gridlist').hasClass('no-img')) {
                    findnoimg = 'noimg';
                 }
                 const encodedData = JSON.stringify(data);
                 renderTiles(JSON.parse(encodedData),id,findnoimg);
                 let curlimit = $('#' + id).attr('data-limit');
                 curlimit= parseInt(curlimit)+1;
                 $('#'+id).attr('data-limit', curlimit);
             }
         },
         error: function(textStatus, errorThrown) {
             console.error('ERROR FROM FILE');
         }

     });
}

    $(".load-more").on("click", function(){
        const id = $(this).closest('.component').attr("id");
        loadMore(id);

    });

    $(".load-more").keydown(function(e) {
	  if(e.keyCode == 13) {
          const parseid = $(this).closest('.component').attr("id");
          loadMore(parseid);
	  }
	});

function renderTiles(data,id,findnoimg){

    const resultsData = data.gridList;

    const tilesCount = resultsData.length;
    let columnClass;
    if ($("#"+id+" .cmp-list__item").hasClass("col-md-3")){
		columnClass ="col-sm-6 col-md-3" ;
     }
    else if ($("#"+id+" .cmp-list__item").hasClass("col-md-4")){
         columnClass ="col-sm-4 col-md-4" ;
     }
    else {
      columnClass ="col-sm-6 col-md-6 two-column" ;
    }

    for (let i = 0; i < tilesCount; i++) {
        let desc = "";
        desc = '<div class="cmp-list__item col-xs-12 '+ columnClass+'">';

       if(resultsData[i].image!="" && resultsData[i].image!=null) {

          desc+='<div class="cmp-list__item-img">';

            desc+='<a href="'+resultsData[i].path+'" data-analytics-type="gridlist" data-analytics-value="'+resultsData[i].title+'" class="h-bar">'

            desc+='<figure class="rollover">';

            desc+='<div class="box-photo">';

		    if(resultsData[i].isRemoteAsset === true)	{
                 desc+='<picture>';
                 desc+='<source media="(max-width: 381px)" srcset="'+resultsData[i].image+'?wid=380">';
                 desc+='<source media="(max-width: 415px)" srcset="'+resultsData[i].image+'?wid=750">';
                 desc+='<source media="(max-width: 768px)" srcset="'+resultsData[i].image+'?wid=480">';
    			 desc+='<source media="(max-width: 1024px)" srcset="'+resultsData[i].image+'?wid=800">';
				 desc+='<img alt="'+resultsData[i].imageAltText+'" src="'+resultsData[i].image+'">';
				 desc+='</picture>';
            }
            else {
                desc+='<img alt="'+resultsData[i].imageAltText+'" src="'+resultsData[i].image+'">';
            }

            desc+='</div>';

            desc+='</figure>';

            desc+='</a>';

            desc+='</div>';
        }               

        desc+='<div class="cmp-list__item-content btn_Wrap_CTALink">';

        desc+='<a data-analytics-type="gridlist" data-analytics-value="'+resultsData[i].title+'"  href="'+resultsData[i].path+'" class="h-bar cmp-list__item-link btn_Wrap_CTALink"> <h3>'+resultsData[i].title+'</h3>';

        if(url.includes("generic_gridlist") && (resultsData[i].image=="" || resultsData[i].image===null || findnoimg=="noimg"))	{
        desc+='<span class="fa fa-angle-right generic-chevron" aria-hidden="true"></span>';
        }

        desc+='</a>';

			if(!url.includes("generic_gridlist"))	{
				desc+='<div class="tag-links">'+ ((resultsData[i].categoryTagUrl !==null && resultsData[i].categoryTagUrl !="" ) ? '<a  data-analytics-type="gridlist" data-analytics-value="'+resultsData[i].categoryTag+':'+resultsData[i].title+'"  href="'+resultsData[i].categoryTagUrl+'">'+resultsData[i].categoryTag+'</a>' : '') ;
			}

            if(resultsData[i].articleDate!="" && !url.includes("generic_gridlist")) {

               desc+='<div class="news-calendar"> <span class="news-calendaricon"><svg width="16px" height="16px" viewBox="0 0 16 16" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-151.000000, -171.000000)" fill="#a9a9a9" fill-rule="nonzero"><g transform="translate(1.000000, -1.000000)"><g><g transform="translate(150.000000, 172.000000)"><path d="M10,10 L10,12 L8,12 L8,10 L6,10 L6,8 L8,8 L10,8 L10,10 Z M2,4 L2,14 L14,14 L14,4 L14,6 L2,6 L2,4 Z M14,2 L16,2 L16,16 L0,16 L0,2 L2,2 L2,0 L4,0 L4,2 L12,2 L12,0 L14,0 L14,2 Z" id="Combined-Shape"></path></g></g></g></g></g></svg></span><span class="date">'+resultsData[i].articleDate+'</span></div>';
			   desc+='</div>';

            }


            if(resultsData[i].shortDescription!==null){
                if($("#"+id+" p.short-desc-gen").length>0){
                 desc+='<p>'+resultsData[i].shortDescription+'</p>';

             }
			}

            desc+='</div>';

            desc+='</div>';

          if(data.hideLoadMore===true){
              $("#"+id+" .load-more").hide();
         }

         var position = $(window).scrollTop();
         $("#"+id+" .cmp-list").append(desc);
         $(document).scrollTop(position);
    }


	$("#"+id+" .offset-col").remove();
	if(url.includes("generic_gridlist")){

       if ($("#"+id).closest('.generic-gridlist').hasClass('horizontal')){
	    offsetCell(id);

	  }
    }

} 


function offsetCell(componentId){
    const threColumn = '<div class="col-xs-12 col-sm-4 col-md-4 cmp-list__item offset-col"></div>';
    const fourColumn = '<div class="col-xs-12 col-sm-3 col-md-3 cmp-list__item offset-col"></div>';
    const fourcolumnOffset = '<div class="col-xs-12 col-sm-3 col-md-3 col-md-offset-3 cmp-list__item offset-col"></div>';
    const item = $("#" + componentId + " .cmp-list__item");
    const threeCoumnlength = $("#" + componentId + '.cmp-list__item.col-md-4').length;
    const fourColumnLength = $("#" + componentId + " .cmp-list__item.col-md-3").length;
    const componentContainer = $("#" + componentId + " .cmp-list");
    const offseColumn = $("#" + componentId + " .offset-col");

    if (item.hasClass("col-md-4")){
      if((threeCoumnlength)%3==2){
       componentContainer.append(threColumn);
      }else if((threeCoumnlength)%3==0){
        componentContainer.append(threColumn);
      }else{
         offseColumn.remove();
      }

   }
  if (item.hasClass("col-md-3")){
     if((fourColumnLength)%4==2 ){
        componentContainer.append(fourcolumnOffset);
      }else if((fourColumnLength)%4==3 ){
        componentContainer.append(fourColumn);
      }
       else{
       offseColumn.remove();
   }
  }


}

if($('.generic-gridlist ').length>0){
	$( ".generic-gridlist.horizontal .gridlist__root" ).each(function( ) {
        const cId = $(this).attr('id');
        offsetCell(cId);
    });
    
    $('.generic-gridlist').each(function( ) {
        if($(this).hasClass('no-img')) {    
            $(this).find('.generic-chevron').css('display','block');
        } else {
            $(this).not('.no-img').addClass('no-chevron');
            $(this).find('.generic-chevron').css('display','none');    
        } 
    });
}

});
$(document).ready(function(){ 
            
    //To add class selected for mobile    
    var checkIOSCategoryLinks = (navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false);
    $(".categoryLinksCollapse").css("display","none");
    if (checkIOSCategoryLinks) {
        $(".categoryLinksCollapse ul > li").on('touchstart', function() {            
            $(this).toggleClass('selected').siblings().removeClass('selected');
        });
        
      //To toggle icon and show/hide blue border for mobile
        $(".categoryLinksHeader").on('touchstart',function (e) { 
        	
        	//to stop scrolling to top
        	e.preventDefault();
        	
        	//to show/hide links
            $(this).parent().next().toggle();
            
            //to remove selected class
            $(".categoryLinksCollapse ul > li").removeClass('selected');
            
            if($(this).parent().find("i").hasClass("fa-angle-up")) {
          	 // $(this).parent().find("i").removeClass("fa-angle-down categoryIcon").addClass("fa-angle-up categoryIcon");
                 $(this).parent().find("i").toggleClass("rotate categoryIcon");
                       
            } 
                           	  
          });
    } else {
        $(".categoryLinksCollapse ul > li").on('click', function() {            
            $(this).toggleClass('selected').siblings().removeClass('selected');
        });
        
      //To toggle icon and show/hide blue border for mobile
        $(".categoryLinksHeader").on('click',function (e) {
        	
        	//to stop scrolling to top
        	e.preventDefault();
        	
        	//to show/hide links
            $(this).parent().next().slideToggle('slow');
            
            //to remove selected class
            $(".categoryLinksCollapse ul > li").removeClass('selected');
            
            if($(this).parent().find("i").hasClass("fa-angle-up")) {
          	 // $(this).parent().find("i").removeClass("fa-angle-down categoryIcon").addClass("fa-angle-up categoryIcon");
                 $(this).parent().find("i").toggleClass("rotate categoryIcon");
                       
            }                      
     	  
          });
    }                


    
});
$(document).ready(function () {

	updateContentTypeInDataLayer();

	/*** Skip to content starts ***/
		 if($('#topnav_skipcontent').length==0 && $('.aem-Grid').find('.primarynav').length > 0) {
			$('.primarynav').append('<div id="topnav_skipcontent"></div>');
		} else if($('#topnav_skipcontent').length==0 && $('.aem-Grid').find('.top-nav')) {
			$('.top-nav').append('<div id="topnav_skipcontent"></div>');
		}
	/*** Skip to content ends ***/
	
		/*** Desktop Starts **/
		
		//To add class active
		$('.topnav-links ul li').mouseover(function () {
			$(this).addClass('open');
			$(this).find('button').attr('aria-expanded','true');
		});
	


	   $('.topnav-searchbox-text').focus(
		function(){
			$('.topnav-searchbox-section').addClass('highlight');
		}).blur(
		function(){
			 $('.topnav-searchbox-section').removeClass('highlight');
		});
	
		//To remove class active
		$('.topnav-links').mouseout(function () {
			$(this).find('li').removeClass('open');
			$(this).find('button').attr('aria-expanded','false');
		});

    $('.has-submenu-items *').on("focusout", function () {
		var that = this;
		setTimeout(function(){
			if($(that).closest('.open').find(":focus").length === 0)
				$(that).closest('.open').removeClass("open")
		},10);
});

	
		//To show search section
		$('.topnav-search-main').on('click keyup', function (e) {
			var keyCode_search = e.keyCode ? e.keyCode : e.which;
	
			if(keyCode_search == 1 || keyCode_search == 13 || keyCode_search == 32) {
				e.preventDefault();
				$('.top-nav__search').show();
				$('#topnav-search-close-btn').show();
				$('.topnav-search-main').hide();

				//To read search input values
				setTimeout(function () {
					$('#topnav-search-value').val('').focus();
				},100);
			} else if(keyCode_search == 16) {
				e.preventDefault();
				hideSearchSection();
			}
		});
	
		//To hide search section
		$('.topnav-search-close a').on('click', function (e) {
			e.preventDefault();
			hideSearchSection();
		});
	
		function hideSearchSection() {
			$('.top-nav__search').hide();
			$('.topnav-search-main').show();
			$('#topnav-search-close-btn').hide();
			$('#topnav-search-value').val('');
			window.scrollTo(0,0);
		}
		
		//To navigate to search page
		var topnav_url = "";
	var topnav_query = "";
		
		$('.topnav-searchbox-icon').on('click', function (e) { 
			e.preventDefault();
			topnav_url = $(this).attr("href");
			topnav_query = splitSpecialChar('#topnav-search-value');
			$(this).attr('data-analytics-value',topnav_query);
			searchNavigation(topnav_url, topnav_query);
		});
		
		movefocusOnTab('.topnav-searchbox-icon', ".topnav-search-close-link");
		
		$('#topnav-search-value').on('keypress', function (e) {
			if (e.which == 13) {
				e.preventDefault();
				topnav_url = $('.topnav-searchbox-icon').attr("href");
				topnav_query = splitSpecialChar('#topnav-search-value');
				searchNavigation(topnav_url, topnav_query);
			}
		});

		movefocusOnShiftTab('.topnav-search-close-link', ".topnav-searchbox-icon");
	
		/*** Desktop Ends **/
	
		/*** Mobile Starts **/
	
		//To show mobile search section
	
		$('.topnav-mobi-searchicon').on('click', function () {
			$('.topnav-mobi-subsearch').show();
			$('.topnav-mobi-accordion').hide();
			$('.topnav-mobi-lang').removeClass('active');		
			$('.top-nav__accordion').addClass('disable-transparency');
	
			$('.topnav-mobi-search').hide();
			$('.topnav-mobi-close').show();
			$('.topnav-mobi-bars').show();
	
			//to empty search text
			$('#topnav-mobi-searchvalue').val('');
			$('html').removeClass('top-nav__overlay mob-nav-enabled');
			showBgContent();
			arrowupdown();
			$('.topnav-mobi-searchtext').focus();		
			movefocusOnTab(".topnav-mobi-closeicon", "#topnav-mobi-searchvalue", true, ".topnav-mobi-selectsearchicon");
			movefocusOnShiftTab("#topnav-mobi-searchvalue", "#topnav-mobile-subnav-close-icon");
			movefocusOnTab(".topnav-mobi-selectsearchicon", "#topnav-mobile-subnav-close-icon");
			$("#topnav-mobile-subnav-close-icon").attr("aria-label", "Close RMIT General Search");
		});
	
		//To hide mobile search section
		$('.topnav-mobi-closeicon').on('click', function () {
			if($('.topnav-mobi-subsearch:visible').length){
				$('.topnav-mobi-close').hide();
			}
			$('.topnav-mobi-subsearch').hide();
			$('.topnav-mobi-accordion').removeClass("show-mob-nav").addClass("hide-mob-nav");
			$('.top-nav__accordion').removeClass('disable-transparency');
			showBgContent();
			//removing super parent custom class name after completion of animation
			setTimeout(function(){
				$("html").removeClass("mob-nav-enabled");
				$('.topnav-mobi-accordion').hide();
				$('.topnav-mobi-close').hide();
				$('.topnav-mobi-bars').show();
			},500);
			$('.topnav-mobi-search').show();
	
			//To remove overlay
			$('html').removeClass('top-nav__overlay');
		});
	
		//To show mobile accordion section
		$('.topnav-mobi-barsicon').on('click', function (e) {
			$('.topnav-mobi-subsearch').hide();
			$('.topnav-mobi-accordion').show().addClass("show-mob-nav").removeClass("hide-mob-nav");
			topNavHideBgContent();
			$("html").addClass("mob-nav-enabled");
			$('.topnav-mobi-sublinkssection').hide();
			$(".topnav-mobi-acclinks").parent().removeClass("active");
			$('.topnav-mobi-lang').removeClass('active');
			$('.top-nav__accordion').removeClass('disable-transparency');
	
			$('.topnav-mobi-search').show();
			$('.topnav-mobi-bars').hide();
			$('.topnav-mobi-close').show();				
	

	
			// setting timeout to complete the animation before focus
			setTimeout(function(){
				if(isKeyPress(e))
					$(".topnav-mobi-accordion.show-mob-nav a").first().focus();
			},500);

			$(window).scrollTop(0);
			
			movefocusOnTab(".topnav-mobi-closeicon", ".topnav-mobi-accordion.show-mob-nav a:first", true, ".top-nav__accordion.full-width a:last");
			movefocusOnTab(".top-nav__accordion.full-width a:last", "#topnav-mobile-subnav-close-icon");	
			$("#topnav-mobile-subnav-close-icon").attr("aria-label", "close RMIT Main Menu");
		});
	
	
	$('.topnav-mobi-lang .mob-default-lang').on('click', function (e) {
	
			$('.topnav-mobi-subsearch').hide();
			$('.topnav-mobi-accordion').hide();
			$('.topnav-mobi-search').show();
			$('.topnav-mobi-close').hide();
			$('.topnav-mobi-bars').show();

			showBgContent();
			$('html').removeClass('mob-nav-enabled');
			if($(this).parent().hasClass("active")){
				$(this).parent().removeClass('active');
				$(".top-nav__accordion").removeClass("disable-transparency");
				$(this).attr("aria-expanded", "false");
			}else {
				$(this).parent().addClass('active');
				$(".top-nav__accordion").addClass("disable-transparency");
				$(this).attr("aria-expanded", "true");
				if(isKeyPress(e))
					$(this).next().find("a:first").focus();
			}
		});
	
		//To show/hide mobile accordion
		$('.topnav-mobi-acclinks').on('click', function (e) {
			e.preventDefault();

			//To remove active and fa-angle-up class
	
			//To hide sublinks and toggle
			if ($(this).parent().hasClass("active")) {
				$('.topnav-mobi-sublinkssection').hide();
				$(this).parent().removeClass('active');
				$(".topnav-mobi-sublinkssection").attr("aria-hidden", "true").hide();
				var nextLink = $(this).parent().find("~ .topnav-mobi-acclinkssection").first().find('a');
				$(this).attr("aria-expanded", "false");
					if(isKeyPress(e) && nextLink.length > 0)
						nextLink.focus();		
			} else{
				$(".topnav-mobi-acclinks").parent().removeClass("active");
				$(this).parent().addClass('active');
				$(".topnav-mobi-sublinkssection").attr("aria-hidden", "true").hide();
				$(this).parent().next().attr("aria-hidden", "false").show();
				$(this).attr("aria-expanded", "true");
				if(isKeyPress(e))
					$(this).parent().next().find('a').first().focus();
			}
		});
	
		// Load mobile nav if new grids
	
		if ($('body').hasClass("mtGridroot")) {
			/* mobinav content */
			var mobiNavContent = $("#mobinav-accsection").clone(true);
			$('.topnav-mobi-accsection').first().before(mobiNavContent);
		} else {
			var primaryNavContent = $("#primary-mobile").clone(true);
			$('.topnav-mobi-accsection').first().before(primaryNavContent);		
		}
	
		//To navigate to search page
		$('.topnav-mobi-selectsearchicon').on('click', function (e) {
			e.preventDefault();
			topnav_url = $(this).attr("href");
			topnav_query = splitSpecialChar('#topnav-mobi-searchvalue');
			searchNavigation(topnav_url, topnav_query);
		});
	
		$('#topnav-mobi-searchvalue').on('keypress', function (e) {
			if (e.which == 13) {
				e.preventDefault();
				topnav_url = $('.topnav-mobi-selectsearchicon').attr("href");
				topnav_query = splitSpecialChar('#topnav-mobi-searchvalue');
				searchNavigation(topnav_url, topnav_query);
			}
		});
	
			function arrowupdown(){
				if ($('.topnav-mobi-lang').find("span").hasClass("fa-angle-up")) {
					$('.topnav-mobi-lang').find("span.fa-angle-up").removeClass("fa-angle-up").addClass("fa-angle-down");
				}
			}

	
	/*** Mobile Ends **/

		/*** strips special character for search input ***/
		function splitSpecialChar(searchSelector){
			const patternElement = document.querySelector("section[data-restrict-query-pattern]"); 
    		if(patternElement) {
				const patternString = document.querySelector("section[data-restrict-query-pattern]").getAttribute("data-restrict-query-pattern");
				const pattern = new RegExp(patternString, 'g');
			    return $(searchSelector).val($(searchSelector).val().replace(pattern, '')).val();
			}else{
				return topnav_query;
			}
         }
	});
	

	var topNavObj = topNav();
	
	function topNav() {
		topNavObj = {};
		topNavObj.nav_height = 0;
		topNavObj.screen_height = 0;
		return topNavObj;
	}


	function movefocusOnTab(elem, nextElem, checkShiftkey, prevElem ){
		$(elem).on("keydown",function (event) {
			if(checkShiftkey && event.keyCode == 9 && event.shiftKey){
				event.preventDefault();
				$(prevElem).focus();
			}
			else if(event.keyCode == 9 && !event.shiftKey){
				event.preventDefault();
				$(nextElem).focus();
			}
		});
	}
	
	function movefocusOnShiftTab(elem, prevElem){
		$(elem).on("keydown",function (event) {
			if(event.keyCode == 9 && event.shiftKey){
				event.preventDefault();
				$(prevElem).focus();
			}
		});
	
	}

function topNavHideBgContent(){
	$('.top-nav').parentsUntil("body").addClass("top-nav--parent-wpr");
	$('.top-nav, .top-nav--parent-wpr').siblings().addClass('top-nav--bg-conent');
}

function showBgContent(){
	$(".top-nav--bg-conent").removeClass('top-nav--bg-conent');
}

// this is method to read user details and display name of staff in topnav

// this is method to read user details and display name of staff in topnav
if ($(".top-nav").length > 0) {
	let userData = JSON.parse(localStorage.getItem("userData") || "{}");
	const ref = document.referrer;

	if (userData.uniId === undefined) {
	// If userData is not set, initialize it with default values
		userData = { "firstName": '', "lastName": '', "uniId": "anonymous", "cache": true };
		localStorage.setItem("userData", JSON.stringify(userData));
	}
	const needsUserService = ('' !== ref &&
		(new URL(ref).pathname.endsWith('/login.html') ||
			(new URL(ref).hostname.startsWith("myapps") && new URL(ref).hostname.endsWith("rmit.edu.au"))
		)
	) && userData.uniId === 'anonymous';

	if (needsUserService || (document.querySelector('[data-env-author]') && userData.uniId === 'anonymous')) {
		callUserService();
	} else {
		populateUserInformation(userData);
		populateDataLayer(userData);
	}
	updateCoursesCount();

	// Remove userData from localStorage on the logout button click
	const logoutBtn = document.getElementById('logoutBtn');
	if (logoutBtn) {
		logoutBtn.addEventListener('click', function (e) {
			e.preventDefault(); // prevent default link behavior if needed
			// Remove from localStorage
			localStorage.removeItem('userData');
			localStorage.removeItem('uniId');
			window.location.href = e.currentTarget.href;
		});
	}

}

function callUserService() {
	const userDetailApi = document.querySelector('[data-user-detail-api-url]').getAttribute('data-user-detail-api-url');
	if (!userDetailApi) {
		console.error("User detail API not defined in the top-nav section.");
		return;
	}
	$.ajax({
		url: userDetailApi,
		dataType: 'json',
		success: function (data) {
			// populate local storage with data from request
			localStorage.setItem("userData", JSON.stringify(data));
			populateUserInformation(data);
			populateDataLayer(data);
		},
		error: function () {
			console.error("User detail API returned error - ", JSON.stringify(data));
		}
	});
}

  function populateUserInformation(data) {
    var firstName = data.firstName;
	if(firstName && $(".profile-name").length > 0) {
		 $('.profile-name').text('Hi '+firstName);
		 $('.profile-name-mob').text('Hi '+firstName);
	}
  }



  function populateDataLayer(data) {
	 var    authStatus,
	  knownStatus,
	  userId = data.uniId,
	  registration = "loggedout",
	  userType = "unknown";
		  
	 if(data.uniId == undefined ){
		  authStatus = 'unauthenticated';
		  knownStatus= 'unknown user';
	  }
	  else {
		if(data.uniId == 'anonymous') {
			authStatus = 'unauthenticated';
			knownStatus= 'known user';
		}
		else {
			 authStatus = 'authenticated';
			 knownStatus= 'known user';
			 userType= checkUserType(data.uniId);
			 registration = 'loggedin';
		}
	  }
		if (typeof digitalData !== "undefined") {
			digitalData.user = {userInfo:{registration: registration, userId: userId, userType:userType, userAuthStatus  : authStatus ,userKnownStatus  : knownStatus}};
		}
  }

  
function updateContentTypeInDataLayer() {
	let domOrIntCookie = getCookie('domesticOrInternational');
	if (window.digitalData?.page?.pageInfo) {
         if(domOrIntCookie === '') {
                domOrIntCookie = 'domestic';
         }
		digitalData.page.pageInfo.attributes.contentType = domOrIntCookie;
	}
}

function getCookie(name) {
	const value = "; " + document.cookie;
	const parts = value.split("; " + name + "=");
	if (parts.length == 2) {
		return parts.pop().split(";").shift()
	} else {
		return "";
	}
}

  
  function checkUserType(uniId) {
		var Uid = uniId.toLowerCase();
	  	var Utype;
	  	if (Uid.charAt(0) == 'e') {
			Utype = 'Staff';
		}
		if (Uid.charAt(0) == 'v') {
			Utype = 'Staff';
		}
		if (Uid.charAt(0) == 's') {
			Utype = 'Students';
		}
		return Utype;
  }
 

var menuItems = document.querySelectorAll('li.has-submenu-items .toggle-dropdown');
Array.prototype.forEach.call(menuItems, function(el, i){

	el.addEventListener("click",  function(event){
		event.preventDefault();
		if(this.parentElement.parentNode.classList.contains("open")){
			this.parentElement.parentNode.classList.remove("open");
			this.setAttribute('aria-expanded', "false");
		}else {
			this.parentElement.parentNode.classList.add("open");
			this.setAttribute('aria-expanded', "true");
		}
	});
});


function updateCoursesCount(){
	var coursesStored = localStorage.savedcourses;
	if ($('.compare-link').length > 0) {
		var compareLink = $('.compare-link').attr("data-compare-path");
		var suggestionLink = $('.save-sug-link').attr("suggestion-link");
		if(coursesStored && JSON.parse(coursesStored).length > 0){
			$('.compare-link .compare-link__count').text(JSON.parse(coursesStored).length).parent().addClass('active').attr('data-analytics-value',JSON.parse(coursesStored).length).attr('href',compareLink);
		}
		else { 
			$('.compare-link .compare-link__count').text("").parent().removeClass('active').attr('data-analytics-value',0).attr('href',suggestionLink);
		}
	}
}

function searchNavigation(parseURL, parseQuery) {
	const url = /^https?:\/\//i.test(parseURL)
		? parseURL
		: globalThis.location.origin + parseURL;
	globalThis.location.href = url + '?q=' + encodeURIComponent(parseQuery);
}
$(document).ready(function(){ 
$('.dropdown-menu-primary').mouseleave(function() {
$(this).removeClass("active");  
$('.dropdown-inside').hide();
});
$('.dropdown-menu-primary').mouseover(function() {

$(this).children().show();
 $(this).addClass("active");



  var cnt=  $(".dropdown-links li:visible").length;
    for(var i=1; i<=cnt;i++){
        if(i%4==0){
         $(".dropdown-links li:visible").eq(i-1).addClass("rows"); 

        }

    }

$(".rows").each(function(e){
  var prev2=$(this).prev().outerHeight()||0;  
  var prev1=$(this).prev().prev().outerHeight()||0;  
  var current = $(this).outerHeight()||0;  
  var rows = [prev1,prev2,current];
  var max =Math.max.apply(Math,rows);
   $(this).height(max);
   $(this).prev().prev().height(max);
   $(this).prev().height(max);


});


}); 
$('.dropdown-menu-primary > a').on("keydown", function(e) {
  $(this).parent().addClass("active");
}); 

// To hide sub nav on focus out from primary nav
$('.dropdown-menu-primary').on("focusout", function(e){
  if($(this).find(e.relatedTarget).length == 0) 
    $('.dropdown-menu-primary').removeClass("active");
}); 
});

$(document).ready(function () {
	$(".feature-content__wrapper .lazy,.feature-content__container .lazy").slick({
		dots: true,
		autoplay: true,
		autoplaySpeed: 5000,
		lazyLoad: 'ondemand', // ondemand progressive anticipated
		infinite: true,
		prevArrow: '<button class="slick-prev slick-arrow" aria-label="Previous" type="button" style="">Previous<i><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 34 51" height="30"><defs><style>.svg-chevron {fill: #d0021b;fill-rule: evenodd; }</style></defs><path id="iconmonstr-angel-left-thin" class="svg-chevron" d="M38,1.6,7.455,25.5,38,49.34,36.685,51,4,25.5,36.706,0Z" transform="translate(-4)"/></i></button>',
		nextArrow: '<button class="slick-next slick-arrow" aria-label="Next" type="button" style="">Next<i><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 34 51" height="30"><defs><style>.cls-1 {fill: #d0021b;fill-rule: evenodd;}</style></defs><path id="iconmonstr-angel-right-thin" class="cls-1" d="M4,1.6,34.545,25.5,4,49.34,5.315,51,38,25.5,5.294,0Z" transform="translate(-4)"/></svg></i></button>'
	});
	
	var msieFeatureContent = false;
    var uaFeatureContent = window.navigator.userAgent;
    var oldieFeatureContent = uaFeatureContent.indexOf('MSIE ');
    var newieFeatureContent = uaFeatureContent.indexOf('Trident/');

    if((oldieFeatureContent > -1) || (newieFeatureContent > -1)) {
    	msieFeatureContent = true;
    }
    
    if(msieFeatureContent) {
        //IE specific code
        $('.feature-content__wrapper .slick-prev').css('left','-140px');
        $('.feature-content__wrapper .slick-next').css('right','-140px');
    }
});

$(document).ready(function () {
	$(".hero-home__wrapper .lazy").slick({
		dots: true,
		autoplay: true,
		autoplaySpeed: 5000,
		lazyLoad: 'ondemand', // ondemand progressive anticipated
		infinite: true,
		prevArrow: '<button class="hero-hm slick-prev slick-arrow" aria-label="Previous" type="button">Previous<span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 34 51" height="30"><defs><style>.hero-hm-prev {fill: #ffffff;fill-rule: evenodd; }</style></defs><path id="iconmonstr-angel-left-thin" class="hero-hm-prev" d="M38,1.6,7.455,25.5,38,49.34,36.685,51,4,25.5,36.706,0Z" transform="translate(-4)"/></span></button>',
		nextArrow: '<button class="hero-hm slick-next slick-arrow" aria-label="Next" type="button">Next<span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 34 51" height="30"><defs><style>.hero-hm-next {fill: #ffffff;fill-rule: evenodd;}</style></defs><path id="iconmonstr-angel-right-thin" class="hero-hm-next" d="M4,1.6,34.545,25.5,4,49.34,5.315,51,38,25.5,5.294,0Z" transform="translate(-4)"/></svg></span></button>'
	});

	var msIEHero = false;
    var uaHero = window.navigator.userAgent;
    var oldIEHero = uaHero.indexOf('MSIE ');
    var newHero = uaHero.indexOf('Trident/');

    if((oldIEHero > -1) || (newHero > -1)) {
    	msIEHero = true;
    }
    
    if(msIEHero) {
        $('.hero-home__desk .slick-prev').css({'left':'15px', 'width':'auto'});
         $('.hero-home__desk .slick-prev span').css({'width':'90px'});
        $('.hero-home__desk .slick-next').css({'right':'0', 'width':'107px'});
        $('.hero-home__desk .slick-next span').css({'width':'100px'});
    } 

    $('.hero-home-desk-slider').css({'width':'100%','display': 'block'});


    var crops = $('.hero__crops'); 
    $( crops ).each(function( i ) {
            if( $(this).data("assetUrl") && $(this).attr("id")) {
                var eleID = $(this).attr("id");
				getSmartCropData($(this).data("assetUrl"),eleID);
	}

    });

});

$(document).ready(function() {

	$(".left-nav-wrapper .has-child span.arrow-wraper").on( "click",function(evant){
	    $('.left-nav-wrapper .has-child .arrow-wraper a').attr("aria-label", "Expand sub navigation");
	    $(this).closest('li').toggleClass('active');
	    $('.left-nav-wrapper .has-child').not($(this).closest('li'), $(this)).removeClass("active");
	    $('.left-nav-wrapper .has-child.active .arrow-wraper a').attr("aria-label", "Collapse sub navigation");
	});
/** Mobile Nav Starts **/
$(".mobinav__content .mobinav-haschild .mobinav__content--acclink").on( "click",function(e){ 
    $('.mobinav__content .mobinav-haschild').removeClass("selected");        
    $('.mobinav__content .mobinav-haschild').not($(this).closest('li')).removeClass("active");
    $(this).closest('li').toggleClass('active');
    if($(this).closest('li').hasClass('active')){
        $(this).parent().next().attr("aria-hidden", "false");
        if(isKeyPress(e))
            $(this).parent().next().find('a').first().focus();
        $(this).attr("aria-expanded", "true");
        $(this).attr("data-analytics-value", "accordion open");
    }else{
        $(this).parent().next().attr("aria-hidden", "true");
        $(this).attr("aria-expanded", "false");
        $(this).attr("data-analytics-value", "accordion close");
    }
});

$(".mobinav__content .mobinav-link").on("click",function(){
    $('.mobinav__content .mobinav-haschild').removeClass("selected");
});

$(".mobinav__content .mobinav-haschild .main-link").on("click",function(){
    if($(this).parent().parent().hasClass("active")) {
        $(this).closest('li').removeClass('selected');
    } else {
        $(this).closest('li').addClass('selected');
    }
});    
/** Mobile Nav Ends **/

});
$(document).ready(function () {
	var mv_tags = $(".mv-tag__list__link");
	mv_tags.each(function () {
		if ($(this).height() > 30) {
			$(this).addClass("wrp-ln");
		}
	});

});

$(document).ready(function() {

    let events_url = "";

    function eventsLoadMore(id) {
        const eventsLimitFrom = parseInt($("#" + id).attr('data-limit'));
        if($("#"+id+" .events-gridlist__wrapper").attr("data-path")!==""){
            events_url= $("#"+id+" .events-gridlist__wrapper").attr("data-path")+".model.json?eventlimit="+eventsLimitFrom;
        }
        $.ajax({
         type: "GET",
         dataType: 'json',
         async: true,
         url: events_url,
         success: function(data) {
             if(data !== undefined) {
                 const encodedData = JSON.stringify(data);
                 eventsRenderTiles(JSON.parse(encodedData),id);
                 let eventsCurlimit = $('#' + id).attr('data-limit');
                 eventsCurlimit= parseInt(eventsCurlimit)+1;
                 $('#'+id).attr('data-limit', eventsCurlimit);
             }
         },
         error: function(textStatus, errorThrown) {
             console.error('File Error');
         }
        });
    }

    $(".events-loadmore").on("click", function(){
        const events_id = $(this).closest('.events-gridlist__container').attr("id");
        eventsLoadMore(events_id);
    });

    $(".events-loadmore").keydown(function(e) {
	  if(e.keyCode === 13) {
          const events_parseid = $(this).closest('.events-gridlist__container').attr("id");
          eventsLoadMore(events_parseid);
	  }
	});
function eventsRenderTiles(data,id){

    const eventsResultsData = data.eventGridList;
    const eventsTilesCount = eventsResultsData.length;

    for (let i = 0; i < eventsTilesCount; i++) {
        let eventsDesc = "";

        eventsDesc+='<div class="events-gridcmp__item-img">';

        eventsDesc+='<figure class="events-photo rollover">';

        eventsDesc+='<img alt="'+ formatAltText(eventsResultsData[i].eventImageAltText) +'" src="'+eventsResultsData[i].eventImage+'">';

        eventsDesc+='</figure>';

        eventsDesc+='</div>';

        eventsDesc+='<div class="events-gridcmp__item-content">';

        eventsDesc+='<h4><a href="'+eventsResultsData[i].eventPath+'" class="events-title">'+eventsResultsData[i].eventTitle+'</a></h4>';

        eventsDesc+='<div class="events-tagcloud">'+ ((data.hideEventTag===false && eventsResultsData[i].eventTag !==null && eventsResultsData[i].eventTag !="" ) ? '<span class="events-tags">'+eventsResultsData[i].eventTag+'</span>' : '') + '</div>';

        if(eventsResultsData[i].date!=="") {
            eventsDesc+='<div class="events-calendar">';

            eventsDesc+= '<span class="events-calendaricon"><svg width="16px" height="16px" viewBox="0 0 16 16" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><!-- Generator: Sketch 53.2 (72643) - https://sketchapp.com --><title>Icon / Small / Calendar</title><desc>Created with Sketch.</desc><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-151.000000, -171.000000)" fill="#a9a9a9" fill-rule="nonzero"><g transform="translate(1.000000, -1.000000)"><g><g transform="translate(150.000000, 172.000000)"><path d="M10,10 L10,12 L8,12 L8,10 L6,10 L6,8 L8,8 L10,8 L10,10 Z M2,4 L2,14 L14,14 L14,4 L14,6 L2,6 L2,4 Z M14,2 L16,2 L16,16 L0,16 L0,2 L2,2 L2,0 L4,0 L4,2 L12,2 L12,0 L14,0 L14,2 Z" id="Combined-Shape"></path></g></g></g></g></g></svg></span>';

            eventsDesc+='<span class="events-calendardate">'+eventsResultsData[i].date+'</span></div>';
        }

        if(eventsResultsData[i].locationTag!=="") {

            eventsDesc+='<div class="events-location">';

          	eventsDesc+='<span data-sly-test="${item.locationTag}" class="events-locationicon"><svg width="12px" height="16px" viewBox="0 0 12 16" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><!-- Generator: Sketch 53.2 (72643) - https://sketchapp.com --><title>Icon / Small / Location</title><desc>Created with Sketch.</desc><g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g transform="translate(-153.000000, -255.000000)" fill="#a9a9a9" fill-rule="nonzero"><g transform="translate(1.000000, -1.000000)"><g><g id="Icon-/-Small-/-Location" transform="translate(150.000000, 256.000000)"><path d="M7.605,3.55271368e-14 C10.701,3.55271368e-14 13.21,2.509 13.21,5.605 C13.21,8.701 10.701,11.21 7.605,11.21 C4.51,11.21 2,8.701 2,5.605 C2,2.509 4.51,3.55271368e-14 7.605,3.55271368e-14 Z M7.605,2 C5.617,2 4,3.617 4,5.605 C4,7.593 5.617,9.21 7.605,9.21 C9.593,9.21 11.21,7.593 11.21,5.605 C11.21,3.617 9.593,2 7.605,2 Z M7.605,12.6929 L10.855,15.9429 L4.355,15.9429 L7.605,12.6929 Z" id="Combined-Shape"></path></g></g></g></g></g></svg></span>';

            eventsDesc+='<span class="events-locationplace">'+eventsResultsData[i].locationTag+'</span></div>';
        }

        if(data.shortDescription===false && eventsResultsData[i].eventShortDescription!=="") {
            eventsDesc+='<p class="events-desc">'+eventsResultsData[i].eventShortDescription+'</p>';
        }

        eventsDesc+='</div>';

        if(data.eventHideLoadMore===true){
              $("#"+id+" .events-loadmore").hide();
        }

        const element = document.createElement('div');
        element.setAttribute('class', 'col-xs-12 col-sm-6 ' + data.gridLayout + ' events-gridcmp__item');
        element.innerHTML = eventsDesc;
        triggerAnchorLink(element);
         $("#"+id+" .events-gridcmp").append(element);
    }
}

    const triggerAnchorLink = (eachEvent) => {
        const image = eachEvent.querySelector('.events-photo img');
        image.addEventListener('click', () => {
            eachEvent.querySelector('a').click();
        });
        image.alt = formatAltText(image.alt);
    }
    const eventgridlists = document.querySelectorAll('.eventgridlist');
    eventgridlists.forEach((eventgridlist) => {
        const events = eventgridlist.querySelectorAll('.events-gridcmp__item');
        events.forEach((eachEvent) => {
            triggerAnchorLink(eachEvent);
        });
    });
});

const formatAltText = (alttext) => {
    if (alttext == null || alttext === undefined || alttext === 'null') {
      return "";
    }
    return alttext;
}
/*** Fullwidth Banner Starts ***/
var urlfw = $('#fullwidth-banner').data("assetUrl");
var elefw = $('#fullwidth-banner').attr("id");

if(urlfw) {
	getSmartCropData(urlfw,elefw);
}
$(window).load(function() {
    $('#fullwidth-banner').css('height', 'auto');
});

var urlfwm = $('#fullwidth-banner-mob').data("assetUrl");
var elefwm = $('#fullwidth-banner-mob').attr("id");

if(urlfwm) {
	getSmartCropData(urlfwm,elefwm);
}
$(window).load(function() {
    $('#fullwidth-banner-mob').css('height', 'auto');
});
/*** Fullwidth Banner Ends ***/
var an_header = document.getElementById("HeaderAnchor");
if ($("#HeaderAnchor").length > 0 && an_header != null && $("#HeaderAnchor").is(':visible')) {
    window.onscroll = function () {
        if (isMobileDevice()) {
            anchorNavXS();
        } else {
            anchorNavMD();
        }
    };
    var stickyNav = an_header.offsetTop;

    function anchorNavXS() {
        if (window.pageYOffset > stickyNav) {
            an_header.classList.add("sticky_anchornav");
        } else {
            an_header.classList.remove("sticky_anchornav");
        }
    }

    var anStickyNavTop = $(".an-AnchorNav").offset().top;
    function anchorNavMD() {
        var anScrollTop = $(window).scrollTop();
        if (anScrollTop > anStickyNavTop) {
            an_header.classList.add("sticky_anchornav");
        } else {
            an_header.classList.remove("sticky_anchornav");
        }
    }
    function isMobileDevice() {
        var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (isMobile) {
            return true;
        }
        return false;
    }

    var sections = $(".section-title__container");
    var nav = $(".an-AnchorNav");
    var nav_height = nav.outerHeight() + 58;
    $("a.an-AnchorNav_Link:first-child")
        .addClass("active")
        .attr("aria-selected", "true")
        .addClass("nav-first");
    $(".an-AnchorNav_Contents a")
        .last()
        .addClass("nav-end");

    $(function () {
        $("#anAnchorNavContents").anchorNavPoints({
            offset: 100,
            updateHash: true
        });
    });
    var an_lastScrollTop = 0;
    $(window).on("scroll", function (e) {
        $("a.an-AnchorNav_Link").removeClass('sc');
        nav.find("a").attr("aria-selected", "false");
        var currentLink = $("a.an-AnchorNav_Link.active").attr("href");
        nav.find('a[href="' + currentLink + '"]')
            .attr("aria-selected", "true")
            .addClass("active sc");

        var srolltopPosition = $(this).scrollTop();
        if (srolltopPosition > an_lastScrollTop) {
            nav.find('a[href="' + currentLink + '"]')
                .attr("aria-selected", "true");
        }

        nav.find('a[href="' + currentLink + '"]')
            .attr("aria-selected", "true");

        an_lastScrollTop = srolltopPosition;

        if (
            nav
                .find('a[href="' + currentLink + '"]')
                .attr("aria-selected", "true")
                .hasClass("nav-first")
        ) {
            anAdvancerLeft.click();
        }
        if (
            nav
                .find('a[href="' + currentLink + '"]')
                .attr("aria-selected", "true")
                .hasClass("nav-end")
        ) {
            anAdvancerRight.click();
        }
    });

    nav.find("a").on("click", function () {
        var $el = $(this),
            id = $el.attr("href");

        $("html, body").animate(
            {
                scrollTop: $(id).offset().top - nav_height
            },
            800
        );
    });

    var SETTINGS = {
        navBarTravelling: true,
        navBarTravelDirection: "",
        navBarTravelDistance: 100
    };

    var colours = {
        0: "transparent"
    };

    document.documentElement.classList.remove("no-js");
    document.documentElement.classList.add("js");

    var anAdvancerLeft = document.getElementById("anAdvancerLeft");
    var anAdvancerRight = document.getElementById("anAdvancerRight");

    var anIndicator = document.getElementById("anIndicator");

    var anAnchorNav = document.getElementById("anAnchorNav");
    var anAnchorNavContents = document.getElementById("anAnchorNavContents");

    anAnchorNav.setAttribute(
        "data-overflowing",
        determineOverflow(anAnchorNavContents, anAnchorNav)
    );

    moveIndicator(
        anAnchorNav.querySelector('[aria-selected="true"]'),
        colours[0]
    );

    var last_known_scroll_position = 0;
    var ticking = false;

    function doSomething(scroll_pos) {
        anAnchorNav.setAttribute(
            "data-overflowing",
            determineOverflow(anAnchorNavContents, anAnchorNav)
        );
    }

    anAnchorNav.addEventListener("scroll", function () {
        last_known_scroll_position = window.scrollY;
        if (!ticking) {
            window.requestAnimationFrame(function () {
                doSomething(last_known_scroll_position);
                ticking = false;
            });
        }
        ticking = true;
    });

    anAdvancerLeft.addEventListener("click", function () {
        if (SETTINGS.navBarTravelling === true) {
            return;
        }

        if (
            determineOverflow(anAnchorNavContents, anAnchorNav) === "left" ||
            determineOverflow(anAnchorNavContents, anAnchorNav) === "both"
        ) {
            var availableScrollLeft = anAnchorNav.scrollLeft;

            if (availableScrollLeft < SETTINGS.navBarTravelDistance * 2) {
                anAnchorNavContents.style.transform =
                    "translateX(" + availableScrollLeft + "px)";
            } else {
                anAnchorNavContents.style.transform =
                    "translateX(" + SETTINGS.navBarTravelDistance + "px)";
            }

            anAnchorNavContents.classList.remove(
                "an-AnchorNav_Contents-no-transition"
            );

            SETTINGS.navBarTravelDirection = "left";
            SETTINGS.navBarTravelling = false;
        }

        anAnchorNav.setAttribute(
            "data-overflowing",
            determineOverflow(anAnchorNavContents, anAnchorNav)
        );
    });

    anAdvancerRight.addEventListener("click", function () {
        if (SETTINGS.navBarTravelling === true) {
            return;
        }

        if (
            determineOverflow(anAnchorNavContents, anAnchorNav) === "right" ||
            determineOverflow(anAnchorNavContents, anAnchorNav) === "both"
        ) {
            var navBarRightEdge = anAnchorNavContents.getBoundingClientRect()
                .right;
            var navBarScrollerRightEdge = anAnchorNav.getBoundingClientRect()
                .right;

            var availableScrollRight = Math.floor(
                navBarRightEdge - navBarScrollerRightEdge
            );

            if (availableScrollRight < SETTINGS.navBarTravelDistance * 2) {
                anAnchorNavContents.style.transform =
                    "translateX(-" + availableScrollRight + "px)";
            } else {
                anAnchorNavContents.style.transform =
                    "translateX(-" + SETTINGS.navBarTravelDistance + "px)";
            }

            anAnchorNavContents.classList.remove(
                "an-AnchorNav_Contents-no-transition"
            );

            SETTINGS.navBarTravelDirection = "right";
            SETTINGS.navBarTravelling = true;
        }

        anAnchorNav.setAttribute(
            "data-overflowing",
            determineOverflow(anAnchorNavContents, anAnchorNav)
        );
    });

    anAnchorNavContents.addEventListener(
        "transitionend",
        function () {
            var styleOfTransform = window.getComputedStyle(
                anAnchorNavContents,
                null
            );
            var tr =
                styleOfTransform.getPropertyValue("-webkit-transform") ||
                styleOfTransform.getPropertyValue("transform");

            var amount = Math.abs(parseInt(tr.split(",")[4]) || 0);
            anAnchorNavContents.style.transform = "none";
            anAnchorNavContents.classList.add(
                "an-AnchorNav_Contents-no-transition"
            );

            if (SETTINGS.navBarTravelDirection === "left") {
                anAnchorNav.scrollLeft = anAnchorNav.scrollLeft - amount;
            } else {
                anAnchorNav.scrollLeft = anAnchorNav.scrollLeft + amount;
            }
            SETTINGS.navBarTravelling = false;
        },
        false
    );

    anAnchorNavContents.addEventListener("click", function (e) {
        var links = [].slice.call(
            document.querySelectorAll(".an-AnchorNav_Link")
        );
        links.forEach(function (item) {
            item.setAttribute("aria-selected", "false");
        });
        e.target.setAttribute("aria-selected", "true");

        moveIndicator(e.target, colours[links.indexOf(e.target)]);
    });

    function moveIndicator(item, color) {
        if (item) {
            var textPosition = item.getBoundingClientRect();
            var container = anAnchorNavContents.getBoundingClientRect().left;
            var distance = textPosition.left - container;
            var scroll = anAnchorNavContents.scrollLeft;
            if (anIndicator) {
                anIndicator.style.transform =
                    "translateX(" +
                    (distance + scroll) +
                    "px) scaleX(" +
                    textPosition.width * 0.01 +
                    ")";
            }
            if (color) {
                anIndicator.style.backgroundColor = color;
            }
        }
    }

    function determineOverflow(content, container) {
        var containerMetrics = container.getBoundingClientRect();
        var containerMetricsRight = Math.floor(containerMetrics.right);
        var containerMetricsLeft = Math.floor(containerMetrics.left);
        var contentMetrics = content.getBoundingClientRect();
        var contentMetricsRight = Math.floor(contentMetrics.right);
        var contentMetricsLeft = Math.floor(contentMetrics.left);
        if (
            containerMetricsLeft > contentMetricsLeft &&
            containerMetricsRight < contentMetricsRight
        ) {
            return "both";
        } else if (contentMetricsLeft < containerMetricsLeft) {
            return "left";
        } else if (contentMetricsRight > containerMetricsRight) {
            return "right";
        } else {
            return "none";
        }
    }
}

function addTableHoverBg(){
    $('.rmit-table__wrapper table tr:first-child').has('td').addClass('enable-hover-bg');
}

addTableHoverBg();
$(document).ready(function() {
	if ($('#campaign__stickycta').length){     
    $('body').addClass('sticky-cta-enabled');
		$( window ).scroll(function() {
	       
        var currentScrollPos = $( window ).scrollTop();
            if (currentScrollPos > "50") { 
              $("#campaign__stickycta").css("bottom","0");
            } 
            else {
               $("#campaign__stickycta").css("bottom","-100px");
            }
        });
  }

  if($("#campaign__stickycta-mobi").length){
    
    $(window).scroll(function() {
        var currentScrollPosMobi = $(window).scrollTop();

        if(currentScrollPosMobi > "30") { 
          $("#campaign__stickycta-mobi").css("bottom","0");
        } 
        else {
            $("#campaign__stickycta-mobi").css("bottom","-70px");
        }
    });
  }
});



if($(".chat-btn").length > 0) {
    $('.chat-btn').click(function (e) {
        
		e.preventDefault();
          
         var userInfo = JSON.parse(localStorage.getItem("userData"));
         var firstName = '';
         var lastName = '';
         var uniId = '';

        if(userInfo !==null) {
           firstName = userInfo.firstName ? userInfo.firstName : '';
           lastName = userInfo.lastName ? userInfo.lastName : '';
           uniId = userInfo.uniId ? userInfo.uniId : '';
        }

        CXBus.command('WebChat.open',{
            formJSON: {
                    inputs: [
                        // Default fields
                        {
                          id: 'cx_webchat_form_firstname',
                          name: 'firstname',
                          wrapper: '<div><br>{label}<br>{input}</div>',
                          maxlength: '100',
                          placeholder: 'Required',
                          label: 'First Name',
                          value: firstName
                        },
                        {
                          id: 'cx_webchat_form_lastname',
                          name: 'lastname',
                          wrapper: '<div><br>{label}<br>{input}</div>',
                          maxlength: '100',
                          placeholder: 'Required',
                          label: 'Last Name',
                          value: lastName
                        },
                        {
                          id: 'cx_webchat_form_employee_no',
                          name: 'employeeno',
                          wrapper: '<div><br>{label}<br>{input}</div>',
                          maxlength: '100',
                          placeholder: 'Required',
                          label: 'Employee No',
                          value: uniId
                        },
                        {
                          id: 'cx_webchat_form_email',
                          name: 'email',
                          wrapper: '<div><br>{label}<br>{input}<br></div>',
                          maxlength: '100',
                          placeholder: 'Optional',
                          label: 'Email'
                        }
                    ]
                }
          });


	});
}




   



$(document).ready(function(){

$( ".gopreviouspage").click(function() {
	goBackPreviousPage();
});

function goBackPreviousPage() {
  window.history.back();
}

});


/**
 * RMIT Program List Component
 *
 * Handles the program list display including applicant type switching,
 * facet filtering, and program table rendering.
 *
 * @requires cookie-util (provides domOrIntCookie, setDomesticOrInternationalCookie, displayDomesticOrInternational)
 * @requires main.js (provides trackFocus)
 */
(function (window) {
    'use strict';

    // ========================================================================
    // Constants
    // ========================================================================

    const KEY_CODES = {
        TAB: 9,
        ENTER: 13,
        ESCAPE: 27,
        SPACE: 32,
        ARROW_UP: 38,
        ARROW_DOWN: 40,
        ARROW_LEFT: 37,
        ARROW_RIGHT: 39
    };

    const SELECTORS = {
        APPLICANT_TYPE_RADIO: '.m-applicant-type-radio',
        APPLICANT_TYPE_SWITCHER: '.m-applicant-type-switcher',
        PROGRAM_LIST_MODAL: '.programlist-model',
        MODAL_OVERLAY: '.modal-overlay',
        PROGRAM_LIST_WRAP: '.programlistdesktopwrap',
        PROGRAM_TABLE: '.programlist-tbl',
        FACET_CONTAINER: '#programlist-facet',
        PROGRAM_LIST_CONTAINER: '#rmit-program-list'
    };

    const CSS_CLASSES = {
        HIDDEN: 'hidden',
        HIDE: 'hide',
        ACTIVE: 'active',
        OPEN: 'open',
        CHECKED: 'checked',
        DISABLE_SCROLL: 'disable-scroll',
        MODAL_SHOW: 'programlist-model__show',
        DOMESTIC: 'b-domestic',
        INTERNATIONAL: 'b-international',
        LOCAL: 'lcl',
        INTL: 'intnl'
    };

    const STUDENT_TYPES = {
        DOMESTIC: 'domestic',
        INTERNATIONAL: 'international'
    };

    // ========================================================================
    // DOM Helper Functions
    // ========================================================================

    /**
     * Selects a single element matching the selector.
     *
     * @param {string} selector - CSS selector
     * @param {Element} [context=document] - Context element to search within
     * @returns {Element|null} The matched element or null
     */
    function qs(selector, context) {
        return (context || document).querySelector(selector);
    }

    /**
     * Selects all elements matching the selector.
     *
     * @param {string} selector - CSS selector
     * @param {Element} [context=document] - Context element to search within
     * @returns {NodeList} The matched elements
     */
    function qsa(selector, context) {
        return (context || document).querySelectorAll(selector);
    }

    /**
     * Adds a class to an element.
     *
     * @param {Element} element - The target element
     * @param {string} className - Class name to add
     */
    function addClass(element, className) {
        if (element && className) {
            element.classList.add(className);
        }
    }

    /**
     * Removes a class from an element.
     *
     * @param {Element} element - The target element
     * @param {string} className - Class name to remove
     */
    function removeClass(element, className) {
        if (element && className) {
            element.classList.remove(className);
        }
    }

    /**
     * Toggles a class on an element.
     *
     * @param {Element} element - The target element
     * @param {string} className - Class name to toggle
     * @param {boolean} [force] - Force add (true) or remove (false)
     */
    function toggleClass(element, className, force) {
        if (element && className) {
            if (force !== undefined) {
                element.classList.toggle(className, force);
            } else {
                element.classList.toggle(className);
            }
        }
    }

    /**
     * Checks if an element has a class.
     *
     * @param {Element} element - The target element
     * @param {string} className - Class name to check
     * @returns {boolean} True if element has the class
     */
    function hasClass(element, className) {
        return element && element.classList && element.classList.contains(className);
    }

    /**
     * Sets an attribute on an element.
     *
     * @param {Element} element - The target element
     * @param {string} name - Attribute name
     * @param {string} value - Attribute value
     */
    function setAttr(element, name, value) {
        if (element) {
            element.setAttribute(name, value);
        }
    }

    /**
     * Gets an attribute from an element.
     *
     * @param {Element} element - The target element
     * @param {string} name - Attribute name
     * @returns {string|null} Attribute value or null
     */
    function getAttr(element, name) {
        return element ? element.getAttribute(name) : null;
    }

    /**
     * Sets the text content of an element.
     *
     * @param {Element} element - The target element
     * @param {string} text - Text content to set
     */
    function setText(element, text) {
        if (element) {
            element.textContent = text;
        }
    }

    /**
     * Gets the value of an input element.
     *
     * @param {Element} element - The input element
     * @returns {string} The input value or empty string
     */
    function getValue(element) {
        return element ? element.value : '';
    }

    /**
     * Shows an element by removing hide/hidden classes.
     *
     * @param {Element} element - The target element
     */
    function show(element) {
        if (element) {
            removeClass(element, CSS_CLASSES.HIDDEN);
            removeClass(element, CSS_CLASSES.HIDE);
            element.style.display = '';
        }
    }

    /**
     * Hides an element by setting display none.
     *
     * @param {Element} element - The target element
     */
    function hide(element) {
        if (element) {
            element.style.display = 'none';
        }
    }

    /**
     * Toggles element visibility.
     *
     * @param {Element} element - The target element
     */
    function toggle(element) {
        if (element) {
            if (element.style.display === 'none' || getComputedStyle(element).display === 'none') {
                element.style.display = '';
            } else {
                element.style.display = 'none';
            }
        }
    }

    /**
     * Checks if an element is visible (has offset dimensions).
     *
     * @param {Element} element - The target element
     * @returns {boolean} True if element is visible
     */
    function isVisible(element) {
        return element && (element.offsetWidth > 0 || element.offsetHeight > 0);
    }

    /**
     * Finds the closest ancestor matching a selector.
     *
     * @param {Element} element - Starting element
     * @param {string} selector - CSS selector
     * @returns {Element|null} The closest matching ancestor or null
     */
    function closest(element, selector) {
        return element ? element.closest(selector) : null;
    }

    /**
     * Gets the next sibling element.
     *
     * @param {Element} element - The target element
     * @returns {Element|null} Next sibling element or null
     */
    function nextSibling(element) {
        return element ? element.nextElementSibling : null;
    }

    /**
     * Gets the previous sibling element.
     *
     * @param {Element} element - The target element
     * @returns {Element|null} Previous sibling element or null
     */
    function prevSibling(element) {
        return element ? element.previousElementSibling : null;
    }

    /**
     * Iterates over a NodeList or array and executes a callback.
     *
     * @param {NodeList|Array} elements - Elements to iterate
     * @param {Function} callback - Callback function(element, index)
     */
    function forEach(elements, callback) {
        if (elements && elements.length) {
            Array.prototype.forEach.call(elements, callback);
        }
    }

    /**
     * Empties an element's content.
     *
     * @param {Element} element - The target element
     */
    function empty(element) {
        if (element) {
            element.innerHTML = '';
        }
    }

    // ========================================================================
    // Utility Functions
    // ========================================================================

    /**
     * Encodes HTML special characters to prevent XSS attacks.
     *
     * @param {string} value - The string to encode
     * @returns {string} The HTML-encoded string, or empty string if null/undefined
     */
    function encodeHtml(value) {
        if (value === null || value === undefined) {
            return '';
        }
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    /**
     * Validates and sanitizes a URL to prevent javascript: and other malicious protocols.
     *
     * @param {string} url - The URL to sanitize
     * @returns {string} The sanitized URL or '#' if invalid
     */
    function sanitizeUrl(url) {
        if (!url || typeof url !== 'string') {
            return '#';
        }
        const trimmedUrl = url.trim();
        // Allow relative URLs starting with / (but not protocol-relative //)
        if (trimmedUrl.startsWith('/') && !trimmedUrl.startsWith('//')) {
            return trimmedUrl;
        }
        // Allow http and https URLs
        if (trimmedUrl.startsWith('https://') || trimmedUrl.startsWith('http://')) {
            return trimmedUrl;
        }
        return '#';
    }

    /**
     * Formats a value for display, returning 'N/A' for null values.
     *
     * @param {*} value - The value to format
     * @returns {string} The formatted and encoded value
     */
    function formatDisplayValue(value) {
        if (value === null || value === undefined) {
            return 'N/A';
        }
        return encodeHtml(value);
    }

    /**
     * Checks if the body has the domestic class applied.
     *
     * @returns {boolean} True if domestic class is present
     */
    function hasDomesticClass() {
        return hasClass(document.body, CSS_CLASSES.DOMESTIC);
    }

    /**
     * Checks if the body has the international class applied.
     *
     * @returns {boolean} True if international class is present
     */
    function hasInternationalClass() {
        return hasClass(document.body, CSS_CLASSES.INTERNATIONAL);
    }

    /**
     * Checks if either domestic or international class is applied to body.
     *
     * @returns {boolean} True if either class is present
     */
    function hasStudentTypeClass() {
        return hasDomesticClass() || hasInternationalClass();
    }

    // ========================================================================
    // Applicant Type Switcher Module
    // ========================================================================

    /**
     * Creates and initializes the applicant type switcher functionality.
     *
     * @returns {Object} Public API for the switcher
     */
    const ApplicantTypeSwitcher = function () {

        /**
         * Updates the visual state of a radio button.
         *
         * @param {string} type - The student type ('local' or 'international')
         * @param {boolean} isChecked - Whether the radio should be checked
         */
        function setRadioButtonState(type, isChecked) {
        const radio = qs('input#' + type);
            if (radio) {
                radio.checked = isChecked;
                const label = closest(radio, 'label');
                if (label) {
                    toggleClass(label, CSS_CLASSES.CHECKED, isChecked);
                    const switcher = closest(label, '.switcher');
                    if (switcher) {
                        setAttr(switcher, 'aria-checked', String(isChecked));
                    }
                }
            }
        }

        /**
         * Closes the applicant type popup modal.
         */
        function closePopup() {
            removeClass(document.body, CSS_CLASSES.DISABLE_SCROLL);

            const modal = qs(SELECTORS.PROGRAM_LIST_MODAL);
            if (modal) {
                removeClass(modal, CSS_CLASSES.MODAL_SHOW);
            }

            forEach(qsa(SELECTORS.APPLICANT_TYPE_SWITCHER), function (switcher) {
                toggleClass(switcher, CSS_CLASSES.OPEN);
            });

            const overlay = qs(SELECTORS.MODAL_OVERLAY);
            if (overlay) {
                addClass(overlay, CSS_CLASSES.HIDE);
            }

            const referenceTrigger = qs(SELECTORS.APPLICANT_TYPE_RADIO + ' span.switcher.referenceTrigger');
            if (referenceTrigger) {
                referenceTrigger.focus();
            }
        }

        /**
         * Opens the applicant type popup modal.
         */
        function openPopup() {
            const switcher = qs(SELECTORS.APPLICANT_TYPE_SWITCHER + '.dropdown');
            const visibleHeaderText = qs('.header-text');
            const headerText = visibleHeaderText && isVisible(visibleHeaderText) ? visibleHeaderText.textContent : '';

            addClass(document.body, CSS_CLASSES.DISABLE_SCROLL);

            const modal = qs(SELECTORS.PROGRAM_LIST_MODAL);
            if (modal) {
                addClass(modal, CSS_CLASSES.MODAL_SHOW);
            }

            const overlay = qs(SELECTORS.MODAL_OVERLAY);
            if (overlay) {
                removeClass(overlay, CSS_CLASSES.HIDE);
            }

            if (switcher) {
                toggleClass(switcher, CSS_CLASSES.OPEN);
                setAttr(switcher, 'aria-label', headerText);
            }

            setTimeout(function () {
                const btnSwitcher = qs(SELECTORS.PROGRAM_LIST_MODAL + ' .btn-switcher');
                if (btnSwitcher && isVisible(btnSwitcher)) {
                    btnSwitcher.focus();
                }
            }, 100);
        }

        /**
         * Performs cleanup after switching student type.
         */
        function performSwitchCleanup() {
            // External function from cookie-util.js
            if (typeof displayDomesticOrInternational === 'function') {
                displayDomesticOrInternational();
            }
            forEach(qsa('.result-info-international, .result-info-local'), function (el) {
                addClass(el, CSS_CLASSES.HIDDEN);
            });
        }

        /**
         * Switches to the specified student type.
         *
         * @param {string} type - The student type to switch to
         * @param {Function} renderResultCallback - Callback to render results
         */
        function switchToType(type, renderResultCallback) {
            // External function from cookie-util.js
            if (typeof setDomesticOrInternationalCookie === 'function') {
                setDomesticOrInternationalCookie(type);
            }
            performSwitchCleanup();
            renderResultCallback();
        }

        /**
         * Switches to domestic student type.
         */
        function switchToDomestic() {
            switchToType(STUDENT_TYPES.DOMESTIC, showLocalResults);
        }

        /**
         * Switches to international student type.
         */
        function switchToInternational() {
            switchToType(STUDENT_TYPES.INTERNATIONAL, showInternationalResults);
        }

        /**
         * Updates radio button states based on current cookie value.
         */
        function updateRadioButtonState() {
            // External variable from cookie-util.js
            const cookieValue = typeof domOrIntCookie !== 'undefined' ? domOrIntCookie : undefined;

            forEach(qsa('.checkmark'), function (el) {
                removeClass(el, CSS_CLASSES.CHECKED);
            });

            if (cookieValue === STUDENT_TYPES.INTERNATIONAL) {
                setRadioButtonState('international', true);
                setRadioButtonState('local', false);
                showInternationalResults();
            } else if (cookieValue === STUDENT_TYPES.DOMESTIC || cookieValue === undefined) {
                if (cookieValue === undefined) {
                    switchToDomestic();
                }
                setRadioButtonState('local', true);
                setRadioButtonState('international', false);
                showLocalResults();
            }
        }

        /**
         * Closes the switcher dropdown.
         */
        function closeSwitcher() {
            forEach(qsa(SELECTORS.APPLICANT_TYPE_SWITCHER), function (switcher) {
                toggleClass(switcher, CSS_CLASSES.OPEN);
            });
        }

        /**
         * Toggles the Bootstrap dropdown manually (replacement for .dropdown('toggle')).
         *
         * @param {Element} element - The dropdown toggle element
         */
        function toggleDropdown(element) {
            const parent = closest(element, '.dropdown');
            if (parent) {
                toggleClass(parent, CSS_CLASSES.OPEN);
            }
        }

        // ---------------------------------------------------------------------
        // Event Bindings
        // ---------------------------------------------------------------------

        function bindSwitcherEvents() {
            // Radio button click
            forEach(qsa(SELECTORS.APPLICANT_TYPE_RADIO + ' .switcher'), function (el) {
                el.addEventListener('click', function (event) {
                    event.preventDefault();
                    openPopup();
                    forEach(qsa(SELECTORS.APPLICANT_TYPE_RADIO + ' .switcher'), function (s) {
                        removeClass(s, 'referenceTrigger');
                    });
                    addClass(this, 'referenceTrigger');
                });

                // Radio button keyboard support
                el.addEventListener('keydown', function (event) {
                    if (event.key === 'Enter') {
                        this.click();
                    }
                });
            });

            // Cancel button click
            forEach(qsa(SELECTORS.APPLICANT_TYPE_SWITCHER + ' .btn-cancel'), function (el) {
                el.addEventListener('click', function () {
                    closePopup();
                    return false;
                });
            });

            // International button click
            forEach(qsa(SELECTORS.APPLICANT_TYPE_SWITCHER + ' .btn-international'), function (el) {
                el.addEventListener('click', function () {
                    switchToInternational();
                    closePopup();
                    updateRadioButtonState();
                });
            });

            // Domestic button click
            forEach(qsa(SELECTORS.APPLICANT_TYPE_SWITCHER + ' .btn-domestic'), function (el) {
                el.addEventListener('click', function () {
                    switchToDomestic();
                    closePopup();
                    updateRadioButtonState();
                });
            });

            // Remove outline on mouse interaction
            forEach(qsa(SELECTORS.APPLICANT_TYPE_SWITCHER + ' .switcher'), function (el) {
                el.addEventListener('mousedown', function () {
                    forEach(this.querySelectorAll('.local, .international'), function (child) {
                        removeClass(child, 'span-outline');
                    });
                });

                // Add outline on keyboard navigation
                el.addEventListener('keyup', function (event) {
                    if (event.which === KEY_CODES.TAB) {
                        forEach(this.querySelectorAll('.local, .international'), function (child) {
                            addClass(child, 'span-outline');
                        });
                    }
                });

                // Switcher keyboard navigation
                el.addEventListener('keydown', function (event) {
                    const keyCode = event.keyCode || event.which;
                    const switcherEl = qs(SELECTORS.APPLICANT_TYPE_SWITCHER);
                    const isOpen = switcherEl && hasClass(switcherEl, CSS_CLASSES.OPEN);

                    if (event.shiftKey && keyCode === KEY_CODES.TAB && isOpen) {
                        const cancelBtn = qs(SELECTORS.APPLICANT_TYPE_SWITCHER + ' .btn-cancel');
                        if (cancelBtn) {
                            cancelBtn.focus();
                        }
                        event.preventDefault();
                    } else if (keyCode === KEY_CODES.ARROW_DOWN || keyCode === KEY_CODES.ARROW_UP) {
                        event.stopPropagation();
                    }
                });
            });

            // Cancel button keyboard handling
            forEach(qsa(SELECTORS.APPLICANT_TYPE_SWITCHER + ' .dropdown-menu .btn-cancel'), function (el) {
                el.addEventListener('keydown', function (event) {
                    const keyCode = event.keyCode || event.which;

                    if (keyCode === KEY_CODES.ENTER) {
                        closePopup();
                        const switcherEl = qs(SELECTORS.APPLICANT_TYPE_SWITCHER + ' .switcher');
                        if (switcherEl) {
                            toggleDropdown(switcherEl);
                            switcherEl.focus();
                        }
                        event.stopPropagation();
                        return false;
                    }

                    if (keyCode === KEY_CODES.TAB && !event.shiftKey) {
                        setTimeout(function () {
                            const headerText = qs('.header-text');
                            if (headerText && isVisible(headerText)) {
                                headerText.focus();
                            }
                        }, 10);
                    }
                });
            });

            // Header text shift+tab handling
            forEach(qsa('.header-text'), function (el) {
                el.addEventListener('keydown', function (event) {
                    const keyCode = event.keyCode || event.which;
                    if (event.shiftKey && keyCode === KEY_CODES.TAB) {
                        const cancelBtn = qs('.btn-cancel');
                        if (cancelBtn && isVisible(cancelBtn)) {
                            cancelBtn.focus();
                        }
                        event.preventDefault();
                    }
                });
            });

            // Dropdown menu button keyboard handling
            forEach(qsa(SELECTORS.APPLICANT_TYPE_SWITCHER + ' .dropdown-menu a.btn'), function (el) {
                el.addEventListener('keydown', function (event) {
                    const keyCode = event.keyCode || event.which;

                    if (keyCode === KEY_CODES.ENTER) {
                        if (hasClass(this, 'btn-domestic')) {
                            switchToDomestic();
                        } else if (hasClass(this, 'btn-international')) {
                            switchToInternational();
                        }
                        closePopup();
                        event.stopPropagation();
                        return false;
                    }
                });
            });

            // Prevent dropdown menu mousedown default
            forEach(qsa(SELECTORS.APPLICANT_TYPE_SWITCHER + ' .dropdown-menu'), function (el) {
                el.addEventListener('mousedown', function (event) {
                    event.preventDefault();
                    return false;
                });
            });

            // Escape key closes popup
            document.addEventListener('keyup', function (event) {
                if (event.key === 'Escape') {
                    closePopup();
                    forEach(qsa(SELECTORS.APPLICANT_TYPE_SWITCHER), function (switcher) {
                        removeClass(switcher, CSS_CLASSES.OPEN);
                    });
                }
            });
        }

        // Initialize
        bindSwitcherEvents();
        updateRadioButtonState();

        // Public API
        return {
            closeSwitcher: closeSwitcher,
            switchToDomestic: switchToDomestic,
            switchToInternational: switchToInternational,
            updateRadioButtonState: updateRadioButtonState
        };
    };

    // ========================================================================
    // Program Data API Module
    // ========================================================================

    const ProgramDataService = {

        /**
         * Builds the API path for fetching program data.
         *
         * @param {string} facetFilter - The facet filter value
         * @param {boolean} includeAllData - Whether to include all data
         * @param {Element} componentRoot - The component root element
         * @returns {string} The constructed API path
         */
        buildPath: function (facetFilter, includeAllData, componentRoot) {
            const pathInput = qs('input[name=componentPath]', componentRoot);
            const componentPath = getValue(pathInput) || '';
            let path = componentPath;

            path += includeAllData ? '.model.alldata.json' : '.model.json';

            if (facetFilter && facetFilter !== 'undefined') {
                const normalizedFilter = facetFilter.replace(':', '/');
                path += '/' + normalizedFilter + '.json';
            }

            return path;
        },

        /**
         * Fetches program data from the server using fetch API.
         *
         * @param {string} url - The API URL
         * @param {Element} componentRoot - The component root element
         * @param {boolean} includeFacetData - Whether to render facet data
         */
        fetchProgramData: function (url, componentRoot, includeFacetData) {
            fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(function (response) {
                if (!response.ok) {
                    throw new Error('Network response was not ok: ' + response.status);
                }
                return response.json();
            })
            .then(function (data) {
                ProgramRenderer.renderProgramData(data, componentRoot, includeFacetData);
            })
            .catch(function (error) {
                console.error('Error fetching program data:', error);
            });
        },

        /**
         * Fetches all program data for a component.
         *
         * @param {Element} componentRoot - The component root element
         */
        fetchAllData: function (componentRoot) {
            const facetInput = qs('input[name=componentdefaultFacet]', componentRoot);
            const defaultFacet = getValue(facetInput);
            const facetType = defaultFacet === 'all' ? undefined : defaultFacet;
            const path = this.buildPath(facetType, true, componentRoot);

            this.fetchProgramData(path, componentRoot, true);
        }
    };

    // ========================================================================
    // Program Renderer Module
    // ========================================================================

    const ProgramRenderer = {

        /**
         * Renders program data including table and optionally facets.
         *
         * @param {Object} response - The API response
         * @param {Element} componentRoot - The component root element
         * @param {boolean} includeFacetData - Whether to render facet data
         */
        renderProgramData: function (response, componentRoot, includeFacetData) {
            if (!response) {
                return;
            }

            this.renderTable(
                response.programsWithHeader,
                response.compareToolTip,
                response.saveSVGIcon,
                response.enableSave,
                response.emptyArialLabel,
                response.statusArialLabel,
                componentRoot
            );

            if (includeFacetData && response.facetAndOtherData && response.facetAndOtherData[0]) {
                const facetData = response.facetAndOtherData[0];
                FacetRenderer.render(facetData, componentRoot);
                this.updateSwitcherLabels(facetData);
            }
        },

        /**
         * Updates the switcher UI labels from facet data.
         *
         * @param {Object} facetData - Facet configuration data containing studentTypeData, mobileFacetTitle, and programLabel
         */
        updateSwitcherLabels: function (facetData) {
            if (!facetData || !facetData.studentTypeData) {
                return;
            }

            const studentTypeData = facetData.studentTypeData;
            const localData = studentTypeData[0];
            const internationalData = studentTypeData[1];

            setText(qs('#local-label'), localData.studentTypeLabel);
            setText(qs('#international-label'), internationalData.studentTypeLabel);
            setText(qs('.programlist--pageheading'), facetData.programLabel);
            setText(qs('.programlist--btn #filter-xs'), facetData.mobileFacetTitle);
            setText(qs('#local-tooltip'), localData.studentTypeToolTip);
            setText(qs('.programlist__tooltip__localtext'), localData.studentTypeToolTip);
            setText(qs('#international-tooltip'), internationalData.studentTypeToolTip);
            setText(qs('.programlist__tooltip__inttext'), internationalData.studentTypeToolTip);
        },

        /**
         * Determines if the save/compare feature should be enabled.
         *
         * @param {Object} tableData - The table configuration data
         * @param {boolean} enableSave - The initial enable state
         * @returns {boolean} Whether save should be enabled
         */
        isSaveEnabled: function (tableData, enableSave) {
            return enableSave && tableData.compareLabel && tableData.compareLabel !== '';
        },

        /**
         * Builds CSS classes for a program row based on student type availability.
         *
         * @param {boolean} isInternational - Whether available for international students
         * @param {boolean} isDomestic - Whether available for domestic students
         * @returns {string} The class attribute string
         */
        buildProgramRowClasses: function (isInternational, isDomestic) {
            let classes = [];

            if (isInternational && isDomestic) {
                classes = [CSS_CLASSES.LOCAL, CSS_CLASSES.INTL];
            } else if (isInternational) {
                classes = [CSS_CLASSES.INTERNATIONAL, CSS_CLASSES.INTL];
            } else if (isDomestic) {
                classes = [CSS_CLASSES.DOMESTIC, CSS_CLASSES.LOCAL];
            } else if (hasStudentTypeClass()) {
                classes = [CSS_CLASSES.DOMESTIC, CSS_CLASSES.INTERNATIONAL];
            } else {
                classes = [CSS_CLASSES.HIDDEN];
            }

            return 'class="' + classes.join(' ') + '"';
        },

        /**
         * Builds the save button HTML for a program row.
         *
         * @param {Object} program - The program data
         * @param {string} compareToolTip - The compare tooltip text
         * @param {string} saveSvgIcon - The SVG icon HTML
         * @param {string} emptyAriaLabel - Label when not saved
         * @param {string} statusAriaLabel - Label when saved
         * @returns {string} The save button HTML
         */
        buildSaveButton: function (program, compareToolTip, saveSvgIcon, emptyAriaLabel, statusAriaLabel) {
            const encodedCode = encodeHtml(program.programCode);
            const encodedName = encodeHtml(program.programName);
            const encodedPath = encodeHtml(program.pagePath);
            const encodedEmptyLabel = encodeHtml(emptyAriaLabel);
            const encodedStatusLabel = encodeHtml(statusAriaLabel);
            // Note: compareToolTip contains trusted HTML from server (via getHtmlSource()), not encoded

            return '<div class="save-opt-wpr" data-course-id="' + encodedCode +
                '" data-course-name="' + encodedName +
                '" data-course-path="' + encodedPath + '">' +
                '<span tabindex="0" role="checkbox" data-analytics-type="savencompare" ' +
                'data-analytics-value="compare" data-analytics-course="' + encodedName +
                '" class="save-btn span-outline remove-outline" ' +
                'aria-label="' + encodedEmptyLabel + ' ' + encodedName +
                '" data-save-program="' + encodedEmptyLabel + ' ' + encodedName +
                '" data-unsave-program="' + encodedStatusLabel + ' ' + encodedName +
                '" aria-checked="false">' + saveSvgIcon + '</span>' +
                '<div class="save-tooltip text-left" role="tooltip" style="display: none;">' +
                (compareToolTip || '') + '</div></div>';
        },

        /**
         * Builds the program name cell HTML.
         *
         * @param {Object} program - The program data
         * @returns {string} The table cell HTML
         */
        buildProgramNameCell: function (program) {
            const sanitizedUrl = sanitizeUrl(program.programUrl);
            const encodedName = encodeHtml(program.programName);
            const linkHtml = '<a href="' + sanitizedUrl +
                '" data-analytics-type="program list" data-analytics-prgname="' +
                encodedName + '">' + encodedName + '</a>';

            return '<td class="pl--programname show-hidelink">' + linkHtml + '</td>' +
                '<td class="pl--programname hidelink">' + linkHtml + '</td>';
        },

        /**
         * Builds the entry score cell HTML with domestic/international variants.
         *
         * @param {Object} program - The program data
         * @returns {string} The table cell HTML
         */
        buildEntryScoreCell: function (program) {
            if (hasStudentTypeClass()) {
                return '<td class="pl--entryscore">' +
                    '<span class="b-domestic">' + formatDisplayValue(program.entryScoreLoc) + '</span>' +
                    '<span class="b-international">' + formatDisplayValue(program.entryScoreInt) + '</span>' +
                    '</td>';
            }
            return '<td class="pl--entryscore"><span>' +
                formatDisplayValue(program.entryScoreInt) + '</span></td>';
        },

        /**
         * Builds the CTA button cell HTML.
         *
         * @param {Object} tableData - The table configuration
         * @param {Object} program - The program data
         * @returns {string} The table cell HTML
         */
        buildCtaCell: function (tableData, program) {
            const sanitizedUrl = sanitizeUrl(program.programUrl);
            const encodedName = encodeHtml(program.programName);
            const isMidYear = program.midYear === true;
            const ctaLabel = isMidYear ? tableData.openMidYearLabel : tableData.ctaLabel;
            const encodedCtaLabel = encodeHtml(ctaLabel);

            const cellClass = isMidYear ? 'pl-midyear--ctabtn' : 'pl--ctabtn';
            const wrapperClass = isMidYear ? 'pl--btn_Wrap_Secondary_midyear' : 'pl--btn_Wrap_Secondary';
            const linkClass = isMidYear
                ? 'pl--rmit_btnCta_midyear pl--rmit_secondaryBtn_midyear'
                : 'pl--rmit_btnCta pl--rmit_secondaryBtn';

            return '<td class="' + cellClass + '">' +
                '<div class="' + wrapperClass + '">' +
                '<a class="' + linkClass + '" href="' + sanitizedUrl +
                '" data-analytics-type="program list" data-analytics-prgname="' + encodedName +
                '" data-analytics-value="' + encodedCtaLabel +
                '" aria-label="' + encodedCtaLabel + ' ' + encodedName + '">' +
                encodedCtaLabel + '</a></div></td>';
        },

        /**
         * Builds a single program table row.
         *
         * @param {Object} program - The program data
         * @param {Object} tableData - The table configuration
         * @param {Object} config - Column visibility configuration
         * @returns {string} The table row HTML
         */
        buildProgramRow: function (program, tableData, config) {
            const rowClasses = this.buildProgramRowClasses(
                program.studentTypeInternational,
                program.studentTypeDomestic
            );
            let row = '<tr ' + rowClasses + '>';

            if (config.enableSave) {
                row += '<td class="saveprogram-prg-list text-center">' +
                    this.buildSaveButton(
                        program,
                        config.compareToolTip,
                        config.saveSvgIcon,
                        config.emptyAriaLabel,
                        config.statusAriaLabel
                    ) + '</td>';
            }

            if (config.showProgramName) {
                row += this.buildProgramNameCell(program);
            }

            if (config.showStudyType) {
                row += '<td class="pl--studytype">' + formatDisplayValue(program.studyType) + '</td>';
            }

            if (config.showLocation) {
                row += '<td class="pl--location">' + formatDisplayValue(program.locationList) + '</td>';
            }

            if (config.showEntryScore) {
                row += this.buildEntryScoreCell(program);
            }

            row += this.buildCtaCell(tableData, program);
            row += '</tr>';

            return row;
        },

        /**
         * Builds the table header HTML.
         *
         * @param {Object} tableData - The table configuration
         * @param {Object} config - Column visibility configuration
         * @returns {string} The table header HTML
         */
        buildTableHeader: function (tableData, config) {
            let header = '<table class="programlist-tbl table table-striped" ' +
                'aria-describedby="programlist" id="program-table-1"><thead><tr>';

            if (config.enableSave) {
                header += '<th scope="col" class="compare-lbl">' +
                    formatDisplayValue(tableData.compareLabel) + '</th>';
            }

            if (config.showProgramName) {
                header += '<th scope="col">' + encodeHtml(tableData.programNameHeader) + '</th>';
            }

            if (config.showStudyType) {
                header += '<th scope="col">' + formatDisplayValue(tableData.studyType) + '</th>';
            }

            if (config.showLocation) {
                header += '<th scope="col">' + encodeHtml(tableData.locationHeader) + '</th>';
            }

            if (config.showEntryScore) {
                header += '<th scope="col">' + encodeHtml(tableData.entryScoreHeader) + '</th>';
            }

            header += '<th scope="col">&nbsp;</th></tr></thead>';

            return header;
        },

        /**
         * Renders the program table into the component.
         *
         * @param {Object} tableData - The table data from API
         * @param {string} compareToolTip - Compare tooltip text
         * @param {string} saveSvgIcon - Save button SVG icon
         * @param {boolean} enableSave - Whether save is enabled
         * @param {string} emptyAriaLabel - Aria label when not saved
         * @param {string} statusAriaLabel - Aria label when saved
         * @param {Element} componentRoot - Component root element
         */
        renderTable: function (tableData, compareToolTip, saveSvgIcon, enableSave, emptyAriaLabel, statusAriaLabel, componentRoot) {
            if (!tableData || !tableData.programs) {
                return;
            }

            const config = {
                enableSave: this.isSaveEnabled(tableData, enableSave),
                showProgramName: Boolean(tableData.programNameHeader),
                showStudyType: Boolean(tableData.studyType),
                showLocation: Boolean(tableData.locationHeader),
                showEntryScore: Boolean(tableData.entryScoreHeader),
                compareToolTip: compareToolTip,
                saveSvgIcon: saveSvgIcon,
                emptyAriaLabel: emptyAriaLabel,
                statusAriaLabel: statusAriaLabel
            };

            let tableHtml = this.buildTableHeader(tableData, config);
            tableHtml += '<tbody>';

            const programs = tableData.programs;
            for (let i = 0; i < programs.length; i++) {
                tableHtml += this.buildProgramRow(programs[i], tableData, config);
            }

            tableHtml += '</tbody></table>';

            // Empty state messages
            const emptyStateHtml =
                '<div class="result-info-local hidden">Sorry, no courses are currently available to domestic students under this study area. Please search under a different <a href="https://www.rmit.edu.au/study-with-us">study area</a> or use our <a href="https://pathways.rmit.edu.au/">pathways tool</a> to find a different course.</div>' +
                '<div class="result-info-international hidden">Sorry, no programs are currently available for international students under this study area. Please search under a different <a href="https://www.rmit.edu.au/study-with-us">study area</a> to find a different course.</div>';

            const container = qs(SELECTORS.PROGRAM_LIST_CONTAINER, componentRoot);
            if (container) {
                empty(container);
                container.innerHTML = tableHtml + emptyStateHtml;
            }

            this.updateResultsVisibility(componentRoot);
        },

        /**
         * Updates results visibility based on current student type selection.
         *
         * @param {Element} componentRoot - Component root element
         */
        updateResultsVisibility: function (componentRoot) {
            setTimeout(function () {
                // External variable from cookie-util.js
                const cookieValue = typeof domOrIntCookie !== 'undefined' ? domOrIntCookie : null;

                if (cookieValue === STUDENT_TYPES.INTERNATIONAL) {
                    showInternationalResults();
                } else {
                    showLocalResults();
                }

                // Initialize save courses if available
                if (globalThis.saveCourses) {
                    globalThis.saveCourses(componentRoot);
                }
            }, 10);
        }
    };

    // ========================================================================
    // Facet Renderer Module
    // ========================================================================

    const FacetRenderer = {

        /**
         * Builds a single facet list item element.
         *
         * @param {Object} facet - The facet configuration
         * @returns {HTMLElement} The list item element
         */
        buildFacetItem: function (facet) {
            const isSelected = facet.selectedFacet === 'true';

            const listItem = document.createElement('li');
            listItem.setAttribute('role', 'presentation');
            if (isSelected) {
                listItem.className = CSS_CLASSES.ACTIVE;
            }

            const anchor = document.createElement('a');
            anchor.setAttribute('aria-controls', '');
            anchor.setAttribute('role', 'tab');
            anchor.href = 'javascript:void(0);';
            anchor.className = 'program-list-facet';
            anchor.setAttribute('data_type', facet.type || '');
            anchor.tabIndex = isSelected ? 0 : -1;
            anchor.setAttribute('aria-selected', isSelected ? 'true' : 'false');

            const tooltipDiv = document.createElement('div');
            tooltipDiv.className = 'programlist--tooltip';
            tooltipDiv.textContent = facet.label || '';

            if (facet.tooTip) {
                const tooltipSpan = document.createElement('span');
                tooltipSpan.className = 'tooltiptext';
                tooltipSpan.setAttribute('aria-hidden', 'true');
                tooltipSpan.textContent = facet.tooTip + ' ';
                tooltipDiv.appendChild(tooltipSpan);
            }

            anchor.appendChild(tooltipDiv);
            listItem.appendChild(anchor);

            return listItem;
        },

        /**
         * Builds all facet list elements including the 'Show All' option.
         *
         * @param {Object} facetData - The facet configuration
         * @returns {Object} Object containing fragment and activeCount
         */
        buildFacetList: function (facetData) {
            const fragment = document.createDocumentFragment();
            const activeCount = 0;

            // Add 'Show All' option if enabled
            if (facetData.enableShowAll === 'true') {
                const showAllItem = document.createElement('li');
                showAllItem.setAttribute('role', 'presentation');

                const showAllAnchor = document.createElement('a');
                showAllAnchor.setAttribute('aria-controls', '');
                showAllAnchor.setAttribute('role', 'tab');
                showAllAnchor.href = 'javascript:void(0);';
                showAllAnchor.id = 'all-programs';
                showAllAnchor.className = 'program-list-facet';
                showAllAnchor.tabIndex = 0;

                const showAllTooltip = document.createElement('div');
                showAllTooltip.className = 'programlist--tooltip';
                showAllTooltip.textContent = facetData.showAllValue || '';

                showAllAnchor.appendChild(showAllTooltip);
                showAllItem.appendChild(showAllAnchor);
                fragment.appendChild(showAllItem);
            }

            // Add individual facet items
            const facets = facetData.facets;
            for (let i = 0; i < facets.length; i++) {
                const facet = facets[i];
                if (facet.showFacet === 'true') {
                    fragment.appendChild(this.buildFacetItem(facet));
                    if (facet.selectedFacet === 'true') {
                        activeCount++;
                    }
                }
            }

            return {
                fragment: fragment,
                activeCount: activeCount
            };
        },

        /**
         * Ensures at least one facet is marked as active.
         *
         * @param {number} activeCount - Number of currently active facets
         * @param {Element} componentRoot - Component root element
         */
        ensureActiveFacet: function (activeCount, componentRoot) {
            const facetList = qs('.programlist--facets .nav-tabs', componentRoot);

            if (activeCount === 0) {
                const allPrograms = qs('#all-programs', componentRoot);
                if (allPrograms) {
                    const parentLi = closest(allPrograms, 'li');
                    if (parentLi) {
                        addClass(parentLi, CSS_CLASSES.ACTIVE);
                    }
                }
            }

            if (facetList && !qs('li.' + CSS_CLASSES.ACTIVE, facetList)) {
                const firstItem = qs('li', facetList);
                if (firstItem) {
                    addClass(firstItem, CSS_CLASSES.ACTIVE);
                    const firstAnchor = qs('a', firstItem);
                    if (firstAnchor) {
                        setAttr(firstAnchor, 'tabindex', '0');
                        setAttr(firstAnchor, 'aria-selected', 'true');
                    }
                }
            }
        },

        /**
         * Handles keyboard navigation for facet links.
         *
         * @param {Event} event - The keydown event
         */
        handleFacetKeydown: function (event) {
            const target = event.target;
            const isNextKey = event.keyCode === KEY_CODES.ARROW_RIGHT || event.keyCode === KEY_CODES.ARROW_DOWN;
            const isPrevKey = event.keyCode === KEY_CODES.ARROW_LEFT || event.keyCode === KEY_CODES.ARROW_UP;

            const parentLi = closest(target, 'li');
            const parentUl = parentLi ? parentLi.parentElement : null;

            if (isNextKey && parentLi && nextSibling(parentLi)) {
                event.preventDefault();
                forEach(qsa('a', parentUl), function (a) {
                    setAttr(a, 'tabindex', '-1');
                    setAttr(a, 'aria-selected', 'false');
                });
                const nextAnchor = qs('a', nextSibling(parentLi));
                if (nextAnchor) {
                    setAttr(nextAnchor, 'tabindex', '0');
                    setAttr(nextAnchor, 'aria-selected', 'true');
                    nextAnchor.focus();
                    nextAnchor.click();
                }
                return;
            }

            if (isPrevKey && parentLi && prevSibling(parentLi)) {
                event.preventDefault();
                forEach(qsa('a', parentUl), function (a) {
                    setAttr(a, 'tabindex', '-1');
                    setAttr(a, 'aria-selected', 'false');
                });
                const prevAnchor = qs('a', prevSibling(parentLi));
                if (prevAnchor) {
                    setAttr(prevAnchor, 'tabindex', '0');
                    setAttr(prevAnchor, 'aria-selected', 'true');
                    prevAnchor.focus();
                    prevAnchor.click();
                }
                return;
            }

            if (event.keyCode === KEY_CODES.SPACE) {
                target.click();
            }
        },

        /**
         * Binds event handlers to facet elements.
         *
         * @param {Element} componentRoot - Component root element
         */
        bindFacetEvents: function (componentRoot) {
            const facetLinks = qsa(SELECTORS.FACET_CONTAINER + ' a', componentRoot);

            forEach(facetLinks, function (link) {
                link.addEventListener('click', function () {
                    const parentLi = closest(this, 'li');
                    const parentUl = parentLi ? parentLi.parentElement : null;
                    if (parentUl) {
                        forEach(qsa('a', parentUl), function (a) {
                            setAttr(a, 'tabindex', '-1');
                            setAttr(a, 'aria-selected', 'false');
                        });
                    }
                    setAttr(this, 'tabindex', '0');
                    setAttr(this, 'aria-selected', 'true');
                });

                link.addEventListener('keydown', FacetRenderer.handleFacetKeydown);
            });
        },

        /**
         * Renders the facet navigation.
         *
         * @param {Object} facetData - The facet configuration
         * @param {Element} componentRoot - Component root element
         */
        render: function (facetData, componentRoot) {
            if (!facetData || !facetData.facets || facetData.facets === 'undefined') {
                return;
            }

            const result = this.buildFacetList(facetData);
            const facetContainer = qs(SELECTORS.FACET_CONTAINER, componentRoot);
            if (facetContainer) {
                empty(facetContainer);
                facetContainer.appendChild(result.fragment);
            }

            // Update labels
            setText(qs('.programlist--pageheading', componentRoot), facetData.programLabel);
            setText(qs('.programlist--btn #filter-xs', componentRoot), facetData.mobileFacetTitle);
            setAttr(qs('.programlist--dropdown', componentRoot), 'aria-label', facetData.mobileFacetTitle);

            this.ensureActiveFacet(result.activeCount, componentRoot);
            this.bindFacetEvents(componentRoot);
        }
    };

    // ========================================================================
    // Results Display Functions
    // ========================================================================

    /**
     * Shows results for local/domestic students.
     */
    function showLocalResults() {
        showResultsByType(CSS_CLASSES.LOCAL, '.result-info-local');
    }

    /**
     * Shows results for international students.
     */
    function showInternationalResults() {
        showResultsByType(CSS_CLASSES.INTL, '.result-info-international');
    }

    /**
     * Shows or hides program results based on student type.
     *
     * @param {string} rowClass - The CSS class for matching rows
     * @param {string} emptyResultSelector - Selector for empty state message
     */
    function showResultsByType(rowClass, emptyResultSelector) {
        const table = qs(SELECTORS.PROGRAM_TABLE);
        const matchingRows = table ? qsa('tr.' + rowClass, table) : [];
        const emptyMessage = qs(emptyResultSelector);
        const otherEmptyMessages = qsa('.result-info-local, .result-info-international');

        if (matchingRows.length === 0) {
            if (table) {
                hide(table);
            }
            if (emptyMessage) {
                removeClass(emptyMessage, CSS_CLASSES.HIDDEN);
            }
            forEach(otherEmptyMessages, function (el) {
                if (el !== emptyMessage) {
                    addClass(el, CSS_CLASSES.HIDDEN);
                }
            });
        } else {
            if (table) {
                show(table);
            }
            if (emptyMessage) {
                addClass(emptyMessage, CSS_CLASSES.HIDDEN);
            }

            // Update zebra striping for visible rows
            if (table) {
                const allRows = qsa('tr', table);
                forEach(allRows, function (row) {
                    removeClass(row, 'odd');
                    removeClass(row, 'even');
                });

                const visibleRows = [];
                forEach(allRows, function (row) {
                    if (isVisible(row)) {
                        visibleRows.push(row);
                    }
                });

                for (let i = 0; i < visibleRows.length; i++) {
                    addClass(visibleRows[i], i % 2 === 0 ? 'even' : 'odd');
                }
            }
        }
    }

    // ========================================================================
    // Facet Click Handler (Document Delegation)
    // ========================================================================

    document.addEventListener('click', function (event) {
        const target = event.target;
        const facetLink = closest(target, '.program-list-facet');

        if (!facetLink) {
            return;
        }

        const componentRoot = closest(facetLink, SELECTORS.PROGRAM_LIST_WRAP);
        if (!componentRoot) {
            return;
        }

        forEach(qsa('li', componentRoot), function (li) {
            removeClass(li, CSS_CLASSES.ACTIVE);
        });

        const parentLi = closest(facetLink, 'li');
        if (parentLi) {
            addClass(parentLi, CSS_CLASSES.ACTIVE);
        }

        if (getAttr(facetLink, 'id') === 'all-programs') {
            ProgramDataService.fetchAllData(componentRoot);
        } else {
            const facetType = getAttr(facetLink, 'data_type');
            const path = ProgramDataService.buildPath(facetType, false, componentRoot);
            ProgramDataService.fetchProgramData(path, componentRoot, false);
        }
    });

    // ========================================================================
    // Document Ready Initialization
    // ========================================================================

    function initOnDOMReady() {
        // Initialize applicant type switcher
        if (qs(SELECTORS.APPLICANT_TYPE_RADIO)) {
            if (typeof displayDomesticOrInternational === 'function') {
                displayDomesticOrInternational();
            }
            ApplicantTypeSwitcher();
        }

        // Initialize dropdown toggle
        forEach(qsa('.programlist--dropdown'), function (dropdown) {
            dropdown.addEventListener('click', function () {
                const facets = qs('.programlist--facets');
                const isExpanded = getAttr(this, 'aria-expanded') === 'true';

                if (facets) {
                    toggle(facets);
                }
                setAttr(this, 'aria-expanded', String(!isExpanded));

                const angleIcon = qs('span.fa-angle-down', this);
                if (angleIcon) {
                    const parent = this.parentElement;
                    const arrowIcon = parent ? qs('span.arrowicon', parent) : null;
                    if (arrowIcon) {
                        toggleClass(arrowIcon, 'rotate');
                        toggleClass(arrowIcon, 'caretIcon');
                    }
                }
            });

            // Dropdown keyboard support
            dropdown.addEventListener('keydown', function (event) {
                if (event.keyCode === KEY_CODES.ENTER) {
                    this.click();
                }
            });
        });

        // Initialize focus tracking for accessibility
        if (qs('.rmitprogramlist') && typeof trackFocus === 'function') {
            trackFocus('.rmitprogramlist', '.switcher');
        }
    }

    // Run initialization when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initOnDOMReady);
    } else {
        initOnDOMReady();
    }

    // ========================================================================
    // Initialize All Program List Components
    // ========================================================================

    const programListWraps = qsa(SELECTORS.PROGRAM_LIST_WRAP);
    if (programListWraps.length > 0) {
        forEach(programListWraps, function (element) {
            ProgramDataService.fetchAllData(element);
        });
    }

    // ========================================================================
    // Export to Global Scope (for external access if needed)
    // ========================================================================

    window.RMITProgramList = {
        ProgramDataService: ProgramDataService,
        ProgramRenderer: ProgramRenderer,
        FacetRenderer: FacetRenderer,
        showLocalResults: showLocalResults,
        showInternationalResults: showInternationalResults
    };

})(window);

$(document).ready(function () {

     if($(window).width()<1023) {
         $('.search-filter__overlay').addClass('full-width');
     } else {
         $('.search-filter__mobiclosesection').hide();
     }
 
 });
var campaignheader_url = $('#campaign-header').data("assetUrl");
var campaignheader_ele = $('#campaign-header').attr("id");

if( campaignheader_url ) {
	getSmartCropData(campaignheader_url,campaignheader_ele);

}
    $(window).load(function() {

       $('#campaign-header').css('height', 'auto');

    });
if ($('.summary-wrapper').length > 0) {
    var threeColTotal = $('.summary div.col-3').length;
    var oddThree = threeColTotal % 3;
    if (oddThree == 0) {
        $(".summary div.col-3").addClass("border");
        $(".summary div.col-3:nth-last-child(1),.summary div.col-3:nth-last-child(2),.summary div.col-3:nth-last-child(3)").removeClass("border");
    } else {
        for (var i = 0; i < (threeColTotal - oddThree); i++) {
            $(".summary div.col-3").eq(i).addClass("border");
        }
    }
    var twoColumns = $('.summary div.col-2').length;
    var oddTwo = twoColumns % 2;
    if (oddTwo == 0) {
        $(".summary div.col-2").addClass("border");
        $(".summary div.col-2:nth-last-child(1),.summary div.col-2:nth-last-child(2)").removeClass("border");
    } else {
        for (var j = 0; j < (twoColumns - oddTwo); j++) {
            $(".summary div.col-2").eq(j).addClass("border");
        }
    }
 }

$(document).ready(function() {
    $('.iconsvg__viewall--btn').click(function() {    
        $(this).parent().removeClass('active');
        $(this).closest('.iconlistsvg__container').find('.iconsvg__showless--btn').parent().addClass('active');
        $(this).parent().hide();
        $(this).parent().next().show();
        $(this).parent().parent().find('.iconlistsvg__view').slideToggle(500);
    });

    $('.iconsvg__showless--btn').click(function() {        
        $(this).parent().removeClass('active');
        $(this).closest('.iconlistsvg__container').find('.iconsvg__viewall--btn').parent().addClass('active');
        $(this).parent().hide();
        $(this).parent().prev().show();
        $(this).parent().parent().find('.iconlistsvg__view').slideToggle(500);
    });

});
/*! Copyright 2012, Ben Lin (http://dreamerslab.com/)
 * Licensed under the MIT License (LICENSE.txt).
 *
 * Version: 1.0.19
 *
 * Requires: jQuery >= 1.2.3
 */
( function ( factory ) {
if ( typeof define === 'function' && define.amd ) {
    // AMD. Register module depending on jQuery using requirejs define.
    define( ['jquery'], factory );
} else {
    // No AMD.
    factory( jQuery );
}
}( function ( $ ){
  $.fn.addBack = $.fn.addBack || $.fn.andSelf;

  $.fn.extend({

    actual : function ( method, options ){
      // check if the jQuery method exist
      if( !this[ method ]){
        throw '$.actual => The jQuery method "' + method + '" you called does not exist';
      }

      var defaults = {
        absolute      : false,
        clone         : false,
        includeMargin : false,
        display       : 'block'
      };

      var configs = $.extend( defaults, options );

      var $target = this.eq( 0 );
      var fix, restore;

      if( configs.clone === true ){
        fix = function (){
          var css = 'position: absolute !important; top: -1000 !important; ';

          // this is useful with css3pie
          $target = $target.
            clone().
            attr( 'style', css ).
            appendTo( 'body' );
        };

        restore = function (){
          // remove DOM element after getting the width
          $target.remove();
        };
      }else{
        var tmp   = [];
        var style = '';
        var $hidden;

        fix = function (){
          // get all hidden parents
          $hidden = $target.parents().addBack().filter( ':hidden' );
          style   += 'visibility: hidden !important; display: ' + configs.display + ' !important; ';

          if( configs.absolute === true ) style += 'position: absolute !important; ';

          // save the origin style props
          // set the hidden el css to be got the actual value later
          $hidden.each( function (){
            // Save original style. If no style was set, attr() returns undefined
            var $this     = $( this );
            var thisStyle = $this.attr( 'style' );

            tmp.push( thisStyle );
            // Retain as much of the original style as possible, if there is one
            $this.attr( 'style', thisStyle ? thisStyle + ';' + style : style );
          });
        };

        restore = function (){
          // restore origin style values
          $hidden.each( function ( i ){
            var $this = $( this );
            var _tmp  = tmp[ i ];

            if( _tmp === undefined ){
              $this.removeAttr( 'style' );
            }else{
              $this.attr( 'style', _tmp );
            }
          });
        };
      }

      fix();
      // get the actual value with user specific methed
      // it can be 'width', 'height', 'outerWidth', 'innerWidth'... etc
      // configs.includeMargin only works for 'outerWidth' and 'outerHeight'
      var actual = /(outer)/.test( method ) ?
        $target[ method ]( configs.includeMargin ) :
        $target[ method ]();

      restore();
      // IMPORTANT, this plugin only return the value of the first element
      return actual;
    }
  });
}));

var status = "In Progress";
var formid = $('form').attr('id');
var errormessage = "";
var formstep = "1";
if(formid > 0) {
	updateFormDatalayer(formid);
}
function updateFormDatalayer(id) {
        var formData = localStorage.getItem("formData");
        var $formName = $('#'+id+'-T').text();
        var dataArray = {
            "id": id,
            "name": $formName,
            "formstep": formstep,
            "status": status,
            "errormessage": errormessage
        };


     /** will be called in case of Contact us form to append enquiry type to title **/
    	var urlParams = new URLSearchParams(window.location.search);
        if(urlParams.toString().includes("tfa_"))
        {
            var str = urlParams.toString();
            var n = str.lastIndexOf('=');
            var result = str.substring(n + 1);
            $formName = $formName + " - "+ encodeURIComponent($('#'+result).text());
            dataArray.name = $formName;
        }

		var $step = "1";

   		setTimeout(function(){ 
          if ($(".wfCurrentPage").attr("id") !== "undefined") {
              $step  = $('.wfCurrentPage').attr("id").replace( /^\D+/g, '');
          }
			dataArray.formstep = $step;
     	},500);

    	$(document).on('click', '.wfPagingButtons input , .wfTab', function (){
          if ($(".wfCurrentPage").attr("id") !== "undefined") {
              $step  = $('.wfCurrentPage').attr("id").replace( /^\D+/g, '');
          }
			dataArray.formstep = $step;
		});

        $('#'+id).submit(function(e) {
            var isError = false;
			
			if(wFORMS !== "undefined") {
				  wFORMS.behaviors.validation.alert = function(A, B){

                 isError = true;

               if(B.tagName == "INPUT" || B.tagName == "SELECT" || B.tagName == "TEXTAREA"){
                    $(B).find(B.tagName).focus();
                }
                dataArray.status="Error";
                dataArray.errormessage=A;
                if (typeof digitalData !== "undefined") {
                    digitalData["form"] = dataArray;
                }
            }
				
			}


            if(isError == false) {
                dataArray.status = "Success";
                dataArray.errormessage="";
            }
            localStorage.setItem("formData",JSON.stringify(dataArray));
        });

        if (typeof digitalData !== "undefined") {
            if(formData && $('#'+id).length ==0 ) {
                    digitalData["form"] = JSON.parse(localStorage.getItem("formData"));
                }
            else {
                digitalData["form"] = dataArray;
            }

        }
}



// for synchronous form assembly forms
if(document.querySelector('.trackFormAnalytics')){
    var elem = document.querySelector('.trackFormAnalytics form')
    setAnalyticUpdate(elem.id);
}



function setAnalyticUpdate(id){
    generateFormData(id)
    $('#'+id).find('.primaryAction').attr('data-analytics-button=\"'+ id + ' form submit button\"');
    $('#'+id).find('.wfPageNextButton').attr('data-analytics-button=\"'+ id + ' form next button\"');
    $('#'+id).find('.wfPagePreviousButton').attr('data-analytics-button=\"'+ id + ' form previous button\"');
}

var formSubmit = false;
// update digital data generic methods
function generateFormData(id){
    let form = document.getElementById(id);

    var formName = id + " form";
    if($('#'+id+'-T').length > 0 ) {
        formName = $('#'+id+'-T').text();
    }

    var step = 'NA';

    setTimeout(function(){ 
        updateInProgress(form, formName, step);
    },500);

    $(document).on('click', '.wfPagingButtons input , .wfTab', function (){
        updateInProgress(form, formName, step);
      });


    updateDataLayer(formName, step, 'In Progress', '');
    form.addEventListener('submit', () => {
        setTimeout(() => {
            const errors = form.querySelectorAll('.errFld');
            if (errors.length > 0 || validateRecaptcha(form) === 'error') {
                updateDataLayer(formName, step, 'Error', 'Validation Error');
            }else {
                updateDataLayer(formName, step, '', '');
            }
        },100);
        formSubmit = true;
    });

    handleUnload(form, formName);
}

function updateInProgress(form, formName, step){
    var stepElm = form.querySelector(".wfCurrentPage");
        if (stepElm) {
            step  = stepElm.attr("id").replace( /^\D+/g, '');
            updateDataLayer(formName, step, 'In Progress', '');
        }
}



function handleUnload(form, formName) {
    $(window).on('beforeunload', function () {
        if (formSubmit) {
            const errors = form.querySelectorAll('.errFld');
            if (errors.length === 0 && validateRecaptcha(form) !== 'error') {
                updateDataLayer(formName, 'NA', 'Success', '');
            } else {
                updateDataLayer(formName, 'NA', 'Error', 'Validation Error');
            }
        }
        return true;
    });
}

function validateRecaptcha(form) {
    let captchaStatus;
    const errorcaptcha = form.querySelector('.error-capcha');
    if (window.grecaptcha.getResponse().length <= 0) {
        if(errorcaptcha) {
            errorcaptcha.style.display = 'block';
            errorcaptcha.classList.add('errFld')
        } 
        captchaStatus = 'error';
    } else {
        if(errorcaptcha) {
            errorcaptcha.style.display = 'none';
            errorcaptcha.classList.remove('errFld');
        }
        captchaStatus = 'success';
    }
    return captchaStatus;
}


function updateDataLayer(formName, formStep, formStatus, errorMsg) {
    const digiData = window.digitalData;
    if (digiData && formName) {
        digiData.form = {};
        digiData.form.name = formName;
        digiData.form.formstep = formStep;
        digiData.form.status = formStatus;
        digiData.form.errormessage = errorMsg;
    }
    window.digitalData = digiData;
}

