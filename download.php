<?php

$arquivo = $_REQUEST['arquivo'];
$path = "pdfs/";

ob_clean();
header("Content-type: application/pdf");
header("Content-Disposition: inline; filename=$arquivo");
echo file_get_contents($path.$arquivo);

