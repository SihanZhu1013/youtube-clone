//1.Google cloud storage file interactions
//2.local file interactions
import {Storage} from '@google-cloud/storage';
import fs from 'fs';//import file system;
import ffmpeg from 'fluent-ffmpeg';

const storage = new Storage();
const rawVideoBucketName = "sihan-yt-raw-videos";
const processedVideoBucketName = "sihan-yt-processed-videos";

const localRawVideoPath = "./raw-videos";
const localProcessedVideoPath = "./processed-videos";

//creates the local directories for raw and processed videos.
export function setupDirectories(){
    ensureDirectoryExistence(localRawVideoPath);
    ensureDirectoryExistence(localProcessedVideoPath);

}
// @param rawVideoName - The name of the file to convert from {@link localRawVideoPath}.
// @param processedVideoName - The name of the file to conver to {@link localProcessedVideoPath}.
//@returns A promise that resolves when the video has been converted.
export function convertVideo(rawVideoName: string, processedVideoName: string){
    return new Promise<void>((resolve,reject) =>{
        // Create the ffmpeg command
        ffmpeg(`${localRawVideoPath}/${rawVideoName}`)
        .outputOptions('-vf', 'scale=-1:360') // 360p
        .on('end', function() {
            console.log('Processing finished successfully');
            resolve();            
        })
        .on('error', function(err: any) {
            console.log('An error occurred: ' + err.message);
            reject(err);
        })
        .save(`${localProcessedVideoPath}/${processedVideoName}`);
    });
}

// @param fileName - The name of the file to download from yhe {@link rawVideoBucketName} bucket into the {@link localRawVideoPath} folder.
// @returns A promise that resolves when the file has been downloaded.

export async function downloadRawVideo(fileName: string){
    await storage.bucket(rawVideoBucketName)
        .file(fileName)
        .download({ destination: `${localRawVideoPath}/${fileName}`,});//return type is a promiss, so add await means all code after this line will wait until before code excuted, which means we need add async to the function at the beginning

    console.log(
        `gs://${rawVideoBucketName}/${fileName} downloaded to ${localRawVideoPath}/${fileName}.`
    );
}

// @param fileName - The name of the file to download from yhe {@link locakProcessedVideoPath} bucket into the {@link processedVideoBucketName} folder.
// @returns A promise that resolves when the file has been uploaded.
export async function uploadProcessedVideo(fileName: string){
    const bucket = storage.bucket(processedVideoBucketName);
    await storage.bucket(processedVideoBucketName)
        .upload(`${localProcessedVideoPath}/${fileName}`, {
        destination: fileName
    });

    console.log(
        `${localProcessedVideoPath}/${fileName} uploaded to ${processedVideoBucketName}/${fileName}.`
    );    
    await bucket.file(fileName).makePublic();
}


export function deleteRawVideo(fileName: string){
    return deleteFile(`${localRawVideoPath}/${fileName}`);
}
export function deleteProcessedVideo(fileName: string){
    return deleteFile(`${localProcessedVideoPath}/${fileName}`);
}
//@param filePath - The path of the file to delete.
//@returns A promise that resolves when the file has been deleted.

function deleteFile(filePath: string): Promise<void>{
    return new Promise((resolve,reject)=>{
        if (fs.existsSync(filePath)){
            fs.unlink(filePath, (err) =>{
                if (err){
                    console.log(`Fail to delete file at ${filePath}`, err);
                    
                    reject(err);
                } else {
                    console.log(`File delete at ${filePath}`);
                    resolve();
                }
            });

        }else {
            console.log(`File not found at ${filePath}, skipping the delete.`);
            resolve();
        }
    });
}

//ensure a directory exits, creating it if necessary.
//@param {string} dirPath -The directory path to check.

function ensureDirectoryExistence(dirPath:string){
    if (!fs.existsSync(dirPath)){
        fs.mkdirSync(dirPath,{ recursive: true}); //recursive: true enables creating nested directories
        console.log(`Directory created at ${dirPath}`);
    }
}