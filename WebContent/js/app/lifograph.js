(function($, _) {
	"use strict";
	var rowCount = 50;
	var colCount = 50;
	var neighborhood = [ [ -1, -1 ], [ -1, 0 ], [ -1, 1 ], [ 0, 1 ], [ 1, 1 ], [ 1, 0 ], [ 1, -1 ], [ 0, -1 ] ];

	function randomState() {
		return (Math.floor(Math.random() * (1 - 0 + 1)) + 0) ? "alive" : "dead";
	}

	function PetriDish(cells) {
		if (!!cells) {
			this._cellsMatrix = cells;
			return this;
		}

		this._cellsMatrix = [];

		for (var r = 0; r < rowCount; r++) {
			this._cellsMatrix.push([]);
			for (var c = 0; c < colCount; c++) {
				this._cellsMatrix[r].push(new Cell({
					row : r,
					col : c,
					dish : this,
					state : randomState()
				}));
			}
		}
	}

	PetriDish.prototype.neighbors = function(cell) {
		var self = this;

		return neighborhood.map(function(offset) {
			var nrow = cell.row + offset[0];
			var ncol = cell.col + offset[1];
//			console.log("neighbor", !!self._cellsMatrix[nrow] && self._cellsMatrix[nrow][ncol]);
			return !!self._cellsMatrix[nrow] ? self._cellsMatrix[nrow][ncol] : false;
		}).filter(function(item) {
			return !!item;
		});
	};

	PetriDish.prototype.cell = function(row, col) {
		return !!this._cellsMatrix[row] && this._cellsMatrix[row][col];
	};

	function setNextCell(cell, dish) {

	}

	PetriDish.prototype.nextBatch = function() {
//		console.log("--- will compute new new batch ---");
//		console.log("current batch", this._cellsMatrix.map(function(row) { return row.map(function(cell) { cell.state; }); }));
		var nextDish = new PetriDish();

		var nextCells = this._cellsMatrix.map(function(row) {
			return row.map(function(cell) {
				return cell.nextBatch(nextDish);
			});
		});

		nextDish._cellsMatrix = nextCells;

		return nextDish;
	};

	function Cell(opts) {
		opts = _.defaults(opts, {
			state : "alive"
		});
		this.state = opts.state;
		this._dish = opts.dish;
		this.row = opts.row;
		this.col = opts.col;
	}

	Cell.prototype.nextBatch = function(nextDish) {
		var neighbors = this._dish.neighbors(this);
		var alive = neighbors.map(function(nbr) {
			return nbr.state;
		}).reduce(function(sum, state) {
			return state === "alive" ? sum + 1 : sum;
		}, 0);
		
//		console.log("alive nbr", this.row, this.col, alive);

		var nextState;

		if (this.state === "alive") {
			nextState = alive === 2 || alive === 3 ? "alive" : "dead";
		} else { // dead
			nextState = alive === 3 ? "alive" : "dead";
		}

//		console.log("cell will change to ", this.state, nextState);

		return new Cell({
			row : this.row,
			col : this.col,
			state : nextState,
			dish : nextDish
		});
	};

	// init table
	var tbody = "";
	for (var row = 0; row < rowCount; row++) {
		tbody += "<tr>";
		for (var col = 0; col < colCount; col++) {
			tbody +="<td></td>";
		}
		
		tbody += "</tr>";
	}
	
	$("table tbody").html(tbody);
	
	// slaps ids to cells
	$("table tr").each(function(rdx, row) {
		row.id = "r" + rdx;
		row.dataset.row = rdx;

		$(row).find("td").each(function(cdx, cell) {
			cell.id = "c" + rdx + "" + cdx;
			cell.dataset.row = rdx;
			cell.dataset.col = cdx;
		});
	});

	(function() {
		var currentDish;
		var running;
		var $trs = $("table tr");
		var dishesQueue = [];

		var showState = function() {
			var dish = dishesQueue.shift();
			if (!dish) {
				return;
			}
			
			$trs.each(function(rdx, tr) {
				$(tr).find("td").each(function(cdx, td) {
					var $td = $(this);
					var state = dish.cell(parseInt($td.data("row")), parseInt($td.data("col"))).state;

					$td.removeClass().addClass(state);
				});
			});
		};
		
		setInterval(showState, 500);

		$(document).on("click", "#init", function() {
			currentDish = new PetriDish();
			dishesQueue.push(currentDish);
		});

		$(document).on("click", "#start", function() {
			running = setInterval(function() {
				dishesQueue.push(currentDish = currentDish.nextBatch());
			}, 500);
		});

		function showNext() {
			dishesQueue.push(currentDish = currentDish.nextBatch());
		}
		
		$(document).on("click", "#next", showNext);
		
		$(document).on("click", "#stop", function() {
			console.log("stop");
			clearInterval(running);
		});
	})();
})(jQuery, _);