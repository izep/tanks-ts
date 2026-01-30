$ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36"

Write-Host "Downloading Grand Teton..."
Invoke-WebRequest -Uri "https://commons.wikimedia.org/wiki/Special:FilePath/Sunset_over_the_Grand_Tetons_2.JPG?width=1280" -OutFile "raw_Grand_Teton.jpg" -UserAgent $ua

Write-Host "Downloading Smoky Mtns..."
Invoke-WebRequest -Uri "https://commons.wikimedia.org/wiki/Special:FilePath/Clingmans_Dome_Observation_Tower.jpg?width=1280" -OutFile "raw_Smoky.jpg" -UserAgent $ua

Write-Host "Downloading Rainier..."
try {
    Invoke-WebRequest -Uri "https://commons.wikimedia.org/wiki/Special:FilePath/Mount_Rainier_from_Ricksecker_Point,_Washington,_U.S.jpg?width=1280" -OutFile "raw_Rainier.jpg" -UserAgent $ua
} catch {
    Write-Host "Rainier failed, trying double dot..."
    Invoke-WebRequest -Uri "https://commons.wikimedia.org/wiki/Special:FilePath/Mount_Rainier_from_Ricksecker_Point,_Washington,_U.S..jpg?width=1280" -OutFile "raw_Rainier.jpg" -UserAgent $ua
}

Write-Host "Downloading Canyonlands..."
Invoke-WebRequest -Uri "https://commons.wikimedia.org/wiki/Special:FilePath/Needles_Overlook,_Canyonlands_National_Park,_Utah_(3455933354).jpg?width=1280" -OutFile "raw_Canyonlands.jpg" -UserAgent $ua

Write-Host "Downloading Everglades..."
Invoke-WebRequest -Uri "https://commons.wikimedia.org/wiki/Special:FilePath/Everglades_Sawgrass,_September_20,_2014_(15834616155).jpg?width=1280" -OutFile "raw_Everglades.jpg" -UserAgent $ua

Write-Host "Downloading Acadia..."
Invoke-WebRequest -Uri "https://commons.wikimedia.org/wiki/Special:FilePath/Acadia_National_Park-Otter_Cliffs.jpg?width=1280" -OutFile "raw_Acadia.jpg" -UserAgent $ua
