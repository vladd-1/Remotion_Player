// worker/server.js
const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const AWS = require('aws-sdk');
const fs = require('fs-extra');
const axios = require('axios');

const app = express();
app.use(bodyParser.json({ limit: '10mb' }));

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

app.post('/render', async (req, res) => {
  // expected: { videoUrl, captions, preset, outKey }
  const { videoUrl, captions, preset, outKey } = req.body;
  if (!videoUrl || !captions) return res.status(400).json({ error: 'missing' });

  const jobId = `job-${Date.now()}`;
  const tmpDir = `/tmp/${jobId}`;
  await fs.ensureDir(tmpDir);

  try {
    // 1) download video
    const videoPath = `${tmpDir}/in.mp4`;
    const writer = fs.createWriteStream(videoPath);
    const resp = await axios.get(videoUrl, { responseType: 'stream' });
    resp.data.pipe(writer);
    await new Promise((r, rej) => writer.on('close', r));

    // 2) write captions json to file
    const propsPath = `${tmpDir}/props.json`;
    await fs.writeJSON(propsPath, { captions, videoUrl: videoPath, preset });

    // 3) render with remotion CLI (assumes remotion & node deps available in container)
    const outPath = `${tmpDir}/out.mp4`;
    // Compose command: point remotion to your remotion entry file that exports "CaptionComp"
    const cmd = `npx remotion render src/remotion/index.tsx CaptionComp ${outPath} --props '${JSON.stringify({ captions, videoUrl: videoPath, preset })}' --overwrite`;
    console.log('running', cmd);

    await new Promise((resolve, reject) => {
      const child = exec(cmd, { maxBuffer: 1024 * 1024 * 50 }, (err, stdout, stderr) => {
        console.log(stdout, stderr);
        if (err) return reject(err);
        resolve();
      });
      child.stdout.pipe(process.stdout);
      child.stderr.pipe(process.stderr);
    });

    // 4) upload out.mp4 to S3
    const fileData = await fs.readFile(outPath);
    await s3.putObject({
      Bucket: process.env.S3_BUCKET,
      Key: outKey || `renders/${Date.now()}-out.mp4`,
      Body: fileData,
      ContentType: 'video/mp4',
      ACL: 'public-read'
    }).promise();

    const publicUrl = `${process.env.NEXT_PUBLIC_S3_BASE}/${outKey}`;
    res.status(200).json({ jobId, publicUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'render failed', detail: err.message });
  } finally {
    // cleanup
    // await fs.remove(tmpDir).catch(()=>{});
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log('worker listening on', port));
