function XCScorerTeam(teamName) {
	this.teamName = teamName;
	this.points = 0;
	this.places = [];
	this.DOMElement = null;
	
	this.getFinisherCount = function() {
		return this.places.length;		
	};
	
	this.addPlace = function(placeObject) {
		var addIndex = 0;
		while (addIndex < this.places.length && this.places[addIndex].overallPlace < placeObject.overallPlace) {
			addIndex++;
		}
		this.places.splice(addIndex, 0, placeObject);
		this.calculateScore();
	};
	
	this.removePlace = function(placeObject) {
		var index = this.places.findIndex((place) => place == placeObject);
		if (index >= 0) {
			this.places.splice(index, 1);
			this.calculateScore();
		}
	};
	
	this.calculateScore = function() {
		this.points = (this.places.length < 5)
						? 0
						: this.places.reduce((previousValue, placeObject) => (previousValue + placeObject.teamPlace), 0);
		
		return this.points;
	};
	
	this.clearPlaces = function() {
		this.points = 0;
		this.places.splice(0, this.places.length);
	};
	
	this.getPlacesString = function() {
		var str = this.places.reduce((previousValue, placeObject) => previousValue + (previousValue.length == 0 ? "" : "+") + placeObject.teamPlace, "");
		if (this.points != 0) {
			console.log(this.points);
			str += "=" + this.points;
		}
		return str;
	};
	
	this.isScoringComplete = function() {
		return this.places.length >= 5;
	};
	
	this.isTeamComplete = function() {
		return this.places.length >= 7;		
	};
};

function XCScorerPlace(timeOffset, overallPlace, teamPlace, team) {
	this.timeOffset = timeOffset;
	this.overallPlace = overallPlace;
	this.teamPlace = teamPlace;
	this.team = team;
	this.DOMElement = null;
	
	this.getPlaceText = function() {
		return this.overallPlace + " " + ((this.team == null) ? ((this.teamPlace == null) ? "Individual" : "Other Team") : this.team.teamName) + " " + this.timeOffset + ((this.teamPlace == null) ? "" : (" " + this.teamPlace));
	};
};

