function createNewProblemSet() {
	return new MultiplicationProblemSet();
}

function MultiplicationProblemSet() {
	this.lowerBound = 1;
	this.upperBound = 10;
	var n = this.getNumberOfProblems();
	this.problems = new Array( n );
	this.problemsRemaining = n;
	for( var i = 0; i < n; i++ ) {
		this.problems[i] = i;
	}
}

//inherit ProblemSet - see https://developer.mozilla.org/en/Introduction_to_Object-Oriented_JavaScript#Inheritance
MultiplicationProblemSet.prototype = new ProblemSet();
// correct the constructor pointer because it points to ProblemSet
MultiplicationProblemSet.prototype.constructor = MultiplicationProblemSet;

MultiplicationProblemSet.prototype.createProblem = function() {
	var n = getRandomInteger( 0, this.problemsRemaining - 1 );
	var p = this.problems[n];

	// Move the last problem into the slot we just took, and shrink the array by 1.
	this.problems[n] = this.problems[this.problemsRemaining - 1];
	this.problemsRemaining--;
	
	// Convert p into the multiplicands
	var range = this.upperBound - this.lowerBound + 1;
	var m1 = this.lowerBound + Math.floor( p / range );
	var m2 = this.lowerBound + (p % range);
	
	return new MultiplicationProblem( m1, m2 );
}
MultiplicationProblemSet.prototype.getNumberOfProblems = function() {
	var n = this.upperBound - this.lowerBound + 1;
	return n * n;
}
MultiplicationProblemSet.prototype.setMaxAnswerSize = function() {
	// Find the max number of digits in the answer.
	var n = this.upperBound * this.upperBound;
	n = n.toString().length;
	var e = document.getElementById( "drillresponse" );
	e.size = n;
	e.maxLength = n;
}

function MultiplicationProblem( a1, a2 ) {
	this.a1 = a1;
	this.a2 = a2;
	this.isResponseIncorrect = false;
}
MultiplicationProblem.prototype.isCorrect = function( response ) {
	return response == this.a1 * this.a2;
}
MultiplicationProblem.prototype.renderProblem = function() {
	replaceTextForID( "a1", this.a1 );
	replaceTextForID( "a2", "×" + this.a2 );
}
