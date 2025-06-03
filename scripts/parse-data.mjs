/* Read an xlsx file.
 * Take the first sheet get each row, using the first column as the key and the rest of the columns as the value.
 * Take remaining sheets and use the first row as the key and then rest of the rows as the values, creating a new object for each row, adding the first sheet variables to each row object.
 * Add each object to an array.
 * Save the array as csv.
 */

import path from 'node:path';
import xlsx from 'xlsx';
import { fileURLToPath } from 'node:url';
import seedrandom from 'seedrandom';
import { stringify } from 'csv-stringify/sync';

const dateFields = ['created'];
const allowEmptyFields = ['comment', 'skip reason'];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataFilePath = process.argv[2];
const fileName = path.basename(dataFilePath);

const VERSION = 'v2';

const getSaveResponse = async () => {
  const mod = await import('../helpers/queries.mjs');
  return mod.saveResponse;
};
const getDeleteResponsesNotVersion = async () => {
  const mod = await import('../helpers/queries.mjs');
  return mod.deleteResponsesNotVersion;
};
const getResponseExists = async () => {
  const mod = await import('../helpers/queries.mjs');
  return mod.responseExists;
};

const generateDeterministicUuid = (obj, version) => {
  // Use a stable stringification of the object and version as the seed
  const seed = JSON.stringify(obj) + version;
  const rng = seedrandom(seed);
  // Generate a 32-character hex string
  let uuid = '';
  for (let i = 0; i < 32; i++) {
    uuid += Math.floor(rng() * 16).toString(16);
  }
  return uuid;
};

const parseSheetName = (sheetName) => {
  // Convert sheet name from pascal case to space separated
  const formattedSheetName = sheetName
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
    .replace(/([0-9]+)/g, ' $1')
    .trim();
  return formattedSheetName;
};

const parseField = (key, value, obj) => {
  if (value) {
    if (dateFields.includes(key.toLowerCase())) {
      // Convert date in '13 December 2001' format to '2001-12-13'
      const date = new Date(value);
      const dateString = date.toISOString().split('T')[0];
      obj[key] = dateString;
    } else {
      obj[key] = value;
    }
  }
};

const getInitialValues = (sheetData, defaultValues, isFirstRow) => {
  let obj = {};
  if (isFirstRow) {
    obj = { ...defaultValues };
  } else {
    obj = { ...(sheetData || defaultValues) };
  }
  Object.keys(obj)
    .filter((key) => allowEmptyFields.includes(key.toLowerCase()))
    .forEach((key) => {
      delete obj[key];
    });
  return obj;
};

const arrToCsv = (arr) => {
  const keys = arr.reduce((acc, obj) => {
    acc.push(...Object.keys(obj));
    return acc.filter((val, i, arr) => arr.indexOf(val) === i);
  }, []);
  const str = stringify([
    keys,
    ...arr.map((obj) => {
      const values = keys.map((key) => obj[key] || '');
      return values;
    }),
  ]);
  return str;
};

const fieldMap = {
  'client name': 'client_name',
  'distribution name': 'distribution_name',
  created: 'created',
  category: 'category',
  'question #': 'question_number',
  'question text': 'question_text',
  'sub-question': 'sub_question',
  respondent: 'respondent',
  position: 'position',
  response: 'response',
  comment: 'comment',
  'skip reason': 'skip_reason',
};

const requiredFields = [
  'client_name',
  'distribution_name',
  'created',
  'category',
  'question_number',
  'question_text',
  'sub_question',
  'respondent',
];

