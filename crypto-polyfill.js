import { randomBytes } from 'crypto'; globalThis.crypto = { getRandomValues: arr => { return randomBytes(arr.length); } };
