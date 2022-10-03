# Samizdat Media Server

Upload, search and stream videos behind the scrambled domain network of samizdat.
See [Samizdat Online](https://samizdatonline.org)

This project uses [StorJ](https://storj.io) as the hosting environment. See [./server/StorJ.mjs]()

* `/get` - Stream a file from the samizdat bucket.
* `/put` - Upload a file to the samizdat bucket. Files are assigned a random id.
* `/list` - List files uploaded to the samizdat bucket. This is for testing and not viable long term
* `/getfile` - Test code that streams a file from the server disk.

>NOTE: This project is under development and not yet fully functional
