import fs from 'fs';
import thumbGen from "simple-thumbnail";
import ffmpeg from "ffmpeg-static";

fs.createReadStream('/home/msprague/workspace/samizdat-media/test.mp4',{path: ffmpeg})
  .pipe(thumbGen(null, null, '250x?'))
  .pipe(fs.createWriteStream('/home/msprague/workspace/samizdat-media/thumbnail.png'))
