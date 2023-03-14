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
    const size_w = 320
    const size_h = 320

    const ffmpeg = spawn(`"${FFMPEG_PATH}"`, [
        "-y", "-i", `"${videoPath}"`, "-frames 1", `-q:v 0`, `-vf "scale=${size_w}:${size_h}:force_original_aspect_ratio=decrease,pad=${size_w}:${size_h}:(ow-iw)/2:(oh-ih)/2,setsar=1"`, `"${previewPath}"`
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

        const calcRange = (rangeHeader, fileSize) => {
            let offset = 0
            let length = -1
            let lastByte = fileSize-1

            // There can be several ranges, separated by ","
            const rexp = rangeHeader.match(/^bytes=([0-9]{0,})-([0-9]{0,})$/)
            if(!rexp) throw new Error("Invalid range: "+String(rangeHeader))

            let start = rexp[1]
            if(start) {
                start = parseInt(start, 10)
                if(start > fileSize) start = lastByte
            }
            // let end = rexp[2] 
            // if(end) {
            //     end = parseInt(start, 10)
            //     if(start && start > end) end = start
            //     if(end > fileSize) end = lastByte
            // }

            if(start) {
                offset = start
                length = fileSize-offset
                // if(end) length = fileSize-offset-(end-start)
            } 
            // else if(end) {
            //     offset = fileSize-end
            //     length = fileSize-offset
            // }

            return [offset, length]
        }

        /**
         * This is intended to stream a file from the storj network to the browser as
         * it is being downloaded. But it doesn't work.
         */
        router.get("/get/:id", async (req, res) => {
            const rangeHeader = req.headers.range

            try {
                const fileSize = await this.storjService.getFileSize(req.params.id)

                let range = [0, fileSize]
                if(rangeHeader) range = calcRange(rangeHeader, fileSize)

                const stream = await this.storjService.downloadFile(req.params.id, 8000, ...range)
                
                let status = 206
                if(stream.offset === 0 && stream.size === fileSize) status = 200
                
                res.writeHead(status, {
                    "content-type": "video/mp4",
                    "content-length": stream.size,
                    "content-range": "bytes "+stream.offset+"-"+(stream.offset+stream.size-1)+"/"+fileSize,
                    "accept-ranges": "bytes",
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

                // Upload video
                await this.storjService.uploadFile(record.file, file.data, file.size)
                await axios.put(this.connector.profile.server+'/media/'+req.params.id+'/status/live');

                res.json({ ok: true });
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
                    "content-type": "image/jpeg",
                    "content-length": stream.size,
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
