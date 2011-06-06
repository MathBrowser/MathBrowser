var g_graph = null;
var g_equationEditorActive = false;

function beginEquationEdit( format ) {
	if( g_equationEditorActive ) {
		return false;
	}
	var e = document.getElementById( "display-" + format );
	e.style.display = "none";
    e = document.getElementById( "edit-" + format );
	e.style.display = "block";
	// Remove onclick event handler so it doesn't get invoked from within the form.
	e = document.getElementById( "tr-" + format );
	e.onclick = null;
	g_equationEditorActive = true;
	return true;
}

function cancelEquationEdit( event, format, onclick ) {
	var e = document.getElementById( "display-" + format );
	e.style.display = "block";
    e = document.getElementById( "edit-" + format );
	e.style.display = "none";
	event.stopPropagation();
	// Restore onclick event handler 
	e = document.getElementById( "tr-" + format );
	e.onclick = onclick;
	g_equationEditorActive = false;
}

function convertToNumber( value ) {
	value = parseFloat( value );
	return isNaN( value ) ? "0" : value.toString();
}

function createSVGElement( name ) {
    return document.createElementNS( "http://www.w3.org/2000/svg", name );
}

function drawSlopeIntercept( event ) {
	document.getElementById( "eq-mode" ).value = "slope-intercept";
	document.getElementById( "eq-b" ).value = convertToNumber( document.getElementById( "tmp-eq-b" ).value );
	document.getElementById( "eq-m" ).value = convertToNumber( document.getElementById( "tmp-eq-m" ).value );
	updateDisplay();
	cancelEquationEdit(event,'slope-intercept',editSlopeInterceptEquation);
}

function drawVertical( event ) {
	document.getElementById( "eq-mode" ).value = "vertical";
	document.getElementById( "eq-x-intercept" ).value = convertToNumber( document.getElementById( "tmp-eq-x-intercept" ).value );
	updateDisplay();
	cancelEquationEdit(event,'vertical',editVerticalEquation);
}

function editSlopeInterceptEquation() {
	if( ! beginEquationEdit('slope-intercept') ) {
		return;
	}
	var equation = getEquation();
	document.getElementById( "tmp-eq-m" ).value = equation.isVertical() ? "" : equation.getSlope();
	document.getElementById( "tmp-eq-b" ).value = equation.isVertical() ? "" : equation.getYIntercept();
}

function editVerticalEquation() {
	if( ! beginEquationEdit('vertical') ) {
		return;
	}
	var equation = getEquation();
	document.getElementById( "tmp-eq-x-intercept" ).value = equation.isVertical() ? equation.getXIntercept() : "";
}

function getEquation() {
	var mode = document.getElementById( "eq-mode" ).value;
	switch( mode ) {
	case "vertical":
		return new VerticalLineEquation( parseFloat( document.getElementById( "eq-x-intercept" ).value ) );
	default:
		return new LineEquation( parseFloat( document.getElementById( "eq-m" ).value ), parseFloat( document.getElementById( "eq-b" ).value ) );
	}
}

function graphInit() {
    g_graph = new Graph();
    updateDisplay();
}

function updateDisplay() {
    var equation = getEquation();

    var e = document.getElementById( "display-slope-intercept" );
    e.innerHTML = equation.getSlopeInterceptDisplayHTML();
    e = document.getElementById( "display-vertical" );
    e.innerHTML = equation.getVerticalDisplayHTML();
    
    g_graph.render( true, equation );

}

