const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Define the YamlField structure
class YamlField {
  constructor({
      comment,
      name,
      label,
      widget,
      hint,
      options,
      fields,
      types,
      import: importField,
      field_type,
      required,
      value_field,
      display_fields,
      min,
      max,
      pattern,
      default: defaultValue,
      modes
  }) {
      this.comment = comment;
      this.name = name;
      this.label = label;
      this.widget = widget;
      this.hint = hint;
      this.options = options;
      this.fields = fields ? fields.map(field => new YamlField(field)) : [];
      this.types = types;
      this.import = importField;
      this.field_type = field_type;
      this.required = required;
      this.value_field = value_field;
      this.display_fields = display_fields;
      this.min = min;
      this.max = max;
      this.pattern = pattern;
      this.default = defaultValue;
      this.modes = modes;
  }
}

// Define the YamlSchema structure
class YamlSchema {
  constructor({ title, description, properties }) {
    this.name = title.charAt(0).toLowerCase() + title.slice(1);
    this.label = title;
    this.description = description;
    this.fields = properties ? this.processProperties(properties) : [];
  }

  processProperties(properties) {
    return Object.keys(properties).map(key => {
      const property = properties[key];
      return new YamlField({
        name: key,
        label: property.title || key,
        widget: property.type,
        required: property.required || false,
        default: property.default || null,
        // Add more mappings as needed
      });
    });
  }
}

// Map to keep track of generated files
const generatedFiles = new Map();

// Main function
async function main() {
  const schemasDir = path.join('output', 'schemas');
  const outputDir = path.join('output', 'fields');

  // Create output directory if it doesn't exist
  await fs.promises.mkdir(outputDir, { recursive: true });

  // Read all .schema.json files in the schemas directory
  const schemaFiles = fs.readdirSync(schemasDir).filter(file => file.endsWith('.schema.json'));

  // Process each schema file
  for (const schemaFile of schemaFiles) {
    const schemaPath = path.join(schemasDir, schemaFile);
    if (!generatedFiles.has(schemaPath)) {
      const schemaContent = fs.readFileSync(schemaPath, 'utf8');
      const schema = JSON.parse(schemaContent);

      // Convert the schema to a YamlSchema object
      const yamlSchema = new YamlSchema(schema);

      // Save the processed schema to a new file
      const outputFilePath = path.join(outputDir, path.basename(schemaPath, '.schema.json') + '.yml');
      fs.writeFileSync(outputFilePath, yaml.dump(yamlSchema, { noRefs: true }));

      generatedFiles.set(schemaPath, true);
      console.log(`Processed and saved: ${outputFilePath}`);
    }
  }
}

main().catch(err => console.error(err));