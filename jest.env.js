import 'reflect-metadata';
import { webcrypto } from 'node:crypto';

globalThis.crypto = webcrypto;