function Graph() {
	this.borderPixels = 20;
	this.gridPixelHeight = 400;
	this.gridPixelWidth = 400;
	this.coordRange = null;
	this.svgEl = null;
}
Graph.prototype.center = function() {
    this.coordRange.center();
    this.render();
}
Graph.prototype.drawLine = function( x1, y1, x2, y2, color, markerID ) {
    if( color == null ) {
        color = "black";
    }
    var lineEl = createSVGElement( "line" );
    lineEl.setAttribute( "stroke", color );
  	lineEl.setAttribute( "x1", x1 );
	lineEl.setAttribute( "y1", y1 );

	lineEl.setAttribute( "x2", x2 );
	lineEl.setAttribute( "y2", y2 );
	if( markerID != null ) {
		lineEl.setAttribute( "marker-end", "url(#" + markerID + ")" );
	}
    this.svgEl.appendChild( lineEl );
}
Graph.prototype.drawLogicalLine = function( p1, p2, color ) {
  	this.drawLine( this.getPixelX( p1.x ), this.getPixelY( p1.y ), this.getPixelX( p2.x ), this.getPixelY( p2.y ), color );
}
Graph.prototype.drawText = function( p1, text, vAlign, hAlign ) {
    var textEl = createSVGElement( "text" );  
    var xAdjust = 2;
    if( hAlign == "right" ) {
        textEl.setAttribute( "text-anchor", "end" );
        xAdjust = -2;
    }
  	textEl.setAttribute( "x", this.getPixelX( p1.x ) + xAdjust );
	textEl.setAttribute( "y", this.getPixelY( p1.y ) - 2 );
    textEl.appendChild( document.createTextNode( text ) );
    this.svgEl.appendChild( textEl );
    if( vAlign == "top" ) {
        // If it should be top aligned, shift it down by whatever the height is.                
        textEl.setAttribute( "y", this.getPixelY( p1.y ) + textEl.getBoundingClientRect().height - 5 );
    }
}
Graph.prototype.getGridIncrement = function( pixels, logicalMin, logicalMax ) {
    // Figure out the interval at which to draw the grid.
    // First find the max number of grid lines to allow, at no more than 20 px spacing.
    var maxLines = Math.floor( pixels / 20  );
    // Figure out the increment we would have if we used this many lines.
    var interval = (logicalMax - logicalMin) / maxLines;
    // Scale this so it's in the range 1 <= interval < 10
    var n = Math.log( interval ) / Math.log( 10 );
    // This means 10^n = interval. Scale n so that 0 <= n < 1
    var scale = Math.pow( 10, - Math.floor( n ) );
    interval *= scale;
    // Move the interval up to a multiple of 2, 5 or 10 as appropriate
    if( interval > 5 ) {
        interval = 10;
    } else if( interval == 5 ) {
        // leave it
    } else if( interval > 2 ) {
        interval = 5;
    } else if( interval == 2 ) {
        // leave it
    } else if( interval > 1 ) {
        interval = 2;
    }
    return interval / scale;
}
Graph.prototype.getPixelX = function( x ) {
    return this.gridPixelWidth * ( (x - this.coordRange.xMin) / (this.coordRange.xMax - this.coordRange.xMin) ) + this.borderPixels;
}
Graph.prototype.getPixelY = function( y ) {
    return this.gridPixelHeight * ( (this.coordRange.yMax - y) / (this.coordRange.yMax - this.coordRange.yMin) ) + this.borderPixels;
}
Graph.prototype.panDown = function() {
	this.coordRange.panDown();
    this.render();
}
Graph.prototype.panDownAndLeft = function() {
	this.coordRange.panDown();
    this.coordRange.panLeft();
    this.render();
}
Graph.prototype.panDownAndRight = function() {
	this.coordRange.panDown();
    this.coordRange.panRight();
    this.render();
}
Graph.prototype.panLeft = function() {
    this.coordRange.panLeft();
    this.render();
}
Graph.prototype.panRight = function() {
	this.coordRange.panRight();
	this.render();
}
Graph.prototype.panUp = function() {
	this.coordRange.panUp();
    this.render();
}
Graph.prototype.panUpAndLeft = function() {
	this.coordRange.panUp();
    this.coordRange.panLeft();
    this.render();
}
Graph.prototype.panUpAndRight = function() {
	this.coordRange.panUp();
    this.coordRange.panRight();
    this.render();
}
Graph.prototype.render = function( setDefaultCoordinates, equation ) {
	
	if( ! equation ) {
		equation = getEquation();
	}
	
    var svgEl = document.getElementById( "graph-svg" );
    if( svgEl != null ) {
        // Delete the old one.
    	svgEl.parentNode.removeChild( svgEl );
    }
    
    svgEl = document.createElementNS( "http://www.w3.org/2000/svg", "svg" );
    this.svgEl = svgEl;
    svgEl.setAttribute( "version", "1.1" );
    svgEl.setAttribute( "id", "graph-svg" );
    svgEl.setAttribute( "width", "440px" );
    svgEl.setAttribute( "height", "440px" );
    document.getElementById( "graph" ).appendChild( svgEl );
    
    if( setDefaultCoordinates ) { 
        this.coordRange = equation.getDefaultCoordinateRange();
    }
    
    // Render the equation first, then draw the grid on top of it.
    equation.render( this );

    this.renderGrid();
    this.renderAxes();

}
Graph.prototype.renderAxes = function() {

    var markerEl = createSVGElement( "marker" );  
    markerEl.setAttribute( "id", "axismarker" );
    markerEl.setAttribute( "viewBox", "0 0 10 10" );
    markerEl.setAttribute( "refX", "1" );
    markerEl.setAttribute( "refY", "5" );
    markerEl.setAttribute( "markerWidth", "6" );
    markerEl.setAttribute( "markerHeight", "6" );
    markerEl.setAttribute( "orient", "auto" );
    this.svgEl.appendChild( markerEl );
    
    var pathEl = createSVGElement( "path" );
    pathEl.setAttribute( "d", "M 0 0 L 10 5 L 0 10 z" );
    markerEl.appendChild( pathEl );

    this.renderXAxis();
    this.renderYAxis();
}
Graph.prototype.renderXAxis = function() {
	var vAlign = null;
    var y = 0;
    if( 0 < this.coordRange.yMin ) {
        y = this.coordRange.yMin;
    } else if( 0 >= this.coordRange.yMax ) {
        y = this.coordRange.yMax;
        vAlign = "top";
    }
    var pLeft = new LogicalPoint( this.coordRange.xMin, y );
    var pRight = new LogicalPoint( this.coordRange.xMax, y );
    var pOrigin = null;
    if( xMin < 0 ) {
    	// Draw segment from right to left.
    	if( this.coordRange.xMax > 0 ) {
    		// And draw segment from left to right.
    		pOrigin = new LogicalPoint( 0, y );
    	} else {
    		// Don't draw segment from left to right.
			pOrigin = pRight;
			pRight = null;
    	}
    } else {
    	// Draw segment from left to right.
    	pOrigin = pLeft;
    	pLeft = null;
    }
    
    if( pLeft != null ) {
    	this.drawLine( this.getPixelX( pOrigin.x ), this.getPixelY( pOrigin.y ), this.getPixelX( pLeft.x ) - 5, this.getPixelY( pLeft.y ), null, "axismarker" );
    }
    if( pRight != null ) {
    	this.drawLine( this.getPixelX( pOrigin.x ), this.getPixelY( pOrigin.y ), this.getPixelX( pRight.x ) + 5, this.getPixelY( pRight.y ), null, "axismarker" );
    }

    this.drawText( new LogicalPoint( this.coordRange.xMin, y ), this.coordRange.xMin, vAlign );
    this.drawText( new LogicalPoint( this.coordRange.xMax, y ), this.coordRange.xMax, vAlign, "right" );
}
Graph.prototype.renderYAxis = function() {
    var hAlign = null;
    var x = 0;
    if( 0 < this.coordRange.xMin ) {
        x = this.coordRange.xMin;
    } else if( 0 >= this.coordRange.xMax ) {
        x = this.coordRange.xMax;
        hAlign = "right";
    }
    
    var pBottom = new LogicalPoint( x, this.coordRange.yMin );
    var pTop = new LogicalPoint( x, this.coordRange.yMax );
    var pOrigin = null;
    if( this.coordRange.yMin < 0 ) {
    	// Draw segment from top to bottom.
    	if( this.coordRange.yMax > 0 ) {
    		// And draw segment from bottom to top.
    		pOrigin = new LogicalPoint( x, 0 );
    	} else {
    		// Don't draw segment from bottom to top.
			pOrigin = pTop;
			pTop = null;
    	}
    } else {
    	// Draw segment from bottom to top.
    	pOrigin = pBottom;
    	pBottom = null;
    }
    
    if( pTop != null ) {
    	this.drawLine( this.getPixelX( pOrigin.x ), this.getPixelY( pOrigin.y ), this.getPixelX( pTop.x ), this.getPixelY( pTop.y ) - 5, null, "axismarker" );
    }
    if( pBottom != null ) {
    	this.drawLine( this.getPixelX( pOrigin.x ), this.getPixelY( pOrigin.y ), this.getPixelX( pBottom.x ), this.getPixelY( pBottom.y ) + 5, null, "axismarker" );
    }
    
    this.drawText( new LogicalPoint( x, this.coordRange.yMin ), this.coordRange.yMin, null, hAlign );
    this.drawText( new LogicalPoint( x, this.coordRange.yMax ), this.coordRange.yMax, "top", hAlign );
}
Graph.prototype.renderGrid = function() {
    this.renderGridHorizontal();
    this.renderGridVertical();
}
Graph.prototype.renderGridHorizontal = function() {

    var increment = this.getGridIncrement( this.gridPixelHeight, this.coordRange.yMin, this.coordRange.yMax );

    // Figure out where to start.
    var y = Math.floor( Math.abs( this.coordRange.yMin ) / increment ) * increment;
    if( this.coordRange.yMin < 0 ) {
        y = -y;
    }
    for( var y1 = y; y1 <= this.coordRange.yMax; y1 += increment ) {
        this.drawLogicalLine( new LogicalPoint( this.coordRange.xMin, y1 ), new LogicalPoint( this.coordRange.xMax, y1 ), "#cccccc" );
    }
}
Graph.prototype.renderGridVertical = function() {

    var increment = this.getGridIncrement( this.gridPixelWidth, this.coordRange.xMin, this.coordRange.xMax );

    // Figure out where to start.
    var x = Math.floor( Math.abs( this.coordRange.xMin ) / increment ) * increment;
    if( this.coordRange.xMin < 0 ) {
        x = -x;
    }
    for( var x1 = x; x1 <= this.coordRange.xMax; x1 += increment ) {
        this.drawLogicalLine( new LogicalPoint( x1, this.coordRange.yMin ), new LogicalPoint( x1, this.coordRange.yMax ), "#cccccc" );
    }
}
Graph.prototype.zoomIn = function() {
    this.coordRange.zoomIn();
    this.render();
}
Graph.prototype.zoomOut = function() {
	this.coordRange.zoomOut();
    this.render();
}

