import { readFileSync } from 'fs';
import path from 'path';

export default function handler(req, res) {
    try {
        const file = readFileSync(path.resolve(process.cwd(), './circuits/target/main.json'), 'utf8');
        const content = JSON.parse(file);
        res.status(200).json(content);
    } catch (error) {
        console.error('Error reading the directory:', error);
        res.status(500).json({ error: 'Error reading the directory' });
    }
}
