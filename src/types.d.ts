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
