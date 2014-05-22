(function($, _) {
	//slaps ids to cells
	$("table tr").each(function(rdx, row){
		console.log(arguments)
		row.id = "r" + rdx;
		
		$(row).find("td").each(function(cdx, cell) {
			cell.id = "c" + rdx + "" + cdx;
		});
	});
	
	function PetriDish() {
		this.coords = {
				0: [-1, -1],
				1: [-1, 0],
				2: [-1, 1],
				3: [0, 1],
				4: [1, 1],
				5: [1, 0],
				6: [1, -1],
				7: [0, -1],
		};
	}
	
	PetriDish.prototype.neighbors = function(cell) {
		
	}
	
	function Cell() {
	}
	
	Cell.prototype.computeNext = function() {
		var neighbors = this.dish.neighbors(this);
		var live = neighbors.map(function(nbr) {
			return nbr.state;
		}).reduce(function(sum, state) { return state === "alive" ? sum + 1 : sum; }, 0);
		
		if (this.state === "alive") {
			this.futureState = live === 2 || live === 3 ? "alive" : "dead";
		} else { // dead
			this.futureState = live === 3 ? "alive" : "dead";
		}
	};
	
	Cell.prototype.applyNext = function() {
		this.state = this.futureState
	};
	
})(jQuery, _);