function CoordinateRange( xMin, xMax, yMin, yMax ) {
	this.xMin = xMin;
	this.xMax = xMax;
	this.yMin = yMin;
	this.yMax = yMax;
}
CoordinateRange.prototype.center = function() {
	this.xMax = (this.xMax - this.xMin) / 2;
	this.xMin = - this.xMax;
	this.yMax = (this.yMax - this.yMin) / 2;
	this.yMin = - this.yMax;
}
CoordinateRange.prototype.panDown = function() {
	this.yMin -= 1;
    this.yMax -= 1;
}
CoordinateRange.prototype.panLeft = function() {
	this.xMin -= 1;
	this.xMax -= 1;
}
CoordinateRange.prototype.panRight = function() {
    this.xMin += 1;
    this.xMax += 1;
}
CoordinateRange.prototype.panUp = function() {
	this.yMin += 1;
    this.yMax += 1;
}
CoordinateRange.prototype.zoomIn = function() {
	var xRange = this.xMax - this.xMin; 
	var yRange = this.yMax - this.yMin; 
    if( xRange >= 4 ) {
    	// Decrease by two units
    	this.xMin += 1;
    	this.xMax -= 1;
    } else {
    	// Decrease by 50%
    	this.xMin += xRange / 4;
    	this.xMax -= xRange / 4;
    }
    if( yRange >= 4 ) {
    	// Decrease by two units
    	this.yMin += 1;
    	this.yMax -= 1;
    } else {
    	// Decrease by 50%
    	this.yMin += yRange / 4;
    	this.yMax -= yRange / 4;
    }
}
CoordinateRange.prototype.zoomOut = function() {
	var xRange = this.xMax - this.xMin; 
	var yRange = this.yMax - this.yMin; 
    if( xRange < 4 ) {
    	// Increase by 100%
    	this.xMin -= xRange / 2;
    	this.xMax += xRange / 2;
    } else {
    	// Increase by two units
    	this.xMin -= 1;
    	this.xMax += 1;
    }
    if( yRange < 4 ) {
    	// Increase by 100%
    	this.yMin -= yRange / 2;
    	this.yMax += yRange / 2;
    } else {
    	// Increase by two units
    	this.yMin -= 1;
    	this.yMax += 1;
    }
}

