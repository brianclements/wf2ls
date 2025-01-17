# Workflowy to LogSeq Converter Utility

![version](https://img.shields.io/badge/version-0.20.0-yellowgreen) ![status - alpha](https://img.shields.io/badge/status-alpha-orange) [![GitHub tag](https://img.shields.io/github/tag/brianclements/wf2ls?include_prereleases=&sort=semver&color=blue)](https://github.com/brianclements/wf2ls/releases/)
[![License](https://img.shields.io/badge/License-MIT-blue)](#license)

This tool takes Workflowy backup files (the Dropbox sync files with *.backup
suffixes), and convert them into LogSeq friendly markdown files.  It uses
[turndown](https://github.com/mixmark-io/turndown) for the html to markdown
conversion and [linkifyjs](https://github.com/nfrasser/linkifyjs) for link
detection.

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
{
  "collapseMode": "top",
  "collapseDepth": 3,
  "compressBookmarks": false,
  "dateFormat": "yyyy-MM-dd",
  "defaultPage": "Workflowy Imports",
  "destDir": "./output",
  "indentSpaces": 2,
  "mirrorStyle": "embed",
  "textColorMarkupMode": "default",
  "newPageTag": "#LS-Page",
  "sourceFile": ""
}
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

## Background

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
and adds the date in format specified in the `dateFormat` setting as a page link.
Transferring the "last modified" time is currently skipped as it might clutter
up the LogSeq notes and might not be that useful outside of `LOGBOOK` entries,
where I could see potential use.

Luckily, LogSeq can still recognize a variety of formats, even if they
aren't the users selected viewing preference.

Time zones are a whole different animal. View the comments in `date.js` for
details, but in short, I'm not sure what time zone Workflowy stores it's dates
in or if it takes into account daylight saving or not. Right now, the script
assumes the timestamps are in Pacific time (where I'm located), and outputs them
to the same. This assumption works accurately for me down to the second. Time
zones could easily be converted, but more sample data from other time zones is
needed to know what Workflowy is doing internally.

If you have sample data to contribute from non PST timezones, please share!

### Dates (built-in tags)

Workflowy implements dates, times, and ranges as such:

`<time startYear=\"2024\" endYear=\"2024\" startMonth=\"10\" endMonth=\"10\" startDay=\"31\" endDay=\"31\" startHour=\"10\" endHour=\"11\" startMinute=\"0\" endMinute=\"0\">Thu, Oct 31, 2024 at 10:00am - Thu, Oct 31, 2024 at 11:00am</time>`

LogSeq has first class support for single dates in the form of page links to
journal days (`[[ 2024-10-31 ]]` for example), but times are simply dropped in
as text after a date tag. They are neither searchable or taggable (`[[
2024-10-31 ]] at 10:00 am`).

Currently, single dates are converted accordingly. Time support in 12 and 24 hour
formats is pending*.

Every date format that LogSeq supports is supported in the conversion. The
options in the configuration are set with the `dateFormat` key in the options
json file, and the values are exactly the format listed in `LogSeq Settings ->
Editor -> Preferred date format` menu.

LogSeq also doesn't really have support for date ranges in the same way that
Workflowy does. In Workflowy, one can specify a date range tag, and that item
will continue to show up in searches for dates that fall in that range.

In order for LogSeq to have the same behavior, one must actually link each day
in the date with the original block or page. There are two ways to do this, for
a date range of 2024-10-28 through 2024-10-31:

1) Add a date page link for every day that falls within the range, so that
the page shows up in the LogSeq journal or in searches for dates.
  - Example:

    ```
    - Original block
      [[ 2024-10-28 ]]
      [[ 2024-10-29 ]]
      [[ 2024-10-30 ]]
      [[ 2024-10-31 ]]
    ```

2) Add a copy of, or reference to, the original page on each journal page for
the dates within the range.
  - Example:

    ```
    Journal page for 2024-10-28
      - ((6781812d-890e-410e-86f1-d2c7fb3f8485)) <- this is a block reference to
        the original block
    ```

    ```
    Journal page for 2024-10-29
      - ((6781812d-890e-410e-86f1-d2c7fb3f8485)) <- this is a block reference to
        the original block
    ```

    ```
    Journal page for 2024-10-30
      - ((6781812d-890e-410e-86f1-d2c7fb3f8485)) <- this is a block reference to
        the original block
    ```

    ```
    Journal page for 2024-10-31
      - ((6781812d-890e-410e-86f1-d2c7fb3f8485)) <- this is a block reference to
        the original block
    ```

Another possibility is the use of LogSeqs `SCHEDULED` with a daily repeater and
`DEADLINE` to mark the end of the range. I would imagine all these possibilities
are heavily dependent on context. I'm not even sure which I prefer yet for my
own data as I see possibilities for each.

### Collapsing

Every top-level block of a page is collapsed by default. This is the
safest thing to do for potentially large lists that get brought over from
Workflowy. In LogSeq, this is done by adding an invisible property `collapsed::
true`. The possible values of `collapseMode` are:

- **top** ( _default_ ): Every top level page block is collapsed, every
    child block is not.
- **none**: Collapse nothing.
- **all**: Collapse everything on every level.
- **shallow**: A potential compromise where every top level page
    block is collapsed, plus every child of `collapseDepth` depth going forward.

**Note**: Regardless of which setting, only blocks with children get the text
appended.

The default value of `collapseDepth` is 3 and is only observed when used with
the `shallow` option. A `collapseDepth` of 1 is functionally equivalent to a
`collapseMode` of `top`.

### Tagging *

Tags using the octothorpe `#` are just text in both Workflowy and LogSeq that
get handled differently. They are both used to apply metadata, but in Workflowy,
clicking them starts a search and filters the screen, whereas in LogSeq,
clicking navigates to a page devoted to that tag. 

I think the best way to proceed is to let tags remain where they are by default,
and have certain reserved tags (see `#LS-Page` above) inform this script to do
certain things (add properties, convert nodes), or perform certain functions to
the tag itself (replace text, or delete all together).

### Bullet Layouts

Workflowy has a variety of layouts for bullets. These include:

- standard bullet
- todo
- h1
- h2
- p
- board (kanban) *
- quote-block
- code-block

These are marked by entries in the `"metadata": {"layoutMode"}` node in the
backup file and are converted accordingly to the appropriate markdown formatting
that LogSeq expects. Kanban boards aren't yet implemented but will probably use
the [logseq-kanban-plugin](https://github.com/benjypng/logseq-kanban-plugin).

### Compress "Bookmarks"

For a very long time, I used Workflowy as location to dump URLs for both
read-it-later use and for browser bookmarking. Because of browser
extensions, these ended up in in only 2 formats:

#### URL as own bullet:

![](./docs/bookmark-double-bullet.png)

#### URL as note:

![](./docs/bookmark-as-note.png)

In either case, the script can collapse and convert both styles to a standard
markdown website link in the note title of a single new block:

`[Google](https://www.google.com)`

This will be `false` by default and switched on when needed using
`compressBookmarks` configuration setting. In the "URL as own bullet" example,
if the parent node has any note text, it will be preserved.

### Text Formatting *

Workflowy uses standard HTML for bold, italic, underline, strikethrough and a
some inline css and spanning to mark text color and highlights. While LoqSeq can
currently display inline html, these should should be converted to markdown
versions accordingly and use already existing plugins for things like highlights
and text colors wherever possible.

Currently implemented:

- bold
- underline
- italic
- strikethrough
- Highlights or text coloring <sub>(_* partially implemented, see below_)</sub>

For text highlighting and text color, LogSeq doesn't support as many colors as
Workflowy. So unsupported colors have been mapped to existing ones by default.
These mappings cannot be changed at this time.

Work to support all the colors and handle text color and highlights in a unified
way will be handled with support of a plugin,
[logseq-color-markup](https://github.com/brianclements/logseq-color-markup). To
make use of the plugin during conversion, set `"textColorMarkupMode": "plugin"`
in your `config.json` file.

Workflowy also supports the use of background colors for `#` tags, but this
information does not show up in the data itself so it is not extracted.

### Mirrors

Workflowy has a concept of mirrored nodes, where the content of one node can
live simultaneously in multiple locations as if they were there natively. When
you update one, the other is updated automatically. Workflowy mirrors are
read/write by default.

LogSeq has two variants of this. One is block embedding and the other is block
referencing. References are read-only in view mode, and in edit mode and their
content looks like `((67882c26-0fd2-430f-a51f-a569b86ac76f))`. Clicking on them
in view mode will redirect you to the source node for editing. 

Block embedding, however, is a bit clunkier looking, but you can edit it in
place without having to navigate elsewhere. Its content in edit mode looks
like `{{embed ((67882c26-0fd2-430f-a51f-a569b86ac76f))}}`, but in edit mode, the
referenced node is editable. While both styles are supported, the block
embedding is functionally more equivalent to Workflowys mirrors, so it is the
default translation here.

The setting `mirrorStyle` accepts either `embed` (_default_) or `reference`.

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

## Credits

Initial inspiration from [@banjerluke/workflowy-to-logseq](https://github.com/banjerluke/workflowy-to-logseq)

## License

Released under [MIT](/LICENSE) by [@brianclements](https://github.com/brianclements).
