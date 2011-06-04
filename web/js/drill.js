var g_problemSet = null;

function init() {
	
	// Create a new problem set
	g_problemSet = createNewProblemSet();
	g_problemSet.setMode( "start" );
	g_problemSet.showScore();
	g_problemSet.showNextProblem();
	
}

function checkAnswer() {
	g_problemSet.checkCurrentAnswer();
}
function doneWithProblemSet() {
	g_problemSet.showNextProblem();
}
function enableCheckAnswerButton() {
	g_problemSet.enableCheckAnswerButton();
}
function getRandomInteger( min, max ) {
	return Math.floor( Math.random() * (max + 1 - min) + min );
}
function isValidInteger( value ) {
	if( value == null ) {
		return false;
	}
	return /\d+/.test( value );
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
function nextProblemSet() {
	init();
}
function tryAgain() {
	g_problemSet.tryAgain();
}

function ProblemSet() {
	this.numberOfProblems = 10;
	this.rightAnswers = 0;
	this.wrongAnswers = 0;
	this.currentProblem = null;
}
ProblemSet.prototype.checkCurrentAnswer = function() {
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
ProblemSet.prototype.enableCheckAnswerButton = function() {
	// Enable the "Check Answer" button only if the response is a valid integer.
	var e = document.getElementById( "checkanswer" );
	e.disabled = ! isValidInteger( document.getElementById( "drillresponse" ).value );
}
ProblemSet.prototype.initResponse = function( id, display ) {
	var responseInput = document.getElementById( "drillresponse" );
	responseInput.value = "";
	this.enableCheckAnswerButton();
	responseInput.focus();
}
ProblemSet.prototype.isLastProblem = function() {
	return this.rightAnswers + this.wrongAnswers >= this.numberOfProblems;
}
ProblemSet.prototype.setMode = function( mode ) {
	var isDone = (mode == "done");
	document.getElementById( "drill" ).style.display = isDone ? "none" : "";
	document.getElementById( "problem_instructions" ).style.display = isDone ? "none" : "block";
	document.getElementById( "problem_set_results" ).style.display = isDone ? "block" : "none";
}
ProblemSet.prototype.showButton = function( id, display ) {
	document.getElementById( id ).style.display = display ? "inline" : "none";
}
ProblemSet.prototype.showNextProblem = function() {
	
	// Take the highlight off the error message in case it's there
	document.getElementById( "wrong" ).className = "";
	
	var isLastProblem = this.isLastProblem();
	
	// Make sure we've got the correct buttons enabled.
	this.showButton( "checkanswer", ! isLastProblem );
	this.showButton( "tryagain", false );
	this.showButton( "nextproblem", false );
	this.showButton( "done", false );
	this.showButton( "next_problem_set", isLastProblem );
	
	if( isLastProblem ) {
		// If we've shown all the problems, hide the problem, and show the results
		this.setMode( "done" );
		if( this.wrongAnswers == 0 ) {
			replaceTextForID( "problem_set_results", "Congratulations, you answered all the problems correctly!" );
		} else {
			replaceTextForID( "problem_set_results", "You got " + Math.round( (this.rightAnswers * 100) / (this.rightAnswers + this.wrongAnswers)) + "% correct." );
		}
	} else {
		// Otherwise show the next problem
		this.currentProblem = this.createProblem();
		this.currentProblem.renderProblem();
		this.initResponse();
	}

}
ProblemSet.prototype.showScore = function() {
	replaceTextForID( "numright", this.rightAnswers );
	replaceTextForID( "numwrong", this.wrongAnswers );
	replaceTextForID( "numremaining", this.numberOfProblems - this.rightAnswers - this.wrongAnswers );
}
ProblemSet.prototype.tryAgain = function() {
	this.showButton( "checkanswer", true );
	this.showButton( "tryagain", false );
	this.showButton( "nextproblem", false );
	this.initResponse();
}
