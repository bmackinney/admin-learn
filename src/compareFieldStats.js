const fs = require('fs');
const path = require('path');
const _ = require('lodash');
require('dotenv').config();

const pat = process.env.AZURE_DEVOPS_PAT;
const organization = process.env.AZURE_DEVOPS_ORG;
const projects = process.env.AZURE_DEVOPS_PROJECTS ? process.env.AZURE_DEVOPS_PROJECTS.split(',') : [];

if (!pat || !organization || projects.length < 2) {
  console.error("Please ensure AZURE_DEVOPS_PAT, AZURE_DEVOPS_ORG, and at least two projects in AZURE_DEVOPS_PROJECTS environment variables are set.");
  process.exit(1);
}

const readJsonFile = (filePath) => {
  const data = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(data);
};

const compareFieldStats = (file1, file2, project1, project2) => {
  const stats1 = readJsonFile(file1);
  const stats2 = readJsonFile(file2);

  const commonWorkItemTypes = _.intersection(stats1["Work Item Types"], stats2["Work Item Types"]);
  const differences = {
    workItemTypes: {
      common: commonWorkItemTypes,
      [`onlyIn${project1}`]: _.difference(stats1["Work Item Types"], stats2["Work Item Types"]),
      [`onlyIn${project2}`]: _.difference(stats2["Work Item Types"], stats1["Work Item Types"]),
    },
    fields: {
      common: {},
      [`onlyIn${project1}`]: {},
      [`onlyIn${project2}`]: {}
    }
  };

  const compareFields = (fields1, fields2, path = '') => {
    for (const key in fields1) {
      const currentPath = path ? `${path}.${key}` : key;
      if (!fields2.hasOwnProperty(key)) {
        _.set(differences.fields[`onlyIn${project1}`], currentPath, fields1[key]);
      } else if (_.isObject(fields1[key]) && !Array.isArray(fields1[key])) {
        compareFields(fields1[key], fields2[key], currentPath);
      } else {
        const parts = currentPath.split('.');
        let current = differences.fields.common;
        parts.forEach((part, index) => {
          if (index === parts.length - 2) {
            if (!current[part]) {
              current[part] = [];
            }
            if (!current[part].includes(parts[index + 1])) {
              current[part].push(parts[index + 1]);
            }
          } 
        });
      }
    }

    for (const key in fields2) {
      const currentPath = path ? `${path}.${key}` : key;
      if (!fields1.hasOwnProperty(key)) {
        _.set(differences.fields[`onlyIn${project2}`], currentPath, fields2[key]);
      }
    }
  };

  compareFields(stats1.Fields, stats2.Fields);

  return differences;
};

const main = () => {
  if (projects.length < 2) {
    console.error("Please ensure at least two projects are specified in AZURE_DEVOPS_PROJECTS.");
    return;
  }

  const project1 = projects[0];
  const project2 = projects[1];

  const file1 = path.join(__dirname, 'schemas', 'WorkItemTypes', project1, 'fieldStats.json');
  const file2 = path.join(__dirname, 'schemas', 'WorkItemTypes', project2, 'fieldStats.json');

  console.log(`Comparing fieldStats.json files for projects: ${project1} and ${project2}`);
  console.log(`File 1: ${file1}`);
  console.log(`File 2: ${file2}`);

  if (!fs.existsSync(file1) || !fs.existsSync(file2)) {
    console.error('One or both fieldStats.json files do not exist.');
    return;
  }

  const differences = compareFieldStats(file1, file2, project1, project2);

  const outputDir = path.join(__dirname, 'schemas');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const filePath = path.join(outputDir, 'comparison.json');
  console.log(`Writing comparison results to ${filePath}`);
  fs.writeFileSync(filePath, JSON.stringify(differences, null, 2));
  console.log(`Comparison results written to ${filePath}`);
};

main();