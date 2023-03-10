/**
 * StorJ component for storing and retrieving files from a distributed
 * community storage network
 *
 * See https://storj-thirdparty.github.io/uplink-nodejs/#/library for docs
 */

import UplinkNodejs from 'uplink-nodejs';
import fileUpload from 'express-fileupload';
import express from 'express';
import fs from 'fs';
import fsAsync from 'fs/promises';
import axios from 'axios';
import { Readable } from 'stream';
import {StorjService} from "./StorjService.mjs"
import {spawn} from "child_process"
import FFMPEG_PATH from 'ffmpeg-static'

const CACHE_DIRNAME = new URL('../.cache/', import.meta.url).pathname;

const createPreview = (videoPath, previewPath) => {
    const ffmpeg = spawn(`"${FFMPEG_PATH}"`, [
        "-y", "-i", `"${videoPath}"`, "-frames 1", `-q:v 0`, `-vf "scale=320:180:force_original_aspect_ratio=decrease,pad=320:180:(ow-iw)/2:(oh-ih)/2,setsar=1"`, `"${previewPath}"`
    ], { shell: true })

    let stderr = ''

    return new Promise(async (resolve, reject) => {
        ffmpeg.stderr.on('data', (data) => {
            stderr += data.toString()
        })
        ffmpeg.stderr.on('error', (err) => {
            reject(err)
        })
        ffmpeg.on('exit', (code, signal) => {
            if (code !== 0) {
                const err = new Error(`ffmpeg exited ${code}\nffmpeg stderr:\n\n${stderr}`)
                reject(err)
            }
            if (stderr.includes('nothing was encoded')) {
                const err = new Error(`ffmpeg failed to encode file\nffmpeg stderr:\n\n${stderr}`)
                reject(err)
            }
        })

        ffmpeg.on('close', resolve)
    }).then(async () => {
        const image = await fsAsync.readFile(previewPath)

        await fsAsync.unlink(videoPath)
        await fsAsync.unlink(previewPath)

        return image
    })
}

