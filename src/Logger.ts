export class Logger {
    private static instance: Logger;
    private logContainer!: HTMLElement;
    private maxLogs: number = 50;

    private constructor() {
        this.createLogContainer();
        this.overrideConsole();
    }

    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    private createLogContainer(): void {
        this.logContainer = document.createElement('div');
        this.logContainer.id = 'logger';
        this.logContainer.style.cssText = `
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 200px;
            background: rgba(0, 0, 0, 0.7);
            color: #00ff00;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            padding: 10px;
            overflow-y: auto;
            z-index: 1000;
            pointer-events: none;
            backdrop-filter: blur(5px);
        `;
        document.body.appendChild(this.logContainer);
    }

    private overrideConsole(): void {
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;
        const originalInfo = console.info;

        console.log = (...args: any[]): void => {
            this.addLog('LOG', args);
            originalLog.apply(console, args);
        };

        console.error = (...args: any[]): void => {
            this.addLog('ERROR', args, '#ff0000');
            originalError.apply(console, args);
        };

        console.warn = (...args: any[]): void => {
            this.addLog('WARN', args, '#ffff00');
            originalWarn.apply(console, args);
        };

        console.info = (...args: any[]): void => {
            this.addLog('INFO', args, '#00ffff');
            originalInfo.apply(console, args);
        };
    }

    private addLog(level: string, args: any[], color: string = '#00ff00'): void {
        const timestamp = new Date().toLocaleTimeString();
        const message = args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ');

        const logEntry = document.createElement('div');
        logEntry.style.cssText = `
            margin-bottom: 2px;
            color: ${color};
            word-wrap: break-word;
        `;
        logEntry.textContent = `[${timestamp}] ${level}: ${message}`;

        this.logContainer.appendChild(logEntry);

        // Keep only the last maxLogs entries
        while (this.logContainer.children.length > this.maxLogs) {
            this.logContainer.removeChild(this.logContainer.firstChild!);
        }

        // Auto-scroll to bottom
        this.logContainer.scrollTop = this.logContainer.scrollHeight;
    }

    public clear(): void {
        this.logContainer.innerHTML = '';
    }

    public setMaxLogs(max: number): void {
        this.maxLogs = max;
    }
}
