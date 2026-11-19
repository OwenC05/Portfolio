$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$basePath = $PSScriptRoot
if ((Split-Path -Leaf $basePath) -ne 'build-v02') { throw 'Wrong scoped directory' }
function Make-Sheet($output, $items, $sourceFolder, $width, $height) {
    $canvas = New-Object System.Drawing.Bitmap ($width * $items.Count), ($height + 48)
    $graphics = [System.Drawing.Graphics]::FromImage($canvas)
    $graphics.Clear([System.Drawing.Color]::FromArgb(46,50,56))
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $font = New-Object System.Drawing.Font 'Segoe UI', 15
    $brush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
    try {
        for ($i=0; $i -lt $items.Count; $i++) {
            $item=$items[$i]
            $sourceImage=[System.Drawing.Image]::FromFile((Join-Path $basePath "$sourceFolder/$($item.file).png"))
            try {
                $graphics.DrawImage($sourceImage, ($i*$width), 42, $width, $height)
                $graphics.DrawString($item.label,$font,$brush,($i*$width+12),10)
            } finally { $sourceImage.Dispose() }
        }
        $canvas.Save((Join-Path $basePath $output),[System.Drawing.Imaging.ImageFormat]::Png)
    } finally { $brush.Dispose(); $font.Dispose(); $graphics.Dispose(); $canvas.Dispose() }
}
Make-Sheet 'neutral-contact-sheet.png' @(
 @{file='neutral-front';label='Neutral front'},@{file='neutral-three-quarter';label='Neutral three-quarter'},
 @{file='neutral-side';label='Neutral side'},@{file='neutral-back';label='Neutral back'}
) 'renders' 320 400
Make-Sheet 'five-poses.png' @(
 @{file='pose-neutral';label='Neutral'},@{file='pose-attention';label='Attention'},
 @{file='pose-sources';label='Sources'},@{file='pose-no-match';label='No-match'},
 @{file='pose-dismissal';label='Dismissal'}
) 'renders' 320 400
'Contact sheets saved; original render pixels retained in renders and raw-renders'
