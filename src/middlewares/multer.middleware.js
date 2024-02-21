import multer from "multer";

const storage = multer.diskStorage({
    destination: (re, file, callback) => {
        callback(null, "./public/temp")
    },
    filename: (req, file, callback) => {
        callback(null, file.originalname)
    }
})

const upload = multer({
    storage,
});

export default upload;