import imageCompression from 'browser-image-compression';

export const imageResize = async (file: File) => {
    if (!file) {
        return;
    }
    const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 400,
        useWebWorker: true,
    };
    try {
        const blobCompressedFile = await imageCompression(file, options);
        const compressedFile = new File([blobCompressedFile], file.name, {
            type: file.type,
            lastModified: Date.now()
        });
        return compressedFile;
    } catch (error) {
        console.log(error);
    }
};
