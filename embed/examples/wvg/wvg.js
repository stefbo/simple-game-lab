/*
 * wvg.js
 *
 *  Copyright (C) 2011 Stefan Bolus, University of Kiel, Germany
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

function show_error (s) {
	print ("Error: " + s);
}


/*
 * Parse command-line options.
 */
load("getopt.js");

/*
 * Default options.
 */
var type_preserving 	= true;
var integer_weights 	= false;
var fmt_name 			= 'cplex';
var collapse 			= true;
var objective_name		= 'min_Q';
var optimize_redundant 	= true;
var presolve 		  	= true;
var qobdd_size_limit 	= 25000;

function show_usage () {
	print ("usage: wvg.js [option]\n" +
		"\n" +
		"Options:\n" +
		"  -h         Shows this help message.\n" +
		"  -t         Do NOT preserve types.\n" +
		"  -i         Consider weights as integers.\n" +
		"  -r         Do NOT optimize redundant nodes.\n" +
		"  -c         Do NOT collapse inner nodes with a single reference.\n" +
		"  -o obj     Objective function. Options are: min_Q and min_wN. \n" +
		"             [default="+objective_name+"]\n" +
		"  -p         Do NOT try to prove the WVG not to be weighted.\n" +
		"  -f name    Output format. Supported formats: cplex for CPLEX format and gmpl\n" +
		"             for GNU MathProg format. [default="+fmt_name+"]\n" +
		"  -l int     Limit for the QOBDD inner nodes. [default="+qobdd_size_limit+"]\n");
}

var opt;
while ((opt = getopt (arguments, "htirco:pf:l:"))) {
	switch (opt) {
	case 'h': 
		show_usage ();
		quit();
	case 't': type_preserving = false; break;
	case 'i': integer_weights = true; break;
	case 'r': optimize_redundant = false; break;
	case 'c': collapse = false; break;
	case 'o': objective_name = optarg; break;
	case 'p': presolve = false; break;
	case 'f': fmt_name = optarg; break;
	case 'l': qobdd_size_limit = parseInt(optarg); break;
	default:
		print ("Invalid option or value missing: " + opt + ".\n");
		show_usage ();
		quit();
	}
}

/*
 * Finally, load the library. it is good practice to postpone this as long as
 * possible, because it can take relatively long.
 */
load (lab_dir + '/embed/lab.js');
Lab.init (lab_dir, closure_dir, jshashtable_dir, myLoadFunc);


/*
 * Verify the arguments.
 */
var fmt_table = { 
		'cplex' : function () { return new CPLEX_LPBuilder(print); },
		'gmpl' : function () { return new GMPL_LPBuilder(print); }
};
if ( !fmt_table.hasOwnProperty(fmt_name)) {
	show_error ('Invalid format.');
	quit ();
}

var objective_table = { 
		'min_Q' : WVGModelService.OBJ_MIN_QUOTA,
		'min_wN' : WVGModelService.OBJ_MIN_WEIGHTS
};
if ( !objective_table.hasOwnProperty(objective_name)) {
	show_error ('Invalid objective function.');
	quit ();
}


/*
 * Read the input game.
 */
var input = '';
while ((line = readline())) {
    input += line + "\n";
}


try {
	var game = parse_mwvg (input);
		
	var qobdd_size = game.getWinQOBDD().size();
	if (qobdd_size > qobdd_size_limit) {
		show_error ("Max QOBDD size exceeded. ("+qobdd_size+" > "+qobdd_size_limit+")");
		quit ();
	}
	
	var service = new WVGModelService (game);
	
	service.setObjective(objective_table[objective_name]);
	service.setPreserveTypes (type_preserving);
	service.setIntegerVars(integer_weights);
	service.setCollapseSingleRefNodes(collapse);
	service.setPresolve(presolve);
	
	var model = service.getModel ();
	var builder = fmt_table[fmt_name]();
	model.build (builder);	
}
catch (e) {
	if (e instanceof ParserException) {
		show_error ("Unable to parse input. Reason: " + e);
	}
	else {
		show_error ("Reason: " + e);
	}
	
	quit ();
}