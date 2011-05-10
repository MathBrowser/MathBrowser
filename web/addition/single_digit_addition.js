var g_problemSet = null;

function init() {
	
	// Create a new problem set
	g_problemSet = new AdditionProblemSet();
	g_problemSet.showScore();
	g_problemSet.showNextProblem();
	
}

function checkAnswer() {
	g_problemSet.checkCurrentAnswer();
}
function doneWithProblemSet() {
	g_problemSet.showNextProblem();
}
function getRandomInteger( min, max ) {
	return Math.floor( Math.random() * (max + 1 - min) + min );
}
function replaceTextForID( elementID, text ) {
	var e = document.getElementById( elementID );
	if( e.firstChild ) {
		e.firstChild.parentNode.removeChild( e.firstChild );
	}
	e.appendChild( document.createTextNode( text ) );
}
function nextProblem() {
	g_problemSet.showNextProblem();
}
function tryAgain() {
	g_problemSet.tryAgain();
}

function AdditionProblemSet() {
	this.numberOfProblems = 3;
	this.range1 = [0,9];
	this.range2 = [0,9];
	this.rightAnswers = 0;
	this.wrongAnswers = 0;
	this.currentProblem = null;
}
AdditionProblemSet.prototype.checkCurrentAnswer = function() {
	var response = document.getElementById( "drillresponse" ).value;
	if( response == "" ) {
		return;
	}
	response = parseInt( response );
	var isCorrect = this.currentProblem.isCorrect( response );
	if( ! this.currentProblem.isResponseIncorrect ) {
		if( isCorrect ) {
			this.rightAnswers++;
		} else {
			this.wrongAnswers++;
			this.currentProblem.isResponseIncorrect = true;
		}
	}
	this.showScore();
	if( isCorrect ) {
		this.showNextProblem();
	} else {
		document.getElementById( "wrong" ).className = "error";
		this.showButton( "checkanswer", false );
		this.showButton( "tryagain", true );
		var buttonID = this.isLastProblem() ? "done" : "nextproblem";
		this.showButton( buttonID, true );
		document.getElementById( buttonID ).focus();
	}
}
AdditionProblemSet.prototype.initResponse = function( id, display ) {
	var responseInput = document.getElementById( "drillresponse" );
	responseInput.value = "";
	responseInput.focus();
}
AdditionProblemSet.prototype.isLastProblem = function() {
	return this.rightAnswers + this.wrongAnswers >= this.numberOfProblems;
}
AdditionProblemSet.prototype.showButton = function( id, display ) {
	document.getElementById( id ).style.display = display ? "inline" : "none";
}
AdditionProblemSet.prototype.showNextProblem = function() {
	
	// Take the highlight off the error message in case it's there
	document.getElementById( "wrong" ).className = "";
	
	var isLastProblem = this.isLastProblem();
	
	// Make sure we've got the correct buttons enabled.
	this.showButton( "checkanswer", ! isLastProblem );
	this.showButton( "tryagain", false );
	this.showButton( "nextproblem", false );
	this.showButton( "done", false );
	
	if( isLastProblem ) {
		// If we've shown all the problems, hide the problem, and show the results
		document.getElementById( "drill" ).style.display = "none";
		document.getElementById( "problem_instructions" ).style.display = "none";
		document.getElementById( "problem_set_results" ).style.display = "block";
		if( this.wrongAnswers == 0 ) {
			replaceTextForID( "problem_set_results", "Congratulations, you answered all the problems correctly!" );
		} else {
			replaceTextForID( "problem_set_results", "You got " + Math.round( (this.rightAnswers * 100) / (this.rightAnswers + this.wrongAnswers)) + "% correct." );
		}
	} else {
		// Otherwise show the next problem
		this.currentProblem = new AdditionProblem( getRandomInteger(this.range1[0], this.range1[1]), getRandomInteger(this.range2[0], this.range2[1]) );
		replaceTextForID( "a1", this.currentProblem.a1 );
		replaceTextForID( "a2", "+" + this.currentProblem.a2 );
		this.initResponse();
	}

}
AdditionProblemSet.prototype.showScore = function() {
	replaceTextForID( "numright", this.rightAnswers );
	replaceTextForID( "numwrong", this.wrongAnswers );
	replaceTextForID( "numremaining", this.numberOfProblems - this.rightAnswers - this.wrongAnswers );
}
AdditionProblemSet.prototype.tryAgain = function() {
	this.showButton( "checkanswer", true );
	this.showButton( "tryagain", false );
	this.showButton( "nextproblem", false );
	this.initResponse();
}

function AdditionProblem( a1, a2 ) {
	this.a1 = a1;
	this.a2 = a2;
	this.isResponseIncorrect = false;
}
AdditionProblem.prototype.isCorrect = function( response ) {
	return response == this.a1 + this.a2;
}