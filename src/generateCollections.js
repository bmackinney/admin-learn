const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { generateFieldYAML } = require('./processFields');

// Main function
async function main() {
  const schemasDir = '../schemas';
  const collectionsDir = path.join(__dirname, '../data/scms', 'collections');
  const fieldsDir = path.join(__dirname, '../data/scms', 'fields');

  // Create collections and fields directories if they don't exist
  await fs.promises.mkdir(collectionsDir, { recursive: true });
  await fs.promises.mkdir(fieldsDir, { recursive: true });

  // Read all .json files in the schemas directory
  const schemaFiles = fs.readdirSync(schemasDir).filter(file => file.endsWith('.json'));

  // Process each schema file
  for (const schemaFile of schemaFiles) {
    const schemaPath = path.join(schemasDir, schemaFile);
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    const schema = JSON.parse(schemaContent);
    const name = schema.title;
    const description = schema.description;
    const fields = schema.properties || {};
    const requiredFields = {};

    if (Array.isArray(schema.required)) {
      for (const field of schema.required) {
        requiredFields[field] = true;
      }
    }

    const definitions = schema.definitions || {};
    const yamlFields = [];
    const generatedFiles = {};

    for (const [fieldName, fieldProperties] of Object.entries(fields)) {
      if (typeof fieldProperties === 'object') {
        const field = await generateFieldYAML(fieldName, fieldProperties, requiredFields, generatedFiles);
        yamlFields.push(field);
      }
    }

    const yamlSchema = {
      name,
      label: name,
      description,
      fields: yamlFields
    };

    // Save the processed schema to a new file
    const collectionFileName = `learn-${schemaFile.replace('.schema.json', '.yml')}`;
    const collectionFilePath = path.join(collectionsDir, collectionFileName);
    const yamlContent = yaml.dump(JSON.parse(JSON.stringify(yamlSchema))); // Ensure no functions are included
    fs.writeFileSync(collectionFilePath, yamlContent);

    console.log(`Processed and saved: ${collectionFilePath}`);

    // Process definitions and write to output/fields
    for (const [definitionKey, definitionProps] of Object.entries(definitions)) {
      const field = await generateFieldYAML(definitionKey, definitionProps, requiredFields, generatedFiles);
      const fieldFileName = `learn-${schemaFile.replace('.schema.json', '')}-${definitionKey}.yml`;
      const fieldFilePath = path.join(fieldsDir, fieldFileName);
      const fieldYAML = yaml.dump(JSON.parse(JSON.stringify(field))); // Ensure no functions are included
      fs.writeFileSync(fieldFilePath, fieldYAML);
      console.log(`Processed and saved definition: ${fieldFilePath}`);
    }
  }
}

main().catch(err => console.error(err));