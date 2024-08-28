const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: "dw5xhhocf",
    api_key:"726161837981812",
    api_secret: "WWpzbg8warvwuh8r01PNC_MBJMk",
})

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'internship',
      //resource_type: 'raw',
      allowerdFormats:["Pdf","jpg","jpeg"],
      
    },
  });

  module.exports={
    cloudinary,
    storage,
  }