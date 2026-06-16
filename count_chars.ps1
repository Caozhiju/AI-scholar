$text = Get-Content -Path "D:\OneDrive\Desktop\LingAI Scholar\src\data\courses.phase3.ts" -Raw
$start = $text.IndexOf('llm-008')
$contentPos = $text.IndexOf('content:', $start)
$btStart = $text.IndexOf('', $contentPos + 8)
$btEnd = $text.IndexOf(',', $btStart + 2)
$content = $text.Substring($btStart + 2, $btEnd - $btStart - 2)
$cc = 0
for ($i = 0; $i -lt $content.Length; $i++) {
    $ch = $content[$i]
    if ($ch -ge 0x4E00 -and $ch -le 0x9FFF) { $cc++ }
    if ($ch -ge 0x3400 -and $ch -le 0x4DBF) { $cc++ }
}
Write-Host "Chinese chars: $cc"
Write-Host "Total length: $($content.Length)"
