import path from 'node:path';
import fs from 'node:fs';
import { stringify } from 'csv-stringify/sync';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dynamically import the Sequelize model
const getResponsesModel = async () => {
  const mod = await import('../helpers/queries.mjs');
  return mod.default?.Response || mod.Response;
};

const normalize = (str) =>
  str
    .trim() // trim leading/trailing spaces first
    .toLowerCase()
    .replace(/[^a-z0-9\-]+/g, '_') // replace all non-alphanumeric, non-dot, non-hyphen with underscore
    .replace(/_+/g, '_') // collapse multiple underscores
    .replace('_-_', '-')
    .replace(/^_+|_+$/g, ''); // trim leading/trailing underscores

const exportQuestion1CSVs = async () => {
  const mod = await import('../helpers/queries.mjs');
  const Response = mod.default?.Response || mod.Response;
  if (!Response) {
    throw new Error('Could not load Response model');
  }

  // Get all rows where question_number = 1
  const rows = await Response.findAll({ where: { question_number: '1' } });

  // Group by client_name and distribution_name
  const groups = {};
  for (const row of rows) {
    const client = row.client_name;
    const dist = row.distribution_name;
    if (!client || !dist) continue;
    const key = `${client}|||${dist}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(row.toJSON());
  }

  // Write each group to a CSV file
  for (const key of Object.keys(groups)) {
    const [client, dist] = key.split('|||');
    const filename = `${normalize(`${client}-${dist}`)}.csv`;
    const filepath = path.join(__dirname, '../data', filename);
    const arr = groups[key];
    // Get all unique keys
    const allKeys = Array.from(new Set(arr.flatMap((obj) => Object.keys(obj))));
    const csv = stringify([
      allKeys,
      ...arr.map((obj) => allKeys.map((k) => obj[k] ?? '')),
    ]);
    fs.writeFileSync(filepath, csv);
    console.log(`Wrote ${arr.length} rows to ${filepath}`);
  }
};

exportQuestion1CSVs();
