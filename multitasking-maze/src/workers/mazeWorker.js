// Web Worker for parallel maze generation
// Uses CNN-inspired algorithm for procedural maze generation

self.onmessage = function(e) {
    const { type, startX, endX, startZ, endZ, size, complexity } = e.data;
    
    if (type === 'generate') {
        const mazeData = generateMazeChunk(startX, endX, startZ, endZ, size, complexity);
        self.postMessage({ 
            type: 'complete', 
            data: mazeData 
        });
    }
};

function generateMazeChunk(startX, endX, startZ, endZ, size, complexity) {
    const width = size;
    const height = Math.floor(size / 3);
    const depth = size;
    
    // Initialize 3D grid
    const cells = [];
    for (let x = 0; x < width; x++) {
        cells[x] = [];
        for (let y = 0; y < height; y++) {
            cells[x][y] = [];
            for (let z = 0; z < depth; z++) {
                cells[x][y][z] = {
                    isWall: true,
                    faces: { top: false, side: false, floor: false },
                    visited: false
                };
            }
        }
    }
    
    // CNN-inspired maze generation using cellular automata
    const iterations = Math.floor(5 + complexity * 5);
    
    for (let iter = 0; iter < iterations; iter++) {
        const newCells = JSON.parse(JSON.stringify(cells));
        
        for (let x = startX; x < endX; x++) {
            for (let y = 0; y < height; y++) {
                for (let z = startZ; z < endZ; z++) {
                    const neighborCount = countWallNeighbors(cells, x, y, z, width, height, depth);
                    
                    // CNN-like activation function
                    const activation = neighborCount / 26; // Max 26 neighbors in 3D
                    const threshold = 0.5 - (complexity * 0.2);
                    
                    if (activation > threshold) {
                        newCells[x][y][z].isWall = true;
                    } else {
                        newCells[x][y][z].isWall = false;
                    }
                    
                    // Progress reporting
                    const total = (endX - startX) * height * (endZ - startZ);
                    const current = (x - startX) * height * (endZ - startZ) + 
                                   y * (endZ - startZ) + (z - startZ);
                    
                    if (current % 100 === 0) {
                        self.postMessage({
                            type: 'progress',
                            progress: current,
                            total: total
                        });
                    }
                }
            }
        }
        
        // Update cells for next iteration
        for (let x = startX; x < endX; x++) {
            for (let y = 0; y < height; y++) {
                for (let z = startZ; z < endZ; z++) {
                    cells[x][y][z].isWall = newCells[x][y][z].isWall;
                }
            }
        }
    }
    
    // Ensure borders are walls
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            for (let z = 0; z < depth; z++) {
                if (x === 0 || x === width - 1 || 
                    y === 0 || y === height - 1 || 
                    z === 0 || z === depth - 1) {
                    cells[x][y][z].isWall = true;
                }
                
                // Determine which faces to render
                cells[x][y][z].faces = determineFaces(cells, x, y, z, width, height, depth);
            }
        }
    }
    
    // Create passages (CNN-inspired path finding)
    createPassages(cells, width, height, depth, complexity);
    
    return { width, height, depth, cells };
}

function countWallNeighbors(cells, x, y, z, width, height, depth) {
    let count = 0;
    
    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            for (let dz = -1; dz <= 1; dz++) {
                if (dx === 0 && dy === 0 && dz === 0) continue;
                
                const nx = x + dx;
                const ny = y + dy;
                const nz = z + dz;
                
                if (nx >= 0 && nx < width && 
                    ny >= 0 && ny < height && 
                    nz >= 0 && nz < depth) {
                    if (cells[nx][ny][nz].isWall) {
                        count++;
                    }
                } else {
                    count++; // Count out of bounds as walls
                }
            }
        }
    }
    
    return count;
}

function determineFaces(cells, x, y, z, width, height, depth) {
    const faces = { top: false, side: false, floor: false };
    
    // Check if this cell should show its top face
    if (y + 1 < height && !cells[x][y + 1][z].isWall) {
        faces.top = true;
    }
    
    // Check if this cell should show its side face
    const hasSideNeighbor = 
        (x + 1 < width && !cells[x + 1][y][z].isWall) ||
        (x - 1 >= 0 && !cells[x - 1][y][z].isWall) ||
        (z + 1 < depth && !cells[x][y][z + 1].isWall) ||
        (z - 1 >= 0 && !cells[x][y][z - 1].isWall);
    
    if (hasSideNeighbor) {
        faces.side = true;
    }
    
    // Check if this cell should show its floor face
    if (y - 1 >= 0 && !cells[x][y - 1][z].isWall) {
        faces.floor = true;
    }
    
    return faces;
}

function createPassages(cells, width, height, depth, complexity) {
    // Simple passage creation using random walk
    const passageCount = Math.floor((width * height * depth) * complexity * 0.1);
    
    for (let i = 0; i < passageCount; i++) {
        let x = Math.floor(Math.random() * (width - 2)) + 1;
        let y = Math.floor(Math.random() * (height - 2)) + 1;
        let z = Math.floor(Math.random() * (depth - 2)) + 1;
        
        const walkLength = Math.floor(Math.random() * 10) + 5;
        
        for (let j = 0; j < walkLength; j++) {
            cells[x][y][z].isWall = false;
            
            // Random direction
            const dir = Math.floor(Math.random() * 6);
            switch (dir) {
                case 0: x = Math.min(x + 1, width - 2); break;
                case 1: x = Math.max(x - 1, 1); break;
                case 2: y = Math.min(y + 1, height - 2); break;
                case 3: y = Math.max(y - 1, 1); break;
                case 4: z = Math.min(z + 1, depth - 2); break;
                case 5: z = Math.max(z - 1, 1); break;
            }
        }
    }
}
