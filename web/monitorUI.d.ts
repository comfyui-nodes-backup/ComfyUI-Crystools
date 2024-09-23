import { ProgressBarUIBase } from './progressBarUIBase.js';
export declare class MonitorUI extends ProgressBarUIBase {
    private monitorCPUElement;
    private monitorRAMElement;
    private monitorHDDElement;
    private monitorGPUSettings;
    private monitorVRAMSettings;
    private monitorTemperatureSettings;
    private currentRate;
    lastMonitor: number;
    styleSheet: HTMLStyleElement;
    constructor(monitorCPUElement: TMonitorSettings, monitorRAMElement: TMonitorSettings, monitorHDDElement: TMonitorSettings, monitorGPUSettings: TMonitorSettings[], monitorVRAMSettings: TMonitorSettings[], monitorTemperatureSettings: TMonitorSettings[], currentRate: number, showSection: boolean);
    createDOM: () => void;
    createDOMGPUMonitor: (monitorSettings?: TMonitorSettings) => void;
    orderMonitors: () => void;
    updateDisplay: (data: TStatsData) => void;
    updateMonitor: (monitorSettings: TMonitorSettings, percent: number, used?: number, total?: number) => void;
    updateAllAnimationDuration: (value: number) => void;
    updatedAnimationDuration: (monitorSettings: TMonitorSettings, value: number) => void;
    createMonitor: (monitorSettings?: TMonitorSettings) => HTMLDivElement;
    updateMonitorSize: (width: number, height: number) => void;
}
