declare module 'https://unpkg.com/lil-gui@0.19.2/dist/lil-gui.esm.js' {
    export class GUI {
        constructor(options?: any);
        add(object: any, property: string, min?: number, max?: number, step?: number): any;
        addColor(object: any, property: string): any;
        addFolder(name: string): any;
        destroy(): void;
        hide(): void;
        show(): void;
        open(): void;
        close(): void;
        onFinishChange(callback: (value: any) => void): any;
    }
}

declare module 'https://unpkg.com/three@0.161.0/examples/jsm/controls/OrbitControls.js' {
    import * as THREE from 'three';
    
    export class OrbitControls {
        constructor(camera: THREE.Camera, domElement: HTMLElement);
        enabled: boolean;
        enableDamping: boolean;
        dampingFactor: number;
        enableZoom: boolean;
        enablePan: boolean;
        enableRotate: boolean;
        mouseButtons: {
            LEFT: number;
            MIDDLE: number;
            RIGHT: number;
        };
        touches: {
            ONE: number;
            TWO: number;
        };
        target: THREE.Vector3;
        maxDistance: number;
        minDistance: number;
        update(): void;
    }
}
