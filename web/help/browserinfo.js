function init() {
	document.getElementById( "browserinfo" ).style.display = "block";
	document.getElementById( "user-agent" ).appendChild( document.createTextNode( window.navigator.userAgent ) );
	
	var bi = BrowserInfo.parseUserAgent( window.navigator.userAgent );
	var td = document.getElementById( "browser" );
	td.appendChild( document.createTextNode( bi.browser + " " + bi.version ) );
	if( browserIsSupported( bi ) ) {
		td.className = "good";
		td.appendChild( document.createTextNode( " - SUPPORTED" ) );
	} else {
		td.className = "error";
		td.appendChild( document.createTextNode( " - UNKNOWN OR NOT SUPPORTED" ) );
	}
}

function browserIsSupported( bi ) {
	switch( bi.browser ) {
	case "Chrome":
		return bi.floatVersion >= 10;
	case "Firefox":
		return bi.floatVersion >= 3.6;
	case "Internet Explorer":
		return bi.floatVersion >= 9;
	default:
		return false;
	}
}

function BrowserInfo( browser, version, floatVersion ) {
	this.browser = browser;
	this.version = version;
	this.floatVersion = floatVersion;
}
BrowserInfo.parseUserAgent = function( userAgent ) {
	var re = new RegExp( ".* Firefox/(.*)" );
	var result = re.exec( userAgent );
	if( result != null ) {
		var versionString = result[1];
		var a = versionString.split( "." );
		var version = parseFloat( a[0] + "." + a[1] );
		return new BrowserInfo( "Firefox", versionString, version );
	}
	if( result == null ) {
		re = new RegExp( ".*\\(compatible; MSIE ([\\d\\.]*);.*" );
	    var result = re.exec( userAgent );
	    if( result != null ) {
	        var versionString = result[1];
	        return new BrowserInfo( "Internet Explorer", versionString, parseFloat( versionString ) );
	    }
	}
	if( result == null ) {
		re = new RegExp( ".*Chrome/([\\d\\.]*) .*" );
	    var result = re.exec( userAgent );
	    if( result != null ) {
	        var versionString = result[1];
	        return new BrowserInfo( "Chrome", versionString, parseFloat( versionString ) );
	    }
	}
	return new BrowserInfo( "unknown" );
}
BrowserInfo.prototype.toString = function() {
	return this.browser + " / " + this.version + " / " + this.floatVersion;
}
