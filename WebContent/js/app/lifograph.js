(function($, _) {
	"use strict";
	var neighborhood = [ [ -1, -1 ], [ -1, 0 ], [ -1, 1 ], [ 0, 1 ], [ 1, 1 ], [ 1, 0 ], [ 1, -1 ], [ 0, -1 ] ];

	function randomState() {
		return (Math.floor(Math.random() * (3 - 0 + 1)) + 0) ? false : true;
	}

	function PetriDish(rowCount, colCount) {
		if (_.isArray(arguments[0])) {
			this._cells = arguments[0];
			return this;
		}
		
		this._cells = [];

		for (var r = 0; r < rowCount; r++) {
			this._cells.push([]);
			for (var c = 0; c < colCount; c++) {
				this._cells[r].push(randomState());
			}
		}
	}

	PetriDish.prototype.neighbors = function(row, col) {
		var self = this;

		var neighborMapper = function(offset) {
			var nrow = row + offset[0];
			var ncol = col + offset[1];
			
			if (self._cells[nrow] !== undefined && self._cells[nrow][ncol] !== undefined) {
				return self._cells[nrow][ncol];
			}
			
			return undefined;
		};

		return neighborhood.map(neighborMapper).filter(function(item) {
			return item !== undefined;
		});
	};

	PetriDish.prototype.cell = function(row, col) {
		return !!this._cells[row] && this._cells[row][col];
	};

	PetriDish.prototype.nextBatch = function() {
		var self = this;

		var nextState = function(rdx, cdx, alive) {
			var aliveNeighbors = self.neighbors(rdx, cdx).reduce(function(sum, alive) {
				return alive ? sum + 1 : sum;
			}, 0);

			var stillAlive;

			if (alive) {
				stillAlive = aliveNeighbors === 2 || aliveNeighbors === 3;
			} else { // dead
				stillAlive = aliveNeighbors === 3;
			}

			return stillAlive;
		};
		
		var nextCells = this._cells.map(function(row, rdx) {
			return row.map(function(cell, cdx) {
				return nextState(rdx, cdx, cell);
			});
		});

		return new PetriDish(nextCells);
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
					var alive = dish.cell(parseInt($td.data("row")), parseInt($td.data("col")));

					$td.removeClass().addClass(alive ? "alive" : "dead");
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