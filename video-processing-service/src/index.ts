import express from 'express';
import { downloadRawVideo, setupDirectories, uploadProcessedVideo,convertVideo,deleteProcessedVideo,deleteRawVideo } from './storage';
import { upload } from '@google-cloud/storage/build/src/resumable-upload';
setupDirectories();
const app = express();
app.use(express.json());

app.post('/process-video', async (req, res) => {
  //Get the bucket and filename from the Cloud Pub/Sub message
  let data;
  try {
    const message = Buffer.from(req.body.message.data,'base64').toString('utf8');
    data = JSON.parse(message);
    if (!data.name){
      throw new Error('Invalid message payloaf received.');
    }
  } catch (error){
    console.error(error);
    return res.status(400).send('BadRequest: missing filename.');


  }
  const inputFileName = data.name
  const outputFileName = `processed-${inputFileName}`;

  //Download the raw video from Cloud Storage
  await downloadRawVideo(inputFileName);



  //conver the video to 360p
  try {
    await convertVideo(inputFileName, outputFileName);
  }catch (err) {
    await Promise.all([
      deleteRawVideo(inputFileName),
      deleteProcessedVideo(outputFileName)
    ]);

    
    return res.status(500).send('Internal Server Error: video processing failed. ');
  }
  //upload the processed video to cloud storage
  await uploadProcessedVideo(outputFileName);
  await Promise.all([
    deleteRawVideo(inputFileName),
    deleteProcessedVideo(outputFileName)
  ]);
  return res.status(200).send('Processing finised successfully');
  
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});