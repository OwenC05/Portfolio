$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing
$basePath=Join-Path $PSScriptRoot 'viewer'
if((Split-Path -Leaf $PSScriptRoot) -ne 'build-v03'){throw 'Wrong scope'}
function Sheet($output,$files,$labels,$sourceRect,$width,$height){
 $canvas=New-Object Drawing.Bitmap ($width*$files.Count),($height+40)
 $graphics=[Drawing.Graphics]::FromImage($canvas);$graphics.Clear([Drawing.Color]::FromArgb(35,35,35));$font=New-Object Drawing.Font 'Segoe UI',12
 try {for($i=0;$i -lt $files.Count;$i++){$im=[Drawing.Image]::FromFile((Join-Path $basePath $files[$i]));try{$dest=New-Object Drawing.Rectangle ($i*$width),40,$width,$height;$graphics.DrawImage($im,$dest,$sourceRect,[Drawing.GraphicsUnit]::Pixel);$graphics.DrawString($labels[$i],$font,[Drawing.Brushes]::White,($i*$width+8),8)}finally{$im.Dispose()}};$canvas.Save((Join-Path $basePath $output),[Drawing.Imaging.ImageFormat]::Png)}finally{$graphics.Dispose();$font.Dispose();$canvas.Dispose()}
}
Sheet 'emission-comparison.png' @('eye-strength-4.png','eye-strength-1.png','eye-strength-1.25.png','eye-strength-1.5.png') @('v02: 4','Selected: 1','Test: 1.25','Test: 1.5') (New-Object Drawing.Rectangle 0,0,800,900) 320 360
Sheet 'room-pose-crops.png' @('webgl-room-neutral.png','webgl-room-attention.png','webgl-room-sources.png','webgl-room-no-match.png','webgl-room-dismissal.png') @('Neutral','Attention','Sources','No-match','Dismissal') (New-Object Drawing.Rectangle 1000,170,300,340) 300 340
'Sheets derived from retained original captures'