export default class StorJ {
    constructor(connector) {
        this.connector = connector;
        this.bucket = "video";
        this.storjService = new StorjService({bucket: this.bucket})
    }
    static async mint(connector) {
        let sj = new StorJ(connector);
        let libUplink = new UplinkNodejs.Uplink();
        let access = await libUplink.requestAccessWithPassphrase(
          connector.profile.STORJ.SATELLITE_URL, connector.profile.STORJ.APIKEY, connector.profile.STORJ.PASSPHRASE
        );
        // let access = await libUplink.parseAccess(process.env.ACCESS);
        sj.project = await access.openProject();

        await sj.storjService.bootstrap({
            SATELLITE_URL: connector.profile.STORJ.SATELLITE_URL,
            APIKEY: connector.profile.STORJ.APIKEY,
            PASSPHRASE: connector.profile.STORJ.PASSPHRASE,
        })
        return sj;
    }
    routes() {
        let router = express.Router();
        router.use(fileUpload({ limit: 200 * 1024 * 1024 }));
        router.get("/list", async (req, res) => {
            try {
                let list = await this.project.listObjects(this.bucket, null);
                let result = Object.values(list).map(val => {
                    return `<li><a href='/get/${val.key}'>${val.key}</a></li>`
                });
                res.send(`<html><body><ul>${result}</ul></body></html>`);
            } catch (e) {
                console.error(e);
                res.status(500).send();
            }
        });
        /**
         * This is intended to stream a file from the storj network to the browser as
         * it is being downloaded. But it doesn't work.
         */
        router.get("/get/:id", async (req, res) => {
            try {
                let range = req.headers.range;

                let start = 0;
                let end = -1;
                let opts = new UplinkNodejs.DownloadOptions(start, end);
                console.log(range)
                if (range) {
                    let [start, end] = range.replace(/bytes=/, "").split("-");
                    start = parseInt(start, 10);
                    end = end ? parseInt(end, 10) : -1
                    opts.offset = start;
                    opts.length = end - start;
                }
                if (start == 0 && end == -1) {
                    range = null;
                }

                let download = await this.project.downloadObject(this.bucket, req.params.id, opts);
                let info = await download.info();
                let objectSize = info.system.content_length;
                const BUFFER_SIZE = 8000;


                if (range) {
                    const headers = {
                        "Content-Range": `bytes ${start}-${end}/${objectSize}`,
                        "Accept-Ranges": "bytes",
                        "Content-Length": opts.length,
                        "Content-Type": "video/mp4",
                    };
                    console.log(headers);
                    res.writeHead(206, headers);
                } else {
                    const headers = {
                        "Content-Length": objectSize,
                        "Content-Type": "video/mp4",
                    };
                    console.log(headers);
                    res.writeHead(200, headers);
                }

                let loop = true;
                let totalRead = 0;
                while (loop) {
                    // Reading data from storj V3 network
                    let buffer = Buffer.alloc(BUFFER_SIZE);
                    await download.read(buffer, buffer.length
                    ).then(async (bytesread) => {
                        await res.write(buffer.subarray(0, bytesread.bytes_read))
                        totalRead += bytesread.bytes_read;
                        if (totalRead >= objectSize) {
                            loop = false;
                        }
                    }).catch((err) => {
                        console.log("Failed to read data from storj V3 network ");
                        console.log(err);
                        loop = false;
                    });
                }
                console.log("totalRead " + totalRead);

            } catch (e) {
                console.error(e);
                res.status(500).send();
            }
        });

        router.put("/stage",async (req,res) => {
            try {
                let ext = req.body.type.split('/')[1]
                let id = this.connector.idForge.datedId();
                let fileId = id + "." + ext;
                let result = await axios.put(this.connector.profile.server+'/media/'+id,{
                    description:req.body.description,
                    type:ext,
                    file:fileId,
                    language:req.body.language,
                    tz:req.body.tz,
                    size:req.body.size,
                    captured:req.body.captured,
                    status:"staged"
                });
                res.json(result.data);
            } catch (e) {
                console.error(e);
                res.status(500).send();
            }
        })

        router.put("/upload/:id", async (req, res) => {
            try {
                // get the staged object from the admin database
                let result = await axios.get(this.connector.profile.server+'/media/'+req.params.id);
                let record = result?result.data:null;
                if (!record || record.status !== 'staged') {
                    return res.status(404).send('object unknown')
                }
                await axios.put(this.connector.profile.server+'/media/'+req.params.id+'/status/uploading');

                // Create preview START
                const {file} = req.files
                const videoPath = CACHE_DIRNAME+Math.random()+Math.random()
                const previewPath = videoPath+".jpeg"

                await file.mv(videoPath)
                const preview = await createPreview(videoPath, previewPath)
                const preview_size = Buffer.byteLength(preview)
                await this.storjService.uploadFile(req.params.id+".jpeg", preview, preview_size)
                // Create preview END

                let opts = new UplinkNodejs.UploadOptions(0);
                let upload = await this.project.uploadObject(this.bucket, record.file, opts);
                await upload.write(file.data, file.size);
                await upload.commit();
                let info = await upload.info();

                await axios.put(this.connector.profile.server+'/media/'+req.params.id+'/status/live');
                res.json({ info: info });
            } catch (e) {
                console.error(e);
                res.status(500).send();
            }
        });

        router.get('/search',async (req,res) => {
            try {
                let url = this.connector.profile.server + '/media';
                if (req.query.q && req.query.q !== '') {
                    url += '?q=' + encodeURIComponent(req.query.q);
                }
                let result = await axios.get(url);
                res.json(result.data);
            } catch (e) {
                console.error(e);
                res.status(500).send();
            }
        })

        router.get("/preview/:id", async (req, res) => {
            try {
                const stream = await this.storjService.downloadFile(req.params.id+".jpeg")
                res.writeHead(200, {
                    "Content-Type": "image/jpeg",
                    "Content-Length": stream.size,
                })

                try {
                    while(true) {
                        const buffer = await stream.download()
                        if(!buffer) break;

                        await new Promise((resolve, reject) => res.write(buffer, (error) => error ? reject(error) : resolve()))
                    }
                } catch(error) {
                    console.error("Storj download error:", error)
                }
                res.end()
            } catch(error) {
                console.error("Storj preview error:", error)
                res.status(500).send()
            }
        })
        return router;
    }
}
