async function getVersion(pdf) {
}
function pdfMerge(urls, divRootId, progressBarId = undefined, renderMode = 'canvas') {

    var totalDocs = urls.length;
    var current_progress = 0;
    var current_doc = 0;

    var documentosDiv = document.querySelector('#' + divRootId);

    var dpr = window.devicePixelRatio || 1;

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
                let i = 1;
                while (i <= pdf.numPages) {
                    var pageNumber = i;
                    pdf.getPage(pageNumber).then(function (page) {

                        switch (renderMode) {
                            default:
                            case 'canvas':

                                var canvas = document.createElement("canvas");
                                documentosDiv.appendChild(canvas);
                                // Prepare canvas using PDF page dimensions
                                //var viewport = page.getViewport({scale: 1, });
                                var context = canvas.getContext('2d');

                                var rect = canvas.getBoundingClientRect();

                                // Set dimensions to Canvas
                                var resolution = 2; // for example



                                var viewport = page.getViewport({scale: 1});
                                var scale = documentosDiv.clientWidth / viewport.width;
                                //viewport = page.getViewport(scale); //fica no tam. da div

                                canvas.height = viewport.height;
                                canvas.width = viewport.width;
                                //canvas.width = documentosDiv.offsetWidth;
                                //canvas.height = documentosDiv.offsetHeight;
                                //canvas.style.width='100%';
                                //canvas.style.height='100%';
                                //canvas.width  = canvas.offsetWidth;
                                //canvas.height = canvas.offsetHeight;

                                // Render PDF page into canvas context
                                var renderContext = {
                                    canvasContext: context,
                                    viewport: viewport
                                };
                                var renderTask = page.render(renderContext);
                                renderTask.promise.then(function () {
                                    console.log('Page rendered');
                                });

                                break;

                            case 'svg':

                                var container = document.createElementNS('http://www.w3.org/2000/svg', 'svg:svg');


                                var viewport = page.getViewport({scale: 1});

                                var scale = documentosDiv.clientWidth / viewport.width;        
                                container.style.width = documentosDiv.offsetWidth;
                                container.style.height = documentosDiv.offsetHeight;
                                viewport = page.getViewport({scale: scale});    

                                documentosDiv.appendChild(container);

                                page.getOperatorList()
                                        .then(function (opList) {
                                        
                                        var svgGfx = new pdfjsLib.SVGGraphics(page.commonObjs, page.objs);
                                        return svgGfx.getSVG(opList, viewport);

                                        }).then(function (svg) {
                                            container.appendChild(svg);
                                        });

                                break;
                        }

                    });
                    i++;
                }

                current_doc++;
                current_progress = current_doc * (100 / totalDocs);
                console.log(current_doc);

                if (progressBarId !== undefined) {
                    var barElement = document.querySelector("#" + progressBarId);
                    barElement.style.width = current_progress + "%";
                    barElement.setAttribute('aria-valuenow', current_progress);
                    barElement.textContent = parseFloat(current_progress).toFixed(2) + "%";
                }
                // Fetch the first page
            }, function (reason) {
                // PDF loading error
                console.error(reason);
            });
        }
    })();
}