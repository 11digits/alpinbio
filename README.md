# ttctrack
TotalClean Track app

# cleaning-task-app

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```


The app is called TotalClean Track and should have the following screens and features:

Login Screen

Simple PIN-based login (4-digit PIN).

Numeric keypad UI with Tailwind-styled buttons.

"Login" button at the bottom.

Home Dashboard

Shows cleaning areas (e.g., Main Office Floor, Kitchen Area, Restrooms, Conference Room).

Each area displays a list of today’s cleaning tasks with status labels:

Pending (red badge)

In Progress (blue badge)

Completed (green badge)

Each area has two action buttons:

Start Task (blue button) → opens QR scanner to begin.

Finalize Task (blue button) → opens QR scanner to finish.

"Extra Options" link at the bottom.

Start Task Screen

Large QR scan box with instructions: "Scan the QR code for the area to begin."

"Scan QR Code" button styled with Tailwind.

Finalize Task Screen

QR scan box with instructions: "Scan the QR code to mark the cleaning task as finalized."

"Scan QR Code" button.

Upload section: "Add photos of irregularities" (camera/gallery button).

Notes textarea for writing observations.

Operator Options Screen

Shows a list of employees with avatars, names, and task counts.

Expandable to view assigned/unassigned tasks.

Navigation (always visible at bottom)

Home

Start Task

Finalize Task

Options

Icons + labels, styled with Tailwind.

UI/UX Requirements:

Mobile-first, clean, and modern design.

Rounded cards, shadow, and padding for task sections.

Tailwind utility classes for spacing, font sizes, and responsive layout.

Use Vue Router for screen navigation.

Use dummy JSON data for tasks, users, and statuses.
