# Submit a channel

Users can add new channels in one of three ways:

1. Open a GitHub issue using the channel issue template.
2. Create a pull request that updates `data/seed-channels.json`.
3. Use the submit button in the web UI to open the issue form.

## Required fields

- name
- category
- group
- url

## Example entry

```json
{
  "name": "BBC One",
  "category": "news",
  "tvgId": "bbc1.uk",
  "group": "News",
  "logo": "https://example.com/bbc-one.png",
  "url": "https://example.com/streams/bbc-one.m3u8"
}
