/*
 * benchmark.js
 *
 *  Copyright (C) 2012 Stefan Bolus, University of Kiel, Germany
 *
 *  This program is free software; you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation; either version 2 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program; if not, write to the Free Software
 *  Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA.
 */

var lab_dir = "../../..";
var closure_dir = lab_dir;
var jshashtable_dir = lab_dir;


function myLoadFunc (f) {
  try {
    load (f);
  }
  catch (e) {
    print ("We encountered an internal error. Details: Unable to load the library ("+f+")");
    quit ();
  }
}

/*
 * Parse command-line options.
 */
load("getopt.js");

/*
 * Default options.
 */
var compute_shift_qobdds = true;

function show_usage () {
	print ("usage: benchmark.js [option]\n" +
		"\n" +
		"Options:\n" +
		"  -h         Shows this help message.\n" +
		"  -s         Do not compute the Shift-QOBDDs. [default=false]\n");
}

var opt;
while ((opt = getopt (arguments, "hs"))) {
	switch (opt) {
	case 'h': 
		show_usage ();
		quit();
	case 's': compute_shift_qobdds = false; break;
	default:
		print ("Invalid option or value missing: " + opt + ".\n");
		show_usage ();
		quit();
	}
}

function show_error (s) {
	print ("Error: " + s);
}

/*
 * Finally, load the library. it is good practice to postpone this as long as
 * possible, because it can take relatively long.
 */
load (lab_dir + '/embed/lab.js');
Lab.init (lab_dir, closure_dir, jshashtable_dir, myLoadFunc);

/*
 * Read the input game.
 */
var input = '';
while ((line = readline())) {
    input += line + "\n";
}

function MyTimer ()
{
	var _start = Date.now();
	var _last = _start;
	var _marks = [];
	
	this.setMark = function (name) {
		var now = Date.now();
		var elapsed = now - _last;
		_marks.push ([name, now - _last, now]);

		print (name + ": " + elapsed + "ms");
		_last = now;
	};
	
	this.showStats = function () {
		var overall = Date.now() - _start;
		print ("===================");
		print ("Overall time: " + overall + "ms");
		print ("\nDistribution:");
		for (var i in _marks) {
			print ("\t" + _marks[i][0] + ": " + parseInt(_marks[i][1]/overall*100.0) + "% ("+_marks[i][1]+"ms)");
		}
	};
};

try {
	var timer = new MyTimer();
	var game = parse_mwvg (input);
	var n_players = game.getPlayerCount();
	timer.setMark ("Load & build QOBDD");
	
	var alad = game.getAlad();
	timer.setMark ("game.getAlad()");
	
	alad.getTypeCount();
	timer.setMark ("alad.getTypeCount()");
	
	game.isComplete ();
	timer.setMark ("game.isComplete()");
	
	for (var i = 0 ; i < n_players ; ++i) {
		for (var j = 0 ; j < n_players ; ++j) {
			alad.isMoreDesirable(i,j);
		}
	}
	timer.setMark ("Exploring the complete desirability relation on individuals");
	
	game.isProper ();
	timer.setMark ("game.isProper()");
	
	game.isStrong ();
	timer.setMark ("game.isStrong()");
	
	game.isDecisive ();
	timer.setMark ("game.isDecisive()");
	
	game.getWinCount ();
	timer.setMark ("game.getWinCount()");
	
	game.getWinModelCount ();
	timer.setMark ("game.getWinModelCount()");
	
	game.getMinWinQOBDD ();
	timer.setMark ("game.getMinWinQOBDD()");
	
	if (compute_shift_qobdds) {
		game.getShiftMinWinQOBDD ();
		timer.setMark ("game.getShiftMinWinQOBDD()");
	}
	
	game.getMaxLosingQOBDD ();
	timer.setMark ("game.getMaxLosingQOBDD()");
	
	if (compute_shift_qobdds) {
		game.getShiftMaxLosingQOBDD ();
		timer.setMark ("game.getShiftMaxLosingQOBDD()");
	}
	
	game.getAbsBanzhaf ();
	timer.setMark ("game.getAbsBanzhaf()");
	
	game.getShapleyShubik ();
	timer.setMark ("game.getShapleyShubik()");
	
	game.getAbsHollerPackel ();
	timer.setMark ("game.getAbsHollerPackel()");
	
	game.getShiftPower ();
	timer.setMark ("game.getShiftPower()");
	
	game.getDummyPlayers ();
	timer.setMark ("game.getDummyPlayers()");
	
	game.isHomogeneous ();
	timer.setMark ("game.isHomogeneous()");
	
	timer.showStats();
}
catch (e) {
	if (e instanceof ParserException) {
		show_error ("Unable to parse inputimer. Reason: " + e);
	}
	else {
		show_error ("Reason: " + e);
	}
	
	quit ();
}