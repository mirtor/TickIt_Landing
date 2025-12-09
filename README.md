# TickIt Landing

A simple landing page for **TickIt**, a lightweight tasks and notes app.  
This repository contains a static website (HTML/CSS/JS) deployed on **Vercel** plus a **moderated comments** system powered by **GitHub Issues**.

## Main app

- App repository: `mirtor/TickIt`
- App website (login): https://apptasks-49a0a.web.app/login

> The landing links to the app and highlights its core features, PWA installation tips, and FAQ.

---

## What’s inside this repo

```txt
│   index-en.html
│   index.html
│   package.json
│
├── api
│   ├── comments.js
│   └── feedback.js
│
├── img
│   ├── en.svg
│   ├── es.svg
│   ├── screenshots.png
│   └── TickitIcon.svg
│
├── js
│   └── script.js
│
├── pages
│   ├── privacy-en.html
│   └── privacy.html
│
└── styles
    └── styles.css
```

---

## Moderated comments with GitHub Issues

The landing’s comments section does not use a database.  
Instead:

1. A user submits a comment through the form.
2. `POST /api/feedback` creates a **GitHub Issue** with labels:
   - `feedback`
   - `pending`
3. The repository owner reviews the Issue.
4. To approve and publish it on the landing, add the label:
   - `approved`
5. The landing fetches approved comments via:
   - `GET /api/comments`

This approach keeps infrastructure minimal while enabling a clear moderation workflow and an easy-to-audit history.

### Approve / hide / reject

- **Approve:** add the `approved` label.
- **Hide:** remove `approved`.
- **Reject:** close the Issue (optional).

> Approved Issues may remain open; that’s the intended flow.

### View approved comments on GitHub

Use the Issues search in this landing repository with:

`label:feedback label:approved`

Example URL (replace the placeholders):

`https://github.com/mirtor/TickIt_Landing/issues?q=label%3Afeedback+label%3Aapproved`

---

## Deploying on Vercel

1. Push this repository to GitHub.
2. In Vercel, import the project from the repo.
3. No build step is required (static site + `/api` serverless functions).

### Required environment variables

In Vercel → **Settings → Environment Variables**:

- `GITHUB_REPO`  
  Format: `user/repo`  
  Example: `mirtor/TickIt_Landing`
- `GITHUB_TOKEN`  
  A GitHub token with permission to create Issues in the selected repo.

For a public repo, a fine-grained token with **Issues: Read and write** is enough.

---

## Local development

If you open the site with a static server (e.g., Live Server), you may see:

- `GET /api/comments 404`

That’s expected, because serverless functions only run in Vercel.

To emulate production locally:

```bash
vercel dev
```

---

## License & brand

### Code
The code in this repository is licensed under the **MIT License** (see `LICENSE`).

### Brand, name, and media
The **TickIt name, logo, and screenshots** are provided for this project’s identity.  
If you fork or reuse this project, please avoid using the TickIt branding in a way that suggests an official or endorsed version, unless you have permission.

A simple rule of thumb:
- ✅ Feel free to reuse the code.
- ✅ You may replace the logo/name with your own.
- ❌ Don’t ship a public clone that still looks like the official TickIt.

---

## Attribution

If you build upon this landing, a small credit link in your README or footer is appreciated.
