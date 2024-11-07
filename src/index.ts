import { Blob } from 'node:buffer';
import { type ChildProcess, fork } from 'node:child_process';
import path from 'node:path';
import { URLSearchParams } from 'node:url';
import type { BodyInit } from './types';

interface BeaconMessage {
  url: string;
  data?: BodyInitSerialized;
}

type BodyInitSerialized = string | Buffer | undefined;

let beaconProcess: ChildProcess | null = null;

function startBeaconProcess() {
  if (!beaconProcess) {
    const beaconChildPath = path.resolve(__dirname, 'child.js'); // Ensure the path is correct

    beaconProcess = fork(beaconChildPath, [], {
      detached: true,
      stdio: 'ignore', // Detach stdio to prevent parent from waiting for child stdio to close
    });

    // Unref the child process to allow the parent to exit independently
    beaconProcess.unref();
  }
}

function sendBeacon(url: string, data?: BodyInit): boolean {
  try {
    startBeaconProcess();

    const serializedData = serializeData(data);

    // Check payload size (recommended maximum is 64KB)
    const payloadSize = calculateSize(serializedData);
    const maxPayloadSize = 64 * 1024; // 64KB
    if (payloadSize > maxPayloadSize) {
      return false;
    }

    const message: BeaconMessage = { url, data: serializedData };
    beaconProcess!.send(message);

    return true;
  } catch (_error) {
    return false;
  }
}

function serializeData(data?: BodyInit): BodyInitSerialized | undefined {
  if (data === undefined) {
    return undefined;
  }
  if (typeof data === 'string') {
    return data;
  }
  if (data instanceof URLSearchParams) {
    return data.toString();
  }
  if (data instanceof Blob) {
    // @ts-expect-error
    return data[Symbol.for('node.buffer')];
  }
  if (Buffer.isBuffer(data)) {
    return data;
  }
  if (ArrayBuffer.isView(data)) {
    return Buffer.from(data.buffer, data.byteOffset, data.byteLength);
  }
  if (data instanceof ArrayBuffer || data instanceof SharedArrayBuffer) {
    return Buffer.from(data);
  }
  if (data instanceof FormData) {
    throw new TypeError('FormData is not supported because of Node.js limitations');
  }

  throw new TypeError('Unsupported data type');
}

function calculateSize(data?: BodyInitSerialized): number {
  if (data === undefined) {
    return 0;
  }
  if (typeof data === 'string') {
    return Buffer.byteLength(data, 'utf-8');
  }
  if (Buffer.isBuffer(data)) {
    return data.byteLength;
  }

  throw new TypeError('Unsupported data type for size calculation');
}

export { sendBeacon };