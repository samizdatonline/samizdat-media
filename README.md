# Samizdat Media Server

Upload, search and stream videos behind the scrambled domain network of samizdat.
See [Samizdat Online](https://samizdatonline.org)

This project uses [StorJ](https://storj.io) as the hosting environment. See [server/StorJ.mjs](https://github.com/samizdatonline/samizdat-media/blob/main/server/StorJ.mjs)

* `/get` - Stream a file from the samizdat bucket.
* `/put` - Upload a file to the samizdat bucket. Files are assigned a random id.
* `/list` - List files uploaded to the samizdat bucket. This is for testing and not viable long term
* `/getfile` - Test code that streams a file from the server disk.

>NOTE: This project is under development and not yet fully functional

## Setup
This project relies on common modules from metric-im that are not yet posted on npmjs. Instead,
clone the following repositories into a folder named `/metric-im` as a sister to `samizdat-media`.

* https://github.com/metric-im/componentry
* https://github.com/metric-im/common-mixin

```
/workspace/samizdat-media
/workspace/metric-im/componentry
/workspace/metric-im/common-mixin
```

### Environment Variables

* AWS_PROFILE - if not set explicitly it will use the `[default]` ~/.aws/config and ~/.aws/credentials
* PORT - 3000 is the default