const $RefParser = require("@apidevtools/json-schema-ref-parser");
const fs = require("fs");
const path = require("path");
const stringify = require("json-stable-stringify");

const schemasDir = path.join('../schemas');

// Function to get all JSON files in a directory (non-recursive)
function getAllJsonFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isFile() && path.extname(file) === ".json") {
            results.push(filePath);
        }
    });
    return results;
}

// Function to ensure every schema has an $id key at the root level
function ensureSchemaId(schema, filePath) {
  const schemaId = `schemas/${path.basename(filePath)}`;
  if (schema.hasOwnProperty('id')) {
    schema["$id"] = schema.id;
    delete schema.id;
  } else if (!schema.hasOwnProperty('$id')) {
    schema["$id"] = schemaId;
  }
  return schema;
}

// Get all JSON files in the schemas directory (non-recursive)
const jsonFiles = getAllJsonFiles(schemasDir);

jsonFiles.forEach(filePath => {
    $RefParser.bundle(filePath).then(schema => {
        // Ensure the schema has an $id key
        schema = ensureSchemaId(schema, filePath);

        // Use json-stable-stringify to maintain property order
        const bundledSchema = stringify(schema, { space: 2 });
        fs.writeFileSync(filePath, bundledSchema);

        // Verify the output
        const writtenSchema = fs.readFileSync(filePath, "utf8");
        if (bundledSchema === writtenSchema) {
            console.log(`Successfully bundled and verified: ${filePath}`);
        } else {
            console.error(`Verification failed for: ${filePath}`);
        }
    }).catch(err => console.error(`Error bundling ${filePath}:`, err));
});