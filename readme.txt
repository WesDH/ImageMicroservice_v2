Wesley's Image Manipulation Microservice.

 ****** Usage using a standard POST request  ******

You can send a POST request to the Microservice Node server. In response, you will receive the URL of the hosted image.
Afterwards, you can append any ? query parameters to the image URL that will now be hosted on SIRV.com

See below for an example POST request:

POST route:
https://www.weshavens.info:443/uploadV2

Post body (JSON):
{
    "url" : "https://weshavens.info/CS361_image/images/flowers.jpg",
    "path" : "/FolderToUploadImageInto/",
    "file" : "RequestedFilename.jpg"
}

Where "url" is the image URL you are feeding into the microservice, the "path" is the directory you
would like to have the image hosted on, on the server (please note start and end /'s are required),
and the "file" is the filename you would like the hosted image be renamed to.

The JSON response received in this given example would then be:

{
    "url": "https://pernetyp.sirv.com/FolderToUploadImageInto/RequestedFilename.jpg"
}

Now, with this URL, you can use it directly (image hosting), or you can apply query params to the URL for further
image manipulation (image hosting AND manipulation). Example:

https://pernetyp.sirv.com/FolderToUploadImageInto/RequestedFilename.jpg?w=100

^Above code will apply width 100px and autoresize height, to the hosted image (append query ?w=100 to the response received afterwards)

Here is some "starter" Javascript code to assist clients with integrating this microservice via making
a POST request:


fetch
('https://www.weshavens.info:443/uploadV2',
    {
        headers:
            {
                'Content-type' : 'application/json'
            },
        method: 'POST',
        body : JSON.stringify(
            {
                url: 'https://weshavens.info/CS361_image/images/flowers.jpg',
                path: '/YourFolderToUploadInto/',
                file: 'YourRequestedFileName.jpg'
            }
        )
    }
)  // End of fetch arguments
    .then(response => response.json())
    .then(data => console.log(data.url));

Where above, you can now create a function rather than "console.log(data.url)", to handle inserting the received image URL as you so choose.





****** Usage of Helper JS File ******

1) Link in the helper JS file at the end of your HTML body for a webpage that would like to utilize this Microservice:
The javascript file is hosted here:
https://weshavens.info/CS361_image/wesMS_helper.js

Example usage of helper Js file:
<body>
       ...
       ...
       ...
    <script src="https://weshavens.info/CS361_image/wesMS_helper.js"></script>
</body>



2) Calling the microservice on images:

    2.a) Please have an image tag with including attribute/value of:
            service="wesMS"   (Case Sensititive!)

    3.b) The image that wishes to be modified source MUST include the full url.
            VALID: https://weshavens.info/CS361_image/images/original_url.png
            INVALID: images/original_url.png

    3.c) The end of the image url must have a query string with the manipulation parameters.
         A comprehensive demo of query parameters offered by Sirv's API can be seen here:

         https://sirv.com/demos/dynamic-imaging/

         Or, for more specific details:
         https://sirv.com/help/articles/dynamic-imaging/



Here is a simple example of an <img> tag that will call the Microservice and apply 50% scaling and
reinsert the modified image:

<img service="WesMS" src="https://weshavens.info/CS361_image/images/original_url.png?w=50%">
