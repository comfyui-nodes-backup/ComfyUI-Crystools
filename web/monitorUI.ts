import { ProgressBarUIBase } from './progressBarUIBase.js';
import { createStyleSheet, formatBytes } from './utils.js';

export class MonitorUI extends ProgressBarUIBase {
  lastMonitor = 1; // just for order on monitors section
  styleSheet: HTMLStyleElement;

  constructor(
    private monitorCPUElement: TMonitorSettings,
    private monitorRAMElement: TMonitorSettings,
    private monitorHDDElement: TMonitorSettings,
    private monitorGPUSettings: TMonitorSettings[],
    private monitorVRAMSettings: TMonitorSettings[],
    private monitorTemperatureSettings: TMonitorSettings[],
    private currentRate: number,
    showSection: boolean,
  ) {
    super('queue-button', 'crystools-root', showSection);
    this.createDOM();

    this.styleSheet = createStyleSheet('crystools-monitors-size');
  }

  createDOM = (): void => {
    this.htmlContainer.style.order = '2';
    this.htmlContainer.append(this.createMonitor(this.monitorCPUElement));
    this.htmlContainer.append(this.createMonitor(this.monitorRAMElement));
    this.htmlContainer.append(this.createMonitor(this.monitorHDDElement));
    this.updateAllAnimationDuration(this.currentRate);
  };

  createDOMGPUMonitor = (monitorSettings?: TMonitorSettings): void => {
    if (!monitorSettings) {
      return;
    }

    this.htmlContainer.append(this.createMonitor(monitorSettings));
    this.updateAllAnimationDuration(this.currentRate);
  };

  orderMonitors = (): void => {
    try {
      // @ts-ignore
      this.monitorCPUElement.htmlMonitorRef.style.order = '' + this.lastMonitor++;
      // @ts-ignore
      this.monitorRAMElement.htmlMonitorRef.style.order = ''+ this.lastMonitor++;
      // @ts-ignore
      this.monitorGPUSettings.forEach((_monitorSettings, index) => {
        // @ts-ignore
        this.monitorGPUSettings[index].htmlMonitorRef.style.order = ''+ this.lastMonitor++;
        // @ts-ignore
        this.monitorVRAMSettings[index].htmlMonitorRef.style.order = ''+ this.lastMonitor++;
        // @ts-ignore
        this.monitorTemperatureSettings[index].htmlMonitorRef.style.order = ''+ this.lastMonitor++;
      });
      // @ts-ignore
      this.monitorHDDElement.htmlMonitorRef.style.order = ''+ this.lastMonitor++;
    } catch (error) {
      console.error('orderMonitors', error);
    }
  };

  updateDisplay = (data: TStatsData): void => {
    this.updateMonitor(this.monitorCPUElement, data.cpu_utilization);
    this.updateMonitor(this.monitorRAMElement, data.ram_used_percent, data.ram_used, data.ram_total);
    this.updateMonitor(this.monitorHDDElement, data.hdd_used_percent, data.hdd_used, data.hdd_total);

    if (data.gpus === undefined || data.gpus.length === 0) {
      console.warn('UpdateAllMonitors: no GPU data');
      return;
    }

    this.monitorGPUSettings.forEach((monitorSettings, index) => {
      if (data.gpus[index]) {
        const gpu = data.gpus[index];
        if (gpu === undefined) {
          // console.error('UpdateAllMonitors: no GPU data for index', index);
          return;
        }

        this.updateMonitor(monitorSettings, gpu.gpu_utilization);
      } else {
        // console.error('UpdateAllMonitors: no GPU data for index', index);
      }
    });

    this.monitorVRAMSettings.forEach((monitorSettings, index) => {
      if (data.gpus[index]) {
        const gpu = data.gpus[index];
        if (gpu === undefined) {
          // console.error('UpdateAllMonitors: no GPU VRAM data for index', index);
          return;
        }

        this.updateMonitor(monitorSettings, gpu.vram_used_percent, gpu.vram_used, gpu.vram_total);
      } else {
        // console.error('UpdateAllMonitors: no GPU VRAM data for index', index);
      }
    });

    this.monitorTemperatureSettings.forEach((monitorSettings, index) => {
      if (data.gpus[index]) {
        const gpu = data.gpus[index];
        if (gpu === undefined) {
          // console.error('UpdateAllMonitors: no GPU VRAM data for index', index);
          return;
        }

        this.updateMonitor(monitorSettings, gpu.gpu_temperature);
        if (monitorSettings.cssColorFinal && monitorSettings.htmlMonitorSliderRef) {
          monitorSettings.htmlMonitorSliderRef.style.backgroundColor =
            `color-mix(in srgb, ${monitorSettings.cssColorFinal} ${gpu.gpu_temperature}%, ${monitorSettings.cssColor})`;
        }
      } else {
        // console.error('UpdateAllMonitors: no GPU VRAM data for index', index);
      }
    });
  };

