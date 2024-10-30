const fs = require('fs');
const path = require('path');
const axios = require('axios');
const $RefParser = require("@apidevtools/json-schema-ref-parser");
const _ = require('lodash');
const yaml = require('js-yaml');

const schemasDir = path.join('../schemas');
const reportFile = path.join('translation.yaml');
const schemaUrl = 'https://dotnet.github.io/docfx/schemas/v1.0/schema.json';
const draft06Url = 'http://json-schema.org/draft-06/schema';

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

// Function to count schema properties and track unique values
function countSchemaProperties(schema, propertyMap, schemaPath) {
    function countProperties(schema) {
        if (_.isObject(schema)) {
            _.forOwn(schema, (value, key) => {
                if (propertyMap[key]) {
                    propertyMap[key].count++;
                    const unixSchemaPath = schemaPath.replace(/\\/g, '/');
                    if (!propertyMap[key].schemas[unixSchemaPath]) {
                        propertyMap[key].schemas[unixSchemaPath] = 0;
                    }
                    propertyMap[key].schemas[unixSchemaPath]++;
                    
                    // Track unique values
                    if (!propertyMap[key].uniqueValues) {
                        propertyMap[key].uniqueValues = {};
                    }
                    let valueStr = JSON.stringify(value);
                    if (_.isObject(value) && value.type === "string") {
                        valueStr = '"string"';
                    }
                    if (!propertyMap[key].uniqueValues[valueStr]) {
                        propertyMap[key].uniqueValues[valueStr] = 0;
                    }
                    propertyMap[key].uniqueValues[valueStr]++;
                }
                countProperties(value);
            });
        } else if (_.isArray(schema)) {
            _.forEach(schema, item => countProperties(item));
        }
    }

    countProperties(schema);
}

// Function to process a schema and track $schema properties
async function processSchema(filePath, propertyMap) {
    try {
        const schema = await $RefParser.bundle(filePath);
        countSchemaProperties(schema, propertyMap, filePath);
    } catch (err) {
        console.error(`Error processing schema ${filePath}:`, err);
    }
}

// Function to analyze a schema URL
async function analyzeSchemaUrl(schemaUrl, propertyMap) {
    const response = await axios.get(schemaUrl);
    const $schema = response.data;

    // Initialize propertyMap with properties from the $schema or propertyObject
    const properties = ($schema.definitions && $schema.definitions.propertyObject && $schema.definitions.propertyObject.properties) || $schema.properties;
    if (properties) {
        _.forOwn(properties, (value, key) => {
            propertyMap[key] = { count: 0, schemas: {} };
        });
    }

    const jsonFiles = getAllJsonFiles(schemasDir);

    for (const filePath of jsonFiles) {
        await processSchema(filePath, propertyMap);
    }

    // Filter propertyMap to only include keys from the $schema properties
    return _.pick(propertyMap, _.keys(properties));
}

// Main function to process all schemas and generate a report
async function main() {
    const propertyMap1 = {};
    const propertyMap2 = {};

    // Analyze the first schema URL
    const result1 = await analyzeSchemaUrl(schemaUrl, propertyMap1);

    // Analyze the second schema URL (draft 06)
    const result2 = await analyzeSchemaUrl(draft06Url, propertyMap2);

    // Combine results
    const combinedResults = {
        docfx: result1,
        'draft-06': result2
    };

    // Sort properties by count and format the output
    const formattedResults = {};
    _.forOwn(combinedResults, (schemaResults, schemaName) => {
        formattedResults[schemaName] = {};
        const sortedProperties = _.orderBy(_.toPairs(schemaResults), ([key, value]) => value.count, ['desc']);
        _.forEach(sortedProperties, ([key, value]) => {
            const keyName = `${key}: # ${value.count} (${Object.keys(value.uniqueValues || {}).length})`;
            formattedResults[schemaName][keyName] = {
                values: [],
                schemas: []
            };
            if (value.count !== 0) {
                const sortedValues = _.orderBy(_.toPairs(value.uniqueValues || {}), ([uniqueValue, count]) => count, ['desc']);
                formattedResults[schemaName][keyName].values = _.map(sortedValues, ([uniqueValue, count]) => `${uniqueValue} # ${count}`);
                formattedResults[schemaName][keyName].schemas = _.map(_.orderBy(_.toPairs(value.schemas || {}), ([schemaPath, count]) => count, ['desc']), ([schemaPath, count]) => {
                    const schemaFilename = path.basename(schemaPath, '.schema.json');
                    return `${schemaFilename} # ${count}`;
                });
            }
        });
    });

    // Filter out keys in draft-06 that are present in docfx
    const docfxKeys = new Set(_.keys(formattedResults['docfx']).map(key => key.split(':')[0]));
    formattedResults['draft-06'] = _.pickBy(formattedResults['draft-06'], (value, key) => {
        const keyName = key.split(':')[0];
        return !docfxKeys.has(keyName);
    });

    // Convert to YAML
    const yamlStr = yaml.dump(formattedResults, { noRefs: true, quotingType: "'", indent: 2 })
        .replace(/values:/g, 'values:')
        .replace(/instances:/g, 'instances:')
        .replace(/'/g, '');

    fs.writeFileSync(reportFile, yamlStr);
    console.log(`Report written to ${reportFile}`);
}

main().catch(err => console.error(err));