import * as THREE from 'three';

export interface CameraState {
    stream: MediaStream | null;
    video: HTMLVideoElement | null;
    isActive: boolean;
}

export class PhotoCaptureManager {
    private static instance: PhotoCaptureManager;
    private cameraState: CameraState = {
        stream: null,
        video: null,
        isActive: false
    };

    private constructor() {}

    public static getInstance(): PhotoCaptureManager {
        if (!PhotoCaptureManager.instance) {
            PhotoCaptureManager.instance = new PhotoCaptureManager();
        }
        return PhotoCaptureManager.instance;
    }

    public async requestCameraAccess(): Promise<boolean> {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    facingMode: 'environment', // Use back camera
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                } 
            });
            
            this.cameraState.stream = stream;
            this.cameraState.isActive = true;
            
            // Create video element for photo capture
            const video = document.createElement('video');
            video.srcObject = stream;
            video.play();
            this.cameraState.video = video;
            
            console.log('Camera access granted');
            return true;
        } catch (error) {
            console.log('Camera access denied:', error);
            return false;
        }
    }

    public capturePhoto(): string | null {
        if (!this.cameraState.video || !this.cameraState.isActive) {
            console.log('Camera not ready for photo capture');
            return null;
        }
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (!context) {
            console.log('Failed to get canvas context');
            return null;
        }
        
        canvas.width = this.cameraState.video.videoWidth;
        canvas.height = this.cameraState.video.videoHeight;
        
        context.drawImage(this.cameraState.video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg');
        console.log('Photo captured, size:', canvas.width, 'x', canvas.height);
        return imageData;
    }

    public renderImageOnAnchor(anchor: any, imageData: string, scene: THREE.Scene): void {
        console.log('Starting to render image on anchor');
        
        // Create a simple plane geometry first
        const imageGeometry = new THREE.PlaneGeometry(4, 4);
        
        // Create material with the texture
        const imageMaterial = new THREE.MeshBasicMaterial({ 
            transparent: true,
            side: THREE.DoubleSide
        });
        
        const imageMesh = new THREE.Mesh(imageGeometry, imageMaterial);
        
        // Position the image to face the center of the sphere
        const direction = new THREE.Vector3().subVectors(new THREE.Vector3(0, 0, 0), anchor.position).normalize();
        imageMesh.position.copy(anchor.position).add(direction.multiplyScalar(1.0));
        imageMesh.lookAt(0, 0, 0);
        
        // Load texture and apply it
        const texture = new THREE.TextureLoader().load(imageData, (loadedTexture) => {
            console.log('Texture loaded successfully');
            // Update the material with the loaded texture
            imageMaterial.map = loadedTexture;
            imageMaterial.needsUpdate = true;
            
            // Update geometry with correct aspect ratio
            const aspectRatio = loadedTexture.image.width / loadedTexture.image.height;
            const imageSize = 4;
            imageMesh.geometry.dispose();
            imageMesh.geometry = new THREE.PlaneGeometry(
                imageSize * aspectRatio,
                imageSize
            );
            
            console.log('Image rendered at position:', imageMesh.position);
            console.log('Image size:', imageSize * aspectRatio, 'x', imageSize);
        });
        
        scene.add(imageMesh);
        anchor.imageMesh = imageMesh;
        anchor.capturedImage = imageData;
        
        console.log('Image mesh added to scene');
    }

    public getCameraState(): CameraState {
        return this.cameraState;
    }

    public isCameraActive(): boolean {
        return this.cameraState.isActive;
    }

    public stopCamera(): void {
        if (this.cameraState.stream) {
            this.cameraState.stream.getTracks().forEach(track => track.stop());
            this.cameraState.stream = null;
            this.cameraState.video = null;
            this.cameraState.isActive = false;
            console.log('Camera stopped');
        }
    }
}
