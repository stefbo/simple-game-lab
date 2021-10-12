/*
 * PartitionTests.js
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
//    $ js -m -f ../js/core/DisjointSets.js -f ../js/core/Partition.js -f common.js PartitionTests.js


function random_equiv_relation (n, density)
{
	var R = rel_random (n, density);
	
	return rtc(sc(R));
}


//function refine_equiv_rel (R, factor)
//{
//	var n = R.length;
//	
//	var density = rel_density (R);
//	var S = rel_random (n, density * factor);
//	
//	rtc(sc(S));
//	
//	return rtc(rel_minus (R,S));
//}


var n_iters = 10000;

for (var iter = 0 ; iter < n_iters ; ++iter) {
	
	var n = random_int (1,20);
	var density = Math.random()*0.2;
	
	var mat = random_equiv_relation (n, density);
	var n_queries = 0;
	
	var s;
	var i,j;
	
	print ("Running Test with Relation (n: "+n+", density: "+density+"):___________");
	print (relation_to_string(mat, "    "));
	
	var equal_func = function (i,j) { return mat[i][j]; };
	
	var p = new Partition (n, equal_func);
	
	print ("Partition:___________");
	print (p);
	
	var diffResult = diff_relation (mat, equal_func);
	
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
		
		quit ();
	}
	else {
		print ("Relations are equal: GOOD");
	}
	
	////////////////////////////////////////////
	
//	var ref = refine_equiv_rel (mat, 0.5);
//	print ("Refined equiv. relation:___________");
//	print (relation_to_string(ref, "    "));
//	
//	var refined_equal_func = function (i,j) { return ref[i][j]; };
//	var r = p.refine (refined_equal_func);
//	print ("Partition (refined):___________");
//	print (p);
//	
//	var diffResult = diff_relation (ref, refined_equal_func);
//	
//	var diffCount = diffResult[0];
//	var diff = diffResult[1];
//	
//	if (diffCount > 0) {
//		s = "";
//		
//		print ("Relations differ in " + diffCount + " positions (D means 'different'):");
//		for (i = 0 ; i < n ; ++i) {
//			s += "    ";
//			for (j = 0 ; j < n ; ++j)
//				s += diff[i*n+j] ? "D" : ".";
//			s += "\n";
//		}
//		print (s);
//		
//		quit ();
//	}
//	else {
//		print ("Relations are equal: GOOD");
//	}
	
	print ("==============================================\n");
}
