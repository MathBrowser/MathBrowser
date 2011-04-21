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

    function center() {
        grid.center();
        render();
    }

    function panDown() {
        grid.panDown();
        render();
    }

    function panDownAndLeft() {
        grid.panDown();
        grid.panLeft();
        render();
    }

    function panDownAndRight() {
        grid.panDown();
        grid.panRight();
        render();
    }

    function panLeft() {
        grid.panLeft();
        render();
    }

    function panRight() {
        grid.panRight();
        render();
    }

    function panUp() {
        grid.panUp();
        render();
    }

    function panUpAndLeft() {
        grid.panUp();
        grid.panLeft();
        render();
    }

    function panUpAndRight() {
        grid.panUp();
        grid.panRight();
        render();
    }

    function render( setDefaultCoordinates, equation ) {
    	
    	if( ! equation ) {
    		equation = getEquation();
    	}
    	
        var svgEl = document.getElementById( "graph-svg" );
        if( svgEl != null ) {
            // Delete the old one.
            svgEl.parentNode.removeChild( svgEl );
        }
        svgEl = document.createElementNS( "http://www.w3.org/2000/svg", "svg" );
        svgEl.setAttribute( "version", "1.1" );
        svgEl.setAttribute( "id", "graph-svg" );
        svgEl.setAttribute( "width", "400px" );
        svgEl.setAttribute( "height", "400px" );
        document.getElementById( "graph" ).appendChild( svgEl );

        if( setDefaultCoordinates ) { 
            grid.setDefaultCoordinates( equation );
        }
        grid.renderXAxis( svgEl );
        grid.renderYAxis( svgEl );
        grid.renderGrid( svgEl );
        grid.renderEquation( svgEl, equation );
    }

    function zoomIn() {
        grid.zoomIn();
        render();
    }

    function zoomOut() {
        grid.zoomOut();
        render();
    }

    this.center = center;
    this.panDown = panDown;
    this.panDownAndLeft = panDownAndLeft;
    this.panDownAndRight = panDownAndRight;
    this.panLeft = panLeft;
    this.panRight = panRight;
    this.panUp = panUp;
    this.panUpAndLeft = panUpAndLeft;
    this.panUpAndRight = panUpAndRight;
    this.render = render;
    this.zoomIn = zoomIn;
    this.zoomOut = zoomOut;

    var grid = new Grid( 400, 400 );

    function Grid( pixelWidth, pixelHeight ) {

        var xMin;
        var xMax;
        var yMin;
        var yMax;

        function center() {
            xMax = (xMax - xMin) / 2;
            xMin = - xMax;
            yMax = (yMax - yMin) / 2;
            yMin = - yMax;
        }

        function createSVGElement( name ) {
            return document.createElementNS( "http://www.w3.org/2000/svg", name );
        }

        function drawLogicalLine( svgEl, p1, p2, color ) {
            if( color == null ) {
                color = "black";
            }
            var lineEl = createSVGElement( "line" );
            lineEl.setAttribute( "stroke", color );
          	lineEl.setAttribute( "x1", p1.getPixelX() );
			lineEl.setAttribute( "y1", p1.getPixelY() );

			lineEl.setAttribute( "x2", p2.getPixelX() );
			lineEl.setAttribute( "y2", p2.getPixelY() );
            svgEl.appendChild( lineEl );
        }

        function drawText( svgEl, p1, text, vAlign, hAlign ) {
            var textEl = createSVGElement( "text" );  
            var xAdjust = 2;
            if( hAlign == "right" ) {
                textEl.setAttribute( "text-anchor", "end" );
                xAdjust = -2;
            }
          	textEl.setAttribute( "x", p1.getPixelX() + xAdjust );
			textEl.setAttribute( "y", p1.getPixelY() - 2 );
            textEl.appendChild( document.createTextNode( text ) );
            svgEl.appendChild( textEl );
            if( vAlign == "top" ) {
                // If it should be top aligned, shift it down by whatever the height is.                
                textEl.setAttribute( "y", p1.getPixelY() + textEl.getBoundingClientRect().height - 5 );
            }
        }

        function getGridIncrement( pixels, logicalMin, logicalMax ) {
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

        function panDown() {
            yMin -=1;
            yMax -= 1;
        }

        function panLeft() {
            xMin -=1;
            xMax -= 1;
        }

        function panRight() {
            xMin +=1;
            xMax += 1;
        }

        function panUp() {
            yMin +=1;
            yMax += 1;
        }

        function renderEquation( svgEl, equation ) {
        	if( equation.isVertical() ) {
                var pTop = new LogicalPoint( equation.getXIntercept(), yMax );
                var pBottom = new LogicalPoint( equation.getXIntercept(), yMin );
                drawLogicalLine( svgEl, pTop, pBottom, "red" );
        		return;
        	}
            // Draw line of equation from left to right.
            var pLeft = new LogicalPoint( xMin, equation.solveForY( xMin ) );
            var pRight = new LogicalPoint( xMax, equation.solveForY( xMax ) );
            drawLogicalLine( svgEl, pLeft, pRight, "red" );
        }

        function renderGrid( svgEl ) {
            renderGridHorizontal( svgEl );
            renderGridVertical( svgEl );
        }

        function renderGridHorizontal( svgEl ) {

            var increment = getGridIncrement( pixelHeight, yMin, yMax );

            // Figure out where to start.
            var y = Math.floor( Math.abs( yMin ) / increment ) * increment;
            if( yMin < 0 ) {
                y = -y;
            }
            for( var y1 = y; y1 <= yMax; y1 += increment ) {
                drawLogicalLine( svgEl, new LogicalPoint( xMin, y1 ), new LogicalPoint( xMax, y1 ), "#cccccc" );
            }
        }

        function renderGridVertical( svgEl ) {

            var increment = getGridIncrement( pixelWidth, xMin, xMax );

            // Figure out where to start.
            var x = Math.floor( Math.abs( xMin ) / increment ) * increment;
            if( xMin < 0 ) {
                x = -x;
            }
            for( var x1 = x; x1 <= xMax; x1 += increment ) {
                drawLogicalLine( svgEl, new LogicalPoint( x1, yMin ), new LogicalPoint( x1, yMax ), "#cccccc" );
            }
        }

        function renderXAxis( svgEl ) {
            var vAlign = null;
            var y = 0;
            if( 0 < yMin ) {
                y = yMin;
            } else if( 0 >= yMax ) {
                y = yMax;
                vAlign = "top";
            }
            var pLeft = new LogicalPoint( xMin, y );
            var pRight = new LogicalPoint( xMax, y );
            drawLogicalLine( svgEl, pLeft, pRight );
            drawText( svgEl, pLeft, xMin, vAlign );
            drawText( svgEl, pRight, xMax, vAlign, "right" );
        }

        function renderYAxis( svgEl ) {
            var hAlign = null;
            var x = 0;
            if( 0 < xMin ) {
                x = xMin;
            } else if( 0 >= xMax ) {
                x = xMax;
                hAlign = "right";
            }
            var pBottom = new LogicalPoint( x, yMin );
            var pTop = new LogicalPoint( x, yMax );
            drawLogicalLine( svgEl, pBottom, pTop );
            drawText( svgEl, pBottom, yMin, null, hAlign );
            drawText( svgEl, pTop, yMax, "top", hAlign );
        }

        function setDefaultCoordinates( equation ) {
            // Set default x-axis to 10 units, centered around x-intercept, rounded to integer.
            var xIntercept = equation.getXIntercept();
            xMin = Math.round( xIntercept - 5 );
            xMax = Math.round( xIntercept + 5 );
            
            // Set the y-axis range so the line is visible on the graph.
            var y1 = equation.solveForY( xMin );
            var y2 = equation.solveForY( xMax );
            var yMiddle = (y2 + y1) / 2;
            yMin = Math.round( yMiddle - 5 );
            yMax = yMin + (xMax - xMin); // Make it the same range as x-axis
        }

        function zoomIn() {
            if( xMax - xMin >= 4 ) {
                xMin += 1;
                xMax -= 1;
            }
            if( yMax - yMin >= 4 ) {
                yMin += 1;
                yMax -= 1;
            }
        }

        function zoomOut() {
            xMin -= 1;
            xMax += 1;
            yMin -= 1;
            yMax += 1;
        }

        this.center = center;
        this.panDown = panDown;
        this.panLeft = panLeft;
        this.panRight = panRight;
        this.panUp = panUp;
        this.renderEquation = renderEquation;
        this.renderGrid = renderGrid;
        this.renderXAxis = renderXAxis;
        this.renderYAxis = renderYAxis;
        this.setDefaultCoordinates = setDefaultCoordinates;
        this.zoomIn = zoomIn;
        this.zoomOut = zoomOut;

        function LogicalPoint( x, y ) {

            function getPixelX() {
                return pixelWidth * ( (x - xMin) / (xMax - xMin) );
            }

            function getPixelY() {
                return pixelHeight * ( (yMax - y) / (yMax - yMin) );
            }

            this.getPixelX = getPixelX;
            this.getPixelY = getPixelY;

        }

    }

}

