/*
 * fwvg.js
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

/*
 * Parse command-line options.
 */
load("getopt.js");

/*
 * Default options.
 */
var type_preserving 	= false;
var weight_preserving 	= false;
var min_quota 			= 0;
var max_quota 			= 1000;
var min_weight 			= 0;
var max_weight 			= 500;
var fmt_name 			= 'gmpl';
var encoder_name 		= 'simple'; 
var objs_limit 			= 100000;

function show_usage () {
	print ("usage: fwvg.js [option] formula\n" +
		"\n" +
		"Options:\n" +
		"  -h         Shows this help message.\n" +
		"  -t         Only type preserving representations. [default=false]\n" +
		"  -p         Only weight preserving representations. [default=false]\n" +
		"  -q int     Minimum quota. [default="+min_quota+"]\n" +
		"  -Q int     Maximum quota. [default="+max_quota+"]\n" +
		"  -w int     Minimum player weight. [default="+min_weight+"]\n" +
		"  -W int     Maximum player weight. [default="+max_weight+"]\n" +
		"  -e name    Encoder used for the disjunctions. Possible values: simple,\n" +
		"             inverted, dual. [default="+encoder_name+"]\n" +
		"  -f name    Output format. Supported formats: cplex for CPLEX format and gmpl\n" +
		"             for GNU MathProg format. [default="+fmt_name+"]\n" +
		"  -l int     Limit for the number of objects. [default="+objs_limit+"]\n" +
		"\n" +
		"NOTE: The options minimum/maximum quota/weights are no restrictions for \n"+
		"      the feasible solutions. They are just used for the Big-M formulation.\n");
}

var opt;
while ((opt = getopt (arguments, "htpq:Q:w:W:e:f:l:"))) {
	switch (opt) {
	case 'h': 
		show_usage ();
		quit();
	case 't': type_preserving = true; break;
	case 'p': weight_preserving = true; break;
	case 'q': min_quota = parseInt(optarg); break;
	case 'Q': max_quota = parseInt(optarg); break;
	case 'w': min_weight = parseInt(optarg); break;
	case 'W': max_weight = parseInt(optarg); break;
	case 'e': encoder_name = optarg; break;
	case 'f': fmt_name = optarg; break;
	case 'l': objs_limit = parseInt(optarg); break;
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

var encoder_table = {
		'simple' : function () { return new DefaultBinaryEncoder(); },
		'inverted' : function () { return new InvertedDefaultBinaryEncoder(); },
		'dual' : function () { return new DualEncodedBinaryEncoder(); }
};
if ( !encoder_table.hasOwnProperty(encoder_name)) {
	show_error ('Invalid encoder.');
	quit ();
}

/*
 * The formula is the last argument on the command line.
 */
if (arguments.length-1 < 0) {
	show_error ("You forgot to pass a formula.");
	quit ();
}

var formulaStr = arguments[arguments.length-1];

/*
 * Finally, load the library. it is good practice to postpone this as long as
 * possible, because it can take relatively long.
 */
load (lab_dir + '/embed/lab.js');
Lab.init (lab_dir, closure_dir, jshashtable_dir, myLoadFunc);

/*
 * Before we load the game, we parse the formula such that in case of an error
 * the user gets immediate response.
 */
var factory = {
		createEncoder : encoder_table[encoder_name]
};
var formula = new Formula(factory, formulaStr);

/*
 * Read the input game.
 */
var input = '';
while ((line = readline())) {
    input += line + "\n";
}


/**
 * Returns the number of players in a model.
 * 
 * @param m Model
 * @returns Number of players in the model.
 */
function playersInModel (m) {
	var n = 0;
	for (var i in m) {
		n += parseInt(m[i]);
	}
	return n;
}

/*
 * Prepare the bounds for the model. The values returned by the functions
 * are used as the constants for the Big-M stuff. 
 */
var bounds = {
		getMinQuotaForRule : function (t) { return min_quota; },
		getMaxQuotaForRule : function (t) { return max_quota; },
		getMinModelWeightForRule : function (m, t) { return playersInModel(m) * min_weight; },
		getMaxModelWeightForRule : function (m, t) { return playersInModel(m) * max_weight; },
		getMinCoalWeightForRule : function (c, t) { return c.length * min_weight; },
		getMaxCoalWeightForRule : function (c, t) { return c.length * max_weight; }
};

try {
	var game = parse_mwvg (input);
	
	var num_objs;
	if (type_preserving && weight_preserving) {
		num_objs = game.getShiftMinWinModelCount() + game.getShiftMaxLosingModelCount();
	}
	else if (!type_preserving && weight_preserving) {
		num_objs = game.getShiftMinWinCount() + game.getShiftMaxLosingCount();
	}
	else if (type_preserving && !weight_preserving) {
		num_objs = game.getMinWinModelCount() + game.getMaxLosingModelCount();
	}
	else {
		num_objs = game.getMinWinCount() + game.getMaxLosingCount();
	}
	
	if (num_objs > objs_limit) {
		show_error ("Object limit for the linear program exceeded. ("+
				num_objs + " > " + objs_limit + ")");
		quit ();
	}
	
	var service = new FWVGModelService (game, formula, bounds);
	service.setTypePreserving (type_preserving);
	service.setWeightPreserving (weight_preserving);
	
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