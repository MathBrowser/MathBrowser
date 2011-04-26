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
	this.numberOfProblems = 10;
	this.range1 = [0,9];
	this.range2 = [0,9];
	this.rightAnswers = 0;
	this.wrongAnswers = 0;
	this.currentProblem = null;
}
AdditionProblemSet.prototype.checkCurrentAnswer = function() {
	var response = document.getElementById( "drillresponse" ).value;
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
		this.showButton( "nextproblem", true );
		document.getElementById( "nextproblem" ).focus();
	}
}
AdditionProblemSet.prototype.initResponse = function( id, display ) {
	var responseInput = document.getElementById( "drillresponse" );
	responseInput.value = "";
	responseInput.focus();
}
AdditionProblemSet.prototype.showButton = function( id, display ) {
	document.getElementById( id ).style.display = display ? "inline" : "none";
}
AdditionProblemSet.prototype.showNextProblem = function() {
	// Take the highlight off the error message in case it's there
	document.getElementById( "wrong" ).className = "";
	// Make sure we've got the correct buttons enabled.
	this.showButton( "checkanswer", true );
	this.showButton( "tryagain", false );
	this.showButton( "nextproblem", false );
	this.currentProblem = new AdditionProblem( getRandomInteger(this.range1[0], this.range1[1]), getRandomInteger(this.range2[0], this.range2[1]) );
	replaceTextForID( "a1", this.currentProblem.a1 );
	replaceTextForID( "a2", "+" + this.currentProblem.a2 );
	this.initResponse();
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