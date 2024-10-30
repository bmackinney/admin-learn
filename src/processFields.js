// Define the YamlField class
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
    importField,
    fieldType,
    required,
    valueField,
    displayFields,
    min,
    max,
    pattern,
    defaultValue,
    modes,
    archivable
  }) {
    this.comment = comment;
    this.name = name;
    this.label = label;
    this.widget = widget;
    this.hint = hint;
    this.options = options;
    this.fields = fields;
    this.types = types;
    this.import = importField;
    this.fieldType = fieldType;
    this.required = required;
    this.valueField = valueField;
    this.displayFields = displayFields;
    this.min = min;
    this.max = max;
    this.pattern = pattern;
    this.default = defaultValue;
    this.modes = modes;
    this.archivable = archivable;
  }
}

// Function to generate field YAML
async function generateFieldYAML(fieldName, fieldProps, requiredFields, generatedFiles) {
  console.log(`Generating field YAML for: ${fieldName}`); // Debug logging
  // Create a new YamlField object with the provided field name and properties
  const field = new YamlField({
    name: fieldName,
    label: fieldName.charAt(0).toUpperCase() + fieldName.slice(1), // Capitalize the first letter of the field name
    required: requiredFields[fieldName] || false, // Set the required property based on the requiredFields map
    archivable: fieldProps?.archivable || false
  });
  // Check the type of the field and set the appropriate properties
  if (typeof fieldProps?.type === 'string') {
    switch (fieldProps.type) {
      case 'string':
        // Handle string type fields
        if (fieldProps.enum) {
          field.widget = 'select';
          field.options = fieldProps.enum;
        }
        if (typeof fieldProps.contentType === 'string') {
          switch (fieldProps.contentType) {
            case 'markdown':
              field.widget = 'markdown';
              break;
            case 'uid':
              field.widget = 'string';
              break;
            case 'xref':
              field.widget = 'relation';
              if (typeof fieldProps.xrefType === 'string') {
                switch (fieldProps.xrefType) {
                  case 'Course':
                  case 'Module':
                  case 'LearningPath':
                  case 'Certification':
                  case 'Examination':
                    field.collection = 'learn-catalog';
                    field.valueField = '*.uid';
                    field.displayFields = ['summary', 'title', 'type'];
                    break;
                }
              }
              break;
            case 'href':
              field.widget = 'string';
              field.fieldType = 'url';
              break;
            default:
              field.widget = 'string';
          }
        } else {
          field.widget = 'string';
        }
        break;
      case 'number':
        // Handle number type fields
        field.widget = 'number';
        break;
      case 'object':
        // Handle object type fields
        field.widget = 'object';
        field.fields = [];
        if (typeof fieldProps.properties === 'object') {
          for (const [k, v] of Object.entries(fieldProps.properties)) {
            if (typeof v === 'object') {
              field.fields.push(await generateFieldYAML(k, v, requiredFields, generatedFiles));
            }
          }
        }
        break;
      case 'array':
        // Handle array type fields
        field.widget = 'list';
        if (Array.isArray(fieldProps.items)) {
          field.fields = [];
          for (const item of fieldProps.items) {
            if (typeof item === 'object') {
              field.fields.push(await generateFieldYAML(fieldName, item, requiredFields, generatedFiles));
            }
          }
        } else if (typeof fieldProps.items === 'object') {
          if (Array.isArray(fieldProps.items.anyOf)) {
            field.types = field.types || [];
            for (const item of fieldProps.items.anyOf) {
              if (typeof item === 'object') {
                field.types.push(await generateFieldYAML(fieldName, item, requiredFields, generatedFiles));
              }
            }
          } else if (fieldProps.items.properties) {
            field.fields = [];
            for (const [k, v] of Object.entries(fieldProps.items.properties)) {
              if (typeof v === 'object') {
                field.fields.push(await generateFieldYAML(k, v, requiredFields, generatedFiles));
              }
            }
          }
        }
        break;
    }
  }

  // Check for subproperties in the fields key
  if (Array.isArray(fieldProps?.fields)) {
    field.fields = [];
    for (const subField of fieldProps.fields) {
      if (typeof subField === 'object') {
        field.fields.push(await generateFieldYAML(subField.name, subField, requiredFields, generatedFiles));
      }
    }
  }

  return field;
}

module.exports = {
  generateFieldYAML
};
