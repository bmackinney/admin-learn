const fs = require('fs');
const axios = require('axios');
const path = require('path');

const pat = process.env.AZURE_DEVOPS_PAT;
const organization = process.env.AZURE_DEVOPS_ORG;
const projects = process.env.AZURE_DEVOPS_PROJECTS.split(',');

const baseUrl = `https://dev.azure.com/${organization}`;

// Read and parse comparison.json
let comparisonData;
try {
  comparisonData = JSON.parse(fs.readFileSync('schemas/comparison.json', 'utf8'));
  if (!comparisonData.workItemTypes || typeof comparisonData.workItemTypes !== 'object') {
    throw new Error('Invalid structure in comparison.json');
  }
} catch (error) {
  console.error(`Error reading or parsing comparison.json: ${error.message}`);
  process.exit(1);
}

const sanitizeFilename = (name) => {
  return name.replace(/\s+/g, '');
};

const getWorkItemTypes = async (project) => {
  try {
    const response = await axios.get(`${baseUrl}/${project}/_apis/wit/workitemtypes?api-version=7.2-preview.2`, {
      auth: {
        username: '',
        password: pat
      }
    });

    if (response.status === 200) {
      const workItemTypes = response.data.value;
      for (const item of workItemTypes) {
        const isCommon = comparisonData.workItemTypes.common.includes(item.name);
        const isOnlyInContent = comparisonData.workItemTypes.onlyInContent.includes(item.name);

        const schema = {
          $schema: "http://json-schema.org/draft-07/schema#",
          title: item.name,
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "The unique identifier for the work item"
            },
            rev: {
              type: "integer",
              description: "The revision number of the work item"
            },
            WorkItemType: {
              type: "string",
              description: "The type of the work item"
            },
            Title: {
              type: "string",
              description: "The first title of the work item"
            },
            Description: {
              type: "string",
              description: "The description of the work item"
            },
            AssignedTo: {
              type: "string",
              description: "The person assigned to the work item"
            },
            AcceptanceCriteria: {
              type: "string",
              description: "The acceptance criteria for the work item"
            },
            TargetDate: {
              type: "string",
              description: "The target date for the work item"
            },
          },
          required: [
            "Title",
            "WorkItemType"
          ]
        };

        const sanitizedFilename = sanitizeFilename(item.name);
        const outputDir = path.join('schemas', 'WorkItemTypes', project);
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }
        const filePath = path.join(outputDir, `${sanitizedFilename}.schema.json`);
        fs.writeFileSync(filePath, JSON.stringify(schema, null, 2));
        console.log(`Schema for ${item.name} in project ${project} written to ${filePath}`);
      }
    }
  } catch (error) {
    console.error(`Error fetching work item types for project ${project}: ${error.message}`);
  }
};

const generateSchemas = async () => {
  for (const project of projects) {
    await getWorkItemTypes(project);
  }
};

generateSchemas();