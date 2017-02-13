function buildMaze() {
    "use strict";
    // The following is to give options for maze size and level of difficulty
    var mw = document.getElementById('mazeSize'),  //pulling value from selected Maze Size
        r = document.getElementById('radius'), // pulling value form select Maze Level (difficulty)
        mazeWidth = mw.options[mw.selectedIndex].value,
        radius = parseInt(r.options[r.selectedIndex].value),
        xCount = Math.floor(mazeWidth / radius), //creating xCount based on maze size and level
        yCount = Math.floor(xCount / 1.778), // creating yCount based on 16:9 ration to xCount
        width = xCount * radius ,
        height = yCount * radius,
        x,
        y,
        id = 0,
        grid = [],
        cell,
        previousRow = [],
        currentRow = [],
        previousCell = false,
        i,
        g,
        startCell,
        click;
        console.log('Radius:', radius);
        console.log('xCount:', xCount);

    Crafty.init(width, height);
    Crafty.background('rgb(230,230,230)');

    function dfsSearch(startCell, endCell) {
        Crafty.trigger('DFSStarted', null);
        endCell.drawEndNode();
        startCell.drawStartNode();
        var currentCell = startCell,
            neighborCell,
            stack = [],
            neighbors = [],
            stackPopped = false,
            found = false;
        currentCell.visited = true;
        while (!found) {
            neighbors = currentCell.getAttachedNeighbors();
            if (neighbors.length) {
                // if there is a current neighbor that has not been visited, we are switching currentCell to one of them
                stack.push(currentCell);
                // get a random neighbor cell
                neighborCell = neighbors[Math.floor(Math.random() * neighbors.length)];
                neighborCell.visited = true;
                Crafty.e("Trail").connectNodes(currentCell, neighborCell);
                // update our current cell to be the newly selected cell
                currentCell = neighborCell;
                stackPopped = false;
            } else {
                stackPopped = true;
                if (stack.length === 0) {
                    // this point can not be found. bail
                    break;
                }
                currentCell = stack.pop();
            }
            if (currentCell.x === endCell.x && currentCell.y === endCell.y) {
                found = true;
            }
        }
        if (stack.length) {
            stack.push(endCell);
        }
        Crafty.trigger('DFSCompleted', null);
        return stack;
    }

    click = function () {
        // on click, use dfs to search our maze
        var stack = dfsSearch(startCell, this),
            neighbor;
        if (stack.length) {
            startCell = stack.shift();
            while (stack.length) {
                neighbor = stack.shift();
                Crafty.e("Trail")
                    .attr({slow: false, trailColor: 'rgb(0,0,255)'})
                    .connectNodes(startCell, neighbor);
                startCell = neighbor;
            }
        }
    };
    // build the grid for our DFS and rendering
    for (y = 0; y < yCount; y++) {
        // row information is used to assign neighbors
        currentRow = [];
        for (x = 0; x < xCount; x++) {
            id = x * y + y;
            cell = Crafty.e("2D, Mouse, Cell")
                .attr({id: id, x: x * radius, y:  y * radius})
                .bind('MouseDown', click);
            currentRow.push(cell);
            grid.push(cell);
            if (previousCell !== false) {
                previousCell.addNeighbor(cell);
                cell.addNeighbor(previousCell);
            }
            // set our initial start cell to the center of the maze
            if (Math.floor(yCount / 2) === y && Math.floor(xCount / 2) === x) {
                startCell = cell;
            }
            previousCell = cell;
        }
        if (previousRow.length !== 0) {
            for (i = 0; i < previousRow.length; i++) {
                previousRow[i].addNeighbor(currentRow[i]);
                currentRow[i].addNeighbor(previousRow[i]);
            }
        }
        previousRow = currentRow;
        // clear previous cell to prevent wrapped neighbors
        previousCell = false;
    }

    // use dfs to create our maze
    function dfsCreate(startCell) {
        var currentCell = startCell,
            neighborCell,
            stack = [],
            neighbors = [],
            visited = 1;
        currentCell.visited = true;
        while (visited < grid.length) {
            neighbors = currentCell.getUnVisitedNeighbors();
            if (neighbors.length) {
                // if there is a current neighbor that has not been visited, we are switching currentCell to one of them
                stack.push(currentCell);
                // get a random neighbor cell
                neighborCell = neighbors[Math.floor(Math.random() * neighbors.length)];
                visited++;
                neighborCell.visited = true;
                // while building, on move, knock down the walls!
                neighborCell.removeWall(currentCell);
                currentCell.removeWall(neighborCell);
                // update our current cell to be the newly selected cell
                currentCell = neighborCell;
            } else {
                currentCell = stack.pop();
            }
        }
    }
    dfsCreate(grid[Math.floor(Math.random() * grid.length)]);
    for (g = 0; g < grid.length; g++) {
        grid[g].drawWalls();
    }
};
