import type { URLSearchParams } from 'node:url';

export type BodyInit =
  | ArrayBufferView
  | ArrayBufferLike
  | Blob
  | string
  | URLSearchParams
  | FormData; // Note: FormData handling is not included in this implementation due to Node.js limitations.

export type BodyInitSerialized = string | Uint8Array;
