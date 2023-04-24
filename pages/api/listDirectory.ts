import { readdirSync } from 'fs';
import path from 'path';

export default function handler(req, res) {
  try {
    const files = readdirSync(path.resolve(process.cwd(), './circuit'));
    res.status(200).json({ files });
  } catch (error) {
    console.error('Error reading the directory:', error);
    res.status(500).json({ error: 'Error reading the directory' });
  }
}