function LogicalPoint( x, y ) {
	this.x = x;
	this.y = y;
}

function LineEquation( m, b ) {
	this.m = m;
	this.b = b;
}
LineEquation.prototype.getDefaultCoordinateRange = function() {
    // Set default x-axis to 10 units, centered around x-intercept, rounded to integer.
    var xIntercept = this.getXIntercept();
    xMin = Math.round( xIntercept - 5 );
    xMax = Math.round( xIntercept + 5 );
    
    // Set the y-axis range so the line is visible on the graph.
    var y1 = this.solveForY( xMin );
    var y2 = this.solveForY( xMax );
    var yMiddle = (y2 + y1) / 2;
    yMin = Math.round( yMiddle - 5 );
    yMax = yMin + (xMax - xMin); // Make it the same range as x-axis
    return new CoordinateRange( xMin, xMax, yMin, yMax );
}
LineEquation.prototype.getSlope = function() {
    return this.m;
}
LineEquation.prototype.getSlopeInterceptDisplayHTML = function() {
	var html = "y = ";
	var b = this.b;
	var m = this.m;
	if( m != 0 ) {
		if( m != 1 ) {
			html += m;
		}
		html += "x";
	} else {
		if( b == 0 ) {
			return "y = 0";
		} else {
			return "y = " + b;
		}
	}
	if( b != 0 ) {
		if( b < 0 ) {
			html += " - " + Math.abs( b );
		} else {
			html += " + " + b;
		}
	}
	return html;
}
LineEquation.prototype.getVerticalDisplayHTML = function() {
	return "";
}
LineEquation.prototype.getXIntercept = function() {
    return this.m == 0 ? null : (- this.b / this.m);
}
LineEquation.prototype.getYIntercept = function() {
    return this.b;
}
LineEquation.prototype.isVertical = function() {
	return false;
}
LineEquation.prototype.render = function( graph ) {
	var coordRange = graph.coordRange;
    // Draw line of equation from left to right (but only draw the segment that's on the grid).
	var xLeft = coordRange.xMin;
	var yLeft = this.solveForY( xLeft );
	if( yLeft < coordRange.yMin ) {
    	// If leftmost segment extends below grid, clamp it to the bottom of the grid.
    	yLeft = coordRange.yMin;
    	xLeft = this.solveForX( yLeft );
    } else if( yLeft > yMax ) {
    	// If leftmost segment extends above grid, clamp it to the top of the grid.
    	yLeft = coordRange.yMax;
    	xLeft = this.solveForX( yLeft );
    }
	var pLeft = new LogicalPoint( xLeft, yLeft );
    
    var xRight = coordRange.xMax;
    var yRight = this.solveForY( xRight );
    if( yRight > coordRange.yMax ) {
    	// If rightmost segment extends above grid, clamp it to the top of the grid.
    	yRight = coordRange.yMax;
    	xRight = this.solveForX( yRight );
    } else if( yRight < coordRange.yMin ) {
    	// If rightmost segment extends below grid, clamp it to the bottom of the grid.
    	yRight = coordRange.yMin;
    	xRight = this.solveForX( yRight );
    }
    var pRight = new LogicalPoint( xRight, yRight );
    
    graph.drawLogicalLine( pLeft, pRight, "red" );
}
LineEquation.prototype.solveForX = function( y ) {
    return (y - this.b) / this.m;
}
LineEquation.prototype.solveForY = function( x ) {
	return this.m * x + this.b;
}

