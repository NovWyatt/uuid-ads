<img src="extension/icons/icon-128.png" alt="" width="72" height="72">

# Facebook Group Members Scraper

Collects the members of a Facebook group and exports them to an Excel (.xlsx) or CSV file. It is a browser extension for Brave, Chrome and Edge. Member data stays in your browser: no account, no proxy, nothing uploaded. It needs a license key and contacts the license server only to check that key.

![Scraper panel in light and dark mode](statics/scraper-panel.png)

The panel follows Facebook's display language (Vietnamese when Facebook is set to Tiếng Việt, English otherwise) and its light or dark mode.

Not affiliated with Meta or Facebook.

## Install and use

The panel shows up by itself on every Facebook group page.

**Install**

1. Download **[fb-group-members-scraper.zip](https://github.com/NovWyatt/uuid-ads/releases/latest/download/fb-group-members-scraper.zip)** from the [latest release](https://github.com/NovWyatt/uuid-ads/releases/latest).
1. Unzip it somewhere you will keep it, such as your Documents folder. You get a folder named `fb-group-members-scraper`. The browser loads the extension from that folder, so do not delete or move it afterwards.
1. Open the extensions page: `brave://extensions`, `chrome://extensions` or `edge://extensions`.
1. Turn on **Developer mode**.
1. Click **Load unpacked** and select the `fb-group-members-scraper` folder (the one that holds `manifest.json`).

**Activate**

1. Click the extension's icon in the toolbar (pin it from the puzzle-piece menu first), or open a Facebook group and click **Enter license key** on the panel.
1. Paste your license key (`UADS-XXXX-XXXX-XXXX-XXXX-XXXX`) and click **Activate**.
1. The panel unlocks by itself. Each key works on a limited number of browsers; to move it to another one, ask the seller to reset its devices.

**Use**

1. Open a Facebook group, then click its **People** tab. Click the tab from the group page rather than reloading on the People tab: the first members Facebook shows on a fresh load may not be captured.
1. Scroll down, or click **Auto scroll** and let the panel scroll for you. It stops by itself after 15 seconds without a new member (end of the list). Click **Stop** to stop earlier.
1. Click **Download Excel**, or **CSV** if you use Google Sheets or another tool.

**Update:** download the ZIP from the latest release again and unzip it over the old folder, replacing its files. Then click the reload button on the extension's card in the extensions page and reload any open Facebook tab (F5): a tab opened before the update keeps running the old version.

## The panel

| Control | What it does |
|---------|--------------|
| Counter | Total members stored in the cache. |
| "from N groups" | Number of different groups captured during this session. |
| Green dot + hint | The dot blinks while members are being captured. The hint tells you what to do next. |
| **Download Excel** | Saves every cached member to `fb-members-<date>.xlsx`: IDs kept exact as text, clickable profile links, bold frozen header row, sized columns. Disabled until something is captured. |
| **CSV** | Same data as `fb-members-<date>.csv` (UTF-8 with BOM), for Google Sheets and other tools. Excel turns long IDs in a CSV into rounded numbers, so use **Download Excel** for Excel. |
| **Auto scroll** / **Stop** | Scrolls the page so Facebook keeps loading members. Stops by itself after 15 seconds without a new member. |
| **Clear** | Deletes the cache. Click once, then click **Confirm?** within 3 seconds. Download your CSV first. |
| Activity | Log of what happened: ready, members added, downloads, clears. |
| Header | Drag it to move the panel. The minimize button shrinks the panel to a small bar that still shows the count. |
| License lock | Without an active license key the panel shows why (no key yet, expired, revoked, needs Internet) and an **Enter license key** button. Members are still captured while it is locked, so you can download them right after activating. |

## Scraped fields

- **Profile Id**: unique Facebook identifier (multi-digit number).
- **Full Name**: first name and last name.
- **Profile Link**: profile URL, `https://www.facebook.com/{{username}}`, or `https://www.facebook.com/profile.php?id={{profile_id}}` when there is no username.
- **Profile Link (Id)**: `https://www.facebook.com/profile.php?id={{profile_id}}`, built from **Profile Id**. It always opens the same person, even after a username change, so you can use it to check an ID.
- **Bio**: profile bio text.
- **ImageSrc**: profile picture URL.
- **GroupId**: Facebook group identifier (multi-digit number).
- **Group Joining Text**: how long the person has been a member, e.g. "Member since XX".
- **Profile Type**: "User" or "Page".

Open the `.xlsx` file in Microsoft Excel, LibreOffice Calc or Google Sheets. Cells that start with `=`, `+`, `-` or `@` (names and bios are typed by members) are stored as plain text and never run as formulas.

## FAQ

- **Does the extension need a license key?**
    - Yes. Get a key from the seller and activate it from the extension's icon. It works offline for 7 days at a time, then checks the key again when it is online.
- **What does the extension send to the license server?**
    - Only what checking the key needs: the key, a random ID made for this browser, the browser's name and the extension version, to `license.wyattos.cyou`. Members you capture never leave your browser.
- **Why does the extension need Developer mode?**
    - It is not published on the Chrome Web Store, which charges a registration fee. Loading it unpacked is free, and you can read every file it runs in the unzipped folder (the same files as `dist/extension` in this repository).
- **How do I remove the panel?**
    - Turn the extension off or remove it on the extensions page. Your captured members stay in the cache.
- **The panel is covering something.**
    - Drag it by its header, or click the minimize button to shrink it to a small bar.
- **How many members can be extracted from one group?**
    - Facebook loads at most about 10,000 profiles in the "People" tab. For bigger groups, collect new members regularly and merge the CSV files in a spreadsheet. **Profile Id** is unique, so you can use it to remove duplicates.
- **Can I extract members from several groups at once?**
    - Yes. Capture one group, open another group without reloading the page, capture again, then click **Download Excel**. Both groups end up in one file, told apart by the **GroupId** column.
- **What does Clear do?**
    - Profiles are cached in your browser (IndexedDB). The cache survives reloads and crashes, and the panel shows "Loaded N from cache" when it starts again. **Clear** deletes the cache. It asks for a second click to confirm.
- **Can I get members' email addresses?**
    - No. Facebook does not expose email addresses, and this tool only collects what is listed above.

## Build it yourself

```
npm install
npm run build
```

This builds the extension into `dist/extension`, the folder the release ZIP holds: the panel from `src/scraper.ts` and the license check from `src/license/` (background service worker, activation popup and the bridge between them and the panel).

```
npm test
```

Runs the license certificate tests in `test/` with Node's built-in test runner (Node 22.18 or newer).

## Credits

Based on [floriandiud/facebook-group-members-scraper](https://github.com/floriandiud/facebook-group-members-scraper). Icons by [Phosphor Icons](https://phosphoricons.com) (MIT). Released under the [MIT License](LICENSE).
