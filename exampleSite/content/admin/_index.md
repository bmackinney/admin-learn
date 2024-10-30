---
title: Admin
collections:
  - import: collection admin-hugo-pages
    collection_type: import
menus:
  - admin
  - adminHelp
cascade:
  - outputs:
      - HTML
      - scms_config
      - help
    cms: https://unpkg.com/@sveltia/cms/dist/sveltia-cms.js # The JS CMS that reads Netlify CMS-descendant config.yml files. 
    config:
      backend:
        branch: main
        name: github
        repo: MicrosoftDocs/learn-pr
      media_folder: media
      public_folder: training
      logo_url: "/images/ms-learn.svg"
    type: admin
draft: false

---
 
