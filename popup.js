chrome.runtime.sendMessage({ event: "Capture Screenshot" }, function (response) {
    let img = new Image();
    img.src = response.dataUrl;
    img.onload = function () {
        img.style.width = '98vw';
    };
    document.body.appendChild(img);

    var link = document.createElement("a");
    link.download = "download";
    link.href = response.dataUrl;
    var download = new Image();
    download.src = "Download.png";
    download.className = "download";
    link.appendChild(download);
    document.body.appendChild(link);

    var crop = new Image();
    crop.src = "crop.png";
    var setCropper = document.createElement("p");

    crop.className = "crop";
    setCropper.appendChild(crop);
    document.body.appendChild(setCropper);

    crop.addEventListener('click', function () {
        var cropper = new Cropper(img, {
            aspectRatio: 1.7777777777777777,
            viewMode: 3,
            crop: function (event) {
                console.log(event.detail);
                var croppedCanvas = cropper.getCroppedCanvas({ width: event.detail.width });
                var croppedImage = croppedCanvas.toDataURL("image/png");

                // Store cropped image in IndexedDB
                saveToIndexedDB(croppedImage);

                let button = document.createElement('button');
                button.innerHTML = "Save Crop";

                button.addEventListener('click', function () {
                    var downloadLink = document.createElement("a");
                    downloadLink.download = "cropped_image.png";
                    downloadLink.href = croppedImage;
                    document.body.appendChild(downloadLink);
                    downloadLink.click();
                    document.body.removeChild(downloadLink);
                });

                document.body.appendChild(button);
            },
        });

        console.log(cropper);
    });
});

function saveToIndexedDB(croppedImage) {
    var request = indexedDB.open("CroppedImagesDatabase", 1);

    request.onupgradeneeded = function (event) {
        var db = event.target.result;
        if (!db.objectStoreNames.contains("croppedImages")) {
            db.createObjectStore("croppedImages", { autoIncrement: true });
        }
    };

    request.onsuccess = function (event) {
        var db = event.target.result;
        var transaction = db.transaction(["croppedImages"], "readwrite");
        var objectStore = transaction.objectStore("croppedImages");
        var addRequest = objectStore.add(croppedImage);

        addRequest.onsuccess = function () {
            console.log("Cropped image added to IndexedDB");
        };

        addRequest.onerror = function (error) {
            console.error("Error adding cropped image to IndexedDB:", error);
        };

        transaction.oncomplete = function () {
            db.close();
        };
    };

    request.onerror = function (event) {
        console.error("Error opening IndexedDB:", event.target.error);
    };
}
