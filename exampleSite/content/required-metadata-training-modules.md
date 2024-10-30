---
title: Required metadata for training modules
description: This article explains the metadata that's required for each file within a training module.
author: skilling-guides-MSFT
ms.author: skilling-guides
ms.date: 03/28/2023
ms.service: learn
ms.topic: contributor-guide
ms.custom: internal-learn-guide
---

# Required metadata for training content

Files published on the Microsoft Learn platform contain [metadata](/help/platform/metadata-glossary?branch=main). Metadata is a critical aspect of content on Microsoft Learn. You must ensure you enter the correct metadata for your training content (units, modules, learning paths).

In this article, you'll learn:

- What metadata is and why it's important.
- The training files we do and don't capture metadata on.
- When and where to add metadata to training files.
- The required metadata for each training file.

## Overview

We use metadata to capture information about Learn content. Metadata drives customers' search and discovery experiences and key content analytics used to measure things like content engagement. You must add the correct metadata for your training files after you scaffold your module.

:::image type="content" source="images/required-metadata-training-modules/sample-metadata-on-file.png" alt-text="Image of sample metadata on training file.":::

Metadata consists of both an *[attribute](../platform/metadata-glossary.md#attribute)* and a *[value](../platform/metadata-glossary.md#value)*.

- Attributes are case-sensitive.
- The attribute and value must be separated by a colon and space.
  
### Why is metadata important?

Metadata must be precisely and accurately applied to training files to ensure reporting reflects the correct data and site features run as expected. When you create your pull-request (PR), the presence and validity of your module's metadata is automatically checked.

If any of the required metadata is missing or entered incorrectly, your publishing will either be blocked or one of the following problems will occur:

- Reporting won't be precise.
- Your modules might be harder for search engines to index.
- The modules might not publish correctly.
- RSS feeds or site search might not show your content as expected.
- You might experience pushback in PR reviews.

Find more details about [why metadata is required](../platform/metadata-what-is.md#why-is-metadata-required). 

## Adding metadata to training files

Metadata *is* captured on the following training files:
  - Module index file
  - Unit YAML files
  - Learning path index file

Metadata *is not* captured on the following training files:
  - Unit content Markdown files
  - Media files

**To populate metadata on your training files**:

1. Scaffold the module (create the files, folders, and shell for the module). You can either [scaffold the module manually](create-scaffold-manual.md) or use the [Microsoft Learn Scaffolding extension](/help/platform/create-scaffold-template?branch=main).
1. Directly after scaffolding, open the following files:
   - Module index file
   - All unit YAML files
1. Add the required metadata (shown below).
1. Save each file using the file name you created during scaffolding.

## Module index file

The module index file (`index.yml`) lists the metadata and structure for the training at the module-level. You create it during scaffolding. You can either [scaffold the module manually](create-scaffold-manual.md) or use the [Microsoft Learn Scaffolding extension](/help/platform/create-scaffold-template?branch=main).

The following attributes and values are required for the module index file, unless explicitly marked as optional.

> [!NOTE]
> The *ms.prod* and *ms.technology* metadata attributes are being retired from the Learn platform. Starting in January 2024, values in these taxonomies will be consolidated into [ms.service](/help/platform/metadata-taxonomies/msservice) and **ms.subservice** for reporting on content by product.

| Attribute | Value | Additional Information |
| --------- | ------- | ------- |
| `### YamlMime:` | `Module` | Specifies to Microsoft Learn the type of YAML file and metadata to expect. Must be the first line of the YAML file. |
| `uid` | `(repo-name).(team-or-content-area).(module-short-name)` | A manually generated unique ID created by the author to differentiate modules and reference them when building learning paths. Must follow the format shown in the middle column. Use lowercase only, even for the product names. If repo is private (pr), don't include the "-pr" in uid. Example: `learn.github.code-with-github-codespaces`. For more information, see the [Overview of uid](resources-overview-of-uid.md) article. |
| `title` | Module title | The title of the module that appears on the module card and landing page. Use sentence case only, except for the product name, which should be capitalized. Don't use a period at the end of the title. |
| `summary` | A brief summary describing what the module is about | Appears on the main module landing page. Use a period at the end of the summary. |
| `metadata` | Leave the word `metadata` on this line, but don't enter a value next to it | This is just a header for this section of metadata.|
| `metadata` > `title` | Module title | Use sentence case only, except for the product name, which should be capitalized. Don't use a period at the end of the title. This value is the most important metadata for [search engine optimization (SEO)](../contribute/contribute-how-to-write-seo-basics.md). If possible use unbranded terms to help customers find the content and improve SEO. |
| `metadata` > `description` | A description of the module | Used in site search. Sometimes used on a search engine results page for improved [SEO](../contribute/contribute-how-to-write-seo-basics.md). Use a period at the end of the description. |
| `metadata` > `ms.date` | A date in the format MM/DD/YYYY | Indicates the last time the module was substantially edited or guaranteed fresh. This field is used to calculate [freshness in C&E Skilling reports](../contribute/freshness.md). |
| `metadata` > `author` | The author's GitHub alias | Identifies the author by GitHub ID in case there are questions about or problems with the content. In some cases, the author might be notified via GitHub automation of activity involving the file. |
| `metadata` > `ms.author` | The author's Microsoft alias, without '@microsoft.com' | Used for content reporting and BI. |
| `metadata` > `ms.topic` | Must be one of these values: `module-build-your-first`, `module-challenge-project`,`module-choose-best-product`, `module-guided-project`, `module-intro-to-product`, or `module-standard-task-based` | The type of module. If the module doesn't follow one of [the module patterns](../patterns/level4/index.md#module-templates) (in middle column), enter `module` for the value. |
| `metadata` > `ms.prod` or `ms.service` |Must be a single value from [ms.prod](/help/platform/metadata-taxonomies/msprod) or [ms.service](/help/platform/metadata-taxonomies/msservice). Include *either* `ms.prod` or `ms.service`, *but never both*. |This value is used **only in internal-facing content reporting**. It is separate from the [Products](/help/platform/metadata-taxonomies/msprod) that customers see on the module tile or the Product filter on the [training browse page](/training/browse/). We're no longer using the format `learning-<product>` so we can gather reporting across modalities. |
| `abstract` | Module learning objectives | The abstract allows learners to make an informed decision about whether to go ahead with the module or not. It should follow the format "By the end of this module, you'll be able to:" and then a bulleted list of action-oriented learning objectives. |
| `prerequisites` | Bulleted list of module prerequisites or the word `None` | This value appears on the module tile so that learners can make an informed decision about taking the specific module. |
| `iconUrl` | `/training/achievements/<module-folder-name>.svg` | The link to the module image shown on the module landing page. This image is the same image as the badge awarded for completing the module. If you don't have the final badge image, enter this as a placeholder: `http://via.placeholder.com/120x120` or this as a temporary generic badge: `/training/achievements/generic-badge.svg`. |
| `ratingEnabled` | By default, enter `false` | Only modules that are part of the module ratings feature need to have this set to true. |
| `levels` | Must be one of the [values](/help/platform/metadata-taxonomies/level) in the [Level](/help/platform/metadata-taxonomies/level) taxonomy| Appears on the module tile to help learners decide whether the module is suitable for them or not. Also drives discoverability through the [Microsoft Learn training browse page](/training/browse/) filters. These are arrays of strings - make sure to append the values with a `-`. |
| `roles` | Must be one or more of the [values](/help/platform/metadata-taxonomies/role) in the [Role]() taxonomy| Appears on the module tile to help learners decide whether the module is suitable for them or not. Also drives discoverability through the [Microsoft Learn training browse page](/training/browse/) filters. These are arrays of strings - make sure to append the values with a `-`. |
| `products` |Must be one or more [values](/help/platform/metadata-taxonomies/product) from the [Product ](/help/platform/metadata-taxonomies/product)taxonomy| Appears on the module tile to help learners decide whether the module is suitable for them or not. Also drives discoverability through the [Microsoft Learn training browse page](/training/browse/) filters. These are arrays of strings - make sure to append the values with a `-`. |
| `subjects` |Must be one or more [values](/help/platform/metadata-taxonomies/subject) from the [Subject](/help/platform/metadata-taxonomies/subject) taxonomy| Appears on the module tile to help learners decide whether the module is suitable for them or not. Also drives discoverability through the [Microsoft Learn training browse page](/training/browse/) filters. These are arrays of strings - make sure to append the values with a `-`. |
| `units` | `(module uid).(unit-short-name)` | Manually generated unique IDs created by the author to differentiate each unit within a module. Must follow format shown in middle column. Example: `learn.github.code-with-github-codespaces.personalize-your-codespace`. Each one should exactly match the unit `uid` metadata on that unit's YAML file. List them in the order they should be displayed to the learner. For more information, see the [Overview of uid](resources-overview-of-uid.md) article. |
| `badge` > `uid` | `(module uid).badge` | A globally unique ID created by the author for the achievement badge. Example: `learn.github.code-with-github-codespaces.badge`. The badge appears on successful completion of the module. |

## Unit YAML files

A unit YAML file (`unit-name.yml`) contains the metadata for a unit. Each unit within your module needs to have its own corresponding unit YAML file. You create the unit YAML files during scaffolding. You can either [scaffold the module manually](create-scaffold-manual.md) or use the [Microsoft Learn Scaffolding extension](/help/platform/create-scaffold-template?branch=main).

The following attributes and values are required for the unit YAML files, unless explicitly marked as optional.

| Attribute | Value | Additional Information |
| ------- | ----- | -------- |
| `### YamlMime:` | `ModuleUnit` | Specifies to the Microsoft Learn platform the type of YAML file and metadata to expect. Must be the first line of the YAML file.|
| `uid` | `(module uid).(unit-short-name)` | A manually generated unique ID created by the author to differentiate units within a module. Must follow the format shown in the middle column. Example: `learn.github.code-with-github-codespaces.personalize-your-codespace`. Should exactly match the unit's uid listed in the `units` metadata on the index.yml file. For more information, see the [Overview of uid](resources-overview-of-uid.md) article.|
| `title` | Unit title | The title of the unit that appears in the header, TOC, and breadcrumbs. Use sentence case only, except for the product name, which should be capitalized. Don't use a period at the end of the title.|
| `metadata` | Leave the word `metadata` on this line, but don't enter a value next to it | This is just a header for this section of metadata.|
| `metadata` > `title` | Unit title | Use sentence case only, except for the product name, which should be capitalized. Don't use a period at the end of the title. This value is the most important metadata for [search engine optimization (SEO)](../contribute/contribute-how-to-write-seo-basics.md). If possible use unbranded terms to help customers find the content and improve SEO. |
| `metadata` > `description` | A description of the unit | Add a meaningful description for your unit, or add this blurb "This content is a part of [_module title_]". Use a period at the end of the description. During scaffolding, the description can be the same as the title. Used in site search. Sometimes used on a search engine results page for improved SEO.|
| `metadata` > `ms.date` | A date in the format MM/DD/YYYY | Indicates the last time the module was substantially edited or guaranteed fresh. This field is used to calculate [freshness in C&E Skilling reports](../contribute/freshness.md). |
| `metadata` > `author` | The author's GitHub alias | Identifies the author by GitHub ID in case there are questions about or problems with the content. In some cases, the author might be notified via GitHub automation of activity involving the file.|
| `metadata` > `ms.author` | The author's Microsoft alias, without '@microsoft.com' | Used for content reporting and BI.|
| `metadata` > `ms.topic` | Must be this value: `unit` | Indicates Unit item. Used for BI & Content Engagement reporting |
| `durationInMinutes` | The amount of time it takes to complete the unit, in minutes | The author determines this value. It appears in each unit under the title. The duration for each unit is then automatically added up to define the duration for the entire module, which displays on the module tile. |
| `content` | Source of the content | The source of the actual content is the unit's Markdown file. Reference the content via an `include` tag that points to the Markdown file. For example: `[!include[](includes/6-generate-app-manifest-service-worker.md)]`. At the scaffolding stage, create a blank Markdown file for the unit and refer to the Markdown file here with the `include` tag. If the unit is knowledge check only (no content - only knowledge check questions), leave the `content` attribute in the metadata, but don't add a value next to it. |

**The following metadata are also required if the unit contains any knowledge check questions.**

| Attribute | Value | Additional Information |
| ------- | ----- | -------- |
| `quiz` | Leave the word `quiz` on this line, but don't add a value next to it | Only applies if unit contains knowledge check questions. This is just a header for this section of metadata. |
| `quiz` > `title` | Title of knowledge check | Only applies if unit contains knowledge check questions. |
| `quiz` > `questions` | Leave the words `quiz` > `questions` on this line, but don't add a value next to it | Only applies if unit contains knowledge check questions. This is just a header for this section of metadata. |
| `quiz` > `questions` > `content` | Knowledge check question | Only applies if unit contains knowledge check questions. |
| `quiz` > `questions` > `choices` | Leave the words `quiz`> `questions` > `choices` on this line, but don't add a value next to it | Only applies if unit contains knowledge check questions. This is just a header for this section of metadata. |
| `quiz` > `questions` > `choices` > `content` | Knowledge check answer option | Only applies if unit contains knowledge check questions. |
| `quiz` > `questions` > `choices` > `isCorrect` | Boolean value if the answer is correct (`true`) or not (`false`) | Only applies if unit contains knowledge check questions. |
| `quiz` > `questions` > `choices` > `explanation` | A hint or explanation why the answer is correct/incorrect | Only applies if unit contains knowledge check questions. |

## Learning path index file (if applicable)

This section refers to metadata for [learning paths](create-a-learning-path.md). Skip this section if it doesn't apply to your module.

The learning path index file is a single YAML file that displays the list of modules and metadata to the learner. The following attributes and values are required for the learning path index file, unless explicitly marked as optional.

| Attribute | Value | Additional Information |
| --------- | ----- | --------------- |
| `### YamlMime:` | `LearningPath` | Specifies to Microsoft Learn the type of YAML file and metadata to expect. Must be the first line of the YAML file. |
| `uid` | `(repo-name).(team-or-content-area).(learning-path-short-name)` | A manually generated unique ID created by the author to differentiate learning paths. Must follow the format shown in the middle column. Use lowercase only, even for the product names. If repo is private (pr), don't include the "-pr" in uid. Example: `learn.edge.create-pwas-with-pwabuilder`. For more information, see the [Overview of uid](resources-overview-of-uid.md) article. |
| `title` | Learning path title | Displayed in the header and breadcrumbs. Use sentence case only, except for the product name, which should be capitalized. Don't use a period at the end of the title. |
| `summary` | A brief summary describing what the learning path is about | Appears on the main learning path page. Can be Markdown. Use a period at the end of the summary. |
| `metadata` | Leave the word `metadata` on this line, but don't enter a value next to it | This is just a header for this section of metadata. |
| `metadata` > `title` | Learning path title | Use sentence case only, except for the product name, which should be capitalized. Don't use a period at the end of the title. This value is the most important metadata for [search engine optimization (SEO)](../contribute/contribute-how-to-write-seo-basics.md). If possible use unbranded terms to help customers find the content and improve SEO. |
| `metadata` > `description` | A description of the learning path | Used in site search. Sometimes used on a search engine results page for improved [SEO](../contribute/contribute-how-to-write-seo-basics.md). Use a period at the end of the description. |
| `metadata` > `ms.date` | A date in the format MM/DD/YYYY | Indicates the last time the module was substantially edited or guaranteed fresh. This field is used to calculate [freshness in C&E Skilling reports](../contribute/freshness.md). |
| `metadata` > `author` | The author's GitHub alias | Identifies the author by GitHub ID in case there are questions about or problems with the content. In some cases, the author might be notified via GitHub automation of activity involving the file. |
| `metadata` > `ms.author` | The author's Microsoft alias, without '@microsoft.com' | Used for content reporting and BI. |
| `prerequisites` | Bulleted list of learning path prerequisites or the word `None` | This appears on the learning path tile so that learners can make an informed decision about taking the learning path. |
| `metadata` > `ms.topic` | Must be this value: `learning-path` | Indicates Learning Path item. Used for BI & Content Engagement reporting |
| `iconUrl` | `/training/achievements/<learning-path-folder-name>.svg` | The link to the learning path image shown on the learning path landing page. This image is the same image as the trophy awarded for completing the learning path. If you don't have the final trophy image, enter this as a placeholder: `http://via.placeholder.com/120x120` or this as a temporary generic trophy: `/training/achievements/generic-trophy.svg`. |
| `levels` |Must be one of the [values](/help/platform/metadata-taxonomies/level) in the [Level](/help/platform/metadata-taxonomies?branch=main) taxonomy| Appears on the learning path tile to help learners decide whether the learning path is suitable for them or not. Also drives discoverability through the [Microsoft Learn training browse page](/training/browse/) filters. These are arrays of strings - make sure to append the values with a `-`. |
| `roles` |Must be one or more of the [values](/help/platform/metadata-taxonomies/role) in the [Role](/help/platform/metadata-taxonomies?branch=main) taxonomy| Appears on the learning path tile to help learners decide whether the learning path is suitable for them or not. Also drives discoverability through the [Microsoft Learn training browse page](/training/browse/) filters. These are arrays of strings - make sure to append the values with a `-`. |
| `products` | Must be one or more [values](/help/platform/metadata-taxonomies/product) from the [Product](/help/platform/metadata-taxonomies?branch=main) taxonomy| Appears on the learning path tile to help learners decide whether the learning path is suitable for them or not. Also drives discoverability through the [Microsoft Learn training browse page](/training/browse/) filters. These are arrays of strings - make sure to append the values with a `-`. |
| `subjects` |Must be one or more [values](/help/platform/metadata-taxonomies/subject) from the [Subject](/help/platform/metadata-taxonomies/subject) taxonomy| Appears on the learning path tile to help learners decide whether the learning path is suitable for them or not. Also drives discoverability through the [Microsoft Learn training browse page](/training/browse/) filters. These are arrays of strings - make sure to append the values with a `-`. |
| `modules` | The module `uid` of each module in the learning path | Each item in this list represents a module in the learning path. The module `uid` is located on the top of each module's index file. List them in the order they should be displayed to the learner. These are arrays of strings - make sure to append the values with a `-`. |
| `trophy` > `uid` | `(learning path uid).trophy` | A globally unique ID created by the author for the achievement trophy. Example: `learn.edge.create-pwas-with-pwabuilder.trophy`. This trophy appears on successful completion of the learning path. |

## Frequently asked questions

### What if none of the `products` values apply to my module?

One of the required metadata attributes is `products`. If none of the values fit your module, don't enter a random product name. This practice is incorrect and highly discouraged.

Here are a few things to consider to determine what `products` value to use:

- Does your module's title, description, or summary reference a specific Microsoft product?

- Does the module feature instructions or screenshots for a specific Microsoft product?

- Does your module teach a skill that can only be completed using a specific Microsoft product?

- If the module applies to two or more Microsoft products, which product is featured/referenced the most within the module?

### Do I need to change the metadata when I make content updates?

The short answer is no. However, here are a few examples of when you *might* need to edit the metadata when updating content in an existing module.

- The module `prerequisites`, `title`, or `description` changes.

- The file owner (`author`/`ms.author`) changes. The only time the `author` and `ms.author` should be changed is if the individual is no longer responsible for the file (role/responsibility change, department reorg, no longer with the company, etc.).

- You make significant content changes to the module. Update the `ms.date` if you make significant content edits or to guarantee the content is fresh.

- You add a new unit to the module. Populate the metadata on the new YAML unit file. Then add the new unit ID to the `units` metadata on the module index file (`index.yml`).

### How do I request a new metadata value or change an existing one?

To request a change to [Products](/help/platform/metadata-taxonomies/product), [Roles](/help/platform/metadata-taxonomies/role), [Subjects](/help/platform/metadata-taxonomies/subject), or [Levels](/help/platform/metadata-taxonomies/level): [Request changes to site-experience taxonomies](/help/platform/metadata-site-experience-requests?branch=main)

To request a change to [ms.prod](/help/platform/metadata-taxonomies/msprod) or [ms.service](/help/platform/metadata-taxonomies/msservice): [Request changes to reporting taxonomies](/help/platform/metadata-reporting-taxonomy-requests?branch=main)

## Related documentation

- [Microsoft Learn Scaffolding extension](/help/platform/create-scaffold-template?branch=main)

- [Scaffold a module manually](create-scaffold-manual.md)

- [Metadata articles in the platform user manual](/help/contribute/metadata-reference?branch=main)






