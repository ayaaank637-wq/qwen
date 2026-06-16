# Multitasking 3D Maze - CNN-Inspired Generator

A cutting-edge 3D maze visualization project that leverages **multitasking** through Web Workers, inspired by **CNN (Convolutional Neural Networks)** cellular automata algorithms for procedural generation.

## 🌟 Features

- **Multitasking Architecture**: Uses multiple Web Workers for parallel maze generation
- **CNN-Inspired Algorithm**: Cellular automata-based maze generation similar to CNN convolution operations
- **3D Visualization**: Real-time 3D rendering with Three.js
- **Multi-Language Support**: JavaScript/TypeScript frontend with Python backend utilities
- **Real-time Statistics**: FPS counter, generation time, worker status monitoring
- **Customizable Parameters**: Adjust maze size, complexity, and worker count
- **Instanced Rendering**: Optimized GPU rendering for thousands of maze cells

## 🏗️ Project Structure

```
multitasking-maze/
├── index.html              # Main HTML file
├── package.json            # Node.js dependencies
├── vite.config.js          # Vite build configuration
├── src/
│   ├── main.js             # Main application logic & 3D rendering
│   └── workers/
│       └── mazeWorker.js   # Web Worker for parallel maze generation
├── python-utils/
│   └── maze_generator.py   # Python maze generation utilities
└── public/                 # Static assets
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- Modern web browser with WebGL support
- Python 3.8+ (optional, for Python utilities)

### Installation

```bash
cd multitasking-maze
npm install
```

### Development

```bash
npm run dev
```

This will start a local development server at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

## 🎮 Controls

- **Mouse Drag**: Rotate camera around the maze
- **Mouse Wheel**: Zoom in/out
- **Generate Maze**: Create a new procedurally generated maze
- **Reset Camera**: Return to default camera position

## ⚙️ Configuration

### Maze Size (11-51)
Controls the dimensions of the maze. Larger sizes create more complex mazes but require more processing power.

### Complexity (10-100%)
Adjusts the density of walls and passages. Higher complexity creates more intricate patterns.

### Web Workers (1-8)
Number of parallel workers for maze generation. More workers = faster generation on multi-core systems.

## 🔬 Technical Details

### CNN-Inspired Algorithm

The maze generation uses cellular automata principles similar to CNN convolutional layers:

1. **Initialization**: 3D grid of cells (wall or passage)
2. **Convolution Step**: Count wall neighbors for each cell (26 neighbors in 3D)
3. **Activation Function**: Apply threshold based on neighbor count
4. **Iteration**: Repeat for multiple passes to evolve the maze structure

### Multitasking Architecture

- **Main Thread**: Handles 3D rendering, UI, and user input
- **Web Workers**: Parallel maze computation divided into spatial chunks
- **Message Passing**: Asynchronous communication between main thread and workers
- **Progress Tracking**: Real-time updates during generation

### Performance Optimizations

- **Instanced Mesh Rendering**: Thousands of cells rendered efficiently
- **Face Culling**: Only render visible faces of each cell
- **Worker Pool**: Reusable worker instances
- **Adaptive Chunking**: Dynamic workload distribution

## 📊 Performance Metrics

The application displays real-time statistics:

- **FPS**: Frames per second for smooth rendering
- **Cell Count**: Total number of cells in the maze
- **Generation Time**: Time taken to generate the maze
- **Active Workers**: Number of workers currently processing

## 🛠️ Technologies Used

- **Three.js**: 3D graphics library
- **Vite**: Fast build tool and dev server
- **Web Workers API**: Background threading
- **ES Modules**: Modern JavaScript module system

## 📝 License

MIT License - Feel free to use this project for learning or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

---

**Note**: This project demonstrates multitasking principles across multiple technologies and languages, similar to how CNN processes information through parallel convolutions.
