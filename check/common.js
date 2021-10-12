/*
 * common.js
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

// in-place, returns R
function floyd_warshall (n, R)
{
	var i,j,k;

	for (k = 0 ; k < n ; k ++) {
		for (i = 0 ; i < n ; i ++) {
			for (j = 0 ; j < n ; j ++)
				R[i][j] = R[i][j] || (R[i][k] && R[k][j]);
		}
	}
	
	return R;
}


// transitive closure, in place, returns R
function tc (R)
{
	var n = R.length;
	return floyd_warshall (n, R);
}


// reflexive transitive closure, in place, returns R
function rtc (R)
{
	var n = R.length;
	
	// reflexive
	for (var i = 0 ; i < n ; ++i)
		R[i][i] = true;
	
	return tc (R);
}

// symmetric closure, in place, returns R
function sc (R)
{
	var n = R.length;
	
	for (var i = 0 ; i < n ; ++i) {
		for (var j = 0 ; j < i ; ++j) {
			R[i][j] = R[j][i] = (R[i][j] || R[j][i]);
		}
	}
	return R;
}


function random_int (begin,end) { return parseInt(Math.random() * (end - begin)) + begin; }

function copy_matrix (R)
{
	var n = R.length;
	var S = [];
	for (var i = 0 ; i < n ; ++i) {
		S.push(R[i].slice(0) /*copy*/);
	}
	return S;
}

function rel_copy (R) { return copy_matrix(R); }

function empty_relation (n)
{
	var R = [];
	for (var i = 0 ; i < n ; ++i) {
		R.push([]);
		for (var j = 0 ; j < n ; ++j)
			R[i][j] = false;
	}
	
	return R;
}

function rel_new (n) { return empty_relation(n); }

function rel_random (n, density)
{
	var R = empty_relation (n);
	
	var edges = 0;
	while (edges / (n*n) < density) {
		var i = random_int (0,n);
		var j = random_int (0,n);

		if ( !R[i][j]) {
			edges ++;
			R[i][j] = true;
		}
	}
	
	return R;
}

function rel_count (R)
{
	var n = R.length;
	var c = 0;
	
	for (var i = 0 ; i < n ; ++i) {
		for (var j = 0 ; j < i ; ++j) {
			if (R[i][j]) { ++c; }
		}
	}
	return c;
}

function rel_density (R) { return rel_count(R) / (R.length*R.length); }

function rel_minus (R,S)
{
	var n = R.length;
	
	var T = [];
	for (var i = 0 ; i < n ; ++i) {
		T.push([]);
		for (var j = 0 ; j < n ; ++j) {
			T[i].push (R[i][j] && !S[i][j]);
		}
	}
	return T;
}

function list_to_mat (n,l)
{
	var R = [];
	for (var i = 0 ; i < n ; ++i) {
		R.push([]);
		for (var j = 0 ; j < n ; ++j)
			R[i][j] = false;
	}
	
	for (var k in l)
		R[l[k][0]-1][l[k][1]-1] = true;
	
	return R;
}


function relation_to_string (R, prefix, true_char, false_char)
{
	var n = R.length;
	
	if (true_char === undefined) true_char = '1';
	if (false_char === undefined) false_char = '.';
	
	var s = "";
	for (i = 0 ; i < n ; ++i) {
		s += prefix;
		for (j = 0 ; j < n ; ++j)
			s += R[i][j] ? true_char : false_char;
		s += "\n";
	}
	return s;
}

// Returns [diff_count, diff_rel]. The latter is undefined if diff_count is 0.
function diff_relation (R, value_func)
{
	var n = R.length;
	
	var diffCount = 0;
	var diff = [];
	/* Tests if the relations are equal: */
	for (var i = 0 ; i < n ; ++i) {
		for (var j = 0 ; j < n ; ++j) {
			if (R[i][j] != value_func(i,j)) {
				diffCount ++;
				diff.push(true);
			}
			else diff.push (false);
		}
	}
	
	return [diffCount, diff];
}


// Ignores the positions of the elements in the arrays.
function sets_equal (A,B)
{
	function is_in (A,e) {
		for (var i in A) {
			if (A[i] === e) return true;
		}
		return false;
	}
	
	if (A.length !== B.length) return false;
	else {
		for (var i in A) {
			if ( !is_in(B,A[i])) return false;
		}
	}
	
	return true;
}


function random_preorder (n, density)
{
	return rtc (rel_random(n, density));
}