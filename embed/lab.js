/*
 * lab.js
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
 * 
 */
var Lab = (function (){
	var is_loaded = false;
	
	var lab_files = ["js/core/Misc.js", "js/core/ThresholdCache.js", "js/core/WVG.js",
	                 "js/core/Tables.js", "js/core/QOBDD.js", "js/core/Manip.js",
	                 "js/core/DisjointSets.js", "js/core/Mergesort.js", 
	                 "js/core/Partition.js","js/core/Poset.js","js/core/Preorder.js",
	                 "js/core/Isbell1958.js", "js/core/PEG.js", "js/core/BoolParser.js",
	                 "js/core/InputConversion.js", "js/core/Sudhoelter1989.js",
	                 "js/core/Bolus2011.js", "js/core/PowerIndices.js", "js/core/PowerIndices.js",
	                 "js/core/SimpleGame.js", "js/core/Timer.js", "js/core/GameExamples.js",
	                 "js/core/CoatesLewis1961.js", "js/core/LinearProgram.js",
	                 "js/core/CPLEX_LPBuilder.js", "js/core/GMPL_LPBuilder.js",
	                 "js/core/WVGModelService.js",
	                 "js/core/MDDView.js", "js/core/NaryTree.js",
	                 "js/core/Formula.js", "js/core/FWVGModelService.js"];
	
	
	var closure_files = ["closure-library/closure/goog/base.js",
	                     "closure-library/closure/goog/structs/avltree.js"]; 

	var jshashtable_files = ["jshashtable-2.1/jshashtable.js",
	                         "jshashtable-2.1/jshashset.js"];
	
	return {
		init : function (lab_dir, closure_dir, jshashtable_dir, loadFunc) {
			if (is_loaded) {
				throw {
					name: "LabException",
					message: "Lab is already loaded."
				};
			}
			else {
				if (loadFunc === undefined) loadFunc = load;
				if (loadFunc === undefined) {
					throw {
						name : "LabException",
						message: "Missing load(...) function."
					};
				}
				
				function loadFiles (arr, dir) { for (var i in arr) {
					loadFunc(dir + "/" + arr[i]); }
				}
				
				try {
					loadFiles (jshashtable_files, jshashtable_dir);
					loadFiles (closure_files, closure_dir);
					loadFiles (lab_files, lab_dir);
				}
				catch (e) {
					throw {
						name : "LabException",
						message: "Unable to load file. Reason: " + e.toString()
					};
				}
				
				is_loaded = true;
			}
		}
	};
}());

