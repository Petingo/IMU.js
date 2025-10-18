export class PhotoCapture {
    private static instance: PhotoCapture;
    private isCapturing: boolean = false;

    private constructor() {}

    public static getInstance(): PhotoCapture {
        if (!PhotoCapture.instance) {
            PhotoCapture.instance = new PhotoCapture();
        }
        return PhotoCapture.instance;
    }

    public async captureHighResPhoto(): Promise<void> {
        if (this.isCapturing) {
            console.log('Photo capture already in progress');
            return;
        }

        this.isCapturing = true;
        
        try {
            console.log('Starting high-resolution photo capture...');
            
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    width: { ideal: 4000 },
                    height: { ideal: 3000 },
                    facingMode: 'environment' // Use back camera
                }
            });
            
            const track = stream.getVideoTracks()[0];
            const imageCapture = new ImageCapture(track);

            // Take a high-res photo
            const blob = await imageCapture.takePhoto();
            console.log("Captured photo size:", blob.size);

            // Create download link
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `photo_${new Date().toISOString().replace(/[:.]/g, '-')}.jpg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            // Clean up
            track.stop();
            
            console.log("Photo downloaded successfully!");
        } catch (error) {
            console.error("Error capturing photo:", error);
            throw new Error(`Photo capture failed: ${error}`);
        } finally {
            this.isCapturing = false;
        }
    }

    public isCurrentlyCapturing(): boolean {
        return this.isCapturing;
    }
}
