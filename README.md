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
Storj requires **go**. See https://go.dev/doc/install. Download https://go.dev/dl/go1.19.3.linux-amd64.tar.gz, then
```bash
sudo su
rm -rf /usr/local/go && tar -C /usr/local -xzf go1.19.3.linux-amd64.tar.gz
exit
cd /opt/samizdat-media # or wherever
export PATH=$PATH:/usr/local/go/bin
npm install uplink-nodejs 
```

### Environment Variables

* AWS_PROFILE - if not set explicitly it will use the `[default]` ~/.aws/config and ~/.aws/credentials
* PORT - 3000 is the default