function VerticalLineEquation( xIntercept ) {
	this.xIntercept = xIntercept;
}
VerticalLineEquation.prototype.getDefaultCoordinateRange = function() {
    // Set default x-axis to 10 units, centered around x-intercept, rounded to integer.
    var xIntercept = this.getXIntercept();
    xMin = Math.round( xIntercept - 5 );
    xMax = Math.round( xIntercept + 5 );
    
    // Set the y-axis range to 10 units.
    return new CoordinateRange( xMin, xMax, -5, 5 );
}
VerticalLineEquation.prototype.getSlope = function() {
    return null;
}
VerticalLineEquation.prototype.getSlopeInterceptDisplayHTML = function() {
	return "";
}
VerticalLineEquation.prototype.getYIntercept = function() {
    return null;
}
VerticalLineEquation.prototype.isVertical = function() {
	return true;
}
VerticalLineEquation.prototype.render = function( graph ) {
    var pTop = new LogicalPoint( this.xIntercept, graph.coordRange.yMax );
    var pBottom = new LogicalPoint( this.xIntercept, graph.coordRange.yMin );
    graph.drawLogicalLine( pTop, pBottom, "red" );
}
VerticalLineEquation.prototype.solveForY = function( x ) {
    return null;
}
VerticalLineEquation.prototype.getVerticalDisplayHTML = function() {
	return "x = " + this.xIntercept;
}
VerticalLineEquation.prototype.getXIntercept = function() {
    return this.xIntercept;
}