function LineEquation( m, b ) {

    function getSlope() {
        return m;
    }
    
    function getSlopeInterceptDisplayHTML() {
    	var html = "y = ";
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

    function getVerticalDisplayHTML() {
    	return "";
    }

    function getXIntercept() {
        return m == 0 ? null : (- b / m);
    }

    function getYIntercept() {
        return b;
    }

    function isVertical() {
    	return false;
    }
    
    function solveForY( x ) {
        return m * x +  b;
    }

    this.getSlope = getSlope;
    this.getSlopeInterceptDisplayHTML = getSlopeInterceptDisplayHTML;
    this.getVerticalDisplayHTML = getVerticalDisplayHTML;
    this.getXIntercept = getXIntercept;
    this.getYIntercept = getYIntercept;
    this.isVertical = isVertical;
    this.solveForY = solveForY;

}

function VerticalLineEquation( xIntercept ) {

    function getSlope() {
        return null;
    }
    
    function getSlopeInterceptDisplayHTML() {
    	return "";
    }
    
    function getVerticalDisplayHTML() {
    	return "x = " + xIntercept;
    }

    function getXIntercept() {
        return xIntercept;
    }

    function getYIntercept() {
        return null;
    }

    function isVertical() {
    	return true;
    }
    
    function solveForY( x ) {
        return null;
    }

    this.getSlope = getSlope;
    this.getSlopeInterceptDisplayHTML = getSlopeInterceptDisplayHTML;
    this.getVerticalDisplayHTML = getVerticalDisplayHTML;
    this.getXIntercept = getXIntercept;
    this.getYIntercept = getYIntercept;
    this.isVertical = isVertical;
    this.solveForY = solveForY;

}

