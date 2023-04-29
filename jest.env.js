import 'reflect-metadata';
import { webcrypto } from 'node:crypto';
import { TextDecoder, TextEncoder } from 'util';

globalThis.crypto = webcrypto;
globalThis.TextEncoder = TextEncoder;
globalThis.TextDecoder = TextDecoder;
