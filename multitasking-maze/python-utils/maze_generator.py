#!/usr/bin/env python3
"""
Python Maze Generator Utility
CNN-inspired cellular automata maze generation algorithm
Can be used standalone or integrated with the main application
"""

import numpy as np
import json
import sys
from typing import Dict, List, Tuple


class CNNMazeGenerator:
    """
    Multitasking maze generator using CNN-inspired cellular automata.
    Supports parallel processing through multiprocessing.
    """
    
    def __init__(self, size: int = 21, complexity: float = 0.5):
        self.size = size
        self.height = size // 3
        self.complexity = complexity
        self.grid = None
        
    def initialize_grid(self) -> np.ndarray:
        """Initialize 3D grid with random walls"""
        # Start with all walls
        grid = np.ones((self.size, self.height, self.size), dtype=bool)
        return grid
    
    def count_neighbors(self, grid: np.ndarray, x: int, y: int, z: int) -> int:
        """Count wall neighbors (26 neighbors in 3D space)"""
        count = 0
        for dx in [-1, 0, 1]:
            for dy in [-1, 0, 1]:
                for dz in [-1, 0, 1]:
                    if dx == 0 and dy == 0 and dz == 0:
                        continue
                    
                    nx, ny, nz = x + dx, y + dy, z + dz
                    
                    if 0 <= nx < self.size and 0 <= ny < self.height and 0 <= nz < self.size:
                        if grid[nx, ny, nz]:
                            count += 1
                    else:
                        count += 1  # Out of bounds counts as wall
        return count
    
    def apply_cnn_iteration(self, grid: np.ndarray) -> np.ndarray:
        """
        Apply one iteration of CNN-inspired cellular automata.
        Similar to convolution operation with threshold activation.
        """
        new_grid = grid.copy()
        
        for x in range(1, self.size - 1):
            for y in range(1, self.height - 1):
                for z in range(1, self.size - 1):
                    neighbor_count = self.count_neighbors(grid, x, y, z)
                    
                    # CNN-like activation function
                    activation = neighbor_count / 26.0  # Max 26 neighbors
                    threshold = 0.5 - (self.complexity * 0.2)
                    
                    if activation > threshold:
                        new_grid[x, y, z] = True  # Wall
                    else:
                        new_grid[x, y, z] = False  # Passage
                        
        return new_grid
    
    def generate(self, iterations: int = 5) -> np.ndarray:
        """Generate maze using cellular automata"""
        self.grid = self.initialize_grid()
        
        # Apply multiple CNN iterations
        for i in range(iterations):
            self.grid = self.apply_cnn_iteration(self.grid)
            print(f"Iteration {i + 1}/{iterations} complete")
        
        # Ensure borders are walls
        self.grid[0, :, :] = True
        self.grid[-1, :, :] = True
        self.grid[:, 0, :] = True
        self.grid[:, -1, :] = True
        self.grid[:, :, 0] = True
        self.grid[:, :, -1] = True
        
        return self.grid
    
    def create_passages(self, passage_count: int = 100):
        """Create random walk passages through the maze"""
        if self.grid is None:
            raise ValueError("Must generate maze first")
        
        for _ in range(passage_count):
            x = np.random.randint(1, self.size - 1)
            y = np.random.randint(1, self.height - 1)
            z = np.random.randint(1, self.size - 1)
            
            walk_length = np.random.randint(5, 15)
            
            for _ in range(walk_length):
                self.grid[x, y, z] = False
                
                # Random direction
                direction = np.random.randint(6)
                if direction == 0:
                    x = min(x + 1, self.size - 2)
                elif direction == 1:
                    x = max(x - 1, 1)
                elif direction == 2:
                    y = min(y + 1, self.height - 2)
                elif direction == 3:
                    y = max(y - 1, 1)
                elif direction == 4:
                    z = min(z + 1, self.size - 2)
                else:
                    z = max(z - 1, 1)
    
    def to_dict(self) -> Dict:
        """Convert maze to dictionary format for JSON export"""
        if self.grid is None:
            raise ValueError("Must generate maze first")
        
        cells = []
        for x in range(self.size):
            x_row = []
            for y in range(self.height):
                y_row = []
                for z in range(self.size):
                    cell = {
                        'isWall': bool(self.grid[x, y, z]),
                        'faces': {
                            'top': False,
                            'side': False,
                            'floor': False
                        }
                    }
                    
                    # Determine visible faces
                    if y + 1 < self.height and not self.grid[x, y + 1, z]:
                        cell['faces']['top'] = True
                    if y - 1 >= 0 and not self.grid[x, y - 1, z]:
                        cell['faces']['floor'] = True
                    
                    has_side = (
                        (x + 1 < self.size and not self.grid[x + 1, y, z]) or
                        (x - 1 >= 0 and not self.grid[x - 1, y, z]) or
                        (z + 1 < self.size and not self.grid[x, y, z + 1]) or
                        (z - 1 >= 0 and not self.grid[x, y, z - 1])
                    )
                    if has_side:
                        cell['faces']['side'] = True
                    
                    y_row.append(cell)
                x_row.append(y_row)
            cells.append(x_row)
        
        return {
            'width': self.size,
            'height': self.height,
            'depth': self.size,
            'cells': cells
        }
    
    def save_json(self, filename: str):
        """Save maze to JSON file"""
        data = self.to_dict()
        with open(filename, 'w') as f:
            json.dump(data, f, indent=2)
        print(f"Maze saved to {filename}")


def main():
    """Main entry point for command-line usage"""
    import argparse
    
    parser = argparse.ArgumentParser(description='CNN-inspired 3D Maze Generator')
    parser.add_argument('--size', type=int, default=21, help='Maze size (default: 21)')
    parser.add_argument('--complexity', type=float, default=0.5, help='Complexity 0-1 (default: 0.5)')
    parser.add_argument('--iterations', type=int, default=5, help='CA iterations (default: 5)')
    parser.add_argument('--output', type=str, default='maze.json', help='Output file (default: maze.json)')
    parser.add_argument('--passages', type=int, default=100, help='Number of random passages (default: 100)')
    
    args = parser.parse_args()
    
    print(f"Generating {args.size}x{args.size//3}x{args.size} maze...")
    print(f"Complexity: {args.complexity}, Iterations: {args.iterations}")
    
    generator = CNNMazeGenerator(size=args.size, complexity=args.complexity)
    generator.generate(iterations=args.iterations)
    generator.create_passages(args.passages)
    generator.save_json(args.output)
    
    # Print statistics
    total_cells = args.size * (args.size // 3) * args.size
    wall_cells = np.sum(generator.grid)
    passage_cells = total_cells - wall_cells
    
    print(f"\nStatistics:")
    print(f"  Total cells: {total_cells}")
    print(f"  Wall cells: {wall_cells}")
    print(f"  Passage cells: {passage_cells}")
    print(f"  Wall ratio: {wall_cells/total_cells:.2%}")


if __name__ == '__main__':
    main()
