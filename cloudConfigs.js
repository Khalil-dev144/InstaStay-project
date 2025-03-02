const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

//BASic Setup for the cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
   api_secret: process.env.CLOUD_API_SECRET,
});

//Store the file in the IstaStay_DEV storage.
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'InstaStay_DEV',
      allowedFormats: ["png", "jpg", "jpeg"],
    },
  });

module.exports = {
    cloudinary,
    storage,
}

