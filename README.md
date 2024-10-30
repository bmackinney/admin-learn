# Admin for Learn

A CMS generator for local clones of MicrosoftDocs content repositories.
A workspace generator for local development powered by scripts and Copilot.
A content project planning tool generates ADO bulk work item uploads. 

## Get Started

1. fork this repo
1. fork the content repo you want to edit
1. Make a content directory & cd into it
1. clone your forks
1. cd admin-learn
1. npm install
1. npm plan
1. Edit your plans
1. npm execute
1. Edit your content

## About me 

I'm [Brian MacKinney](https://github.com/bmackinney), a vendor on the partnerships/partner-enablement team. I have a M.Ed. in Ed Tech, and over a decade of experience with static documentation sites. This is the problem I've been dreaming of for a long time. I look at performance problems as most likely to be an issue with tools, incentives, and systems. Training and documentation are appropriate too, given the rest of the system follows DRY and first principles. This project reflects that my understanding that for my varying-product work needs better tools and a tighter system, and that I am most capable of selecting and building them for myself if necessary. My experience and witness to content development projects here lead me to believe it is necessary. The time-bound nature of my engagement leads me to believe it is only possible by just doing it myself. Whether it sticks and lands me here permanently is my goal but not my motivation. 

## 10/28/2024
The package does a lot 

## Vision

admin-learn, git, and ADO are the only software you need to effectively manage, develop, and execute content portfolios on Microsoft Learn. The project stores schema.json-derived forms, and a variety of CMS for targeted editing of each repository, enabling every contributor to learn to quickly and accurately create and edit any type of learn content from the browser, saved to the source .yml and .md files in local repositories. It generates .csv files for bulk work item upload to ADO, complete with instructions and links to guidance, assignment from values in plan.yml

In short, it does all of the copying and pasting I could ever need, for me. It connects the rules that govern the content we create to the forms we edit them in, and the work items we discuss and track them with. It enables me to edit content with the confidence that I will not screw up the yaml and enter a cycle of broken builds until I grasp the schema enough to make it work. It does this for everyone, automatically.

It allows us to focus more on the transfer of learning, the courses, modules, paths, and docs we write and manage. To me, it provides a platform to explain why I think we, like most, do this poorly, and to develop a course that follows the Ten Steps to Complex Learning, about developing content on Learn (using this toolset)

## Problem Statement

- Enabling partners and contributors to add and edit content on Microsoft Learn
- Why is it Important? Growth and engagement
- Impact of the Problem - slows time to content/time to engagement to have a complicated manually-documented system.

## Solution Overview

- Editors run hugo server, edit, save in browser, then commit, push, and PR with GitHub/similar tools, with zero broken builds because the editing interface validates with the criteria in the schema.
- Enables JIT validation in vscode and the UI for every type of content.
- Enables pattern-based content scaffolding from the CLI
- Infinitely customizable
- Content portfolio plans generate ADO work item.csv files for bulk work item tree upload scaffolded content files for completing the items, and a CMS for editing those files locally.
- One CMS per feature can automatically enable editing of only the files in the plan
- One CMS per repo can edit everything in the repo, or only the configuration files
- Generates CMS collections and fields from schema.json files that also generate and validate the interface of MS Learn.

## Demonstration

- Build pipeline in admin-learn-generator

### User Steps

- Clone & run
- Plan
- Execute scaffolds all of the ADO .csv files, .yml and .md files, and an admin/feat/index.md file with file collections to edit the scaffolded files.
- Contributors edit content
  - fork content repo
  - clone
  - sync if necessary
  - checkout branch
  - cd ../admin-learn
  - hugo server
  - https://localhost://1313/admin/CMS
  - edit content in UI with abundant adjacent help text and links to guidance and Copilot prompts.
  - save
  - commit
  - push

## Benefits and Impact

- Anything that must be repeated should be automated.
- Automatically keeps up with schema changes
- Reduces->Eliminates build errors
- Open-/inner-sources contributor interface
- Tightens integration with project management system
- Fully customizable

## Implementation Plan

- Share/use/market
- Formalize/handoff project
- Change ownership from bmackinney to MicrosoftDocs
- Write tests
- Automate builds
- Automate releases
- Create meta training modules

## Addressing Concerns

- Potential Questions or Objections
- Integration with Existing Systems
- Maintenance and Support

## Call to Action

- Try it out 
- Review the work items plan

## Q&A

- [GitHub Discussion](https://github.com/bmackinney/admin-learn/discussions)
