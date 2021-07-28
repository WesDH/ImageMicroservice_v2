Wesley's Image Manipulation Microservice.



***Usage***

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
            service="WesMS"

    3.b) The image that wishes to be modified source MUST include the full url.
            VALID: https://weshavens.info/CS361_image/images/original_url.png
            INVALID: images/original_url.png

    3.c) The end of the image url must have a query string with the manipulation parameters.
         A comprehensive demo of query parameters offered by Sirv's API can be seen here:
         https://sirv.com/demos/dynamic-imaging/



Here is a simple example of an <img> tag that will call the Microservice and apply 50% scaling and
reinsert the modified image:

<img service="WesMS" src="https://weshavens.info/CS361_image/images/original_url.png?w=50%">
