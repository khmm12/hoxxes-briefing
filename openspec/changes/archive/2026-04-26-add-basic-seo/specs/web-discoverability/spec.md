## ADDED Requirements

### Requirement: Static Root Metadata

The web app SHALL expose crawler-readable metadata from the initial root app shell without requiring client-side JavaScript execution.

#### Scenario: Root document metadata is loaded

- **WHEN** a crawler or browser requests the root HTML document
- **THEN** the document includes the title `Hoxxes Briefing | DRG Deep Dive Board`
- **AND** the document includes a meta description that names `Deep Rock Galactic Deep Dive` and `Elite Deep Dive`
- **AND** the document includes a canonical URL for `https://hoxxes-briefing.vercel.app/`

### Requirement: Social Preview Metadata

The web app SHALL provide OpenGraph and Twitter card metadata for public root-page sharing.

#### Scenario: OpenGraph metadata is loaded

- **WHEN** a social crawler reads the root HTML document
- **THEN** the document includes OpenGraph type, site name, URL, title, description, image, image dimensions, and image alt metadata
- **AND** the OpenGraph title matches the static root title
- **AND** the OpenGraph URL points to `https://hoxxes-briefing.vercel.app/`

#### Scenario: Twitter card metadata is loaded

- **WHEN** a Twitter-compatible crawler reads the root HTML document
- **THEN** the document includes summary large image card metadata with title, description, and image values

### Requirement: OpenGraph Preview Image

The web app SHALL serve a committed static OpenGraph preview image for shared links.

#### Scenario: Preview image is available

- **WHEN** `/og-image.png` is requested from the production web build
- **THEN** the response serves a 1200x630 PNG image suitable for OpenGraph sharing
- **AND** the image uses Hoxxes Briefing-owned visual assets and text

#### Scenario: Preview image is regenerated

- **WHEN** the documented OG image generator is run by a developer
- **THEN** it regenerates `apps/web/public/og-image.png` from repo-owned script logic
- **AND** it does not require adding an npm script alias to `apps/web/package.json`

### Requirement: Crawler Policy

The web app SHALL expose a root `robots.txt` file for crawler policy.

#### Scenario: Robots file is loaded

- **WHEN** `/robots.txt` is requested from the production web build
- **THEN** the file allows crawling of the public web app
- **AND** the file disallows crawling `/api/`