  // eslint-disable-next-line complexity
  updateMonitor = (monitorSettings: TMonitorSettings, percent: number, used?: number, total?: number): void => {
    if (!this.showSection) {
      return;
    }

    if (!(monitorSettings.htmlMonitorSliderRef && monitorSettings.htmlMonitorLabelRef)) {
      return;
    }

    if (percent < 0) {
      return;
    }

    // console.log('updateMonitor', monitorSettings.id, percent);
    const prefix = monitorSettings.monitorTitle ? monitorSettings.monitorTitle + ' - ' : '';
    let title = `${Math.floor(percent)}${monitorSettings.symbol}`;
    let postfix = '';

    if(used !== undefined && total !== undefined) {
      postfix = ` - ${formatBytes(used)} / ${formatBytes(total)} GB`;
    }
    title = `${prefix}${title}${postfix}`;

    if(monitorSettings.htmlMonitorRef){
      monitorSettings.htmlMonitorRef.title = title;
    }
    monitorSettings.htmlMonitorLabelRef.innerHTML = `${Math.floor(percent)}${monitorSettings.symbol}`;
    monitorSettings.htmlMonitorSliderRef.style.width = `${Math.floor(percent)}%`;
  };

  updateAllAnimationDuration = (value: number): void => {
    this.updatedAnimationDuration(this.monitorCPUElement, value);
    this.updatedAnimationDuration(this.monitorRAMElement, value);
    this.updatedAnimationDuration(this.monitorHDDElement, value);
    this.monitorGPUSettings.forEach((monitorSettings) => {
      monitorSettings && this.updatedAnimationDuration(monitorSettings, value);
    });
    this.monitorVRAMSettings.forEach((monitorSettings) => {
      monitorSettings && this.updatedAnimationDuration(monitorSettings, value);
    });
    this.monitorTemperatureSettings.forEach((monitorSettings) => {
      monitorSettings && this.updatedAnimationDuration(monitorSettings, value);
    });
  };

  updatedAnimationDuration = (monitorSettings: TMonitorSettings, value: number): void => {
    const slider = monitorSettings.htmlMonitorSliderRef;
    if (!slider) {
      return;
    }

    slider.style.transition = `width ${value.toFixed(1)}s`;
  };

  createMonitor = (monitorSettings?: TMonitorSettings): HTMLDivElement => {
    if (!monitorSettings) {
      // just for typescript
      return document.createElement('div');
    }

    const htmlMain = document.createElement('div');
    htmlMain.classList.add(monitorSettings.id);
    htmlMain.classList.add('crystools-monitor');

    monitorSettings.htmlMonitorRef = htmlMain;

    if (monitorSettings.title) {
      htmlMain.title = monitorSettings.title;
    }

    const htmlMonitorText = document.createElement('div');
    htmlMonitorText.classList.add('crystools-text');
    htmlMonitorText.innerHTML = monitorSettings.label;
    htmlMain.append(htmlMonitorText);

    const htmlMonitorContent = document.createElement('div');
    htmlMonitorContent.classList.add('crystools-content');
    htmlMain.append(htmlMonitorContent);

    const htmlMonitorSlider = document.createElement('div');
    htmlMonitorSlider.classList.add('crystools-slider');
    if (monitorSettings.cssColorFinal) {
      htmlMonitorSlider.style.backgroundColor =
        `color-mix(in srgb, ${monitorSettings.cssColorFinal} 0%, ${monitorSettings.cssColor})`;
    } else {
      htmlMonitorSlider.style.backgroundColor = monitorSettings.cssColor;
    }
    monitorSettings.htmlMonitorSliderRef = htmlMonitorSlider;
    htmlMonitorContent.append(htmlMonitorSlider);

    const htmlMonitorLabel = document.createElement('div');
    htmlMonitorLabel.classList.add('crystools-label');
    monitorSettings.htmlMonitorLabelRef = htmlMonitorLabel;
    htmlMonitorContent.append(htmlMonitorLabel);
    htmlMonitorLabel.innerHTML = '0%';
    return monitorSettings.htmlMonitorRef;
  };

  updateMonitorSize = (width: number, height: number): void => {
    this.styleSheet.innerText = `
    .comfyui-menu #crystools-root .crystools-monitor .crystools-content {
      height: ${height}px; width: ${width}px;
     }`;
  };
}
