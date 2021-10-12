/*
 * PosetTests.js
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


// Test with SpiderMonkey: 
//    js -m -f ../js/core/Mergesort.js -f ../js/core/Poset.js -f common.js PosetTests.js

function random_poset (n, density, max_iters)
{
	var R = rel_new (n);
	
	var edges = 0;
	var iters = 0;
	while (edges / (n*n) < density && iters < max_iters) {
		iters ++;
		
		var i = random_int (0,n);
		var j = random_int (0,n);
		
		if (i === j)
			continue;
		
		var S = rel_copy (R);
		S[i][j] = true;
		tc (S);
		if (S[j][i] === true) {
			/* we have a cycle ... ignore edge */
		}
		else {
			R[i][j] = true;
			edges ++;
		}
	}
	
	return tc(R);
}


// total, 1 > 2=3 > 4
var R = [[1,2],[1,3],[2,4],[3,4],
         [2,3],[3,2]];

// not total, 1>4,6, 6>2,3>7, 4,7>5
var S = [[1,4],[1,6],[6,2],[6,3],[2,7],[3,7],[4,5],[7,5],
         [2,3],[3,2]];

// total, 3>1>4>2
var T = [[3,1],[1,4],[4,2]];

// not total
var U = [[1,2],[1,3],[2,4],[2,5],[2,6],[3,7],[4,10],[5,10],[6,11],[10,11],[6,8],[7,8],[7,9],[8,12],[9,12],[11,12],
         [4,5],[5,4],
         [8,9],[9,8]];

// [n,l] where n is the number of players and mat is a matrix.
var Tests = [[4,R],[7,S],[4,T],[12,U]];

// in Rhino
function verbose(s) { print(s); }


var n_iters = 10000;


for (var iter = 0 ; iter < n_iters ; ++iter) {
	
	var n = random_int (1,20);
	var density = Math.random();
	var max_iters = 10000;
	var mat = random_poset (n, density, max_iters); 
	var n_queries = 0;
	
	var s;
	var i,j;
	
	verbose ("Running Test with Relation (n: "+n+", density: "+density+"):____________________________");
	s = "";
	for (i = 0 ; i < n ; ++i) {
		s += "    ";
		for (j = 0 ; j < n ; ++j)
			s += mat[i][j] ? "1" : ".";
		s += "\n";
	}
	verbose (s);
	
	var is_greater = function (i,j) { n_queries++; return mat[i][j]; };
	
	var p = new Poset (n, is_greater);
	
	verbose ("Poset at the beginning:_____________________________");
	verbose (p);
	
	p.isTotal();
	verbose ("Poset after isTotal():______________________________");
	verbose (p);
	
	p.getDirectSuccessorsOf(0);
	verbose ("Poset after getDirectSuccessorsOf(0):_______________");
	verbose (p);
	
	for (i = 1 ; i < n ; ++i)
		p.getDirectSuccessorsOf(i);
	verbose ("Poset after getDirectSuccessorsOf({0..n-1}):_______________");
	verbose (p);
	
	var diffCount = 0;
	var diff = [];
	/* Tests if the relations are equal: */
	for (i = 0 ; i < n ; ++i) {
		for (j = 0 ; j < n ; ++j) {
			if (p.isGreater(i,j) != mat[i][j]) {
				diffCount ++;
				diff.push(true);
			}
			else diff.push (false);
		}
	}
	
	if (diffCount > 0) {
		s = "";
		
		verbose ("Relations differ in " + diffCount + " positions (D means 'different'):");
		for (i = 0 ; i < n ; ++i) {
			s += "    ";
			for (j = 0 ; j < n ; ++j)
				s += diff[i*n+j] ? "D" : ".";
			s += "\n";
		}
		verbose (s);
		
		quit ();
	}
	else {
		verbose ("Relations are equal: GOOD (#queries: "+n_queries+")");
	}
	verbose ("==============================================\n");
}
