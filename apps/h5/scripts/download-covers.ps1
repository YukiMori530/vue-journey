# 首次部署或本地缺图时运行，补齐 public/covers 占位图
$base = Join-Path $PSScriptRoot "..\public\covers"
$pois = Join-Path $base "pois"
New-Item -ItemType Directory -Force -Path $base, $pois | Out-Null

$files = @{
  "beijing.jpg" = "https://picsum.photos/seed/tuhui-beijing/480/360"
  "shanghai.jpg" = "https://picsum.photos/seed/tuhui-shanghai/480/360"
  "chengdu.jpg" = "https://picsum.photos/seed/tuhui-chengdu/480/360"
  "hainan.jpg" = "https://picsum.photos/seed/tuhui-hainan/480/360"
  "yantai.jpg" = "https://picsum.photos/seed/tuhui-yantai/480/360"
  "lijiang.jpg" = "https://picsum.photos/seed/tuhui-lijiang/480/360"
  "wuzhen.jpg" = "https://picsum.photos/seed/tuhui-wuzhen/480/360"
  "default.jpg" = "https://picsum.photos/seed/tuhui-default/480/360"
  "discover-flower.jpg" = "https://picsum.photos/seed/tuhui-flower/480/360"
  "discover-stream.jpg" = "https://picsum.photos/seed/tuhui-stream/480/360"
  "discover-city.jpg" = "https://picsum.photos/seed/tuhui-city/480/360"
  "discover-food.jpg" = "https://picsum.photos/seed/tuhui-food/480/360"
  "discover-mountain.jpg" = "https://picsum.photos/seed/tuhui-mountain/480/360"
  "discover-book.jpg" = "https://picsum.photos/seed/tuhui-book/480/360"
  "discover-cafe.jpg" = "https://picsum.photos/seed/tuhui-cafe/480/360"
}

$poiFiles = @{
  "tiananmen.jpg" = "https://picsum.photos/seed/tuhui-tiananmen/480/360"
  "gugong.jpg" = "https://picsum.photos/seed/tuhui-gugong/480/360"
  "qianmen.jpg" = "https://picsum.photos/seed/tuhui-qianmen/480/360"
  "yiheyuan.jpg" = "https://picsum.photos/seed/tuhui-yiheyuan/480/360"
  "yuanmingyuan.jpg" = "https://picsum.photos/seed/tuhui-yuanmingyuan/480/360"
  "badaling.jpg" = "https://picsum.photos/seed/tuhui-badaling/480/360"
}

foreach ($entry in $files.GetEnumerator()) {
  $out = Join-Path $base $entry.Key
  if (Test-Path $out) { continue }
  Invoke-WebRequest -Uri $entry.Value -OutFile $out -UseBasicParsing -MaximumRedirection 5
  Write-Host "saved $($entry.Key)"
}

foreach ($entry in $poiFiles.GetEnumerator()) {
  $out = Join-Path $pois $entry.Key
  if (Test-Path $out) { continue }
  Invoke-WebRequest -Uri $entry.Value -OutFile $out -UseBasicParsing -MaximumRedirection 5
  Write-Host "saved pois/$($entry.Key)"
}

Write-Host "Done. Replace lijiang/wuzhen/hainan with themed photos if needed."
