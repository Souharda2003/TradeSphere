const multer = require("multer");
const path = require("path");
const fs = require("fs");


const uploadDirectory =
    path.join(
        __dirname,
        "..",
        "uploads",
        "products"
    );


if (
    !fs.existsSync(uploadDirectory)
) {

    fs.mkdirSync(
        uploadDirectory,
        {
            recursive: true
        }
    );
}


const storage =
    multer.diskStorage({

        destination:
            (req, file, cb) => {

                cb(
                    null,
                    uploadDirectory
                );

            },


        filename:
            (req, file, cb) => {

                const extension =
                    path.extname(
                        file.originalname
                    );

                const uniqueName =
                    `product-${Date.now()}-${Math.round(
                        Math.random() * 1000000
                    )}${extension}`;

                cb(
                    null,
                    uniqueName
                );

            }

    });


const fileFilter =
    (req, file, cb) => {

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/jpg"
        ];


        if (
            allowedTypes.includes(
                file.mimetype
            )
        ) {

            cb(
                null,
                true
            );

        } else {

            cb(
                new Error(
                    "Only JPG, JPEG, PNG and WEBP images are allowed."
                ),
                false
            );
        }
    };


const upload =
    multer({

        storage,

        fileFilter,

        limits: {
            fileSize:
                5 * 1024 * 1024,

            files: 6
        }

    });


module.exports = upload;