const parseData = async () => {
  const saveResponse = await getSaveResponse();
  const deleteResponsesNotVersion = await getDeleteResponsesNotVersion();
  const responseExists = await getResponseExists();
  await deleteResponsesNotVersion(VERSION);
  const workbook = xlsx.readFile(dataFilePath);
  // Get sheet names from workbook
  const sheetNames = workbook.SheetNames;
  // Get the first sheet name
  const sheetName = sheetNames[0];
  const firstSheet = workbook.Sheets[sheetName];
  const firstSheetData = xlsx.utils.sheet_to_json(firstSheet, { header: 1 });
  // Take first column as keys and rest of the columns as values
  const defaultValues = firstSheetData.reduce((obj, row) => {
    const dbKey = fieldMap[row[0]?.trim().toLowerCase()];
    if (dbKey) {
      parseField(dbKey, row[1], obj);
    }
    return obj;
  }, {});
  console.log('First sheet data:', firstSheetData);
  console.log('Extracted defaultValues:', defaultValues);

  // Ensure created is a YYYY-MM-DD string for matching DATEONLY in DB
  let createdDate = defaultValues.created;
  if (createdDate && typeof createdDate === 'string') {
    createdDate = new Date(createdDate).toISOString().split('T')[0];
  } else if (createdDate instanceof Date) {
    createdDate = createdDate.toISOString().split('T')[0];
  }
  console.log(
    'About to clear database with created:',
    createdDate,
    'Type:',
    typeof createdDate,
  );

  // Clear the database for the current report (distribution_name, client_name, created)
  const { distribution_name, client_name, created } = defaultValues;
  await deleteResponsesNotVersion(distribution_name, client_name, createdDate);

  // Loop through the rest of the sheets
  for (const sheetName of sheetNames.slice(1)) {
    const sheet = workbook.Sheets[sheetName];
    const sheetData = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    const keys = sheetData[0];
    console.log(`Sheet: ${sheetName}, Headers:`, keys);
    // Debug: print header mapping for the first data row
    keys.forEach((key, i) => {
      const normalizedKey = key?.trim();
      const dbKey = fieldMap[normalizedKey?.toLowerCase()];
      console.log(
        `Header: "${key}" | Normalized: "${normalizedKey}" | dbKey: "${dbKey}"`,
      );
    });

    // Initialize lastRowObj with defaultValues for each sheet
    let lastRowObj = { ...defaultValues };

    for (const row of sheetData.slice(1)) {
      // Skip blank rows
      if (
        row.every((cell) => cell === undefined || cell === null || cell === '')
      ) {
        continue;
      }
      // Start with a copy of lastRowObj (carry over previous values)
      const dbObj = { ...lastRowObj };
      console.log('Processing row:', row);
      keys.forEach((key, i) => {
        const normalizedKey = key?.trim();
        const dbKey = fieldMap[normalizedKey?.toLowerCase()];
        console.log(
          'Header:',
          key,
          '| Normalized:',
          normalizedKey,
          '| dbKey:',
          dbKey,
          '| Value:',
          row[i],
        );
        if (dbKey) {
          // Only update if value is not undefined or empty string, else retain previous
          if (row[i] !== undefined && row[i] !== '') {
            dbObj[dbKey] = row[i];
          }
        }
      });
      // Do not carry over allowEmptyFields (e.g., comment, skip reason)
      allowEmptyFields.forEach((field) => {
        const dbKey = fieldMap[field.toLowerCase()];
        const keyIndex = keys.findIndex(
          (k) => k && k.trim().toLowerCase() === field.toLowerCase(),
        );
        if (
          dbKey &&
          keyIndex !== -1 &&
          (row[keyIndex] === undefined ||
            row[keyIndex] === null ||
            row[keyIndex] === '')
        ) {
          delete dbObj[dbKey];
        }
      });
      // Debug: log dbObj before required fields check
      console.log('dbObj before required fields check:', dbObj);
      // Always ensure required fields are present from defaultValues
      dbObj.client_name = defaultValues.client_name;
      dbObj.distribution_name = defaultValues.distribution_name;
      dbObj.created = defaultValues.created;
      dbObj.category = parseSheetName(sheetName); // Always set/override category
      dbObj.version = VERSION;
      // Always save created as YYYY-MM-DD
      if (dbObj.created) {
        dbObj.created = new Date(dbObj.created).toISOString().split('T')[0];
      }
      const id = generateDeterministicUuid(dbObj, VERSION);
      dbObj.id = id;

      // Check for required fields
      const missing = requiredFields.filter((f) => !dbObj[f]);
      if (missing.length) {
        console.warn(
          `Skipping row (missing required fields: ${missing.join(', ')}):`,
          dbObj,
        );
        // Update lastRowObj so that next row can still carry over values
        lastRowObj = { ...dbObj };
        continue;
      }

      const exists = await responseExists(id);
      if (!exists) {
        await saveResponse(dbObj);
      }
      // Update lastRowObj to current dbObj for next iteration
      lastRowObj = { ...dbObj };
    }
  }
};

await parseData();
