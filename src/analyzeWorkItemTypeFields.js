const axios = require('axios');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
require('dotenv').config();

const pat = process.env.AZURE_DEVOPS_PAT;
const organization = process.env.AZURE_DEVOPS_ORG;
const projects = process.env.AZURE_DEVOPS_PROJECTS ? process.env.AZURE_DEVOPS_PROJECTS.split(',') : [];

if (!pat || !organization || projects.length === 0) {
  console.error("Please ensure AZURE_DEVOPS_PAT, AZURE_DEVOPS_ORG, and AZURE_DEVOPS_PROJECTS environment variables are set.");
  process.exit(1);
}

const baseUrl = `https://dev.azure.com/${organization}`;

const getWorkItemTypes = async (project) => {
  try {
    const response = await axios.get(`${baseUrl}/${project}/_apis/wit/workitemtypes?api-version=6.0`, {
      auth: {
        username: '',
        password: pat
      }
    });

    if (response.status === 200) {
      return response.data.value;
    } else {
      console.error(`Error: ${response.status}`);
      return [];
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    if (error.response) {
      console.error(`Response data: ${JSON.stringify(error.response.data, null, 2)}`);
      console.error(`Response status: ${error.response.status}`);
      console.error(`Response headers: ${JSON.stringify(error.response.headers, null, 2)}`);
    }
    return [];
  }
};

const getWorkItemTypeDefinition = async (project, typeName) => {
  try {
    const response = await axios.get(`${baseUrl}/${project}/_apis/wit/workitemtypes/${typeName}?api-version=6.0`, {
      auth: {
        username: '',
        password: pat
      }
    });

    if (response.status === 200) {
      return response.data.fields.map(field => field.referenceName);
    } else {
      console.error(`Error: ${response.status}`);
      return [];
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    if (error.response) {
      console.error(`Response data: ${JSON.stringify(error.response.data, null, 2)}`);
      console.error(`Response status: ${error.response.status}`);
      console.error(`Response headers: ${JSON.stringify(error.response.headers, null, 2)}`);
    }
    return [];
  }
};

const analyzeFields = (fieldsByType) => {
  const fieldSets = {};

  fieldsByType.forEach(item => {
    item.fields.forEach(field => {
      const parts = field.split('.');
      let current = fieldSets;

      parts.forEach((part, index) => {
        if (!current[part]) {
          current[part] = index === parts.length - 1 ? [] : {};
        }
        if (index === parts.length - 1) {
          current[part].push(item.type);
        } else {
          current = current[part];
        }
      });
    });
  });

  const totalTypes = fieldsByType.length;

  const replaceAllWithCommon = (obj) => {
    for (const key in obj) {
      if (Array.isArray(obj[key])) {
        if (obj[key].length === totalTypes) {
          obj[key] = "all";
        }
      } else {
        replaceAllWithCommon(obj[key]);
      }
    }
  };

  replaceAllWithCommon(fieldSets);

  return fieldSets;
};

const main = async () => {
  for (const project of projects) {
    console.log(`Analyzing project: ${project}`);
    const workItemTypes = await getWorkItemTypes(project);
    const fieldsByType = [];

    for (const workItemType of workItemTypes) {
      const fields = await getWorkItemTypeDefinition(project, workItemType.name);
      fieldsByType.push({ type: workItemType.name, fields });
    }

    const fieldStats = {
      "Work Item Types": workItemTypes.map(type => type.name),
      "Fields": analyzeFields(fieldsByType)
    };

    const outputDir = path.join(__dirname, 'schemas', 'WorkItemTypes', project);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    const filePath = path.join(outputDir, 'fieldStats.json');
    fs.writeFileSync(filePath, JSON.stringify(fieldStats, null, 2));
    console.log(`Field statistics for project ${project} written to ${filePath}`);
  }
};

main();