async function getVersion(pdf) {
}
function pdfMerge(urls, divRootId) {
    //necessário pois para manter as promisses sincronizadas com await
    (async function loop() {
        for (url_item of urls) {
            console.log("loading: " + url_item);
            var loadingTask = pdfjsLib.getDocument(url_item);
            //sem isso fica dessincronizado
            await loadingTask.promise.then(function (pdf) {
                pdf.getMetadata().then(function (metaData) {
                    console.log("pdf (" + url_item + ") version: " + metaData.info.PDFFormatVersion); //versão do pdf
                }).catch(function (err) {
                    console.log('Error getting meta data');
                    console.log(err);
                });
                console.log("páginas: " + pdf.numPages);
                let i = 0;
                while (i < pdf.numPages) {
                    var pageNumber = i;
                    pdf.getPage(pageNumber).then(function (page) {
                        var div = document.createElement("div");
                        var documentosDiv = document.querySelector('#' + divRootId);
                        documentosDiv.appendChild(div);
                        var canvas = document.createElement("canvas");
                        div.appendChild(canvas);
                        // Prepare canvas using PDF page dimensions
                        var viewport = page.getViewport({scale: 1, });
                        var context = canvas.getContext('2d');
                        canvas.height = viewport.height;
                        canvas.width = viewport.width;
                        // Render PDF page into canvas context
                        var renderContext = {
                            canvasContext: context,
                            viewport: viewport
                        };
                        var renderTask = page.render(renderContext);
                        renderTask.promise.then(function () {
                            console.log('Page rendered');
                        });
                    });
                    i++;
                }
                // Fetch the first page
            }, function (reason) {
                // PDF loading error
                console.error(reason);
            });
        }
    })();
}