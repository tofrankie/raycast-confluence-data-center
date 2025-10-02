# Confluence Data Center

A Raycast extension for searching Confluence Data Center content with advanced filters and CQL syntax support.

## ⚙️ Setup Required

On first use, you'll need to provide:

- **Confluence Domain**: e.g., `wiki.yourcompany.com` (without `https://`)
- **Confluence Personal Access Token**: Create it from Confluence → Profile → Personal Access Tokens → Create token
- **Cache Confluence User Avatars**: Enable if your Confluence requires authentication to access avatars (some domains may block direct avatar access)
- **Results Per Page**: Number of search results to display per page (default: `20`)

> 💡 Keep your access token secure and don't share it with others.

> 🖼️ Avatar Caching: Some Confluence instances require authentication to access user avatars. When enabled, avatars are downloaded using your Personal Access Token and cached locally to display creator/contributor avatars properly.

> 📁 Avatar Cache Location: `/tmp/raycast-confluence-data-center/confluence/avatars`

> 💡 Pagination Tip: If pagination doesn't trigger properly, try increasing the page size to ensure results exceed the Raycast window height.

## ✨ Features

- **🔍 Advanced Search** - Search Confluence content with intelligent filters
- **🎯 Smart Filters** - Filter by creator, contributor, favorites, mentions, and more
- **📝 CQL Support** - Use Confluence Query Language for advanced searches
- **⚡ Fast Results** - Quick access to pages, blog posts, and attachments
- **🔗 Direct Actions** - Open, edit, copy links, and manage favorites
- **📄 Smart Pagination** - Seamless infinite scroll with configurable page size (default: 20 results per page)
- **⚙️ Customizable Settings** - Adjust results per page to optimize your workflow

## 📄 License

MIT
