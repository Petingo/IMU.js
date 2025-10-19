import * as THREE from 'three';

export interface AnchorPoint {
    position: THREE.Vector3;
    mesh: THREE.Mesh;
    isActive: boolean;
    capturedImage?: string;
    imageMesh?: THREE.Mesh;
}

export class AnchorManager {
    private static instance: AnchorManager;
    private anchorPoints: AnchorPoint[] = [];
    private sphereRadius: number = 15;
    private currentTargetAnchor: AnchorPoint | null = null;
    private stillnessTimer: number = 0;
    private lastCheckTime: number = 0;
    private checkInterval: number = 100; // Check every 100ms instead of every frame

    private constructor() {}

    public static getInstance(): AnchorManager {
        if (!AnchorManager.instance) {
            AnchorManager.instance = new AnchorManager();
        }
        return AnchorManager.instance;
    }

    public createAnchorPoints(scene: THREE.Scene): void {
        const anchorGeometry = new THREE.SphereGeometry(0.3, 8, 6);
        const anchorMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        
        const sectionY = [
            Math.sin(Math.PI * 0.4),
            Math.sin(Math.PI * 0.25),
            0
        ]

        const anchorPoints = [];
        for (let i = 0; i < sectionY.length; i++) {
            const y = sectionY[i] * this.sphereRadius;
            
            for (let j = 0; j < 3; j++) {
                const angle = (j / 3) * Math.PI * 2;
                const x = Math.cos(angle) * this.sphereRadius;
                const z = - Math.sin(angle) * this.sphereRadius;

                anchorPoints.push([x, y, z]);
                anchorPoints.push([x, -y, z]);
            }

            for (let j = 0; j < 9 ; j++){
                const angle = (j / 9) * Math.PI * 2;
                const x = Math.cos(angle) * this.sphereRadius;
                const z = - Math.sin(angle) * this.sphereRadius;

                anchorPoints.push([x, y, z]);
                anchorPoints.push([x, -y, z]);
            }

            for (let j = 0; j < 12 ; j++){
                const angle = (j / 12) * Math.PI * 2;
                const x = Math.cos(angle) * this.sphereRadius;
                const z = - Math.sin(angle) * this.sphereRadius;

                anchorPoints.push([x, y, z]);
            }
        }

        for (const anchorPoint of anchorPoints) {
            const anchorMesh = new THREE.Mesh(anchorGeometry, anchorMaterial.clone());
            anchorMesh.position.set(anchorPoint[0], anchorPoint[1], anchorPoint[2]);
            scene.add(anchorMesh);
            
            this.anchorPoints.push({
                position: new THREE.Vector3(anchorPoint[0], anchorPoint[1], anchorPoint[2]),
                mesh: anchorMesh,
                isActive: false
            });
        }
    }

    public getAlignmentScore(anchor: AnchorPoint, camera: THREE.Camera): number {
        // Get camera direction (where camera is looking)
        const cameraDirection = new THREE.Vector3();
        camera.getWorldDirection(cameraDirection);
        
        // Get direction from camera to anchor point
        const anchorDirection = new THREE.Vector3().subVectors(anchor.position, camera.position).normalize();
        
        // Calculate how aligned the camera is with the anchor
        const dotProduct = cameraDirection.dot(anchorDirection);
        
        return dotProduct;
    }

    public updateAlignment(camera: THREE.Camera, cameraState: { isActive: boolean }): void {
        const currentTime = Date.now();
        
        // Only do expensive calculations periodically
        if (cameraState.isActive && (currentTime - this.lastCheckTime) > this.checkInterval) {
            this.lastCheckTime = currentTime;
            
            // First, reset all anchors to green
            for (const anchor of this.anchorPoints) {
                if (anchor.isActive) {
                    (anchor.mesh.material as THREE.MeshBasicMaterial).color.setHex(0x00ff00);
                    anchor.isActive = false;
                }
            }
            
            // Find the anchor with the highest alignment score
            let bestAlignment = 0;
            let bestAnchor: AnchorPoint | null = null;
            
            for (const anchor of this.anchorPoints) {
                const alignment = this.getAlignmentScore(anchor, camera);
                if (alignment > bestAlignment) {
                    bestAlignment = alignment;
                    bestAnchor = anchor;
                }
            }
            
            // Only activate the best anchor if it meets the threshold
            if (bestAnchor && bestAlignment > 0.9) {
                (bestAnchor.mesh.material as THREE.MeshBasicMaterial).color.setHex(0xff0000);
                bestAnchor.isActive = true;
                this.currentTargetAnchor = bestAnchor;
                this.stillnessTimer = 0;
            } else {
                this.currentTargetAnchor = null;
                this.stillnessTimer = 0;
            }
        }
    }

    public updatePhotoCapture(cameraState: { isActive: boolean }, capturePhoto: () => string | null, renderImageOnAnchor: (anchor: AnchorPoint, imageData: string) => void): void {
        // Check for photo capture every frame for accurate timing
        if (this.currentTargetAnchor) {
            this.stillnessTimer += 16; // 60fps timing
            
            if (this.stillnessTimer >= 1000) {
                console.log('Attempting to capture photo...');
                const photo = capturePhoto();
                if (photo) {
                    console.log('Photo captured successfully');
                    // Remove old image if it exists
                    if (this.currentTargetAnchor.imageMesh) {
                        // Note: We need to pass scene reference to remove from scene
                        // This will be handled by the caller
                    }
                    renderImageOnAnchor(this.currentTargetAnchor, photo);
                    console.log('Photo captured and rendered on anchor point');
                    
                    // Reset the timer to prevent immediate re-capture
                    this.stillnessTimer = 0;
                } else {
                    console.log('Photo capture failed');
                }
            }
        } else {
            // Reset timer when no target
            this.stillnessTimer = 0;
        }
    }

    public getCurrentTargetAnchor(): AnchorPoint | null {
        return this.currentTargetAnchor;
    }

    public getAnchorPoints(): AnchorPoint[] {
        return this.anchorPoints;
    }
}
