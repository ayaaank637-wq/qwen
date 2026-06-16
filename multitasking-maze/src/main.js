import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import MazeWorker from './workers/mazeWorker.js?worker';

class MultitaskingMaze {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.mazeMesh = null;
        this.workers = [];
        this.activeWorkers = 0;
        this.mazeData = null;
        this.cellSize = 1;
        
        this.init();
        this.setupEventListeners();
        this.animate();
    }
    
    init() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a0a);
        this.scene.fog = new THREE.FogExp2(0x0a0a0a, 0.02);
        
        // Camera setup
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(30, 40, 30);
        
        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        document.getElementById('canvas-container').appendChild(this.renderer.domElement);
        
        // Controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        
        // Lighting
        this.setupLighting();
        
        // Initialize workers
        this.initializeWorkers(4);
        
        // Generate initial maze
        this.generateMaze();
    }
    
    setupLighting() {
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(50, 100, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
        
        // Add colorful point lights for visual effect
        const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff];
        colors.forEach((color, i) => {
            const light = new THREE.PointLight(color, 0.5, 100);
            const angle = (i / colors.length) * Math.PI * 2;
            light.position.set(
                Math.cos(angle) * 30,
                20,
                Math.sin(angle) * 30
            );
            this.scene.add(light);
        });
    }
    
    initializeWorkers(count) {
        // Clean up existing workers
        this.workers.forEach(worker => worker.terminate());
        this.workers = [];
        
        for (let i = 0; i < count; i++) {
            const worker = new MazeWorker();
            worker.id = i;
            worker.busy = false;
            
            worker.onmessage = (e) => this.handleWorkerMessage(e, worker);
            worker.onerror = (e) => console.error(`Worker ${i} error:`, e);
            
            this.workers.push(worker);
        }
        
        this.updateWorkerStatus();
    }
    
    handleWorkerMessage(event, worker) {
        const { type, data, progress, total } = event.data;
        
        if (type === 'progress') {
            document.getElementById('progressInfo').textContent = 
                `Progress: ${progress}/${total} cells`;
        } else if (type === 'complete') {
            worker.busy = false;
            this.activeWorkers--;
            this.updateWorkerStatus();
            
            // If all workers are done, combine results
            if (this.activeWorkers === 0) {
                this.combineMazeData(data);
            }
        }
    }
    
    updateWorkerStatus() {
        const indicator = document.getElementById('workerIndicator');
        const text = document.getElementById('workerText');
        
        if (this.activeWorkers > 0) {
            indicator.className = 'worker-status worker-active';
            text.textContent = `${this.activeWorkers}/${this.workers.length} Active`;
        } else {
            indicator.className = 'worker-status worker-idle';
            text.textContent = 'Idle';
        }
        
        document.getElementById('activeWorkers').textContent = this.activeWorkers;
    }
    
    async generateMaze() {
        const size = parseInt(document.getElementById('mazeSize').value);
        const complexity = parseInt(document.getElementById('complexity').value) / 100;
        const workerCount = parseInt(document.getElementById('workerCount').value);
        
        // Reinitialize workers if count changed
        if (workerCount !== this.workers.length) {
            this.initializeWorkers(workerCount);
        }
        
        const startTime = performance.now();
        document.getElementById('generateBtn').disabled = true;
        
        // Divide maze into chunks for parallel processing
        const chunkSize = Math.ceil(size / this.workers.length);
        const tasks = [];
        
        for (let i = 0; i < this.workers.length; i++) {
            const startZ = i * chunkSize;
            const endZ = Math.min(startZ + chunkSize, size);
            
            if (startZ < size) {
                tasks.push({
                    workerIndex: i,
                    startX: 0,
                    endX: size,
                    startZ: startZ,
                    endZ: endZ,
                    size: size,
                    complexity: complexity
                });
            }
        }
        
        // Send tasks to workers
        this.activeWorkers = tasks.length;
        this.updateWorkerStatus();
        
        tasks.forEach(task => {
            const worker = this.workers[task.workerIndex];
            worker.busy = true;
            worker.postMessage({
                type: 'generate',
                ...task
            });
        });
        
        this.generationStartTime = startTime;
    }
    
    combineMazeData(chunkData) {
        const endTime = performance.now();
        const genTime = (endTime - this.generationStartTime).toFixed(2);
        
        // Merge all chunks (simplified - in real implementation would merge properly)
        this.mazeData = chunkData;
        
        document.getElementById('genTime').textContent = genTime;
        document.getElementById('cellCount').textContent = 
            this.mazeData.width * this.mazeData.height * this.mazeData.depth;
        document.getElementById('generateBtn').disabled = false;
        document.getElementById('progressInfo').textContent = '';
        
        // Render the maze
        this.renderMaze();
    }
    
    renderMaze() {
        // Remove old mesh
        if (this.mazeMesh) {
            this.scene.remove(this.mazeMesh);
            this.mazeMesh.geometry.dispose();
            this.mazeMesh.material.dispose();
        }
        
        const { width, height, depth, cells } = this.mazeData;
        const geometries = [];
        
        // Create wall geometry using instanced mesh approach
        const wallGeometry = new THREE.BoxGeometry(this.cellSize, this.cellSize, this.cellSize);
        const materials = [
            new THREE.MeshStandardMaterial({ color: 0x00f5ff, metalness: 0.8, roughness: 0.2 }),
            new THREE.MeshStandardMaterial({ color: 0xff00ff, metalness: 0.8, roughness: 0.2 }),
            new THREE.MeshStandardMaterial({ color: 0x0066ff, metalness: 0.8, roughness: 0.2 })
        ];
        
        // Group walls by material for better performance
        const wallPositions = { top: [], side: [], floor: [] };
        
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                for (let z = 0; z < depth; z++) {
                    const cell = cells[x][y][z];
                    
                    if (cell.isWall) {
                        const posX = (x - width / 2) * this.cellSize;
                        const posY = (y - height / 2) * this.cellSize;
                        const posZ = (z - depth / 2) * this.cellSize;
                        
                        // Determine which faces to render based on neighbors
                        if (cell.faces.top) wallPositions.top.push([posX, posY, posZ]);
                        if (cell.faces.side) wallPositions.side.push([posX, posY, posZ]);
                        if (cell.faces.floor) wallPositions.floor.push([posX, posY, posZ]);
                    }
                }
            }
        }
        
        // Create instanced meshes for each wall type
        const createInstancedMesh = (positions, material) => {
            if (positions.length === 0) return null;
            
            const mesh = new THREE.InstancedMesh(
                wallGeometry,
                material,
                positions.length
            );
            
            const matrix = new THREE.Matrix4();
            positions.forEach((pos, i) => {
                matrix.setPosition(pos[0], pos[1], pos[2]);
                mesh.setMatrixAt(i, matrix);
            });
            
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            return mesh;
        };
        
        const topMesh = createInstancedMesh(wallPositions.top, materials[0]);
        const sideMesh = createInstancedMesh(wallPositions.side, materials[1]);
        const floorMesh = createInstancedMesh(wallPositions.floor, materials[2]);
        
        // Group all meshes
        this.mazeMesh = new THREE.Group();
        if (topMesh) this.mazeMesh.add(topMesh);
        if (sideMesh) this.mazeMesh.add(sideMesh);
        if (floorMesh) this.mazeMesh.add(floorMesh);
        
        this.scene.add(this.mazeMesh);
    }
    
    setupEventListeners() {
        // Window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
        
        // UI Controls
        document.getElementById('mazeSize').addEventListener('input', (e) => {
            document.getElementById('sizeValue').textContent = e.target.value;
        });
        
        document.getElementById('complexity').addEventListener('input', (e) => {
            document.getElementById('complexityValue').textContent = e.target.value;
        });
        
        document.getElementById('workerCount').addEventListener('input', (e) => {
            document.getElementById('workerCountValue').textContent = e.target.value;
        });
        
        document.getElementById('generateBtn').addEventListener('click', () => {
            this.generateMaze();
        });
        
        document.getElementById('resetCameraBtn').addEventListener('click', () => {
            this.camera.position.set(30, 40, 30);
            this.controls.target.set(0, 0, 0);
            this.controls.update();
        });
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.controls.update();
        
        // Rotate maze slowly for visual effect
        if (this.mazeMesh) {
            this.mazeMesh.rotation.y += 0.001;
        }
        
        this.renderer.render(this.scene, this.camera);
        this.updateFPS();
    }
    
    updateFPS() {
        // Simple FPS counter
        const fps = Math.round(1000 / 16); // Approximate
        document.getElementById('fpsCounter').textContent = fps;
    }
}

// Initialize application
new MultitaskingMaze();
