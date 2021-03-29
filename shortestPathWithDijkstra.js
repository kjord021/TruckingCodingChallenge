const shortestDistanceNode = (miles, nodesVisited) => {
	let shortest = null;

	for (let node in miles) {
		let currentIsShortest =
			shortest === null || miles[node] < miles[shortest];
		if (currentIsShortest && !nodesVisited.includes(node)) {
			shortest = node;
		}
	}
	return shortest;
};

const findShortestPathWithDijkstra = (graph, startNode, endNode) => {
	let miles = {};
	miles[endNode] = "Infinity";
	miles = Object.assign(miles, graph[startNode]);

	let parents = { endNode: null };
	for (let child in graph[startNode]) {
		parents[child] = startNode;
	}

	let nodesVisited = [];

	let node = shortestDistanceNode(miles, nodesVisited);

	while (node) {
		let distance = miles[node];
		let children = graph[node];
		for (let child in children) {
			if (String(child) === String(startNode)) {
				continue;
			} else {
				let newdistance = distance + children[child];

				if (!miles[child] || miles[child] > newdistance) {
					miles[child] = newdistance;
					parents[child] = node;
				}
			}
		}

		nodesVisited.push(node);

		node = shortestDistanceNode(miles, nodesVisited);
	}

	let shortestPath = [endNode];
	let parent = parents[endNode];
	while (parent) {
		shortestPath.push(parent);
		parent = parents[parent];
	}
	shortestPath.reverse();

	let results = {
		distance: miles[endNode],
		path: shortestPath,
	};

	return results;
};

module.exports = findShortestPathWithDijkstra;