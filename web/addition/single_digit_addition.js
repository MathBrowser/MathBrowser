function createNewProblemSet() {
	return new AdditionProblemSet();
}

function AdditionProblemSet() {
	this.numberOfProblems = 10;
	this.range1 = [0,9];
	this.range2 = [0,9];
}

// inherit ProblemSet - see https://developer.mozilla.org/en/Introduction_to_Object-Oriented_JavaScript#Inheritance
AdditionProblemSet.prototype = new ProblemSet();
// correct the constructor pointer because it points to ProblemSet
AdditionProblemSet.prototype.constructor = AdditionProblemSet;

AdditionProblemSet.prototype.createProblem = function() {
	return new AdditionProblem( getRandomInteger(this.range1[0], this.range1[1]), getRandomInteger(this.range2[0], this.range2[1]) );
}
AdditionProblemSet.prototype.getNumberOfProblems = function() {
	return this.numberOfProblems;
}

function AdditionProblem( a1, a2 ) {
	this.a1 = a1;
	this.a2 = a2;
	this.isResponseIncorrect = false;
}
AdditionProblem.prototype.isCorrect = function( response ) {
	return response == this.a1 + this.a2;
}
AdditionProblem.prototype.renderProblem = function() {
	replaceTextForID( "a1", this.a1 );
	replaceTextForID( "a2", "+" + this.a2 );
}
