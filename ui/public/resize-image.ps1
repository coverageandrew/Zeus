Add-Type -AssemblyName System.Drawing

# Load original image
$img = [System.Drawing.Image]::FromFile('landing.png')

# Create new bitmap with social media dimensions (1200x630)
$bmp = New-Object System.Drawing.Bitmap(1200, 630)

# Create graphics object for high-quality resizing
$gfx = [System.Drawing.Graphics]::FromImage($bmp)
$gfx.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gfx.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality

# Draw resized image
$gfx.DrawImage($img, 0, 0, 1200, 630)

# Save as new file
$bmp.Save('landing-social.png', [System.Drawing.Imaging.ImageFormat]::Png)

# Cleanup
$gfx.Dispose()
$bmp.Dispose()
$img.Dispose()

Write-Host "Created landing-social.png (1200x630)"
