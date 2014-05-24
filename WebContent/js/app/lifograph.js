(function($, _) {
	"use strict";
	var neighborhood = [ [ -1, -1 ], [ -1, 0 ], [ -1, 1 ], [ 0, 1 ], [ 1, 1 ], [ 1, 0 ], [ 1, -1 ], [ 0, -1 ] ];

	function randomState() {
		return (Math.floor(Math.random() * (3 - 0 + 1)) + 0) ? "dead" : "alive";
	}

	function PetriDish(rowCount, colCount) {
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

		var neighborMapper = function(offset) {
			var nrow = cell.row + offset[0];
			var ncol = cell.col + offset[1];
			return !!self._cellsMatrix[nrow] && self._cellsMatrix[nrow][ncol];
		};

		return neighborhood.map(neighborMapper).filter(function(item) {
			return !!item;
		});
	};

	PetriDish.prototype.cell = function(row, col) {
		return !!this._cellsMatrix[row] && this._cellsMatrix[row][col];
	};

	PetriDish.prototype.nextBatch = function() {
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

		var nextState;

		if (this.state === "alive") {
			nextState = alive === 2 || alive === 3 ? "alive" : "dead";
		} else { // dead
			nextState = alive === 3 ? "alive" : "dead";
		}

		return new Cell({
			row : this.row,
			col : this.col,
			state : nextState,
			dish : nextDish
		});
	};

	(function() {
		var currentDish;
		var reactorId;
		var painterId;
		var dishesQueue = [];

		function drawTable(rowCount, colCount) {
			var tbody = "";
			for (var row = 0; row < rowCount; row++) {
				tbody += "<tr>";

				for (var col = 0; col < colCount; col++) {
					tbody += "<td data-row='" + row + "' data-col='" + col + "'></td>";
				}

				tbody += "</tr>";
			}

			$("table tbody").html(tbody);
		}

		function showPetriDish() {
			var dish = dishesQueue.shift();
			if (!dish) {
				return;
			}

			$("table tr").each(function(rdx, tr) {
				$(tr).find("td").each(function(cdx, td) {
					var $td = $(this);
					var state = dish.cell(parseInt($td.data("row")), parseInt($td.data("col"))).state;

					$td.removeClass().addClass(state);
				});
			});
			console.log("shown");
		}

		function stopReaction() {
			console.log("stop");
			clearInterval(reactorId);
		}

		$(document).on("click", "#init", function() {
			stopReaction();
			clearInterval(painterId);
			dishesQueue = [];
			
			var rowCount = parseInt($("#rowCount").val());
			var colCount = parseInt($("#colCount").val());
			
			drawTable(rowCount, colCount);
			dishesQueue.push(currentDish = new PetriDish(rowCount, colCount));
			painterId = setInterval(showPetriDish, 500);
		});

		$(document).on("click", "#start", function() {
			reactorId = setInterval(computeNextBatch, 300);
		});

		function computeNextBatch() {
			var cur = currentDish;
			currentDish = null;
			!!cur && dishesQueue.push(currentDish = cur.nextBatch());
			console.log("computed");
		}

		$(document).on("click", "#next", computeNextBatch);

		
		$(document).on("click", "#stop", stopReaction);
	})();
})(jQuery, _);