function XCScorer() {
	this.startTime = null;
	this.timerInterval = null;
	this.scoringTeams = [];
	this.places = [];
	this.nextOverallPlace = 1;
	this.nextTeamPlace = 1;
	
	this.addTeam = function(teamName) {
		var team = new XCScorerTeam(teamName);
		this.scoringTeams.push(team);
		return team;
	};
	
	this.getTeamCount = function() {
		return this.scoringTeams.length;
	}
	
	this.removeTeam = function(team) {
		if (typeof(team) == 'string') {
			team = this.getTeamNamed(team);
		}
		
		var index = this.scoringTeams.findIndex((teamObject) => team == teamObject);
		if (index >= 0) {
			team.places.forEach((placeObject) => { placeObject.team = null; placeObject.teamPlace = null; });
			this.scoringTeams.splice(index, 1);
		}
	};
	
	this.scorePlaceForNonTeam = function() {
		return this.scorePlaceForTeam(null);
	};

	this.getTeamNamed = function(teamName) {
		return this.scoringTeams.find((teamObject) => teamName == teamObject.teamName);
	};
	
	this.scorePlaceForOtherTeam = function() {
		var placeObject = new XCScorerPlace(this.getTimeOffset(), this.nextOverallPlace++, this.nextTeamPlace++, null);
		this.places.push(placeObject);
		return placeObject;		
	}
	
	this.scorePlaceForTeam = function(team) {
		if (team != null && typeof(team) == 'string') {
			team = this.getTeamNamed(team);
		}

		var placeObject = new XCScorerPlace(this.getTimeOffset(), this.nextOverallPlace++, (team == null) ? null : this.nextTeamPlace++, team);
		this.places.push(placeObject);
		if (team != null) {
			team.addPlace(placeObject);
		}
		
		return placeObject;
	};
	
	this.undoLastPlace = function() {
		if (this.places.length == 0) {
			return;
		}
		
		var placeObject = this.places.pop();
		this.nextOverallPlace--;
		if (placeObject.teamPlace != null) {
			this.nextTeamPlace--;
		}
		if (placeObject.team != null) {
			placeObject.team.removePlace(placeObject);
		}
		
		return placeObject;
	};
	
	this.getTimeOffset = function() {
		if (this.startTime == null || this.startTime == 0) {
			return "0.0";
		}
		
		var milliseconds = Date.now() - this.startTime;
		var minutes = Math.floor(milliseconds / 60000);
		var seconds = Math.ceil((milliseconds % 60000) / 100) / 10; // round to tenths, rounding up
		var str = "";
		if (minutes > 0) {
			str += minutes + ":";
			if (seconds < 10) {
				str += "0";
			}
		}
		str += seconds;
		if (Math.ceil(seconds) == seconds) {
			str += '.0';
		}
		return str;
	};
	
	this.startTiming = function() {
		if (this.startTime == null) {
			this.startTime = Date.now();
		}
	};
	
	this.stopTiming = function() {
		this.startTime = null;
	};
	
	this.isTiming = function() {
		return this.startTime != null;
	}
	
	this.resetScore = function(clearTeams) {
		if (clearTeams) {
			this.scoringTeams.splice(0, this.scoringTeams.length);
		} else {
			this.scoringTeams.forEach((teamObject) => { teamObject.clearPlaces(); });
		}
		this.places.splice(0, this.places.length);
		this.nextOverallPlace = 1;
		this.nextTeamPlace = 1;
	};
	
	this.resetClock = function() {
		this.startTime = null;
	};
	
	this.resetAll = function(clearTeams) {
		this.resetScore(clearTeams);
		this.resetClock();
	};
	
	this.recalculateScoringPlaces = function() {
		this.nextOverallPlace = 1;
		this.nextTeamPlace = 1;
		this.places.forEach((placeObject) => {
			placeObject.overallPlace = this.nextOverallPlace++;
			if (placeObject.team != null) {
				placeObject.teamPlace = this.nextTeamPlace++;
			}
		});
		this.scoringTeams.forEach((teamObject) => { teamObject.calculateScore(); });
	};
	
	this.getNextPlaceString = function() {
		if (this.nextTeamPlace == this.nextOverallPlace)
			return "next: " + this.nextOverallPlace;
		return "next: " + this.nextTeamPlace + " (" + this.nextOverallPlace + " OA)";
	}
};

function updateTeamControl(teamObject) {
	if (teamObject.DOMElement == null) {
		return;
	}
	
	if (teamObject.isTeamComplete()) {
		if (!$(teamObject.DOMElement).hasClass('teamcomplete')) {
			$(teamObject.DOMElement).addClass('teamcomplete').removeClass('teamscored');
		}
	} else if (teamObject.isScoringComplete()) {
		if (!$(teamObject.DOMElement).hasClass('teamscored')) {
			$(teamObject.DOMElement).addClass('teamscored').removeClass('teamcomplete');
		}
	} else {
		if ($(teamObject.DOMElement).hasClass('teamscored') || $(teamObject.DOMElement).hasClass('teamcomplete')) {
			$(teamObject.DOMElement).removeClass('teamscored').removeClass('teamcomplete');
		}
	}
	
	$('.teamplaces', teamObject.DOMElement).text(teamObject.getPlacesString());
}

function getPlaceTableRow(placeObject) {
	return $(document.createElement('tr'))
			.addClass('finisherrow')
			.append($(document.createElement('td')).text(placeObject.overallPlace))
			.append($(document.createElement('td')).text(((placeObject.team == null) ? ((placeObject.teamPlace == null) ? "Individual" : "Other Team") : placeObject.team.teamName)))
			.append($(document.createElement('td')).text(placeObject.timeOffset))
			.append($(document.createElement('td')).text((placeObject.teamPlace == null) ? "" : placeObject.teamPlace))
			.get(0);
}
