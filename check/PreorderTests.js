/*
 * PreorderTests.js
 *
 *  Copyright (C) 2011,2012 Stefan Bolus, University of Kiel, Germany
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


/**
 * Test with SpiderMonkey: 
	js -m -f ../js/core/DisjointSets.js -f ../js/core/Partition.js  \
			-f ../js/core/Mergesort.js -f ../js/core/Poset.js \
			-f ../js/core/Preorder.js -f common.js PreorderTests.js
*/


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


function test (n,mat) {
	var s;
	var i,j,k;
	
	print ("Running Test with Relation:____________________________");
	s = "";
	for (i = 0 ; i < n ; ++i) {
		s += "    ";
		for (j = 0 ; j < n ; ++j)
			s += mat[i][j] ? "1" : ".";
		s += "\n";
	}
	print (s);

	function are_equal (i,j) { return mat[i][j] && mat[j][i]; }
	function is_greater (i,j) { return mat[i][j] && !mat[j][i]; };
	function is_greater_equal (i,j) { return are_equal(i,j) || is_greater(i,j); }
	
	var p = new Preorder (n, is_greater, are_equal);
	
	print ("Preorder at the beginning:_____________________________");
	print (p);
	
	p.isTotal();
	print ("Preorder after isTotal():______________________________");
	print (p);
	
	p.getEquivClasses();
	print ("Preorder after getEquivClasses():______________________");
	print (p);
	
	p.getDirectSuccessorsOf(0);
	print ("Preorder after getDirectSuccessorsOf(0):_______________");
	print (p);
	
	var diffResult = diff_relation (mat, is_greater_equal);
	
	var diffCount = diffResult[0];
	var diff = diffResult[1];
	
	if (diffCount > 0) {
		s = "";
		
		print ("Relations differ in " + diffCount + " positions (D means 'different'):");
		for (i = 0 ; i < n ; ++i) {
			s += "    ";
			for (j = 0 ; j < n ; ++j)
				s += diff[i*n+j] ? "D" : ".";
			s += "\n";
		}
		print (s);
		
		quit();
	}
	else {
		print ("Relations are equal: GOOD");
	}
	
	/* Verify the direct successors. */
	for (i = 0 ; i < n ; ++i) {
		var succs = []; // succs of i
		for (j = 0 ; j < n ; ++j) {
			if (is_greater (i,j)) {
				var direct = true;
				for (k = 0 ; k < n ; ++k) {
					if (is_greater(i,k) && is_greater(k,j)) {
						direct = false;
						break;
					}
				}
				if (direct) {
					succs.push (j);
				}
			}
		}
		
		var comp = p.getDirectSuccessorsOf(i)
		if ( !sets_equal (succs, comp)) {
			print ("Direct successors of player " + i + " differ!");
			print ("\tAre: " + comp);
			print ("\tShould have been: " + succs);
			
			quit();
		}
	}
	
	print ("==============================================\n");
}

// Perform some user-defined tests.
for (var t in Tests) {
	
	var n = Tests[t][0];
	var mat = rtc (list_to_mat(n, Tests[t][1]));
	
	test (n,mat);
}

// Perform some random tests.
var n_iters = 10000;

for (var iter = 0 ; iter < n_iters ; ++iter) {
	var n = random_int (1,40);
	var density = Math.random() * Math.random() * Math.random();
	var mat = random_preorder (n, density);
	
	test (n,mat);
}