import type { WorkerResponse } from './worker/types';

export interface ConversionProgress {
  progress: number;
  time?: number;
}

export interface ConversionResult {
  videoData: Uint8Array;
  videoName: string;
}

export class VideoConverter {
  private worker: Worker | null = null;
  private isLoaded = false;
  private loadPromise: Promise<void> | null = null;
  private loadResolve?: () => void;
  private loadReject?: (error: Error) => void;
  private convertResolve?: (result: ConversionResult) => void;
  private convertReject?: (error: Error) => void;
  private onProgress?: (progress: ConversionProgress) => void;

  private ensureWorker() {
    if (this.worker) {
      return;
    }

    this.worker = new Worker(new URL('./worker.ts', import.meta.url), {
      type: 'module',
    });

    this.worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
      const { type, data } = e.data;

      switch (type) {
        case 'loaded':
          this.isLoaded = true;
          if (this.loadResolve) {
            this.loadResolve();
            this.loadResolve = undefined;
            this.loadReject = undefined;
          }
          break;
        case 'progress':
          if (this.onProgress) {
            this.onProgress(data as ConversionProgress);
          }
          break;
        case 'complete':
          if (this.convertResolve) {
            this.convertResolve(data as ConversionResult);
            this.convertResolve = undefined;
            this.convertReject = undefined;
          }
          break;
        case 'error': {
          const errorData = data as unknown;
          let errorMessage = 'Unknown error';

          if (typeof errorData === 'object' && errorData !== null) {
            const errorObj = errorData as Record<string, unknown>;
            if ('message' in errorObj && typeof errorObj.message === 'string') {
              errorMessage = errorObj.message;
            } else if ('stack' in errorObj && typeof errorObj.stack === 'string') {
              errorMessage = errorObj.stack;
            }
          }

          if (typeof errorData === 'string') {
            errorMessage = errorData;
          }

          console.error('[VideoConverter] Worker error:', errorMessage, 'Full data:', errorData);

          if (!this.isLoaded && this.loadReject) {
            this.loadReject(new Error(errorMessage || 'Failed to load FFmpeg'));
            this.loadResolve = undefined;
            this.loadReject = undefined;
          } else if (this.convertReject) {
            this.convertReject(new Error(errorMessage || 'Conversion failed'));
            this.convertResolve = undefined;
            this.convertReject = undefined;
          }
          break;
        }
      }
    };

    this.worker.onerror = (error) => {
      const message = error instanceof Error ? error.message : String(error);
      if (!this.isLoaded && this.loadReject) {
        this.loadReject(new Error(message));
        this.loadResolve = undefined;
        this.loadReject = undefined;
      } else if (this.convertReject) {
        this.convertReject(new Error(message));
        this.convertResolve = undefined;
        this.convertReject = undefined;
      }
    };
  }

  async load(): Promise<void> {
    this.ensureWorker();

    if (this.isLoaded) {
      return;
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = new Promise<void>((resolve, reject) => {
      if (!this.worker) {
        reject(new Error('Worker not initialized'));
        return;
      }

      this.loadResolve = resolve;
      this.loadReject = reject;

      const timeout = setTimeout(() => {
        this.loadResolve = undefined;
        this.loadReject = undefined;
        this.loadPromise = null;
        reject(new Error('FFmpeg loading timed out'));
      }, 120000);

      const originalResolve = resolve;
      this.loadResolve = () => {
        clearTimeout(timeout);
        this.loadResolve = undefined;
        this.loadReject = undefined;
        originalResolve();
      };

      const originalReject = reject;
      this.loadReject = (error: Error) => {
        clearTimeout(timeout);
        this.loadResolve = undefined;
        this.loadReject = undefined;
        this.loadPromise = null;
        originalReject(error);
      };

      this.worker.postMessage({ type: 'load' });
    });

    return this.loadPromise;
  }

  async convert(
    file: File,
    onProgress?: (progress: ConversionProgress) => void,
  ): Promise<ConversionResult> {
    this.onProgress = onProgress;

    await this.load();

    if (!this.worker) {
      throw new Error('Worker not initialized');
    }

    const arrayBuffer = await file.arrayBuffer();
    const videoData = new Uint8Array(arrayBuffer);

    return new Promise<ConversionResult>((resolve, reject) => {
      this.convertResolve = resolve;
      this.convertReject = reject;

      this.worker?.postMessage(
        {
          type: 'convert',
          data: {
            videoData,
            videoName: file.name,
          },
        },
        [videoData.buffer],
      );
    });
  }

  destroy() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }

    this.isLoaded = false;
    this.loadPromise = null;
    this.loadResolve = undefined;
    this.loadReject = undefined;
    this.convertResolve = undefined;
    this.convertReject = undefined;
  }
}
