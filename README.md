# Workflowy to LogSeq Converter Utility

![version](https://img.shields.io/badge/version-0.12.0-yellowgreen) ![status - alpha](https://img.shields.io/badge/status-alpha-orange) [![GitHub tag](https://img.shields.io/github/tag/brianclements/wf2ls?include_prereleases=&sort=semver&color=blue)](https://github.com/brianclements/wf2ls/releases/)
[![License](https://img.shields.io/badge/License-MIT-blue)](#license)

This tool attempts to take Workflowy backup files (the Dropbox sync files with
*.backup suffixes), and convert them into LogSeq friendly markdown files.

Workflowy and LogSeq have some fundamentally different approaches to storing
what is essentially pages of lists. Workflowy is one page with everything else
as a list underneath, and pages are virtually constructed via zoom level. While
LogSeq utilizes multiple pages with smaller lists contained therein; amongst
many other things.

So a lot of the conversions require opinionated translations. I've done
my best to make some core features here configurable, but I understand that not
everything can be accounted for.

Here is a list of design and philosophy discrepancies and my solutions to them;
this is also a bit of a roadmap for myself. 

**Anything suffixed with a __*__ indicates that the option/feature is not
implemented yet.**

Click [here](#usage) to jump to usage.

### Complete/Incomplete and Visible/Hidden status of bullets and blocks

In Workflowy, any bullet can be marked as complete (hidden) or incomplete
(visible), while in LogSeq, only TODOs can. I used Workflowy for many years
before they even introduced the specific "todo" type for a bullet, so not all of 
my completed/hidden items are todos, and not all of my todos are of the correct
"todo" type.

My solution here is to introduce 3 levels of conversion:

- **strict** ( _default_ ): Only WF tasks of type "todo", complete or
    incomplete, get converted to LS TODO tasks. If completed, that information
    is recorded by adding a `completed-on::` parameter.
- __permissive*__: Any WF task marked as a "todo" type and any task marked as
    completed, will get converted.
- __heuristic*__: Any WF taks marked as "todo" type (same as strict) as well as
    any tasks that are direct children to bullets with "todo", "tasks", "today",
    "scheduled", "recurring", or "unscheduled "in the name, regardless of
    complete/incomplete status.

I'll admit that "heuristic" is my solution to my own mess, but eventually that
list can be modified and appended to help others in a similar situation if
needed.

### Splitting off new pages

For significantly large Workflowy maps, it's unfeasible to leave every bullet on
one single page. LogSeq also caps each file at 1000 lines anyway (configurable,
yes, but we should take the hint).

So when you have a major section that should be split off into it's own page,
and all of it's children blocks taken with it, then you can add a tag anywhere
in the Workflowy bullet or note, `#LS-Page` by default, to tell the script to
make that block the root level of a new page. The content of that block name
will become the page name, and a link to the new page will be left in it's
place. The notes for said block will be moved to the first block of the new page.
This seemed natural as most of my notes in Workflowy tended to be filled with
metadata-like tags and information anyway and it'll be easier later on to simply
convert these to LogSeq properties for the new page.

### Dates (metadata)

The script is aware of and can convert the internal Workflowy timestamps used
for marking bullets as modified and completed. Right now, it only transfers the
"completed" time to the LogSeq results. It uses the `completed-on::` property
and adds the date in "MMMM dd, yyyy" format as a page link. This isn't currently
configurable but shouldn't be hard to toggle on/off or change the property used.

Transferring the "last modified" time is currently skipped as it might clutter
up the LogSeq notes and might not be that useful outside of `LOGBOOK` entries,
where I could see potential use.

Other formats for the dates can be implemented relatively easily, but are not
yet. Luckily, LogSeq can still recognize a variety of formats, even if they
aren't the users selected viewing preference.

Time zones are a whole different animal. View the comments in `date.js` for
details, but in short, I'm not sure what time zone Workflowy stores it's dates
in or if it takes into account daylight saving or not. Right now, the script
assumes the timestamps are in Pacific time (where I'm located), and outputs them
to the same. This assumption works accurately for me down to the second. Time
zones could easily be converted, but more sample data from other time zones is
needed to know what Workflowy is doing internally.

### Collapsing *

Every top-level block of a page should be collapsed by default. This is the
safest thing to do for potentially large lists that get brought over from
Workflowy. In LogSeq, this is done by adding an invisible property `collapsed::
true`.  Eventually, four useful options could be used here:

- **collapse top** ( _default_ ): Every top level page block is collapsed, every
    child block is not.
- **collapse none**: Collapse nothing.
- **collapse all**: Collapse everything on every level.
- **collapse top and deep**: A potential compromise where every top level page
    block is collapsed, plus every child of _n + 1_ depth going forward.


### Dates (built-in tags) *

Not implemented yet. Workflowy uses `<time>` elements which LogSeq will
display fine, but they need to be converted to actual page links to be of any
use.

### Tagging *

Tags using the octothorpe `#` are just text in both Workflowy and LogSeq that
get handled differently. They are both used to apply metadata, but in Workflowy,
clicking them starts a search and filters the screen, whereas in LogSeq,
clicking navigates to a page devoted to that tag. 

I think the best way to proceed is to let tags remain where they are by default,
and have certain reserved tags (see `#LS-Page` above) inform this script to do
certain things (add properties, convert nodes), or perform certain functions to
the tag itself (replace text, or delete all together).

### Bullet Layouts *

Workflowy has a variety of layouts for bullets. These include:

- standard bullet
- h1
- h2
- p
- board (kanban)
- quote-block
- code-block

These are marked by entries in the `"metadata": {"layoutMode"}` node. They should
be easy to find and apply corresponding markdown formatting to.

### Convert "Bookmarks" to Regular Links *

For a very long time, I used Workflowy as location to dump URLs for both
read-it-later use and for browser bookmarking. Because of browser
extensions, these ended up in in only 2 formats:

#### URL as own bullet:

![](./docs/bookmark-double-bullet.png)

#### URL as note:

![](./docs/bookmark-as-note.png)

In either case, the script will convert both to a standard markdown website link
in the note title of a single new block:

`[Google](https://www.google.com)`

This will be off by default and switched on when needed.

### Text Formatting *

Workflowy uses standard HTML for bold, italic, underline, strikethrough and a
some inline css and spanning to mark text color and highlights. These should be
converted to markdown versions in the output, but LoqSeq can currently display
them accordingly. 

### Handling of "@" tags *

At some point, when Workflowy started adding the comments functionality, these
tags stopped being simple text and started looking like: `<mention id="0"
by="286081" ts="78190234"> </mention>`. I don't see any way yet to extract the
actual content of these custom tags from the backup files. Perhaps in the
future, I'll be able to make this tool work in the browser on top of a logged-in
instance of the webapp, but that is not my focus right now as I did not really
use the tags or any multi-user features.

This script will handle these by inserting the `by` information with the `@`
tag. This the above example, this would be `@286081`. This way, one can at least
figure out via context who was referenced and then via find/replace text tools,
convert all the instances.

### Comments *

Not yet implemented. Luckily these are stored as children to the node, so it's a
question of how to display them in LogSeq.

### Templates *

Workflowy doesn't do much internally with templates. It seems the `#template`
and `#use-template` tags could be enough to convert to LogSeq templates by
adding appropriate properties. Note: the hash after `#use-template` tags are the
last segment of the UUID id that it is referencing. So
`#use-template:c780314ecc28` is pointing to a node with an id of
`6189a3c9-3093-5579-664e-c780314ecc28`.

### File Uploads *

Unfortunately, these are not contained within the backup file itself, but the
file name, type, and the name of the S3 bucket are. These are going to be a bit
more complex to retrieve within the script, so what I'll probably do first is
create a placeholder in the correct location in the markdown output, complete
with the file information and a dead link to where the file would be if it was
correctly in assets, then create a new page with a list of missing files as a
TODO list. One will be able to easily go through, download manually to assets,
then the dead links will start to work normally.

## Usage

1) Download source

    ```
    git clone https://github.com/brianclements/wf2ls.git wf2ls
    cd wf2ls
    ```

2) Install dependencies (~15mb)

    `npm install`

3) Testing (optional)

    `npm run test`

4) Run the conversion script

    at minimum: `npm run cli-convert -- -s "./workflowy.backup"`

    or

    `npm run cli-convert -- -c "../config.json"`

    or optionally

    `npm run cli-convert -- -s "./workflowy.backup" -d "./output"`


**NOTE:** Both `workflowy.backup` and any `config.json` must be proper JSON files.

These are the only three CLI arguments possible. There are many configuration
options pertaining to script behavior and conversions, and they are best
contained in a configuration file.

### Configuration

A sample configuration can be found in the root of the source directory, called
`config_file_example.json`.

It contains the following:

```json
[
  {
    "sourceFile": "",
    "destDir": "./output",
    "newPageTag": "#LS-Page",
    "indentSpaces": 2,
    "defaultPage": "Workflowy Imports"
  }
]
```

The script handles configuration loading in the following order:

1) Built-in default configuration is the same as the sample configuration file above.
2) The script then checks for an optional configuration file in the source root
   named `config.json`
3) Then, the CLI option `-c` can specify a configuration file in a custom
   location
4) If `-s` `-d` are provided along with `-c`, the settings for just the source
   file and destination directory in the configuration file will be ignored and the
   CLI options will take precedent. All other options in the configuration file
   will still take effect.

## Credits

Initial inspiration from [@banjerluke/workflowy-to-logseq](https://github.com/banjerluke/workflowy-to-logseq)

## License

Released under [MIT](/LICENSE) by [@brianclements](https://github.com/brianclements).
